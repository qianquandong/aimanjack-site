import { EMAIL } from '../config.mjs';
import { pageHero, breadcrumb, integrationList, finalCta, STATUS, BUSINESS_REF, T } from '../components.mjs';

const copy = {
  en: {
    title: 'Integrations and Their Status | AI Man Jack',
    description: 'Which booking systems, calendars, phone setups and CRMs the AI receptionist works with today, labeled Supported, Pilot or Ask us. Nothing is implied that has not been tested.',
    crumb: 'Integrations', h1: 'Works with the tools you already use.',
    sub: 'Every item below carries an honest label. Supported means it runs in production. Pilot means it is being tested. Ask us means we have not tested it yet and will check with your account before you pay.',
    howH: 'How a label changes', how: [
      ['Supported', 'Runs for at least one business in production, with the fallback tested.'],
      ['Pilot', 'Connected and being tested. Available if you accept that it may need adjustment.'],
      ['Ask us', 'Not tested. Tell us what you use; we test with your account before quoting.'],
    ],
    askH: 'Using something not listed?', askSub: 'Email the name of your booking or phone system and we will tell you whether it is a quick connection, a pilot, or not possible yet.', ask: 'Email Jack about your setup',
  },
  zh: {
    title: '对接及当前状态 | AI Man Jack',
    description: 'AI 前台现在能接哪些预约系统、日历、电话设置和 CRM，分别标为已支持、测试中或请联系确认。没测过的，不暗示能用。',
    crumb: '对接', h1: '接得上你已经在用的工具。',
    sub: '下面每一项都有如实的标签。「已支持」是已经在生产环境跑的；「测试中」是正在测的；「请联系确认」是还没测过，付款前会先用你的账户查清楚。',
    howH: '标签怎么变', how: [
      ['已支持', '至少在一家店的生产环境里跑着，兜底也测过。'],
      ['测试中', '已接上，正在测。接受可能需要调整的话可以用。'],
      ['请联系确认', '没测过。告诉我们你用什么，报价前先用你的账户测。'],
    ],
    askH: '用的东西不在列表里？', askSub: '把你预约系统或电话系统的名字发过来，我们告诉你是能快速接上、需要试点，还是暂时接不了。', ask: '给 Jack 发邮件说说你的系统',
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/integrations/']]);
  return {
    title: c.title, description: c.description, view: 'integration_view',
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].footer.integrations, h1: c.h1, sub: c.sub, ctas: false })}
<section class="wrap" style="padding-bottom:64px"><div class="legend">${['supported', 'pilot', 'ask'].map((s) => `<span><span class="badge badge-${s}">${STATUS[s][lang]}</span></span>`).join('')}</div>${integrationList(lang)}</section>
<section class="section soft"><div class="wrap"><h2>${c.howH}</h2><div class="grid-3">${c.how.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
<section class="section"><div class="wrap narrow"><h2>${c.askH}</h2><p class="lead">${c.askSub}</p><p class="cta-row"><a class="btn btn-secondary" href="mailto:${EMAIL}?subject=${encodeURIComponent(lang === 'zh' ? '对接咨询' : 'Integration question')}" data-event="email_click" data-pos="integrations">${c.ask}</a></p></div></section>
${finalCta(lang)}`,
    jsonld: [BUSINESS_REF, bc.ld],
  };
};

export const pages = [{ path: '/integrations/', priority: 0.6, en: page('en'), zh: page('zh') }];
