import { trainingFormatSummary } from '../training-buyers.mjs';
// Weekly SEO routine 2026-10-22 (Thursday). Target t18 "AI literacy training for employees" (owner page /ai-training/,
// which had no content using the word "literacy"). The five practice steps, the three closing answers and the
// deliberately flawed example come from the live /ai-training/ page; the templates are live pages under /templates/.
// EU AI Act facts (Article 4 applies from 2 February 2025; no certificate required; "sufficient" depends on staff
// knowledge and the context of use; pointing staff at product instructions is generally not enough) come from the
// European Commission AI literacy Q&A, confirmed via search on 2026-10-22 (the EU sites were not reachable from the
// routine's sandbox). The enforcement start date is left out because sources disagree by a day. No prices.
export const post = {
  slug: 'ai-literacy-training-for-employees',
  date: '2026-10-22',
  updated: undefined,
  status: 'published',
  en: {
    keyword: 'AI literacy training for employees',
    title: 'AI Literacy Training for Employees, Explained | AI Man Jack',
    description: 'AI literacy training for employees is not a course certificate. It is five skills people practise on their own tasks, plus three answers they can repeat back.',
    h1: 'AI literacy training for employees means practice on real work',
    sub: 'Most people asking for AI literacy training want to know what "literate" should look like for an office team. Here is a definition you can check, and how to train for it.',
    takeaways: [
      'AI literacy training for employees should leave each person able to do five things on their own work: pick a suitable task, give approved context, write repeatable steps, review the output, and respect data and approval boundaries.',
      'A literate employee can answer three questions without looking them up: which tools are approved, which information is off limits, and who signs off before an output is used.',
      'Under Article 4 of the EU AI Act, in application since 2 February 2025, providers and deployers of AI systems must take measures to ensure a sufficient level of AI literacy among their staff. The European Commission says no certificate is required.',
      'The Commission also says that simply pointing staff to a product\'s instructions will generally not be enough. Practice on the tasks people actually do is the part a slide deck cannot replace.',
      'Check literacy a week later by asking people to run one task and show how they checked it, not by a quiz score.',
    ],
    sections: `
<h2>What people mean when they ask for AI literacy</h2>
<p>The request usually arrives in one of two shapes. A manager has seen staff pasting work into chat assistants and wants everyone brought to the same baseline. Or someone in compliance has read that "AI literacy" is now an obligation in the EU and wants to know what a training programme should contain. Both are asking for AI literacy training for employees, and both need the same thing: a definition of "literate" that a manager can check on a Tuesday.</p>
<p>A definition built on vocabulary does not work. Knowing what a large language model is, or what a token is, does not stop someone from pasting a client contract into a personal account. At the five community talks we ran in Plano and Dallas in 2026, with 40 to 70 sign-ups each, and at one 37-guest hackathon, the people who struggled were rarely missing a term. They were missing a way to decide whether an answer was good enough to use.</p>

<h2>A definition you can check: five skills and three answers</h2>
<p>Our <a href="/ai-training/">corporate AI training</a> is built around five practice steps. They also work as a plain definition of AI literacy for an office team. A literate employee can:</p>
<ol>
<li><strong>Choose a suitable task.</strong> Recurring work with clear inputs and an output someone can check. A five-point meeting brief from approved notes qualifies. "Plan our strategy" does not.</li>
<li><strong>Provide useful context.</strong> Supply approved material, explain the constraints, and specify the format. Most weak answers come from a one-line request with no source attached.</li>
<li><strong>Build repeatable steps.</strong> Write an instruction a colleague could reuse, test and revise, instead of retyping a new request each week.</li>
<li><strong>Review the output.</strong> Check facts, missing context and unsupported claims. In every session we practise this on a deliberately flawed example, because catching one wrong answer teaches more than watching ten right ones.</li>
<li><strong>Set clear boundaries.</strong> Know which information can be used and where a person must approve the result before it goes anywhere.</li>
</ol>
<p>The fifth skill comes down to three answers every employee should be able to repeat a week later: which tools are approved, which information is off limits, and who signs off before an output is used. If those answers do not exist yet, write them first. Our <a href="/blog/ai-policy-for-small-business-employees/">one-page AI policy guide</a> and the free <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> cover how.</p>

<h2>Where the EU AI Act fits</h2>
<p>Article 4 of the EU AI Act has applied since 2 February 2025. It asks providers and deployers of AI systems to take measures to ensure a sufficient level of AI literacy among their staff and other people using AI systems on their behalf. The <a href="https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers">European Commission's AI literacy Q&amp;A</a> adds three points that matter for planning a programme:</p>
<ul>
<li>No certificate is required. What counts as "sufficient" depends on the staff's technical knowledge, experience, education and training, and on the context in which the AI is used.</li>
<li>Simply telling staff to read a product's instructions will generally not be enough.</li>
<li>The obligation reaches beyond employees to people working under the organisation's remit, such as contractors.</li>
</ul>
<p>Most Dallas–Fort Worth companies we talk to have no EU operations, and whether the Act applies to yours is a question for your lawyer, not a trainer. It is still a useful benchmark. A regulator that refused to accept "read the manual" as literacy is describing the same gap every manager sees: people need practice on their own work, in context.</p>

<h2>How to run AI literacy training for employees</h2>
<ol>
<li><strong>Start from the approved tool.</strong> Run the session on the assistant the company has already approved, whether that is <a href="/ai-training/copilot/">Microsoft Copilot</a>, <a href="/ai-training/chatgpt/">ChatGPT</a> or another tool. Training on a tool people cannot use at work produces literacy nobody can apply.</li>
<li><strong>Have each person bring one recurring task.</strong> The method for picking it is in <a href="/blog/ai-training-for-employees-start-with-one-task/">start AI training with one task</a>. A task from their own week makes every later step concrete.</li>
<li><strong>Use synthetic, redacted or approved material.</strong> The exercise data should already sit inside the boundaries you want people to learn. Practising on a real customer file teaches the opposite lesson.</li>
<li><strong>Make review the main exercise.</strong> Hand out at least one output with a planted error and ask the group to find it. Then have each person review their own output against the source.</li>
<li><strong>Close on the three answers.</strong> Every participant should leave able to say which tools are approved, what never goes in, and who signs off. Write the sign-off names down in the room.</li>
<li><strong>Check a week later.</strong> Ask three people to run their task again and show how they checked it. That is a better literacy measure than any quiz.</li>
</ol>

<h2>When this does not work</h2>
<p>This approach fails when there is no approved tool. If staff can only practise on personal accounts, the training quietly teaches them to keep using personal accounts. Approve one tool in writing first; the <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> is built for that decision.</p>
<p>It also fails when "literacy" is measured by attendance. A completed module or a signed attendance sheet says who was in the room, not who can catch a wrong answer. If the only record you keep is a list of names, you have trained nobody you can point to.</p>
<p>And it does not replace legal advice. If your company provides or deploys AI systems in the EU, the documentation you keep is a compliance question. A workshop can give your staff the skills; it cannot tell you what your regulator will accept as evidence.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>Write down your three answers: approved tools, off-limits information, and who signs off. If any is blank, fill it before booking training.</li>
<li>Ask three employees to show you, on screen, how they last checked an AI answer before using it. Their answers tell you where literacy actually stands.</li>
<li>Pick one recurring task per team that could be practised with redacted or synthetic material.</li>
</ul>
<p>If you want this run for a whole team in one room, the formats and how each one works are on the <a href="/ai-training/#team-paths">AI training page</a>. A leadership group that needs to set the rules before staff are trained can start with <a href="/ai-training/leadership-teams/">AI training for leadership teams</a>.</p>
`,
    faq: [
      ['What is AI literacy training for employees?', 'Training that leaves each employee able to use AI on their own work safely: choose a suitable task, give approved context, write repeatable steps, review the output for errors, and keep to the company\'s data and approval rules. It should end with every person able to say which tools are approved, what information is off limits, and who signs off.'],
      ['Is AI literacy training required by law?', 'Article 4 of the EU AI Act, in application since 2 February 2025, requires providers and deployers of AI systems to take measures to ensure a sufficient level of AI literacy among their staff. Whether it applies to a particular company depends on its EU activity, so check with your lawyer.'],
      ['Do employees need a certificate to show AI literacy?', 'The European Commission\'s AI literacy Q&A says no certificate is required under the EU AI Act. What counts is whether staff have the knowledge and practice their role and context need. A practical check, such as running a real task and showing how the output was reviewed, says more than a certificate.'],
      ['How long does AI literacy training take?', trainingFormatSummary('en')],
      ['Do employees need technical skills for AI literacy training?', 'No. The sessions are for people who do not write code. The skills are choosing the right task, giving clear instructions with approved material, and checking the result before it is used.'],
    ],
    pillar: ['corporate AI training for employees', '/ai-training/'],
    related: [['Corporate AI training: method and formats', '/ai-training/'], ['AI policy for small business employees', '/blog/ai-policy-for-small-business-employees/'], ['Start AI training with one task', '/blog/ai-training-for-employees-start-with-one-task/'], ['AI data boundaries one-pager', '/templates/ai-data-boundaries-one-pager/']],
    sources: [
      ['European Commission: AI literacy, questions and answers', 'https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers'],
      ['EUR-Lex: Regulation (EU) 2024/1689 (AI Act)', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'],
    ],
  },
  zh: {
    keyword: '员工 AI 素养培训',
    title: '员工 AI 素养培训：该教什么、怎么检验 | AI Man Jack',
    description: '员工 AI 素养培训不是一张结业证书，而是员工在自己的工作上练会五项技能，并能说出三个答案：用哪些工具、什么不能输入、谁来审批。',
    h1: '员工 AI 素养培训，要在真实工作上练',
    sub: '想做 AI 素养培训的公司，多半想知道一个办公室团队“懂 AI”到底该是什么样。下面给出一个可以检验的定义，以及怎么照着它培训。',
    takeaways: [
      '员工 AI 素养培训应让每个人在自己的工作上做到五件事：选对任务、提供经批准的背景资料、写出可重复的步骤、核对输出、守住数据与审批边界。',
      '具备 AI 素养的员工不用查资料就能回答三个问题：哪些工具已获批准、哪些信息不得输入、输出在使用前由谁签字。',
      '欧盟《人工智能法》第 4 条自 2025 年 2 月 2 日起适用，要求 AI 系统的提供者和部署者采取措施，确保员工具备足够的 AI 素养。欧盟委员会表示不要求证书。',
      '欧盟委员会还表示，仅让员工阅读产品使用说明一般是不够的。在员工真实任务上的练习，是幻灯片替代不了的部分。',
      '一周后检验 AI 素养，看员工能否跑一遍任务并说明怎么核对的，而不是看测验分数。',
    ],
    sections: `
<h2>大家说“AI 素养”时，指的是什么</h2>
<p>这类需求通常有两种来源。一种是管理者发现员工已经在把工作内容贴进各种对话式 AI，想让所有人达到同一条基线；另一种是负责合规的同事读到“AI 素养”在欧盟已成为一项义务，想知道培训该包含什么。两者要的都是员工 AI 素养培训，也都需要同一样东西：一个管理者在普通工作日就能检验的“懂 AI”的定义。</p>
<p>靠名词解释来定义行不通。知道什么是大语言模型、什么是 token，并不能阻止有人把客户合同贴进个人账号。2026 年我们在 Plano 和达拉斯办过五场社区讲座（每场 40 到 70 人报名）和一场 37 人的黑客松，真正卡住的人很少是因为缺一个术语，而是缺少一种判断方法：这个回答够不够好、能不能拿去用。</p>

<h2>一个可以检验的定义：五项技能和三个答案</h2>
<p>我们的<a href="/zh/ai-training/">企业 AI 培训</a>围绕五个实操步骤展开，它们也可以直接作为办公室团队 AI 素养的定义。具备 AI 素养的员工能够：</p>
<ol>
<li><strong>选择合适的任务。</strong>从重复性工作中挑输入明确、结果便于核验的任务。“根据已批准的记录整理五点会议简报”合适，“帮我们制定战略”不合适。</li>
<li><strong>提供清晰的背景。</strong>给出经批准的资料，说明限制条件和所需格式。多数糟糕的回答，来自一句话的请求、没有附任何资料。</li>
<li><strong>整理为可重复执行的步骤。</strong>写出同事也能拿去用、测试和修改的操作说明，而不必每周重新打一遍请求。</li>
<li><strong>核对输出。</strong>检查事实、遗漏的信息和缺少依据的说法。每场课程我们都会用一个刻意设置错误的示例来练习，因为找出一个错误答案，比看十个正确答案学到的更多。</li>
<li><strong>明确数据与审批边界。</strong>清楚哪些信息可以使用，以及哪些结果在发出前必须由人审批。</li>
</ol>
<p>第五项技能最终落在三个答案上，每位员工一周后都应能复述：哪些工具已获批准、哪些信息不得输入、输出在使用前由谁签字。如果这三个答案还不存在，先把它们写出来。具体做法见我们的<a href="/zh/blog/ai-policy-for-small-business-employees/">一页纸 AI 使用规范</a>和免费的 <a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>。</p>

<h2>欧盟《人工智能法》在其中的位置</h2>
<p>欧盟《人工智能法》第 4 条自 2025 年 2 月 2 日起适用，要求 AI 系统的提供者和部署者采取措施，确保其员工以及代表其使用 AI 系统的其他人员具备足够的 AI 素养。<a href="https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers">欧盟委员会的 AI 素养问答</a>补充了三点，对规划培训很有用：</p>
<ul>
<li>不要求证书。“足够”的标准取决于员工的技术知识、经验、教育和培训背景，以及 AI 的使用场景。</li>
<li>仅让员工阅读产品使用说明，一般是不够的。</li>
<li>这项义务不只覆盖正式员工，也包括在组织职责范围内工作的人，例如外包人员。</li>
</ul>
<p>我们接触的达拉斯—沃斯堡公司大多没有欧盟业务；这条法规是否适用于贵公司，应该问律师，而不是问培训师。但它仍是一个有用的参照：连监管机构都不接受“读一下说明书”算作素养，说明的正是每位管理者都看得到的缺口——员工需要在自己的工作、自己的场景里练习。</p>

<h2>员工 AI 素养培训怎么做</h2>
<ol>
<li><strong>从已批准的工具开始。</strong>培训就用公司已批准的助手，无论是 <a href="/zh/ai-training/copilot/">Microsoft Copilot</a>、<a href="/zh/ai-training/chatgpt/">ChatGPT</a> 还是其他工具。在员工上班用不了的工具上培训，练出来的素养没人能用上。</li>
<li><strong>每人带一项重复性任务。</strong>怎么挑，见<a href="/zh/blog/ai-training-for-employees-start-with-one-task/">员工 AI 培训从一项任务开始</a>。用自己这一周的任务，后面每一步都会变得具体。</li>
<li><strong>使用模拟、脱敏或经批准的资料。</strong>练习数据本身就应在你希望员工学会的边界之内。拿真实客户档案来练，教会的恰恰是相反的习惯。</li>
<li><strong>把核验作为主要练习。</strong>至少发一份埋了错误的输出，请大家找出来；再让每个人对照来源核对自己的输出。</li>
<li><strong>以三个答案收尾。</strong>每位学员离开时都应能说出：哪些工具已获批准、什么信息不能输入、由谁签字。签字人的名字当场写下来。</li>
<li><strong>一周后回查。</strong>请三位员工再跑一遍自己的任务，并演示是怎么核对的。这比任何测验都更能衡量素养。</li>
</ol>

<h2>什么时候这套做法不灵</h2>
<p>没有已批准的工具时，这套做法不灵。如果员工只能在个人账号上练，培训等于在悄悄教他们继续用个人账号。先书面批准一款工具；<a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>就是为这个决定准备的。</p>
<p>用出勤来衡量“素养”时，也不灵。完成一门网课或签了到，只说明谁来过，不说明谁能发现错误答案。如果你留下的唯一记录是一份名单，那就没有哪位员工能证明自己真的学会了。</p>
<p>它也替代不了法律意见。如果贵公司在欧盟提供或部署 AI 系统，需要留存哪些材料是合规问题。工作坊能给员工技能，但不能告诉你监管机构会接受什么作为证据。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>写下三个答案：已批准的工具、不得输入的信息、由谁签字。哪一项是空的，就先补上，再安排培训。</li>
<li>请三位员工在屏幕上演示，他们上一次在使用 AI 回答前是怎么核对的。他们的回答会告诉你团队的 AI 素养真实处在什么水平。</li>
<li>为每个团队挑一项可以用脱敏或模拟资料练习的重复性任务。</li>
</ul>
<p>如果希望整个团队在同一间教室里完成这套练习，各种培训形式及其做法见 <a href="/zh/ai-training/#team-paths">AI 培训页面</a>。如果管理层需要先定规则、再培训员工，可以从<a href="/zh/ai-training/leadership-teams/">管理层 AI 培训</a>开始。</p>
`,
    faq: [
      ['什么是员工 AI 素养培训？', '让每位员工能在自己的工作中安全使用 AI 的培训：选对任务、提供经批准的背景资料、写出可重复的步骤、核对输出中的错误，并遵守公司的数据与审批规则。培训结束时，每个人都应能说出哪些工具已获批准、哪些信息不得输入、由谁签字。'],
      ['AI 素养培训是法律要求吗？', '欧盟《人工智能法》第 4 条自 2025 年 2 月 2 日起适用，要求 AI 系统的提供者和部署者采取措施，确保员工具备足够的 AI 素养。是否适用于某家公司，取决于它在欧盟的业务，请咨询律师。'],
      ['员工需要证书来证明 AI 素养吗？', '欧盟委员会的 AI 素养问答表示，《人工智能法》不要求证书。关键在于员工是否具备其岗位和使用场景所需的知识与练习。让员工跑一遍真实任务并说明怎么核对输出，比一张证书更能说明问题。'],
      ['AI 素养培训需要多长时间？', trainingFormatSummary('zh')],
      ['员工需要技术背景吗？', '不需要。课程面向不写代码的岗位。需要练的是选对任务、用经批准的资料给出清晰指令，以及在使用前核对结果。'],
    ],
    pillar: ['面向员工的企业 AI 培训', '/ai-training/'],
    related: [['企业 AI 培训：方法与形式', '/ai-training/'], ['小企业员工 AI 使用规范', '/blog/ai-policy-for-small-business-employees/'], ['员工 AI 培训从一项任务开始', '/blog/ai-training-for-employees-start-with-one-task/'], ['AI 数据边界一页纸', '/templates/ai-data-boundaries-one-pager/']],
    sources: [
      ['欧盟委员会：AI 素养问答（英文）', 'https://digital-strategy.ec.europa.eu/en/faqs/ai-literacy-questions-answers'],
      ['EUR-Lex：欧盟《人工智能法》（Regulation (EU) 2024/1689）', 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj'],
    ],
  },
};
