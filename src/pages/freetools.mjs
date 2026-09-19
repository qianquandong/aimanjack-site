// /tools/ hub + /tools/ai-readiness-assessment/. Deterministic, client-side, no email gate, no LLM (PRD §15–19, §84).
// The legacy /tools/missed-call-calculator/ lives in tools.mjs and stays noindex and unlinked.
import { SITE, R, L, href, loc, card, related, band, crumbs, page } from '../resources.mjs';
import { faq, pageHero } from '../components.mjs';
import { faqPage } from '../schema.mjs';
import { workflowBySlug } from '../content/workflows.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { useCaseBySlug } from '../content/usecases.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

const ARA_PATH = '/tools/ai-readiness-assessment/';

// ── Assessment definition ─────────────────────────────────────────────────
// 10 questions over 8 categories. Each option scores 0–4 in order. Category score = mean/4×100; overall = mean of all answers/4×100.
// This is a self-assessment built from what AI Man Jack sees in training sessions. It is not a validated instrument and the page says so.
export const CATEGORIES = {
  people: ['People', 'Train by function, on real tasks', 'Comfort comes from doing one real task, not from a product tour. Train each team on work it already does.'],
  usage: ['Usage', 'Start everyone on one narrow weekly task', 'Have each person list three weekly tasks and score them. The narrowest task that passes becomes their first workflow.'],
  processes: ['Processes', 'Turn one-off chats into repeatable workflows', 'A chat gives an answer. A workflow has inputs, steps, a reviewer and an owner, and runs the same way next week.'],
  knowledge: ['Knowledge', 'Document the sources AI is allowed to read', 'If nobody can point to the approved notes, price list or procedure, the model has nothing reliable to work from. Fix the source first.'],
  tools: ['Tools', 'Approve one tool, and say so in writing', 'People are already using personal accounts. Pick one approved tool, make it available, and tell everyone which one it is.'],
  governance: ['Governance', 'Put the data and sign-off rules on one page', 'Two lists: what must never go into an AI tool, and which outputs need a named person to check them before use.'],
  leadership: ['Leadership', 'Name an owner and review progress weekly', 'Adoption stalls when it is everybody’s side project. One named owner, one page a week: what changed, what is at risk, what needs a decision.'],
  measurement: ['Measurement', 'Review each workflow after two weeks: keep, change or stop', 'Ask three things: was it tested on real work, was it accurate enough to use, should it continue. Attendance and enthusiasm are not measures.'],
};

// Flywheel order (2026-09-19): result → free template → use case → training. Each area's first link is a template that fixes it.
export const NEXT = {
  people: ['team-ai-training-brief', 'leadership'], usage: ['ai-use-case-discovery-worksheet', 'leadership'],
  processes: ['ai-workflow-one-pager', 'operations'], knowledge: ['approved-source-inventory', 'operations'],
  tools: ['ai-tool-approval-checklist', 'leadership'], governance: ['ai-data-boundaries-one-pager', 'leadership'],
  leadership: ['weekly-executive-summary', 'leadership'], measurement: ['two-week-workflow-review', 'leadership'],
};

export const QUESTIONS = [
  ['people', 'How comfortable are most employees using a generative AI tool for their own work?', ['Most have never tried one', 'A few enthusiasts use it; most do not', 'Many have tried it; few use it regularly', 'Most use it for some tasks', 'Most use it confidently and know when not to']],
  ['usage', 'How often do employees currently use generative AI at work?', ['Never', 'Occasionally', 'Weekly', 'Daily', 'It is embedded into workflows']],
  ['processes', 'Have you identified specific recurring tasks where AI should be used?', ['No', 'Ideas have been discussed', 'A list exists but is not prioritised', 'A prioritised list with owners', 'Several are in use and get reviewed']],
  ['processes', 'When AI is used, is it a one-off chat or a repeatable workflow?', ['We do not use it', 'One-off chats, each person their own way', 'Some people reuse their own prompts', 'Shared prompts or templates for some tasks', 'Documented workflows with inputs, steps and a reviewer']],
  ['knowledge', 'How easy is it to give AI approved source material — notes, price lists, policies, procedures?', ['It mostly lives in people’s heads', 'It exists but is hard to find', 'Some teams keep it organised', 'Most of it is documented and findable', 'Maintained, with owners and review dates']],
  ['tools', 'Which AI tools are employees allowed to use?', ['Nothing decided; people use personal accounts', 'Tolerated informally, nothing in writing', 'One approved tool, limited rollout', 'Approved tools available to most employees', 'Approved tools connected to the systems we work in']],
  ['governance', 'Do employees know which information must not go into an AI tool?', ['There is no guidance', 'We assume common sense', 'Verbal guidance only', 'Written guidance, shared with everyone', 'Written, trained and periodically checked']],
  ['governance', 'Before AI output is used — sent to a customer, put in a report — who checks it?', ['Nobody in particular', 'The author, when they remember', 'The author, always', 'A named reviewer for important outputs', 'Review steps defined per workflow']],
  ['leadership', 'How involved is leadership in AI adoption?', ['It has not been discussed', 'Curious, but nobody owns it', 'Someone is informally responsible', 'A named owner with goals', 'Leaders use AI themselves and review progress']],
  ['measurement', 'How do you know whether an AI workflow is working?', ['We do not', 'Anecdotes', 'Occasional check-ins', 'A review after a set period: keep, change or stop', 'Tracked measures for each workflow']],
];

