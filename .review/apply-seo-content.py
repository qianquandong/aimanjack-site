from pathlib import Path
import re
import hashlib
root = Path.cwd()
def edit(path, replacements):
 p=root/path; s=p.read_text()
 for old,new in replacements:
  assert s.count(old)==1,(path,old[:100],s.count(old))
  s=s.replace(old,new,1)
 p.write_text(s)

p=root/'src/training-buyers.mjs';s=p.read_text()
start=s.index('<div class="format-comparison">');end=s.index('</table></div></div>',start)+len('</table></div></div>')
table=s[start:end].replace("key === 'program' ? '#formats' : L(lang, OFFERS[key].path)","key === 'program' ? programHref : L(lang, OFFERS[key].path)")
func='''// Reused by the training page and buying guides so retired formats cannot drift back in.
export function trainingFormatTable(lang, { programHref = L(lang, '/ai-training/') + '#formats' } = {}) {
  const c = COPY[lang];
  return `'''+table+'''`;
}

export function trainingFormatSummary(lang) {
  return lang === 'zh'
    ? `目前有三种形式：${OFFERS.workshop.minutes} 分钟团队工作坊、全天上门培训，以及 ${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟课程。工作坊与全天培训按需报价；四次课程每人 ${PROGRAM_PRICE} 起。人数、地点和准备工作量在书面报价中确认。`
    : `Choose a ${OFFERS.workshop.minutes}-minute team workshop, full-day onsite training, or ${TRAINING.sessions} live ${TRAINING.sessionMin}-minute sessions. Workshop and onsite pricing is by scoped quote; the four-session program starts at ${PROGRAM_PRICE} per person. Group size, location and preparation are agreed in the written quote.`;
}

'''
s=s[:start]+"${trainingFormatTable(lang, { programHref: '#formats' })}"+s[end:]
s=s.replace('export function trainingBrief(lang) {',func+'export function trainingBrief(lang) {',1)
p.write_text(s)

p=root/'src/posts/ai-training-for-office-managers.mjs';s=p.read_text()
s="import { trainingFormatTable, trainingFormatSummary } from '../training-buyers.mjs';\n"+s
s=s.replace('updated: undefined,',"updated: '2026-10-13',",1)
s=s.replace("sub: 'The office manager is usually the person asked to look into AI for everybody else. This is the page to work through before booking anything.',", "sub: 'Start with the tasks your office repeats, the tools your company approves and the information that must stay private. Then compare the workshop, full-day onsite and four-session formats below.',")
s=s.replace("sub: '老板周末看了几篇讲 AI 的文章，回来就问：我们是不是也该搞一下？这个问题多半会落到管办公室的人头上。',", "sub: '先列出办公室重复的任务、公司批准的工具和不能输入的信息，再选择 90 分钟工作坊、全天上门培训或四次课程。下方对比内容、准备工作与报价方式。',")
s=s.replace("'Three formats do three different jobs: 90 minutes to show a department one live build, a half day so everyone leaves with a workflow that runs, multi-week when workflows keep getting built and then dropped.',", "trainingFormatSummary('en'),")
s=s.replace("'三种形式干的是三件事：90 分钟让一个部门看一遍现场搭建；半天让每个人带着能跑起来的工作流走；多周适合那种搭了一堆、过阵子全荒废的团队。',", "trainingFormatSummary('zh'),")
s=s.replace('is built for teams of roughly 5 to 60 people where most people do not write code:', 'is built for business owners and teams where most people do not write code:')
s=s.replace('面向的是 5 到 60 人、大部分同事不写代码的团队：', '面向企业老板和大部分同事不写代码的团队：')
assert len(re.findall(r'<div class="table-wrap"><table>[\s\S]*?</table></div>',s))==2
s=re.sub(r'<div class="table-wrap"><table>[\s\S]*?</table></div>',"${trainingFormatTable('en')}",s,count=1)
s=re.sub(r'<div class="table-wrap"><table>[\s\S]*?</table></div>',"${trainingFormatTable('zh')}",s,count=1)
s=s.replace('A short briefing is more honest for them than a half day.', 'First clarify the decision or task to practise before choosing a training format.')
s=s.replace('对他们来说，做一场简短的分享比上半天课实在。', '对这类团队，先明确希望练习哪项任务或判断，再选择培训形式。')
s=re.sub(r"(\['How long should AI training for an office team take\?', )'[^']*'(\],)",r"\1trainingFormatSummary('en')\2",s)
s=re.sub(r"(\['一场 AI 培训安排多长时间合适？', )'[^']*'(\],)",r"\1trainingFormatSummary('zh')\2",s)
s=s.replace('/ai-training/#formats','/ai-training/#team-paths')
s=s.replace('What changes is how much each person does with their own hands.', 'The scope, time for practice and follow-up differ; agree these in the quote.')
s=s.replace('区别在于每个人自己动手做到什么程度。','各形式的实操时间与跟进范围不同，在报价中确认。')
p.write_text(s)

