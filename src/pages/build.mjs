// /ai-workflow-build/ (Jack, 2026-10-29: take build projects). The one service page for done-for-you AI workflow builds; the
// training pages stay pure training and point here when a buyer needs the workflow built. Evidence = the livestream scheduling
// case only (src/content/cases.mjs): no client testimonial, ROI or net-time claim until Jack has a real one.
// No public price (TRAINING note in config.mjs): "by written quote" only; JSON-LD is Service + breadcrumb, no Offer or rating.
import { SITE, BOOK_URL, BUILD, QUOTE_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { breadcrumb } from '../components.mjs';
import { BUSINESS_REF, AREA } from '../schema.mjs';

const CASE = '/case-studies/livestream-agency-scheduling/';
const C = {
  en: {
    title: 'AI Workflow Build Services for Teams, Dallas | AI Man Jack',
    description: 'Jack Qian scopes, builds and tests AI workflows around the systems your team already uses, then trains the people who run them. Dallas–Fort Worth or remote. Priced by written quote.',
    crumb: 'Workflow builds', eyebrow: 'AI workflow build',
    h1: 'When training is not enough, we <em>build the workflow</em> with you.',
    sub: 'Some work needs more than better prompts: it moves between a CRM, spreadsheets, forms and email, or follows rules too strict to leave to a chatbot. Jack scopes it, builds it around the systems you already use, tests it on your real cases, and trains the people who will run it.',
    quote: 'Request a build quote',
    forK: 'Fit', forH: 'Who a build is for',
    for: ['A team with one recurring task that takes hours every week and follows clear rules', 'Work that moves between systems: CRM, spreadsheets, forms, email, Microsoft 365, Google Workspace or Lark', 'A business that wants its rules in a sheet it can edit, not buried in code', 'Teams that already tried a chatbot on the task and got results they could not trust'],
    notForH: 'Not the right fit', notFor: ['Replacing an ERP or migrating a whole CRM', 'Projects that need the builder to hold a compliance certification such as HIPAA or SOC 2', 'A product you plan to sell to your own customers', 'Workflows where nobody will review the output'],
    stepsK: 'How it works', stepsH: 'From one task to a workflow your team runs',
    steps: [['A 20-minute call', 'What the task is, who does it now, which systems it touches and what “done” looks like.'], ['Written scope and quote', 'What the workflow will do, what it will not do, which data and accounts it uses, and how we will check it works. Nothing is built before you agree to it.'], ['Build and test on real cases', 'Built against sample or approved data first, then compared with a real week of the work. Problems are fixed before anyone relies on it.'], ['Run it next to the old way', 'A person reviews every output while the workflow runs alongside your current process.'], ['Hand over and follow up', 'Written instructions, a training session for the people who run it, and a check two weeks later on whether it should continue, change or stop.']],
    getK: 'What you get', getH: 'Delivered with every build',
    get: ['A working workflow that runs in accounts your team controls', 'Business rules kept where your team can change them, such as a spreadsheet', 'A plain-language page explaining what the workflow does and why', 'Automated tests where the build includes code', 'Training for the people who run and review it', 'A two-week follow-up check'],
    excH: 'Not included', exc: ['AI tool, software or hosting subscriptions', 'Ongoing maintenance or new features, unless scoped separately', 'Changes inside systems your team cannot give us access to'],
    caseK: 'Case study', caseH: 'A build in production: weekly scheduling for a livestream agency',
    caseP: 'About 30 part-time hosts and operators, 8 brand rooms, seven days a week. The first draft of the schedule used to take about six hours by hand each week; it is now generated from rules the client keeps in its own spreadsheet. A person still reviews, edits and publishes it.',
    caseFacts: [['Engine', 'Deterministic code, not a language model'], ['Rules', 'Live in the client’s spreadsheet'], ['Status', 'In production since September 2026'], ['Review', 'A person reviews, edits and publishes']],
    caseLink: 'Read the full case study',
    priceK: 'Pricing', priceH: 'By written quote',
    priceP: 'Every build is scoped before work starts, so the quote matches the task, the systems involved and how much testing it needs. There is no public price list.',
    faqK: 'FAQ', faqH: 'Questions about builds',
    faq: [
      ['Training or a build: which do we need?', `If your team can do the task with an AI tool once they know how, training is enough; start with the <a href="${L('en', '/ai-training/')}">training program</a>. If the task needs to run on its own, across systems, or with rules enforced exactly, it is a build. The 20-minute call sorts this out.`],
      ['Do you work inside our CRM or other systems?', 'Yes, through access your admin approves. We start with the smallest access that does the job, usually read-only, and agree in writing which data and accounts the workflow touches.'],
      ['Do you use AI or regular code?', `Whichever the task needs. A language model is useful where the input is messy, like free-text notes. Where business rules must hold exactly, the decision is made by deterministic code, as in the <a href="${L('en', CASE)}">scheduling case study</a>.`],
      ['Who owns what you build?', 'Where possible it runs in accounts your company owns, and you keep the code, the rules and the documentation.'],
      ['How long does a build take?', 'It depends on the task and the systems involved. The written scope gives a timeline before you commit.'],
      ['Can our team learn to maintain it?', 'Yes. The handover includes training for the people who run it, and the rules sit where they can change them without a code change.'],
    ],
    ctaH: 'Bring one task to a 20-minute call', ctaP: 'Describe the work and the systems it touches. Jack replies within one business day with a recommended next step: training, a build, or neither.',
    ld: { name: 'AI Workflow Build', type: 'AI workflow development', desc: 'Done-for-you AI workflow builds for business teams: scoped, built around existing systems, tested on real cases and handed over with training and a two-week follow-up. Dallas–Fort Worth or remote. Priced by written quote.' },
  },
  zh: {
    title: 'AI 工作流搭建服务，达拉斯 | AI Man Jack',
    description: 'Jack Qian 围绕团队现有系统，评估、搭建并测试 AI 工作流，再培训负责运行的人。达拉斯—沃斯堡上门或远程，按书面报价。',
    crumb: '工作流搭建', eyebrow: 'AI 工作流搭建',
    h1: '光靠培训不够时，我们和你一起<em>把工作流搭好</em>。',
    sub: '有些工作不是把提示词写好就能解决：它要在 CRM、表格、表单和邮件之间来回，或者规则严格到不能交给聊天机器人。Jack 先评估范围，再围绕你们现有的系统搭建，用真实案例测试，最后培训负责运行的人。',
    quote: '申请搭建报价',
    forK: '适合谁', forH: '哪些团队适合做搭建',
    for: ['有一项每周都要花好几个小时、规则清楚的重复任务', '工作要在多个系统之间流转：CRM、表格、表单、邮件、Microsoft 365、Google Workspace 或飞书', '希望规则放在自己能改的表格里，而不是写死在代码里', '已经让聊天机器人试过这项任务，但结果不敢用'],
    notForH: '不太适合', notFor: ['替换 ERP，或整套迁移 CRM', '要求开发方持有 HIPAA、SOC 2 等合规认证的项目', '准备卖给你自己客户的产品', '没有人审核输出结果的工作流'],
    stepsK: '流程', stepsH: '从一项任务，到团队自己运行的工作流',
    steps: [['20 分钟通话', '任务是什么、现在谁在做、涉及哪些系统、怎样算做完。'], ['书面范围和报价', '工作流会做什么、不做什么、用到哪些数据和账号、怎样检验它有效。你确认之前，什么都不开始搭。'], ['用真实案例搭建和测试', '先用样例或批准的数据搭建，再和一周的真实工作对比。有问题先修好，再让人依赖它。'], ['和原来的做法并行', '工作流和现有流程一起跑，每个输出都由人审核。'], ['交接和回访', '书面说明、给负责运行的人一次培训，两周后回访，确认继续、调整还是停止。']],
    getK: '交付内容', getH: '每个搭建项目都包含',
    get: ['一条能运行的工作流，跑在你们团队掌控的账号里', '业务规则放在团队自己能改的地方，比如一张表格', '一页白话说明，讲清工作流做什么、为什么这样做', '涉及代码时附自动化测试', '给负责运行和审核的人做培训', '两周后的回访'],
    excH: '不包含', exc: ['AI 工具、软件或托管服务的订阅费用', '后续维护或新增功能（如有需要，另行确定范围）', '你们无法开放权限的系统内部改动'],
    caseK: '案例', caseH: '已上线的搭建项目：直播公司的每周排班',
    caseP: '约 30 名兼职主播和运营，8 个品牌直播间，每周七天。排班初稿过去每周要手工做大约六个小时，现在根据客户自己表格里的规则自动生成，仍由人审核、修改并发布。',
    caseFacts: [['排班引擎', '确定性代码，不是语言模型'], ['规则', '放在客户自己的表格里'], ['状态', '2026 年 9 月起上线运行'], ['审核', '由人审核、修改并发布']],
    caseLink: '阅读完整案例',
    priceK: '价格', priceH: '按书面报价',
    priceP: '每个搭建项目都先确定范围再开工，报价按任务本身、涉及的系统和所需的测试量来定。不公开价目表。',
    faqK: '常见问题', faqH: '关于搭建的问题',
    faq: [
      ['我们需要培训，还是需要搭建？', `如果团队学会之后能自己用 AI 工具完成这项任务，培训就够了，可以从<a href="${L('zh', '/ai-training/')}">培训课程</a>开始。如果任务需要自动运行、跨系统，或者规则必须严格执行，那就是搭建。20 分钟通话里就能判断。`],
      ['你们会在我们的 CRM 或其他系统里做吗？', '会，通过你们管理员批准的权限。我们从能完成任务的最小权限开始，通常是只读，并书面确认工作流会用到哪些数据和账号。'],
      ['用 AI 还是普通代码？', `看任务需要。输入比较杂乱时（比如自由填写的备注），语言模型很有用；业务规则必须严格执行的地方，由确定性代码来做决定，就像<a href="${L('zh', CASE)}">排班案例</a>那样。`],
      ['搭好的东西归谁？', '尽量跑在贵公司自己的账号里，代码、规则和文档都归你们。'],
      ['搭建要多久？', '取决于任务和涉及的系统。书面范围里会写明时间安排，你确认后才开始。'],
      ['我们的团队能学会自己维护吗？', '可以。交接时会培训负责运行的人，规则也放在他们不用改代码就能调整的地方。'],
    ],
    ctaH: '带一项任务来，约 20 分钟通话', ctaP: '说说这项工作和它涉及的系统。Jack 会在 1 个工作日内回复建议的下一步：培训、搭建，或者都不需要。',
    ld: { name: 'AI 工作流搭建', type: 'AI 工作流开发', desc: '为企业团队提供 AI 工作流搭建服务：先确定范围，围绕现有系统搭建，用真实案例测试，交接时附培训和两周回访。达拉斯—沃斯堡上门或远程，按书面报价。' },
  },
};

const page = (lang) => {
  const c = C[lang], url = `${SITE}${L(lang, BUILD.path)}`, bc = breadcrumb(lang, [[c.crumb, BUILD.path]]);
  const head = (k, h) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2></div></div>`;
  const ticks = (items, cls = '') => `<ul class="ticks${cls}">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>`;
  const ctas = (pos, first) => `<div class="cta-row"><a class="btn btn-primary"${first ? ' id="hero-cta"' : ''} href="${L(lang, QUOTE_URL)}?format=${BUILD.format}" data-event="quote_cta_click" data-pos="${pos}">${c.quote}</a><a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="booking_start" data-pos="${pos}">${T[lang].cta.book}</a></div>`;
  return {
    title: c.title, description: c.description, offer: BUILD.id, bodyClass: 'offer-page',
    body: `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${c.eyebrow}</p><h1 class="brand-hero-title">${c.h1}</h1><p class="lead" style="max-width:760px">${c.sub}</p>${ctas('build-hero', true)}</div></section>

<section class="sec tight" id="who"><div class="wrap">${head(c.forK, c.forH)}
<div class="g2"><div class="oak">${ticks(c.for)}</div><div class="oak"><h3>${c.notForH}</h3>${ticks(c.notFor, ' x')}</div></div></div></section>

<section class="sec tight" id="process"><div class="wrap">${head(c.stepsK, c.stepsH)}
<ol class="nums">${c.steps.map(([h, p], i) => `<li><span class="n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join('')}</ol></div></section>

<section class="sec tight" id="deliverables"><div class="wrap">${head(c.getK, c.getH)}
<div class="g2"><div class="oak">${ticks(c.get)}</div><div class="oak"><h3>${c.excH}</h3>${ticks(c.exc, ' x')}</div></div></div></section>

<section class="sec tight" id="case"><div class="wrap g2" style="gap:24px"><div class="big-card"><div class="eyebrow">${c.caseK}</div><h2>${c.caseH}</h2><p>${c.caseP}</p><p><a href="${L(lang, CASE)}" data-event="case_study_click" data-pos="build">${c.caseLink} →</a></p></div>
<div class="big-card"><dl class="kv">${c.caseFacts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div></div></section>

<section class="sec tight" id="pricing"><div class="wrap"><div class="big-card oakc"><div class="eyebrow">${c.priceK}</div><h2>${c.priceH}</h2><p>${c.priceP}</p>${ctas('build-pricing', false)}</div></div></section>

<section class="sec tight" id="faq"><div class="wrap">${head(c.faqK, c.faqH)}
<div class="faq">${c.faq.map(([q, a], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></div></section>

<section class="sec tight" id="start"><div class="wrap"><div class="big-card oakc"><h2>${c.ctaH}</h2><p>${c.ctaP}</p>${ctas('build-final', false)}</div></div></section>`,
    jsonld: [
      { '@type': 'Service', '@id': `${url}#service`, name: c.ld.name, serviceType: c.ld.type, description: c.ld.desc, url,
        provider: { '@id': `${SITE}/#business` }, availableLanguage: ['en', 'zh'], areaServed: [AREA[0], { '@type': 'Country', name: 'United States' }] },
      BUSINESS_REF, bc.ld,
    ],
  };
};

export const pages = [{ path: BUILD.path, priority: 0.8, en: page('en'), zh: page('zh') }];
