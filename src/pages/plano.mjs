// /ai-training/plano/ (2026-10-18, Jack's request after the SEO/GEO gap review: Teamland ranks with city pages, we had only Dallas).
// A city page is only worth having when the city has its own evidence, so this one is built on the two sessions that actually
// happened in Plano (src/content/events.mjs + event-pages.mjs): the first OpenClaw meetup (Space Karaoke Bar & Cafe, 2026-04-02)
// and the DFW IT Association fireside chat (Schimelpfenig Library, 2026-07-25). Fort Worth is deliberately not built yet: no session
// or client there, so the page would be a doorway. No price, no review markup, no "Dallas–Fort Worth" in the title or H1 (the Dallas
// page owns that term). Quick quote with tool=general; the page path is accepted by QUICK_PAGE.
import { SITE, GBP_URL, PROOF } from '../config.mjs';
import { planBtn, ctaBand, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { business, person, faqPage } from '../schema.mjs';
import { EVENTS, eventDate } from '../content/events.mjs';
import { EVENT_PAGES } from '../content/event-pages.mjs';
import { trainingFormatTable } from '../training-buyers.mjs';
import { quickQuote } from '../quick-quote.mjs';
import { REVIEWS } from './dallas.mjs';
import { NONPROFIT_PATH, deptPath } from './department-training.mjs';

export const PLANO_PATH = '/ai-training/plano/';
const PLANO_EVENTS = EVENTS.filter((e) => EVENT_PAGES[e.date]?.place?.city === 'Plano');
const NEARBY = ['Plano', 'Richardson', 'Allen', 'Frisco', 'McKinney', 'Murphy', 'Wylie', 'Carrollton'];

const C = {
  en: {
    title: 'Corporate AI Training in Plano, TX | AI Man Jack',
    description: 'Hands-on AI training for Plano teams, onsite at your office or live online, in English or Chinese. Built on your own work and approved tools. Get a quote by email.',
    crumb: 'Plano',
    eyebrow: 'Plano · Richardson · Allen · Frisco · McKinney · Onsite or live online · English or Chinese',
    h1: 'AI training for Plano teams, at your office or online',
    sub: 'Jack Qian has taught in Plano twice this year: a community meetup on Spring Creek Parkway and an invited talk for the DFW IT Association at Schimelpfenig Library. Company training works the same way: your team brings a recurring task, builds an AI workflow on it with the tool your company approved, and learns what to check before the output is used.',
    quote: 'Get a quote', compare: 'Compare training formats',
    evK: 'Taught in Plano', evH: 'Two sessions in Plano in 2026',
    evP: 'Both are real events with their own pages. The meetup had 40 sign-ups on Luma; at the fireside chat Jack was the speaker invited by the DFW IT Association.',
    evRole: { host: (n) => `Hosted · ${n} sign-ups on Luma`, speaker: 'Invited featured speaker' },
    evMore: 'Event page →',
    photoAlt: ['Jack Qian speaking at the DFW IT Association fireside chat at Schimelpfenig Library, Plano, July 25, 2026', 'Jack Qian presenting at the first Dallas OpenClaw meetup in Plano, April 2, 2026'],
    onsiteK: 'Onsite in Plano', onsiteH: 'What an onsite session at your Plano office needs',
    onsite: ['A room with a screen or projector and reliable Wi-Fi.', 'A laptop per attendee with access to the AI tool your company approved: ChatGPT, Microsoft Copilot, Claude or Gemini.', 'Two or three recurring tasks per person, with synthetic or redacted practice material.', 'One person who decides which data may go into the tool. We write that rule down in the first session.'],
    areaK: 'Where', areaH: 'Plano and the nearby cities',
    areaP: `Onsite at offices in ${NEARBY.join(', ')} and the rest of the metroplex. Teams split between Plano and other locations can join live online in the same session.`,
    fmtK: 'Formats', fmtH: 'Three ways to run it',
    revK: 'Reviewed on Google', revH: 'What attendees say', revMore: `Read all ${PROOF.reviews} reviews on Google ↗`,
    linksH: 'Plan it by team or sector',
    faqK: 'Common questions', faqH: 'AI training in Plano, answered',
    faq: [
      ['Do you come to offices in Plano?', `Yes. Onsite training runs at your office in Plano or nearby cities such as ${NEARBY.slice(1, 6).join(', ')}. The full onsite day, the 90-minute workshop and the four-session program can all be scheduled in Plano; the workshop and the program can also run live online.`],
      ['Have you taught in Plano before?', 'Yes, twice in 2026: the first Dallas OpenClaw meetup at Space Karaoke Bar & Cafe on April 2, and an invited fireside chat for the DFW IT Association at Schimelpfenig Library on July 25. Both have event pages on this site.'],
      ['Can the session run in Chinese?', 'Yes. Sessions run in English or Chinese, whichever the room works in, and the materials come in both. Several of the 2026 community sessions ran in Chinese.'],
      ['Which AI tools do you teach?', 'The tools your company has approved: ChatGPT, Microsoft Copilot, Claude or Gemini. If none is approved yet, we agree on one before the first session. The first thing covered is which data may go into the tool.'],
      ['Some of our team works remotely. Can they join?', 'Yes. Remote attendees can join the same session over video, and the four-session program and the 90-minute workshop can run fully online.'],
      ['How do we get a price?', 'Send the number of people, the format you are considering and your preferred dates with the form below, or book a 20-minute call. Jack replies by email within one business day; the written quote follows once the details are clear.'],
    ],
    ld: { name: 'Corporate AI Training in Plano, TX', desc: 'Hands-on AI training for business teams in Plano, Texas: onsite at the company’s office or live online, taught by Jack Qian in English or Chinese, on the team’s own tasks and approved AI tools. Priced by written quote.' },
  },
  zh: {
    title: 'Plano 企业 AI 培训 | AI Man Jack',
    description: '为 Plano 团队提供 AI 实操培训，可到公司现场或线上直播，中英文授课。围绕团队自己的工作和已批准的工具来练。留邮箱获取报价。',
    crumb: 'Plano',
    eyebrow: 'Plano · Richardson · Allen · Frisco · McKinney · 上门或线上直播 · 中英文授课',
    h1: 'Plano 团队 AI 培训，可到公司现场或在线授课',
    sub: 'Jack Qian 今年在 Plano 讲过两场：一场是 Spring Creek Parkway 上的社区聚会，另一场是受 DFW IT Association 邀请，在 Schimelpfenig 图书馆进行的分享。企业培训也是同样的方式：团队带一项重复性任务来，用公司批准的工具搭建 AI 工作流，并学会在使用输出前该核对什么。',
    quote: '获取报价', compare: '比较培训形式',
    evK: '在 Plano 讲过', evH: '2026 年在 Plano 的两场活动',
    evP: '两场都是真实活动，各有自己的页面。聚会在 Luma 上有 40 人报名；炉边谈话是 Jack 受 DFW IT Association 邀请主讲。',
    evRole: { host: (n) => `主办 · Luma 报名 ${n} 人`, speaker: '受邀主讲' },
    evMore: '活动页面 →',
    photoAlt: ['2026 年 7 月 25 日，Jack Qian 在 Plano 的 Schimelpfenig 图书馆为 DFW IT Association 炉边谈话主讲', '2026 年 4 月 2 日，Jack Qian 在 Plano 第一次 Dallas OpenClaw 聚会上分享'],
    onsiteK: 'Plano 上门', onsiteH: '到 Plano 公司现场上课需要准备什么',
    onsite: ['一间有屏幕或投影、Wi-Fi 稳定的会议室。', '每位学员一台笔记本电脑，能访问公司已批准的 AI 工具：ChatGPT、Microsoft Copilot、Claude 或 Gemini。', '每人两三项重复性任务，配上模拟或脱敏的练习材料。', '一位能决定哪些数据可以放进工具的人。这条规则在第一节课就写下来。'],
    areaK: '地点', areaH: 'Plano 及周边城市',
    areaP: `可到 ${NEARBY.join('、')} 及都会区其他城市的公司现场。团队一部分在 Plano、一部分在别处的，可以在同一节课线上加入。`,
    fmtK: '形式', fmtH: '三种上课方式',
    revK: 'Google 评价', revH: '学员怎么说', revMore: `查看 Google 上全部 ${PROOF.reviews} 条评价 ↗`,
    linksH: '按团队或行业安排',
    faqK: '常见问题', faqH: '关于 Plano 的 AI 培训，直接回答',
    faq: [
      ['可以到 Plano 的公司上门吗？', `可以。上门培训可以到 Plano 或附近城市（例如 ${NEARBY.slice(1, 6).join('、')}）的公司现场。全天上门、90 分钟工作坊和四次课程项目都可以在 Plano 安排；工作坊和课程项目也可以线上直播。`],
      ['以前在 Plano 讲过吗？', '讲过，2026 年两次：4 月 2 日在 Space Karaoke Bar & Cafe 的第一次 Dallas OpenClaw 聚会，以及 7 月 25 日在 Schimelpfenig 图书馆、受 DFW IT Association 邀请的炉边谈话。两场在本站都有活动页面。'],
      ['可以用中文上课吗？', '可以。用团队最顺手的语言，中文或英文，资料提供两种语言。2026 年有几场社区活动就是用中文讲的。'],
      ['教哪些 AI 工具？', '公司已经批准的工具：ChatGPT、Microsoft Copilot、Claude 或 Gemini。还没批准的，第一节课之前先商定一个。最先讲的是哪些数据可以放进工具。'],
      ['团队有人远程办公，能一起上吗？', '可以。远程同事可以通过视频加入同一节课；四次课程项目和 90 分钟工作坊也可以完全线上进行。'],
      ['怎么拿到报价？', '用下面的表单告诉我们人数、考虑的形式和希望的日期，或预约 20 分钟通话。Jack 会在 1 个工作日内邮件回复；确认需求后再给出书面报价。'],
    ],
    ld: { name: 'Plano 企业 AI 培训', desc: '为德州 Plano 的企业团队提供 AI 实操培训：到公司现场或线上直播，由 Jack Qian 中英文授课，围绕团队自己的任务和已批准的 AI 工具。按书面报价。' },
  },
};

const page = (lang) => {
  const c = C[lang], zh = lang === 'zh', url = `${SITE}${L(lang, PLANO_PATH)}`;
  const bc = breadcrumb(lang, [[zh ? 'AI 培训' : 'AI training', '/ai-training/'], [zh ? '达拉斯—沃斯堡' : 'Dallas–Fort Worth', '/ai-training/dallas/'], [c.crumb, PLANO_PATH]]);
  const head = (k, h, p, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div>${more || ''}</div>`;
  const photos = [['dfwit-fireside-2026-07-25-jack-podium', 1600, 1066], ['dallas-openclaw-2026-04-02-talk', 1600, 1276]];
  const events = PLANO_EVENTS.map((e) => { const p = EVENT_PAGES[e.date];
    return `<div class="card"><div class="eyebrow"><time datetime="${e.date}">${eventDate(e.date, lang)}</time></div><h3>${e[lang]}</h3><p>${p.place.name}, ${p.place.street}, Plano, TX ${p.place.zip}</p><p class="muted">${e.role === 'speaker' ? c.evRole.speaker : c.evRole.host(e.registrations)}${e.org ? ` · ${e.org}` : ''}</p><a class="more" href="${L(lang, `/events/${p.slug}/`)}">${c.evMore}</a></div>`; }).join('');
  const links = [[deptPath('sales'), zh ? '销售团队 AI 培训' : 'AI training for sales teams'], [deptPath('marketing'), zh ? '市场团队 AI 培训' : 'AI training for marketing teams'], [deptPath('operations'), zh ? '运营团队 AI 培训' : 'AI training for operations teams'], [deptPath('leadership'), zh ? '管理层 AI 培训' : 'AI training for leadership teams'], [NONPROFIT_PATH, zh ? '非营利机构 AI 培训' : 'AI training for nonprofits'], ['/ai-training/dallas/', zh ? '达拉斯—沃斯堡企业 AI 培训' : 'Corporate AI training in Dallas–Fort Worth']];
  return {
    title: c.title, description: c.description, view: 'city_page_view', bodyClass: 'training-page city-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${c.eyebrow}</p><h1 class="brand-hero-title" style="max-width:1080px">${c.h1}</h1><p class="lead" style="max-width:780px">${c.sub}</p>
<div class="cta-row">${planBtn(lang, { pos: 'plano-hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="#quote" data-event="quote_cta_click" data-pos="plano-hero">${c.quote}</a></div></div></section>

<section class="sec tight" id="plano-sessions"><div class="wrap">${head(c.evK, c.evH, c.evP)}
<div class="g2">${events}</div>
<div class="g2" style="margin-top:24px">${photos.map(([f, w, h], i) => `<figure class="art-fig"><img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="${i ? 'lazy' : 'eager'}" decoding="async" alt="${c.photoAlt[i]}"><figcaption>${c.photoAlt[i]}</figcaption></figure>`).join('')}</div></div></section>

<section class="sec tight" id="onsite"><div class="wrap g2"><div class="oak"><div class="eyebrow">${c.onsiteK}</div><h2 class="h2-sm">${c.onsiteH}</h2><ul class="ticks">${c.onsite.map((x) => `<li><span>${x}</span></li>`).join('')}</ul></div>
<div class="oak"><div class="eyebrow">${c.areaK}</div><h2 class="h2-sm">${c.areaH}</h2><p>${c.areaP}</p></div></div></section>

<section class="sec tight" id="formats"><div class="wrap">${head(c.fmtK, c.fmtH)}${trainingFormatTable(lang)}</div></section>

<section class="sec tight" id="testimonials"><div class="wrap">${head(c.revK, c.revH, '', `<a class="more" href="${GBP_URL}" target="_blank" rel="noopener">${c.revMore}</a>`)}
<div class="quote-grid">${[1, 3, 4].map((i) => REVIEWS[lang][i]).map(([name, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${name}</b> <span>· ${REVIEWS.by[lang]}</span></figcaption></figure>`).join('')}</div></div></section>

<section class="sec tight" id="plan-by-team"><div class="wrap"><h2 class="h2-sm">${c.linksH}</h2><p>${links.map(([p, t]) => `<a href="${L(lang, p)}">${t}</a>`).join(zh ? '、' : ' · ')}</p></div></section>

<section class="sec" id="faq"><div class="wrap g12"><div style="grid-column:span 4;display:flex;flex-direction:column;gap:16px"><div class="eyebrow">${c.faqK}</div><h2 style="font-size:clamp(32px,3.6vw,52px)">${c.faqH}</h2></div>
<div class="faq" style="grid-column:6 / span 7">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>
${quickQuote(lang, { tool: 'general', path: PLANO_PATH })}
${ctaBand(lang, { pos: 'plano-final' })}`,
    jsonld: [
      business(lang), person(),
      { '@type': 'Service', '@id': `${url}#service`, name: c.ld.name, serviceType: zh ? '企业 AI 培训' : 'Corporate AI training', description: c.ld.desc, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'],
        areaServed: NEARBY.map((n) => ({ '@type': 'City', name: n, containedInPlace: { '@id': `${SITE}/#dfw` } })) },
      ...PLANO_EVENTS.map((e) => ({ '@type': 'Place', '@id': `${url}#venue-${e.date}`, name: EVENT_PAGES[e.date].place.name,
        address: { '@type': 'PostalAddress', streetAddress: EVENT_PAGES[e.date].place.street, addressLocality: 'Plano', addressRegion: 'TX', postalCode: EVENT_PAGES[e.date].place.zip, addressCountry: 'US' } })),
      faqPage(c.faq, `${url}#faq`), bc.ld,
    ],
  };
};

export const pages = [{ path: PLANO_PATH, priority: 0.8, changefreq: 'monthly', en: page('en'), zh: page('zh') }];