export const BANDS = [[0, 'Exploring', 'AI is mostly individual curiosity. The fastest progress comes from one approved tool and one narrow task per team.'], [26, 'Early adoption', 'People are using AI, each in their own way. The gap is shared workflows, written data rules and someone who owns adoption.'], [51, 'Scaling', 'There are real workflows and some structure. The work now is consistency: review steps, measurement, and training by function.'], [76, 'AI-enabled', 'AI is part of how work gets done, with ownership and review. Keep measuring, and retire workflows that stopped earning their place.']];

// Pure scoring function — shared by the page script (stringified below) and by tests.
export function score(answers, questions) {
  const by = {}; let sum = 0;
  answers.forEach((a, i) => { const c = questions[i][0]; (by[c] = by[c] || []).push(a); sum += a; });
  const cats = {}; Object.keys(by).forEach((c) => { cats[c] = Math.round(by[c].reduce((x, y) => x + y, 0) / by[c].length / 4 * 100); });
  return { overall: Math.round(sum / answers.length / 4 * 100), cats };
}

const FAQ = [
  ['What is an AI readiness assessment?', 'An AI readiness assessment evaluates whether a team has what it needs to adopt AI effectively: people who are comfortable using it, identified tasks, documented source material, approved tools, data and review rules, leadership ownership and a way to measure results.'],
  ['How long does it take?', 'About three minutes. There are 10 multiple-choice questions and you see your score immediately.'],
  ['Do I need to enter my email?', 'No. The score, the category breakdown and the recommendations are shown without sign-up. Nothing you answer is sent to a server; the calculation runs in your browser.'],
  ['Is the score scientifically validated?', 'No. The AI Man Jack AI Readiness Score is a structured self-assessment based on what we see in hands-on training sessions. It is a conversation starter for a team, not a benchmark against other companies.'],
  ['Who should take it?', 'Whoever is responsible for how a team works: a department head, an operations lead, a founder. It is most useful when three or four people on the same team take it separately and compare answers.'],
  ['What should we do with a low score?', 'Start with the lowest category. In most teams that is governance or processes: write down what must not go into an AI tool, then pick one narrow recurring task and turn it into a workflow with a named reviewer.'],
];

