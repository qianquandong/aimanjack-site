// Weekly SEO routine 2026-10-19 (Monday; no GSC credentials, so a post instead of an on-page change). Sister post to
// /ai-training/chatgpt/ (bucket: Workflow / ChatGPT / Claude / Copilot educational). The five-part work instruction, the
// "self-taught users write short prompts and accept the first answer" observation, the weekly-report workflow and the
// three data lists are taken from the live /ai-training/chatgpt/ page. OpenAI facts come only from OpenAI's own pages in
// sources[] (found via search on 2026-10-19; help.openai.com was not reachable from the routine's sandbox). Custom GPTs are
// deliberately not recommended: OpenAI announced their retirement in its 2026-09-11 release notes. No prices.
export const post = {
  slug: 'how-to-use-chatgpt-at-work',
  date: '2026-10-19',
  updated: undefined,
  status: 'published',
  en: {
    keyword: 'how to use ChatGPT at work',
    title: 'How to Use ChatGPT at Work: Work Instructions | AI Man Jack',
    description: 'How to use ChatGPT at work: turn one weekly task into a five-part work instruction, keep it in a shared Project, and check every output before it is used.',
    h1: 'How to use ChatGPT at work: write a work instruction, not a prompt',
    sub: 'Most people who use ChatGPT at work taught themselves. The gap between a quick prompt and a repeatable work instruction is where most of the time savings and most of the mistakes are.',
    takeaways: [
      'To use ChatGPT at work reliably, write a work instruction with five parts: the task, the context, the source material, the output format and what to check.',
      'Pick a task you repeat every week and run the same instruction on it at least three times before calling it a workflow.',
      'Keep the instruction and the approved files in a ChatGPT Project so colleagues start from the same material; OpenAI describes Projects as holding files, instructions and chats together.',
      'Use a company workspace for company data: OpenAI states that it does not train on data from ChatGPT Business or Enterprise by default.',
      'A person checks every output against the source before it is sent, filed or put in a report. That step does not go away when the instruction gets better.',
    ],
    sections: `
<h2>What self-taught ChatGPT use looks like</h2>
<p>Our <a href="/ai-training/chatgpt/">ChatGPT training page</a> says it plainly: most self-taught users write short prompts and accept the first answer. That works for a one-off question. It does not work for the weekly report, the customer reply or the meeting summary, because next week the same person writes a slightly different short prompt and gets a slightly different answer, and nobody else on the team can repeat it.</p>
<p>Learning how to use ChatGPT at work is mostly learning to write down what you already know about the task, once, in a form ChatGPT can follow every time. We call that a work instruction. It is the first module of our ChatGPT sessions, and every person practises it on a task from their own week.</p>

<h2>The five parts of a work instruction</h2>
<p>The same five parts, every time:</p>
<ol>
<li><strong>Task.</strong> What the output is and who it is for. “Draft the weekly operations update for the leadership team” beats “summarize this”.</li>
<li><strong>Context.</strong> What the reader already knows, what they care about, and what has gone wrong before. One or two sentences.</li>
<li><strong>Source.</strong> The material ChatGPT must work from, and an instruction to use only that material. An export, a policy document, last week’s approved version.</li>
<li><strong>Format.</strong> Headings, length, order, tone. Paste an approved past example if you have one; it does more than a paragraph of adjectives.</li>
<li><strong>Check.</strong> What ChatGPT should flag instead of guessing, and what the person will verify before the output is used.</li>
</ol>
<p>Here is what that looks like for one of the workflows on our ChatGPT page, the operations team’s weekly report from a spreadsheet export:</p>
<blockquote><p><strong>Task:</strong> Write this week’s operations update for the leadership team, under 250 words.<br><strong>Context:</strong> Leadership reads it on Monday morning and wants changes against last week, not totals they already know.<br><strong>Source:</strong> Use only the attached export and last week’s update. Do not add numbers that are not in the export.<br><strong>Format:</strong> Three headings: What changed, What is at risk, What we need decided. Same order every week.<br><strong>Check:</strong> List every number you used with the cell or row it came from. If a figure looks wrong or is missing, say so instead of filling it in.</p></blockquote>
<p>The last line matters most. It turns “is this right?” into a list the person can tick off against the spreadsheet in a few minutes.</p>

<h2>How to turn one task into a team workflow</h2>
<ol>
<li><strong>Pick one task you repeat every week.</strong> Not the hardest part of the job, the most repetitive. If you are unsure which, the <a href="/blog/ai-training-for-employees-start-with-one-task/">start-with-one-task method</a> scores candidates on four questions.</li>
<li><strong>Write the five parts in a plain document first.</strong> If you cannot fill in the source and check lines, the task is not ready for ChatGPT yet.</li>
<li><strong>Run it three times on real work.</strong> Each time, note what you had to fix by hand. Most fixes belong in the context or format line, not in a longer prompt.</li>
<li><strong>Put it in a shared Project.</strong> OpenAI’s <a href="https://help.openai.com/en/articles/10169521-projects-in-chatgpt" target="_blank" rel="noopener">Projects in ChatGPT</a> article describes a project as a place for files, instructions and related chats, and shared projects let colleagues work from the same files and instructions. A new hire then starts from the approved version, not from a blank chat.</li>
<li><strong>Write down who checks.</strong> One name per workflow. The <a href="/templates/ai-workflow-one-pager/">AI workflow one-pager</a> has a line for it, next to the input, the output and the review step.</li>
<li><strong>Review after two weeks.</strong> Was it used on real work, was the output good enough, and what still needed fixing? The <a href="/templates/two-week-workflow-review/">two-week workflow review</a> is that conversation on one page.</li>
</ol>

<h2>Which data goes in</h2>
<p>Agree three lists before anyone pastes company material: never goes in (passwords, ID numbers, health data, anything a contract forbids), check first, and fine to use. Our <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> is a template for those lists.</p>
<p>Then use a company workspace for company work. OpenAI’s <a href="https://openai.com/business-data/" target="_blank" rel="noopener">business data page</a> states that it does not train its models on data from ChatGPT Business, Enterprise and its other business products by default. A personal account is governed by that person’s own settings, which is one reason the <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> starts by choosing one approved plan. Terms change, so read your plan’s current pages on the day you decide.</p>
<p>One more thing to know if your team built custom GPTs: OpenAI’s <a href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes" target="_blank" rel="noopener">ChatGPT release notes</a> announced plans to retire custom GPTs and offer a migration path. The dates reported differ by workspace, so check the notice in your own workspace. A work instruction written as plain text in a document moves to whatever replaces them without rework.</p>

<h2>When this does not work</h2>
<p>It does not work on tasks that never repeat. A one-off strategy question does not need a work instruction, and writing one is wasted effort.</p>
<p>It does not work when the source is the problem. If the export is wrong or last week’s approved version does not exist, ChatGPT will produce a tidy summary of bad material. Fix the input first.</p>
<p>And it does not work without the check. A work instruction makes the output more consistent; it does not make it correct. If nobody on the team can tell a right answer from a wrong one for this task, pick a different task. Where the job is really connecting several systems, our <a href="/resources/chatgpt-vs-ai-agents/">ChatGPT vs AI agents</a> guide covers when an agent is worth the extra risk.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>Pick one weekly task and write its five-part instruction in a document. Twenty minutes.</li>
<li>Run it on real work three times and note every manual fix.</li>
<li>Move the instruction and its approved files into a shared Project on a company account, and name the person who checks the output.</li>
</ul>
`,
    faq: [
      ['How do I use ChatGPT at work without making mistakes?', 'Write a work instruction with five parts (task, context, source, format, check), tell ChatGPT to use only the material you give it and to flag anything missing, and have a person verify every output against the source before it is used. The instruction reduces mistakes; the check catches the ones that remain.'],
      ['What is the difference between a prompt and a work instruction?', 'A prompt is usually one line written fresh each time. A work instruction is written once for a repeated task and states the reader, the source material, the format and what to check, so anyone on the team can run it and get comparable output.'],
      ['Is it safe to use ChatGPT for work?', 'For some data, on the right plan. Agree what never goes in, what needs checking first and what is fine, and use a company workspace. OpenAI states it does not train on ChatGPT Business or Enterprise data by default; check your plan’s current terms before deciding.'],
      ['Should our team use ChatGPT Projects or custom GPTs?', 'For a shared, repeated task, a Project holds the instructions, files and chats in one place. OpenAI has announced plans to retire custom GPTs, so check the notice in your workspace before building new ones, and keep each instruction in a plain document as well.'],
      ['Do you teach ChatGPT at work in Dallas?', 'Yes. Sessions run onsite across Dallas–Fort Worth or live online anywhere in the U.S., in English or Chinese, and each person builds a workflow on a task from their own week. Each team gets a written quote.'],
    ],
    pillar: ['ChatGPT training for employees', '/ai-training/chatgpt/'],
    related: [['ChatGPT training for employees', '/ai-training/chatgpt/'], ['Start AI training with one task', '/blog/ai-training-for-employees-start-with-one-task/'], ['AI workflow one-pager', '/templates/ai-workflow-one-pager/'], ['ChatGPT vs AI agents', '/resources/chatgpt-vs-ai-agents/']],
    sources: [
      ['OpenAI Help Center: Projects in ChatGPT', 'https://help.openai.com/en/articles/10169521-projects-in-chatgpt'],
      ['OpenAI: Business data privacy, security, and compliance', 'https://openai.com/business-data/'],
      ['OpenAI Help Center: ChatGPT release notes', 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes'],
    ],
  },
  zh: {
    keyword: '工作中怎么用 ChatGPT',
    title: '工作中怎么用 ChatGPT：写工作指令 | AI Man Jack',
    description: '工作中怎么用 ChatGPT：把一项每周任务写成五部分的工作指令，放进共享 Project，每次输出都先核对再使用。',
    h1: '工作中怎么用 ChatGPT：写一份工作指令，别只写一句提示词',
    sub: '工作中用 ChatGPT 的人，大多是自学的。随手一句提示词和一份能重复使用的工作指令之间，差的正是大部分省下的时间和大部分出的错。',
    takeaways: [
      '想在工作中稳定地用好 ChatGPT，就写一份五部分的工作指令：任务、背景、资料、格式、核验。',
      '选一项每周都要做的任务，同一份指令至少跑三次，再把它当成工作流。',
      '把指令和批准过的文件放进 ChatGPT 的 Project，同事从同一套资料出发；OpenAI 说明 Project 可以把文件、指令和对话放在一起。',
      '公司数据用公司工作区：OpenAI 声明默认不用 ChatGPT Business 和 Enterprise 的数据训练模型。',
      '每次输出在发送、归档或写进报告之前，都由一个人对照原始资料核对。指令写得再好，这一步也省不掉。',
    ],
    sections: `
<h2>自学用 ChatGPT 通常是什么样子</h2>
<p>我们的 <a href="/zh/ai-training/chatgpt/">ChatGPT 员工培训</a>页面上写得很直接：自学的用户大多写短提示、接受第一个答案。问一次性的问题，这样没问题。可一到每周报告、客户回复、会议纪要，就不灵了：下周同一个人换个说法再写一句，得到的答案也跟着变，团队里别人也没法照做。</p>
<p>工作中怎么用 ChatGPT，说到底是把你对这项任务已经知道的东西写下来，写一次，写成 ChatGPT 每次都能照做的样子。我们把它叫作工作指令。这是我们 ChatGPT 课程的第一个模块，每个人都拿自己这周的一项任务来练。</p>

<h2>工作指令的五个部分</h2>
<p>每次都是同样五个部分：</p>
<ol>
<li><strong>任务。</strong>要产出什么、给谁看。“给管理层起草本周运营简报”比“总结一下”好用得多。</li>
<li><strong>背景。</strong>读者已经知道什么、关心什么、以前出过什么问题。一两句话就够。</li>
<li><strong>资料。</strong>ChatGPT 必须依据的材料，并明确要求只用这些材料。一份导出表、一份制度文件、上周批准过的版本。</li>
<li><strong>格式。</strong>标题、长度、顺序、语气。有批准过的旧样例就贴进去，比一段形容词管用。</li>
<li><strong>核验。</strong>哪些地方 ChatGPT 应该标出来而不是自己猜，以及使用之前由人核对哪些内容。</li>
</ol>
<p>拿我们 ChatGPT 培训页上的一条工作流举例：运营团队用导出的表格写每周报告。工作指令可以这样写：</p>
<blockquote><p><strong>任务：</strong>给管理层写本周运营简报，250 词以内。<br><strong>背景：</strong>管理层周一早上看，想知道和上周相比哪里变了，已经知道的总数不用重复。<br><strong>资料：</strong>只用附件里的导出表和上周的简报。导出表里没有的数字不要加。<br><strong>格式：</strong>三个小标题：有什么变化、有什么风险、需要拍板什么。每周顺序一样。<br><strong>核验：</strong>列出你用到的每个数字，以及它来自哪一行或哪个单元格。某个数字看起来不对或缺失，就直接说出来，不要自己补。</p></blockquote>
<p>最后一行最重要。它把“这个对不对？”变成一张清单，几分钟就能对照表格逐项勾完。</p>

<h2>怎么把一项任务变成团队工作流</h2>
<ol>
<li><strong>选一项每周都要做的任务。</strong>别选最难的，选最重复的。拿不准的话，用<a href="/zh/blog/ai-training-for-employees-start-with-one-task/">从一项任务开始</a>那篇里的四个问题给候选任务打分。</li>
<li><strong>先在普通文档里写好五个部分。</strong>如果资料和核验两行填不出来，这项任务还没准备好交给 ChatGPT。</li>
<li><strong>拿真实工作跑三次。</strong>每次记下需要手动修改的地方。大部分修改应该补进背景或格式那一行，用不着把提示词越写越长。</li>
<li><strong>放进共享 Project。</strong>OpenAI 的 <a href="https://help.openai.com/en/articles/10169521-projects-in-chatgpt" target="_blank" rel="noopener">Projects in ChatGPT</a> 说明里，Project 是放文件、指令和相关对话的地方，共享之后同事可以用同一套文件和指令工作。新员工从批准过的版本开始，不用从空白对话开始。</li>
<li><strong>写清由谁核对。</strong>每条工作流写一个名字。<a href="/zh/templates/ai-workflow-one-pager/">AI 工作流一页纸</a>上有专门一行，和输入、输出、复核步骤写在一起。</li>
<li><strong>两周后复盘。</strong>用在真实工作上了吗？结果够不够用？还有哪些要手动修？<a href="/zh/templates/two-week-workflow-review/">两周工作流复盘</a>把这次讨论放在一页纸上。</li>
</ol>

<h2>哪些数据可以放进去</h2>
<p>在任何人粘贴公司资料之前，先定三张清单：绝不输入（密码、证件号、健康信息、合同禁止的内容）、先确认、可以使用。我们的 <a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>就是这三张清单的模板。</p>
<p>然后，公司的工作用公司工作区。OpenAI 的<a href="https://openai.com/business-data/" target="_blank" rel="noopener">企业数据说明</a>写明，默认不会用 ChatGPT Business、Enterprise 等企业产品的数据训练模型。个人账号则取决于本人自己的设置，这也是 <a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>第一步就要选定一个批准方案的原因之一。条款会变，做决定那天请以你们方案的最新页面为准。</p>
<p>如果团队做过自定义 GPT，还有一件事要知道：OpenAI 在 <a href="https://help.openai.com/en/articles/6825453-chatgpt-release-notes" target="_blank" rel="noopener">ChatGPT 更新说明</a>里宣布计划停用自定义 GPT，并提供迁移路径。各处报道的日期因工作区而异，请以你们工作区里的通知为准。用纯文字写在文档里的工作指令，换到任何新功能里都不用重写。</p>

<h2>什么时候这套方法不灵</h2>
<p>不会重复的任务用不上。一次性的战略问题不需要工作指令，写了也是白费功夫。</p>
<p>资料本身有问题时也不灵。导出表是错的，或者根本没有上周批准过的版本，ChatGPT 只会把错的材料整理得很漂亮。先把输入修好。</p>
<p>没有核验这一步，也不灵。工作指令让输出更一致，并不让它更正确。如果团队里没人能分辨这项任务的答案对不对，就换一项任务。如果真正要做的是把几个系统连起来，可以看我们的 <a href="/zh/resources/chatgpt-vs-ai-agents/">ChatGPT 和 AI agent 怎么选</a>，里面讲了什么时候值得为 agent 多承担风险。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>选一项每周任务，在文档里写好五部分的工作指令。二十分钟。</li>
<li>拿真实工作跑三次，记下每一处手动修改。</li>
<li>把指令和批准过的文件放进公司账号下的共享 Project，并写明由谁核对输出。</li>
</ul>
`,
    faq: [
      ['工作中用 ChatGPT 怎么才能少出错？', '写一份五部分的工作指令（任务、背景、资料、格式、核验），要求 ChatGPT 只用你给的材料、缺什么就标出来，并且每次输出在使用前由人对照原始资料核对。指令减少错误，核验抓住剩下的错误。'],
      ['提示词和工作指令有什么区别？', '提示词通常是一句话，每次现写。工作指令针对一项重复任务只写一次，写清读者、资料、格式和核验内容，团队里谁来跑都能得到差不多的结果。'],
      ['工作中用 ChatGPT 安全吗？', '在合适的方案上，部分数据可以。先定好绝不输入、先确认、可以使用三张清单，并使用公司工作区。OpenAI 声明默认不用 ChatGPT Business 和 Enterprise 的数据训练模型；做决定前请核对你们方案的最新条款。'],
      ['团队该用 ChatGPT 的 Project 还是自定义 GPT？', '共享的重复任务，用 Project 可以把指令、文件和对话放在一处。OpenAI 已宣布计划停用自定义 GPT，新建之前先看你们工作区里的通知，每份指令也在普通文档里留一份。'],
      ['你们在达拉斯教工作中怎么用 ChatGPT 吗？', '教。可以到达拉斯—沃斯堡各地的公司现场上课，也可以全美线上直播，中英文都行，每个人用自己本周的一项任务做出一条工作流。每个团队单独书面报价。'],
    ],
    pillar: ['ChatGPT 员工培训', '/ai-training/chatgpt/'],
    related: [['ChatGPT 员工培训', '/ai-training/chatgpt/'], ['从一项任务开始做 AI 培训', '/blog/ai-training-for-employees-start-with-one-task/'], ['AI 工作流一页纸', '/templates/ai-workflow-one-pager/'], ['ChatGPT 和 AI agent 怎么选', '/resources/chatgpt-vs-ai-agents/']],
    sources: [
      ['OpenAI 帮助中心：Projects in ChatGPT', 'https://help.openai.com/en/articles/10169521-projects-in-chatgpt'],
      ['OpenAI：企业数据隐私、安全与合规', 'https://openai.com/business-data/'],
      ['OpenAI 帮助中心：ChatGPT 更新说明', 'https://help.openai.com/en/articles/6825453-chatgpt-release-notes'],
    ],
  },
};
