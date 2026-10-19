// "Interested in booking? Get an easy quote" — the short quote form on the tool pages (2026-10-17, Jack's request: no public
// price on these pages, ask for an email instead). Posts to /v1/intake with kind=quick; see validateQuickIntake in
// functions/v1/[[route]].js. Only name, email and the request consent are required. Budget is free text on purpose, so the page
// never prints price ranges that AI engines could quote back as our prices. Works without JS (303 back to #quote-received /
// #quote-not-sent, shown by :target); with JS it posts JSON and shows the receipt in place. Same honeypot + fill-time checks and
// first-touch fields as /contact/quote/.
import { EMAIL, QUICK_FORM_VERSION } from './config.mjs';
import { L } from './layout.mjs';
import { SUBMISSION_KEY_JS } from './submission-key.mjs';

const FT = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts'];

const Q = {
  en: {
    k: 'Get a quote', h: 'Interested in booking?<br>Get an easy quote.',
    p: 'Tell us roughly how many people and what you have in mind. Jack replies by email within one business day. Once the details are clear, you get a recommended format and a written price for your team. No call needed unless you want one.',
    name: 'Your name', email: 'Email address', people: 'Number of people', budget: 'Approximate budget (optional)', budgetPh: 'A range, or “not sure yet”',
    msg: 'Your message (optional)', msgPh: 'Which tool your team uses, what work you want help with, and any dates. Please leave out confidential or customer data.',
    consent: 'I agree to be contacted about this request.', news: 'Send me occasional AI training tips. Optional; unsubscribe any time.',
    privacy: 'We use these details only to reply and prepare your quote. See the <a href="/privacy">Privacy Policy</a>.',
    submit: 'Submit request →', sending: 'Sending…', hp: 'Leave this field empty',
    okH: 'Request received', okP: 'Thank you. Jack reads each request himself and will reply by email with a format and a quote. This does not book a meeting.',
    errH: 'Your request was not sent', errP: `Check your name, email and the consent box, then send it again. You can also email <a href="mailto:${EMAIL}">${EMAIL}</a>.`,
    confirm: 'That was very fast. Please check your details and press the button again to confirm.', confirmBtn: 'Confirm and send →', conflict: 'Your request changed while it was being sent. Please press send again.',
    invalid: 'Please check: ', needConsent: 'Please tick the consent box so we can reply.', rate: 'Too many requests from this connection. Please wait a few minutes.', failed: `Not sent. Try again, or email ${EMAIL}.`,
  },
  zh: {
    k: '获取报价', h: '想给团队安排培训？<br>留个邮箱，拿一份报价。',
    p: '大概说一下人数和想法。Jack 会在 1 个工作日内通过邮件回复；确认需求后，再给出推荐的培训形式和书面报价。不一定要通话，除非你想先聊聊。',
    name: '姓名', email: '邮箱', people: '参加人数', budget: '大致预算（选填）', budgetPh: '一个范围，或“还没定”',
    msg: '补充说明（选填）', msgPh: '团队用的是哪个工具、希望 AI 帮忙哪些工作、大概时间。请不要填写保密信息或客户数据。',
    consent: '我同意就本次申请接受联系。', news: '给我发送不定期的 AI 培训技巧。选填，可随时退订。',
    privacy: '这些信息只用于回复和准备报价。详见<a href="/zh/privacy">隐私政策</a>。',
    submit: '提交申请 →', sending: '正在提交…', hp: '此栏请留空',
    okH: '申请已收到', okP: '谢谢。Jack 会亲自阅读每一份申请，并通过邮件回复推荐的形式和报价。这并不代表已预约会议。',
    errH: '申请未能提交', errP: `请检查姓名、邮箱和同意选项后再提交一次。也可以直接发邮件至 <a href="mailto:${EMAIL}">${EMAIL}</a>。`,
    confirm: '提交得很快。请核对内容，再点一次按钮确认。', confirmBtn: '确认并发送 →', conflict: '提交过程中内容有变化，请再点一次发送。',
    invalid: '请检查：', needConsent: '请勾选同意联系的选项，以便我们回复。', rate: '提交过于频繁，请等几分钟再试。', failed: `未能提交。请重试，或发邮件至 ${EMAIL}。`,
  },
};

// The no-JS error page of /v1/intake (src/intake-error-page.mjs) reuses these labels.
export const QUICK_COPY = Q;