// Client script. Progressive: all questions are in the HTML; JS turns them into a one-at-a-time flow with progress, back, session persistence.
const araScript = `<script>(function(){var A=window.ARA,D=document,root=D.getElementById('ara');if(!root)return;
var qs=[].slice.call(root.querySelectorAll('.ara-q')),bar=D.getElementById('ara-bar'),lab=D.getElementById('ara-step'),back=D.getElementById('ara-back'),res=D.getElementById('ara-result'),form=D.getElementById('ara-form'),KEY='ara-v1',ans=[],i=0,started=false;
var T=window.amjTrack||function(){};
try{var s=JSON.parse(sessionStorage.getItem(KEY)||'null');if(s&&s.length<=qs.length){ans=s;i=Math.min(s.length,qs.length-1)}}catch(e){}
var score=${score.toString()};
function save(){try{sessionStorage.setItem(KEY,JSON.stringify(ans))}catch(e){}}
function show(){root.classList.add('js');qs.forEach(function(q,k){q.hidden=k!==i});lab.textContent=A.ui.step.replace('{i}',i+1).replace('{n}',qs.length);bar.style.width=Math.round(i/qs.length*100)+'%';back.hidden=i===0;
 var pick=ans[i];qs[i].querySelectorAll('input').forEach(function(r){r.checked=String(pick)===r.value});}
function band(n){var b=A.bands[0];A.bands.forEach(function(x){if(n>=x[0])b=x});return b}
function done(){var r=score(ans,A.questions),b=band(r.overall),keys=Object.keys(r.cats).sort(function(x,y){return r.cats[x]-r.cats[y]});
 var weak=keys.slice(0,3),strong=keys.slice(-2).reverse();form.hidden=true;res.hidden=false;
 D.getElementById('ara-score').textContent=r.overall;D.getElementById('ara-band').textContent=b[1];D.getElementById('ara-band-text').textContent=b[2];D.getElementById('ara-ring').style.setProperty('--p',r.overall);
 D.getElementById('ara-bars').innerHTML=Object.keys(A.cats).map(function(k){return '<div class="bar-row"><span>'+A.cats[k][0]+'</span><span class="bar"><i style="width:'+r.cats[k]+'%"></i></span><b>'+r.cats[k]+'</b></div>'}).join('');
 D.getElementById('ara-strong').textContent=strong.map(function(k){return A.cats[k][0]}).join(' · ');D.getElementById('ara-weak').textContent=weak.map(function(k){return A.cats[k][0]}).join(' · ');
 D.getElementById('ara-next').innerHTML=weak.map(function(k){var c=A.cats[k];return '<li><strong>'+c[1]+A.ui.dot+'</strong> '+c[2]+'<span class="ara-links"><a class="btn btn-secondary btn-sm" href="'+c[3]+'" data-event="tool_template_click" data-pos="'+k+'">'+A.ui.tpl+c[4]+' &rarr;</a><a href="'+c[5]+'" data-event="use_case_click" data-pos="tool-'+k+'">'+A.ui.uc+c[6]+' &rarr;</a></span></li>'}).join('');
 var goal=A.ui.goal.replace('{s}',r.overall).replace('{b}',b[1]).replace('{w}',weak.map(function(k){return A.cats[k][0]}).join(', '));D.getElementById('ara-book').href=A.ui.book+'?goal='+encodeURIComponent(goal);
 T('tool_complete',{tool:'ai-readiness-assessment',score:r.overall,band:b[1]});T('tool_result_view',{tool:'ai-readiness-assessment'});res.scrollIntoView({behavior:'smooth',block:'start'});res.focus()}
root.addEventListener('change',function(e){if(e.target.name&&e.target.name.indexOf('q')===0){if(!started){started=true;T('tool_start',{tool:'ai-readiness-assessment'})}
 ans[i]=Number(e.target.value);save();setTimeout(function(){if(i<qs.length-1){i++;show();qs[i].querySelector('input').focus()}else done()},180)}});
back.addEventListener('click',function(){if(i>0){i--;show()}});
D.getElementById('ara-again').addEventListener('click',function(){ans=[];i=0;save();res.hidden=true;form.hidden=false;show();form.scrollIntoView({behavior:'smooth'})});
if(ans.length===qs.length)done();else show();})();</script>`;


