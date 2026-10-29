import { trainingFormatSummary } from '../training-buyers.mjs';
// Weekly SEO routine 2026-10-29 (Thursday), CRM ticket 92659005. Target t20 "hands-on AI agent workshop for teams"
// (owner page /ai-training/team-workshop/, whose title and H1 do not say "agent"). The workshop agenda, data rules and
// what-you-leave-with come from the live /ai-training/team-workshop/ page. The agent definition ("a model that uses tools
// in a loop, not a product label") and the multi-agent demo come from the live 2026-05-17 OpenClaw meetup page, which
// cites Jack's Episode 01 write-up on realagentusecases.com. The 37 builders / three-hour afternoon facts come from the
// live 2026-04-18 hackathon page. No prices, no client names, no outcome numbers.
export const post = {
  slug: 'hands-on-ai-agent-workshop-for-teams',
  date: '2026-10-29',
  updated: undefined,
  status: 'published',
  en: {
    keyword: 'hands-on AI agent workshop for teams',
    title: 'Hands-On AI Agent Workshop for Teams, Explained | AI Man Jack',
    description: 'A hands-on AI agent workshop for teams should end with one working agent in ChatGPT or Claude, tested on real tasks, with data rules and a named sign-off.',
    h1: 'What a hands-on AI agent workshop for teams actually looks like',
    sub: 'Teams asking for an agent workshop usually want to leave with something that runs, not a talk about the future. Here is what that session should contain, step by step, and where it goes wrong.',
    takeaways: [
      'A hands-on AI agent workshop for teams should end with each team owning one working agent, built in the AI tool the company already approved, such as ChatGPT or Claude, and tested on a task the team repeats every week.',
      'An AI agent is a model that uses tools in a loop to finish a job, not a product label. For most office teams the first agent is a saved assistant with written instructions, approved reference files and a defined output.',
      'The data rules come before the build: which tools are approved, which information stays out, and where a person must sign off before an agent\'s output is used or sent.',
      'Practice runs on synthetic or redacted material. A workshop agent should draft and check work; it should not send email, change records or touch live systems.',
      'The session ends with a decision for each agent: keep, change or stop, and who owns it.',
    ],
    sections: `
<h2>What teams mean when they ask for an agent workshop</h2>
<p>The request is usually concrete. A manager has a list of jobs the team wants an AI agent to take on, such as preparing meeting briefs, sorting incoming questions or tracking where assets are, and wants a session where people build the first one instead of hearing about agents in the abstract. That is the useful version of a hands-on AI agent workshop for teams: the team leaves with an agent that runs on its own work.</p>
<p>We have seen what makes this work in community rooms first. At the <a href="/events/dallas-ai-hackathon-2026-04-18/">Dallas AI hackathon on April 18, 2026</a>, 37 builders worked in teams for one three-hour afternoon and presented what they had built to the room. At the <a href="/events/openclaw-ai-agents-meetup-2026-05-17/">May 17 agents meetup</a>, the session walked through what an agent is and how several agents with clear roles can split up a complex task. The company workshop keeps the same rule: build something real in the session, then show it.</p>

<h2>Agent, workflow, chat: the difference that matters</h2>
<p>Most confusion in these sessions comes from the word "agent". In the definition Jack uses in his <a href="https://realagentusecases.com/en/agent-101/">Agent 101 notes</a>, an agent is a model that uses tools in a loop to finish a job. It is not a product label. Three levels are worth separating:</p>
<ul>
<li><strong>Chat:</strong> one person types a request and reads one answer. Nothing is saved, so next week starts from zero.</li>
<li><strong>Workflow:</strong> a written set of steps with a defined input and output, which anyone on the team can rerun and check.</li>
<li><strong>Agent:</strong> a workflow saved inside the tool, with its own instructions, approved reference files and, where the tool allows, tools such as search or file reading. In ChatGPT this is usually a custom GPT or a project; in Claude, a Project.</li>
</ul>
<p>For a non-technical team the first agent should be the third level, built on top of the second. If the team cannot write the workflow down, the agent will not behave the same way twice.</p>

<h2>How the session runs</h2>
<p>Our <a href="/ai-training/team-workshop/">90-minute AI workshop for teams</a> follows the same order whether the goal is a workflow or a first agent:</p>
<ol>
<li><strong>Data rules first.</strong> Agree which AI tools are approved, which information stays out, and where a person must sign off before an output is used. An agent makes this more important, not less, because it runs the same instructions every time.</li>
<li><strong>Choose the job.</strong> Each person lists the tasks they repeat every week and scores them: frequent enough to matter, clear input and output, quick to check, and safe to practise without sensitive data. The strongest one becomes the agent's job.</li>
<li><strong>Write the instructions as a spec.</strong> A prompt is a spec, not a spell. The agent gets its role, the input it will receive, the format it must return, what it must never do, and an acceptance test a person can apply in under a minute.</li>
<li><strong>Build it in the approved tool.</strong> Save the instructions and the approved reference files in the tool the company already uses, then run the agent on synthetic or redacted sample material.</li>
<li><strong>Break it on purpose.</strong> At least one test case is deliberately flawed: a missing field, a contradiction, a request outside the agent's job. Watching how the agent handles it shows the team what to review before anything goes out.</li>
<li><strong>Decide what happens next.</strong> Keep, change or stop the agent, name who owns it, and agree how it will be checked two weeks later.</li>
</ol>
<p>If the team arrives with a longer list of agents it wants, the list is handled the same way: score the list, build the one or two strongest in the room, and leave the rest as written specs to build after the session.</p>

<h2>Data safety for team agents</h2>
<p>An agent built in a workshop drafts, sorts and checks. It should not send email, update customer records or connect to live business systems during training. Those actions need a person's approval and, often, an IT decision about integrations. Our workshops are AI training, not a CRM, ERP or automation build, so the agent works on the parts around those systems: preparing notes, summarising updates, checking exports.</p>
<p>Three answers should be written down before the agent is shared with the team: which tool it lives in, which information it may never receive, and who signs off on its output. The free <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> is a starting point.</p>

<h2>When this does not work</h2>
<p>It does not work without an approved tool. If people can only build agents in personal accounts, the session teaches them to keep company work there. Approve one tool first; the <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> is built for that decision.</p>
<p>It does not work when the job is vague. "An agent that handles our marketing" cannot be tested. "An agent that turns our approved event notes into a five-point recap in our format" can.</p>
<p>And it is the wrong session if what you need is software. If the agent has to read and write records in your systems on its own, that is an implementation project with IT, not a training workshop.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>List the jobs your team would hand to an agent, and score each one on frequency, clear input and output, how fast it can be checked, and whether it can be practised without sensitive data.</li>
<li>Write down the three answers: approved tool, off-limits information, and who signs off.</li>
<li>Pick the one job with the highest score and gather two or three redacted examples of its input and a good output.</li>
</ul>
<p>If you want your team to build its first agent together, see how the <a href="/ai-training/team-workshop/">90-minute team workshop</a> runs, or <a href="/book/">book a 20-minute workflow call</a> to talk through your list.</p>
`,
    faq: [
      ['What is a hands-on AI agent workshop for teams?', 'A live session where a team builds and tests its first AI agent on its own work. It starts with data rules, picks one repeated task, writes the agent\'s instructions as a spec, builds it in the company\'s approved AI tool, tests it on synthetic or redacted material, and ends with a keep, change or stop decision.'],
      ['Do we need developers to build an AI agent?', 'No. For most office teams the first agent is a saved assistant inside a tool the company already uses, such as a custom GPT in ChatGPT or a Project in Claude, with written instructions and approved reference files. No coding is required.'],
      ['What is the difference between an AI agent and an AI workflow?', 'A workflow is a written set of steps with a defined input and output that anyone can rerun. An agent is a model that uses tools in a loop to finish a job; in practice, a workflow saved inside the AI tool with its own instructions and files. A team that cannot write the workflow down will get an agent that behaves differently each time.'],
      ['Is it safe to use company data in an agent workshop?', 'Practice should use synthetic or redacted material, and only the AI tools the company has approved. No customer personal data, passwords or confidential documents should go into a tool during the workshop, and the agent should not send messages or change records without a person signing off.'],
      ['How long is the workshop and how is it priced?', trainingFormatSummary('en')],
    ],
    pillar: ['90-minute AI workshop for teams', '/ai-training/team-workshop/'],
    related: [['90-minute AI workshop for teams', '/ai-training/team-workshop/'], ['Claude training for business teams', '/ai-training/claude/'], ['ChatGPT training for business teams', '/ai-training/chatgpt/'], ['AI data boundaries one-pager', '/templates/ai-data-boundaries-one-pager/']],
    sources: [
      ['Jack Qian, Agent 101, Episode 01: what an AI agent is (realagentusecases.com)', 'https://realagentusecases.com/en/agent-101/'],
    ],
  },
  zh: {
    keyword: '团队 AI agent 实操工作坊',
    title: '团队 AI Agent 实操工作坊：现场怎么做 | AI Man Jack',
    description: '团队 AI agent 实操工作坊，应该当场用公司已批准的 ChatGPT 或 Claude 做出一个能用的 agent，在真实任务上测过，并定好数据规则和签字人。',
    h1: '团队 AI agent 实操工作坊，现场到底做什么',
    sub: '想办 agent 工作坊的团队，多半希望散场时手里有个能跑的东西，而不是听一场关于未来的演讲。下面一步步讲清这堂课该包含什么，以及容易在哪里出问题。',
    takeaways: [
      '团队 AI agent 实操工作坊结束时，每个团队都应拥有一个能用的 agent：建在公司已批准的 AI 工具里（例如 ChatGPT 或 Claude），并在团队每周重复的任务上测试过。',
      'AI agent 是会调用工具、循环执行来完成一项工作的模型，不是产品标签。对多数办公室团队来说，第一个 agent 就是一个保存好的助手：有书面指令、经批准的参考资料和明确的输出格式。',
      '数据规则先于搭建：哪些工具已获批准、哪些信息不能输入、agent 的输出在使用或发出前由谁签字。',
      '练习使用模拟或脱敏材料。工作坊里做的 agent 负责起草和核对，不发邮件、不改记录、不接入在用的业务系统。',
      '课程以每个 agent 的决定收尾：保留、调整还是停止，以及由谁负责。',
    ],
    sections: `
<h2>团队说要办 agent 工作坊时，想要的是什么</h2>
<p>这类需求通常很具体。管理者手里有一张清单，列着团队希望交给 AI agent 的活，比如准备会议简报、分拣进来的问题、追踪资产在哪里；他想要的是一堂让大家亲手做出第一个 agent 的课，而不是抽象地听 agent 有多厉害。团队 AI agent 实操工作坊有用的样子就是这样：散场时，团队带走一个在自己工作上能跑的 agent。</p>
<p>这套做法先在社区活动里验证过。<a href="/zh/events/dallas-ai-hackathon-2026-04-18/">2026 年 4 月 18 日的达拉斯 AI 黑客松</a>上，37 位参与者分组，在一个约三小时的下午里动手做项目，最后向全场演示。<a href="/zh/events/openclaw-ai-agents-meetup-2026-05-17/">5 月 17 日的 agent 主题聚会</a>上，我们讲了 agent 到底是什么，以及多个角色清楚的 agent 怎样分工完成一项复杂任务。企业工作坊沿用同一条规矩：课上做出真东西，再拿出来给大家看。</p>

<h2>Agent、工作流、聊天：真正要分清的区别</h2>
<p>这类课上的困惑，多半来自“agent”这个词。Jack 在 <a href="https://realagentusecases.com/agent-101/">Agent 101 笔记</a>里的定义是：agent 是会调用工具、循环执行来完成一项工作的模型，不是一个产品标签。值得分清三个层次：</p>
<ul>
<li><strong>聊天：</strong>一个人打一句请求，看一个回答。什么都没保存，下周又从零开始。</li>
<li><strong>工作流：</strong>一套写下来的步骤，输入和输出都明确，团队里谁都能重跑、能核对。</li>
<li><strong>Agent：</strong>保存在工具里的工作流，带着自己的指令、经批准的参考资料，以及工具允许时可调用的能力，比如搜索或读文件。在 ChatGPT 里通常是自定义 GPT 或项目，在 Claude 里是 Project。</li>
</ul>
<p>对非技术团队来说，第一个 agent 应该是第三层，但要建在第二层之上。如果团队连工作流都写不下来，agent 每次的表现也不会一样。</p>

<h2>课程怎么进行</h2>
<p>我们的 <a href="/zh/ai-training/team-workshop/">90 分钟团队 AI 工作坊</a>，无论目标是一条工作流还是第一个 agent，都按同样的顺序走：</p>
<ol>
<li><strong>先定数据规则。</strong>确定哪些 AI 工具已获批准、哪些信息不能输入、哪些输出必须由人签字后才能使用。有了 agent，这一步更重要，因为它每次都会照同一套指令执行。</li>
<li><strong>挑选这份工作。</strong>每个人列出每周重复的任务，按四个标准打分：频率够不够高、输入输出是否清楚、能否快速核验、能否在不涉及敏感信息的情况下练习。得分最高的那项，就是 agent 的工作。</li>
<li><strong>把指令写成规格说明。</strong>提示词是规格说明，不是咒语。给 agent 写清它的角色、会收到什么输入、必须返回什么格式、绝不能做什么，以及一条一分钟内就能检查的验收标准。</li>
<li><strong>在已批准的工具里搭建。</strong>把指令和经批准的参考资料保存在公司已经在用的工具里，然后用模拟或脱敏的样例材料实际跑一遍。</li>
<li><strong>故意把它弄坏。</strong>至少准备一个刻意设置问题的测试用例：缺一个字段、前后矛盾、或者超出 agent 职责的请求。看 agent 怎么处理，团队就知道东西发出去之前该检查什么。</li>
<li><strong>决定下一步。</strong>这个 agent 是保留、调整还是停止，由谁负责，两周后怎么回查。</li>
</ol>
<p>如果团队带来一长串想做的 agent，处理方法一样：给清单打分，课上先做最强的一两个，其余的写成规格说明，课后再搭。</p>

<h2>团队 agent 的数据安全</h2>
<p>工作坊里做的 agent 负责起草、分拣和核对。培训期间，它不应该发邮件、更新客户记录或接入在用的业务系统。这些动作需要人来批准，往往还需要 IT 对系统对接做决定。我们的工作坊是 AI 培训，不是 CRM、ERP 或自动化开发，所以 agent 处理的是这些系统之外的那部分工作：整理记录、汇总更新、核对导出的数据。</p>
<p>agent 分享给全团队之前，先写下三个答案：它放在哪个工具里、哪些信息绝不能给它、它的输出由谁签字。免费的 <a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>可以作为起点。</p>

<h2>什么时候这套做法不灵</h2>
<p>没有已批准的工具，就不灵。如果大家只能在个人账号里搭 agent，这堂课等于教他们继续把公司的活放在个人账号里。先批准一款工具；<a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>就是为这个决定准备的。</p>
<p>工作说不清楚，也不灵。“一个帮我们做市场的 agent”没法测试；“一个把已批准的活动记录整理成我们格式的五点回顾的 agent”可以。</p>
<p>如果你真正需要的是软件，这也不是合适的课。agent 要自己在你的系统里读写记录，那是和 IT 一起做的实施项目，不是培训工作坊。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>列出团队想交给 agent 的活，每项按频率、输入输出是否清楚、核验快不快、能否不用敏感数据练习来打分。</li>
<li>写下三个答案：已批准的工具、不能输入的信息、由谁签字。</li>
<li>挑出得分最高的那项，准备两三份脱敏后的输入样例和一份合格的输出样例。</li>
</ul>
<p>如果想让团队一起做出第一个 agent，可以先看 <a href="/zh/ai-training/team-workshop/">90 分钟团队工作坊</a>怎么进行，或<a href="/zh/book/">预约 20 分钟工作流咨询</a>，聊聊你的清单。</p>
`,
    faq: [
      ['什么是团队 AI agent 实操工作坊？', '一次实时课程，团队在自己的工作上搭建并测试第一个 AI agent。先定数据规则，挑一项重复任务，把 agent 的指令写成规格说明，在公司已批准的 AI 工具里搭好，用模拟或脱敏材料测试，最后决定保留、调整还是停止。'],
      ['做 AI agent 需要开发人员吗？', '不需要。对多数办公室团队来说，第一个 agent 就是公司已在用的工具里保存好的助手，例如 ChatGPT 的自定义 GPT 或 Claude 的 Project，配上书面指令和经批准的参考资料，不用写代码。'],
      ['AI agent 和 AI 工作流有什么区别？', '工作流是一套写下来的步骤，输入输出明确，谁都能重跑。agent 是会调用工具、循环执行来完成一项工作的模型，落到实际，就是保存在 AI 工具里、带着自己指令和资料的工作流。工作流写不下来的团队，做出的 agent 每次表现都不一样。'],
      ['agent 工作坊里用公司数据安全吗？', '练习应使用模拟或脱敏材料，并且只用公司已批准的 AI 工具。工作坊期间，客户个人信息、密码和保密文件一律不输入任何工具；没有人签字，agent 也不应发出消息或修改记录。'],
      ['工作坊多长时间、怎么收费？', trainingFormatSummary('zh')],
    ],
    pillar: ['90 分钟团队 AI 工作坊', '/ai-training/team-workshop/'],
    related: [['90 分钟团队 AI 工作坊', '/ai-training/team-workshop/'], ['Claude 企业团队培训', '/ai-training/claude/'], ['ChatGPT 企业团队培训', '/ai-training/chatgpt/'], ['AI 数据边界一页纸', '/templates/ai-data-boundaries-one-pager/']],
    sources: [
      ['Jack Qian：Agent 101 第 01 期，AI Agent 基础（realagentusecases.com）', 'https://realagentusecases.com/agent-101/'],
    ],
  },
};
