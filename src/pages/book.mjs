// /book/ — Jack's own booking page (BOOKING-PLAN.md W1). Static shell + one inline script that talks to /v1/*.
// Same page handles ?id=<booking> for reschedule / cancel (the id is the customer's manage token).
import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY } from '../config.mjs';
import { pageHero, breadcrumb, BUSINESS_REF, T } from '../components.mjs';

const BUSINESS = 'aimanjack', SERVICE = 'demo-call', TZ = 'America/Chicago';

const copy = {
  en: {
    title: 'Book a 30-Minute Call to Plan Your Team’s AI Training | AI Man Jack',
    description: 'Pick a time for a 30-minute call with Jack about AI training, a workshop or a workflow program for your team. Times are US Central. Change or cancel from your confirmation link.',
    crumb: 'Book a call', eyebrow: 'Book a call · 30 minutes · free', h1: 'Plan your team’s workshop in one call.',
    sub: 'Pick a day and a time. Jack calls you; you get a link to change or cancel.',
    s: {
      day: 'Pick a day', time: 'Pick a time', you: 'Your details', tz: 'All times are US Central (Dallas).',
      name: 'Your name', phone: 'Mobile number', email: 'Email (optional, for a confirmation)', biz: 'Company (optional)', goal: 'Team size and what you want people to do with AI (optional)', submit: 'Confirm booking', working: 'Booking…',
      loading: 'Loading times…', none: `No open times in the next 30 days. Text Jack at ${SMS_DISPLAY} instead.`,
      doneH: 'You’re booked.', doneP: 'Jack will call {phone} at {time}.', doneLink: 'Save this link to change or cancel:',
      manageH: 'Your appointment', manageP: '{time} · Jack calls {phone}', change: 'Change time', cancel: 'Cancel appointment', changeH: 'Pick a new time',
      confirmMove: 'Move your call to {time}?', confirmCancel: 'Cancel this appointment?', moved: 'Moved to {time}.', cancelled: 'This appointment was cancelled.',
      closed: 'It is too close to the appointment to change it online. Text Jack at ' + SMS_DISPLAY + '.',
      taken: 'That time was just taken. Pick another one.', yes: 'Yes, do it', no: 'Go back', moreDays: 'More dates', moreTimes: 'More times', notFound: 'We could not find that booking.',
      error: `Something went wrong. Try again, or text Jack at ${SMS_DISPLAY}.`, bookAnother: 'Book a new time',
    },
  },
  zh: {
    title: '预约 30 分钟通话，规划团队的 AI 工作坊 | AI Man Jack',
    description: '选择一个时间，与 Jack 进行 30 分钟通话，沟通团队的 AI 培训、工作坊或工作流项目。时间均为美国中部时间，可通过确认链接改期或取消。',
    crumb: '预约通话', eyebrow: '预约通话 · 30 分钟 · 免费', h1: '一次通话，<br>规划团队的工作坊。',
    sub: '选择日期和时间，Jack 会致电给你；确认后你会收到可改期或取消的链接。',
    s: {
      day: '选择日期', time: '选择时间', you: '填写信息', tz: '所有时间均为美国中部时间（达拉斯）',
      name: '姓名', phone: '手机号码', email: '邮箱（选填）', biz: '公司（选填）', goal: '团队规模，以及希望团队用 AI 做什么（选填）', submit: '确认预约', working: '正在预约…',
      loading: '正在加载可选时间…', none: `未来 30 天暂无可预约时间，请发送短信至 ${SMS_DISPLAY} 联系 Jack。`,
      doneH: '预约成功。', doneP: 'Jack 将于 {time} 致电 {phone}。', doneLink: '如需改期或取消，请使用此链接：',
      manageH: '你的预约', manageP: '{time} · Jack 将致电 {phone}', change: '更改时间', cancel: '取消预约', changeH: '选择新的时间',
      confirmMove: '将通话改至 {time}？', confirmCancel: '确定取消这次预约？', moved: '已改至 {time}。', cancelled: '该预约已取消。',
      closed: '距离通话时间过近，无法在线更改。请发送短信至 ' + SMS_DISPLAY + ' 联系 Jack。',
      taken: '该时间刚刚被预约，请选择其他时间。', yes: '确定', no: '返回', moreDays: '更多日期', moreTimes: '更多时间', notFound: '未找到该预约。',
      error: `出现问题，请重试，或发送短信至 ${SMS_DISPLAY} 联系 Jack。`, bookAnother: '重新预约',
    },
  },
};

