// / — what AI Man Jack helps teams accomplish, and the way into the library (design canvas: Main / ZH-Main).
// Curriculum, format details, reviews and FAQ live on /ai-training/. Numbers come from config.mjs.
import { SITE, TRAINING, PROOF } from '../config.mjs';
import { planBtn, photoHero, ctaBand, href, L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { business, person, website } from '../schema.mjs';
import { USE_CASES } from '../content/usecases.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { loc } from '../resources.mjs';
import { templateCard } from './workflows.mjs';
import { TOOLS, toolCard } from './freetools.mjs';

const PRICE = `$${TRAINING.halfDayFrom.toLocaleString()}`, MAX = TRAINING.halfDayMax;

const C = {
  en: {
    title: 'AI Man Jack | Practical AI Training for Teams',
    description: 'Practical AI training, workshops and workflows that help teams use ChatGPT, Claude, Copilot and AI agents in real work. Free tools and templates included.',
    og: { title: 'Make AI useful at work', description: 'Practical AI training and workflows that help teams use AI in real day-to-day work. Free tools, templates and step-by-step workflows.' },
    eyebrow: 'Corporate AI training · Dallas onsite or remote · English or Chinese', h1: 'Make AI useful<br>at <em>work.</em>',
    sub: 'Each person brings one task they already do every week and leaves with a working AI workflow for it — plus the habit of checking the output before it goes out.',
    heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    stats: [[PRICE, `Half-day workshop, up to ${MAX} people`], [PROOF.hackathon, 'builders at one Dallas AI hackathon'], [PROOF.perTalk, 'people at each community AI talk'], [`${PROOF.rating} ★`, `${PROOF.reviews} Google reviews, all from attendees`]],
    learnK: 'What teams learn', learnH: 'Four things your team can do after training',
    learn: [['Find the right AI use cases', 'Pick the tasks in their own week that are worth handing to AI, and skip the ones that are not.'], ['Build repeatable workflows', 'Go from a one-off prompt to a workflow that runs the same way next week.'], ['Verify AI output', 'Know which results can go straight out, which must be checked, and which should never be left to AI.'], ['Apply AI to real work', 'Leave with a working workflow for a task they already do, not a demo of someone else’s.']],
    roomK: 'Real rooms', roomH: 'Built in front of real people, then taught to companies.',
    roomP: `${['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'][PROOF.talks] || PROOF.talks} community talks in Dallas and Plano and a ${PROOF.hackathon}-person hackathon came first. The method that survived those rooms is the one your team gets: your real work, turned into AI workflows that run.`,
    roomAlt: 'Hands-on session: everyone working on their own task.', by: 'Dallas-based · teaches every session himself', about: 'About Jack →',
    teamK: 'Explore by team', teamH: 'Where does your team start?', teamMore: 'All use cases →',
    progK: 'Training programs', progH: 'Three ways to work together', progMore: 'Formats, curriculum and pricing →',
    prog: [['session', '90 min', 'One task, one live build, one checklist. A first look for a whole department.'], ['hands-on workshop', 'Half day', `Everyone builds on their own task. From ${PRICE}, up to ${MAX} people, at your office or remote.`], ['AI workflow program', 'Multi-week', 'One workflow per week, reviewed between sessions, with a playbook the team keeps.']],
    toolsK: 'Free tools', toolsH: 'Get something useful in three minutes', toolsMore: 'All free tools →',
    strip: ['The 37-person Dallas AI hackathon', 'Jack presenting at a Dallas session', 'A team demonstrating what it built'],
    howK: 'How engagement works', howH: 'From first call to a workflow that survives', step: 'Step',
    how: [['A 30-minute call', 'What your team does every week, which tools are approved, what you want people to be able to do.'], ['A written quote in 24 hours', 'A recommended format and a fixed price. No add-ons.'], ['The session, on your work', 'Each person builds one workflow on a task they already do, and catches one deliberately flawed output.'], ['A two-week check', 'Was it tested, was it accurate enough to use, should it continue, change or stop.']],
    bandH: 'Bring one task.<br>We’ll make it <em>work.</em>',
  },
  zh: {
    title: 'AI Man Jack | 面向团队的实操型 AI 培训',
    description: '实操型 AI 培训、工作坊与工作流，帮助团队将 ChatGPT、Claude、Copilot 与 AI 智能体应用于真实工作，并提供免费工具与模板。',
    og: { title: '让 AI 真正落地于日常工作', description: '实操型 AI 培训与工作流，帮助团队将 AI 应用于日常工作。提供免费工具、模板与分步骤工作流。' },
    eyebrow: '企业 AI 培训 · 达拉斯现场或远程 · 中英文授课', h1: '让 AI 真正落地<br>于<em>日常工作</em>。',
    sub: '每位学员带来一项每周都在做的工作任务，课程结束时带走一条可直接使用的 AI 工作流，并养成在输出前先核验结果的习惯。',
    heroAlt: '达拉斯，Jack Qian 主讲的一场 AI 实操工作坊，教室座无虚席',
    stats: [[PRICE, `半天工作坊，最多 ${MAX} 人`], [PROOF.hackathon, '人参与达拉斯 AI 黑客松'], [PROOF.perTalk, '每场社区 AI 讲座参与人数'], [`${PROOF.rating} ★`, `${PROOF.reviews} 条 Google 评价，均来自学员`]],
    learnK: '培训成果', learnH: '培训结束后，团队能够做到的四件事',
    learn: [['识别合适的 AI 应用场景', '从日常工作中筛选出值得交给 AI 的任务，同时明确哪些并不适合。'], ['搭建可复用的工作流', '从一次性的提示词，升级为下周依然能稳定运行的工作流。'], ['核验 AI 的输出', '清楚哪些结果可以直接使用、哪些必须复核、哪些不应交给 AI。'], ['应用于真实工作', '带走的是针对自身任务的可用工作流，而不是别人的演示案例。']],
    roomK: '真实课堂', roomH: '先在真实课堂中打磨，再交付给企业团队。',
    roomP: `在达拉斯与 Plano 举办的${['零', '一', '两', '三', '四', '五', '六', '七', '八', '九'][PROOF.talks] || PROOF.talks}场社区讲座和一场 ${PROOF.hackathon} 人黑客松，是这套方法的试验场。经过这些课堂检验的方法，正是你的团队将获得的：以真实工作为素材，搭建真正可运行的 AI 工作流。`,
    roomAlt: '实操环节：每位学员都在处理自己的任务。', by: '常驻达拉斯 · 每场课程均亲自授课', about: '了解 Jack →',
    teamK: '按团队浏览', teamH: '你的团队从哪里开始？', teamMore: '全部应用场景 →',
    progK: '培训形式', progH: '三种合作方式', progMore: '形式、课程与价格 →',
    prog: [['专题分享', '90 分钟', '一项任务、一次现场搭建、一份核验清单，适合整个部门初步了解。'], ['实操工作坊', '半天', `每位学员基于自己的任务动手搭建。${PRICE} 起，最多 ${MAX} 人，可上门或远程。`], ['AI 工作流项目', '多周', '每周落地一条工作流，课间复盘，最终沉淀为团队长期使用的操作手册。']],
    toolsK: '免费工具', toolsH: '三分钟，获得一份可用的结果', toolsMore: '全部免费工具 →',
    strip: ['37 人参与的达拉斯 AI 黑客松', 'Jack 在达拉斯的一场课程中讲解', '一个小组正在演示自己搭建的成果'],
    howK: '合作流程', howH: '从首次沟通，到真正落地的工作流', step: '第 {n} 步',
    how: [['30 分钟沟通', '了解团队的日常工作、已获批准的工具，以及希望达成的目标。'], ['24 小时内书面报价', '推荐合适的培训形式并给出固定价格，无任何附加费用。'], ['基于真实工作授课', '每位学员围绕自己的任务搭建一条工作流，并找出一个刻意设置的错误输出。'], ['两周后回访', '评估工作流是否经过实测、结果是否足够准确，以及应继续、调整还是停止。']],
    bandH: '带一项任务来，<br>我们让它<em>真正运转</em>。',
  },
};

const STRIP = [['dallas-ai-hackathon-group', 1200, 910], ['dallas-session3-jack-presenting', 1600, 1066], ['dallas-ai-hackathon-live-demo', 1200, 900]];

const page = (lang) => {
  const c = C[lang], n2 = (i) => String(i + 1).padStart(2, '0');
  const head = (k, h, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2></div>${more ? `<a class="more" href="${more[0]}">${more[1]}</a>` : ''}</div>`;
  return {
    title: c.title, description: c.description, og: c.og, view: 'home_view', hero: 'photo',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, stats: c.stats, inner: `<div class="hero-main">
<div class="col-a"><div class="eyebrow">${c.eyebrow}</div><h1 class="xl">${c.h1}</h1></div>
<div class="col-b"><p>${c.sub}</p><div class="cta-row">${planBtn(lang, { pos: 'hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="${href(lang, '/tools/')}" data-event="free_tools_click" data-pos="hero">${T[lang].cta.tools}</a></div></div></div>` })}

<section class="sec" id="learn"><div class="wrap">${head(c.learnK, c.learnH)}
<div class="g4">${c.learn.map(([h, p], i) => `<div class="oak" style="min-height:280px"><span class="n">${n2(i)}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>

<section class="split-photo dark" id="rooms"><img src="/img/events/dallas-session3-hands-on.webp" width="1600" height="1066" loading="lazy" decoding="async" alt="${c.roomAlt}">
<div><div class="eyebrow" style="color:var(--on-dark-accent)">${c.roomK}</div><h2>${c.roomH}</h2><p>${c.roomP}</p>
<div class="byline"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian"><div><b>Jack Qian</b><span>${c.by}</span></div><a href="${L(lang, '/about/')}">${c.about}</a></div></div></section>

<section class="sec" id="teams"><div class="wrap">${head(c.teamK, c.teamH, [href(lang, '/use-cases/'), c.teamMore])}
<div class="rows">${USE_CASES.map((u, i) => { const x = loc(u, lang); return `<a href="${href(lang, `/use-cases/${u.slug}/`)}" data-event="use_case_click" data-pos="home"><span class="n">${n2(i)}</span><h3>${x.title}</h3><p>${x.card}</p><span class="go" aria-hidden="true">→</span></a>`; }).join('')}</div></div></section>

<section class="sec tight" id="programs"><div class="wrap">${head(c.progK, c.progH, [L(lang, '/ai-training/') + '#formats', c.progMore])}
<div class="g3">${c.prog.map(([k, big, p], i) => `<div class="prog${i === 1 ? ' dark' : ''}"><span class="k">${k}</span><span class="big">${big}</span><p>${p}</p></div>`).join('')}</div></div></section>

<section class="sec tight" id="tools"><div class="wrap">${head(c.toolsK, c.toolsH, [href(lang, '/tools/'), c.toolsMore])}
<div class="g2">${TOOLS.map((x) => toolCard(x, lang)).join('')}${templateCard(templateBySlug['ai-use-case-discovery-worksheet'], lang)}</div></div></section>

<section class="photo-strip" aria-hidden="false">${STRIP.map(([f, w, h], i) => `<img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${c.strip[i]}">`).join('')}</section>

<section class="sec" id="how"><div class="wrap">${head(c.howK, c.howH)}
<ol class="steps-line">${c.how.map(([h, p], i) => `<li><span class="n">${c.step.includes('{n}') ? c.step.replace('{n}', i + 1) : `${c.step} ${i + 1}`}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></div></section>
${ctaBand(lang, { h: c.bandH, pos: 'home-final' })}`,
    jsonld: [business(lang, { full: true }), person(), website()],
  };
};

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
