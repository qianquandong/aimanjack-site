// Buyer guidance shared with the existing offers; no additional offer or local doorway route.
import { OFFERS, PROGRAM_PRICE, TRAINING, GBP_URL, PROOF } from './config.mjs';
import { L } from './layout.mjs';

const COPY = {
  en: {
    k: 'Plan your team’s training', h: 'Compare AI training formats',
    p: 'One focused workshop, a full day together, or four sessions with practice in between. Every format uses your team’s work and company-approved tools. No coding experience is required.',
    facts: [['Instructor', 'Jack Qian teaches the sessions himself.'], ['Delivery', 'Onsite in Dallas–Fort Worth or live online across the U.S.'], ['Language', 'English or Chinese, agreed for your team.']],
    headers: ['Format', 'A good starting point when…', 'What the session covers', 'Price & details'],
    rows: [
      ['workshop', '90-minute team workshop', 'One team wants to try one or two focused tasks.', 'A guided workflow exercise and an output-review checklist.', 'Scoped quote', 'Workshop details'],
      ['onsite', 'Full-day onsite', 'Several teams need shared data rules and time to practise together.', 'Department use cases, guided labs and a next-step plan with owners.', 'Scoped quote; travel outside DFW quoted separately', 'Onsite details'],
      ['program', `${TRAINING.sessions} × ${TRAINING.sessionMin}-minute program`, 'Your team wants to use workflows between sessions and improve what breaks.', 'Four live sessions, workflow instructions and a repeatable playbook.', `From ${PROGRAM_PRICE}/person; custom team pricing`, 'Program & pricing'],
    ],
    prep: 'Before training', prepP: 'Choose a recurring task and a company-approved AI tool. Prepare synthetic or redacted examples and decide who can approve the output. For onsite labs, provide laptops, reliable Wi-Fi and a shared screen.',
    jump: 'Explore the program', links: [['#teams', 'Team use cases'], ['#curriculum', 'Training method'], ['#formats', '4-session plan'], ['#testimonials', 'Google reviews'], ['#faq', 'Questions & answers']],
  },
  zh: {
    k: '为团队选课程', h: '选择适合团队的培训形式',
    p: '先用一场专题试做、集中一天一起练习，或分四次课程边用边改。每种形式都围绕团队的真实工作，使用公司已批准的工具，无需编程基础。',
    facts: [['讲师', 'Jack Qian 本人授课。'], ['授课方式', '达拉斯—沃斯堡上门，或全美实时远程。'], ['语言', '根据团队需要选择中文或英文。']],
    headers: ['课程形式', '适合什么情况', '课程内容', '价格与详情'],
    rows: [
      ['workshop', '90 分钟团队工作坊', '一个团队先试做一到两项明确的任务。', '在指导下练习工作流，并使用输出核验清单。', '按需报价', '工作坊详情'],
      ['onsite', '全天上门培训', '多个团队需要统一数据规则，并留出时间集中练习。', '各部门应用场景、实操练习，以及明确负责人的后续计划。', '按需报价；DFW 以外差旅另计', '上门培训详情'],
      ['program', `${TRAINING.sessions} × ${TRAINING.sessionMin} 分钟课程`, '希望在课间实际使用工作流，再带着问题回来改进。', '四节实时课程、工作流说明，以及可复用的操作手册。', `每人 ${PROGRAM_PRICE} 起；团队定制报价`, '课程安排与价格'],
    ],
    prep: '课前准备', prepP: '选一项重复性任务和公司已批准的 AI 工具，准备模拟或脱敏的练习材料，并确定谁来核验输出。上门实操还需要笔记本电脑、稳定的 Wi-Fi 和共用屏幕。',
    jump: '查看课程细节', links: [['#teams', '各团队应用场景'], ['#curriculum', '培训方法'], ['#formats', '四次课程安排'], ['#testimonials', 'Google 评价'], ['#faq', '常见问题']],
  },
};

// Reused by the training page and buying guides so retired formats cannot drift back in.
export function trainingFormatTable(lang, { programHref = L(lang, '/ai-training/') + '#formats' } = {}) {
  const c = COPY[lang];
  return `<div class="format-comparison"><div class="table-wrap"><table><caption>${lang === 'zh' ? '三种团队 AI 培训形式对比' : 'Compare three formats for team AI training'}</caption>
<thead><tr>${c.headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>
${c.rows.map(([key, h, fit, deliver, price, link]) => `<tr><th scope="row">${h}</th><td data-label="${c.headers[1]}">${fit}</td><td data-label="${c.headers[2]}">${deliver}</td><td data-label="${c.headers[3]}"><strong>${price}</strong><a href="${key === 'program' ? programHref : L(lang, OFFERS[key].path)}" data-event="${key === 'program' ? 'training_program_click' : 'offer_path_click'}" data-pos="training-compare-${key}">${link} →</a></td></tr>`).join('')}
</tbody></table></div></div>`;
}