// Left column of the page (design: Book / ZH-Book).
const INFO = {
  en: { top: '30-minute call with Jack', steps: [['On the call:', 'what your team does every week, which tools are approved, what you want people to be able to do.'], ['Within 24 hours:', 'a recommended format and a fixed, written price. No add-ons.'], ['Then:', 'the session runs on your team’s real tasks — at your office or remote.']], alt: ['Rather text? Send <strong>TRAINING</strong> to', ', or email', '.'] },
  zh: { top: '与 Jack 的 30 分钟通话', steps: [['通话中：', '了解团队每周的工作、已获批准的工具，以及希望达成的目标。'], ['24 小时内：', '提供推荐的培训形式和固定的书面报价，无附加费用。'], ['之后：', '基于团队的真实任务授课——上门或远程均可。']], alt: ['更习惯短信？发送 <strong>TRAINING</strong> 至', '，或发邮件至', '。'] },
};

// One script for both languages; strings come from window.BK.
const script = `<script>
(function(){var S=window.BK,D=document,$=function(i){return D.getElementById(i)},loc=S.lang==='zh'?'zh-CN':'en-US';
var q=new URLSearchParams(location.search),bookingId=q.get('id'),avail=[],picked=null,booking=null;
var fmtDay=new Intl.DateTimeFormat(loc,{timeZone:S.tz,weekday:'short',month:'short',day:'numeric'});
var fmtTime=new Intl.DateTimeFormat(loc,{timeZone:S.tz,hour:'numeric',minute:'2-digit'});
var fmtFull=new Intl.DateTimeFormat(loc,{timeZone:S.tz,weekday:'long',month:'long',day:'numeric',hour:'numeric',minute:'2-digit'});
var ph=function(p){var m=/^\\+1(\\d{3})(\\d{3})(\\d{4})$/.exec(p);return m?'('+m[1]+') '+m[2]+'-'+m[3]:p};
var t=function(k,v){return S.s[k].replace(/\\{(\\w+)\\}/g,function(_,n){return v[n]})};
var msg=function(m){$('bk-msg').textContent=m||''};
var errText=function(e){return e==='slot_unavailable'?S.s.taken:e==='cancel_window'?S.s.closed:e==='booking_not_found'?S.s.notFound:S.s.error};
var api=function(m,p,b){return fetch(p,{method:m,headers:{'content-type':'application/json','idempotency-key':crypto.randomUUID(),'x-source':'web'},body:b?JSON.stringify(b):undefined}).then(function(r){return r.json().then(function(j){return r.ok?j:Promise.reject(j)})})};
var show=function(id,on){$(id).hidden=!on};
function ask(text,yes){$('bk-ask-p').textContent=text;show('bk-ask',true);$('bk-ask').scrollIntoView({behavior:'smooth',block:'center'});$('bk-yes').onclick=function(){show('bk-ask',false);yes()};$('bk-no').onclick=function(){show('bk-ask',false)}}
function chips(el,items,label,on,more){el.innerHTML='';var vis=more?more.pick(items):items;
 vis.forEach(function(it){var b=D.createElement('button');b.type='button';b.className='bk-chip';b.textContent=label(it);b.setAttribute('aria-pressed','false');b.addEventListener('click',function(){el.querySelectorAll('.bk-chip').forEach(function(x){x.setAttribute('aria-pressed','false')});b.setAttribute('aria-pressed','true');on(it)});el.appendChild(b)});
 if(vis.length<items.length){var m=D.createElement('button');m.type='button';m.className='bk-chip bk-more';m.textContent=more.label;m.addEventListener('click',function(){chips(el,items,label,on)});el.appendChild(m)}}
var firstDays=function(a){return a.slice(0,5)};
var firstTimes=function(a){var h=a.filter(function(s){return new Date(s.start_at).getUTCMinutes()%30===0});return (h.length?h:a).slice(0,8)};
function loadTimes(){msg(S.s.loading);show('bk-pick',true);
 return api('GET','/v1/availability?business='+S.business+'&service='+S.service).then(function(r){avail=r.days;msg('');
  if(!avail.length){msg(S.s.none);return}
  chips($('bk-days'),avail,function(d){return fmtDay.format(new Date(d.slots[0].start_at))},function(d){show('bk-time',true);picked=null;
   chips($('bk-slots'),d.slots,function(s){return fmtTime.format(new Date(s.start_at))},function(s){picked=s;bookingId?move(s):(show('bk-form',true),$('bk-name').focus())},{label:S.s.moreTimes,pick:firstTimes})},{label:S.s.moreDays,pick:firstDays})
 }).catch(function(e){msg(errText(e&&e.error))})}
function done(b,head,line){booking=b;show('bk-ask',false);show('bk-pick',false);show('bk-time',false);show('bk-form',false);show('bk-manage',false);show('bk-done',true);
 $('bk-done-h').textContent=head;$('bk-done-p').textContent=line;var a=$('bk-done-link');a.href=b.manage_url;a.textContent=b.manage_url;show('bk-done-linkwrap',b.status==='confirmed')}
$('bk-form').addEventListener('submit',function(e){e.preventDefault();if(!picked)return;var btn=$('bk-submit');btn.disabled=true;btn.textContent=S.s.working;msg('');
 api('POST','/v1/bookings',{business:S.business,service:S.service,start_at:picked.start_at,staff:picked.staff_id,customer_name:$('bk-name').value,customer_phone:$('bk-phone').value,customer_email:$('bk-email').value||undefined,note:[$('bk-biz').value,$('bk-goal').value].filter(Boolean).join(' — ')||undefined})
 .then(function(b){track('booking_complete');done(b,S.s.doneH,t('doneP',{phone:ph(b.customer_phone),time:fmtFull.format(new Date(b.start_at))}))})
 .catch(function(e){msg(errText(e&&e.error));if(e&&e.error==='slot_unavailable')loadTimes()}).then(function(){btn.disabled=false;btn.textContent=S.s.submit})});
function move(s){var when=fmtFull.format(new Date(s.start_at));ask(t('confirmMove',{time:when}),function(){msg('');
 api('PATCH','/v1/bookings/'+bookingId,{start_at:s.start_at,staff:s.staff_id}).then(function(b){track('booking_reschedule');done(b,t('moved',{time:when}),t('manageP',{time:when,phone:ph(b.customer_phone)}))})
 .catch(function(e){msg(errText(e&&e.error));if(e&&e.error==='slot_unavailable')loadTimes()})})}
function manage(){api('GET','/v1/bookings/'+bookingId).then(function(b){booking=b;var when=fmtFull.format(new Date(b.start_at));
 if(b.status!=='confirmed'){done(b,S.s.cancelled,when);return}
 show('bk-manage',true);$('bk-manage-p').textContent=t('manageP',{time:when,phone:ph(b.customer_phone)});
 if(!b.changeable){msg(S.s.closed);$('bk-change').disabled=true;$('bk-cancel').disabled=true}
 $('bk-change').addEventListener('click',function(){$('bk-pick-h').textContent=S.s.changeH;loadTimes();$('bk-pick').scrollIntoView({behavior:'smooth'})});
 $('bk-cancel').addEventListener('click',function(){ask(S.s.confirmCancel,function(){
  api('DELETE','/v1/bookings/'+bookingId).then(function(b){track('booking_cancel');done(b,S.s.cancelled,when)}).catch(function(e){msg(errText(e&&e.error))})})})
 }).catch(function(e){msg(errText(e&&e.error))})}
function track(n){if(window.dataLayer)(function(){window.dataLayer.push(arguments)})('event',n,{page:location.pathname,language:S.lang})}
var g=q.get('goal');if(g&&$('bk-goal'))$('bk-goal').value=g.slice(0,200);
bookingId?manage():loadTimes();
})();
</script>`;

