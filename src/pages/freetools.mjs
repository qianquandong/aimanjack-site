// /tools/ hub + /tools/ai-readiness-assessment/. Deterministic, client-side, no email gate, no LLM (PRD §15–19, §84).
// The legacy /tools/missed-call-calculator/ lives in tools.mjs and stays noindex and unlinked.
import { SITE, card, resourceHero, related, trainingCta, crumbs, page } from '../resources.mjs';
import { faq } from '../components.mjs';
import { faqPage } from '../schema.mjs';
import { workflowBySlug } from '../content/workflows.mjs';
import { templateBySlug } from '../content/templates.mjs';
import { workflowCard, templateCard } from './workflows.mjs';

const ARA_PATH = '/tools/ai-readiness-assessment/';

// ── Assessment definition ─────────────────────────────────────────────────
// 10 questions over 8 categories. Each option scores 0–4 in order. Category score = mean/4×100; overall = mean of all answers/4×100.
// This is a self-assessment built from what AI Man Jack sees in training sessions. It is not a validated instrument and the page says so.
export const CATEGORIES = {
  people: ['People', 'Train by function, on real tasks', 'Comfort comes from doing one real task, not from a product tour. Train each team on work it already does.', '/ai-training/', 'How hands-on training works'],
  usage: ['Usage', 'Start everyone on one narrow weekly task', 'Have each person list three weekly tasks and score them. The narrowest task that passes becomes their first workflow.', '/templates/ai-use-case-discovery-worksheet/', 'AI Use Case Discovery Worksheet'],
  processes: ['Processes', 'Turn one-off chats into repeatable workflows', 'A chat gives an answer. A workflow has inputs, steps, a reviewer and an owner, and runs the same way next week.', '/workflows/', 'Browse AI workflows'],
  knowledge: ['Knowledge', 'Document the sources AI is allowed to read', 'If nobody can point to the approved notes, price list or procedure, the model has nothing reliable to work from. Fix the source first.', '/workflows/sop-creation/', 'SOP creation workflow'],
  tools: ['Tools', 'Approve one tool, and say so in writing', 'People are already using personal accounts. Pick one approved tool, make it available, and tell everyone which one it is.', '/use-cases/leadership/', 'AI for leaders and managers'],
  governance: ['Governance', 'Put the data and sign-off rules on one page', 'Two lists: what must never go into an AI tool, and which outputs need a named person to check them before use.', '/use-cases/leadership/', 'AI for leaders and managers'],
  leadership: ['Leadership', 'Name an owner and review progress weekly', 'Adoption stalls when it is everybody’s side project. One named owner, one page a week: what changed, what is at risk, what needs a decision.', '/workflows/executive-brief/', 'Executive brief workflow'],
  measurement: ['Measurement', 'Review each workflow after two weeks: keep, change or stop', 'Ask three things: was it tested on real work, was it accurate enough to use, should it continue. Attendance and enthusiasm are not measures.', '/ai-training/#curriculum', 'The five-part method'],
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
function show(){root.classList.add('js');qs.forEach(function(q,k){q.hidden=k!==i});lab.textContent='Question '+(i+1)+' of '+qs.length;bar.style.width=Math.round(i/qs.length*100)+'%';back.hidden=i===0;
 var pick=ans[i];qs[i].querySelectorAll('input').forEach(function(r){r.checked=String(pick)===r.value});}
function band(n){var b=A.bands[0];A.bands.forEach(function(x){if(n>=x[0])b=x});return b}
function done(){var r=score(ans,A.questions),b=band(r.overall),keys=Object.keys(r.cats).sort(function(x,y){return r.cats[x]-r.cats[y]});
 var weak=keys.slice(0,3),strong=keys.slice(-2).reverse();form.hidden=true;res.hidden=false;
 D.getElementById('ara-score').textContent=r.overall;D.getElementById('ara-band').textContent=b[1];D.getElementById('ara-band-text').textContent=b[2];D.getElementById('ara-ring').style.setProperty('--p',r.overall);
 D.getElementById('ara-bars').innerHTML=Object.keys(A.cats).map(function(k){return '<div class="bar-row"><span>'+A.cats[k][0]+'</span><span class="bar"><i style="width:'+r.cats[k]+'%"></i></span><b>'+r.cats[k]+'</b></div>'}).join('');
 D.getElementById('ara-strong').textContent=strong.map(function(k){return A.cats[k][0]}).join(' · ');D.getElementById('ara-weak').textContent=weak.map(function(k){return A.cats[k][0]}).join(' · ');
 D.getElementById('ara-next').innerHTML=weak.map(function(k){var c=A.cats[k];return '<li><strong>'+c[1]+'.</strong> '+c[2]+' <a href="'+c[3]+'" data-event="tool_resource_click" data-pos="'+k+'">'+c[4]+' &rarr;</a></li>'}).join('');
 var goal='AI readiness score '+r.overall+' ('+b[1]+'). Weakest: '+weak.map(function(k){return A.cats[k][0]}).join(', ')+'.';D.getElementById('ara-book').href='/book/?goal='+encodeURIComponent(goal);
 T('tool_complete',{tool:'ai-readiness-assessment',score:r.overall,band:b[1]});T('tool_result_view',{tool:'ai-readiness-assessment'});res.scrollIntoView({behavior:'smooth',block:'start'});res.focus()}
root.addEventListener('change',function(e){if(e.target.name&&e.target.name.indexOf('q')===0){if(!started){started=true;T('tool_start',{tool:'ai-readiness-assessment'})}
 ans[i]=Number(e.target.value);save();setTimeout(function(){if(i<qs.length-1){i++;show();qs[i].querySelector('input').focus()}else done()},180)}});
back.addEventListener('click',function(){if(i>0){i--;show()}});
D.getElementById('ara-again').addEventListener('click',function(){ans=[];i=0;save();res.hidden=true;form.hidden=false;show();form.scrollIntoView({behavior:'smooth'})});
if(ans.length===qs.length)done();else show();})();</script>`;

const assessment = () => {
  const bc = crumbs([['Free Tools', '/tools/'], ['AI Readiness Assessment', ARA_PATH]]);
  const data = { questions: QUESTIONS.map(([c]) => [c]), cats: CATEGORIES, bands: BANDS };
  const questions = QUESTIONS.map(([c, q, opts], n) => `<fieldset class="ara-q"><legend><span class="ara-cat">${CATEGORIES[c][0]}</span>${q}</legend>${opts.map((o, v) => `<label class="ara-opt"><input type="radio" name="q${n}" value="${v}"><span>${o}</span></label>`).join('')}</fieldset>`).join('\n');
  return page({
    path: ARA_PATH, priority: 0.9, changefreq: 'monthly', view: 'tool_view',
    title: 'Free AI Readiness Assessment for Teams | AI Man Jack',
    description: 'Evaluate your team’s AI readiness across people, processes, tools, governance and leadership. 10 questions, 3 minutes, a score and practical next steps. No email required.',
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Free tool · 3 min · no sign-up', h1: 'AI Readiness Assessment', lead: 'An AI readiness assessment checks whether a team has the people, processes, knowledge, tools, governance, leadership and measurement it needs to adopt AI. Answer 10 questions about your team and get a score with next steps.' })}
<section class="wrap narrow" style="padding-bottom:64px"><div class="ara" id="ara">
<form id="ara-form" onsubmit="return false" aria-label="AI Readiness Assessment">
<div class="ara-head"><span id="ara-step">10 questions</span><button type="button" class="linkish" id="ara-back" hidden>&larr; Back</button></div>
<div class="ara-progress" aria-hidden="true"><i id="ara-bar"></i></div>
${questions}
<noscript><p class="callout">Scoring runs in your browser and needs JavaScript. The questions above still work as a discussion sheet: score each answer 0–4 from top to bottom.</p></noscript>
</form>
<div id="ara-result" class="ara-result" hidden tabindex="-1" aria-live="polite">
<p class="eyebrow">AI Man Jack AI Readiness Score</p>
<div class="ara-top"><div class="ara-ring" id="ara-ring"><b id="ara-score">0</b><span>/ 100</span></div><div><h2 id="ara-band" class="h2-sm">—</h2><p id="ara-band-text" class="muted"></p></div></div>
<div id="ara-bars" class="bars"></div>
<div class="grid-2 ara-sw"><div class="card"><h3>Strongest areas</h3><p id="ara-strong"></p></div><div class="card"><h3>Weakest areas</h3><p id="ara-weak"></p></div></div>
<h3 style="margin-top:32px">Recommended next steps</h3><ol id="ara-next" class="ara-next"></ol>
<div class="ara-cta"><h3>Run this assessment with your team</h3><p>In a 30-minute call we go through your weakest areas and what a first workshop would cover. Your score is passed along so you do not have to repeat it.</p>
<div class="cta-row"><a class="btn btn-primary" id="ara-book" href="/book/" data-event="book_workshop_click" data-pos="tool-result">Book a Workshop</a><button type="button" class="btn btn-secondary" id="ara-again">Retake</button></div></div>
<p class="muted" style="font-size:14px;margin-top:18px">A structured self-assessment, not a validated benchmark. Nothing you answered left your browser.</p>
</div></div></section>
<script>window.ARA=${JSON.stringify(data)}</script>${araScript}
<section class="section"><div class="wrap narrow prose">
<h2>How it works</h2><p>Ten multiple-choice questions cover eight areas. Each answer scores 0 to 4. Your overall score is the average across all answers, scaled to 100; each area gets its own score the same way. The calculation is fixed and runs in your browser — the same answers always give the same result.</p>
<div class="table-wrap"><table class="compare"><thead><tr><th scope="col">Score</th><th scope="col">Stage</th><th scope="col">What it usually looks like</th></tr></thead><tbody>${BANDS.map(([min, name, text], i) => `<tr><th scope="row">${min}–${BANDS[i + 1] ? BANDS[i + 1][0] - 1 : 100}</th><td>${name}</td><td>${text}</td></tr>`).join('')}</tbody></table></div>
<h2>Why this matters</h2><p>Most teams do not fail at AI because of the model. They stall because nobody decided which tasks are worth it, which tool is allowed, what data is off-limits, or who checks the output. Those are organisational questions, and they can be answered in an afternoon once someone asks them.</p>
<h2>How to interpret your result</h2><ul><li><strong>Look at the lowest area first.</strong> An overall 60 with governance at 25 is a governance problem, not a 60.</li><li><strong>Compare answers inside the team.</strong> If a manager answers “written guidance” and the team answers “no guidance”, the guidance has not landed.</li><li><strong>A low score is not a verdict.</strong> Exploring is where every team starts. The next step is one tool and one narrow task.</li><li><strong>A high score needs evidence.</strong> If you scored 80+, can you name three workflows, their owners and when each was last reviewed?</li></ul>
<h2>What the eight areas cover</h2><ul>${Object.values(CATEGORIES).map(([n, h, t]) => `<li><strong>${n}.</strong> ${t}</li>`).join('')}</ul>
<h2>Best practices</h2><ul><li>Have three or four people take it separately, then discuss the differences.</li><li>Retake it a quarter after training. The area scores should move; if they do not, the training did not change the work.</li><li>Do not average teams together. Sales and operations are usually at different stages.</li></ul>
<h2>Questions people ask</h2>${faq('en', FAQ, { heading: false })}
</div></section>
${related('Start with these', [templateCard(templateBySlug['ai-use-case-discovery-worksheet']), workflowCard(workflowBySlug['sop-creation']), workflowCard(workflowBySlug['executive-brief'])])}
${trainingCta({ h: 'Turn the score into a plan.', sub: 'A half-day workshop covers the lowest areas with your team, on tasks they already do.', pos: 'tool-ara' })}`,
    jsonld: [{ '@type': 'WebApplication', '@id': `${SITE}${ARA_PATH}#app`, name: 'AI Readiness Assessment', url: `${SITE}${ARA_PATH}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', inLanguage: 'en', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, description: 'A 10-question self-assessment of a team’s readiness to adopt AI across people, usage, processes, knowledge, tools, governance, leadership and measurement.', provider: { '@id': `${SITE}/#business` } },
      faqPage(FAQ, `${SITE}${ARA_PATH}#faq`), bc.ld],
  });
};