export function trainingFormatSummary(lang) {
  return lang === 'zh'
    ? `目前有三种形式：${OFFERS.workshop.minutes} 分钟团队工作坊、全天上门培训，以及 ${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟课程。工作坊与全天培训按需报价；四次课程每人 ${PROGRAM_PRICE} 起。人数、地点和准备工作量在书面报价中确认。`
    : `Choose a ${OFFERS.workshop.minutes}-minute team workshop, full-day onsite training, or ${TRAINING.sessions} live ${TRAINING.sessionMin}-minute sessions. Workshop and onsite pricing is by scoped quote; the four-session program starts at ${PROGRAM_PRICE} per person. Group size, location and preparation are agreed in the written quote.`;
}

export function trainingBrief(lang) {
  const c = COPY[lang];
  return `<section class="sec buyer-guide" id="team-paths"><div class="wrap">
<div class="sec-head"><div><div class="eyebrow">${c.k}</div><h2>${c.h}</h2><p class="lead">${c.p}</p></div></div>
<dl class="buyer-facts">${c.facts.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl>
${trainingFormatTable(lang, { programHref: '#formats' })}
<aside class="buyer-prep"><h3>${c.prep}</h3><p>${c.prepP}</p></aside>
<nav class="buyer-links" aria-label="${c.jump}">${c.links.map(([path, label]) => `<a href="${path}">${label} ↓</a>`).join('')}</nav>
</div></section>`;
}

export function localTrainingProof(lang) {
  const zh = lang === 'zh';
  return `<section class="sec tight local-training" id="dfw-training"><div class="wrap local-training-grid">
<figure><img src="/img/events/dallas-session3-hands-on.webp" width="1600" height="1066" loading="lazy" decoding="async" alt="${zh ? '达拉斯社区 AI 课堂中，参与者动手练习' : 'Participants practising during a Dallas community AI session'}"><figcaption>${zh ? '达拉斯社区 AI 课堂实拍' : 'A real Dallas community AI session'}</figcaption></figure>
<div class="local-training-copy"><div class="eyebrow">${zh ? '当地讲师 · 真实课堂' : 'Local instructor · Real sessions'}</div><h2>${zh ? '在你的办公室，用团队的工作来练。' : 'At your office. On the work your team does.'}</h2>
<p>${zh ? 'Jack Qian 为 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边团队提供上门培训。先确认地点、人数、部门和已批准的 AI 工具，再安排课程与书面报价。德州其他地区可按需安排，差旅另行报价。' : 'Jack Qian provides onsite training for teams in Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and the surrounding metroplex. Start with your location, team size, departments and approved AI tools; the schedule and price are agreed in writing. Elsewhere in Texas is available on request, with travel quoted separately.'}</p>
<p>${zh ? `教学经历包括 ${PROOF.talks} 场 Dallas 与 Plano 社区讲座及一场 ${PROOF.hackathon} 人黑客松。社区活动记录展示授课经历；企业项目成果以单独核实的案例为准。` : `Jack’s teaching experience includes ${PROOF.talks} community talks in Dallas and Plano and a ${PROOF.hackathon}-person hackathon. These community events demonstrate teaching experience; business results are documented separately in verified case studies.`}</p>
<div class="local-proof-links"><a href="${L(lang, '/about/')}">${zh ? '了解讲师与活动照片' : 'Meet Jack & see session photos'} →</a><a href="${L(lang, '/case-studies/livestream-agency-scheduling/')}">${zh ? '查看真实工作流案例' : 'Read a real workflow case study'} →</a></div>
<p class="review-source"><a href="${GBP_URL}" target="_blank" rel="noopener">${zh ? `Google 评价 ${PROOF.rating}/5 · ${PROOF.reviews} 条` : `${PROOF.rating}/5 · ${PROOF.reviews} Google reviews`} ↗</a> · ${zh ? '核对于' : 'Checked'} <time datetime="${PROOF.reviewsCheckedOn}">${PROOF.reviewsCheckedOn}</time></p>
</div></div></section>`;
}
