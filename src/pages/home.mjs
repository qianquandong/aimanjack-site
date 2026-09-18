// / — who AI Man Jack is, who it trains, and why a company should book a workshop. The full curriculum lives on /ai-training/.
import { SITE, EMAIL, TRAINING, PROOF } from '../config.mjs';
import { planBtn, L } from '../layout.mjs';
import { TEAMS } from './training.mjs';
import { published } from './blog.mjs';
import { readingMinutes, postPath } from '../blog.mjs';
import { business, person, website, faqPage } from '../schema.mjs';

const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`;

const FAQ = {
  en: [
    ['What is corporate AI training?', 'A session where a team learns to apply AI tools — ChatGPT, Claude, Gemini, Copilot — to the work it already does. At AI Man Jack it is hands-on: each person builds one working workflow for a task they repeat every week, and learns how to check the output before using it.'],
    ['Who is the training for?', 'Teams of roughly 5 to 60 people where most people are not technical: sales, operations, marketing, admin, planning, customer service, and the managers who lead them.'],
    ['Do employees need technical experience?', 'No. Nobody writes code. The instruction template is plain language and the verification checklist fits on one page.'],
    ['Which AI tools do you cover?', 'Whichever your company has already approved: ChatGPT, Claude, Gemini or Microsoft Copilot. The method is the same across tools, so switching later does not mean retraining.'],
    ['Can you use our real company workflows?', 'That is the whole point. Before the session each person picks a task they already do; the workshop is built on those tasks, in your tools, with your data boundaries set first.'],
    ['Do you offer onsite training in Dallas?', 'Yes. Sessions run in person anywhere in Dallas–Fort Worth: Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and the towns between.'],
    ['Do you offer remote training?', 'Yes. Teams outside DFW or spread across offices run the same session over video, with the same one-task-per-person format.'],
    ['How much does training cost?', `Half-day hands-on workshops start at ${PRICE} for up to ${TRAINING.halfDayMax} people. 90-minute sessions and multi-week programs are quoted by team size after a 30-minute call, with a written quote within 24 hours.`],
  ],
  zh: [
    ['什么是企业 AI 培训？', '让一个团队学会把 AI 工具——ChatGPT、Claude、Gemini、Copilot——用到自己已经在做的工作上。在 AI Man Jack 这是动手课：每个人给一件自己每周都重复做的事搭一条能跑的工作流，还要学会用之前先核对结果。'],
    ['培训是给谁的？', '5 到 60 人左右、大多数人不是技术背景的团队：销售、运营、市场、行政、计划、客服，以及带这些团队的经理。'],
    ['员工需要技术背景吗？', '不需要。没人写代码。指令模板是大白话，核对清单一页纸装得下。'],
    ['培训覆盖哪些 AI 工具？', '你公司已经批准的那一个：ChatGPT、Claude、Gemini 或 Microsoft Copilot。方法跨工具通用，以后换工具不用重学。'],
    ['能用我们公司真实的工作流程吗？', '这正是重点。课前每个人选一件自己已经在做的事，工作坊就围绕这些任务上，用你们的工具，先定好数据边界。'],
    ['在达拉斯提供上门培训吗？', '提供。整个达拉斯—沃斯堡都可以面对面：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边城镇。'],
    ['提供远程培训吗？', '提供。DFW 以外或者分在几个办公室的团队，走视频上同样的课，同样是一人一个任务。'],
    ['培训多少钱？', `半天动手工作坊 ${PRICE} 起，${TRAINING.halfDayMax} 人以内。90 分钟版和多周项目在一次 30 分钟通话后按人数报价，24 小时内给书面报价。`],
  ],
};

const OUTCOMES = {
  en: [['Find the right AI use cases', 'Pick the tasks in their own week that are worth handing to AI, and skip the ones that are not.'], ['Build repeatable workflows', 'Go from a one-off prompt to a workflow that runs the same way next week, for the same task.'], ['Verify AI output', 'Know which results can go straight out, which must be checked, and which should never be left to AI.'], ['Apply AI to real work', 'Leave with a working workflow for a task they already do, not a demo of someone else’s.']],
  zh: [['找到值得用 AI 的地方', '从自己一周的工作里挑出值得交给 AI 的任务，也知道哪些不值得。'], ['搭成能重复跑的工作流', '从一次性的 prompt，变成下周做同一件事还能照样跑的工作流。'], ['学会核对 AI 的结果', '知道哪些结果能直接用，哪些必须检查，哪些根本不能交给 AI。'], ['用在自己的真实工作上', '带走的是自己手头那件事的工作流，不是别人的演示。']],
};

const FORMATS = {
  en: [['90 min', 'session', 'One task, one live build, one checklist. A first look for a whole department.'], ['Half day', 'hands-on workshop', `Everyone builds on their own task. From ${PRICE}, up to ${TRAINING.halfDayMax} people, at your office.`], ['Multi-week', 'AI workflow program', 'One workflow per week, reviewed between sessions, with a playbook the team keeps.']],
  zh: [['90 分钟', '分享', '一个任务、一次现场搭建、一份清单。适合整个部门先摸个底。'], ['半天', '动手 workshop', `每个人都在自己的任务上动手。${PRICE} 起，${TRAINING.halfDayMax} 人以内，上门。`], ['多周', 'AI 工作流项目', '每周搭一条工作流，两次课之间复盘，团队留下一份 playbook。']],
};

const METHOD = {
  en: [['Choose a suitable task', 'Three weekly tasks, scored on four questions. The narrow one wins.'], ['Give the AI useful context', 'Goal, approved source, constraints, format, what to flag.'], ['Move from chat to workflow', 'An answer becomes steps: collect, extract, draft, review.'], ['Verify the output', 'One output is deliberately flawed. Find it.'], ['Set data and approval guardrails', 'Which tools, which data, who signs off.']],
  zh: [['选一个合适的任务', '三件每周做的事，四个问题打分，窄的那个胜出。'], ['给 AI 足够的背景', '目标、批准过的来源、约束、格式、要标出来核对的地方。'], ['从 chat 走到工作流', '一个答案拆成步骤：收集、抽取、起草、审核。'], ['核对结果', '有一个结果是故意做错的，把它找出来。'], ['定好数据和审批的护栏', '哪些工具、哪些数据、谁签字。']],
};

const PHOTOS = [
  ['dallas-ai-hackathon-group', 1200, 910, { en: 'The 37-person Dallas AI hackathon: three hours, live demos at the end.', zh: '37 人的达拉斯 AI hackathon：三小时，结尾现场 demo。' }],
  ['dallas-ai-hackathon-live-demo', 1200, 900, { en: 'A team demonstrating what it built.', zh: '一个小组在演示自己搭出来的东西。' }],
  ['dallas-session3-hands-on', 1600, 1066, { en: 'Hands-on session: everyone working on their own task.', zh: '动手环节：每个人在做自己的任务。' }],
];

const C = {
  en: {
    title: 'Corporate AI Training in Dallas | AI Man Jack',
    description: 'Practical, hands-on AI training for teams in Dallas and remotely. Build useful ChatGPT, Claude and AI workflows around work your team already does.',
    og: { title: 'Practical AI training for teams', description: 'Bring your real work. Your team turns it into useful AI workflows with ChatGPT, Claude, Gemini and Copilot. Dallas onsite or remote.' },
    eyebrow: 'Corporate AI Training · Dallas + Remote', h1: 'Practical AI training for teams.',
    sub: 'Bring your real work. We help your team turn it into useful AI workflows with ChatGPT, Claude, Gemini and Copilot.',
    proof: [[`${PROOF.talks}+ talks`, `${PROOF.perTalk} attendees at each Dallas AI event`], [`${PROOF.hackathon}-person`, 'AI hackathon, live demos in three hours'], [`${PROOF.rating} &#9733;`, `${PROOF.reviews} Google reviews · taught in English + 中文`]],
    outcomesH: 'What your team should be able to do after training', formatsH: 'Three formats', formatsK: 'Training formats', formatsMore: 'Formats and pricing in detail',
    teamsK: 'Teams', teamsH: 'Built for the teams that do the repeat work', teamsMore: 'See the workflows each team builds',
    methodK: 'How training works', methodH: 'Task first, tool second', methodMore: 'The full curriculum',
    proofK: 'Real rooms', proofH: 'Tried on a real room before a company paid for it',
    jackK: 'Who teaches it', jackH: 'Why trust Jack with your team', jack: ['Dallas-based, teaches in English and Chinese', 'Runs hands-on AI workshops, not slide decks', 'Built the curriculum through real community sessions', 'Builds real workflows for real work'], jackMore: 'About Jack',
    resK: 'Resources', resH: 'Field notes from the sessions', resMore: 'All resources', faqH: 'Common questions',
    finalH: 'Bring one task. Leave with it running.', finalSub: 'Book a 30-minute call. You’ll have a recommended format and a written quote within 24 hours.', or: 'Or email',
  },
  zh: {
    title: '达拉斯企业 AI 培训 | AI Man Jack',
    description: '给达拉斯团队的动手 AI 培训，上门或远程。围绕你们已经在做的工作，搭出真能用的 ChatGPT、Claude 和 AI 工作流。',
    og: { title: '给团队的 AI 实战培训', description: '带上你们的真实工作。你的团队用 ChatGPT、Claude、Gemini 和 Copilot，把它变成能用的 AI 工作流。达拉斯上门或远程。' },
    eyebrow: '企业 AI 培训 · 达拉斯 + 远程', h1: '给团队的 AI 实战培训',
    sub: '带上你们的真实工作。我们帮你的团队用 ChatGPT、Claude、Gemini 和 Copilot，把它变成真能用的 AI 工作流。',
    proof: [[`${PROOF.talks}+ 场讲座`, `达拉斯每场 ${PROOF.perTalk} 人`], [`${PROOF.hackathon} 人`, 'AI hackathon，三小时现场 demo'], [`${PROOF.rating} &#9733;`, `${PROOF.reviews} 条 Google 评价 · 中英文授课`]],
    outcomesH: '培训之后，你的团队应该能做到', formatsH: '三种形式', formatsK: '培训形式', formatsMore: '形式和价格详情',
    teamsK: '团队', teamsH: '给做重复工作的那些团队', teamsMore: '看各团队搭的工作流',
    methodK: '培训怎么上', methodH: '先看任务，再看工具', methodMore: '完整课纲',
    proofK: '真实的教室', proofH: '先在真实的教室里跑过，才轮到公司付钱',
    jackK: '谁来教', jackH: '为什么把团队交给 Jack', jack: ['常驻达拉斯，中英文授课', '上的是动手工作坊，不是念 PPT', '课纲是在社区活动里一场一场磨出来的', '搭的是真实工作用的工作流'], jackMore: '关于 Jack',
    resK: '资源', resH: '课堂笔记', resMore: '全部资源', faqH: '常见问题',
    finalH: '带一个任务来，带着它跑起来走', finalSub: '预约 30 分钟通话，24 小时内给你推荐的形式和书面报价。', or: '或者发邮件到',
  },
};

