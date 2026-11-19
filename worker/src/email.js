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
	for (let i = 0; i < facts.length; i += 2) out.push(`<tr>${facts[i]}${facts[i + 1] || '<td class="fact ln" width="50%" style=""border-top:1px solid ' + LINE + ';">&nbsp;</td>'}</tr>`);
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

/**
 * @param {object} b booking: name, email, phone, day, location, city, type, description, size, color, flashDesign, flashUrl, notes
 * @param {{label:string, cid:string}[]} photos inline photos, shown in order
 */
export function buildEmail(b, photos, siteUrl) {
	const where = b.location === 'Guest spot' && b.city ? `Guest spot · ${b.city}` : b.location;
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

	const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${esc(subject)}</title>
<style>
@font-face{font-family:'Switzer';font-weight:400;src:url('${siteUrl}/src/fonts/Switzer-Regular.woff2') format('woff2');}
@font-face{font-family:'Switzer';font-weight:700;src:url('${siteUrl}/src/fonts/Switzer-Bold.woff2') format('woff2');}
@media (max-width:520px){
.pad{padding-left:20px!important;padding-right:20px!important;}
.h1{font-size:40px!important;line-height:38px!important;}
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
<div style="display:none;max-height:0;overflow:hidden;">${esc(b.type)}${b.size ? ', ' + esc(b.size) + ' in' : ''}${where ? ' · ' + esc(where) : ''}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bg" style="background:${PAGE};"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="bg" style="width:100%;max-width:600px;table-layout:fixed;background:${PAGE};">

<tr><td class="pad" style="padding:18px 32px;background:${BLACK};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td style="font-family:${FONT};font-size:15px;line-height:20px;font-weight:700;letter-spacing:-0.02em;text-transform:uppercase;"><a href="${siteUrl}" style="color:${WHITE};text-decoration:none;">tat.it.too</a></td>
<td align="right" style="font-family:${FONT};font-size:12px;line-height:20px;letter-spacing:0.04em;text-transform:uppercase;color:${WHITE};">Booking request</td>
</tr></table></td></tr>

<tr><td class="pad" style="padding:40px 32px 32px;">
<div class="ink" style="${LABEL}color:${BLACK};padding-bottom:14px;">${esc(b.type)}</div>
<div class="h1 ink" style="font-family:${FONT};font-size:52px;line-height:50px;font-weight:700;letter-spacing:-0.04em;text-transform:uppercase;color:${BLACK};word-break:break-word;overflow-wrap:anywhere;">${esc(b.name)}</div>
</td></tr>

${facts ? `<tr><td class="pad" style="padding:0 32px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;">
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
</table></td></tr>` : ''}

<tr><td class="pad" style="padding:20px 32px;background:${BLACK};font-family:${FONT};font-size:13px;line-height:20px;color:${WHITE};">
Sent from the booking form at <a href="${siteUrl}/book.html" style="color:${WHITE};text-decoration:underline;">tatit2.com</a>. Replying to this email answers ${esc(first)} directly.
</td></tr>

</table></td></tr></table>
</body></html>`;

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
