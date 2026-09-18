// / — what AI Man Jack helps teams accomplish, and the way into the library. Not an SEO encyclopedia (PRD §10):
// curriculum, formats in detail, reviews and FAQ live on /ai-training/.
import { SITE, EMAIL, TRAINING, PROOF, GBP_URL } from '../config.mjs';
import { planBtn, L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { published } from './blog.mjs';
import { readingMinutes, postPath } from '../blog.mjs';
import { business, person, website } from '../schema.mjs';
import { USE_CASES } from '../content/usecases.mjs';
import { workflowBySlug } from '../content/workflows.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { card } from '../resources.mjs';
import { workflowCard, templateCard } from './workflows.mjs';
import { useCaseCard } from './usecases.mjs';
import { TOOLS, toolCard } from './freetools.mjs';

const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`;
const FEATURED = ['meeting-notes-to-action-items', 'sales-meeting-preparation', 'sop-creation'];

const C = {
  en: {
    title: 'AI Man Jack | Practical AI Training for Teams',
    description: 'Practical AI training, workshops and workflows that help teams use ChatGPT, Claude, Copilot and AI agents in real work. Free tools and templates included.',
    og: { title: 'Make AI useful at work', description: 'Practical AI training and workflows that help teams use AI in real day-to-day work. Free tools, templates and step-by-step workflows.' },
    h1: 'Make AI useful at work.', sub: 'Practical AI training and workflows that help teams use AI in real day-to-day work.',
    trust: 'Training · Workshops · AI Workflows · Team Adoption', heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    proof: [[`${PROOF.talks} talks`, `${PROOF.perTalk} people at each community AI event in Dallas and Plano`], [`${PROOF.hackathon} builders`, 'One AI hackathon: live demos after three hours'], [`${PROOF.rating} &#9733;`, `${PROOF.reviews} Google reviews, all from workshop attendees`]],
    reviews: 'Read the reviews on Google',
    learnK: 'What teams learn', learnH: 'Four things your team can do after training',
    learn: [['Find the right AI use cases', 'Pick the tasks in their own week that are worth handing to AI, and skip the ones that are not.'], ['Build repeatable workflows', 'Go from a one-off prompt to a workflow that runs the same way next week.'], ['Verify AI output', 'Know which results can go straight out, which must be checked, and which should never be left to AI.'], ['Apply AI to real work', 'Leave with a working workflow for a task they already do, not a demo of someone else’s.']],
    teamK: 'Explore by team', teamH: 'Where does your team start?', teamMore: 'All use cases',
    toolsK: 'Free tools', toolsH: 'Get something useful in three minutes', toolsMore: 'All free tools',
    wfK: 'AI workflows', wfH: 'Step-by-step, with the prompt and the review checklist', wfMore: 'Browse all workflows', enNote: '',
    progK: 'Training programs', progH: 'Three ways to work together', progMore: 'Formats, curriculum and pricing',
    prog: [['90 min', 'session', 'One task, one live build, one checklist. A first look for a whole department.'], ['Half day', 'hands-on workshop', `Everyone builds on their own task. From ${PRICE}, up to ${TRAINING.halfDayMax} people, at your office or remote.`], ['Multi-week', 'AI workflow program', 'One workflow per week, reviewed between sessions, with a playbook the team keeps.']],
    roomK: 'Real rooms', roomH: 'Built in front of real people, then taught to companies',
    photos: ['The 37-person Dallas AI hackathon: three hours, live demos at the end.', 'A team demonstrating what it built.', 'Hands-on session: everyone working on their own task.'],
    howK: 'How engagement works', howH: 'From first call to a workflow that survives',
    how: [['A 30-minute call', 'What your team does every week, which tools are approved, what you want people to be able to do.'], ['A written quote in 24 hours', 'A recommended format and a fixed price. No add-ons.'], ['The session, on your work', 'Each person builds one workflow on a task they already do, and catches one deliberately flawed output.'], ['A two-week check', 'Was it tested, was it accurate enough to use, should it continue, change or stop.']],
    resK: 'Resources', resH: 'Field notes from the sessions', resMore: 'All resources', min: 'min read',
    finalH: 'Bring one task. We’ll make it work.', finalSub: 'Book a 30-minute call. You’ll have a recommended format and a written quote within 24 hours.', or: 'Or email', about: 'Who teaches it',
  },
  zh: {
    title: 'AI Man Jack | 给团队的 AI 实战培训',
    description: '实用的 AI 培训、工作坊和工作流，帮团队把 ChatGPT、Claude、Copilot 和 AI agent 用到真实工作里。另有免费工具和模板。',
    og: { title: '让 AI 在工作里真的有用', description: '实用的 AI 培训和工作流，帮团队把 AI 用到每天的真实工作里。免费工具、模板和分步骤的工作流。' },
    h1: '让 AI 在工作里真的有用', sub: '实用的 AI 培训和工作流，帮团队把 AI 用到每天的真实工作里。',
    trust: '培训 · 工作坊 · AI 工作流 · 团队落地', heroAlt: '达拉斯，Jack Qian 的一场动手 AI workshop，教室坐满了人',
    proof: [[`${PROOF.talks} 场讲座`, `达拉斯和 Plano 的社区 AI 活动，每场 ${PROOF.perTalk} 人`], [`${PROOF.hackathon} 人动手`, '一场 AI hackathon，三小时后现场 demo'], [`${PROOF.rating} &#9733;`, `${PROOF.reviews} 条 Google 评价，全部来自 workshop 学员`]],
    reviews: '在 Google 上看评价',
    learnK: '团队能学到什么', learnH: '培训之后，你的团队能做到这四件事',
    learn: [['找到值得用 AI 的地方', '从自己一周的工作里挑出值得交给 AI 的任务，也知道哪些不值得。'], ['搭成能重复跑的工作流', '从一次性的 prompt，变成下周还能照样跑的工作流。'], ['学会核对 AI 的结果', '知道哪些结果能直接用，哪些必须检查，哪些根本不能交给 AI。'], ['用在自己的真实工作上', '带走的是自己手头那件事的工作流，不是别人的演示。']],
    teamK: '按团队看', teamH: '你的团队从哪里开始？', teamMore: '全部应用场景',
    toolsK: '免费工具', toolsH: '三分钟，拿到一个能用的结果', toolsMore: '全部免费工具',
    wfK: 'AI 工作流', wfH: '分步骤，带 prompt，带人工核对清单', wfMore: '浏览全部工作流', enNote: '这几个栏目的内容目前是英文。',
    progK: '培训形式', progH: '三种合作方式', progMore: '形式、课纲和价格',
    prog: [['90 分钟', '分享', '一个任务、一次现场搭建、一份清单。适合整个部门先摸个底。'], ['半天', '动手 workshop', `每个人都在自己的任务上动手。${PRICE} 起，${TRAINING.halfDayMax} 人以内，上门或远程。`], ['多周', 'AI 工作流项目', '每周搭一条工作流，两次课之间复盘，团队留下一份 playbook。']],
    roomK: '真实的教室', roomH: '先在真人面前磨出来，再教给公司',
    photos: ['37 人的达拉斯 AI hackathon：三小时，结尾现场 demo。', '一个小组在演示自己搭出来的东西。', '动手环节：每个人在做自己的任务。'],
    howK: '怎么合作', howH: '从第一通电话，到一条留得下来的工作流',
    how: [['30 分钟通话', '你的团队每周在做什么、批准了哪些工具、希望大家学会做什么。'], ['24 小时内书面报价', '推荐的形式加一个固定价格，没有附加费。'], ['用你们的工作上课', '每个人拿自己已经在做的事搭一条工作流，再亲手揪出一个故意做错的结果。'], ['两周后回访', '有没有测过、准不准、够不够用，该继续、该改还是该停。']],
    resK: '资源', resH: '课堂笔记', resMore: '全部资源', min: '分钟读完',
    finalH: '带一个任务来，我们让它跑起来', finalSub: '预约 30 分钟通话，24 小时内给你推荐的形式和书面报价。', or: '或者发邮件到', about: '谁来教',
  },
};