const script = `<script>
(function(){var D=document,f=D.getElementById('qq-form');if(!f||!window.fetch)return;var Q=window.QQ,E=f.elements,msg=D.getElementById('qq-msg'),ok=D.getElementById('quote-received'),btn=f.querySelector('button[type=submit]'),t0=Date.now(),started=false;
var tr=function(n,p){if(window.amjTrack)window.amjTrack(n,p||{})};
${SUBMISSION_KEY_JS}var S=SKM(f.id);
f.addEventListener('focusin',function(){if(started)return;started=true;tr('request_quote_start',{form:'quick',tool:E.tool.value})});
f.addEventListener('submit',function(e){e.preventDefault();
 try{var ft=JSON.parse(sessionStorage.getItem('amj_ft')||'{}');${JSON.stringify(FT)}.forEach(function(k){if(ft[k]!=null&&E['ft_'+k])E['ft_'+k].value=String(ft[k]).slice(0,200)})}catch(_){}
 var o={};new FormData(f).forEach(function(v,k){o[k]=v});o.consent_request=E.consent_request.checked;o.consent_newsletter=E.consent_newsletter.checked;o.fill_ms=String(Date.now()-t0);
 [].forEach.call(f.querySelectorAll('[aria-invalid]'),function(x){x.removeAttribute('aria-invalid')});btn.disabled=true;btn.textContent=Q.sending;msg.textContent='';
 S.key(o).then(function(k){o.submission_key=k;if(S.confirming())o.confirm='yes';
 return fetch(f.action,{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify(o)}).then(function(r){return r.json().catch(function(){return{}}).then(function(j){
  if(r.ok&&j.ok){f.hidden=true;ok.setAttribute('data-show','');ok.focus();S.clear();if(j.receipt_id){tr('submit_enterprise_inquiry',{form:'quick',tool:o.tool,receipt_id:j.receipt_id});if(o.consent_newsletter)tr('opt_in_newsletter',{form:'quick'})}return}
  if(j.error==='confirm_required'){S.needConfirm();msg.textContent=Q.confirm;return}
  if(j.error==='submission_conflict'){S.clear();msg.textContent=Q.conflict;return}
  if(j.error==='invalid'&&j.fields){var n=[];j.fields.forEach(function(k){var el=E[k];if(el&&el.setAttribute){el.setAttribute('aria-invalid','true');n.push(Q.labels[k]||k)}});msg.textContent=Q.invalid+n.join(', ')}
  else if(j.error==='consent_required'){E.consent_request.setAttribute('aria-invalid','true');msg.textContent=Q.needConsent}
  else msg.textContent=j.error==='rate_limited'?Q.rate:Q.failed})})}).catch(function(){msg.textContent=Q.failed})
 // Always give the button back, keeping the confirmation state and the key for a retry.
 .then(function(){btn.disabled=false;btn.textContent=S.confirming()?Q.confirmBtn:Q.submit;if(S.confirming())btn.focus()})});
})();
</script>`;

// tool: copilot | chatgpt | claude | grok | sales | marketing | operations | leadership | general. path: the page's own path (no-JS submits return there).
export function quickQuote(lang, { tool = 'general', path }) {
  const c = Q[lang], page = L(lang, path);
  const hidden = [['kind', 'quick'], ['tool', tool], ['page', page], ['lang', lang], ['form_version', QUICK_FORM_VERSION], ['fill_ms', ''], ...FT.map((k) => [`ft_${k}`, ''])]
    .map(([n, v]) => `<input type="hidden" name="${n}" value="${v}">`).join('');
  return `<section class="sec quick-quote" id="quote"><div class="wrap g12">
<div style="grid-column:span 5;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${c.k}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${c.h}</h2><p class="lead">${c.p}</p></div>
<div style="grid-column:7 / span 6">
<div id="quote-received" class="qf-note ok" role="status" tabindex="-1"><h3>${c.okH}</h3><p>${c.okP}</p></div>
<div id="quote-not-sent" class="qf-note" role="alert" tabindex="-1"><h3>${c.errH}</h3><p>${c.errP}</p></div>
<form class="qf" id="qq-form" action="/v1/intake" method="post" accept-charset="utf-8">${hidden}
<div class="field"><label for="qq-name">${c.name}</label><input id="qq-name" name="name" type="text" required maxlength="100" autocomplete="name"></div>
<div class="field"><label for="qq-email">${c.email}</label><input id="qq-email" name="email" type="email" required maxlength="254" autocomplete="email" inputmode="email" placeholder="you@company.com"></div>
<div class="field"><label for="qq-attendees">${c.people}</label><input id="qq-attendees" name="attendees" type="number" min="1" max="500" step="1" inputmode="numeric"></div>
<div class="field"><label for="qq-budget">${c.budget}</label><input id="qq-budget" name="budget" type="text" maxlength="100" placeholder="${c.budgetPh}"></div>
<div class="field full"><label for="qq-workflows">${c.msg}</label><textarea id="qq-workflows" name="workflows" maxlength="2000" rows="4" placeholder="${c.msgPh}"></textarea></div>
<div class="qf-hp" aria-hidden="true"><label for="qq-hp">${c.hp}</label><input id="qq-hp" name="company_url" type="text" tabindex="-1" autocomplete="off"></div>
<fieldset><label class="check" for="qq-consent"><input id="qq-consent" name="consent_request" type="checkbox" value="yes" required><span>${c.consent}</span></label>
<label class="check" for="qq-news"><input id="qq-news" name="consent_newsletter" type="checkbox" value="yes"><span>${c.news}</span></label></fieldset>
<p class="privacy">${c.privacy}</p>
<button class="btn btn-primary btn-lg" type="submit" data-event="quick_quote_submit" data-pos="${tool}">${c.submit}</button>
<p id="qq-msg" class="qf-msg" role="status" aria-live="polite"></p>
</form></div></div></section>
<script>window.QQ=${JSON.stringify({ sending: c.sending, submit: c.submit, confirm: c.confirm, confirmBtn: c.confirmBtn, conflict: c.conflict, invalid: c.invalid, needConsent: c.needConsent, rate: c.rate, failed: c.failed, labels: { name: c.name, email: c.email, attendees: c.people, budget: c.budget, workflows: c.msg } })}</script>
${script}`;
}
