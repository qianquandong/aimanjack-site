// "AI Rollout Kit" lead magnet (2026-10-17): name + email → MailerLite (account 2719495), which emails the PDF
// (downloads/ai-rollout-kit-<lang>.pdf, built by scripts/rollout-kit.mjs) and runs the follow-up sequence. One MailerLite
// embedded form + group per language. The worksheets themselves stay public under /templates/; the PDF is the bundle.
// With JS the form posts in place (no-cors, so the reply is opaque; a network error is the only failure we can see).
// Without JS it posts straight to MailerLite. CSP: connect-src and form-action allow https://assets.mailerlite.com (_headers).

const ACTION = {
  en: 'https://assets.mailerlite.com/jsonp/2719495/forms/201552363184457178/subscribe',
  zh: 'https://assets.mailerlite.com/jsonp/2719495/forms/201552495966684189/subscribe',
};

const K = {
  en: {
    k: 'Free download', h: 'The AI Rollout Kit for small teams',
    p: 'Five one-page worksheets in the order a team needs them: pick the work, approve the tools, set data rules, write the workflow down, review after two weeks. A free PDF, in English or Chinese.',
    name: 'Your name', email: 'Work email', consent: 'Email me the kit and a few short follow-ups from Jack. Unsubscribe anytime.',
    submit: 'Send me the kit', sending: 'Sending…',
    okH: 'Check your inbox.', okP: 'The kit is on its way. If MailerLite asks you to confirm your email, click the link and the PDF follows. Nothing after a few minutes? Look in Promotions or Spam.',
    err: 'That did not go through. Try again, or email jack@aimanjack.com and ask for the kit.',
    zh: 'Prefer Chinese? <a href="/zh/templates/">中文版</a>',
  },
  zh: {
    k: '免费下载', h: '小团队 AI 落地套件',
    p: '五张一页纸工作表，按团队落地的顺序排好：挑任务、批工具、定数据边界、写下工作流、两周复盘。免费 PDF，中英文都有。',
    name: '姓名', email: '工作邮箱', consent: '把套件和几封简短的跟进邮件发给我。随时可以退订。',
    submit: '发给我', sending: '正在发送…',
    okH: '请查收邮箱。', okP: '套件正在发出。如果 MailerLite 请你先确认邮箱，点一下确认链接，PDF 随后就到。几分钟后还没收到，请看看推广或垃圾邮件文件夹。',
    err: '没有提交成功。请再试一次，或发邮件到 jack@aimanjack.com 索取。',
    zh: '',
  },
};

const script = `<script>
(function(){document.querySelectorAll('form.kf').forEach(function(f){var s=f.querySelector('button'),m=f.querySelector('.qf-msg'),ok=document.getElementById(f.dataset.ok),L=JSON.parse(f.dataset.l);
f.addEventListener('submit',function(e){e.preventDefault();if(!f.reportValidity())return;s.disabled=true;s.textContent=L.sending;m.textContent='';
var d=new FormData(f);d.delete('kit_consent');
fetch(f.action,{method:'POST',body:d,mode:'no-cors'}).then(function(){f.hidden=true;ok.setAttribute('data-show','');ok.focus();
if(window.dataLayer)window.dataLayer.push(['event','kit_request',{page:location.pathname,pos:f.dataset.pos}])})
.catch(function(){m.textContent=L.err}).then(function(){s.disabled=false;s.textContent=L.submit})})})})();
</script>`;

export function kitForm(lang, pos) {
  const c = K[lang], id = `kf-${pos}`.replace(/[^a-z0-9-]/gi, '-');
  return `<section class="sec tight kit-form" id="rollout-kit"><div class="wrap g12">
<div style="grid-column:span 5;display:flex;flex-direction:column;gap:14px"><div class="eyebrow">${c.k}</div><h2 style="font-size:clamp(28px,3vw,44px)">${c.h}</h2><p class="lead">${c.p}</p>${c.zh ? `<p class="muted" style="font-size:14px">${c.zh}</p>` : ''}</div>
<div style="grid-column:7 / span 6">
<div id="${id}-ok" class="qf-note ok" role="status" tabindex="-1"><h3>${c.okH}</h3><p>${c.okP}</p></div>
<form class="qf kf" action="${ACTION[lang]}" method="post" data-ok="${id}-ok" data-pos="${pos}" data-l='${JSON.stringify({ sending: c.sending, submit: c.submit, err: c.err }).replace(/'/g, '&#39;')}'>
<input type="hidden" name="ml-submit" value="1"><input type="hidden" name="anticsrf" value="true">
<div class="field"><label for="${id}-name">${c.name}</label><input id="${id}-name" name="fields[name]" type="text" required maxlength="100" autocomplete="name"></div>
<div class="field"><label for="${id}-email">${c.email}</label><input id="${id}-email" name="fields[email]" type="email" required maxlength="254" autocomplete="email" inputmode="email" placeholder="you@company.com"></div>
<fieldset><label class="check" for="${id}-consent"><input id="${id}-consent" name="kit_consent" type="checkbox" value="yes" required><span>${c.consent}</span></label></fieldset>
<button class="btn btn-primary btn-lg" type="submit" data-event="kit_request_submit" data-pos="${pos}">${c.submit}</button>
<p class="qf-msg" role="status" aria-live="polite"></p>
</form></div></div></section>
${script}`;
}
