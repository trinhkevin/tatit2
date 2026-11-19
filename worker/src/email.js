// Builds the booking request email. Table layout and inline styles, because mail
// clients ignore most stylesheets. Colours and type follow src/main.css.

const PAGE = '#e0e0e0';
const BLACK = '#010101';
const WHITE = '#f1f1f1';
const LINE = '#a3a3a3';
const MUTED = '#444444';
const FONT = "'Switzer','Helvetica Neue',Helvetica,Arial,sans-serif";
const LABEL = `font-family:${FONT};font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${MUTED};`;

export function esc(s) {
	return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function fact(label, valueHtml) {
	return `<td class="fact ln" width="50%" valign="top" style="padding:16px 12px 16px 0;border-top:1px solid ${LINE};">
<div class="mut" style="${LABEL}padding-bottom:6px;">${esc(label)}</div>
<div class="ink" style="font-family:${FONT};font-size:20px;line-height:26px;font-weight:500;letter-spacing:-0.02em;color:${BLACK};word-break:break-word;overflow-wrap:anywhere;">${valueHtml}</div>
</td>`;
}

function factRows(facts) {
	const out = [];
	for (let i = 0; i < facts.length; i += 2) out.push(`<tr>${facts[i]}${facts[i + 1] || '<td class="fact ln" width="50%" style="border-top:1px solid ' + LINE + ';">&nbsp;</td>'}</tr>`);
	return out.join('\n');
}

function block(label, bodyHtml) {
	return `<tr><td class="pad" style="padding:0 32px;"><div class="ln" style="border-top:1px solid ${LINE};padding:20px 0 24px;">
<div class="mut" style="${LABEL}padding-bottom:8px;">${esc(label)}</div>
<div class="ink" style="font-family:${FONT};font-size:17px;line-height:26px;color:${BLACK};word-break:break-word;overflow-wrap:anywhere;">${bodyHtml}</div>
</div></td></tr>`;
}

function link(href, text) {
	return `<a class="ink" href="${esc(href)}" style="color:${BLACK};text-decoration:underline;">${esc(text)}</a>`;
}

function multiline(s) {
	return esc(s).replace(/(\r?\n){3,}/g, '\n\n').replace(/\r?\n/g, '<br>');
}

function photo(label, src) {
	return `<tr><td style="padding:0 0 24px;">
<div class="mut" style="${LABEL}padding-bottom:8px;">${esc(label)}</div>
<img src="${esc(src)}" alt="${esc(label)}" width="536" style="display:block;width:100%;max-width:536px;height:auto;border:0;background:#bdbdbd;">
</td></tr>`;
}

function shell(o) {
	return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(o.subject)}</title>
<style>
@font-face{font-family:'Switzer';font-weight:400;src:url('${o.siteUrl}/src/fonts/Switzer-Regular.woff2') format('woff2');}
@font-face{font-family:'Switzer';font-weight:700;src:url('${o.siteUrl}/src/fonts/Switzer-Bold.woff2') format('woff2');}
@media (max-width:520px){
.pad{padding-left:20px!important;padding-right:20px!important;}
.h1{font-size:40px!important;line-height:38px!important;}
.mark{font-size:56px!important;line-height:50px!important;}
.col{display:block!important;width:100%!important;padding-right:0!important;}
}
@media (prefers-color-scheme:dark){
.bg{background:#121212!important;}
.ink{color:#f1f1f1!important;}
.mut{color:#b3b3b3!important;}
.ln{border-color:#4a4a4a!important;}
.btn{background:#f1f1f1!important;}
.btn-a{color:#010101!important;}
}
[data-ogsc] .ink{color:#f1f1f1!important;}
[data-ogsc] .mut{color:#b3b3b3!important;}
[data-ogsc] .btn-a{color:#010101!important;}
[data-ogsb] .bg{background:#121212!important;}
[data-ogsb] .btn{background:#f1f1f1!important;}
</style></head>
<body class="bg" style="margin:0;padding:0;background:${PAGE};">
<div style="display:none;max-height:0;overflow:hidden;">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${PAGE};"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="bg" style="width:100%;max-width:600px;table-layout:fixed;background:${PAGE};">

<tr><td class="pad" style="padding:18px 32px;background:${BLACK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;letter-spacing:-0.02em;text-transform:uppercase;"><a href="${o.siteUrl}" style="color:${WHITE};text-decoration:none;">tat.it.too</a></td>
<td align="right" style="font-family:${FONT};font-size:12px;line-height:20px;letter-spacing:0.04em;text-transform:uppercase;color:${WHITE};">${esc(o.barRight)}</td>
</tr></table></td></tr>

<tr><td class="pad" style="padding:40px 32px 32px;">
<div class="ink" style="${LABEL}color:${BLACK};padding-bottom:14px;">${esc(o.label)}</div>
<div class="h1 ink" style="font-family:${FONT};font-size:52px;line-height:50px;font-weight:700;letter-spacing:-0.04em;text-transform:uppercase;color:${BLACK};word-break:break-word;overflow-wrap:anywhere;">${esc(o.headline)}</div>
</td></tr>
${o.hero || ''}

${o.inner}

${o.bigFooter || `<tr><td class="pad" style="padding:20px 32px;background:${BLACK};font-family:${FONT};font-size:13px;line-height:20px;color:${WHITE};">
${o.footer}
</td></tr>`}

</table></td></tr></table>
</body></html>`;
}

/**
 * @param {object} b booking: name, email, phone, day, location, city, type, description, size, color, flashDesign, flashUrl, notes
 * @param {{label:string, cid:string}[]} photos inline photos, shown in order
 */
function whereOf(b) {
	return b.location === 'Guest spot' && b.city ? `Guest spot · ${b.city}` : b.location;
}

function step(n, title, body) {
	return `<tr><td class="pad" style="padding:0 32px;"><div class="ln" style="border-top:1px solid ${LINE};padding:18px 0 20px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="ink" width="64" valign="top" style="font-family:${FONT};font-size:30px;line-height:30px;font-weight:700;letter-spacing:-0.04em;color:${BLACK};">${n}</td>
<td valign="top">
<div class="ink" style="font-family:${FONT};font-size:17px;line-height:24px;font-weight:700;letter-spacing:-0.01em;text-transform:uppercase;color:${BLACK};">${esc(title)}</div>
<div class="ink" style="font-family:${FONT};font-size:16px;line-height:24px;color:${BLACK};padding-top:4px;">${esc(body)}</div>
</td></tr></table></div></td></tr>`;
}

function heading(text) {
	return `<tr><td class="pad" style="padding:36px 32px 14px;"><div class="ink" style="font-family:${FONT};font-size:26px;line-height:28px;font-weight:700;letter-spacing:-0.04em;text-transform:uppercase;color:${BLACK};">${esc(text)}</div></td></tr>`;
}

/** The "we got your request" email sent to the customer. None of their photos, to keep it small. */
export function buildConfirmation(b, siteUrl) {
	const where = whereOf(b);
	const first = b.name.trim().split(/\s+/)[0];
	const subject = 'Your tattoo request is in';
	const facts = factRows([
		fact('Tattoo type', esc(b.type)),
		b.size && fact('Size', esc(b.size) + ' in'),
		b.color && fact('Color', esc(b.color)),
		b.day && fact('Preferred day', esc(b.day)),
		where && fact('Location', esc(where)),
		b.flashDesign && fact('Flash design', esc(b.flashDesign)),
	].filter(Boolean));
	const navLink = (href, text) => `<a href="${href}" style="color:${WHITE};text-decoration:underline;">${text}</a>`;

	const html = shell({
		subject,
		siteUrl,
		preheader: "Thanks for your booking request. I'll get back to you as soon as possible.",
		barRight: 'Request received',
		label: 'Your request is in',
		headline: `Thank you, ${first}`,
		inner: `<tr><td class="pad" style="padding:0 32px;"><div class="ink" style="font-family:${FONT};font-size:22px;line-height:30px;letter-spacing:-0.02em;color:${BLACK};">Thanks for your booking request. I'll get back to you as soon as possible. Thank you for your patience &#128420;</div></td></tr>

${heading('What happens next')}
${step('01', 'I read your request', 'Your idea, photos and size are with me now.')}
${step('02', 'We settle the details', "I'll reply by email so we can settle the design, date and time.")}
${step('03', 'Your spot is confirmed', 'A $200 deposit holds your appointment and comes off the final price of the tattoo.')}

${heading('What you sent')}
<tr><td class="pad" style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
${facts}
</table></td></tr>
${b.description ? block('Description', multiline(b.description)) : ''}
${b.notes ? block('Notes', multiline(b.notes)) : ''}
${block('Questions', 'Just reply to this email.')}

<tr><td class="pad" style="padding:4px 32px 40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="btn" style="background:${BLACK};"><a class="btn-a" href="https://www.instagram.com/tat.it.too/" style="display:block;padding:18px 20px;font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;color:${WHITE};text-decoration:none;">See recent work on Instagram &nbsp;&#8599;</a></td>
</tr></table></td></tr>`,
		bigFooter: `<tr><td class="pad" style="padding:44px 32px 36px;background:${BLACK};">
<div class="mark" style="font-family:${FONT};font-size:88px;line-height:76px;font-weight:700;letter-spacing:-0.06em;text-transform:uppercase;color:${WHITE};"><a href="${siteUrl}" style="color:${WHITE};text-decoration:none;">tat.it.too</a></div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px;"><tr>
<td class="col" width="50%" valign="top" style="padding:0 12px 20px 0;font-family:${FONT};font-size:14px;line-height:22px;color:${WHITE};">
<div style="font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#b3b3b3;padding-bottom:6px;">Studio</div>
Sappe Sin Studio<br>1134 W Diversey Pkwy<br>Chicago, IL 60614</td>
<td class="col" width="50%" valign="top" style="padding:0 0 20px;font-family:${FONT};font-size:14px;line-height:22px;color:${WHITE};">
<div style="font-size:12px;line-height:16px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:#b3b3b3;padding-bottom:6px;">Discover</div>
${navLink(siteUrl + '/flash.html', 'Flash')}<br>${navLink(siteUrl + '/aftercare.html', 'Aftercare')}<br>${navLink(siteUrl + '/#faq', 'FAQ')}</td>
</tr></table>
<div style="border-top:1px solid #4a4a4a;margin-top:12px;padding-top:16px;font-family:${FONT};font-size:12px;line-height:18px;color:#b3b3b3;">You are receiving this because you sent a booking request at tatit2.com. If that wasn't you, you can ignore this email.</div>
</td></tr>`,
	});
	const text = [
		`Thank you, ${first}.`,
		'',
		"Thanks for your booking request. I'll get back to you as soon as possible. Thank you for your patience.",
		'',
		'What happens next:',
		'1. I read your request. Your idea, photos and size are with me now.',
		"2. We settle the details. I'll reply by email so we can settle the design, date and time.",
		'3. Your spot is confirmed. A $200 deposit holds your appointment and comes off the final price of the tattoo.',
		'',
		'What you sent:',
		`Tattoo type: ${b.type}`,
		!!b.size && `Size: ${b.size} in`,
		!!b.color && `Color: ${b.color}`,
		!!b.day && `Preferred day: ${b.day}`,
		!!where && `Location: ${where}`,
		!!b.flashDesign && `Flash design: ${b.flashDesign}`,
		!!b.description && `Description: ${b.description}`,
		!!b.notes && `Notes: ${b.notes}`,
		'',
		'Questions? Just reply to this email.',
		'',
		'tat.it.too | Sappe Sin Studio, 1134 W Diversey Pkwy, Chicago, IL 60614 | https://www.tatit2.com',
	].filter((l) => typeof l === 'string').join('\n');
	return { subject, html, text };
}

export function buildEmail(b, photos, siteUrl) {
	const where = whereOf(b);
	const subject = `[Booking Request] ${b.name}${where ? ' · ' + where : ''}`;

	const facts = factRows([
		b.size && fact('Size', esc(b.size) + ' in'),
		b.color && fact('Color', esc(b.color)),
		b.day && fact('Preferred day', esc(b.day)),
		where && fact('Location', esc(where)),
		b.flashDesign && fact('Flash design', b.flashUrl ? link(b.flashUrl, b.flashDesign) : esc(b.flashDesign)),
	].filter(Boolean));

	const contact = [link('mailto:' + b.email, b.email), b.phone && link('tel:' + b.phone.replace(/[^0-9+]/g, ''), b.phone)].filter(Boolean).join('<br>');

	const pics = [
		b.flashUrl && photo('Flash design', b.flashUrl),
		...photos.map((p) => photo(p.label, 'cid:' + p.cid)),
	].filter(Boolean).join('\n');

	const first = b.name.trim().split(/\s+/)[0];
	const replyHref = `mailto:${b.email}?subject=${encodeURIComponent('Your tattoo request')}`;

	const html = shell({
		subject,
		siteUrl,
		preheader: `${b.type}${b.size ? ', ' + b.size + ' in' : ''}${where ? ' · ' + where : ''}`,
		barRight: 'Booking request',
		label: b.type,
		headline: b.name,
		inner: `${facts ? `<tr><td class="pad" style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
${facts}
</table></td></tr>` : ''}

${b.description ? block('Description', multiline(b.description)) : ''}
${b.notes ? block('Notes', multiline(b.notes)) : ''}
${block('Contact', contact)}

<tr><td class="pad" style="padding:0 32px 36px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td class="btn" style="background:${BLACK};"><a class="btn-a" href="${esc(replyHref)}" style="display:block;padding:18px 20px;font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;letter-spacing:0.02em;text-transform:uppercase;color:${WHITE};text-decoration:none;">Reply to ${esc(first)} &nbsp;&#8599;</a></td>
</tr></table></td></tr>

${pics ? `<tr><td class="pad" style="padding:0 32px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${pics}
</table></td></tr>` : ''}`,
		footer: `Sent from the booking form at <a href="${siteUrl}/book.html" style="color:${WHITE};text-decoration:underline;">tatit2.com</a>. Replying to this email answers ${esc(first)} directly.`,
	});

	const text = [
		`Booking request: ${b.type}`,
		'',
		`Name: ${b.name}`,
		`Email: ${b.email}`,
		!!b.phone && `Phone: ${b.phone}`,
		!!b.day && `Preferred day: ${b.day}`,
		!!where && `Location: ${where}`,
		!!b.flashDesign && `Flash design: ${b.flashDesign}${b.flashUrl ? ' (' + b.flashUrl + ')' : ''}`,
		!!b.size && `Size: ${b.size} in`,
		!!b.color && `Color: ${b.color}`,
		!!b.description && `Description: ${b.description}`,
		!!b.notes && `Notes: ${b.notes}`,
		'',
		photos.length ? `${photos.length} photo(s) attached.` : '',
		`Reply to this email to answer ${first}.`,
	].filter((l) => typeof l === 'string').join('\n');

	return { subject, html, text };
}
