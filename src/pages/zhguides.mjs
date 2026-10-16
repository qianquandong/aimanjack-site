// Chinese-only buyer guides: /zh/ai-peixun-shi/ (how much AI training costs) and /zh/ai-peixun-najia-zuihao/ (how to choose a
// provider). Until 2026-10-08 these were hand-written HTML outside src/ that still sold the retired "半天工作坊 $1,500 起",
// a 30-minute call, a 9/24 receptionist workshop and self-serving AggregateRating schema. Now generated, tested and in the sitemap
// like every other page. No EN twin exists, so the route has only `zh` (hreflang zh + x-default → the zh URL).
// Prices: only the owner-approved four-session price; the workshop and onsite day are "按需报价" with no number.
import { SITE, BOOK_URL, PROOF, TRAINING, OFFERS, QUOTE_URL } from '../config.mjs';
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
  const description = `AI 培训学费一般是多少？公司给团队请 AI 培训，价格主要由人数、定制程度、数据敏感度、授课地点和课后跟进决定。AI Man Jack 的所有培训形式都按团队书面报价。`;
  const bc = breadcrumb(lang, [[T.zh.nav.training, '/ai-training/'], ['AI 培训学费一般是多少', PRICE_GUIDE]]);
  return {
    title, description,
    body: `${hero(bc, 'AI 培训 · 价格说明 · 达拉斯—沃斯堡及全美远程', 'AI 培训学费一般是多少？<br>先看清影响价格的 5 个因素',
      `AI Man Jack 的四次课程项目（${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟实时课程）、90 分钟团队工作坊和全天上门培训，都按团队书面报价。这一页解释我们的报价范围和需要提前确认的费用，不把它当作整个市场的统一价格。`, 'fee-hero')}

<section class="sec tight" id="our-prices"><div class="wrap g2" style="gap:24px"><div class="big-card"><h2>先说我们的价格</h2><dl class="kv">
<dt>${a('/ai-training/', '四次课程项目', 'fee-prices')}</dt><dd>按团队报价，${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟实时课程，围绕学员手头的工作定制；团队可定制报价。</dd>
<dt>${a(OFFERS.workshop.path, '90 分钟团队工作坊', 'fee-prices')}</dt><dd>按需报价：价格取决于人数、授课地点和准备工作量。</dd>
<dt>${a(OFFERS.onsite.path, '全天上门培训（德州）', 'fee-prices')}</dt><dd>按需报价；达拉斯—沃斯堡以外的差旅和住宿另行报价，没有固定价格。</dd></dl></div>
<div class="big-card oakc"><h2>为什么只有一种形式标了价</h2><p>本站唯一公开标价的是四次课程项目。另外两种形式在确定人数、地点和任务之前，我们不给一个笼统的数字，而是提交申请后出一份书面的服务范围和报价。</p><p>无论哪种形式，都是 AI 培训，不是 ERP 或 CRM 定制开发。</p>${ctas('fee-prices')}</div></div></section>

<section class="sec tight" id="five-factors"><div class="wrap">${head('5 个因素', '影响 AI 培训价格的 5 个因素', '比较报价时，先确认人数、准备工作、数据要求、地点和跟进范围是否相同。')}
${nums([
  ['团队人数', '人数会影响分组、练习时间和讲师反馈的安排。提交总人数、部门和希望实操的人数后，再确认合适的课程范围，不把公司人数当作单场实操人数上限。', '课前先区分需要了解基本方法的人，以及需要带任务实操的人。'],
  ['是否围绕真实任务定制', '我们的课程会在课前收集团队的任务清单，选择适合练习的任务，并准备模拟或脱敏材料。定制程度和准备工作量会影响报价；不能仅凭“通用课”或“定制课”的名称判断学习效果。', '问清楚：课前收集哪些任务、使用什么练习材料、哪些准备工作包含在报价里。'],
  ['行业与数据敏感度', '即使都是会议简报、周报或客户回复，不同团队允许使用的数据与审核要求也可能不同。涉及敏感信息时，先确认能否使用模拟或脱敏材料，以及谁来批准练习范围；所需准备工作在报价中说明。', '判断依据是你们的具体任务和数据要求，不预设每个行业有多少项特殊任务。'],
  ['授课地点与差旅', '远程授课没有差旅成本。我们在达拉斯—沃斯堡可以上门；德州其他城市（例如 Odessa）可以安排，但差旅和住宿另行报价。', '比较报价时，先问清楚差旅是否已经包含在内。'],
  ['课后跟进', '四次课程项目会在后续课程中检查课间使用情况：哪条工作流用上了、结果是否准确、哪里需要调整。单次工作坊的课后支持不默认包含，需要另行确定范围。', '确认跟进次数、方式、时间范围和是否另收费，不只比较授课时长。'],
])}</div></section>

<section class="sec tight" id="dont-pay"><div class="wrap g2" style="gap:24px"><div class="oak"><h2 class="h3">这些费用先问清楚</h2>${ticks(['证书或认证费。先确认团队是否有认证要求，不把一张证书当作工作流已经验证的证据。', '软件账号。培训费不包含工具许可证或订阅；先检查公司已批准的账号能否完成练习，是否需要其他费用在课前单独确认。', '系统开发。我们做的是 AI 培训，不是 ERP 或 CRM 定制开发；需要系统实施的话，应该找实施服务商。', '录像与资料。先核对报价包含哪些资料、是否有录像，以及可使用多久，不预设所有形式都包含同样的资源。'], ' x')}</div>
<div class="oak"><h2 class="h3">先定边界，再谈价格</h2><p>无论找哪一家，开课前有三个问题比价格更重要：哪些工具已获批准、哪些信息不能输入、哪些输出必须由人签字确认。这些问题没有答案时，应先确定工具和数据边界，再安排练习。</p><p>制定团队规则时，也可以参考美国国家标准与技术研究院的 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>；该框架不是对本课程的认证或效果背书。怎么挑选培训机构，可以参考${a(CHOOSE_GUIDE, '《AI 培训机构哪家最好》', 'fee-body')}。</p></div></div></section>

<section class="sec tight" id="faq"><div class="wrap">${head('常见问题', '关于价格，直接回答')}
${faq([
  [`四次课程项目包含什么？`, `${TRAINING.sessions} 节 ${TRAINING.sessionMin} 分钟的实时课程，围绕学员已经在做的工作设计，一次落地一条工作流；课间实际使用，下一节课再修正。团队价格根据人数、目标和准备工作量定制。详情见${a('/ai-training/', 'AI 培训页')}。`],
  ['90 分钟工作坊和全天上门培训为什么没有标价？', '因为价格取决于人数、授课地点和任务所需的准备工作量。提交报价申请后，我们会给出书面的服务范围和报价。'],
  ['能到德州其他城市上门吗？', '可以按需安排，例如 Odessa、Austin、Houston 或 San Antonio。达拉斯—沃斯堡以外的差旅和住宿另行报价。'],
  ['用中文还是英文授课？', '都可以，由同一位讲师授课，课程资料提供中英文两个版本。'],
  ['需要另外买软件吗？', '先检查贵公司已批准的账号能否完成所选练习。培训费不包含工具许可证或订阅；需要额外功能或账号时，课前单独确认，不要求先购买某个套餐。'],
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
      '没有适合所有团队的统一答案。先比较学员产出、讲师相关经验、跟进范围、课程形式和数据规则，再看可核实的案例与书面报价。下面的问题可以问任何一家，包括我们。', 'choose-hero')}

<section class="sec tight" id="rankings"><div class="wrap">${head('先说榜单', '如何判断“AI 培训机构排名”是否适用')}
${ticks(['先看来源。榜单是否披露评价标准、更新时间、资料来源，以及赞助或推广关系？未披露时，不把名次直接当作效果证据。', '核对服务对象。面向个人自学的录像课与企业团队实操课，准备工作和交付范围不同，不宜只比较名次或价格。', '核对证据。课程介绍列出了哪些交付物？有无相关样例、真实授课记录，以及能够说明适用条件的案例？'], ' dash')}</div></section>

<section class="sec tight" id="five-dimensions"><div class="wrap">${head('5 个维度', '挑选 AI 培训机构，看这 5 个维度', '每个维度后面都附了一句“怎么问”。打电话或发邮件时直接问，答案比机构官网更说明问题。')}
${nums([
  ['学员带走什么：可用的工作流，还是一堆演示', '先问这场培训是概念介绍、演示还是动手练习。例如，行政岗位可以用脱敏会议记录练习简报，销售岗位可以用模拟客户信息练习回复。要求对方明确练习任务、预期产出和人工核验方式，而不是只看课件页数。', '怎么问：“课程结束时，我们会完成什么练习、带走哪些资料，哪些部分还需要继续测试？”'],
  ['讲师的实战背景', '查看讲师是否有与你们任务相关的经验，并请对方解释具体限制与审核方法。授课照片可以证明授课经历；客户业务成果则需要另外核实，不能由活动人数推断。', '怎么问：“你最近一次帮团队把 AI 用到实际工作中是什么时候？遇到过什么问题？”答不出第二个问题的，要多留个心。'],
  ['课后跟进：工作流有没有真的用起来', '出勤率和满意度可以说明参与体验，但不能单独证明工作流程已经改善。还应检查：那条工作流有没有用在真实工作上、结果是否足够准确、审核在哪一步最费时间、这项任务应该继续、调整还是停止。', '怎么问：“课后你们会跟进什么？”如果跟进不在报价里，比价时要把它算进去。'],
  ['形式是否匹配团队节奏', '形式不对，内容再好也难落地。一个团队想先试一两项任务，可以评估 90 分钟工作坊；多个部门需要集中练习，可以评估全天上门；需要在课间实际使用、再带着问题改进，可以评估四次课程。具体安排取决于任务和人数。', '怎么问：“我们 12 个人，都不是技术背景，你推荐哪种形式？”靠谱的机构会先反问：这些人平时做什么、公司批准了哪些工具。'],
  ['数据规则讲不讲', `练习前先明确已批准的工具、禁止输入的信息和人工审批环节。不要在未获批准的工具里输入客户个人信息、保密合同或其他敏感资料。团队制定规则时可参考 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>，再结合自身政策确定具体要求。`, '怎么问：“客户的电话号码能不能贴进 ChatGPT？”靠谱的回答会从“要看贵公司用的是哪种账号、有什么规定”开始。'],
])}</div></section>

<section class="sec tight" id="our-answers"><div class="wrap"><div class="big-card"><h2>同样 5 个问题，我们的回答</h2><dl class="kv">
<dt>学员带走什么</dt><dd>每节课落地一条围绕自己工作的 AI 工作流，外加一份输出核验清单。</dd>
<dt>讲师</dt><dd>Jack Qian 亲自授课。2026 年在达拉斯和 Plano 举办过 ${PROOF.talks} 场社区 AI 讲座和一场 ${PROOF.hackathon} 人的 AI 黑客松。</dd>
<dt>课后跟进</dt><dd>四次课程项目的每节课都从上次以来的实际使用情况开始；最后一节课结束两周后，再确认每条工作流应继续、调整还是停止。</dd>
<dt>形式</dt><dd>${a(OFFERS.workshop.path, '90 分钟团队工作坊', 'choose-answers')}、${a(OFFERS.onsite.path, '德州全天上门培训', 'choose-answers')}、${a('/ai-training/', `${TRAINING.sessions} × ${TRAINING.sessionMin} 分钟课程项目`, 'choose-answers')}；先了解情况，再推荐。</dd>
<dt>数据规则</dt><dd>课程一开始就讲：已批准的工具、禁止输入的信息、由谁签字确认。</dd>
<dt>价格</dt><dd>四次课程项目、90 分钟工作坊和全天上门培训均按需报价，达拉斯—沃斯堡以外的差旅另计。详见${a(PRICE_GUIDE, '《AI 培训学费一般是多少》', 'choose-answers')}。</dd>
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