// ── Chinese version of the assessment (same keys, same scoring) ───────────
const ZH = {
  CATEGORIES: {
    people: ['人员', '按职能培训，基于真实任务练习', '对 AI 的熟悉来自完成一项真实任务，而不是观看产品演示。让每个团队围绕自己已有的工作进行练习。'],
    usage: ['使用', '让每个人从一项范围明确的每周任务开始', '请每位员工列出三项每周任务并打分，通过评估且范围最窄的那一项，就是其第一条工作流。'],
    processes: ['流程', '将一次性的对话升级为可复用的工作流', '对话产出的是一个回答；工作流则有明确的输入、步骤、核验人与负责人，下周仍能以同样方式运行。'],
    knowledge: ['知识', '将允许 AI 读取的资料整理成文', '如果没有人能指出经批准的记录、价目表或流程文档，模型就没有可靠的依据。请先补齐资料来源。'],
    tools: ['工具', '批准一款工具，并以书面形式明确', '员工实际上已在使用个人账号。请选定一款经批准的工具，向全员开放，并明确告知是哪一款。'],
    governance: ['治理', '用一页纸写明数据规则与签字规则', '列出两份清单：哪些信息不得输入 AI 工具；哪些输出在使用前必须由指定人员核验。'],
    leadership: ['领导力', '指定负责人，并每周复盘进展', '当 AI 落地只是每个人的副业时，推进就会停滞。请指定一位负责人，每周用一页纸说明：有何变化、存在哪些风险、需要哪些决策。'],
    measurement: ['衡量', '每条工作流运行两周后复盘：保留、调整或停止', '只问三个问题：是否在真实工作中测试过？结果是否足够准确？是否应当继续？出勤率与热情不是衡量标准。'],
  },
  QUESTIONS: [
    ['大多数员工在自己的工作中使用生成式 AI 工具的熟练程度如何？', ['大多数人从未尝试', '少数爱好者在用，多数人没有', '不少人试过，但很少经常使用', '大多数人会在部分任务中使用', '大多数人能熟练使用，并清楚何时不该使用']],
    ['员工目前在工作中使用生成式 AI 的频率如何？', ['从不使用', '偶尔使用', '每周使用', '每天使用', '已嵌入工作流']],
    ['是否已识别出应当使用 AI 的具体重复性任务？', ['没有', '讨论过一些想法', '有清单，但尚未排序', '有排序清单，并明确了负责人', '已有数项投入使用并定期复盘']],
    ['使用 AI 时，是一次性的对话，还是可复用的工作流？', ['尚未使用', '一次性对话，各人做法不同', '部分员工会复用自己的提示词', '部分任务已有共享的提示词或模板', '有成文的工作流，包含输入、步骤与核验人']],
    ['向 AI 提供经批准的资料（记录、价目表、制度、流程）是否方便？', ['大多只存在于员工的头脑中', '资料存在，但很难找到', '部分团队整理得较好', '大部分已成文且便于查找', '有专人维护，并设有复核日期']],
    ['员工被允许使用哪些 AI 工具？', ['尚未决定，员工使用个人账号', '非正式默许，没有书面规定', '已批准一款工具，小范围使用', '已批准的工具向大多数员工开放', '已批准的工具与日常业务系统打通']],
    ['员工是否清楚哪些信息不得输入 AI 工具？', ['没有任何指引', '默认靠常识判断', '仅有口头指引', '有书面指引，并已告知全员', '有书面指引，已培训并定期检查']],
    ['AI 的输出在使用之前（发给客户、写入报告），由谁核验？', ['没有明确的人', '作者想起来时自行检查', '作者每次都会检查', '重要输出有指定的核验人', '每条工作流都规定了核验步骤']],
    ['管理层对 AI 落地的参与程度如何？', ['尚未讨论过', '有兴趣，但无人负责', '有人非正式地负责', '有明确的负责人与目标', '管理者本人使用 AI，并定期复盘进展']],
    ['如何判断一条 AI 工作流是否有效？', ['无从判断', '凭个别反馈', '偶尔跟进', '在固定周期后复盘：保留、调整或停止', '每条工作流都有持续跟踪的指标']],
  ],
  BANDS: [[0, '探索阶段', 'AI 目前主要是个人层面的尝试。进展最快的做法，是为每个团队确定一款经批准的工具和一项范围明确的任务。'], [26, '早期应用', '员工已在使用 AI，但各行其是。差距在于共享的工作流、书面的数据规则，以及对落地负责的人。'], [51, '规模推广', '已经有真实运行的工作流和一定的规范。接下来的重点是一致性：核验步骤、效果衡量，以及按职能开展培训。'], [76, 'AI 赋能', 'AI 已成为工作方式的一部分，并有明确的负责人与核验机制。请持续衡量，并停用已不再产生价值的工作流。']],
  FAQ: [
    ['什么是 AI 准备度评估？', 'AI 准备度评估用于判断一个团队是否具备有效采用 AI 的条件：员工能够熟练使用、已识别出合适的任务、资料来源成文、工具经过批准、有数据与核验规则、管理层有人负责，并且有衡量结果的方法。'],
    ['需要多长时间？', '约三分钟。共 10 道选择题，完成后立即显示得分。'],
    ['需要填写邮箱吗？', '不需要。得分、各维度结果与建议均可直接查看，无需注册。你的回答不会发送到服务器，计算在浏览器中完成。'],
    ['这个得分经过科学验证吗？', '没有。AI Man Jack AI 准备度得分是一份结构化的自评，依据的是我们在实操培训中的观察。它适合作为团队讨论的起点，而不是与其他公司对比的基准。'],
    ['适合由谁来完成？', '对团队工作方式负责的人：部门负责人、运营主管或创始人。建议同一团队的三四位成员分别完成，再对比各自的回答，效果最好。'],
    ['得分较低该怎么办？', '从得分最低的维度入手。多数团队的短板在治理或流程：先写明哪些信息不得输入 AI 工具，再选定一项范围明确的重复性任务，将其做成有指定核验人的工作流。'],
  ],
};

