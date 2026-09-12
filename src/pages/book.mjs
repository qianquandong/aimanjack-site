// /book/ — Jack's own booking page (BOOKING-PLAN.md W1). Static shell + one inline script that talks to /v1/*.
// Same page handles ?id=<booking> for reschedule / cancel (the id is the customer's manage token).
import { SITE, SMS_TEL, SMS_DISPLAY } from '../config.mjs';
import { pageHero, breadcrumb, BUSINESS_REF, T } from '../components.mjs';

const BUSINESS = 'aimanjack', SERVICE = 'demo-call', TZ = 'America/Chicago';

const copy = {
  en: {
    title: 'Book a 15-Minute Demo Call with Jack | AI Man Jack',
    description: 'Pick a time for a 15-minute call with Jack about an AI receptionist for your business. Times are US Central. Change or cancel from your confirmation link.',
    crumb: 'Book a demo', eyebrow: 'Book a demo', h1: 'Book a 15-minute call with Jack.',
    sub: 'Pick a day and a time. You get a link you can use to change or cancel.',
    s: {
      day: 'Pick a day', time: 'Pick a time', you: 'Your details', tz: 'All times are US Central (Dallas).',
      name: 'Your name', phone: 'Mobile number', email: 'Email (optional, for a confirmation)', biz: 'Business name (optional)', submit: 'Confirm booking', working: 'Booking…',
      loading: 'Loading times…', none: `No open times in the next 30 days. Text Jessy at ${SMS_DISPLAY} instead.`,
      doneH: 'You’re booked.', doneP: 'Jack will call {phone} at {time}.', doneLink: 'Save this link to change or cancel:',
      manageH: 'Your appointment', manageP: '{time} · Jack calls {phone}', change: 'Change time', cancel: 'Cancel appointment', changeH: 'Pick a new time',
      confirmMove: 'Move your call to {time}?', confirmCancel: 'Cancel this appointment?', moved: 'Moved to {time}.', cancelled: 'This appointment was cancelled.',
      closed: 'It is too close to the appointment to change it online. Text Jessy at ' + SMS_DISPLAY + '.',
      taken: 'That time was just taken. Pick another one.', yes: 'Yes, do it', no: 'Go back', moreDays: 'More dates', moreTimes: 'More times', notFound: 'We could not find that booking.',
      error: `Something went wrong. Try again, or text Jessy at ${SMS_DISPLAY}.`, bookAnother: 'Book a new time',
    },
  },
  zh: {
    title: '预约和 Jack 的 15 分钟演示通话 | AI Man Jack',
    description: '选一个时间，和 Jack 通 15 分钟电话，聊聊 AI 前台怎么用到你的店。时间为美国中部时间，确认链接里可以改期或取消。',
    crumb: '预约演示', eyebrow: '预约演示', h1: '约 Jack 通 15 分钟电话。',
    sub: '选好日期和时间，会给你一个链接，改期、取消都从那里进。',
    s: {
      day: '选日期', time: '选时间', you: '你的信息', tz: '时间均为美国中部时间（达拉斯）。',
      name: '姓名', phone: '手机号', email: '邮箱（选填，用来收确认邮件）', biz: '店名（选填）', submit: '确认预约', working: '正在预约…',
      loading: '正在加载时间…', none: `接下来 30 天没有空档，给 Jessy 发短信吧：${SMS_DISPLAY}`,
      doneH: '约好了。', doneP: 'Jack 会在 {time} 打 {phone}。', doneLink: '改期或取消，用这个链接：',
      manageH: '你的预约', manageP: '{time} · Jack 打 {phone}', change: '改时间', cancel: '取消预约', changeH: '选个新时间',
      confirmMove: '把通话改到 {time}？', confirmCancel: '确定取消这个预约？', moved: '已改到 {time}。', cancelled: '这个预约已经取消了。',
      closed: '离通话时间太近，网上改不了了。给 Jessy 发短信：' + SMS_DISPLAY,
      taken: '这个时间刚被约走了，换一个吧。', yes: '确定', no: '返回', moreDays: '更多日期', moreTimes: '更多时间', notFound: '没找到这个预约。',
      error: `出了点问题。再试一次，或者给 Jessy 发短信：${SMS_DISPLAY}`, bookAnother: '重新约一个时间',
    },
  },
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
 api('POST','/v1/bookings',{business:S.business,service:S.service,start_at:picked.start_at,staff:picked.staff_id,customer_name:$('bk-name').value,customer_phone:$('bk-phone').value,customer_email:$('bk-email').value||undefined,note:$('bk-biz').value||undefined})
 .then(function(b){track('book_demo_submit');done(b,S.s.doneH,t('doneP',{phone:ph(b.customer_phone),time:fmtFull.format(new Date(b.start_at))}))})
 .catch(function(e){msg(errText(e&&e.error));if(e&&e.error==='slot_unavailable')loadTimes()}).then(function(){btn.disabled=false;btn.textContent=S.s.submit})});
