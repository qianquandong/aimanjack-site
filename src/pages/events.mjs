// /events/ hub + one page per community session (2026-10-17). Like Section's /events/ pages: every session Jack ran or spoke at
// gets a page on our own domain instead of living only on Luma. Rows come from src/content/events.mjs, detail from
// src/content/event-pages.mjs. JSON-LD: Event (past) + BreadcrumbList; the hub is a CollectionPage with an ItemList.
// No prices, no outcome claims; sign-up counts are Luma registrations and are labelled as such.
import { SITE } from '../config.mjs';
import { ctaBand, L } from '../layout.mjs';
import { breadcrumb, BUSINESS_REF } from '../components.mjs';
import { person } from '../schema.mjs';
import { EVENTS, VENUES, EVENT_STATS, LUMA_PROFILE, EVENTS_CHECKED_ON, eventDate } from '../content/events.mjs';
import { EVENT_PAGES } from '../content/event-pages.mjs';

const HUB = '/events/';
const rows = EVENTS.filter((e) => EVENT_PAGES[e.date]).map((e) => ({ ...e, ...EVENT_PAGES[e.date], path: `${HUB}${EVENT_PAGES[e.date].slug}/` }));
const img = (f) => `/img/events/${f}.webp`;

const T = {
  en: {
    crumb: 'Events', hubTitle: 'Dallas AI Community Sessions and Events | AI Man Jack',
    hubDesc: `Every AI session Jack Qian hosted or spoke at in Dallas and Plano in 2026: dates, venues, Luma sign-ups, agendas and photos. ${EVENT_STATS.hosted} sessions, ${EVENT_STATS.registrations} sign-ups.`,
    hubK: 'Community sessions', hubH: 'AI sessions in Dallas and Plano, one page each',
    hubP: `Jack Qian runs free community AI sessions in Dallas and Plano and is invited to speak by local organisations. Each one below has its own page: the agenda as it was published, the venue, the sign-up count on Luma and photos from the room. ${EVENT_STATS.hosted} sessions hosted in 2026, ${EVENT_STATS.registrations} sign-ups (checked ${EVENTS_CHECKED_ON}).`,
    nextOnLuma: 'Next session and sign-up on Luma ↗', companyK: 'For companies', companyH: 'Want this for your team?',
    companyP: 'The community sessions use the same method as company training: one real task, an approved tool, a workflow you can check. Company sessions run at your office in Dallas–Fort Worth or live online.',
    seeDallas: 'Corporate AI training in Dallas–Fort Worth →',
    signups: (n) => `${n} sign-ups on Luma`, invited: 'Invited speaker', online: 'Online', read: 'Read more →',
    when: 'When', where: 'Where', format: 'Format', language: 'Language', host: 'Hosted by', reg: 'Sign-ups',
    inPerson: 'In person', live: 'Live online', regNote: `as shown on Luma, checked ${EVENTS_CHECKED_ON}; attendance is usually a little lower`,
    byJack: 'Jack Qian (AI Man Jack)', byOrg: (o) => `${o}; Jack Qian was the invited featured speaker`, withGuest: (g) => `Jack Qian, with guest ${g}`,
    lumaPage: 'Event page on Luma ↗', agendaH: 'What was on the agenda', notesK: 'Talk notes, on Jack’s own site Real Agent Use Cases:', photosH: 'Photos', afterH: 'Why it matters for teams',
    nextTraining: 'Related training:', prev: '← Earlier session', next: 'Later session →', all: 'All sessions',
    eventSuffix: 'Dallas AI session | AI Man Jack', freeNote: 'Free community session.',
  },
  zh: {
    crumb: '活动', hubTitle: '达拉斯 AI 社区活动记录 | AI Man Jack',
    hubDesc: `Jack Qian 2026 年在 Dallas 和 Plano 主办或受邀主讲的每一场 AI 活动：日期、场地、Luma 报名人数、议程和现场照片。主办 ${EVENT_STATS.hosted} 场，${EVENT_STATS.registrations} 人报名。`,
    hubK: '社区活动', hubH: '在 Dallas 和 Plano 办过的 AI 活动，每场一页',
    hubP: `Jack Qian 在 Dallas 和 Plano 办免费的社区 AI 活动，也受本地机构邀请主讲。下面每一场都有单独一页：当时公布的议程、场地、Luma 上的报名人数和现场照片。2026 年主办 ${EVENT_STATS.hosted} 场，报名 ${EVENT_STATS.registrations} 人（核对于 ${EVENTS_CHECKED_ON}）。`,
    nextOnLuma: '下一场活动和报名，见 Luma ↗', companyK: '企业培训', companyH: '想给团队也上一次？',
    companyP: '社区活动和企业培训用的是同一套方法：一项真实任务、一个批准过的工具、一条能核验的工作流。企业课程可以到贵公司现场（达拉斯—沃斯堡），也可以线上直播。',
    seeDallas: '达拉斯—沃斯堡企业 AI 培训 →',
    signups: (n) => `Luma 报名 ${n} 人`, invited: '受邀主讲', online: '线上', read: '查看详情 →',
    when: '时间', where: '地点', format: '形式', language: '语言', host: '主办', reg: '报名',
    inPerson: '线下', live: '线上直播', regNote: `Luma 显示的报名人数，核对于 ${EVENTS_CHECKED_ON}；实际到场通常略少`,
    byJack: 'Jack Qian（AI Man Jack）', byOrg: (o) => `${o}；Jack Qian 受邀担任特邀讲者`, withGuest: (g) => `Jack Qian，嘉宾 ${g}`,
    lumaPage: 'Luma 活动页 ↗', agendaH: '议程', notesK: '讲稿笔记（Jack 自己的网站 Real Agent Use Cases）：', photosH: '现场照片', afterH: '对企业团队的意义',
    nextTraining: '相关培训：', prev: '← 上一场', next: '下一场 →', all: '全部活动',
    eventSuffix: '达拉斯 AI 活动 | AI Man Jack', freeNote: '免费社区活动。',
  },
};