const page = (lang) => {
  const c = C[lang], z = lang === 'zh', t = (p) => L(lang, p);
  const posts = published.slice(0, 3).map((p) => { const x = p[lang]; return `<a class="card link-card post-card" href="${t(postPath(p.slug))}"><p class="post-meta">${readingMinutes(lang, x.sections)} ${z ? '分钟读完' : 'min read'}</p><h3 class="h3">${x.h1}</h3><p>${x.description}</p><span class="arrow" aria-hidden="true">&rarr;</span></a>`; }).join('');
  return {
    title: c.title, description: c.description, og: c.og, view: 'training_page_view',
    body: `
<section class="hero-photo" aria-label="${c.h1}">
<picture><source media="(max-width:720px)" srcset="/img/hero-workshop-portrait-960.webp"><img class="hero-bg" src="/img/hero-workshop-1600.webp" srcset="/img/hero-workshop-960.webp 960w, /img/hero-workshop-1600.webp 1600w, /img/hero-workshop-2400.webp 2400w" sizes="100vw" width="1600" height="1067" fetchpriority="high" decoding="async" alt="${z ? '达拉斯，Jack Qian 的一场动手 AI workshop，教室坐满了人' : 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops'}"></picture>
<div class="wrap"><div class="hero-copy">
<div class="kicker">${c.eyebrow}</div>
<h1>${c.h1}</h1>
<p class="sub">${c.sub}</p>
<div class="cta-row">${planBtn(lang, { pos: 'home-hero', id: 'hero-cta' })}<a class="btn btn-ghost" href="${t('/ai-training/')}" data-event="training_page_click" data-pos="home-hero">${z ? '看看培训怎么上' : 'See How Training Works'}</a></div>
</div></div></section>
<div class="wrap">
<section class="proof-strip" aria-label="Track record" style="margin-top:44px">${c.proof.map(([b, s]) => `<div><strong>${b}</strong><span>${s}</span></div>`).join('')}</section>

<section class="section" id="outcomes"><h2>${c.outcomesH}</h2>
<div class="grid-4" style="margin-top:26px">${OUTCOMES[lang].map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></section>

<section class="section" id="formats"><div class="kicker">${c.formatsK}</div><h2>${c.formatsH}</h2>
<div class="tiers" style="margin-top:26px">${FORMATS[lang].map(([big, small, p]) => `<div class="price-card"><div class="big">${big} <small>${small}</small></div><p class="plus" style="border:0;margin-bottom:0">${p}</p></div>`).join('')}</div>
<p class="section-note"><a href="${t('/ai-training/')}#formats">${c.formatsMore} &rarr;</a></p></section>

<section class="section" id="teams"><div class="kicker">${c.teamsK}</div><h2>${c.teamsH}</h2>
<div class="grid-4" style="margin-top:26px">${TEAMS[lang].map(([slug, name, items]) => `<a class="card link-card" href="${t('/ai-training/')}#team-${slug}"><h3 class="h3">${name}</h3><ul>${items.slice(0, 3).map((i) => `<li>${i}</li>`).join('')}</ul><span class="arrow" aria-hidden="true">&rarr;</span></a>`).join('')}</div></section>

<section class="section" id="method"><div class="kicker">${c.methodK}</div><h2>${c.methodH}</h2>
<ol class="steps" style="margin-top:26px">${METHOD[lang].map(([h, p], i) => `<li><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol>
<p class="section-note"><a href="${t('/ai-training/')}#curriculum">${c.methodMore} &rarr;</a></p></section>

<section class="section" id="proof"><div class="kicker">${c.proofK}</div><h2>${c.proofH}</h2>
<div class="grid-3" style="margin-top:26px">${PHOTOS.map(([f, w, h, cap]) => `<figure class="figure"><img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${cap[lang]}"><figcaption>${cap[lang]}</figcaption></figure>`).join('')}</div></section>

<section class="section" id="jack"><div class="kicker">${c.jackK}</div><h2>${c.jackH}</h2>
<div class="bio" style="margin-top:22px"><img src="/img/jack-portrait-256.webp" width="128" height="128" loading="lazy" decoding="async" alt="Jack Qian"><div class="who"><h3>Jack Qian</h3><ul class="needs" style="columns:1;margin-top:8px">${c.jack.map((i) => `<li>${i}</li>`).join('')}</ul><p style="margin-top:12px"><a href="${t('/about/')}">${c.jackMore} &rarr;</a></p></div></div></section>

<section class="section" id="resources"><div class="kicker">${c.resK}</div><h2>${c.resH}</h2>
<div class="grid-3 post-grid" style="margin-top:26px">${posts}</div>
<p class="section-note"><a href="${t('/blog/')}">${c.resMore} &rarr;</a></p></section>

<section class="section" id="faq"><h2>${c.faqH}</h2>
<div class="faq" style="max-width:760px;margin-top:26px">${FAQ[lang].map(([q, a]) => `<details><summary>${q}</summary><div class="faq-a"><p>${a}</p></div></details>`).join('\n')}</div></section>
</div>
<section class="section final-cta" id="start"><div class="wrap narrow center"><h2>${c.finalH}</h2><p class="lead">${c.finalSub}</p>
<div class="cta-row center">${planBtn(lang, { pos: 'home-final', cls: 'btn-lg' })}</div><p class="final-number">${c.or} <a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="final">${EMAIL}</a></p></div></section>
`,
    jsonld: [business(lang, { full: true }), person(), website(), faqPage(FAQ[lang], `${SITE}${t('/')}#faq`)],
  };
};

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
