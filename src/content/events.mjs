// Community AI sessions Jack hosted or spoke at in Dallas–Fort Worth in 2026. Source: Jack's Luma account (luma.com/user/usr-FlERJUF6Mcrie58),
// registrations as shown there on 2026-10-13, plus the DFW IT Association poster for the July 25 talk. Add a row when a session happens;
// the Dallas page, its JSON-LD and the proof numbers all read from here. Registrations are sign-ups, not headcount — say so wherever shown.
export const LUMA_PROFILE = 'https://luma.com/user/usr-FlERJUF6Mcrie58';
export const EVENTS_CHECKED_ON = '2026-10-13';

export const VENUES = {
  lbj: { en: '2711 LBJ Freeway, Suite 136A, Dallas', zh: 'Dallas，2711 LBJ Freeway #136A', short: { en: 'Dallas (LBJ Fwy)', zh: 'Dallas（LBJ Fwy）' },
    address: { '@type': 'PostalAddress', streetAddress: '2711 Lyndon B Johnson Fwy #136A', addressLocality: 'Dallas', addressRegion: 'TX', postalCode: '75234', addressCountry: 'US' } },
  planoLibrary: { en: 'Schimelpfenig Library, Plano', zh: 'Plano，Schimelpfenig 图书馆', short: { en: 'Plano', zh: 'Plano' },
    address: { '@type': 'PostalAddress', streetAddress: '5024 Custer Rd', addressLocality: 'Plano', addressRegion: 'TX', postalCode: '75023', addressCountry: 'US' } },
  karaoke: { en: 'Community venue, Plano', zh: 'Plano 社区活动场地', short: { en: 'Plano', zh: 'Plano' },
    address: { '@type': 'PostalAddress', addressLocality: 'Plano', addressRegion: 'TX', addressCountry: 'US' } },
  coworking: { en: 'Coworking space, 163 Town Place', zh: '163 Town Place 联合办公空间', short: { en: 'Dallas area', zh: '达拉斯周边' },
    address: { '@type': 'PostalAddress', streetAddress: '163 Town Pl', addressRegion: 'TX', addressCountry: 'US' } },
  online: { en: 'Live online', zh: '线上直播', short: { en: 'Online', zh: '线上' } },
};

// role: 'host' = Jack organised it (counts toward sessions/registrations); 'speaker' = invited by another organisation (listed, not counted).
export const EVENTS = [
  { date: '2026-04-02', venue: 'karaoke', role: 'host', registrations: 40,
    en: 'Dallas OpenClaw meetup #1', zh: 'Dallas OpenClaw 线下聚会 #1' },
  { date: '2026-04-18', venue: 'coworking', role: 'host', registrations: 37,
    en: 'Dallas AI Hackathon — 37 builders, one afternoon', zh: '4.18 达拉斯 AI 黑客松' },
  { date: '2026-05-17', venue: 'lbj', role: 'host', registrations: 70,
    en: 'OpenClaw: into the world of AI agents, meetup #2', zh: 'OpenClaw：走进 AI Agent 的世界，聚会 #2' },
  { date: '2026-07-18', venue: 'lbj', role: 'host', registrations: 40,
    en: 'AI workflow automation in practice, session 3 (Chinese)', zh: 'AI Workflow Automation 实战分享（第三期）' },
  { date: '2026-07-25', venue: 'planoLibrary', role: 'speaker', org: 'DFW IT Association',
    en: 'Fireside chat “Work Smarter, Think Deeper, Live Better” — invited featured speaker', zh: 'DFW IT Association 炉边谈话 “Work Smarter, Think Deeper, Live Better” — 受邀主讲' },
  { date: '2026-08-22', venue: 'lbj', role: 'host', registrations: 59,
    en: 'Zero to your first small AI project (Chinese)', zh: '零基础也能上手：用 AI 完成你的第一个小项目' },
  { date: '2026-09-16', venue: 'online', role: 'host', registrations: 63,
    en: 'Finding a job in the AI era — with Jason Jia, Netflix software engineer', zh: 'AI 时代，我们怎么找工作？— 与 Jason Jia（Netflix 工程师）' },
];

const hosted = EVENTS.filter((e) => e.role === 'host');
export const EVENT_STATS = {
  hosted: hosted.length,
  registrations: hosted.reduce((n, e) => n + (e.registrations || 0), 0),
  cities: [...new Set(EVENTS.map((e) => VENUES[e.venue].address?.addressLocality).filter(Boolean))],
};

export const eventDate = (iso, lang) => {
  const [y, m, d] = iso.split('-').map(Number);
  return lang === 'zh' ? `${y} 年 ${m} 月 ${d} 日` : new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};