// A venue whose name is already its street address (the LBJ room) is not repeated.
const placeText = (e, lang) => e.place ? [e.place.name, /^\d/.test(e.place.name) ? '' : e.place.street, e.place.city, e.place.zip && `TX ${e.place.zip}`].filter(Boolean).join(', ') : T[lang].live;
const cityOf = (e, lang) => (e.mode === 'online' ? T[lang].online : VENUES[e.venue].short[lang]);

const hub = (lang) => {
  const t = T[lang], url = `${SITE}${L(lang, HUB)}`;
  const bc = breadcrumb(lang, [[t.crumb, HUB]]);
  const cards = rows.map((e) => { const c = e[lang], ph = e.photos[0];
    return `<a class="card event-card" href="${L(lang, e.path)}" style="text-decoration:none;color:inherit;display:flex;flex-direction:column;gap:12px;padding:0;overflow:hidden">
<img src="${img(ph[0])}" width="${ph[1]}" height="${ph[2]}" loading="lazy" decoding="async" alt="${ph[3][lang]}" style="width:100%;aspect-ratio:16/10;object-fit:cover">
<div style="padding:0 24px 24px;display:flex;flex-direction:column;gap:8px"><span class="eyebrow"><time datetime="${e.date}">${eventDate(e.date, lang)}</time> · ${cityOf(e, lang)}</span><h3>${e[lang + '_title']}</h3><p class="muted" style="font-size:15px">${e.role === 'speaker' ? t.invited : t.signups(e.registrations)}</p><span class="more">${t.read}</span></div></a>`; }).join('');
  return {
    title: t.hubTitle, description: t.hubDesc, view: 'events_hub_view', bodyClass: 'events-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${t.hubK}</p><h1 class="brand-hero-title" style="max-width:1000px">${t.hubH}</h1><p class="lead" style="max-width:780px">${t.hubP}</p>
<div class="cta-row"><a class="btn btn-secondary" href="${LUMA_PROFILE}" target="_blank" rel="noopener" data-event="luma_click" data-pos="events-hub">${t.nextOnLuma}</a></div></div></section>
<section class="sec tight" id="sessions"><div class="wrap"><div class="g3">${cards}</div></div></section>
<section class="sec tight"><div class="wrap"><div class="big-card oakc"><div class="eyebrow">${t.companyK}</div><h2>${t.companyH}</h2><p>${t.companyP}</p><a class="more" href="${L(lang, '/ai-training/dallas/')}">${t.seeDallas}</a></div></div></section>
${ctaBand(lang, { pos: 'events-hub' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${url}#page`, name: t.hubTitle, url, about: { '@id': `${SITE}/#business` },
      mainEntity: { '@type': 'ItemList', itemListElement: rows.map((e, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE}${L(lang, e.path)}`, name: e[lang + '_title'] })) } }, BUSINESS_REF, bc.ld],
  };
};

const page = (e, i, lang) => {
  const t = T[lang], c = e[lang], url = `${SITE}${L(lang, e.path)}`, name = lang === 'zh' ? e.zh_title : e.en_title;
  const bc = breadcrumb(lang, [[t.crumb, HUB], [eventDate(e.date, lang), e.path]]);
  const prev = rows[i - 1], next = rows[i + 1];
  const host = e.role === 'speaker' ? t.byOrg(e.organizer) : e.guest ? t.withGuest(e.guest) : t.byJack;
  const facts = [[t.when, `<time datetime="${e.start}">${eventDate(e.date, lang)}</time> · ${e.time[lang]}`], [t.where, placeText(e, lang)], [t.format, e.mode === 'online' ? t.live : t.inPerson],
    ...(e.lang ? [[t.language, e.lang[lang]]] : []), [t.host, host], ...(e.role === 'host' ? [[t.reg, `${e.registrations} <span class="muted">(${t.regNote})</span>`]] : []),
    ...(e.luma ? [['Luma', `<a href="${e.luma}" target="_blank" rel="noopener">${t.lumaPage}</a>`]] : [])];
  const gallery = e.photos.map(([f, w, h, alt], k) => `<figure class="art-fig"><img src="${img(f)}" width="${w}" height="${h}" loading="${k < 2 ? 'eager' : 'lazy'}" decoding="async" alt="${alt[lang]}"><figcaption>${alt[lang]}</figcaption></figure>`).join('');
  const location = e.mode === 'online' ? { '@type': 'VirtualLocation', url: e.luma || LUMA_PROFILE }
    : { '@type': 'Place', name: e.place.name, address: { '@type': 'PostalAddress', ...(e.place.street ? { streetAddress: e.place.street } : {}), ...(e.place.city ? { addressLocality: e.place.city } : {}), addressRegion: 'TX', ...(e.place.zip ? { postalCode: e.place.zip } : {}), addressCountry: 'US' } };
  return {
    title: `${name} | AI Man Jack`, description: c.summary.slice(0, 158), view: 'event_page_view', bodyClass: 'events-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow"><time datetime="${e.date}">${eventDate(e.date, lang)}</time> · ${cityOf(e, lang)} · ${e.role === 'speaker' ? t.invited : t.signups(e.registrations)}</p><h1 class="brand-hero-title" style="max-width:1000px">${name}</h1><p class="lead" style="max-width:780px">${c.summary}${e.role === 'host' ? ` ${t.freeNote}` : ''}</p></div></section>
<section class="sec tight" id="photos"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${t.photosH}</div></div></div><div class="g3">${gallery}</div></div></section>
<section class="sec tight" id="agenda"><div class="wrap g2" style="gap:32px;align-items:start"><div><h2>${t.agendaH}</h2><ul class="ticks arrow" style="margin-top:16px">${c.covered.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>${e.notes ? `<p style="margin-top:16px">${t.notesK} ${e.notes.map((x) => `<a href="${x[lang]}" target="_blank" rel="noopener" data-event="talk_notes_click">${x.label[lang]} ↗</a>`).join(' · ')}</p>` : ''}<h2 style="margin-top:32px">${t.afterH}</h2><p style="margin-top:12px">${c.after}</p><p style="margin-top:12px">${t.nextTraining} <a href="${L(lang, c.next[0])}">${c.next[1]} →</a></p></div>
<div class="big-card"><dl class="kv" style="margin:0">${facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>
<section class="sec tight"><div class="wrap" style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap">${prev ? `<a class="more" href="${L(lang, prev.path)}">${t.prev}</a>` : '<span></span>'}<a class="more" href="${L(lang, HUB)}">${t.all}</a>${next ? `<a class="more" href="${L(lang, next.path)}">${t.next}</a>` : '<span></span>'}</div></section>
${ctaBand(lang, { pos: 'event-page' })}`,
    jsonld: [{ '@type': 'Event', '@id': `${url}#event`, name, url, description: c.summary, startDate: e.start, endDate: e.end, eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: e.mode === 'online' ? 'https://schema.org/OnlineEventAttendanceMode' : 'https://schema.org/OfflineEventAttendanceMode',
      location, image: e.photos.map(([f]) => `${SITE}${img(f)}`), inLanguage: e.lang ? (e.lang.en.includes('English') && !e.lang.en.includes('Chinese') ? 'en' : 'zh') : undefined,
      organizer: e.role === 'speaker' ? { '@type': 'Organization', name: e.organizer } : { '@id': `${SITE}/#business` },
      performer: [{ '@id': `${SITE}/#jack` }, ...(e.guest ? [{ '@type': 'Person', name: e.guest }] : [])],
      ...(e.role === 'host' ? { isAccessibleForFree: true } : {}) }, person(), BUSINESS_REF, bc.ld],
  };
};

// Page titles: the Luma title when it is already a clear name, otherwise a short descriptive one.
const TITLES = {
  '2026-04-02': ['Dallas OpenClaw meetup #1: building AI agents live', 'Dallas OpenClaw 线下聚会 #1：现场搭建 AI Agent'],
  '2026-04-18': ['Dallas AI Hackathon: 37 builders, one afternoon', '4.18 达拉斯 AI 黑客松：37 人，一个下午'],
  '2026-05-17': ['OpenClaw meetup #2: into the world of AI agents', 'OpenClaw 聚会 #2：走进 AI Agent 的世界'],
  '2026-07-18': ['AI workflow automation in practice, session 3', 'AI Workflow Automation 实战分享（第三期）'],
  '2026-07-25': ['DFW IT Association fireside chat: Work Smarter, Think Deeper, Live Better', 'DFW IT Association 炉边谈话：Work Smarter, Think Deeper, Live Better'],
  '2026-08-22': ['Zero to your first small AI project', '零基础也能上手：用 AI 完成你的第一个小项目'],
  '2026-09-16': ['Finding a job in the AI era, with Jason Jia', 'AI 时代，我们怎么找工作？对谈 Jason Jia'],
};
for (const r of rows) { r.en_title = TITLES[r.date][0]; r.zh_title = TITLES[r.date][1]; }

export const EVENT_ROUTES = rows.map((r) => ({ date: r.date, path: r.path }));
export const pages = [
  { path: HUB, priority: 0.7, changefreq: 'monthly', en: hub('en'), zh: hub('zh') },
  ...rows.map((r, i) => ({ path: r.path, priority: 0.6, changefreq: 'yearly', en: page(r, i, 'en'), zh: page(r, i, 'zh') })),
];
