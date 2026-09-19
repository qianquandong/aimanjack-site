// /about/ (design canvas: About / ZH-About). Numbers from config.PROOF.
import { EMAIL, SMS_TEL, SMS_DISPLAY, PROOF } from '../config.mjs';
import { photoHero, L } from '../layout.mjs';
import { breadcrumb } from '../components.mjs';
import { business, person } from '../schema.mjs';

const CITIES = ['Dallas', 'Fort Worth', 'Plano', 'Richardson', 'Frisco', 'McKinney', 'Arlington'];
const C = {
  en: {
    title: 'About Jack Qian and AI Man Jack LLC, Dallas | AI Man Jack',
    description: 'AI Man Jack LLC is Jack Qian’s Dallas company for hands-on corporate AI training and AI workflow training, in English or Chinese. Built through real community sessions.',
    crumb: 'About', h1: 'AI Man Jack helps teams learn and apply AI to <em>real work.</em>', sub: 'A one-person company in Dallas, Texas. Jack Qian designs the session, teaches it, and does the two-week follow-up himself.', heroAlt: 'Jack Qian teaching a hands-on AI session',
    doesK: 'What the company does', does: 'AI Man Jack runs <a href="/ai-training/">hands-on AI training for teams</a>, onsite in Dallas–Fort Worth or remotely, in English or Chinese. Each person works on a task they already do and leaves with a working AI workflow plus a way to verify its output.',
    whoK: 'Who runs it', who: ['Jack Qian is an AI trainer, AI workflow builder and Dallas AI community organizer. By day he is a business planner at a Dallas semiconductor company; the workflows he teaches are the ones he runs on his own work first.', 'He also writes <a href="https://realagentusecases.com/" rel="noopener">Real Agent Use Cases</a>, a weekly newsletter on AI agents and workflows working professionals actually run.'],
    stats: [[PROOF.talks, `community AI talks in Plano and Dallas, ${PROOF.perTalk} each`], [PROOF.hackathon, 'builders at one three-hour AI hackathon'], [`${PROOF.reviews} × ★5`, 'Google reviews from attendees']],
    howK: 'How he works', howH: 'Four rules every session follows',
    how: [['Task first, tool second.', 'Every session starts with work the team already does, not with a product tour.'], ['Everyone builds.', 'No one leaves with slides alone; each person leaves with a workflow that ran.'], ['Verification is part of the exercise.', 'One output in every session is deliberately flawed, and the room has to catch it.'], ['Follow up before claiming.', 'Two weeks after a session he checks whether the workflow was tested and whether it should continue, change or stop.']],
    strip: ['The 37-person Dallas AI hackathon', 'Jack presenting at a Dallas session', 'A team demonstrating what it built'],
    whereK: 'Where', whereH: 'Onsite across Dallas–Fort Worth. Remote anywhere.', remote: 'Remote',
    contactK: 'Contact', contactH: 'Three ways to reach Jack', rows: [['Book', 'A 30-minute call'], ['Email', EMAIL], ['Text', `TRAINING to ${SMS_DISPLAY}`]],
  },
  zh: {
    title: '关于 Jack Qian 与 AI Man Jack LLC | AI Man Jack',
    description: 'AI Man Jack LLC 是 Jack Qian 在达拉斯创办的公司，提供实操型企业 AI 培训与 AI 工作流培训，支持中英文授课。课程在真实的社区课堂中打磨而成。',
    crumb: '关于', h1: 'AI Man Jack 帮助团队学习 AI，<br>并将其应用于<em>真实工作</em>。', sub: '位于德州达拉斯的一人公司。课程设计、授课与两周回访，均由 Jack Qian 本人完成。', heroAlt: 'Jack Qian 正在讲授一场 AI 实操课程',
    doesK: '公司业务', does: 'AI Man Jack 为团队提供<a href="/zh/ai-training/">实操型 AI 培训</a>，可在达拉斯—沃斯堡地区上门授课或远程进行，中英文均可。每位学员基于自己的真实任务练习，带走一条可用的 AI 工作流以及核验输出的方法。',
    whoK: '创始人', who: ['Jack Qian 是 AI 培训师、AI 工作流构建者，也是达拉斯 AI 社区的组织者。他的本职工作是在达拉斯一家半导体公司从事业务规划；他所教授的工作流，都先在自己的工作中实际运行过。', '他还撰写 <a href="https://realagentusecases.com/" rel="noopener">Real Agent Use Cases</a>——一份每周更新的通讯，介绍职场人士真正在用的 AI 智能体与工作流。'],
    stats: [[PROOF.talks, `场社区 AI 讲座，Plano 与达拉斯，每场 ${PROOF.perTalk.replace('+', '')} 人以上`], [PROOF.hackathon, '人参与一场三小时的 AI 黑客松'], [`${PROOF.reviews} × ★5`, '条来自学员的 Google 评价']],
    howK: '工作原则', howH: '每一场课程都遵循的四条原则',
    how: [['先定任务，再选工具。', '每一次课程都从团队已有的工作开始，而不是从产品介绍开始。'], ['人人动手。', '没有人只带着幻灯片离开；每位学员都带走一条实际运行过的工作流。'], ['核验是练习的一部分。', '每场课程都有一个刻意设置的错误输出，需要学员自己找出来。'], ['先回访，再下结论。', '课程两周后回访，确认工作流是否经过实测，以及应继续、调整还是停止。']],
    strip: ['37 人参与的达拉斯 AI 黑客松', 'Jack 在达拉斯的一场课程中讲解', '一个小组正在演示自己搭建的成果'],
    whereK: '服务地区', whereH: '达拉斯—沃斯堡地区上门授课，其他地区远程授课。', remote: '远程',
    contactK: '联系方式', contactH: '三种方式联系 Jack', rows: [['预约', '30 分钟通话'], ['邮件', EMAIL], ['短信', `发送 TRAINING 至 ${SMS_DISPLAY}`]],
  },
};
const STRIP = [['dallas-ai-hackathon-group', 1200, 910], ['dallas-session3-jack-presenting', 1600, 1066], ['dallas-ai-hackathon-live-demo', 1200, 900]];
const ZH_CITY = { Dallas: '达拉斯', 'Fort Worth': '沃斯堡' };

