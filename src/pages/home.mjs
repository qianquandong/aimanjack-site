// / — what AI Man Jack helps teams accomplish, and the way into the library (design canvas: Main / ZH-Main).
// Curriculum, format details, reviews and FAQ live on /ai-training/. Numbers come from config.mjs.
import { SITE, TRAINING, PROOF, GBP_URL } from '../config.mjs';
import { planBtn, photoHero, ctaBand, href, L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { business, person, website } from '../schema.mjs';
import { USE_CASES } from '../content/usecases.mjs';
import { caseProof, clientProof } from './cases.mjs';
import { progCard } from './training.mjs';
import { chooser } from './offers.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { loc } from '../resources.mjs';
import { templateCard } from './workflows.mjs';
import { TOOLS, toolCard } from './freetools.mjs';
import { REVIEWS } from './dallas.mjs';
import { quickQuote } from '../quick-quote.mjs';

const S = TRAINING.sessions, M = TRAINING.sessionMin;
const talks = (w) => w[PROOF.talks] || PROOF.talks;

const C = {
  en: {
    // 2026-10-13: the home page no longer competes with /ai-training/dallas/ for the local term (HANDOFF §1.1). DFW stays in the eyebrow and body.
    title: 'Corporate AI Training for Business Teams | AI Man Jack',
    description: `Hands-on corporate AI training for business teams. Jack Qian teaches onsite in Dallas–Fort Worth or live online, in English or Chinese. Team pricing by quote.`,
    og: { title: 'Hands-on AI training for business teams', description: `Hands-on training with Jack Qian, in English or Chinese. Four live ${M}-minute sessions, priced for your team. Onsite in Dallas–Fort Worth or live online across the U.S.` },
    eyebrow: '<a href="/ai-training/dallas/">Dallas–Fort Worth onsite</a> · Remote across the U.S. · English or Chinese', h1: 'AI training for<br><em>business teams</em>,<br>built on real work.',
    sub: 'Jack Qian teaches non-technical teams to use <a href="/ai-training/chatgpt/">ChatGPT</a>, <a href="/ai-training/claude/">Claude</a>, Gemini or <a href="/ai-training/copilot/">Copilot</a> on work they already do. Bring a sales, marketing or operations task; build a repeatable workflow and learn how to check its output.',
    seeProgram: 'See the 4-Session Program',
    heroAlt: 'A full classroom in Dallas at one of Jack Qian’s hands-on AI workshops',
    stats: [['Custom', 'Priced for your team’s size and goals'], [`${S} × ${M} min`, 'Live, hands-on sessions'], [PROOF.hackathon, 'builders at one Dallas AI hackathon'], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} Google reviews ↗</a>`]],
    learnK: 'What you learn', learnH: 'Four things you can do after training',
    learn: [['Find the right AI use cases', 'Pick the tasks in your own week that are worth handing to AI, and skip the ones that are not.'], ['Build repeatable workflows', 'Go from a one-off prompt to a workflow that runs the same way next week.'], ['Verify AI output', 'Know which results can go straight out, which must be checked, and which should never be left to AI.'], ['Apply AI to real work', 'Leave with a working workflow for a task you already do, not a demo of someone else’s.']],
    roomK: 'Real rooms', roomH: 'Built in front of real people. Now applied to real businesses.',
    roomP: `${talks(['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'])} community talks in Dallas and Plano and a ${PROOF.hackathon}-person hackathon came first. The method that survived those rooms is the one you get: your real work, turned into AI workflows that run. Dates, venues and photos: <a href="/ai-training/dallas/">corporate AI training in Dallas–Fort Worth</a>.`,
    roomAlt: 'Hands-on session: everyone working on their own task.', by: 'Dallas-based · teaches every session himself', about: 'About Jack →',
    teamK: 'Explore by team', teamH: 'Where does your team start?', teamMore: 'All use cases →', owners: 'Run a small business? Explore AI training for owners & teams →',
    progK: 'Training program', progH: 'The core program, built around your work', progMore: 'Session-by-session plan and pricing →',
    prog: { k: 'Core program', big: `${S} sessions`, sub: `${S} × ${M} min · customized · live`, chip: 'Priced by quote',
        p: 'We work directly on the tasks you already do and build practical AI workflows around them. The curriculum changes with the business or team.',
        items: [`Four live ${M}-minute sessions`, 'Built around your actual work', 'One workflow at a time', 'Review what worked between sessions', 'Human verification built into every workflow', 'Remote anywhere in the U.S.'],
        cta: 'See the 4-Session Program', note: 'Training a team? Custom pricing available.' },
    toolsK: 'Free tools', toolsH: 'Get something useful in three minutes', toolsMore: 'All free tools →',
    strip: ['The 37-person Dallas AI hackathon', 'Jack presenting at a Dallas session', 'A team demonstrating what it built'],
    howK: 'How engagement works', howH: 'From first call to a workflow that survives', step: 'Step',
    how: [['A short workflow call', 'Tell me what you or your team does every week, which tools you already use, and where work keeps repeating.'], ['A recommended training plan', 'Who should attend, which workflows to start with, and a written price, sent by email.'], ['Four live sessions on real work', 'We build and improve workflows using work you actually do, not canned demos.'], ['Use it, then keep, change or stop', 'Each session starts with what worked, what broke and what should change. Keep the workflows that are accurate and useful; change or stop the rest.']],
    bandH: 'Bring one task.<br>We’ll make it <em>work.</em>',
    revK: 'Reviewed on Google', revH: 'What attendees say', revMore: `Read all ${PROOF.reviews} reviews on Google ↗`,
    trustK: 'Safe and measurable', trustH: 'What your company can count on',
    trust: [['Your approved tools', 'Training runs on the AI tools your company already licenses or approves. No new accounts are required to attend.'], ['Synthetic or redacted practice material', 'Exercises use synthetic or redacted examples. For the tools and plan you use, we go through the data rules, including which settings and admin controls affect whether business data is used for model training.'], ['A review step in every workflow', 'Each workflow has a review step owned by someone on your team: what can go out as is, what needs a check, and what should never be left to AI.'], ['A two-week review', 'Two weeks after a workflow goes into use, the team checks whether it was used on real work and accurate enough, then decides to keep, change or stop it.']],
  },
  zh: {
    title: '企业团队 AI 实操培训 | AI Man Jack',
    description: `为企业团队提供实操 AI 培训：销售、运营、市场和管理层各带一项真实任务来，带一条能用的工作流和核验方法走。Jack Qian 亲自授课，达拉斯—沃斯堡可上门，全美线上直播，中英文授课。四次课程项目按团队报价。`,
    og: { title: '企业团队 AI 实操培训', description: `Jack Qian 中英文亲自授课。四节 ${M} 分钟课程，按团队报价。达拉斯—沃斯堡可上门，全美可远程。` },
    eyebrow: '<a href="/zh/ai-training/dallas/">达拉斯—沃斯堡上门</a> · 全美远程 · 中英文授课', h1: '企业团队的<br><em>AI 实操培训</em>，<br>从真实工作出发。',
    sub: 'Jack Qian 带非技术团队，把 <a href="/zh/ai-training/chatgpt/">ChatGPT</a>、<a href="/zh/ai-training/claude/">Claude</a>、Gemini 或 <a href="/zh/ai-training/copilot/">Copilot</a> 用在日常工作中。从你手头的销售、市场或运营任务出发，搭建可复用的工作流，并学会核验 AI 的输出。',
    seeProgram: '查看四次课程项目',
    heroAlt: '达拉斯，Jack Qian 主讲的一场 AI 实操工作坊，教室座无虚席',
    stats: [['定制', '按团队人数和目标报价'], [`${S} × ${M} 分钟`, '实时互动的实操课'], [PROOF.hackathon, '人参与达拉斯 AI 黑客松'], [`${PROOF.rating} ★`, `<a href="${GBP_URL}" target="_blank" rel="noopener">${PROOF.reviews} 条 Google 评价 ↗</a>`]],
    learnK: '培训成果', learnH: '培训结束后，你能做到的四件事',
    learn: [['识别合适的 AI 应用场景', '从日常工作中筛选出值得交给 AI 的任务，同时明确哪些并不适合。'], ['搭建可复用的工作流', '从一次性的提示词，升级为下周依然能稳定运行的工作流。'], ['核验 AI 的输出', '清楚哪些结果可以直接使用、哪些必须复核、哪些不应交给 AI。'], ['应用于真实工作', '带走的是针对自身任务的可用工作流，而不是别人的演示案例。']],
    roomK: '真实课堂', roomH: '先在真实课堂中打磨，如今用在真实的生意里。',
    roomP: `在达拉斯与 Plano 举办的${talks(['零', '一', '两', '三', '四', '五', '六', '七', '八', '九'])}场社区讲座和一场 ${PROOF.hackathon} 人黑客松，是这套方法的试验场。经过这些课堂检验的方法，正是你将获得的：以真实工作为素材，搭建真正可运行的 AI 工作流。活动日期、场地和照片见<a href="/zh/ai-training/dallas/">达拉斯—沃斯堡企业 AI 培训</a>。`,
    roomAlt: '实操环节：每位学员都在处理自己的任务。', by: '常驻达拉斯 · 每场课程均亲自授课', about: '了解 Jack →',
    teamK: '按团队浏览', teamH: '你的团队从哪里开始？', teamMore: '全部应用场景 →', owners: '自己经营小企业？查看老板与团队的 AI 培训指南 →',
    progK: '培训项目', progH: '核心项目，围绕你的工作来做', progMore: '每节课安排与价格 →',
    prog: { k: '核心项目', big: `${S} 节课`, sub: `${S} × ${M} 分钟 · 定制 · 实时授课`, chip: '按需报价',
        p: '直接围绕你已经在做的任务，搭建真正用得上的 AI 工作流。课程内容随企业或团队的情况调整。',
        items: [`四节 ${M} 分钟的实时课程`, '围绕你的真实工作设计', '一次落地一条工作流', '课间复盘哪些有效', '每条工作流都设有人工核验环节', '全美远程授课'],
        cta: '查看四次课程项目', note: '团队培训？可定制报价。' },
    toolsK: '免费工具', toolsH: '三分钟，获得一份可用的结果', toolsMore: '全部免费工具 →',
    strip: ['37 人参与的达拉斯 AI 黑客松', 'Jack 在达拉斯的一场课程中讲解', '一个小组正在演示自己搭建的成果'],
    howK: '合作流程', howH: '从首次沟通，到真正落地的工作流', step: '第 {n} 步',
    how: [['一次简短的工作流沟通', '说说你或团队每周都在做什么、已经在用哪些工具，以及哪些工作总在重复。'], ['一份推荐的培训方案', '通过邮件给出建议：谁来参加、从哪几条工作流开始，以及书面报价。'], ['四节围绕真实工作的实时课程', '用你实际在做的工作来搭建、改进工作流，不用预设的演示案例。'], ['课间使用，再决定保留、调整或停止', '每节课都从上次以来哪些有效、哪些出了问题、哪些要调整开始。准确又有用的工作流留下，其余的调整或停用。']],
    bandH: '带一项任务来，<br>我们让它<em>真正运转</em>。',
    revK: 'Google 评价', revH: '学员怎么说', revMore: `查看 Google 上全部 ${PROOF.reviews} 条评价 ↗`,
    trustK: '安全、可衡量', trustH: '企业可以放心的几件事',
    trust: [['用公司已批准的工具', '培训使用公司已经购买或批准的 AI 工具，参加培训不需要另开新账号。'], ['使用模拟或脱敏材料练习', '练习使用模拟或脱敏的材料。针对你们实际使用的工具和方案，我们会讲清数据规则，包括哪些设置和管理员控制会影响业务数据是否被用于模型训练。'], ['每条工作流都设有人工核验环节', '核验由团队指定的人负责：哪些可以直接发出、哪些要先检查、哪些不应交给 AI。'], ['两周复盘', '一条工作流投入使用两周后，团队一起检查它有没有用在真实工作上、准确度够不够，再决定保留、调整还是停用。']],
  },
};

const STRIP = [['dallas-ai-hackathon-group', 1200, 910], ['dallas-session3-jack-presenting', 1600, 1066], ['dallas-ai-hackathon-live-demo', 1200, 900]];

const page = (lang) => {
  const c = C[lang], n2 = (i) => String(i + 1).padStart(2, '0');
  const head = (k, h, more) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2></div>${more ? `<a class="more" href="${more[0]}">${more[1]}</a>` : ''}</div>`;
  return {
    title: c.title, description: c.description, og: c.og, view: 'home_view', hero: 'photo', bodyClass: 'home-local',
    body: `${photoHero({ photo: 'workshop', alt: c.heroAlt, stats: c.stats, inner: `<div class="hero-main">
<div class="col-a"><div class="eyebrow">${c.eyebrow}</div><h1 class="xl brand-hero-title">${c.h1}</h1></div>
<div class="col-b"><p>${c.sub}</p><div class="cta-row">${planBtn(lang, { pos: 'hero', id: 'hero-cta' })}<a class="btn btn-secondary" href="${L(lang, '/ai-training/')}#formats" data-event="training_program_click" data-pos="hero">${c.seeProgram}</a></div></div></div>` })}

<section class="sec" id="learn"><div class="wrap">${head(c.learnK, c.learnH)}
<div class="g4">${c.learn.map(([h, p], i) => `<div class="oak learn-card"><span class="n">${n2(i)}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
${clientProof(lang, 'home')}

<section class="split-photo dark" id="rooms"><img src="/img/events/dallas-session3-hands-on.webp" width="1600" height="1066" loading="lazy" decoding="async" alt="${c.roomAlt}">
<div><div class="eyebrow" style="color:var(--on-dark-accent)">${c.roomK}</div><h2>${c.roomH}</h2><p>${c.roomP}</p>
<div class="byline"><img src="/img/jack-portrait-256.webp" width="256" height="256" loading="lazy" decoding="async" alt="Jack Qian"><div><b>Jack Qian</b><span>${c.by}</span></div><a href="${L(lang, '/about/')}">${c.about}</a></div></div></section>

${caseProof(lang)}
<section class="sec tight" id="testimonials"><div class="wrap">${head(c.revK, c.revH, [GBP_URL, c.revMore])}
<div class="quote-grid">${[0, 1, 4].map((i) => REVIEWS[lang][i]).map(([name, q]) => `<figure class="quote"><span class="stars" aria-label="5 stars">★★★★★</span><blockquote style="margin:0;flex-grow:1"><p>${q}</p></blockquote><figcaption><b>${name}</b> <span>· ${REVIEWS.by[lang]}</span></figcaption></figure>`).join('')}</div></div></section>
<section class="sec" id="teams"><div class="wrap">${head(c.teamK, c.teamH, [href(lang, '/use-cases/'), c.teamMore])}
<div class="rows">${USE_CASES.map((u, i) => { const x = loc(u, lang); return `<a href="${href(lang, `/use-cases/${u.slug}/`)}" data-event="use_case_click" data-pos="home"><span class="n">${n2(i)}</span><h3>${x.title}</h3><p>${x.card}</p><span class="go" aria-hidden="true">→</span></a>`; }).join('')}</div><p class="rows-more"><a href="${L(lang, '/ai-training/')}#team-owners" data-event="use_case_click" data-pos="home-owners">${c.owners}</a></p></div></section>

${chooser(lang, { pos: 'home' })}
<section class="sec tight" id="programs"><div class="wrap">${head(c.progK, c.progH, [L(lang, '/ai-training/') + '#formats', c.progMore])}
${progCard(c.prog, `<a class="btn btn-primary" href="${L(lang, '/ai-training/')}#formats" data-event="training_program_click" data-pos="home-programs">${c.prog.cta}</a>`)}</div></section>

<section class="sec tight" id="tools"><div class="wrap">${head(c.toolsK, c.toolsH, [href(lang, '/tools/'), c.toolsMore])}
<div class="g2">${TOOLS.map((x) => toolCard(x, lang)).join('')}${templateCard(templateBySlug['ai-use-case-discovery-worksheet'], lang)}</div></div></section>

<section class="photo-strip" aria-hidden="false">${STRIP.map(([f, w, h], i) => `<img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${c.strip[i]}">`).join('')}</section>

<section class="sec" id="how"><div class="wrap">${head(c.howK, c.howH)}
<ol class="steps-line">${c.how.map(([h, p], i) => `<li><span class="n">${c.step.includes('{n}') ? c.step.replace('{n}', i + 1) : `${c.step} ${i + 1}`}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></div></section>

<section class="sec tight" id="trust"><div class="wrap">${head(c.trustK, c.trustH)}
<div class="g4">${c.trust.map(([h, p], i) => `<div class="oak learn-card"><span class="n">${n2(i)}</span><h3>${h}</h3><p>${p}</p></div>`).join('')}</div></div></section>
${quickQuote(lang, { tool: 'general', path: '/' })}
${ctaBand(lang, { h: c.bandH, pos: 'home-final' })}`,
    jsonld: [business(lang), person(), website()],
  };
};

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];
