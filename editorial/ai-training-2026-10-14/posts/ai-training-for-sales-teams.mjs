// New editorial draft. The date is a drafting placeholder; set the real publication date on release.
// The complete exercise is synthetic and is not a customer case study or a measured result.
export const post = {
  slug: 'ai-training-for-sales-teams',
  date: '2026-10-14',
  status: 'draft',
  en: {
    keyword: 'AI training for sales teams',
    title: 'AI Training for Sales Teams: A Worked Exercise | AI Man Jack',
    description: 'Run AI training for sales teams with a synthetic account brief, meeting agenda and follow-up. Practise checking sources, commitments and missing information.',
    h1: 'AI training for sales teams with one source-based exercise',
    sub: 'Practise the path from account notes to a meeting brief and follow-up, including the errors a salesperson must catch before anything reaches a customer.',
    takeaways: [
      'Sales training should teach source checks and commitment review alongside drafting.',
      'A useful practice pack separates confirmed facts, unknowns, questions and proposed next steps.',
      'The exercise below is synthetic; it demonstrates a method and provides no evidence of sales or productivity results.',
      'Designated approvers retain control of customer messages, pricing, promises and CRM changes within their authority.',
    ],
    sections: `
<h2>Define the task and the approval point</h2>
<p>AI training for sales teams can start with a familiar task: prepare for a customer meeting using approved notes, then draft a follow-up from the meeting record. The employee needs to practise more than generating convincing language. They need to distinguish a recorded fact from a question and a possible next step from a commitment.</p>
<p>The exercise below is a proposed teaching activity. It does not describe a customer engagement, a past classroom or an improvement in conversion rates. For a wider map of tasks, see <a href="/use-cases/sales/">sales workflows</a>; this article focuses on how a team can practise and assess one complete sequence.</p>

<h2>Prepare a synthetic source pack</h2>
<p><strong>All companies, roles, dates and details in this exercise are fictional.</strong> They exist only to make source checking possible. Use these materials, or substitute approved and appropriately redacted company material after confirming tool permissions.</p>
<table><thead><tr><th>Source</th><th>Synthetic content</th></tr></thead><tbody>
<tr><td>S1: account description</td><td>Practice Company A distributes office supplies from two locations. The operations manager coordinates replenishment reports.</td></tr>
<tr><td>S2: discovery notes</td><td>The team combines weekly spreadsheet exports into a replenishment report. It wants to discuss reducing repeated formatting. No budget, purchasing authority or implementation deadline was recorded.</td></tr>
<tr><td>S3: meeting arrangement</td><td>A 30-minute discovery call is scheduled. The salesperson may discuss the process and request a redacted sample, subject to the customer’s approval. No price or delivery date has been offered.</td></tr>
</tbody></table>
<p>Keep the source labels attached. Do not ask the model to fill gaps from memory or search for a fictional company. The point is to see whether the output stays within a small, inspectable evidence set.</p>

<h2>Use five steps and a repeatable instruction</h2>
<ol>
<li><strong>Choose the task.</strong> Produce a meeting brief and proposed agenda, rather than an account strategy with invented context.</li>
<li><strong>Provide context.</strong> Supply S1–S3 and explain the meeting’s purpose and permissions.</li>
<li><strong>Write repeatable instructions.</strong> Specify headings, source labels and how to handle unknowns.</li>
<li><strong>Verify the output.</strong> Compare every factual statement with the pack and challenge unsupported commitments.</li>
<li><strong>Set guardrails.</strong> Keep the output in a review draft; a person approves customer communication and any system update.</li>
</ol>
<pre><code>Use only S1–S3 to prepare the salesperson for the discovery call.
Return:
1. Confirmed facts, each labelled with its source.
2. Unknowns, including budget, authority and timeline.
3. Three questions that explore the reporting process.
4. A proposed agenda that totals 30 minutes.
Do not infer purchase intent, promise results, set a price or create a deadline.
Mark ideas as proposals. Do not send messages or update a CRM.</code></pre>
<p>The exact tool is secondary to the conditions of use. The company must approve the tool and the selected material. This exercise makes no assumption about browsing, account settings or a connection to sales software.</p>

<h2>Compare the draft with a reference answer</h2>
<p><strong>This reference answer is hand-written for the synthetic exercise, not a recorded model response.</strong> A valid answer may use different wording while preserving the same boundaries.</p>
<ul>
<li><strong>Confirmed:</strong> two locations (S1); spreadsheet exports feed a weekly report (S2); a discovery call is scheduled (S3).</li>
<li><strong>Unknown:</strong> budget, purchasing authority, implementation deadline and whether a sample can be shared.</li>
<li><strong>Questions:</strong> Which formatting steps repeat? Who checks the report? What would the customer permit us to inspect?</li>
<li><strong>Proposed agenda:</strong> current process, 10 minutes; constraints and sample permissions, 10 minutes; questions and possible next step, 10 minutes.</li>
</ul>
<p>The agenda’s time allocation is a training proposal, not a fact extracted from the notes. That distinction matters: the tool can help suggest a structure without presenting it as something the customer already agreed.</p>

<h2>Catch deliberate mistakes before drafting a follow-up</h2>
<p>Inspect this intentionally flawed line: “The customer approved the budget and will start the rollout next Monday.” Neither approval nor a rollout date appears in the source pack. Replace it with the relevant unknowns. A convincing tone does not make the statement supported.</p>
<p>Now add a fourth synthetic source. S4, after-call notes: “Operations manager will ask internally whether a redacted sample may be shared. Salesperson will provide a list of required fields. No deadline or next meeting was agreed.” Ask for a short follow-up using S1–S4 for background, but only S4 for agreed actions, commitments and timing. Keep those actions separate from unresolved points.</p>
<blockquote><p>Thank you for explaining the reporting process. You will check internally whether a redacted sample can be shared. I will provide a list of the fields we would need to inspect. Timing and a next meeting remain to be confirmed.</p></blockquote>
<p>This is another hand-written synthetic reference. A draft that adds “Please send the sample by Friday” has introduced a deadline. Participants should remove it or present it explicitly as a question for approval, rather than pass it off as an agreement.</p>

<h2>Use a review checklist and record what remains</h2>
<ul>
<li>Can each account fact be traced to an approved source?</li>
<li>Are hypotheses and questions clearly separated from facts?</li>
<li>Do every promise, owner and date match the meeting record?</li>
<li>Have pricing, terms and claims stayed within authorized material?</li>
<li>Has a salesperson reviewed the message before sending or logging it?</li>
</ul>
<p>Save the instruction and corrected draft as a small playbook. On subsequent permitted work, record use, errors and editing effort. Do not turn the classroom reference answer into a claim that a team improved revenue or saved a measured amount of time. The <a href="/workflows/sales-follow-up/">follow-up workflow</a> provides an additional checklist for ongoing use.</p>

<h2>When this does not work</h2>
<p>This exercise cannot repair notes that omit the commitments the team needs to communicate. Clarify the record with its owner. Sensitive pricing, personal data and confidential customer documents require appropriate permissions before use. Negotiation decisions remain with authorized people.</p>
<p>The activity also does not implement CRM automation. Software development, CRM or ERP configuration, live connections and automatic writeback are separate work requiring agreed scope, permissions and testing.</p>

<h2>Choose a training format for the team</h2>
<p>A 90-minute workshop can focus on one or two tasks such as this sequence. A full-day onsite session can allow broader guided team practice. Four live 90-minute sessions provide opportunities to try workflows between meetings, with Jack’s follow-up two weeks after the final session. Extra support after standalone sessions is scoped separately.</p>
<p>Jack Qian personally designs and teaches <a href="/ai-training/">AI Man Jack training</a> in English or Chinese, remotely across the United States and onsite in Dallas–Fort Worth. Four-session programs start at $499 per person; final scope and team pricing are confirmed in the quote. Tool subscriptions are separate and travel outside DFW is quoted separately. Bring an approved sample and the sales reviewer’s requirements to discuss a suitable starting point.</p>
`,
    faq: [
      ['Does AI training for sales teams include outreach automation?', 'Training covers the agreed exercises and review method. Automatic sends, CRM connections and writeback need separate implementation scope, permissions and testing.'],
      ['Can we use real customer notes in training?', 'Only use material approved for the selected tool and the group setting. Synthetic or appropriately redacted notes can provide an initial exercise when customer material is unsuitable.'],
      ['Does this exercise show a sales result?', 'No. The company, notes and reference answers are synthetic. They demonstrate source checking and commitment review, not a measured increase in revenue, conversion or productivity.'],
      ['Do we have to buy a particular AI subscription?', 'The tool is chosen according to the company’s approvals, task and available access. Tool accounts and subscriptions are separate from the training scope.'],
    ],
    pillar: ['AI training for business teams', '/ai-training/'],
    related: [['Sales workflows', '/use-cases/sales/'], ['Sales meeting preparation', '/workflows/sales-meeting-preparation/'], ['Follow-up email template', '/templates/follow-up-email/']],
    sources: [],
  },
  zh: {
    keyword: '销售团队 AI 培训',
    title: '销售团队 AI 培训：资料到跟进邮件练习 | AI Man Jack',
    description: '销售团队 AI 培训可用一组模拟资料，练习客户简报、会议议程和跟进草稿。本文包含输入、指令、参考输出、刻意错误及核验清单，明确承诺和审批边界。',
    h1: '销售团队 AI 培训，用一组资料练完整流程',
    sub: '从批准记录准备会议，再起草跟进内容，重点检查事实、未知信息和未经同意的承诺。',
    takeaways: [
      '销售培训应同时练习草稿生成、来源核对和承诺审核。',
      '练习材料需要区分已确认事实、未知事项、提问和建议步骤。',
      '本文全部案例材料为模拟，不构成真实客户成果或销售效果证明。',
      '面向客户的消息、价格、承诺和 CRM 改动，仍由有权限的人批准。',
    ],
    sections: `
<h2>先确定任务和审核点</h2>
<p>销售团队 AI 培训可以从熟悉的工作开始：根据批准记录准备客户会议，再根据会后记录起草跟进。参与者除了写得顺，还需要分清已记录事实与待确认问题，以及建议步骤与正式承诺。</p>
<p>下面是一项建议教学活动，不代表真实客户项目、过去课堂经历或转化率改善。更广泛的任务见<a href="/zh/use-cases/sales/">销售工作流</a>；本文聚焦怎样练习并检查一条完整流程。</p>

<h2>准备一组模拟来源</h2>
<p><strong>以下公司、角色、日期和细节全部虚构，仅用于教学核验。</strong>也可以在确认工具权限后，换成获准使用且适当脱敏的资料。</p>
<table><thead><tr><th>来源</th><th>模拟内容</th></tr></thead><tbody>
<tr><td>S1：公司介绍</td><td>练习公司 A 配送办公用品，设两个营业地点；运营主管协调补货报告。</td></tr>
<tr><td>S2：需求记录</td><td>团队每周合并表格导出，整理补货报告，希望讨论减少重复排版。未记录预算、采购权限或实施期限。</td></tr>
<tr><td>S3：会议安排</td><td>已约一场 30 分钟需求沟通。销售可讨论流程，并在客户批准的前提下请求脱敏样例；尚未报价格或交付日期。</td></tr>
</tbody></table>
<p>保留来源编号，不要求模型凭记忆补空白，也不要搜索虚构公司。练习需要一组范围小、能逐条检查的依据。</p>

<h2>用五步方法写出指令</h2>
<ol>
<li><strong>选任务：</strong>先做会议简报和建议议程，不写依赖臆测的客户战略。</li>
<li><strong>给背景：</strong>提供 S1—S3，说明用途与权限。</li>
<li><strong>整理步骤：</strong>规定栏目、来源编号和未知信息的写法。</li>
<li><strong>核对结果：</strong>逐条回查资料，检查有没有添加承诺。</li>
<li><strong>明确边界：</strong>只生成待审草稿，由人批准客户沟通与系统改动。</li>
</ol>
<pre><code>只使用 S1—S3 准备需求沟通：
1. 列已确认事实，每条标注来源。
2. 列未知事项，包括预算、权限、时间。
3. 提出三个了解报表流程的问题。
4. 建议一份合计 30 分钟的议程。
不推断采购意愿，不承诺效果，不设价格或期限。
建议必须标成建议。不要发消息或更新 CRM。</code></pre>
<p>先确认公司允许工具处理这些材料。本练习不假定工具具备联网、特定账号设置或销售系统连接能力。</p>

<h2>对照参考答案检查输出</h2>
<p><strong>以下答案由人工编写，属于模拟教学参考，不是真实模型运行记录。</strong>工具措辞可以不同，但事实和边界应当一致。</p>
<ul>
<li><strong>已确认：</strong>两个地点（S1）；表格导出用于每周报告（S2）；需求沟通已安排（S3）。</li>
<li><strong>未知：</strong>预算、采购权限、实施期限、能否分享样例。</li>
<li><strong>问题：</strong>哪些排版步骤重复？谁核对报告？允许查看什么资料？</li>
<li><strong>建议议程：</strong>现行流程 10 分钟，约束与样例权限 10 分钟，问题和可能的下一步 10 分钟。</li>
</ul>
<p>议程中的时间分配是练习建议，并非从记录提取的约定。建议可以有用，但不能写成客户已经同意的安排。</p>

<h2>找出错误，再起草跟进</h2>
<p>刻意错误：“客户已批准预算，下周一开始实施。”来源没有这两项信息，应改为待确认事项。语气肯定不能替代依据。</p>
<p>再加入第四份模拟来源 S4：“运营主管会在内部确认能否提供脱敏样例；销售负责提供所需字段清单；未约定期限或下次会议。”请用 S1—S4 交代背景，但已约定的行动、承诺和时间只以 S4 为依据，并与未决事项分开。</p>
<blockquote><p>感谢介绍报表流程。您会在内部确认能否分享脱敏样例；我会提供需要查看的字段清单。时间及下次会议仍待确认。</p></blockquote>
<p>这也是人工编写的模拟参考。如果草稿添加“请周五前发送”，就新增了期限。应删除，或明确写成供对方确认的问题，不能冒充已有约定。</p>

<h2>使用核验清单并保留记录</h2>
<ul>
<li>每项客户事实能否追溯到批准来源？</li>
<li>推测、问题与事实是否分开？</li>
<li>承诺、负责人和日期是否与记录一致？</li>
<li>价格、条款和效果表述是否有授权依据？</li>
<li>发送或录入前是否经过销售审核？</li>
</ul>
<p>把指令与修正后的草稿存成操作手册。后续在允许任务中记录实际使用、错误和编辑投入。不能把课堂参考答案当成收入提升或节省时间的证据。<a href="/zh/workflows/sales-follow-up/">销售跟进工作流</a>提供进一步的检查方法。</p>

<h2>什么时候这项练习不适合</h2>
<p>记录遗漏了承诺，就先向负责人确认。敏感价格、个人信息和客户机密资料需要相应许可。谈判决定仍由有权限的人作出。</p>
<p>练习也不包含 CRM 自动化。软件开发、CRM 或 ERP 配置、真实系统连接和自动写入需要另行界定范围、权限与测试。</p>

<h2>选择适合团队的课程</h2>
<p>90 分钟工作坊可以聚焦一两项任务；全天上门提供更广的团队实操空间。四次项目含四节各 90 分钟实时课程，课间使用再调整，最后一课两周后由 Jack 回访。单次课程后的额外支持另议。</p>
<p>Jack Qian 本人设计并讲授<a href="/zh/ai-training/">AI Man Jack 培训</a>，支持中英文、全美远程及达拉斯—沃斯堡现场。四次课程项目每人 $499 起，范围和团队价格以报价确认；工具订阅另计，DFW 外差旅另行报价。讨论时带上批准样例和审核要求，即可明确练习起点。</p>
`,
    faq: [
      ['销售团队 AI 培训包含自动外联吗？', '课程覆盖约定练习与审核方法。自动发送、CRM 连接和自动写入需要另行界定实施范围、权限与测试。'],
      ['可以使用真实客户记录吗？', '只能使用获准用于相应工具和课堂环境的资料。真实记录不适合时，可先用模拟或适当脱敏的材料练习。'],
      ['本文证明了销售效果吗？', '没有。公司、记录和参考答案全部模拟，用于练习来源核对和承诺审核，不代表收入、转化或效率改善。'],
      ['必须购买某种 AI 订阅吗？', '工具依据公司审批、任务和现有权限选择。工具账号与订阅费用不包含在培训范围内。'],
    ],
    pillar: ['企业团队 AI 培训', '/ai-training/'],
    related: [['销售工作流', '/use-cases/sales/'], ['客户会议准备', '/workflows/sales-meeting-preparation/'], ['跟进邮件模板', '/templates/follow-up-email/']],
    sources: [],
  },
};