p=root/'src/posts/ai-training-for-employees-start-with-one-task.mjs';s=p.read_text()
s="import { trainingFormatSummary } from '../training-buyers.mjs';\n"+s
s=s.replace('updated: undefined,',"updated: '2026-10-13',",1)
s=re.sub(r"(\['How long does AI training for employees take\?', )'[^']*'(\],)",r"\1trainingFormatSummary('en')\2",s)
s=re.sub(r"(\['员工 AI 培训需要多长时间？', )'[^']*'(\],)",r"\1trainingFormatSummary('zh')\2",s)
s=s.replace('/ai-training/#formats','/ai-training/#team-paths')
s=s.replace('Two weeks after every session we ask whether the workflow was tested, whether the result was accurate enough to use, and whether the task should continue, change, or stop.', 'For the four-session program, each session reviews what happened between sessions. For a one-off workshop, agree any follow-up separately and name an internal owner to review the workflow after two weeks.')
s=s.replace('每场课程结束两周后，我们都会确认：工作流是否经过测试、结果是否足够准确、该任务应继续、调整还是停止。', '四次课程项目会在每节课检查课间的实际使用情况。单次工作坊的课后支持需要另行确认；团队应安排内部负责人，在两周后检查工作流是否经过测试、结果是否准确，以及应该继续、调整还是停止。')
p.write_text(s)