const page = (lang) => {
  const c = copy[lang], s = c.s, info = INFO[lang], bc = breadcrumb(lang, [[c.crumb, '/book/']]);
  return {
    title: c.title, description: c.description, view: 'booking_start',
    body: `<div class="wrap book-grid"><div class="book-info">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="sm" style="font-size:clamp(40px,5vw,72px)">${c.h1}</h1><p class="lead">${c.sub}</p>
<ol class="book-steps">${info.steps.map(([b, t], i) => `<li><span class="n">0${i + 1}</span><span><strong>${b}</strong> <span>${t}</span></span></li>`).join('')}</ol>
<div class="book-alt"><img src="/img/jack-portrait-256.webp" width="256" height="256" alt="Jack Qian"><span>${info.alt[0]} <a href="sms:${SMS_TEL}?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="book">${SMS_DISPLAY}</a>${info.alt[1]} <a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="book">${EMAIL}</a>${info.alt[2]}</span></div></div>
<div class="book-form"><section class="bk" data-nosnippet>
<div class="bk-top"><b>${info.top}</b><span>${s.tz}</span></div>
<div id="bk-manage" class="bk-card" hidden><h2 class="h3">${s.manageH}</h2><p id="bk-manage-p"></p><div class="cta-row" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="bk-change">${s.change}</button><button type="button" class="btn btn-ghost" id="bk-cancel">${s.cancel}</button></div></div>
<div id="bk-pick" hidden><h2 class="bk-h" id="bk-pick-h">${s.day}</h2><div id="bk-days" class="bk-chips"></div></div>
<div id="bk-time" hidden><h2 class="bk-h">${s.time}</h2><div id="bk-slots" class="bk-chips"></div></div>
<form id="bk-form" class="bk-form" hidden autocomplete="on"><h2 class="bk-h">${s.you}</h2>
<label>${s.name}<input id="bk-name" name="name" autocomplete="name" required maxlength="80"></label>
<label>${s.phone}<input id="bk-phone" name="tel" type="tel" autocomplete="tel" required inputmode="tel" minlength="10"></label>
<label>${s.email}<input id="bk-email" name="email" type="email" autocomplete="email" maxlength="120"></label>
<label>${s.biz}<input id="bk-biz" name="organization" autocomplete="organization" maxlength="120"></label>
<label>${s.goal}<input id="bk-goal" name="goal" maxlength="200"></label>
<button class="btn btn-primary" id="bk-submit" type="submit">${s.submit}</button></form>
<div id="bk-done" class="bk-card bk-done" hidden><h2 class="h3" id="bk-done-h"></h2><p id="bk-done-p"></p><p id="bk-done-linkwrap">${s.doneLink}<br><a id="bk-done-link" href="/book/"></a></p><p><a class="btn btn-secondary btn-sm" href="${lang === 'zh' ? '/zh/book/' : '/book/'}">${s.bookAnother}</a></p></div>
<div id="bk-ask" class="bk-card bk-ask" hidden><p id="bk-ask-p"></p><div class="cta-row" style="margin-top:12px"><button type="button" class="btn btn-primary btn-sm" id="bk-yes">${s.yes}</button><button type="button" class="btn btn-ghost btn-sm" id="bk-no">${s.no}</button></div></div>
<p id="bk-msg" class="bk-msg" role="status" aria-live="polite"></p>
</section></div></div>
<script>window.BK=${JSON.stringify({ lang, tz: TZ, business: BUSINESS, service: SERVICE, s })}</script>
${script}`,
    jsonld: [{ '@type': 'WebPage', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/book/`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/book/', priority: 0.6, changefreq: 'yearly', en: page('en'), zh: page('zh') }];
