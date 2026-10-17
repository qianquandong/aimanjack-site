// /book/ — booking page. Since 2026-10-17 the calendar is Cal.com (cal.com/aimanjack/ai-workflow-call, synced to Jack's
// Outlook calendar): the self-built /v1 booking widget never received a single web booking (Supabase booking.bookings
// held only phone/SMS/test rows), and Jack could not rely on its notifications. Cal.com sends the confirmations and the
// reschedule/cancel links. The /book/ URL stays, so every "Book a call" button on the site and outside keeps working.
// The /v1 booking API and the old ?id= manage links are no longer linked from here.
import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY } from '../config.mjs';
import { breadcrumb, BUSINESS_REF } from '../components.mjs';
import { calBookingTrackingScript } from '../cal-booking-tracking.mjs';

export const CAL_URL = 'https://cal.com/aimanjack/ai-workflow-call';

const copy = {
  en: {
    title: 'Book a 20-Minute Workflow Call About AI Training | AI Man Jack',
    description: 'Pick a time for a 20-minute call with Jack. Bring one task and get a recommendation on which workflows to start with and how the 4-session program would fit. Times are US Central. Change or cancel from your confirmation link.',
    crumb: 'Book a call', eyebrow: 'Book a call · 20 minutes · free', h1: 'Bring one task. Let’s see where AI can actually help.',
    sub: 'Tell me what you or your team does every week. I’ll recommend which workflows to start with and how the 4-session program would fit your business or team. I’ll call you at the time you pick.',
    tz: 'Times show in your own time zone. The confirmation email has links to change or cancel.',
    frame: 'Booking calendar for a 20-minute call with Jack Qian', open: 'Calendar not loading? Book on Cal.com →',
  },
  zh: {
    title: '预约 20 分钟工作流咨询，规划你的 AI 培训 | AI Man Jack',
    description: '选择一个时间，与 Jack 进行 20 分钟通话。带上一项任务，Jack 会建议先从哪几条工作流开始，以及四次课程项目怎么安排最合适。时间均为美国中部时间，可通过确认链接改期或取消。',
    crumb: '预约通话', eyebrow: '预约通话 · 20 分钟 · 免费', h1: '带一项任务来，<br>看看 AI 到底能帮上什么。',
    sub: '说说你或团队每周都在做什么，我会建议先从哪几条工作流开始，以及四次课程项目怎么安排最适合你的企业或团队。到了约定时间，我会给你打电话。',
    tz: '时间按你所在的时区显示。确认邮件里有改期和取消的链接。',
    frame: '预约与 Jack Qian 的 20 分钟通话', open: '日历加载不出来？到 Cal.com 预约 →',
  },
};

// Left column of the page (design: Book / ZH-Book).
const INFO = {
  en: { top: '20-minute call with Jack', steps: [['On the call:', 'what you or your team does every week, which tools you already use, and where work keeps repeating.'], ['After the call:', 'Jack reviews your notes personally and emails a recommended plan (who should attend and which workflows to start with) and a written price.'], ['Then:', 'live sessions on your real work, remote anywhere in the U.S. or onsite in Dallas–Fort Worth.']], alt: ['Rather text? Send <strong>TRAINING</strong> to', ', or email', '.'] },
  zh: { top: '与 Jack 的 20 分钟通话', steps: [['通话中：', '了解你或团队每周的工作、已经在用的工具，以及哪些工作总在重复。'], ['通话之后：', 'Jack 会亲自整理，并通过邮件发送推荐方案（谁来参加、从哪几条工作流开始）和书面报价。'], ['之后：', '围绕你的真实工作实时授课，全美远程或在达拉斯—沃斯堡上门。']], alt: ['更习惯短信？发送 <strong>TRAINING</strong> 至', '，或发邮件至', '。'] },
};

const page = (lang) => {
  const c = copy[lang], info = INFO[lang], bc = breadcrumb(lang, [[c.crumb, '/book/']]);
  const embed = `${CAL_URL}?embed=true&layout=month_view&theme=light`;
  return {
    title: c.title, description: c.description, view: 'booking_start',
    body: `<div class="wrap book-grid"><div class="book-info">${bc.html}<div class="eyebrow">${c.eyebrow}</div><h1 class="sm" style="font-size:clamp(40px,5vw,72px)">${c.h1}</h1><p class="lead">${c.sub}</p>
<ol class="book-steps">${info.steps.map(([b, t], i) => `<li><span class="n">0${i + 1}</span><span><strong>${b}</strong> <span>${t}</span></span></li>`).join('')}</ol>
<div class="book-alt"><img src="/img/jack-portrait-256.webp" width="256" height="256" alt="Jack Qian"><span>${info.alt[0]} <a href="sms:${SMS_TEL}?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="book">${SMS_DISPLAY}</a>${info.alt[1]} <a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="book">${EMAIL}</a>${info.alt[2]}</span></div></div>
<div class="book-form"><section class="bk" data-nosnippet>
<div class="bk-top"><b>${info.top}</b><span>${c.tz}</span></div>
<iframe id="cal-booking-frame" src="${embed}" title="${c.frame}" loading="lazy" style="width:100%;min-height:720px;border:0;border-radius:16px;background:#fff"></iframe>
<p class="bk-msg"><a id="cal-booking-link" href="${CAL_URL}" target="_blank" rel="noopener" data-event="booking_calcom_click" data-pos="book">${c.open}</a></p>
</section></div></div>${calBookingTrackingScript}`,
    jsonld: [{ '@type': 'WebPage', '@id': `${SITE}${lang === 'zh' ? '/zh' : ''}/book/`, name: c.title, about: { '@id': `${SITE}/#business` } }, BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/book/', priority: 0.6, changefreq: 'yearly', en: page('en'), zh: page('zh') }];