const page = (lang) => {
  const c = C[lang], bc = breadcrumb(lang, [[c.crumb, '/about/']]);
  const hrefs = [L(lang, '/book/'), `mailto:${EMAIL}`, `sms:${SMS_TEL}?body=TRAINING%20-%20`], evs = ['booking_start', 'email_training_click', 'sms_training_click'];
  return {
    title: c.title, description: c.description, hero: 'photo',
    body: `${photoHero({ photo: 'teaching', alt: c.heroAlt, size: 'md', inner: `<div class="hero-main" style="padding-bottom:64px;row-gap:18px"><div class="col-a" style="gap:20px">${bc.html}<h1 class="lg" style="font-size:clamp(40px,6.1vw,88px)">${c.h1}</h1></div><p class="col-b" style="padding:0">${c.sub}</p></div>` })}
<section class="sec"><div class="wrap g12" style="row-gap:64px">
<div style="grid-column:span 3"><div class="eyebrow">${c.doesK}</div></div><p class="answer" style="grid-column:4 / span 9;font-size:clamp(21px,2.1vw,30px)">${c.does}</p>
<div style="grid-column:span 3"><div class="eyebrow">${c.whoK}</div></div>
<div class="who-grid" style="grid-column:4 / span 9"><img src="/img/jack-headshot.jpg" width="640" height="640" loading="lazy" decoding="async" alt="Jack Qian" style="border-radius:24px;aspect-ratio:1;object-fit:cover">
<div style="display:flex;flex-direction:column;gap:18px">${c.who.map((p) => `<p style="font-size:clamp(17px,1.35vw,19px);line-height:1.7;color:var(--body-strong)">${p.replace('<a ', '<a style="color:var(--accent-text);font-weight:600" ')}</p>`).join('')}<div class="stat-cards" style="margin-top:8px">${c.stats.map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('')}</div></div></div>
</div></section>
<section class="sec dark"><div class="wrap"><div class="sec-head"><div><div class="eyebrow">${c.howK}</div><h2>${c.howH}</h2></div></div>
<ol class="steps-line">${c.how.map(([h, p], i) => `<li><span class="n" style="font-size:15px">0${i + 1}</span><h3>${h}</h3><p>${p}</p></li>`).join('')}</ol></div></section>
<section class="photo-strip" style="padding-top:12px">${STRIP.map(([f, w, h], i) => `<img src="/img/events/${f}.webp" width="${w}" height="${h}" loading="lazy" decoding="async" alt="${c.strip[i]}" style="height:clamp(200px,30vw,440px)">`).join('')}</section>
<section class="sec"><div class="wrap"><div class="g2" style="gap:24px">
<div class="big-card oakc"><div class="eyebrow">${c.whereK}</div><h2>${c.whereH}</h2><div class="pills">${[...CITIES.map((x) => (lang === 'zh' && ZH_CITY[x]) || x), c.remote].map((x) => `<span>${x}</span>`).join('')}</div></div>
<div class="big-card"><div class="eyebrow">${c.contactK}</div><h2>${c.contactH}</h2><div class="contact-rows">${c.rows.map(([k, v], i) => `<a href="${hrefs[i]}" data-event="${evs[i]}" data-pos="about"><span><span class="k">${k}</span><span class="v">${v}</span></span><span class="go" aria-hidden="true">→</span></a>`).join('')}</div></div></div></div></section>`,
    jsonld: [business(lang), person(), bc.ld],
  };
};

export const pages = [{ path: '/about/', priority: 0.7, en: page('en'), zh: page('zh') }];
