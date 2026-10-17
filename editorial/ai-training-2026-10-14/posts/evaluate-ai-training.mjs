// Editorial draft only. Change the holding date to the approved publication date before release.
// The evaluation worksheet is editorial guidance, not a report of a customer engagement.
// Current offer boundaries checked in src/pages/training.mjs and src/pages/offers.mjs on 2026-10-14.
export const post = {
  slug: 'evaluate-ai-training',
  date: '2026-10-14',
  updated: undefined,
  status: 'draft',
  en: {
    keyword: 'evaluate AI training',
    title: 'Evaluate AI Training on Real Team Tasks | AI Man Jack',
    description: 'Evaluate AI training with a task baseline, usage record, accuracy checklist and review-effort log. Decide which workflows to continue, change or stop.',
    h1: 'How to evaluate AI training after your team tries the work',
    sub: 'Record the starting task, trial the workflow and review what happened. A fluent demonstration and a completed class are not yet evidence of business value.',
    takeaways: [
      'Evaluate AI training by tracking actual workflow use, output accuracy and the effort required to review and correct the work.',
      'Record the current task before the trial so any later comparison includes the same scope and the human work that remains.',
      'Continue, change or stop a workflow based on a documented review; no universal productivity target fits every business task.',
      'AI Man Jack’s four-session program includes a review two weeks after the final session; extra support after standalone training is separately scoped.',
    ],
    sections: `
<h2>Choose one task before choosing a success metric</h2>
<p>To evaluate AI training, begin with a task your team can describe and check. For example, a meeting-notes exercise has an input, a draft action list and a person who can confirm the owner and due date. “Get better at AI” does not define an observable result.</p>
<p>Attendance, satisfaction and a successful classroom demo answer useful but limited questions. They do not establish whether people used the workflow later, whether its output was accurate or whether checking it took more work than the original method. Keep those questions separate in the review.</p>
<p>The framework below is a proposed measurement method. It contains no customer result, claimed saving or typical improvement rate. Set the review period and decision criteria to match the task before the trial begins.</p>

<h2>Write a baseline for the current way of working</h2>
<p>Use a recent suitable example or observe a normal instance of the task. Record the source material, required output, responsible person and reviewer. Note the time spent preparing, doing, checking and correcting the task, together with any known quality problem. If time was not measured, mark it unknown rather than estimating it later from memory.</p>
<p>Describe the scope precisely. A short meeting and a long meeting with several speakers are different cases; a draft action list is different from a final list checked with the participants. Keep the same definition of finished work when comparing methods, and record material differences between the examples.</p>
<p>Do not place confidential material into a new tool just to build the baseline. Use approved records and follow the company’s data rules. The <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> can help identify tool access and restrictions before a trial.</p>

<h2>Trial the workflow with five repeatable steps</h2>
<ol>
<li><strong>Choose suitable work.</strong> Pick a recurring task with clear input and a result a knowledgeable person can check.</li>
<li><strong>Provide approved context.</strong> State the source material, goal, constraints and output format. Use synthetic, redacted or company-approved material.</li>
<li><strong>Write repeatable instructions.</strong> Save the steps and version used, so the team can understand what changed between attempts.</li>
<li><strong>Check the output.</strong> Compare it with the source, identify omissions and unsupported claims, and record corrections.</li>
<li><strong>Apply the boundaries.</strong> Confirm permitted information, the human approval point and where the draft is allowed to go.</li>
</ol>
<p>The <a href="/workflows/meeting-notes-to-action-items/">meeting-notes workflow</a> is one task to inspect. During a trial, use approved tools and keep the existing reviewer responsible. Training should not quietly introduce live-system access or automatic updates.</p>

<h2>Keep an actual-use and review-effort log</h2>
<p>Copy this worksheet for each workflow. Complete it after an attempt while the details are still available. A skipped attempt is useful evidence too: record whether the reason was lack of access, no suitable task, unclear instructions or something else.</p>
<div class="table-wrap"><table><caption>AI workflow evaluation record — blank template, not customer data</caption><thead><tr><th scope="col">Record</th><th scope="col">Baseline or trial entry</th></tr></thead><tbody>
<tr><th scope="row">Task and scope</th><td>Name the input, expected output and definition of finished work.</td></tr>
<tr><th scope="row">Date, owner and reviewer</th><td>Record the people responsible and the observation date.</td></tr>
<tr><th scope="row">Tool and instruction version</th><td>Identify the approved tool and the saved workflow instructions.</td></tr>
<tr><th scope="row">Actual use</th><td>Used, tried then abandoned, or not attempted; explain why.</td></tr>
<tr><th scope="row">Preparation and drafting effort</th><td>Record observed time or mark unknown, including material preparation.</td></tr>
<tr><th scope="row">Accuracy and completeness</th><td>List checked facts, omissions, unsupported statements and their seriousness.</td></tr>
<tr><th scope="row">Review and correction effort</th><td>Record checking, rewriting and approval work; do not omit it from comparisons.</td></tr>
<tr><th scope="row">Usable result</th><td>Accepted after review, revised, rejected or awaiting information.</td></tr>
<tr><th scope="row">Decision</th><td>Continue, change or stop; name an owner and the next review date.</td></tr>
</tbody></table></div>
<p>There is no preset passing score in this sheet. The task owner should decide which errors are unacceptable before the trial. A wrong customer name, invented commitment or incorrect owner can matter even when the rest of a draft reads well.</p>

<h2>Review accuracy before calculating a saving</h2>
<p>Ask the reviewer to check the output against approved sources. For an action list, examine actions, owners, due dates and unresolved questions. An item that was never agreed should not become a fact because the model supplied it confidently. Record whether the error came from missing source information, unclear instructions or an unsupported model addition.</p>
<p>Only compare time when the tasks and output requirements are reasonably comparable and the time was observed. Include preparation, drafting, verification, corrections and approval in both methods. A faster first draft does not establish a net saving if the reviewer then has to reconstruct the source.</p>
<p>Do not extrapolate one exercise into an annual financial return. If you later publish a result, state the task, observation period, number of observed attempts, method, remaining human work and limitations. Get appropriate permission before sharing client material.</p>

<h2>Make a continue, change or stop decision</h2>
<p><strong>Continue</strong> when the responsible reviewer accepts the task under the agreed conditions and the team can explain the steps. Keep human approval and schedule another check if the input or tool changes.</p>
<p><strong>Change</strong> when the task appears suitable but the source, instructions or checklist needs improvement. Make one clear revision, save its version and repeat the trial. A changed prompt without a record makes comparison harder.</p>
<p><strong>Stop</strong> when the workflow cannot meet the task’s requirements, checking is impractical, required access is unavailable or the material is outside approved data boundaries. Stopping an unsuitable workflow is a valid review outcome.</p>

<h2>What AI Man Jack’s follow-up includes</h2>
<p>In the <a href="/ai-training/#formats">four-session program</a>, participants try workflows between meetings and bring back errors, questions and review difficulties. Two weeks after the final session, Jack considers actual use, accuracy and checking effort, then discusses whether each workflow should continue, change or stop.</p>
<p>That review belongs to the four-session program. Extra support after a standalone workshop or onsite day is separately scoped. Training excludes software development and CRM/ERP configuration and integration; connecting live systems or writing back automatically requires separate scope, permissions and testing.</p>

<h2>When this evaluation does not work</h2>
<p>A comparison does not work when the baseline is missing, the task changes unnoticed or nobody can verify the output. Fix the record or report the result as inconclusive. A two-week window may contain no instance of an infrequent task; that absence cannot establish success or failure, so agree another review time.</p>
<p>For the next step, choose one task and complete the baseline before training. Bring the questions to a <a href="/book/">workflow call</a>, or use the <a href="/templates/two-week-workflow-review/">two-week review template</a> for your own internal review. Keep observations separate from hoped-for results.</p>
`,
    faq: [
      ['What should we measure after AI training?', 'Track whether the workflow was used, whether its output met the task’s accuracy and completeness requirements, and how much effort checking and correcting it required. Record the task baseline before comparing results.'],
      ['Does a faster AI draft prove the training saved time?', 'No. A comparison needs comparable tasks and observed preparation, drafting, checking, correction and approval time. Faster drafting alone does not establish a net saving.'],
      ['When does AI Man Jack review the four-session program?', 'Jack reviews actual use, accuracy and checking effort two weeks after the final session of the four-session program. Extra support after a standalone workshop or onsite day is separately scoped.'],
      ['What if the team has not used the workflow by the review date?', 'Record why it was not attempted, such as no suitable task, missing access or unclear instructions. If the task did not occur during the observation period, agree another review date rather than inventing a result.'],
    ],
    pillar: ['task-based AI training for business teams', '/ai-training/'],
    related: [['Two-week workflow review', '/templates/two-week-workflow-review/'], ['Meeting notes to action items', '/workflows/meeting-notes-to-action-items/'], ['AI tool approval checklist', '/templates/ai-tool-approval-checklist/']],
    sources: [],
  },
  zh: {
    keyword: 'AI 培训效果评估',
    title: 'AI 培训效果评估：记录使用与核验投入 | AI Man Jack',
    description: '给团队做 AI 培训效果评估，先记录原任务基线，再检查实际使用、准确性和审核投入。附可填写的工作流记录表，以及继续、调整或停止的判断方法。',
    h1: 'AI 培训效果评估，从一次可核验的真实任务开始',
    sub: '把原来的做法记录下来，再试用工作流，检查实际使用、输出质量和人工审核投入，最后作出明确决定。',
    takeaways: [
      'AI 培训效果评估要分别记录实际使用、输出准确性和核验投入，不能只看出勤与满意度。',
      '比较前先定义原任务、输入、最终输出和人工工作；没有测量的时间应标为未知。',
      '每条工作流按记录决定继续、调整或停止，不设没有依据的统一生产率目标。',
      'AI Man Jack 四次课程项目在最后一课结束两周后回访，单次培训的额外支持另行确定。',
    ],
    sections: `
<h2>先选任务，再选成功指标</h2>
<p>做 AI 培训效果评估，先确定团队能描述、也能检查的任务。例如从会议记录整理待办事项，输入是记录，输出是行动清单，由了解会议的人确认负责人和日期。“更会用 AI”无法直接观察。</p>
<p>出勤、满意度和课堂演示分别回答有限的问题，不能说明课后是否实际使用、输出是否准确，或核验是否比原做法更费力。下面是一套建议的记录方法，没有真实客户结果、节时数据或典型提升比例。试用前先商定观察时间和判断标准。</p>

<h2>为原来的工作方式建立基线</h2>
<p>选一个适合的近期任务，或观察一次正常操作。记录资料来源、所需输出、执行人和审核人，再分别记录准备、制作、检查和修改的时间。没有实测就写未知，不在事后凭印象补数字。</p>
<p>范围要一致。短会和多位发言人的长会不同，待办初稿与已经找参与人核对的最终清单也不同。比较前先定义什么叫完成，并记下材料之间的重要差异。</p>
<p>不要为了测基线把保密材料放入新工具。按公司规则使用已批准的记录，先通过<a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>确认权限与限制。</p>

<h2>用五步法试用工作流</h2>
<ol>
<li><strong>选任务：</strong>重复发生、输入明确，而且有懂行的人能核验。</li>
<li><strong>给背景：</strong>说明目标、限制和输出格式，使用模拟、脱敏或公司批准的资料。</li>
<li><strong>写步骤：</strong>保留操作说明与版本，能够知道每次尝试改了什么。</li>
<li><strong>查输出：</strong>对照来源，记录遗漏、没有依据的说法和实际修改。</li>
<li><strong>守边界：</strong>确认允许的信息、人工审批节点和草稿可流向哪里。</li>
</ol>
<p>可以查看<a href="/zh/workflows/meeting-notes-to-action-items/">会议记录转待办事项</a>的具体任务。试用期间继续由原负责人核验，不因培训就自动开放真实系统权限或自动更新记录。</p>

<h2>每条工作流保留一张使用与核验记录</h2>
<p>下面是空白模板，不是客户数据。每次尝试后及时填写；没有尝试也要记录原因，例如工具权限不足、没有合适任务或步骤不清。</p>
<div class="table-wrap"><table><caption>AI 工作流效果记录表：待填写模板</caption><thead><tr><th scope="col">字段</th><th scope="col">填写内容</th></tr></thead><tbody>
<tr><th scope="row">任务与范围</th><td>输入、预期输出、怎样才算完成。</td></tr>
<tr><th scope="row">日期与负责人</th><td>执行人、审核人、观察日期。</td></tr>
<tr><th scope="row">工具与步骤版本</th><td>批准工具、保存的操作说明版本。</td></tr>
<tr><th scope="row">实际使用</th><td>使用、尝试后放弃或未尝试，并写原因。</td></tr>
<tr><th scope="row">准备与起草</th><td>实测投入或未知，包含整理资料的时间。</td></tr>
<tr><th scope="row">准确与完整</th><td>检查的事实、遗漏、无依据说法及严重程度。</td></tr>
<tr><th scope="row">核验与修正</th><td>检查、重写和审批所需投入。</td></tr>
<tr><th scope="row">最终结果</th><td>审核后采用、修改、拒绝或等待补充资料。</td></tr>
<tr><th scope="row">决定</th><td>继续、调整或停止，负责人及下一复盘日期。</td></tr>
</tbody></table></div>
<p>表格没有统一及格分。任务负责人应在试用前定义不能接受的错误。客户姓名不对、编出未同意的承诺、把责任人写错，都可能比文笔是否流畅更重要。</p>

<h2>先看准确性，再计算节省时间</h2>
<p>审核人对照批准来源，逐项检查行动、负责人、日期和未决问题。模型写得肯定，不能把没有讨论过的事情变成事实。记录错误来自资料缺失、指令不清，还是模型自行添加，再决定改什么。</p>
<p>只有任务与输出要求足够接近，且时间经过观察，才适合比较。两种方式都应包括准备、起草、核验、修正和审批。初稿更快，审核人却要重新整理全部来源，不能只计算起草阶段。</p>
<p>一次练习也不足以推算全年财务收益。将来公开结果时，需要说明任务、观察期、实际尝试次数、测量方法、保留的人工工作和局限；分享客户资料前取得适当许可。</p>

<h2>给出继续、调整或停止的决定</h2>
<p><strong>继续：</strong>负责人认为结果符合约定条件，团队也能复述步骤。保留人工审批，输入或工具改变时再检查。</p>
<p><strong>调整：</strong>任务合适，但来源、指令或核验清单需要改。明确一次修改，保存版本，再试一次，避免无法追踪的提示词变化。</p>
<p><strong>停止：</strong>达不到任务要求、核验不现实、权限无法取得，或资料超出批准边界。停止不适合的工作流，也是有效结论。</p>

<h2>AI Man Jack 的回访范围</h2>
<p><a href="/zh/ai-training/#formats">四次课程项目</a>让参与者课间试用，再带着疑问、错误和核验困难回来。最后一课结束两周后，Jack 查看实际使用、准确性和审核投入，讨论每条流程继续、调整还是停止。</p>
<p>这项回访属于四次项目，单次工作坊或全天上门后的额外支持另议。培训不含软件开发和 CRM／ERP 配置集成；连接真实系统或自动写回需要另定范围、权限与测试。</p>

<h2>什么时候这套评估不适合下结论</h2>
<p>没有基线、任务范围已经变化，或没人能核验时，先补记录，或把结果标为暂不能判断。低频任务两周内可能根本没有发生，不能据此证明成功或失败，应另约观察时间。</p>
<p>下一步先选一项任务，在培训前完成基线。带着问题参加<a href="/zh/book/">工作流咨询</a>，或使用<a href="/zh/templates/two-week-workflow-review/">两周工作流复盘表</a>自行复盘。把观察到的结果和希望得到的结果分开记录。</p>
`,
    faq: [
      ['AI 培训结束后应该测什么？', '分别记录是否实际使用、准确性与完整性是否达到任务要求，以及检查和修正需要多少投入。比较结果前先建立原任务基线。'],
      ['AI 起草更快，就代表培训节省时间吗？', '不能这样判断。任务要可比，并实测准备、起草、核验、修改和审批的投入；只看初稿速度不能证明净节时。'],
      ['AI Man Jack 什么时候回访四次课程项目？', '最后一节课结束两周后，Jack 查看实际使用、准确性与核验投入。单次工作坊或全天上门培训后的额外支持需要另议。'],
      ['到了复盘日还没有实际用过怎么办？', '记录没有尝试的原因，例如没有合适任务、权限不足或步骤不清。如果观察期间任务没有发生，另约复盘时间，不补造结果。'],
    ],
    pillar: ['围绕真实任务开展的企业 AI 培训', '/ai-training/'],
    related: [['两周工作流复盘表', '/templates/two-week-workflow-review/'], ['会议记录转待办事项', '/workflows/meeting-notes-to-action-items/'], ['AI 工具审批清单', '/templates/ai-tool-approval-checklist/']],
    sources: [],
  },
};
