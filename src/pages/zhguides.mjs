// Chinese-only buyer guides: /zh/ai-peixun-shi/ (how much AI training costs) and /zh/ai-peixun-najia-zuihao/ (how to choose a
// provider). Until 2026-10-08 these were hand-written HTML outside src/ that still sold the retired "半天工作坊 $1,500 起",
// a 30-minute call, a 9/24 receptionist workshop and self-serving AggregateRating schema. Now generated, tested and in the sitemap
// like every other page. No EN twin exists, so the route has only `zh` (hreflang zh + x-default → the zh URL).
// Prices: only the owner-approved four-session price; the workshop and onsite day are "按需报价" with no number.
import { SITE, BOOK_URL, PROGRAM_PRICE, PROOF, TRAINING, OFFERS, QUOTE_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { T } from '../i18n.mjs';
import { breadcrumb } from '../components.mjs';
import { BUSINESS_REF } from '../schema.mjs';

const lang = 'zh';
const NIST = 'https://www.nist.gov/itl/ai-risk-management-framework';
const PRICE_GUIDE = '/ai-peixun-shi/', CHOOSE_GUIDE = '/ai-peixun-najia-zuihao/';
const a = (p, text, pos) => `<a href="${L(lang, p)}"${pos ? ` data-event="guide_link_click" data-pos="${pos}"` : ''}>${text}</a>`;
const ctas = (pos) => `<div class="cta-row"><a class="btn btn-primary" href="${L(lang, QUOTE_URL)}" data-event="quote_cta_click" data-pos="${pos}">申请报价</a><a class="btn btn-secondary" href="${L(lang, BOOK_URL)}" data-event="workshop_cta_click" data-pos="${pos}">${T.zh.cta.book}</a></div>`;
const head = (k, h, p) => `<div class="sec-head"><div><div class="eyebrow">${k}</div><h2>${h}</h2>${p ? `<p class="lead">${p}</p>` : ''}</div></div>`;
const ticks = (items, cls = '') => `<ul class="ticks${cls}">${items.map((x) => `<li><span>${x}</span></li>`).join('')}</ul>`;
const nums = (items) => `<ol class="nums">${items.map(([h, p, why], i) => `<li><span class="n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p>${why ? `<span class="why">${why}</span>` : ''}</div></li>`).join('')}</ol>`;
const faq = (items) => `<div class="faq">${items.map(([q, ans], i) => `<details${i === 0 ? ' open' : ''}><summary>${q}</summary><div class="faq-a"><p>${ans}</p></div></details>`).join('\n')}</div>`;
const hero = (bc, eyebrow, h1, lead, pos) => `<section class="page-hero"><div class="wrap">${bc.html}<p class="eyebrow">${eyebrow}</p><h1 style="max-width:1080px">${h1}</h1><p class="lead" style="max-width:760px">${lead}</p>${ctas(pos)}</div></section>`;
const webPage = (path, name, description) => ({ '@type': 'WebPage', '@id': `${SITE}${L(lang, path)}`, url: `${SITE}${L(lang, path)}`, name, description, inLanguage: 'zh', about: { '@id': `${SITE}/#business` }, publisher: { '@id': `${SITE}/#business` } });

const priceGuide = () => {
  const title = 'AI 培训学费一般是多少？企业团队培训价格的 5 个影响因素 | AI Man Jack';
  const description = `AI 培训学费一般是多少？公司给团队请 AI 培训，价格主要由人数、定制程度、数据敏感度、授课地点和课后跟进决定。AI Man Jack 的四次课程项目每人 ${PROGRAM_PRICE} 起；90 分钟工作坊和全天上门培训按需报价。`;
  const bc = breadcrumb(lang, [[T.zh.nav.training, '/ai-training/'], ['AI 培训学费一般是多少', PRICE_GUIDE]]);
  return {
    title, description,
    body: `${hero(bc, 'AI 培训 · 价格说明 · 达拉斯—沃斯堡及全美远程', 'AI 培训学费一般是多少？<br>先看清影响价格的 5 个因素',
      '搜这个问题的人大致分两种：想自己报班的个人，和想给团队找培训的公司。个人网课从免费到几千美元不等，这一页不展开。这里只回答一个问题：公司请人给团队做 AI 培训，钱花在哪里，由什么决定。', 'fee-hero')}

<section class="sec tight" id="our-prices"><div class="wrap g2" style="gap:24px"><div class="big-card"><h2>先说我们的价格</h2><dl class="kv">
<dt>${a('/ai-training/', '四次课程项目', 'fee-prices')}</dt><dd>每人 ${PROGRAM_PRICE} 起，${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟实时课程，围绕学员手头的工作定制；团队可定制报价。</dd>
<dt>${a(OFFERS.workshop.path, '90 分钟团队工作坊', 'fee-prices')}</dt><dd>按需报价：价格取决于人数、授课地点和准备工作量。</dd>
<dt>${a(OFFERS.onsite.path, '全天上门培训（德州）', 'fee-prices')}</dt><dd>按需报价；达拉斯—沃斯堡以外的差旅和住宿另行报价，没有固定价格。</dd></dl></div>
<div class="big-card oakc"><h2>为什么只有一种形式标了价</h2><p>本站唯一公开标价的是四次课程项目。另外两种形式在确定人数、地点和任务之前，我们不给一个笼统的数字，而是提交申请后出一份书面的服务范围和报价。</p><p>无论哪种形式，都是 AI 培训，不是 ERP 或 CRM 定制开发。</p>${ctas('fee-prices')}</div></div></section>

<section class="sec tight" id="five-factors"><div class="wrap">${head('5 个因素', '影响 AI 培训价格的 5 个因素', '拿到任何一家的报价，先对照这 5 条看一遍，就知道钱花在哪里、哪些可以省。')}
${nums([
  ['团队人数', '实操课的关键，是讲师能不能在课上逐一确认每个人的工作流是否跑通。人越多，需要的时间和讲师精力越多，所以报价通常按人数或场次计算。', '省钱的办法：先挑出每周确实有重复任务的人上实操课，不要几十个人一起坐着看演示。'],
  ['是否围绕真实任务定制', '通用课用讲师准备好的例子，便宜，但两周后很少有人记得。定制课在开课前收集每个人的任务，提前挑出能在课上跑通的几项，并准备模拟或脱敏数据。准备时间本身就是成本。', '判断是不是真定制：开课前对方有没有向你要过任务清单。'],
  ['行业与数据敏感度', '会议简报、周报、客户回复这类通用任务，准备量较小。涉及病人信息、财务数据或保密合同的团队，需要更细的数据规则和审核环节，准备量和价格都会随之增加。', '多数公司真正属于本行业特有的任务只有两三项，其余都是通用任务，不必为“行业专家”的名头多付钱。'],
  ['授课地点与差旅', '远程授课没有差旅成本。我们在达拉斯—沃斯堡可以上门；德州其他城市（例如 Odessa）可以安排，但差旅和住宿另行报价。', '比较报价时，先问清楚差旅是否已经包含在内。'],
  ['课后跟进', '有的报价便宜，是因为课讲完就结束了。四次课程项目的每节课都从上次以来的使用情况开始：哪条工作流真的用上了、结果是否准确、哪里需要调整。', '比价时把跟进算进去。没有跟进的培训，两周后留在公司里的东西往往大不一样。'],
])}</div></section>

<section class="sec tight" id="dont-pay"><div class="wrap g2" style="gap:24px"><div class="oak"><h2 class="h3">这些钱通常不用花</h2>${ticks(['证书。团队培训的成果是能用的工作流，而不是一张证书。', '额外的软件账号。课程使用贵公司已批准的工具，例如 ChatGPT、Claude、Gemini 或 Copilot。', '系统开发。我们做的是 AI 培训，不是 ERP 或 CRM 定制开发；需要系统实施的话，应该找实施服务商。', '录播课包。团队围绕同一批真实任务一起练习，比每人各看十小时录像更容易落地。'], ' x')}</div>
<div class="oak"><h2 class="h3">先定边界，再谈价格</h2><p>无论找哪一家，开课前有三个问题比价格更重要：哪些工具已获批准、哪些信息不能输入、哪些输出必须由人签字确认。没有答案的话，课越便宜风险越大——员工学得越快，贴错东西也越快。</p><p>这与美国国家标准与技术研究院的 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>思路一致：先定边界，再谈用法。怎么挑选培训机构，可以参考${a(CHOOSE_GUIDE, '《AI 培训机构哪家最好》', 'fee-body')}。</p></div></div></section>

<section class="sec tight" id="faq"><div class="wrap">${head('常见问题', '关于价格，直接回答')}
${faq([
  [`四次课程项目每人 ${PROGRAM_PRICE} 包含什么？`, `${TRAINING.sessions} 节 ${TRAINING.sessionMin} 分钟的实时课程，围绕学员已经在做的工作设计，一次落地一条工作流；课间实际使用，下一节课再修正。团队价格根据人数、目标和准备工作量定制。详情见${a('/ai-training/', 'AI 培训页')}。`],
  ['90 分钟工作坊和全天上门培训为什么没有标价？', '因为价格取决于人数、授课地点和任务所需的准备工作量。提交报价申请后，我们会给出书面的服务范围和报价。'],
  ['能到德州其他城市上门吗？', '可以按需安排，例如 Odessa、Austin、Houston 或 San Antonio。达拉斯—沃斯堡以外的差旅和住宿另行报价。'],
  ['用中文还是英文授课？', '都可以，由同一位讲师授课，课程资料提供中英文两个版本。'],
  ['需要另外买软件吗？', '不需要专门为培训购买。课程使用贵公司已批准的工具；如果还没有批准任何工具，课前先商定一个。'],
])}</div></section>

<section class="sec tight" id="start"><div class="wrap"><div class="big-card oakc"><h2>为你的团队要一份书面报价</h2><p>告诉我们人数、地点和希望 AI 帮忙的工作；也可以先预约一次 20 分钟工作流咨询。</p>${ctas('fee-final')}</div></div></section>`,
    jsonld: [webPage(PRICE_GUIDE, title, description), BUSINESS_REF, bc.ld],
  };
};

const chooseGuide = () => {
  const title = 'AI 培训机构哪家最好？挑选企业 AI 培训看这 5 个维度 | AI Man Jack';
  const description = '搜“AI 培训机构哪家最好”，出来的多是榜单，看不出员工上完课能不能真用起来。这一页给出 5 个维度：学员带走什么、讲师的实战背景、课后跟进、形式是否匹配、数据规则讲不讲，并附上可以直接问机构的问题。';
  const bc = breadcrumb(lang, [[T.zh.nav.training, '/ai-training/'], ['AI 培训机构哪家最好', CHOOSE_GUIDE]]);
  return {
    title, description,
    body: `${hero(bc, 'AI 培训 · 如何挑选 · 达拉斯—沃斯堡及全美远程', 'AI 培训机构哪家最好？<br>看这 5 个维度，比看榜单靠谱',
      '搜这个问题，出来的多是榜单。榜单排的往往是谁投了广告，看不出员工上完课回到工位能不能真的用起来。下面 5 个维度，是给团队挑选 AI 培训时值得问的问题——拿去问任何一家，包括问我们。', 'choose-hero')}

<section class="sec tight" id="rankings"><div class="wrap">${head('先说榜单', '为什么“AI 培训机构排名”帮不上忙')}
${ticks(['排的是广告位，不是效果。榜单上看不到课程结束两周后，学员电脑上还留下了什么。', '排的多是个人网课，不是企业团队培训。一个人晚上看录像考证，和一个运营团队一起把 AI 用进周报流程，是两个不同的市场。', '比的是课程页面上写了什么，而不是课上发生了什么。“从入门到精通”谁都能写，写不出来的是：课程结束时，员工手里多了什么。'], ' dash')}</div></section>

<section class="sec tight" id="five-dimensions"><div class="wrap">${head('5 个维度', '挑选 AI 培训机构，看这 5 个维度', '每个维度后面都附了一句“怎么问”。打电话或发邮件时直接问，答案比机构官网更说明问题。')}
${nums([
  ['学员带走什么：可用的工作流，还是一堆演示', '常见的培训是讲师放几十页幻灯片、演示几个惊艳的例子，大家鼓掌散会，两周后没人再打开那个工具。好的培训反过来：行政人员用自己上周的会议记录，搭一条从记录到简报的流程；销售用自己的客户回复来练习。课程结束时，每个人都有一条自己的工作流和一份核验清单。', '怎么问：“课程结束时，我的员工电脑上会多出什么？”答“课件和录像”的，多半是演示课。'],
  ['讲师的实战背景', '讲 AI 的人很多，真正在团队里把 AI 用到日常工作、处理过真实数据问题的人少得多。区别藏在细节里：讲“哪些数据不能输入 AI”时，前者念政策条文，后者能讲出具体会出错的场景。', '怎么问：“你最近一次帮团队把 AI 用到实际工作中是什么时候？遇到过什么问题？”答不出第二个问题的，要多留个心。'],
  ['课后跟进：工作流有没有真的用起来', '出勤率和满意度评分说明不了什么。真正要看的是：那条工作流有没有用在真实工作上、结果是否足够准确、审核在哪一步最费时间、这项任务应该继续、调整还是停止。', '怎么问：“课后你们会跟进什么？”如果跟进不在报价里，比价时要把它算进去。'],
  ['形式是否匹配团队节奏', '形式不对，内容再好也难落地。一个团队想先试一次，90 分钟工作坊就够；整个部门要在同一天统一规则，适合全天上门；想让工作流真正留在公司里，需要多节课程、课间实际使用。', '怎么问：“我们 12 个人，都不是技术背景，你推荐哪种形式？”靠谱的机构会先反问：这些人平时做什么、公司批准了哪些工具。'],
  ['数据规则讲不讲', `这一条最容易被跳过，也最容易出事。员工学会用 AI 的第一周，最常见的动作就是把客户名单、合同或病历贴进聊天框。培训如果不讲这个，等于只教了油门，没讲刹车。课程一开始就应该明确：哪些工具已获批准、哪些信息不能输入、哪些地方必须由人签字。这与 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>的思路一致：先定边界，再谈用法。`, '怎么问：“客户的电话号码能不能贴进 ChatGPT？”靠谱的回答会从“要看贵公司用的是哪种账号、有什么规定”开始。'],
])}</div></section>

<section class="sec tight" id="our-answers"><div class="wrap"><div class="big-card"><h2>同样 5 个问题，我们的回答</h2><dl class="kv">
<dt>学员带走什么</dt><dd>每节课落地一条围绕自己工作的 AI 工作流，外加一份输出核验清单。</dd>
<dt>讲师</dt><dd>Jack Qian 亲自授课。2026 年在达拉斯和 Plano 举办过 ${PROOF.talks} 场社区 AI 讲座和一场 ${PROOF.hackathon} 人的 AI 黑客松。</dd>
<dt>课后跟进</dt><dd>四次课程项目的每节课都从上次以来的实际使用情况开始；最后一节课结束两周后，再确认每条工作流应继续、调整还是停止。</dd>
<dt>形式</dt><dd>${a(OFFERS.workshop.path, '90 分钟团队工作坊', 'choose-answers')}、${a(OFFERS.onsite.path, '德州全天上门培训', 'choose-answers')}、${a('/ai-training/', `${TRAINING.sessions} × ${TRAINING.sessionMin} 分钟课程项目`, 'choose-answers')}；先了解情况，再推荐。</dd>
<dt>数据规则</dt><dd>课程一开始就讲：已批准的工具、禁止输入的信息、由谁签字确认。</dd>
<dt>价格</dt><dd>四次课程项目每人 ${PROGRAM_PRICE} 起；90 分钟工作坊和全天上门培训按需报价，达拉斯—沃斯堡以外的差旅另计。详见${a(PRICE_GUIDE, '《AI 培训学费一般是多少》', 'choose-answers')}。</dd>
<dt>语言</dt><dd>中文或英文，同一位讲师。</dd>
<dt>不做的事</dt><dd>我们做 AI 培训，不做 ERP 或 CRM 定制开发。</dd></dl>${ctas('choose-answers')}</div></div></section>`,
    jsonld: [webPage(CHOOSE_GUIDE, title, description), BUSINESS_REF, bc.ld],
  };
};

export const ZH_GUIDES = [PRICE_GUIDE, CHOOSE_GUIDE];
export const pages = [
  { path: PRICE_GUIDE, priority: 0.6, zh: priceGuide() },
  { path: CHOOSE_GUIDE, priority: 0.6, zh: chooseGuide() },
];