export const TOOLS = [{ href: ARA_PATH, kicker: 'Assessment', title: 'AI Readiness Assessment', text: 'Measure how prepared your team is to adopt AI across eight areas, and get next steps for the weakest ones.', tags: ['3 min', 'Free', 'No sign-up'], cta: 'Start assessment' }];
export const toolCard = (t, hl = 'h3') => card({ ...t, event: 'tool_click', hl });

const hub = () => {
  const bc = crumbs([['Free Tools', '/tools/']]);
  return page({
    path: '/tools/', priority: 0.8, changefreq: 'weekly', view: 'free_tools_view',
    title: 'Free AI Tools for Teams: Assess, Plan and Adopt AI | AI Man Jack',
    description: 'Free, practical tools to help your team find, evaluate and implement useful AI opportunities. Start with the 3-minute AI Readiness Assessment. No sign-up.',
    body: `${resourceHero({ crumbs: bc.html, eyebrow: 'Free · no sign-up', h1: 'Free AI Tools', lead: 'Practical tools to help your team find, evaluate and implement useful AI opportunities. Each one gives you a result you can use straight away.' })}
<section class="wrap" style="padding-bottom:72px"><div class="grid-2 res-grid">${TOOLS.map((t) => toolCard(t, 'h2')).join('\n')}
${card({ href: '/templates/ai-use-case-discovery-worksheet/', kicker: 'Planning · worksheet', title: 'AI Use Case Discovery Worksheet', text: 'The pen-and-paper exercise that opens every session: three weekly tasks, four questions, pick the narrowest one that passes.', tags: ['15 min', 'Free', 'No AI tool needed'], cta: 'Open worksheet', hl: 'h2' })}</div>
<p class="section-note">In development: an AI Use Case Finder and an AI ROI Calculator. Both will be deterministic and free, like this one.</p></section>
${trainingCta({ h: 'Tools show where you are. Training moves you.', sub: 'Book a 30-minute call to turn a score or a worksheet into a workshop plan for your team.', pos: 'tools-hub' })}`,
    jsonld: [{ '@type': 'CollectionPage', '@id': `${SITE}/tools/`, name: 'Free AI Tools', inLanguage: 'en', isPartOf: { '@id': `${SITE}/#website` } }, bc.ld],
  });
};

export const pages = [hub(), assessment()];
