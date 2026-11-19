// Booking form endpoint for tatit2.com. Receives the multipart form post from
// book.html, emails the request through Resend, then redirects to the thank-you page.

import { Buffer } from 'node:buffer';
import { buildEmail, esc } from './email.js';

const MAX_BODY = 20 * 1024 * 1024; // whole request
// Photos combined. Encoding for email adds a third, and Gmail refuses messages over 25MB,
// so 15MB of photos is the most that reliably arrives.
const MAX_FILES = 15 * 1024 * 1024;
const TYPES = ['Fine Line', 'Animal Portrait', 'Flash'];
const LOCATIONS = ['Chicago', 'Guest spot'];
const PHOTO_FIELDS = [
	['pet_photo', 'Pet photo'],
	['photo_references', 'Photo reference'],
	['placement_photo', 'Body placement'],
];
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const FLASH_RE = /^flash-[0-9]+$/;

function page(siteUrl, status, title, message) {
	const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | tat.it.too</title>
<style>
@font-face{font-family:'Switzer';font-weight:400;src:url('${siteUrl}/src/fonts/Switzer-Regular.woff2') format('woff2');}
@font-face{font-family:'Switzer';font-weight:700;src:url('${siteUrl}/src/fonts/Switzer-Bold.woff2') format('woff2');}
body{margin:0;min-height:100vh;background:#e0e0e0;color:#010101;font-family:'Switzer',system-ui,-apple-system,'Helvetica Neue',Arial,sans-serif;}
header{padding:20px 28px;border-bottom:1px solid rgba(1,1,1,.25);font-size:.9rem;font-weight:700;letter-spacing:-.02em;text-transform:uppercase;}
main{padding:0 28px 56px;max-width:44rem;}
h1{margin:5rem 0 2.5rem;font-size:clamp(2.75rem,7vw,7rem);font-weight:700;letter-spacing:-.05em;line-height:.8;text-transform:uppercase;}
p{font-size:1rem;line-height:1.3;}
a{color:inherit;}
.btn{display:inline-block;margin:1.5rem 1rem 0 0;padding:18px 16px;background:#010101;color:#f1f1f1;font-size:.85rem;font-weight:500;text-transform:uppercase;text-decoration:none;border:0;cursor:pointer;font-family:inherit;}
@media (max-width:767px){header,main{padding-left:16px;padding-right:16px;}}
</style></head><body><header><a href="${siteUrl}" style="text-decoration:none">tat.it.too</a></header>
<main><h1>${esc(title)}</h1><p>${esc(message)}</p>
<p>Your answers are still on the previous page. If it keeps failing, send a message on <a href="https://www.instagram.com/tat.it.too/">Instagram</a> instead.</p>
<button class="btn" onclick="history.back()">Back to the form</button></main></body></html>`;
	return new Response(html, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

function field(form, name, max = 200) {
	const v = form.get(name);
	return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

function line(form, name, max) {
	return field(form, name, max).replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, ' ').trim();
}

function safeName(name, fallback) {
	const clean = String(name || '').replace(/[^A-Za-z0-9._-]+/g, '-').replace(/^[-.]+/, '').slice(-80);
	return clean || fallback;
}

async function recaptchaOk(env, token, ip) {
	if (!env.RECAPTCHA_SECRET) return true;
	if (!token) return false;
	const body = new URLSearchParams({ secret: env.RECAPTCHA_SECRET, response: token });
	if (ip) body.set('remoteip', ip);
	const r = await fetch('https://www.google.com/recaptcha/api/siteverify', { method: 'POST', body });
	const data = await r.json().catch(() => ({}));
	return data.success === true;
}

export default {
	async fetch(request, env) {
		const siteUrl = (env.SITE_URL || 'https://www.tatit2.com').replace(/\/$/, '');
		const thanks = Response.redirect(siteUrl + '/thank_you.html', 303);

		if (request.method !== 'POST') return Response.redirect(siteUrl + '/book.html', 302);

		const origin = request.headers.get('origin');
		const allowed = (env.ALLOWED_ORIGINS || siteUrl).split(',').map((s) => s.trim());
		if (!origin || !allowed.includes(origin)) return page(siteUrl, 403, 'Not sent', 'This form can only be sent from tatit2.com.');

		if (Number(request.headers.get('content-length') || 0) > MAX_BODY) {
			return page(siteUrl, 413, 'Photos too large', 'Together the photos are over 15 MB. Please pick smaller ones and send again.');
		}

		let form;
		try { form = await request.formData(); } catch (e) {
			return page(siteUrl, 400, 'Not sent', 'The form could not be read. Please go back and try again.');
		}

		// Bots fill the hidden field. Answer as if it worked.
		if (field(form, '_honey')) return thanks;

		const b = {
			name: line(form, 'full_name', 120),
			email: line(form, 'email', 200),
			phone: line(form, 'phone_number', 40),
			day: line(form, 'date_preference', 20),
			location: line(form, 'location', 20),
			city: line(form, 'guest_city', 80),
			type: line(form, 'tattoo_type', 30),
			description: field(form, 'description', 4000),
			size: line(form, 'size', 10),
			color: line(form, 'color', 20),
			flashDesign: line(form, 'flash_design', 30),
			notes: field(form, 'notes', 4000),
			flashUrl: '',
		};
		if (!b.name || !EMAIL_RE.test(b.email) || !TYPES.includes(b.type) || (b.location && !LOCATIONS.includes(b.location))) {
			return page(siteUrl, 400, 'Not sent', 'Some required answers are missing or the email address looks wrong. Please go back and check the form.');
		}
		if (b.type === 'Flash' && FLASH_RE.test(b.flashDesign)) b.flashUrl = `${siteUrl}/images/flash/${b.flashDesign}.webp`;
		else b.flashDesign = '';

		if (!(await recaptchaOk(env, field(form, 'g-recaptcha-response', 4000), request.headers.get('cf-connecting-ip')))) {
			return page(siteUrl, 400, 'Not sent', 'The spam check did not pass. Please go back and send the form again.');
		}

		const attachments = [];
		const photos = [];
		let total = 0;
		for (const [name, label] of PHOTO_FIELDS) {
			const files = form.getAll(name).filter((f) => typeof f !== 'string' && f.size > 0);
			for (const [i, f] of files.entries()) {
				if (!/^image\//.test(f.type) && !/\.(jpe?g|png|heic|heif|webp)$/i.test(f.name || '')) return page(siteUrl, 400, 'Not sent', 'Only image files can be attached. Please go back and choose photos.');
				total += f.size;
				if (total > MAX_FILES) return page(siteUrl, 413, 'Photos too large', 'Together the photos are over 15 MB. Please pick smaller ones and send again.');
				const cid = `${name}-${i}`;
				attachments.push({
					filename: safeName(f.name, `${name}.jpg`),
					content: Buffer.from(await f.arrayBuffer()).toString('base64'),
					content_type: f.type || 'application/octet-stream',
					content_id: cid,
				});
				photos.push({ label: files.length > 1 ? `${label} ${i + 1}` : label, cid });
			}
		}

		const { subject, html, text } = buildEmail(b, photos, siteUrl);

		if (!env.RESEND_API_KEY || !env.TO_EMAIL) {
			console.error('booking: RESEND_API_KEY or TO_EMAIL is not set');
			return page(siteUrl, 500, 'Not sent', 'The booking form is not fully set up yet.');
		}

		let res;
		try {
			res = await fetch(env.RESEND_API_URL || 'https://api.resend.com/emails', {
				method: 'POST',
				headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
				body: JSON.stringify({
					from: env.FROM_EMAIL,
					to: env.TO_EMAIL.split(',').map((s) => s.trim()),
					reply_to: b.email,
					subject,
					html,
					text,
					attachments,
				}),
			});
		} catch (e) {
			console.error('booking: Resend unreachable', e);
			return page(siteUrl, 502, 'Not sent', 'Something went wrong while sending your request. Please go back and try again in a minute.');
		}
		if (!res.ok) {
			console.error('booking: Resend rejected the email', res.status, await res.text());
			return page(siteUrl, 502, 'Not sent', 'Something went wrong while sending your request. Please go back and try again in a minute.');
		}
		console.log('booking: sent', JSON.stringify({ type: b.type, location: b.location, photos: photos.length, bytes: total }));
		return thanks;
	},
};