const UI = {
  en: { path: ARA_PATH, title: 'Free AI Readiness Assessment for Teams | AI Man Jack', desc: 'Evaluate your team’s AI readiness across people, processes, tools, governance and leadership. 10 questions, 3 minutes, a score and practical next steps. No email required.',
    eyebrow: 'Free tool · 3 min · no sign-up', h1: 'AI Readiness Assessment', lead: 'An AI readiness assessment checks whether a team has the people, processes, knowledge, tools, governance, leadership and measurement it needs to adopt AI. Answer 10 questions about your team and get a score with next steps.',
    n: '10 questions', back: '← Back', noscript: 'Scoring runs in your browser and needs JavaScript. The questions above still work as a discussion sheet: score each answer 0–4 from top to bottom.',
    scoreK: 'AI Man Jack AI Readiness Score', strong: 'Strongest areas', weak: 'Weakest areas', next: 'Recommended next steps', ctaH: 'Run this assessment with your team', ctaP: 'In a 30-minute call we go through your weakest areas and what a first workshop would cover. Your score is passed along so you do not have to repeat it.', retake: 'Retake', fine: 'A structured self-assessment, not a validated benchmark. Nothing you answered left your browser.',
    dot: '.', tplLabel: 'Free template: ', ucLabel: 'How teams use it: ', path: 'Each step starts with a free template you can fill in today. From there you can see how teams like yours use it, and how to work through it with Jack.',
    step: 'Question {i} of {n}', goal: 'AI readiness score {s} ({b}). Weakest: {w}.',
    howH: 'How it works', howP: 'Ten multiple-choice questions cover eight areas. Each answer scores 0 to 4. Your overall score is the average across all answers, scaled to 100; each area gets its own score the same way. The calculation is fixed and runs in your browser — the same answers always give the same result.', th: ['Score', 'Stage', 'What it usually looks like'],
    whyH: 'Why this matters', whyP: 'Most teams do not fail at AI because of the model. They stall because nobody decided which tasks are worth it, which tool is allowed, what data is off-limits, or who checks the output. Those are organisational questions, and they can be answered in an afternoon once someone asks them.',
    readH: 'How to interpret your result', read: [['Look at the lowest area first.', 'An overall 60 with governance at 25 is a governance problem, not a 60.'], ['Compare answers inside the team.', 'If a manager answers “written guidance” and the team answers “no guidance”, the guidance has not landed.'], ['A low score is not a verdict.', 'Exploring is where every team starts. The next step is one tool and one narrow task.'], ['A high score needs evidence.', 'If you scored 80+, can you name three workflows, their owners and when each was last reviewed?']],
    areasH: 'What the eight areas cover', bestH: 'Best practices', best: ['Have three or four people take it separately, then discuss the differences.', 'Retake it a quarter after training. The area scores should move; if they do not, the training did not change the work.', 'Do not average teams together. Sales and operations are usually at different stages.'],
    faqH: 'Questions people ask', relK: 'Next', relH: 'Start with these', bandH: 'Turn the score into a <em>plan.</em>', bandP: 'A half-day workshop covers the lowest areas with your team, on tasks they already do.',
    hubTitle: 'Free AI Tools for Teams: Assess, Plan and Adopt AI | AI Man Jack', hubDesc: 'Free, practical tools to help your team find, evaluate and implement useful AI opportunities. Start with the 3-minute AI Readiness Assessment. No sign-up.',
    hubK: 'Free · no sign-up', hubH: 'Free AI tools', hubP: 'Practical tools to help your team find, evaluate and implement useful AI opportunities. Each one gives you a result you can use straight away.', soon: 'In development: an AI Use Case Finder and an AI ROI Calculator. Both will be deterministic and free, like this one.',
    hubBand: 'Tools show where you are.<br>Training moves you <em>forward.</em>',
    tool: { kicker: 'Assessment', title: 'AI Readiness Assessment', text: 'Measure how prepared your team is to adopt AI across eight areas, and get next steps for the weakest ones.', tags: ['3 min', 'Free', 'No sign-up'], cta: 'Start assessment' },
    sheet: { kicker: 'Planning · worksheet', text: 'The pen-and-paper exercise that opens every session: three weekly tasks, four questions, pick the narrowest one that passes.', tags: ['15 min', 'Free', 'No AI tool needed'], cta: 'Open worksheet' } },
  zh: { title: '免费 AI 准备度评估（团队版） | AI Man Jack', desc: '从人员、流程、工具、治理与领导力等维度评估团队的 AI 准备度。10 个问题，3 分钟，获得得分与可执行的后续建议，无需邮箱。',
    eyebrow: '免费工具 · 3 分钟 · 无需注册', h1: 'AI 准备度评估', lead: 'AI 准备度评估用于判断团队在人员、流程、知识、工具、治理、领导力与衡量等方面，是否具备采用 AI 的条件。回答 10 个关于团队的问题，即可获得得分与后续建议。',
    n: '共 10 个问题', back: '← 返回', noscript: '评分在浏览器中完成，需要启用 JavaScript。上述问题仍可作为讨论表使用：每个选项自上而下记 0–4 分。',
    scoreK: 'AI Man Jack AI 准备度得分', strong: '优势维度', weak: '薄弱维度', next: '建议的后续步骤', ctaH: '与团队一起完成这项评估', ctaP: '在 30 分钟通话中，我们将梳理薄弱维度，并说明首场工作坊会涵盖的内容。得分会随预约一并提交，无需重复说明。', retake: '重新评估', fine: '这是一份结构化的自评，并非经过验证的基准。你的回答不会离开浏览器。',
    dot: '。', tplLabel: '免费模板：', ucLabel: '团队如何使用：', path: '每一步都从一份今天就能填写的免费模板开始。你可以由此了解同类团队的用法，以及如何与 Jack 一起完成。',
    step: '第 {i} 题，共 {n} 题', goal: 'AI 准备度得分 {s}（{b}）。薄弱维度：{w}。',
    howH: '评估方式', howP: '十道选择题覆盖八个维度，每个回答计 0 至 4 分。总分为全部回答的平均值，并换算为百分制；各维度得分的计算方式相同。算法固定，并在浏览器中运行：相同的回答始终得到相同的结果。', th: ['得分', '阶段', '通常的表现'],
    whyH: '为什么重要', whyP: '多数团队在 AI 上受阻，并不是因为模型本身，而是因为没有人决定：哪些任务值得做、允许使用哪款工具、哪些数据不得输入、由谁核验输出。这些是组织层面的问题，只要有人提出，一个下午就能得出答案。',
    readH: '如何解读结果', read: [['先看得分最低的维度。', '总分 60、治理仅 25，说明问题在治理，而不是“60 分”。'], ['对比团队内部的回答。', '如果管理者选择“有书面指引”，而团队选择“没有指引”，说明指引并未真正传达到位。'], ['低分不是定论。', '每个团队都从探索阶段起步，下一步是确定一款工具和一项范围明确的任务。'], ['高分需要证据。', '如果得分在 80 以上，你能否说出三条工作流、各自的负责人以及最近一次复盘的时间？']],
    areasH: '八个维度分别涵盖什么', bestH: '使用建议', best: ['请三四位成员分别完成，再讨论回答中的差异。', '培训结束一个季度后重新评估。各维度得分应有变化；如果没有，说明培训并未改变实际工作。', '不要将不同团队的得分平均。销售与运营通常处于不同阶段。'],
    faqH: '常见问题', relK: '下一步', relH: '建议从这些内容开始', bandH: '把得分变成一份<em>行动计划</em>。', bandP: '半天工作坊将与团队一起，围绕他们已有的任务补齐薄弱维度。',
    hubTitle: '面向团队的免费 AI 工具：评估、规划与落地 | AI Man Jack', hubDesc: '免费、实用的工具，帮助团队发现、评估并落地有价值的 AI 应用。可从 3 分钟的 AI 准备度评估开始，无需注册。',
    hubK: '免费 · 无需注册', hubH: '免费 AI 工具', hubP: '实用工具，帮助团队发现、评估并落地有价值的 AI 应用。每个工具都会给出一份可直接使用的结果。', soon: '开发中：AI 应用场景查找器与 AI 投资回报计算器。两者都将采用固定算法，并免费提供。',
    hubBand: '工具告诉你现状，<br>培训带你<em>向前</em>。',
    tool: { kicker: '评估', title: 'AI 准备度评估', text: '从八个维度衡量团队采用 AI 的准备程度，并针对薄弱维度给出后续建议。', tags: ['3 分钟', '免费', '无需注册'], cta: '开始评估' },
    sheet: { kicker: '规划 · 工作表', text: '每场课程开场使用的纸笔练习：三项每周任务、四个问题，选出通过评估且范围最窄的一项。', tags: ['15 分钟', '免费', '无需 AI 工具'], cta: '查看工作表' } },
};