edit('src/pages/zhguides.mjs',[
("'搜这个问题的人大致分两种：想自己报班的个人，和想给团队找培训的公司。个人网课从免费到几千美元不等，这一页不展开。这里只回答一个问题：公司请人给团队做 AI 培训，钱花在哪里，由什么决定。'", "`AI Man Jack 的四次课程项目每人 ${PROGRAM_PRICE} 起，包含 ${TRAINING.sessions} 节 × ${TRAINING.sessionMin} 分钟实时课程；90 分钟团队工作坊和全天上门培训按需报价。这一页解释我们的报价范围和需要提前确认的费用，不把它当作整个市场的统一价格。`"),
('拿到任何一家的报价，先对照这 5 条看一遍，就知道钱花在哪里、哪些可以省。','比较报价时，先确认人数、准备工作、数据要求、地点和跟进范围是否相同。'),
('实操课的关键，是讲师能不能在课上逐一确认每个人的工作流是否跑通。人越多，需要的时间和讲师精力越多，所以报价通常按人数或场次计算。','人数会影响分组、练习时间和讲师反馈的安排。提交总人数、部门和希望实操的人数后，再确认合适的课程范围，不把公司人数当作单场实操人数上限。'),
('省钱的办法：先挑出每周确实有重复任务的人上实操课，不要几十个人一起坐着看演示。','课前先区分需要了解基本方法的人，以及需要带任务实操的人。'),
('通用课用讲师准备好的例子，便宜，但两周后很少有人记得。定制课在开课前收集每个人的任务，提前挑出能在课上跑通的几项，并准备模拟或脱敏数据。准备时间本身就是成本。','我们的课程会在课前收集团队的任务清单，选择适合练习的任务，并准备模拟或脱敏材料。定制程度和准备工作量会影响报价；不能仅凭“通用课”或“定制课”的名称判断学习效果。'),
('判断是不是真定制：开课前对方有没有向你要过任务清单。','问清楚：课前收集哪些任务、使用什么练习材料、哪些准备工作包含在报价里。'),
('会议简报、周报、客户回复这类通用任务，准备量较小。涉及病人信息、财务数据或保密合同的团队，需要更细的数据规则和审核环节，准备量和价格都会随之增加。','即使都是会议简报、周报或客户回复，不同团队允许使用的数据与审核要求也可能不同。涉及敏感信息时，先确认能否使用模拟或脱敏材料，以及谁来批准练习范围；所需准备工作在报价中说明。'),
('多数公司真正属于本行业特有的任务只有两三项，其余都是通用任务，不必为“行业专家”的名头多付钱。','判断依据是你们的具体任务和数据要求，不预设每个行业有多少项特殊任务。'),
('有的报价便宜，是因为课讲完就结束了。四次课程项目的每节课都从上次以来的使用情况开始：哪条工作流真的用上了、结果是否准确、哪里需要调整。','四次课程项目会在后续课程中检查课间使用情况：哪条工作流用上了、结果是否准确、哪里需要调整。单次工作坊的课后支持不默认包含，需要另行确定范围。'),
('比价时把跟进算进去。没有跟进的培训，两周后留在公司里的东西往往大不一样。','确认跟进次数、方式、时间范围和是否另收费，不只比较授课时长。'),
('这些钱通常不用花','这些费用先问清楚'),
('证书。团队培训的成果是能用的工作流，而不是一张证书。','证书或认证费。先确认团队是否有认证要求，不把一张证书当作工作流已经验证的证据。'),
('额外的软件账号。课程使用贵公司已批准的工具，例如 ChatGPT、Claude、Gemini 或 Copilot。','软件账号。培训费不包含工具许可证或订阅；先检查公司已批准的账号能否完成练习，是否需要其他费用在课前单独确认。'),
('录播课包。团队围绕同一批真实任务一起练习，比每人各看十小时录像更容易落地。','录像与资料。先核对报价包含哪些资料、是否有录像，以及可使用多久，不预设所有形式都包含同样的资源。'),
('没有答案的话，课越便宜风险越大——员工学得越快，贴错东西也越快。','这些问题没有答案时，应先确定工具和数据边界，再安排练习。'),
('这与美国国家标准与技术研究院的 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>思路一致：先定边界，再谈用法。','制定团队规则时，也可以参考美国国家标准与技术研究院的 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>；该框架不是对本课程的认证或效果背书。'),
('不需要专门为培训购买。课程使用贵公司已批准的工具；如果还没有批准任何工具，课前先商定一个。','先检查贵公司已批准的账号能否完成所选练习。培训费不包含工具许可证或订阅；需要额外功能或账号时，课前单独确认，不要求先购买某个套餐。'),
('搜这个问题，出来的多是榜单。榜单排的往往是谁投了广告，看不出员工上完课回到工位能不能真的用起来。下面 5 个维度，是给团队挑选 AI 培训时值得问的问题——拿去问任何一家，包括问我们。','没有适合所有团队的统一答案。先比较学员产出、讲师相关经验、跟进范围、课程形式和数据规则，再看可核实的案例与书面报价。下面的问题可以问任何一家，包括我们。'),
('为什么“AI 培训机构排名”帮不上忙','如何判断“AI 培训机构排名”是否适用'),
('排的是广告位，不是效果。榜单上看不到课程结束两周后，学员电脑上还留下了什么。','先看来源。榜单是否披露评价标准、更新时间、资料来源，以及赞助或推广关系？未披露时，不把名次直接当作效果证据。'),
('排的多是个人网课，不是企业团队培训。一个人晚上看录像考证，和一个运营团队一起把 AI 用进周报流程，是两个不同的市场。','核对服务对象。面向个人自学的录像课与企业团队实操课，准备工作和交付范围不同，不宜只比较名次或价格。'),
('比的是课程页面上写了什么，而不是课上发生了什么。“从入门到精通”谁都能写，写不出来的是：课程结束时，员工手里多了什么。','核对证据。课程介绍列出了哪些交付物？有无相关样例、真实授课记录，以及能够说明适用条件的案例？'),
('常见的培训是讲师放几十页幻灯片、演示几个惊艳的例子，大家鼓掌散会，两周后没人再打开那个工具。好的培训反过来：行政人员用自己上周的会议记录，搭一条从记录到简报的流程；销售用自己的客户回复来练习。课程结束时，每个人都有一条自己的工作流和一份核验清单。','先问这场培训是概念介绍、演示还是动手练习。例如，行政岗位可以用脱敏会议记录练习简报，销售岗位可以用模拟客户信息练习回复。要求对方明确练习任务、预期产出和人工核验方式，而不是只看课件页数。'),
('怎么问：“课程结束时，我的员工电脑上会多出什么？”答“课件和录像”的，多半是演示课。','怎么问：“课程结束时，我们会完成什么练习、带走哪些资料，哪些部分还需要继续测试？”'),
('讲 AI 的人很多，真正在团队里把 AI 用到日常工作、处理过真实数据问题的人少得多。区别藏在细节里：讲“哪些数据不能输入 AI”时，前者念政策条文，后者能讲出具体会出错的场景。','查看讲师是否有与你们任务相关的经验，并请对方解释具体限制与审核方法。授课照片可以证明授课经历；客户业务成果则需要另外核实，不能由活动人数推断。'),
('出勤率和满意度评分说明不了什么。真正要看的是：','出勤率和满意度可以说明参与体验，但不能单独证明工作流程已经改善。还应检查：'),
('一个团队想先试一次，90 分钟工作坊就够；整个部门要在同一天统一规则，适合全天上门；想让工作流真正留在公司里，需要多节课程、课间实际使用。','一个团队想先试一两项任务，可以评估 90 分钟工作坊；多个部门需要集中练习，可以评估全天上门；需要在课间实际使用、再带着问题改进，可以评估四次课程。具体安排取决于任务和人数。'),
('这一条最容易被跳过，也最容易出事。员工学会用 AI 的第一周，最常见的动作就是把客户名单、合同或病历贴进聊天框。培训如果不讲这个，等于只教了油门，没讲刹车。课程一开始就应该明确：哪些工具已获批准、哪些信息不能输入、哪些地方必须由人签字。这与 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>的思路一致：先定边界，再谈用法。','练习前先明确已批准的工具、禁止输入的信息和人工审批环节。不要在未获批准的工具里输入客户个人信息、保密合同或其他敏感资料。团队制定规则时可参考 <a href="${NIST}" target="_blank" rel="noopener">NIST AI 风险管理框架</a>，再结合自身政策确定具体要求。'),
])

