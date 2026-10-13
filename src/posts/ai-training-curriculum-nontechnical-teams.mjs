// Restored 2026-10-13 at its original URL (/resources/ai-training-curriculum-nontechnical-teams/): Bing AI Performance shows
// Copilot citing this URL (188 citations Aug–Oct 2026, the most-cited page on the site) while it 301'd to the /blog/ hub.
// Content is the July 2026 article, rewritten for the training positioning and the post format. No prices, no percentages.
export const post = {
  slug: 'ai-training-curriculum-nontechnical-teams',
  path: '/resources/ai-training-curriculum-nontechnical-teams/',   // keep the cited URL; the breadcrumb and index still live under /blog/
  date: '2026-07-17',
  updated: '2026-10-13',
  status: 'published',
  en: {
    keyword: 'AI training curriculum',
    title: 'AI Training Curriculum for Non-Technical Teams | AI Man Jack',
    description: 'An AI training curriculum for non-technical teams: pick one task, give context, build a workflow, verify outputs and set guardrails. Sample agenda included.',
    h1: 'A practical AI training curriculum for non-technical teams',
    sub: 'A useful curriculum does not begin with a tour of AI products. It begins with a task employees recognize, then teaches context, workflow design, verification and safe use, in that order.',
    takeaways: [
      'Teach non-technical teams in five parts: choose a suitable task, give the AI useful context, move from chat to a workflow, verify the output, and apply data and approval guardrails.',
      'Start from a task employees already do every week, not from a tour of AI products: "prepare a five-point brief from these approved notes" is teachable, "run my department" is not.',
      'Verification is part of the exercise: include one deliberately flawed output, because finding the error teaches more than another perfect demo.',
      'Measure the training two weeks later by whether the workflow was tested and kept, not by attendance or satisfaction scores.',
    ],
    sections: `
<h2>The curriculum principle: task first, tool second</h2>
<p>This AI training curriculum has five modules: identify a suitable task, give the AI useful context, compare chat with multi-step workflows, verify the outputs, and document one repeatable process. It ends with a small workplace exercise rather than a product quiz.</p>
<p>Non-technical employees usually arrive with one of two problems. Some feel overwhelmed by the number of AI products. Others have tried a chatbot, received an impressive answer, and still do not know how it fits their job. A product-centered class makes both problems worse.</p>
<p>Start with a task that is frequent, uses information, produces a clear output, and can be checked by a person. Drafting a routine response, summarizing a document, organizing meeting notes, or researching an account are better teaching examples than an open-ended request to "use AI". The short version of this idea is in <a href="/blog/ai-training-for-employees-start-with-one-task/">AI training for employees: start with one task</a>.</p>
<h2>Module 1: choose a suitable task</h2>
<p>Ask participants to list three tasks they repeat every week. Score each task against four questions:</p>
<ul>
<li>Does it happen often enough to matter?</li>
<li>Can the input and the desired output be described clearly?</li>
<li>Can a knowledgeable person check the result quickly?</li>
<li>Can it be tested without exposing sensitive information?</li>
</ul>
<p>The best first use case is usually narrow. "Prepare a five-point meeting brief from these approved notes" is teachable. "Run my department" is not.</p>
<h2>Module 2: give AI useful context</h2>
<p>Teach a prompt as a work instruction, not a secret formula. A reliable instruction contains:</p>
<ul>
<li><strong>Goal:</strong> what result is needed and why.</li>
<li><strong>Source:</strong> the approved information the tool should use.</li>
<li><strong>Constraints:</strong> tone, length, audience, exclusions or policy.</li>
<li><strong>Format:</strong> table, bullets, email, checklist, or another usable structure.</li>
<li><strong>Check:</strong> what the tool should flag and what a person must verify.</li>
</ul>
<p>Participants improve one weak instruction, run it, compare the result, and explain why the revision was better.</p>
<h2>Module 3: move from chat to workflow</h2>
<p>A chat produces an answer. A workflow describes how information moves through several steps. For example: collect approved meeting notes, extract decisions, identify owners, draft follow-up actions, and place the result in a review queue.</p>
<p>This is also where teams learn the difference between a chatbot and an agent. Use the <a href="/resources/chatgpt-vs-ai-agents/">ChatGPT vs AI agents comparison</a> to decide whether the task needs only a response or permission to take action.</p>
<h2>Module 4: verify the output</h2>
<p>Verification must be part of the exercise, not a warning on the final slide. Give participants a checklist:</p>
<ul>
<li>Can every factual claim be traced to the source?</li>
<li>Did the output follow the requested format?</li>
<li>What important context might be missing?</li>
<li>Could this answer harm a customer, an employee or a decision if it is wrong?</li>
<li>Who approves the result before it is used?</li>
</ul>
<p>Include at least one deliberately flawed output. Finding the error teaches more than watching another perfect demonstration.</p>
<h2>Module 5: apply data and approval guardrails</h2>
<p>Participants need a clear answer to three questions: which tools are approved, which information is prohibited, and where human approval is required. Use the <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> before anyone copies workplace information into a tool.</p>
<h2>A sample hands-on agenda</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">Section</th><th scope="col">Activity</th><th scope="col">Participant output</th></tr></thead><tbody>
<tr><th scope="row">Shared foundation</th><td>What AI can and cannot reliably do</td><td>One realistic expectation</td></tr>
<tr><th scope="row">Task selection</th><td>Score repeated work against four criteria</td><td>One suitable use case</td></tr>
<tr><th scope="row">Instruction design</th><td>Rewrite and test a weak prompt</td><td>A reusable instruction</td></tr>
<tr><th scope="row">Workflow mapping</th><td>Map input, AI step, review and destination</td><td>A simple workflow</td></tr>
<tr><th scope="row">Verification</th><td>Audit a flawed output</td><td>A quality checklist</td></tr>
<tr><th scope="row">Next step</th><td>Document owner, tool and first test</td><td>A small pilot plan</td></tr>
</tbody></table></div>
<p>This is the skeleton our <a href="/ai-training/">corporate AI training</a> is built on: each participant brings a task they already do and leaves with a workflow and a way to verify it.</p>
<h2>When this curriculum does not work</h2>
<p>It does not work as a one-hour lecture. The modules depend on participants bringing a real task and running it during the session; without hands-on time, people leave with opinions instead of a workflow. It also does not work when the company has no answer to Module 5. If nobody can say which tools are approved and which data is off limits, the first thing participants do after training is paste something they should not have.</p>
<p>And it is the wrong fit for a team that wants to build software. This curriculum is for people who use AI inside their existing job, not for developers.</p>
<h2>How to measure whether the training worked</h2>
<p>Do not measure success only by attendance or satisfaction. Microsoft's <a href="https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part" rel="noopener">2024 Work Trend Index</a> found employees bringing their own AI tools to work ahead of any company plan, which is exactly the gap a measured pilot closes. Two weeks later, ask whether participants tested the workflow, whether the result was accurate enough to use, where review took too long, and whether the task should be continued, changed or stopped.</p>
<p>A small, documented workflow that survives real use is a better outcome than a room full of people who enjoyed the demonstration.</p>
<h2>What to do in the next 14 days</h2>
<ul>
<li>Ask each team member for the three tasks they repeat every week. Pick one per person.</li>
<li>Write the company's answer to Module 5 on one page, even if it is a draft.</li>
<li>Run Modules 1 and 2 as a 45-minute internal session before booking any outside training.</li>
</ul>
`,
    faq: [
      ['How long should AI training for non-technical employees be?', 'Long enough to run a real task, not just watch one. A single session can cover Modules 1 and 2 if everyone brings a task; the full curriculum takes several sessions with practice in between, because Modules 3 to 5 depend on what people learned from their first attempts.'],
      ['What should an AI training curriculum for employees include?', 'Five things, in order: how to pick a suitable task, how to give the AI useful context, how to move from a single chat to a repeatable workflow, how to verify the output, and which data and approval rules apply. End with a workplace exercise, not a product quiz.'],
      ['Do non-technical teams need to learn prompt engineering?', 'They need to learn to write a clear work instruction: goal, source, constraints, format and what to check. That is prompt writing without the mystique. Tricks that only work in one tool are not worth class time.'],
      ['How do you measure whether AI training worked?', 'Two weeks after the session, ask whether the workflow was tested, whether the output was accurate enough to use, where review took too long, and whether the task should continue, change or stop. Attendance and satisfaction scores do not answer any of that.'],
    ],
    pillar: ['Corporate AI training', '/ai-training/'],
    related: [['ChatGPT vs AI agents for business work', '/resources/chatgpt-vs-ai-agents/'], ['AI data boundaries one-pager', '/templates/ai-data-boundaries-one-pager/'], ['Team workshop format', '/ai-training/team-workshop/'], ['AI use cases by team', '/use-cases/']],
    sources: [['Microsoft Work Trend Index 2024: AI at work is here', 'https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part']],
  },
  zh: {
    keyword: 'AI 培训课程',
    title: '给非技术团队的 AI 培训课程设计 | AI Man Jack',
    description: '一套给非技术团队的 AI 培训课程：先选任务，再给背景，从 chat 走到工作流，核对结果，最后加上数据和审批护栏。附一份实操议程和衡量成效的方法。',
    h1: '给非技术团队的一套实用 AI 培训课程',
    sub: '有用的课程不会从把 AI 产品挨个逛一遍开始。它从员工认得出的一个任务讲起，然后按这个顺序教：背景、工作流设计、核对、安全使用。',
    takeaways: [
      '用五个部分教非技术团队：找出一个合适的任务，给 AI 足够有用的背景，从 chat 走到工作流，核对结果，再加上数据和审批的护栏。',
      '从员工每周都在做的任务讲起，而非从 AI 产品的导览讲起：「根据这些批准过的笔记整理一份五点简报」能教，「帮我管整个部门」不能。',
      '核对是练习的一部分：至少放进一个故意做错的结果，找出这个错比再看一遍完美演示教得更多。',
      '两周之后，用「工作流有没有被试过、留下来」来衡量培训，而非出勤率或满意度。',
    ],
    sections: `
<h2>课程原则：先看任务，再看工具</h2>
<p>这套 AI 培训课程分五个模块：找出一个合适的任务，给 AI 足够有用的背景，把 chat 和多步骤工作流放在一起对比，核对结果，再把一套可复用的流程写成文档。结课时留一个小的、贴着实际工作的练习，而非一场产品知识测验。</p>
<p>非技术员工来的时候，通常带着两个问题之一。有的人被 AI 产品的数量压得喘不过气。还有的人试过 chatbot，拿到过一个挺唬人的答案，却还是不知道它跟自己的工作有啥关系。一堂以产品为中心的课，只会让这两个问题都更糟。</p>
<p>从这样一个任务讲起：它经常发生、要用到信息、能产出一个明确的结果、还能由人来检查。起草一封常规回复、给一份文档做摘要、整理会议笔记、或者调研一个客户，都比一句没边界的「用用 AI」更适合拿来教。这个想法的短版本在<a href="/zh/blog/ai-training-for-employees-start-with-one-task/">给员工做 AI 培训：从一项任务开始</a>。</p>
<h2>模块一：选一个合适的任务</h2>
<p>让学员列出三个自己每周都要重复做的任务。用四个问题给每个任务打分：</p>
<ul>
<li>它发生得够不够频繁，值不值得动手？</li>
<li>输入和想要的结果，能不能说清楚？</li>
<li>懂行的人能不能很快检查结果？</li>
<li>能不能在不泄露敏感信息的前提下试一试？</li>
</ul>
<p>最好的第一个用例，通常都很窄。「根据这些批准过的笔记，整理一份五点的会议简报」，这能教；「帮我管整个部门」，这不能。</p>
<h2>模块二：给 AI 足够有用的背景</h2>
<p>把 prompt 当成一份工作交办说明来教，而非什么秘诀。一份靠谱的交办说明，包含：</p>
<ul>
<li><strong>目标：</strong>要什么结果、为什么要。</li>
<li><strong>来源：</strong>工具该用的、被批准过的信息。</li>
<li><strong>约束：</strong>语气、篇幅、读者、要排除什么，或者相关规定。</li>
<li><strong>格式：</strong>表格、要点、邮件、清单，或者别的能直接用的结构。</li>
<li><strong>核对：</strong>工具该标出哪些地方，人又必须核实哪些地方。</li>
</ul>
<p>学员拿一条写得不好的交办说明改一改，跑一遍，对比结果，再说清楚改后为什么更好。</p>
<h2>模块三：从 chat 走到工作流</h2>
<p>chat 给出的是一个答案。工作流描述的是信息怎样流过好几个步骤。比如：收集批准过的会议笔记，抽取出决议，认出各项的负责人，起草跟进的动作，再把结果放进一个待审核的队列。</p>
<p>团队也正是在这里，学会 chatbot 和 agent 的区别。用<a href="/zh/resources/chatgpt-vs-ai-agents/">ChatGPT 和 AI agent 的对比</a>来判断：这个任务只需要一个回应，还是需要给出采取行动的权限。</p>
<h2>模块四：核对结果</h2>
<p>核对必须是练习的一部分，而非最后一张幻灯片上的一句提醒。给学员一份清单：</p>
<ul>
<li>每一处事实说法，能不能追回到来源？</li>
<li>结果有没有照着要求的格式来？</li>
<li>可能漏掉了哪些重要的背景？</li>
<li>如果这个答案是错的，会不会伤到某个客户、员工，或某个决定？</li>
<li>在结果被用之前，由谁来批准？</li>
</ul>
<p>至少放进一个故意做错的结果。找出这个错，比再看一遍完美的演示教得更多。</p>
<h2>模块五：加上数据和审批的护栏</h2>
<p>三个问题，学员得有清楚的答案：哪些工具是批准过的，哪些信息是禁止的，哪些地方必须有人来批准。在任何人把工作里的信息复制进某个工具之前，先用一遍<a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>。</p>
<h2>一份实操议程示例</h2>
<div class="table-wrap"><table><thead><tr><th scope="col">环节</th><th scope="col">活动</th><th scope="col">学员产出</th></tr></thead><tbody>
<tr><th scope="row">共同的基础</th><td>AI 能可靠做什么、不能做什么</td><td>一条切合实际的预期</td></tr>
<tr><th scope="row">选任务</th><td>用四条标准给重复性工作打分</td><td>一个合适的用例</td></tr>
<tr><th scope="row">设计交办说明</th><td>改写并测试一条写得不好的 prompt</td><td>一条能复用的交办说明</td></tr>
<tr><th scope="row">梳理工作流</th><td>画出输入、AI 环节、审核和去向</td><td>一条简单的工作流</td></tr>
<tr><th scope="row">核对</th><td>审查一个有问题的结果</td><td>一份质量清单</td></tr>
<tr><th scope="row">下一步</th><td>记下负责人、工具和第一次测试</td><td>一份小的试点计划</td></tr>
</tbody></table></div>
<p>这就是我们<a href="/zh/ai-training/">企业 AI 培训</a>的骨架：每位学员带一项自己本来就在做的任务来，带一条工作流和一套核验方法走。</p>
<h2>这套课程不适合的情况</h2>
<p>它不适合压成一小时的讲座。这几个模块都靠学员带着真实任务、在课上跑一遍；没有动手的时间，人带走的是观点，而非工作流。公司对模块五给不出答案时，它也不管用：如果没人能说清哪些工具是批准过的、哪些数据不能碰，学员培训完做的第一件事，就是把不该贴的东西贴进去。</p>
<p>它也不适合想自己做软件的团队。这套课程是给在现有岗位上用 AI 的人准备的，不是给开发者的。</p>
<h2>怎么衡量这次培训有没有效果</h2>
<p>别只拿出勤率或满意度来衡量成效。微软 <a href="https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part" rel="noopener">2024 年 Work Trend Index</a> 的发现是：员工在公司拿出任何计划之前，就已经自带 AI 工具上班了，而一次有衡量的试点，补的正是这个缺口。两周之后，去问：学员有没有真的去试那条工作流，结果准不准、够不够拿来用，审核在哪一步花的时间太长，以及这个任务该继续、该改，还是该停。</p>
<p>一条小小的、写成文档、又经得起实际使用的工作流，比一屋子看演示看得很开心的人，是更好的结果。</p>
<h2>接下来 14 天可以做的事</h2>
<ul>
<li>让每位同事列出自己每周重复做的三个任务，每人挑一个。</li>
<li>把公司对模块五的答案写成一页纸，草稿也行。</li>
<li>在预约任何外部培训之前，先在内部用 45 分钟把模块一和模块二跑一遍。</li>
</ul>
`,
    faq: [
      ['给非技术员工的 AI 培训要多长？', '长到能真的跑一遍任务，而非只看一遍演示。如果每个人都带着任务来，一节课能覆盖模块一和模块二；整套课程要分几次上，中间留练习时间，因为模块三到五要建立在第一次尝试的收获之上。'],
      ['员工 AI 培训课程应该包含什么？', '按顺序五件事：怎么选一个合适的任务，怎么给 AI 有用的背景，怎么从一次 chat 走到可复用的工作流，怎么核对结果，以及哪些数据和审批规则适用。结课留一个工作场景里的练习，而非产品知识测验。'],
      ['非技术团队需要学 prompt engineering 吗？', '他们需要学的是写一份清楚的工作交办说明：目标、来源、约束、格式、要核对什么。这就是去掉神秘感的 prompt 写法。只在某一个工具里管用的技巧，不值得占课堂时间。'],
      ['怎么衡量 AI 培训有没有用？', '课后两周去问：工作流有没有被试过，产出准不准、够不够拿来用，审核在哪一步花的时间太长，这个任务该继续、该改还是该停。出勤率和满意度回答不了这些。'],
    ],
    pillar: ['企业 AI 培训', '/ai-training/'],
    related: [['ChatGPT 和 AI agent 怎么选', '/resources/chatgpt-vs-ai-agents/'], ['AI 数据边界一页纸', '/templates/ai-data-boundaries-one-pager/'], ['团队工作坊形式', '/ai-training/team-workshop/'], ['各团队的 AI 应用场景', '/use-cases/']],
    sources: [['Microsoft Work Trend Index 2024：AI at work is here', 'https://www.microsoft.com/en-us/worklab/work-trend-index/ai-at-work-is-here-now-comes-the-hard-part']],
  },
};