function move(s){var when=fmtFull.format(new Date(s.start_at));ask(t('confirmMove',{time:when}),function(){msg('');
 api('PATCH','/v1/bookings/'+bookingId,{start_at:s.start_at,staff:s.staff_id}).then(function(b){track('book_demo_reschedule');done(b,t('moved',{time:when}),t('manageP',{time:when,phone:ph(b.customer_phone)}))})
 .catch(function(e){msg(errText(e&&e.error));if(e&&e.error==='slot_unavailable')loadTimes()})})}
function manage(){api('GET','/v1/bookings/'+bookingId).then(function(b){booking=b;var when=fmtFull.format(new Date(b.start_at));
 if(b.status!=='confirmed'){done(b,S.s.cancelled,when);return}
 show('bk-manage',true);$('bk-manage-p').textContent=t('manageP',{time:when,phone:ph(b.customer_phone)});
 if(!b.changeable){msg(S.s.closed);$('bk-change').disabled=true;$('bk-cancel').disabled=true}
 $('bk-change').addEventListener('click',function(){$('bk-pick-h').textContent=S.s.changeH;loadTimes();$('bk-pick').scrollIntoView({behavior:'smooth'})});
 $('bk-cancel').addEventListener('click',function(){ask(S.s.confirmCancel,function(){
  api('DELETE','/v1/bookings/'+bookingId).then(function(b){track('book_demo_cancel');done(b,S.s.cancelled,when)}).catch(function(e){msg(errText(e&&e.error))})})})
 }).catch(function(e){msg(errText(e&&e.error))})}
function track(n){if(window.dataLayer)(function(){window.dataLayer.push(arguments)})('event',n,{page:location.pathname,language:S.lang})}
bookingId?manage():loadTimes();
})();
</script>`;

const page = (lang) => {
  const c = copy[lang], s = c.s, bc = breadcrumb(lang, [[c.crumb, '/book/']]);
  return {
    title: c.title, description: c.description, view: 'book_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: c.eyebrow, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap narrow bk" data-nosnippet>
<p class="bk-tz">${s.tz}</p>
<div id="bk-manage" class="bk-card" hidden><h2 class="h3">${s.manageH}</h2><p id="bk-manage-p"></p><div class="cta-row" style="margin-top:16px"><button type="button" class="btn btn-secondary" id="bk-change">${s.change}</button><button type="button" class="btn btn-ghost" id="bk-cancel">${s.cancel}</button></div></div>
<div id="bk-pick" hidden><h2 class="bk-h" id="bk-pick-h">${s.day}</h2><div id="bk-days" class="bk-chips"></div></div>
<div id="bk-time" hidden><h2 class="bk-h">${s.time}</h2><div id="bk-slots" class="bk-chips"></div></div>
<form id="bk-form" class="bk-form" hidden autocomplete="on"><h2 class="bk-h">${s.you}</h2>
<label>${s.name}<input id="bk-name" name="name" autocomplete="name" required maxlength="80"></label>
<label>${s.phone}<input id="bk-phone" name="tel" type="tel" autocomplete="tel" required inputmode="tel" minlength="10"></label>
<label>${s.email}<input id="bk-email" name="email" type="email" autocomplete="email" maxlength="120"></label>
<label>${s.biz}<input id="bk-biz" name="organization" autocomplete="organization" maxlength="120"></label>
<button class="btn btn-primary" id="bk-submit" type="submit">${s.submit}</button></form>
<div id="bk-done" class="bk-card bk-done" hidden><h2 class="h3" id="bk-done-h"></h2><p id="bk-done-p"></p><p id="bk-done-linkwrap">${s.doneLink}<br><a id="bk-done-link" href="/book/"></a></p><p><a class="btn btn-secondary btn-sm" href="${lang === 'zh' ? '/zh/book/' : '/book/'}">${s.bookAnother}</a></p></div>
<div id="bk-ask" class="bk-card bk-ask" hidden><p id="bk-ask-p"></p><div class="cta-row" style="margin-top:12px"><button type="button" class="btn btn-primary btn-sm" id="bk-yes">${s.yes}</button><button type="button" class="btn btn-ghost btn-sm" id="bk-no">${s.no}</button></div></div>
<p id="bk-msg" class="bk-msg" role="status" aria-live="polite"></p>
<p class="bk-alt">${lang === 'zh' ? '不想选时间？' : 'Rather not pick a time?'} <a href="sms:${SMS_TEL}" data-event="sms_click" data-pos="book">${T[lang].cta.text} · ${SMS_DISPLAY}</a></p>
</section>
<script>window.BK=${JSON.stringify({ lang, tz: TZ, business: BUSINESS, service: SERVICE, s })}</script>
${script}`,
    jsonld: [{ '@type': 'WebPage', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/book/`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/book/', priority: 0.6, changefreq: 'yearly', en: page('en'), zh: page('zh') }];