edit('src/pages/training.mjs',[
("import { trainingBrief } from '../training-buyers.mjs';", "import { trainingBrief } from '../training-buyers.mjs';\nimport { buyerQuestions } from '../training-questions.mjs';"),
('export const TRAINING_FAQ = { en: C.en.faq, zh: C.zh.faq };', "for (const lang of ['en', 'zh']) C[lang].faq.push(...buyerQuestions(lang, 'program'));\nexport const TRAINING_FAQ = { en: C.en.faq, zh: C.zh.faq };"),
])
edit('src/pages/offers.mjs',[
("import { localTrainingProof } from '../training-buyers.mjs';", "import { localTrainingProof } from '../training-buyers.mjs';\nimport { buyerQuestions } from '../training-questions.mjs';"),
('${c.faq.map(([q, a], i)', '${[...c.faq, ...buyerQuestions(lang, key)].map(([q, a], i)'),
])
edit('tests/site.test.mjs',[
('// Retired half-day format: banned everywhere except two older blog posts that still describe it as advice (HANDOFF "Offer\n// (2026-09-28)", left on purpose; owner decision pending). Prices above are banned on blog posts too.\nconst RETIRED_FORMAT = [/半天工作坊/, /half[- ]day workshop/i];', '// Retired formats are banned on every indexable page, including the corrected older posts.\nconst RETIRED_FORMAT = [/半天(?:的)?(?:实操)?工作坊/, /half[- ]day(?: hands-on)? workshop/i];'),
("const bannedFor = (path) => (/^\\/(?:zh\\/)?blog\\//.test(path) ? UNAPPROVED_PRICES : UNAPPROVED);", "const bannedFor = () => UNAPPROVED;"),
])
expected = {
 'src/training-buyers.mjs': '5789ef1b27a12d5a405a786382c287aef510bda0b487160abc7318cc6ccec2f4',
 'src/posts/ai-training-for-office-managers.mjs': '9126f07559536394cba434beabb0c65b6b0cc0136712fb8da757525cc4c0803e',
 'src/posts/ai-training-for-employees-start-with-one-task.mjs': '32a85cbb269c144634575223b0f20ab265570e996d36f5a2b4a47cc9e6cb82ab',
 'src/pages/zhguides.mjs': 'e62bee65cff648efea0988abc163273e9c9941cec0733bc6947d8e1e00c0b902',
 'src/training-questions.mjs': '99c3c6ce89078c38a68c2d3c2f18f91307887be1c9ae656cb0ce56aada7d9611',
 'src/pages/training.mjs': '34500ce6ea6ae0d10fa64fb77fe0fd162be1b85432bac447139ca475b6fa6ced',
 'src/pages/offers.mjs': 'ec34b8bd2209223c35a02889b76b02660f6062533e72fce7ce5bcc9ac4884713',
 'tests/site.test.mjs': '659a478561a314fb89a0ff47fc32e4c5eb849c598c451cf34241b7a24b4370a4',
}
for path, wanted in expected.items():
 actual=hashlib.sha256((root/path).read_bytes()).hexdigest()
 assert actual == wanted, (path, actual, wanted)
print('Reviewed source bytes verified; no business config or deployment files modified.')
