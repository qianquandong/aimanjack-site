// No-JS error page for POST /v1/intake (PR02, 2026-10-19; owner decision: keep what the visitor typed). Only used when
// INTAKE_V2_ENABLED=true and the browser posted a plain form. Server-rendered, never cached or indexed, no script.
// Every value the visitor sent is HTML-escaped; only known field names are echoed back; nothing from the database is shown.
import { QUOTE_COPY } from './pages/contact.mjs';
import { QUICK_COPY } from './quick-quote.mjs';

const FT = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts'];
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const str = (v, max) => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : '').slice(0, max);
const yes = (v) => v === true || v === 'yes' || v === 'on' || v === 'true';

const TEXT = {
  en: {
    title: 'Please check your request', back: 'Back to the page',
    invalid: 'Some answers need a change. Everything else you typed is kept below.', fields: 'Please check:',
    consent_required: 'Please tick the consent box so Jack can reply to this request.',
    confirm_required: 'That was very fast. Please check your details and press the button again to confirm.',
    submission_conflict: 'This request changed while it was being sent. Please send it again.',
  },
  zh: {
    title: '请检查你的申请', back: '返回原页面',
    invalid: '有几项需要修改，其他已填的内容都保留在下面。', fields: '请检查：',
    consent_required: '请勾选同意联系的选项，Jack 才能回复这份申请。',
    confirm_required: '提交得很快。请核对内容，再点一次按钮确认。',
    submission_conflict: '提交过程中内容有变化，请再发送一次。',
  },
};

// kind 'quick' (src/quick-quote.mjs) or 'full' (/contact/quote/). reason: invalid | consent_required | confirm_required | submission_conflict.
export function renderIntakeErrorPage({ lang = 'en', kind = 'full', body = {}, errors = [], reason = 'invalid', backPath }) {
  lang = lang === 'zh' ? 'zh' : 'en';
  const t = TEXT[lang], bad = new Set(errors);
  const quick = kind === 'quick';
  const c = quick ? QUICK_COPY[lang] : QUOTE_COPY[lang];
  const label = quick
    ? { name: c.name, email: c.email, attendees: c.people, budget: c.budget, workflows: c.msg, consent_request: c.consent }
    : { ...c.f, consent_request: c.consentRequest };
  const id = (n) => `ie-${n}`;
  const inv = (n) => (bad.has(n) ? ' aria-invalid="true"' : '');
  const field = (n, inner, full) => `<div class="field${full ? ' full' : ''}"><label for="${id(n)}">${esc(label[n])}</label>${inner}</div>`;
  const input = (n, type, max, attrs = '') => `<input id="${id(n)}" name="${n}" type="${type}" maxlength="${max}" value="${esc(str(body[n], max))}"${inv(n)}${attrs}>`;
  const area = (n, max) => `<textarea id="${id(n)}" name="${n}" maxlength="${max}" rows="5"${inv(n)}>${esc(str(body[n], max))}</textarea>`;
  const select = (n) => `<select id="${id(n)}" name="${n}"${inv(n)}><option value="">${esc(c.choose)}</option>${c.opt[n]
    .map(([v, l]) => `<option value="${esc(v)}"${str(body[n], 40) === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
  const fields = quick
    ? [field('name', input('name', 'text', 100, ' required autocomplete="name"')), field('email', input('email', 'email', 254, ' required autocomplete="email"')),
      field('attendees', input('attendees', 'number', 3, ' min="1" max="500" step="1"')), field('budget', input('budget', 'text', 100)), field('workflows', area('workflows', 2000), true)]
    : [field('name', input('name', 'text', 100, ' required autocomplete="name"')), field('email', input('email', 'email', 254, ' required autocomplete="email"')),
      field('company', input('company', 'text', 120, ' required')), field('company_website', input('company_website', 'text', 200)),
      field('industry', select('industry')), field('headcount', select('headcount')), field('attendees', input('attendees', 'number', 3, ' min="1" max="500" step="1"')),
      field('format', select('format')), field('location', select('location')), field('location_city', input('location_city', 'text', 80)),
      field('workflows', area('workflows', 2000), true), field('tools', input('tools', 'text', 300), true), field('timing', select('timing')),
      field('source', select('source')), field('source_detail', input('source_detail', 'text', 120), true)];
  const hiddenNames = ['kind', 'tool', 'page', 'lang', 'form_version', ...FT.map((k) => `ft_${k}`)];
  const hidden = hiddenNames.filter((n) => str(body[n], 200)).map((n) => `<input type="hidden" name="${n}" value="${esc(str(body[n], 200))}">`).join('')
    + (reason === 'confirm_required' ? '<input type="hidden" name="confirm" value="yes">' : '');
  const newsLabel = quick ? c.news : c.consentNewsletter;
  const consent = `<fieldset><label class="check" for="${id('consent_request')}"><input id="${id('consent_request')}" name="consent_request" type="checkbox" value="yes" required${yes(body.consent_request) ? ' checked' : ''}${inv('consent_request')}><span>${esc(label.consent_request)}</span></label>
<label class="check" for="${id('consent_newsletter')}"><input id="${id('consent_newsletter')}" name="consent_newsletter" type="checkbox" value="yes"${yes(body.consent_newsletter) ? ' checked' : ''}><span>${esc(newsLabel)}</span></label></fieldset>`;
  const known = [...bad].filter((n) => label[n]);
  const summary = reason === 'invalid' && known.length
    ? `<p>${esc(t.fields)}</p><ul>${known.map((n) => `<li><a href="#${id(n)}">${esc(label[n])}</a></li>`).join('')}</ul>` : '';
  const back = typeof backPath === 'string' && /^\/(zh\/)?([a-z0-9-]+\/)*$/.test(backPath) ? backPath : (lang === 'zh' ? '/zh/contact/quote/' : '/contact/quote/');
  return `<!doctype html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>${esc(t.title)} | AI Man Jack</title><link rel="stylesheet" href="/style.css"></head>
<body><main class="sec"><div class="wrap" style="max-width:760px">
<h1 style="font-size:clamp(28px,3vw,40px)">${esc(t.title)}</h1>
<div class="qf-note" role="alert" data-show tabindex="-1"><p>${esc(t[reason] ?? t.invalid)}</p>${summary}</div>
<form class="qf" action="/v1/intake" method="post" accept-charset="utf-8">${hidden}
${fields.join('\n')}
${consent}
<button class="btn btn-primary" type="submit">${esc(c.submit)}</button>
</form>
<p><a href="${back}">${esc(t.back)}</a></p>
</div></main></body></html>`;
}