const dataFor = (lang) => {
  const zh = lang === 'zh';
  const cats = zh ? ZH.CATEGORIES : CATEGORIES;
  const qs = QUESTIONS.map(([c, q, o], i) => (zh ? [c, ZH.QUESTIONS[i][0], ZH.QUESTIONS[i][1]] : [c, q, o]));
  return { cats, qs, bands: zh ? ZH.BANDS : BANDS, faq: zh ? ZH.FAQ : FAQ };
};

const assessment = () => page({
  path: ARA_PATH, priority: 0.9,
  build: (lang) => {
    const u = UI[lang], r = R[lang], d = dataFor(lang), bc = crumbs(lang, [[r.tools, '/tools/'], [u.h1, ARA_PATH]]);
    const cats = Object.fromEntries(Object.entries(d.cats).map(([k, v]) => { const [tpl, uc] = NEXT[k];
      return [k, [v[0], v[1], v[2], href(lang, `/templates/${tpl}/`), loc(templateBySlug[tpl], lang).title, href(lang, `/use-cases/${uc}/`), loc(useCaseBySlug[uc], lang).title]]; }));
    const data = { questions: d.qs.map(([c]) => [c]), cats, bands: d.bands, ui: { step: u.step, goal: u.goal, book: L(lang, '/book/'), dot: u.dot, tpl: u.tplLabel, uc: u.ucLabel } };
    const questions = d.qs.map(([c, q, opts], n) => `<fieldset class="ara-q"><legend><span class="ara-cat">${d.cats[c][0]}</span>${q}</legend>${opts.map((o, v) => `<label class="ara-opt"><input type="radio" name="q${n}" value="${v}"><span>${o}</span></label>`).join('')}</fieldset>`).join('\n');
    return {
      view: 'tool_view', title: u.title, description: u.desc,
      body: `${pageHero(lang, { crumbs: bc.html, eyebrow: u.eyebrow, h1: u.h1, sub: u.lead, ctas: false })}
<section style="padding-bottom:96px"><div class="wrap narrow"><div class="ara" id="ara">
<form id="ara-form" onsubmit="return false" aria-label="${u.h1}">
<div class="ara-head"><span id="ara-step">${u.n}</span><button type="button" class="linkish" id="ara-back" hidden>${u.back}</button></div>
<div class="ara-progress" aria-hidden="true"><i id="ara-bar"></i></div>
${questions}
<noscript><p class="callout">${u.noscript}</p></noscript>
</form>
<div id="ara-result" class="ara-result" hidden tabindex="-1" aria-live="polite">
<p class="eyebrow">${u.scoreK}</p>
<div class="ara-top"><div class="ara-ring" id="ara-ring"><b id="ara-score">0</b><span>/ 100</span></div><div><h2 id="ara-band" class="h2-sm">—</h2><p id="ara-band-text" class="muted"></p></div></div>
<div id="ara-bars" class="bars"></div>
<div class="g2 ara-sw"><div class="card" style="padding:24px"><h3>${u.strong}</h3><p id="ara-strong"></p></div><div class="card" style="padding:24px"><h3>${u.weak}</h3><p id="ara-weak"></p></div></div>
<h3 style="margin-top:32px">${u.next}</h3><p class="muted" style="font-size:15px;margin-top:6px">${u.path}</p><ol id="ara-next" class="ara-next"></ol>
<div class="ara-cta"><h3>${u.ctaH}</h3><p>${u.ctaP}</p>
<div class="cta-row"><a class="btn btn-primary" id="ara-book" href="${L(lang, '/book/')}" data-event="book_workshop_click" data-pos="tool-result">${lang === 'zh' ? '预约团队培训' : 'Book a Workshop'}</a><button type="button" class="btn btn-secondary" id="ara-again">${u.retake}</button></div></div>
<p class="muted" style="font-size:14px;margin-top:18px">${u.fine}</p>
</div></div></div></section>
<script>window.ARA=${JSON.stringify(data)}</script>${araScript}
<section class="sec" style="padding-top:0"><div class="wrap narrow"><div class="art-body" style="grid-column:auto">
<h2>${u.howH}</h2><p>${u.howP}</p>
<div class="table-wrap"><table class="compare"><thead><tr>${u.th.map((x) => `<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${d.bands.map(([min, name, text], i) => `<tr><th scope="row">${min}–${d.bands[i + 1] ? d.bands[i + 1][0] - 1 : 100}</th><td>${name}</td><td>${text}</td></tr>`).join('')}</tbody></table></div>
<h2>${u.whyH}</h2><p>${u.whyP}</p>
<h2>${u.readH}</h2><ul>${u.read.map(([b, t]) => `<li><strong>${b}</strong> ${t}</li>`).join('')}</ul>
<h2>${u.areasH}</h2><ul>${Object.values(d.cats).map(([n, h, t]) => `<li><strong>${n}${lang === 'zh' ? '：' : '.'}</strong> ${t}</li>`).join('')}</ul>
<h2>${u.bestH}</h2><ul>${u.best.map((x) => `<li>${x}</li>`).join('')}</ul>
<h2>${u.faqH}</h2></div>${faq(lang, d.faq, { heading: false })}</div></section>
${related(u.relK, u.relH, ['ai-data-boundaries-one-pager', 'ai-workflow-one-pager', 'ai-use-case-discovery-worksheet'].map((x) => templateCard(templateBySlug[x], lang)), [href(lang, '/templates/'), r.allTemplates])}
${band(lang, { h: u.bandH, sub: u.bandP, pos: 'tool-ara' })}`,
      jsonld: [{ '@type': 'WebApplication', '@id': `${SITE}${L(lang, ARA_PATH)}#app`, name: u.h1, url: `${SITE}${L(lang, ARA_PATH)}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', inLanguage: lang, isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: u.desc, provider: { '@id': `${SITE}/#business` } },
        faqPage(d.faq, `${SITE}${L(lang, ARA_PATH)}#faq`), bc.ld],
    };
  },
});