const PHOTOS = [['dallas-ai-hackathon-group', 1200, 910], ['dallas-ai-hackathon-live-demo', 1200, 900], ['dallas-session3-hands-on', 1600, 1066]];

const page = (lang) => {
  const c = C[lang], z = lang === 'zh', t = (p) => L(lang, p);
  const more = (href, label) => `<p class="section-note"><a href="${href}">${label} &rarr;</a></p>`;
  const en = c.enNote ? `<p class="muted" style="margin:-8px 0 18px;font-size:15px">${c.enNote}</p>` : '';
  const posts = published.slice(0, 3).map((p) => { const x = p[lang]; return card({ href: t(postPath(p.slug)), kicker: `${readingMinutes(lang, x.sections)} ${c.min}`, title: x.h1, text: x.description, event: 'resource_click' }); }).join('');
  return {
    title: c.title, description: c.description, og: c.og, view: 'home_view',
    body: `
<section class="wrap hero">
<div><h1>${c.h1}</h1><p class="lead">${c.sub}</p>
<div class="cta-row" style="margin-top:28px">${planBtn(lang, { pos: 'hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="/tools/" data-event="free_tools_click" data-pos="hero">${T[lang].cta.tools}</a></div>
<p class="trust-line">${c.trust}</p></div>
<picture><source media="(max-width:720px)" srcset="/img/hero-workshop-960.webp"><img class="hero-img" src="/img/hero-workshop-1600.webp" srcset="/img/hero-workshop-960.webp 960w, /img/hero-workshop-1600.webp 1600w" sizes="(max-width:900px) 100vw, 560px" width="1600" height="1067" fetchpriority="high" decoding="async" alt="${c.heroAlt}"></picture>
</section>

<section class="wrap" aria-label="Track record"><div class="proof-strip" style="margin-top:0">${c.proof.map(([b, s]) => `<div><strong>${b}</strong><span>${s}</span></div>`).join('')}</div>
<p style="margin-top:14px;font-size:14.5px"><a class="review-link" href="${GBP_URL}" target="_blank" rel="noopener"><span aria-hidden="true">★★★★★</span> ${c.reviews}</a></p></section>

<div class="wrap">
<section class="section" id="learn" style="margin-top:64px"><div class="kicker">${c.learnK}</div><h2>${c.learnH}</h2>
<div class="grid-4" style="margin-top:26px">${c.learn.map(([h, p]) => `<div class="card"><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></section>

<section class="section" id="teams"><div class="kicker">${c.teamK}</div><h2>${c.teamH}</h2>${en}
<div class="grid-4 res-grid" style="margin-top:26px">${USE_CASES.map((u) => useCaseCard(u)).join('')}</div>${more('/use-cases/', c.teamMore)}</section>

<section class="section" id="tools"><div class="kicker">${c.toolsK}</div><h2>${c.toolsH}</h2>
<div class="grid-2 res-grid" style="margin-top:26px">${TOOLS.map((x) => toolCard(x)).join('')}${templateCard(templateBySlug['ai-use-case-discovery-worksheet'])}</div>${more('/tools/', c.toolsMore)}</section>

<section class="section" id="workflows"><div class="kicker">${c.wfK}</div><h2>${c.wfH}</h2>
<div class="grid-3 res-grid" style="margin-top:26px">${FEATURED.map((s) => workflowCard(workflowBySlug[s])).join('')}</div>${more('/workflows/', c.wfMore)}</section>

<section class="section" id="programs"><div class="kicker">${c.progK}</div><h2>${c.progH}</h2>
<div class="tiers" style="margin-top:26px">${c.prog.map(([big, small, p]) => `<div class="price-card"><div class="big">${big} <small>${small}</small></div><p class="plus" style="border:0;margin-bottom:0">${p}</p></div>`).join('')}</div>
<div class="cta-row" style="margin-top:28px">${planBtn(lang, { pos: 'home-programs' })}<a class="btn btn-secondary" href="${t('/ai-training/')}" data-event="training_page_click" data-pos="home-programs">${c.progMore}</a></div></section>

<section class="section" id="proof"><div class="kicker">${c.roomK}</div><h2>${c.roomH}</h2>
<div class="grid-3" style="margin-top:26px">${PHOTOS.map(([f, w, h], i) => `<figure class="figure"><img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${c.photos[i]}"><figcaption>${c.photos[i]}</figcaption></figure>`).join('')}</div>
<p class="section-note"><a href="${t('/about/')}">${c.about}: Jack Qian &rarr;</a></p></section>

<section class="section" id="how"><div class="kicker">${c.howK}</div><h2>${c.howH}</h2>
<ol class="steps steps-4" style="margin-top:26px">${c.how.map(([h, p], i) => `<li><span class="num">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></section>

<section class="section" id="resources"><div class="kicker">${c.resK}</div><h2>${c.resH}</h2>
<div class="grid-3 res-grid" style="margin-top:26px">${posts}</div>${more(t('/blog/'), c.resMore)}</section>
</div>

<section class="section final-cta" id="start"><div class="wrap narrow center"><h2>${c.finalH}</h2><p class="lead">${c.finalSub}</p>
<div class="cta-row center">${planBtn(lang, { pos: 'home-final', cls: 'btn-lg' })}</div><p class="final-number">${c.or} <a href="mailto:${EMAIL}" data-event="email_training_click" data-pos="final">${EMAIL}</a></p></div></section>
`,
    jsonld: [business(lang, { full: true }), person(), website()],
  };
};

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
