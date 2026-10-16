import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY, BOOK_URL, QUOTE_URL, INTAKE_FORM_VERSION } from '../config.mjs';
import { pageHero, breadcrumb, BUSINESS_REF, L, T } from '../components.mjs';

const copy = {
  en: {
    title: 'Contact AI Man Jack, Dallas | Book, Email or Text',
    description: 'Three ways to reach Jack about AI training for your team: book a 20-minute call, email jack@aimanjack.com, or text TRAINING to (469) 425-4142. Teams can also request a written training quote.',
    crumb: 'Contact', h1: 'Talk with Jack about your team.',
    sub: `Pick whichever is fastest for you. Planning training for a team? <a href="${QUOTE_URL}" data-event="quote_cta_click" data-pos="contact">Request a quote</a>.`,
    cards: [
      ['Book a 20-minute call', 'Pick a time. Jack calls you, asks what your team does every week, then follows up by email with a recommended format and a written quote.', 'Book a call', BOOK_URL, 'booking_start', true],
      ['Email Jack', 'Best for describing your team, its size, the tools you have approved and what you want people to be able to do. Replies come from Jack, not a queue.', 'Email ' + EMAIL, `mailto:${EMAIL}?subject=AI%20training%20for%20our%20team`, 'email_training_click', false],
      ['Text Jack', 'Send TRAINING and your company name. Jack reads each message personally and replies.', 'Text ' + SMS_DISPLAY, `sms:${SMS_TEL}?body=TRAINING%20-%20`, 'sms_training_click', false],
    ],
    nextH: 'What happens next', next: ['Jack reviews each request personally and replies to you directly.', 'A 20-minute call about your team, the tasks people repeat, and the tools you have approved.', 'A recommended format and a written quote by email; if you proceed, the scope is written down.'],
    idH: 'Business identity', id: [['Company', 'AI Man Jack LLC'], ['Location', 'Dallas, Texas'], ['Service area', 'Dallas–Fort Worth onsite; remote anywhere'], ['Languages', 'English, Chinese'], ['Email', EMAIL], ['Phone / SMS', SMS_DISPLAY]],
  },
  zh: {
    title: '联系 AI Man Jack | 预约、邮件或短信',
    description: '就团队 AI 培训联系 Jack 的三种方式：预约 20 分钟通话、发送邮件至 jack@aimanjack.com，或发送 TRAINING 至 (469) 425-4142。团队培训也可以在线申请报价。',
    crumb: '联系', h1: '与 Jack 沟通你的团队需求。',
    sub: `选择最方便的方式即可。为团队规划培训？可以<a href="/zh${QUOTE_URL}" data-event="quote_cta_click" data-pos="contact">在线申请报价</a>。`,
    cards: [
      ['预约 20 分钟通话', '选择一个时间，Jack 会致电给你，了解团队每周的工作，之后通过邮件发送推荐的培训形式与书面报价。', '预约通话', BOOK_URL, 'booking_start', true],
      ['发送邮件', '适合说明团队规模、已获批准的工具，以及希望员工掌握的能力。邮件由 Jack 本人回复。', '发送邮件至 ' + EMAIL, `mailto:${EMAIL}?subject=${encodeURIComponent('团队 AI 培训')}`, 'email_training_click', false],
      ['发送短信', '发送 TRAINING 并附上公司名称。Jack 会亲自阅读每条消息并回复。', '发送短信至 ' + SMS_DISPLAY, `sms:${SMS_TEL}?body=TRAINING%20-%20`, 'sms_training_click', false],
    ],
    nextH: '后续流程', next: ['Jack 会亲自查看每一份需求，并直接回复你。', '进行一次 20 分钟通话，了解团队情况、重复性任务以及已获批准的工具。', '通过邮件提供推荐的培训形式与书面报价；如决定合作，服务范围将以书面形式确认。'],
    idH: '公司信息', id: [['公司', 'AI Man Jack LLC'], ['所在地', '德州达拉斯'], ['服务范围', '达拉斯—沃斯堡地区上门授课；其他地区远程授课'], ['授课语言', '英语、中文'], ['邮箱', EMAIL], ['电话／短信', SMS_DISPLAY]],
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/contact/']]);
  return {
    title: c.title, description: c.description,
    body: `${pageHero(lang, { crumbs: bc.html, eyebrow: T[lang].footer.contact, h1: c.h1, sub: c.sub, ctas: false })}
<section class="sec tight"><div class="wrap"><div class="g3">${c.cards.map(([h, p, label, href, ev, primary]) => `<div class="card" style="padding:32px;display:flex;flex-direction:column;gap:14px"><h2 class="h3">${h}</h2><p style="flex-grow:1">${p}</p><a class="btn ${primary ? 'btn-primary' : 'btn-secondary'}" href="${href.startsWith('/') ? L(lang, href) : href}"${primary ? ' id="hero-cta"' : ''} data-event="${ev}" data-pos="contact">${label}</a></div>`).join('')}</div></div></section>
<section class="sec tight"><div class="wrap g2" style="gap:24px"><div class="big-card oakc"><h2>${c.nextH}</h2><ol style="margin-left:22px;display:flex;flex-direction:column;gap:10px">${c.next.map((n) => `<li>${n}</li>`).join('')}</ol></div>
<div class="big-card"><h2>${c.idH}</h2><dl class="kv">${c.id.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>`,
    jsonld: [{ '@type': 'ContactPage', '@id': `${SITE}${L(lang, '/contact/')}`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

// ── /contact/quote/ — quote-intake form (Revenue OS v6, W-002) ──────────────────────────────────────────────────────
// Progressive enhancement: a plain POST to /v1/intake works without JS (server answers 303 → #received / #not-sent, shown via
// :target); with JS the inline script posts JSON and shows the receipt in place. Two separate consents: the request consent is
// required; the newsletter consent is optional and never pre-checked. Honeypot `company_url` (same pattern as the coupon form)
// + `fill_ms` minimum-fill-time check (measured in the browser, so client clock skew does not matter; absent without JS). Hidden ft_* fields carry first-touch attribution from sessionStorage (see layout.mjs).
// The receipt never says a meeting is booked and never promises a response time. Option values must match INTAKE_ENUMS in
// functions/v1/[[route]].js (tests/intake-api.test.mjs submits every option rendered here).
const Q = {
  en: {
    title: 'Request an AI Training Quote for Your Team | AI Man Jack',
    description: 'Tell us about your team, the work you want AI to help with and the format you are considering. We use it to prepare a written scope and quote for AI training.',
    crumb: 'Request a quote', eyebrow: 'Training quote', h1: 'Request a training quote',
    sub: 'For a 90-minute team workshop, a full-day onsite day in Texas, or the four-session program. The more we know about the work, the more useful the quote. This is AI training, not a custom ERP or CRM build.',
    choose: 'Choose one', required: 'required',
    f: {
      name: 'Your name', email: 'Work email', company: 'Company', company_website: 'Company website (optional)', industry: 'Industry', headcount: 'Company size',
      attendees: 'How many people would attend?', format: 'Preferred format', location: 'Where should the training happen?', location_city: 'If another Texas city, which one?',
      workflows: 'Which work do you want AI to help with?', tools: 'Tools you use today (optional)', timing: 'Tentative timing', source: 'How did you hear about us? (optional)', source_detail: 'Who referred you, or which event? (optional)',
    },
    hint: { workflows: 'For example: weekly reports, proposal drafts, meeting notes, customer replies. Please do not include confidential information or customer personal data.', tools: 'For example: Salesforce, HubSpot, NetSuite, Microsoft 365, Google Workspace, ChatGPT.', location_city: 'Travel outside Dallas–Fort Worth is quoted separately.' },
    opt: {
      industry: [['professional_services', 'Professional services'], ['manufacturing', 'Manufacturing'], ['distribution', 'Distribution and logistics'], ['construction', 'Construction and field services'], ['healthcare', 'Healthcare'], ['finance', 'Financial services and insurance'], ['real_estate', 'Real estate'], ['retail', 'Retail and e-commerce'], ['technology', 'Technology'], ['nonprofit_education', 'Nonprofit and education'], ['public_sector', 'Public sector'], ['other', 'Other']],
      headcount: [['1-19', '1–19 employees'], ['20-49', '20–49 employees'], ['50-99', '50–99 employees'], ['100-249', '100–249 employees'], ['250-999', '250–999 employees'], ['1000+', '1,000 or more employees']],
      format: [['workshop_90', '90-minute team workshop'], ['onsite_day', 'Full-day onsite (Texas)'], ['four_session', '4 × 90-min program'], ['not_sure', 'Not sure yet']],
      location: [['remote', 'Remote (video)'], ['dfw_onsite', 'Onsite in Dallas–Fort Worth'], ['other_texas', 'Onsite elsewhere in Texas (travel quoted separately)']],
      timing: [['within_month', 'Within a month'], ['one_to_three', 'In 1–3 months'], ['three_plus', 'In more than 3 months'], ['exploring', 'Just exploring']],
      source: [['search', 'Search engine'], ['ai_assistant', 'AI assistant (ChatGPT, Claude, Perplexity…)'], ['linkedin', 'LinkedIn'], ['referral', 'Referral'], ['event', 'Event or workshop'], ['social_other', 'Other social media'], ['other', 'Other']],
    },
    consentH: 'Consent', consentRequest: 'I agree to be contacted about this request. (required)', consentNewsletter: 'Send me occasional AI training tips (newsletter). Optional — unsubscribe at any time.',
    privacy: 'We use these details to reply to this request and prepare a quote. See the <a href="/privacy">Privacy Policy</a>.',
    hp: 'Leave this field empty', submit: 'Send request', sending: 'Sending…',
    okH: 'Request received', okP: 'Thank you — your request has been recorded<span id="qf-ref"></span>. This does not book a meeting. Jack reads each request himself and will reply by email. If you would like to talk it through, you can <a href="/book/">book a 20-minute workflow call</a>.', ref: ' (reference {r})',
    errH: 'Your request was not sent', errP: `Check that every required field is filled in and the consent box is ticked, then send it again. You can also email <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
    invalid: 'Please check: ', consent: 'Please tick “I agree to be contacted about this request” so we can reply.', rate: 'Too many requests from this connection. Please wait a few minutes and try again.', failed: `Your request was not sent. Try again, or email ${EMAIL}.`,
    nextH: 'What happens next', next: ['Jack reads your request and replies by email.', 'If the training fits, you receive a written scope and price for your team.', 'Nothing is booked or agreed until you confirm it in writing.'],
    talkH: 'Prefer to talk first?', talkP: 'Book a 20-minute workflow call and bring one task.', talk: 'Book a 20-minute call',
  },
  zh: {
    title: '申请团队 AI 培训报价 | AI Man Jack',
    description: '介绍你的团队、希望 AI 帮忙的工作和考虑中的培训形式，我们据此准备书面的服务范围与报价。',
    crumb: '申请报价', eyebrow: '培训报价', h1: '申请培训报价',
    sub: '适用于 90 分钟团队工作坊、德州全天上门培训或四次课程项目。你对工作的描述越具体，报价就越贴合。这是 AI 培训，不是 ERP 或 CRM 定制开发。',
    choose: '请选择', required: '必填',
    f: {
      name: '姓名', email: '工作邮箱', company: '公司名称', company_website: '公司网站（选填）', industry: '所属行业', headcount: '公司规模',
      attendees: '预计参加人数', format: '倾向的培训形式', location: '希望在哪里培训？', location_city: '如果是德州其他城市，请填写城市名',
      workflows: '希望 AI 帮忙处理哪些工作？', tools: '目前使用的工具（选填）', timing: '大致时间', source: '你是从哪里了解到我们的？（选填）', source_detail: '推荐人或活动名称（选填）',
    },
    hint: { workflows: '例如：周报、方案初稿、会议纪要、客户回复。请不要填写保密信息或客户个人信息。', tools: '例如：Salesforce、HubSpot、NetSuite、Microsoft 365、Google Workspace、ChatGPT。', location_city: '达拉斯—沃斯堡以外的差旅另行报价。' },
    opt: {
      industry: [['professional_services', '专业服务'], ['manufacturing', '制造业'], ['distribution', '分销与物流'], ['construction', '建筑与现场服务'], ['healthcare', '医疗健康'], ['finance', '金融与保险'], ['real_estate', '房地产'], ['retail', '零售与电商'], ['technology', '科技'], ['nonprofit_education', '非营利与教育'], ['public_sector', '政府与公共部门'], ['other', '其他']],
      headcount: [['1-19', '1–19 人'], ['20-49', '20–49 人'], ['50-99', '50–99 人'], ['100-249', '100–249 人'], ['250-999', '250–999 人'], ['1000+', '1,000 人以上']],
      format: [['workshop_90', '90 分钟团队工作坊'], ['onsite_day', '全天上门培训（德州）'], ['four_session', '4 × 90 分钟课程项目'], ['not_sure', '还没确定']],
      location: [['remote', '远程（视频）'], ['dfw_onsite', '达拉斯—沃斯堡上门'], ['other_texas', '德州其他城市上门（差旅另行报价）']],
      timing: [['within_month', '一个月内'], ['one_to_three', '1–3 个月内'], ['three_plus', '3 个月以后'], ['exploring', '先了解一下']],
      source: [['search', '搜索引擎'], ['ai_assistant', 'AI 助手（ChatGPT、Claude、Perplexity 等）'], ['linkedin', 'LinkedIn'], ['referral', '朋友或同事推荐'], ['event', '活动或工作坊'], ['social_other', '其他社交媒体'], ['other', '其他']],
    },
    consentH: '同意事项', consentRequest: '我同意就本次申请接受联系。（必选）', consentNewsletter: '给我发送不定期的 AI 培训技巧（电子通讯）。选填，可随时退订。',
    privacy: '这些信息仅用于回复本次申请和准备报价。详见<a href="/zh/privacy">隐私政策</a>。',
    hp: '此栏请留空', submit: '提交申请', sending: '正在提交…',
    okH: '申请已收到', okP: '谢谢，你的申请已记录<span id="qf-ref"></span>。这并不代表已预约会议。Jack 会亲自阅读每一份申请，并通过邮件回复。如果想先聊一聊，可以<a href="/zh/book/">预约 20 分钟工作流咨询</a>。', ref: '（编号 {r}）',
    errH: '申请未能提交', errP: `请确认所有必填项都已填写，并勾选同意联系的选项，然后再提交一次。也可以直接发邮件至 <a href="mailto:${EMAIL}">${EMAIL}</a>。`,
    invalid: '请检查以下内容：', consent: '请勾选“我同意就本次申请接受联系”，以便我们回复你。', rate: '提交过于频繁，请等几分钟再试。', failed: `申请未能提交。请重试，或发邮件至 ${EMAIL}。`,
    nextH: '接下来会怎样', next: ['Jack 会阅读你的申请，并通过邮件回复。', '如果培训适合你的团队，你会收到书面的服务范围和报价。', '在你书面确认之前，不会预约或约定任何事项。'],
    talkH: '想先聊一聊？', talkP: '预约一次 20 分钟工作流咨询，带上一项真实任务。', talk: '预约 20 分钟通话',
  },
};

export const QUOTE_FIELDS = ['name', 'email', 'company', 'company_website', 'industry', 'headcount', 'attendees', 'format', 'location', 'location_city', 'workflows', 'tools', 'timing', 'source', 'source_detail'];
const FT = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts'];

const quoteScript = `<script>
(function(){var D=document,f=D.getElementById('quote-form');if(!f||!window.fetch)return;var Q=window.QF,msg=D.getElementById('qf-msg'),ok=D.getElementById('received'),btn=f.querySelector('button[type=submit]'),E=f.elements;
var tr=function(n,p){if(window.amjTrack)window.amjTrack(n,p||{})};
var t0=Date.now();
var pf=new URLSearchParams(location.search).get('format');if(pf&&E.format.querySelector('option[value="'+pf.replace(/[^a-z0-9_]/g,'')+'"]'))E.format.value=pf;
var started=false;f.addEventListener('focusin',function(){if(started)return;started=true;tr('request_quote_start',{offer_format:E.format.value||''})});
f.addEventListener('submit',function(e){e.preventDefault();
 // First-touch attribution is read at submit time: on a first visit the site script stores it after this script has run.
 try{var ft=JSON.parse(sessionStorage.getItem('amj_ft')||'{}');${JSON.stringify(FT)}.forEach(function(k){if(ft[k]!=null&&E['ft_'+k])E['ft_'+k].value=String(ft[k]).slice(0,200)})}catch(_){}
 var o={};new FormData(f).forEach(function(v,k){o[k]=v});
 o.consent_request=E.consent_request.checked;o.consent_newsletter=E.consent_newsletter.checked;o.fill_ms=String(Date.now()-t0);
 [].forEach.call(f.querySelectorAll('[aria-invalid]'),function(x){x.removeAttribute('aria-invalid')});
 btn.disabled=true;btn.textContent=Q.sending;msg.textContent='';
 fetch(f.action,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){
  if(r.ok&&j.ok){f.hidden=true;ok.setAttribute('data-show','');if(j.receipt_id){D.getElementById('qf-ref').textContent=Q.ref.replace('{r}',String(j.receipt_id).slice(0,8).toUpperCase());
   tr('submit_enterprise_inquiry',{receipt_id:j.receipt_id,offer_format:o.format||''});if(o.consent_newsletter)tr('opt_in_newsletter',{form:'quote'})}ok.focus();return}
  if(j.error==='invalid'&&j.fields&&j.fields.length){var names=[];j.fields.forEach(function(n){var el=E[n];if(el&&el.setAttribute){el.setAttribute('aria-invalid','true');names.push(Q.labels[n]||n)}});msg.textContent=Q.invalid+names.join(', ');var first=E[j.fields[0]];if(first&&first.focus)first.focus()}
  else if(j.error==='consent_required'){E.consent_request.setAttribute('aria-invalid','true');msg.textContent=Q.consent;E.consent_request.focus()}
  else if(j.error==='rate_limited')msg.textContent=Q.rate;else msg.textContent=Q.failed})}).catch(function(){msg.textContent=Q.failed}).then(function(){btn.disabled=false;btn.textContent=Q.submit})});
})();
</script>`;

const quotePage = (lang) => {
  const c = Q[lang], bc = breadcrumb(lang, [[copy[lang].crumb, '/contact/'], [c.crumb, QUOTE_URL]]);
  const req = (n) => ['name', 'email', 'company', 'industry', 'headcount', 'attendees', 'format', 'location', 'workflows', 'timing'].includes(n);
  const lab = (n, inner, { full = false, hint } = {}) => `<div class="field${full ? ' full' : ''}"><label for="qf-${n}">${c.f[n]}</label>${inner}${hint ? `<span class="hint" id="qf-${n}-hint">${hint}</span>` : ''}</div>`;
  const desc = (n) => (c.hint[n] ? ` aria-describedby="qf-${n}-hint"` : '');
  const input = (n, type, attrs = '') => `<input id="qf-${n}" name="${n}" type="${type}"${req(n) ? ' required' : ''}${desc(n)} ${attrs}>`;
  const select = (n) => `<select id="qf-${n}" name="${n}"${req(n) ? ' required' : ''}><option value="">${c.choose}</option>${c.opt[n].map(([v, l]) => `<option value="${v}">${l}</option>`).join('')}</select>`;
  const hidden = [['lang', lang], ['form_version', INTAKE_FORM_VERSION], ['fill_ms', ''], ...FT.map((k) => [`ft_${k}`, ''])].map(([n, v]) => `<input type="hidden" name="${n}" value="${v}">`).join('');
  return {
    title: c.title, description: c.description, view: 'quote_form_view',
    body: `${pageHero(lang, { crumbs: bc.html, eyebrow: c.eyebrow, h1: c.h1, sub: c.sub, ctas: false })}
<section class="sec tight" id="quote"><div class="wrap quote-grid-2"><div>
<div id="received" class="qf-note ok" role="status" tabindex="-1"><h2>${c.okH}</h2><p>${c.okP}</p></div>
<div id="not-sent" class="qf-note" role="alert" tabindex="-1"><h2>${c.errH}</h2><p>${c.errP}</p></div>
<form class="qf" id="quote-form" action="/v1/intake" method="post" accept-charset="utf-8">${hidden}
${lab('name', input('name', 'text', 'autocomplete="name" maxlength="100"'))}
${lab('email', input('email', 'email', 'autocomplete="email" inputmode="email" maxlength="254"'))}
${lab('company', input('company', 'text', 'autocomplete="organization" maxlength="120"'))}
${lab('company_website', input('company_website', 'text', 'inputmode="url" autocomplete="url" maxlength="200" placeholder="example.com"'))}
${lab('industry', select('industry'))}
${lab('headcount', select('headcount'))}
${lab('attendees', input('attendees', 'number', 'min="1" max="500" step="1" inputmode="numeric"'))}
${lab('format', select('format'))}
${lab('location', select('location'))}
${lab('location_city', input('location_city', 'text', 'maxlength="80" autocomplete="address-level2"'), { hint: c.hint.location_city })}
${lab('workflows', `<textarea id="qf-workflows" name="workflows" required maxlength="2000" rows="5" aria-describedby="qf-workflows-hint"></textarea>`, { full: true, hint: c.hint.workflows })}
${lab('tools', input('tools', 'text', 'maxlength="300"'), { full: true, hint: c.hint.tools })}
${lab('timing', select('timing'))}
${lab('source', select('source'))}
${lab('source_detail', input('source_detail', 'text', 'maxlength="120"'), { full: true })}
<div class="qf-hp" aria-hidden="true"><label for="qf-hp">${c.hp}</label><input id="qf-hp" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
<fieldset><legend>${c.consentH}</legend>
<label class="check" for="qf-consent-request"><input id="qf-consent-request" name="consent_request" type="checkbox" value="yes" required><span>${c.consentRequest}</span></label>
<label class="check" for="qf-consent-newsletter"><input id="qf-consent-newsletter" name="consent_newsletter" type="checkbox" value="yes"><span>${c.consentNewsletter}</span></label>
</fieldset>
<p class="privacy">${c.privacy}</p>
<button class="btn btn-primary" type="submit">${c.submit}</button>
<p id="qf-msg" class="qf-msg" role="status" aria-live="polite"></p>
</form></div>
<aside class="stack" style="display:flex;flex-direction:column;gap:20px"><div class="big-card oakc"><h2 class="h3">${c.nextH}</h2><ol style="margin-left:22px;display:flex;flex-direction:column;gap:10px">${c.next.map((n) => `<li>${n}</li>`).join('')}</ol></div>
<div class="big-card"><h2 class="h3">${c.talkH}</h2><p>${c.talkP}</p><a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="quote-aside">${c.talk}</a></div></aside></div></section>
<script>window.QF=${JSON.stringify({ sending: c.sending, submit: c.submit, ref: c.ref, invalid: c.invalid, consent: c.consent, rate: c.rate, failed: c.failed, labels: c.f })}</script>
${quoteScript}`,
    jsonld: [{ '@type': 'ContactPage', '@id': `${SITE}${L(lang, QUOTE_URL)}`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

// The quote page is a form, not a landing page: noindex,follow and out of the sitemap (reversible: drop `indexable: false`).
export const pages = [
  { path: '/contact/', priority: 0.6, en: page('en'), zh: page('zh') },
  { path: QUOTE_URL, indexable: false, en: quotePage('en'), zh: quotePage('zh') },
];