export const TOOLS = [{ path: ARA_PATH }];
export const toolCard = (t, lang = 'en', hl = 'h3') => card({ href: href(lang, t.path), ...UI[lang].tool, event: 'tool_click', hl });

const hub = () => page({
  path: '/tools/', priority: 0.8, changefreq: 'weekly',
  build: (lang) => {
    const u = UI[lang], r = R[lang], bc = crumbs(lang, [[r.tools, '/tools/']]), sheet = templateBySlug['ai-use-case-discovery-worksheet'];
    return {
      view: 'free_tools_view', title: u.hubTitle, description: u.hubDesc,
      body: `${pageHero(lang, { crumbs: bc.html, eyebrow: u.hubK, h1: u.hubH, sub: u.hubP, ctas: false, cls: 'lg' })}
<section class="sec tight"><div class="wrap"><div class="g2">${TOOLS.map((t) => toolCard(t, lang, 'h2')).join('\n')}
${card({ href: href(lang, `/templates/${sheet.slug}/`), ...u.sheet, title: (lang === 'zh' && sheet.zh ? sheet.zh.title : sheet.title), hl: 'h2', event: 'template_click' })}</div>
<p class="section-note">${u.soon}</p></div></section>
${band(lang, { h: u.hubBand, pos: 'tools-hub' })}`,
      jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}${L(lang, '/tools/')}`, name: u.hubH, inLanguage: lang, isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
    };
  },
});

export const pages = [hub(), assessment()];
