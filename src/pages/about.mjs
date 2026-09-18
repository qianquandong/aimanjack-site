import { EMAIL, PROOF } from '../config.mjs';
import { pageHero, breadcrumb, finalCta, T } from '../components.mjs';
import { business, person } from '../schema.mjs';

const copy = {
  en: {
    title: 'About Jack Qian and AI Man Jack LLC, Dallas | AI Man Jack',
    description: 'AI Man Jack LLC is Jack Qian’s Dallas company for hands-on corporate AI training and AI workflow training, in English or Chinese. Built through real community sessions.',
    h1: 'AI Man Jack helps teams learn and apply AI to real work.',
    sub: 'A one-person company in Dallas, Texas. Jack Qian designs the session, teaches it, and does the two-week follow-up himself.',
    body: `
<h2>What the company does</h2>
<p>AI Man Jack runs <a href="/ai-training/">hands-on AI training for teams</a>, onsite in Dallas–Fort Worth or remotely, in English or Chinese. Each person works on a task they already do and leaves with a working AI workflow plus a way to verify its output. The Google reviews on this site come from those sessions.</p>
<h2>Who runs it</h2>
<p>Jack Qian is an AI trainer, AI workflow builder and Dallas AI community organizer. By day he is a business planner at a Dallas semiconductor company; the workflows he teaches are the ones he runs on his own work first.</p>
<p>Since 2026 he has hosted ${PROOF.talks} community AI talks in Plano and Dallas with ${PROOF.perTalk} people each, and a ${PROOF.hackathon}-person AI hackathon where teams built and demonstrated live demos in three hours. Attendees left ${PROOF.reviews} Google reviews, all five stars. He also writes <a href="https://realagentusecases.com/" rel="noopener">Real Agent Use Cases</a>, a weekly newsletter on AI agents and workflows working professionals actually run.</p>
<h2>How he works</h2>
<ul>
<li>Task first, tool second. Every session starts with work the team already does, not with a product tour.</li>
<li>Everyone builds. No one leaves with slides alone; each person leaves with a workflow that ran.</li>
<li>Verification is part of the exercise. One output in every session is deliberately flawed, and the room has to catch it.</li>
<li>Follow up before claiming. Two weeks after a session he checks whether the workflow was tested and whether it should continue, change or stop.</li>
</ul>
<h2>Where</h2>
<p>Dallas–Fort Worth, Texas: Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and the towns between. Onsite across the metroplex; remote sessions anywhere.</p>
<h2>Contact</h2>
<p><a href="/book/">Book a 30-minute call</a>, email <a href="mailto:${EMAIL}">${EMAIL}</a>, or text TRAINING to <a href="sms:+14694254142?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="about">(469) 425-4142</a>. More on the <a href="/contact/">contact page</a>.</p>`,
    crumb: 'About',
  },
  zh: {
    title: '关于 Jack Qian 和 AI Man Jack LLC | AI Man Jack',
    description: 'AI Man Jack LLC 是 Jack Qian 在达拉斯的公司，做团队 AI 实战培训和 AI 工作流培训，中英文皆可。课纲是在真实的社区活动里磨出来的。',
    h1: 'AI Man Jack 帮团队把 AI 用到真实工作上。',
    sub: '德州达拉斯的一人公司。设计课程、上课、课后两周回访，都是 Jack Qian 本人。',
    body: `
<h2>公司做什么</h2>
<p>AI Man Jack 给团队做<a href="/zh/ai-training/">动手 AI 培训</a>，达拉斯—沃斯堡上门或远程，中英文皆可。每个人拿自己正在做的任务练，带着一条能跑的 AI 工作流和核对结果的方法走。本站的 Google 评价来自这些课。</p>
<h2>谁在做</h2>
<p>Jack Qian 是 AI 培训师、AI 工作流搭建者，也是达拉斯 AI 社区的组织者。白天他在达拉斯一家半导体公司做 business planner；课上教的工作流，都是他自己先在工作里跑过的。</p>
<p>2026 年以来，他在 Plano 和达拉斯办了 ${PROOF.talks} 场社区 AI 讲座，每场 ${PROOF.perTalk} 人，还办了一场 ${PROOF.hackathon} 人的 AI hackathon，各小组三小时内做出并演示了现场 demo。参加的人留下了 ${PROOF.reviews} 条 Google 评价，全是五星。他还写 <a href="https://realagentusecases.com/" rel="noopener">Real Agent Use Cases</a>，一份每周更新的 newsletter，讲职场人真正在用的 AI agent 和工作流。</p>
<h2>他怎么干活</h2>
<ul>
<li>先看任务，再看工具。每一场都从团队已经在做的事开始，不从产品介绍开始。</li>
<li>每个人都动手。没人只带着 PPT 走，每个人带走的是一条跑过的工作流。</li>
<li>核对是练习的一部分。每场都有一个故意做错的结果，得由全场把它找出来。</li>
<li>先回访，再下结论。课后两周去看那条工作流有没有测过，该继续、该改还是该停。</li>
</ul>
<h2>在哪儿</h2>
<p>德州达拉斯—沃斯堡：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边城镇。全都会区可上门；远程不限地区。</p>
<h2>联系</h2>
<p><a href="/zh/book/">预约 30 分钟通话</a>，发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>，或发 TRAINING 到 <a href="sms:+14694254142?body=TRAINING%20-%20" data-event="sms_training_click" data-pos="about">(469) 425-4142</a>。更多方式见<a href="/zh/contact/">联系页</a>。</p>`,
    crumb: '关于',
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/about/']]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].nav.about, h1: c.h1, sub: c.sub })}
<section class="section"><div class="wrap"><div class="split"><div class="prose">${c.body}</div><div><img src="/img/jack-headshot.jpg" width="640" height="640" loading="lazy" decoding="async" alt="Jack Qian" style="border-radius:16px;max-width:420px"><p class="muted" style="font-size:14px;margin-top:10px">Jack Qian, AI Man Jack LLC, Dallas</p></div></div></div></section>
${finalCta(lang)}`,
    jsonld: [business(lang), person(), bc.ld],
  };
};

export const pages = [{ path: '/about/', priority: 0.7, en: page('en'), zh: page('zh') }];
