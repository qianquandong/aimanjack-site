import { trainingFormatTable, trainingFormatSummary } from '../training-buyers.mjs';
// seo-blog workflow (Agent OS workflows/seo-blog.md), backlog T5. Every fact below comes from the live pages
// aimanjack.com/ai-training/, /templates/team-ai-training-brief/, /tools/ai-readiness-assessment/ and
// knowledge/marketing/approved-claims.md. No first-person anecdotes: stories.md is still empty.
export const post = {
  slug: 'ai-training-for-office-managers',
  date: '2026-09-28',
  updated: '2026-10-13',
  status: 'published',
  en: {
    keyword: 'AI training for office managers',
    title: 'AI Training for Office Managers in Dallas | AI Man Jack',
    description: 'AI training for office managers, planned on one page: which tasks to bring, which of three formats fits, and how to tell in two weeks whether it worked.',
    h1: 'How to choose AI training for office managers in Dallas',
    sub: 'Start with the tasks your office repeats, the tools your company approves and the information that must stay private. Then compare the workshop, full-day onsite and four-session formats below.',
    takeaways: [
      'AI training for office managers works when the office manager brings the work the office already repeats every week, not a shortlist of tools to evaluate.',
      'Fill in a one-page brief before booking: who is in the room, what each role repeats weekly, which AI tools are approved, and which information must never go into them.',
      'If nobody can name the approved tools or the information that is off limits, settle that first. Training on a tool the company has not approved teaches the wrong habit.',
      trainingFormatSummary('en'),
      'Two weeks after the session, ask whether each workflow was tested on real work, whether the output was accurate enough to use, and whether the task should continue, change or stop.',
    ],
    sections: `
<h2>The one page that lands on the office manager</h2>
<p>Section three of the free <a href="/templates/team-ai-training-brief/">Team AI Training Brief</a> asks for one line per role: the work that person repeats every week. The template's instructions say the manager is the one who fills it in, not for them, and that section 3 is the part only they know. That is also why AI training for office managers is a different job from training any one department: the tasks come from every desk in the place.</p>
<p>That is also the person who gets handed the question. An owner or a partner reads something about AI over the weekend, turns to whoever runs the office, and asks them to look into it. So tools get researched, two or three demos get booked, and nothing about Monday changes.</p>

<h2>Why the office manager decides whether the training works</h2>
<p>Our <a href="/ai-training/">AI training</a> is built for business owners and teams where most people do not write code: admin, front office, operations, sales, planning, customer service, and the managers who lead them. The office manager sits across all of it. They know which report gets rebuilt from the same spreadsheet every Monday, which email gets answered the same way forty times a month, and which folder holds the current price list.</p>
<p>They also hold the piece nobody else tracks: which information is sensitive. That one fact decides whether a task can be practised safely in a room full of people or not.</p>
<p>The rest of this post is what to prepare, how to choose between the three formats, and what to ask two weeks later.</p>

<h2>How to plan AI training for office managers</h2>
<ol>
<li><strong>Write one line of repeating work per role.</strong> Not the hardest thing each person does — the most repetitive. Intake forms retyped into the system, the weekly report, appointment confirmations, vendor follow-ups, the same three paragraphs sent to every new client.</li>
<li><strong>Score each task on four questions.</strong> Does it happen often enough to matter? Can the input and the output be described clearly? Can a knowledgeable person check the result quickly? Can it be tested without exposing sensitive information? A task that fails any one of the four is not a first task.</li>
<li><strong>Settle tools and data boundaries before you book.</strong> Two lines: which AI tools the company has approved, and which information must not go into them. The <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> is there to get those two lines written. If either stays blank, fix that before a session, because a team trained on an unapproved tool learns a habit you will have to undo.</li>
<li><strong>Find out where the team actually is.</strong> The <a href="/tools/ai-readiness-assessment/">AI readiness assessment</a> is ten multiple-choice questions across eight areas: people, usage, processes, knowledge, tools, governance, leadership and measurement. It takes about three minutes, needs no sign-up, and scores in your browser. The weak rows tell you what a first session has to cover.</li>
<li><strong>Pick the format for what you need to happen afterwards.</strong> Not for what fits the calendar. The table below is the honest version of that choice.</li>
<li><strong>Name the person who signs off.</strong> For each workflow on your list, write down who checks the output before it goes to a client, a vendor or a report. If there is no name, the workflow is not ready to run, whatever the training covered.</li>
<li><strong>Put the two-week review in the calendar now.</strong> Book it the same day you book the session, while everyone still thinks it is a good idea. The <a href="/templates/two-week-workflow-review/">two-week workflow review</a> is the three questions to ask.</li>
</ol>

<h2>Which of the three formats fits your office</h2>
${trainingFormatTable('en')}
<p>All three run the same five parts: choose a suitable task, give the AI useful context, move from chat to workflow, verify the output, and set data and approval guardrails. The scope, time for practice and follow-up differ; agree these in the quote. The detail on each one is on the <a href="/ai-training/#team-paths">training page</a>, and the workflows each kind of team builds are listed under <a href="/ai-training/#teams">who it is for</a>.</p>

<h2>When AI training for office managers does not work</h2>
<p>It does not work when the office does not repeat anything. Some offices are genuinely one-off: every project has a different shape, every client is handled differently on purpose. Those teams score low on the frequency question for every candidate task, and a workshop turns back into a product discussion. First clarify the decision or task to practise before choosing a training format.</p>
<p>It does not work when the approved source does not exist. If the price list, the policy and the current procedure live in three peoples heads, there is nothing to point the AI at. That is a documentation problem, and no amount of training solves it. Write the source down first; it is usually a smaller job than it feels.</p>
<p>It also does not work when the office manager has no authority to change how work gets done. If every change needs a partner meeting, the session ends with good intentions and a calendar that looks the same. Get the decision-maker into the room, even for the last thirty minutes.</p>
<p>And if the real problem is that the phone rings while everyone is with a customer, training the team is the wrong fix. That is a staffing gap during working hours, and it needs a staffing answer. Training teaches people to use AI on work they already do; it does not add a person to the front desk.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>Fill in the team brief for your own office: roles in the room, one repeating task per role, approved tools, off-limits information. About twenty minutes.</li>
<li>Run the ten-question readiness assessment and write down your two weakest rows. Three minutes.</li>
<li>Take the highest-scoring task on your list and ask the person who does it today how they would check an AI draft of it. If they cannot answer in a sentence, pick the next task instead.</li>
</ul>
`,
    faq: [
      ['What should an office manager bring to AI training?', 'One line of repeating work per role in the office, the list of AI tools the company has approved, and the list of information that must not go into them. Everything in a session is built on top of those three lists, and the office manager is usually the only person who can produce all of them.'],
      ['Do office managers need any technical background for AI training?', 'No. The sessions are designed for teams where most people do not write code, including admin and front office roles. The instruction template is written in plain language and the verification checklist fits on one page.'],
      ['How long should AI training for an office team take?', trainingFormatSummary('en')],
      ['Can AI training be run at our office in Dallas?', 'Yes. Sessions run in person anywhere in the Dallas-Fort Worth metroplex, including Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney and Arlington, and remotely over video for teams outside DFW or split across offices. They run in English or Chinese.'],
      ['How do we know whether the AI training worked?', 'Two weeks after the session, check three things on each workflow: was it tested on real work, was the result accurate enough to use, and should the task continue, change or stop. Attendance and satisfaction scores do not tell you any of that.'],
    ],
    pillar: ['hands-on AI training for Dallas teams', '/ai-training/'],
    related: [['Corporate AI training: formats and what each covers', '/ai-training/'], ['Team AI Training Brief, free template', '/templates/team-ai-training-brief/'], ['AI Readiness Assessment, ten questions', '/tools/ai-readiness-assessment/'], ['AI for leaders and managers', '/use-cases/leadership/']],
    sources: [],
  },
  zh: {
    keyword: '行政主管 AI 培训',
    title: '行政主管 AI 培训：三种形式怎么选 | AI Man Jack',
    description: '老板让你去研究 AI，先别看工具。这篇讲行政主管安排 AI 培训前要填的一页纸、三种形式各适合谁，以及两周后怎么验收。',
    h1: '行政主管 AI 培训，先从办公室每周重复的活儿开始',
    sub: '先列出办公室重复的任务、公司批准的工具和不能输入的信息，再选择 90 分钟工作坊、全天上门培训或四次课程。下方对比内容、准备工作与报价方式。',
    takeaways: [
      '行政主管安排 AI 培训，带进教室的应该是办公室每周重复的活儿，不是一份工具比较表。',
      '订课之前先填一页纸：教室里都有谁、每个岗位每周重复什么、公司批准了哪些 AI 工具、哪些信息绝对不能往里放。',
      '如果说不清批了哪些工具、哪些信息不能碰，就先把这两行定下来。拿没批准的工具上课，练出来的是以后还得改回去的习惯。',
      trainingFormatSummary('zh'),
      '课后两周问三句：真拿实际工作跑过没有、结果准到能直接用吗、这件事继续做、改做法还是停掉。',
    ],
    sections: `
<h2>那页纸最后总是落到行政主管手上</h2>
<p>站上那份免费的<a href="/zh/templates/team-ai-training-brief/">团队 AI 培训需求表</a>，第三部分要求每个岗位写一行：这个人每周重复在做什么。模板说明写得很直白：要与管理者一起填写，而不是替对方填写，第 3 部分只有他们自己清楚。所以行政主管 AI 培训跟只给某一个部门上课不是一回事——任务来自办公室里每一张桌子。</p>
<p>这个问题往往也是直接落到这位手上的。老板周末刷到几条 AI 的消息，回来找管办公室的人，说你去研究研究。于是工具查了一圈，demo 约了两三场，周一的活儿还是照老样子干。</p>

<h2>为什么这件事成不成，看行政主管</h2>
<p>我们的 <a href="/zh/ai-training/">AI 培训</a>面向企业老板和大部分同事不写代码的团队：行政、前台、运营、销售、计划、客服，还有带他们的主管。行政主管横跨这些岗位。哪份周报每周一都要从同一张表重新做一遍、哪类邮件一个月要用同样的话回四十次、最新的价目表放在哪个文件夹，这些只有这个位置上的人全知道。</p>
<p>还有一件别人不太管的事也在这位手里：哪些信息是敏感的。这一条直接决定了某项任务能不能在一屋子人面前放心拿来练。</p>
<p>下面讲三件事：课前准备什么、三种形式怎么挑、两周后拿什么验收。</p>

<h2>行政主管怎么把这场培训安排明白</h2>
<ol>
<li><strong>每个岗位写一行重复的活儿。</strong>不写最难的那部分，写最重复的那部分：客户资料从表单再敲一遍进系统、每周那份报表、预约确认、催供应商、发给每个新客户的那三段话。</li>
<li><strong>用四个问题给每项任务打分。</strong>发生得够不够频繁？输入和输出说得清楚吗？懂行的人能不能很快看出对错？能不能在不碰敏感信息的前提下试一遍？四条里有一条过不去，它就不适合当第一项任务。</li>
<li><strong>工具和数据边界，订课之前就定好。</strong>就两行：公司批准了哪些 AI 工具，哪些信息不能往里放。<a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>就是用来把这两行写出来的。哪一行还空着，先补哪一行——拿没批准的工具上完课，团队练出来的习惯以后还得花力气改掉。</li>
<li><strong>先摸清团队现在到哪一步。</strong><a href="/zh/tools/ai-readiness-assessment/">AI 就绪度自测</a>一共十道选择题，覆盖人员、使用、流程、知识、工具、治理、领导力和衡量八个维度，三分钟左右，不用注册，分数在你自己的浏览器里算。哪两行分最低，第一堂课就该先讲哪两行。</li>
<li><strong>按你想要的结果挑形式。</strong>别按日程好不好排来挑。下面那张表是实话。</li>
<li><strong>写下签字的人是谁。</strong>清单上每条工作流，输出在发给客户、发给供应商或写进报表之前，由谁把关，把名字写下来。写不出名字，这条工作流就还不能上，课讲得再好也一样。</li>
<li><strong>两周后的复盘，现在就排进日历。</strong>订课那天一起订，趁大家还觉得这是件好事。<a href="/zh/templates/two-week-workflow-review/">两周工作流复盘表</a>上就是那三个问题。</li>
</ol>

<h2>三种形式，哪种适合你的办公室</h2>
${trainingFormatTable('zh')}
<p>三种形式走的是同一套五个环节：挑合适的任务、把上下文交代清楚、从聊天变成工作流、核对输出、定好数据和审批的规矩。各形式的实操时间与跟进范围不同，在报价中确认。每种形式具体讲什么，<a href="/zh/ai-training/#team-paths">培训页面</a>上有；各个岗位在课上会搭出什么工作流，见<a href="/zh/ai-training/#teams">适用团队</a>那一节。</p>

<h2>什么情况下这套不灵</h2>
<p>办公室本身没什么重复的活儿，这套就不灵。有的团队确实是这样：每个项目形态都不一样，每个客户都刻意区别对待。这种团队的候选任务在"频率"那一问上全是低分，工作坊最后又会变成讨论买哪个工具。对这类团队，先明确希望练习哪项任务或判断，再选择培训形式。</p>
<p>没有可靠的资料来源，这套也不灵。价目表、规定、现行流程分别装在三个人脑子里，AI 就没有地方可读。这是文档的问题，再多培训也补不上。先把来源写下来，这件事通常比想象中小。</p>
<p>行政主管没有权力改动干活的方式，同样不灵。什么都要等合伙人开会定，课上完只剩一腔热情，日历还是原样。想办法让拍板的人进教室，哪怕只来最后半小时。</p>
<p>还有一种情况：真正的麻烦是大家都在招呼客人的时候电话一直响。那就不是培训能解决的，那是上班时间人手不够，得从人手上想办法。培训教的是让同事把 AI 用在本来就在做的事情上，它不会给前台多添一个人。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>把团队需求表按自己办公室的情况填一遍：教室里有哪些岗位、每个岗位一项重复任务、批准的工具、不能碰的信息。二十分钟左右。</li>
<li>做一遍十道题的就绪度自测，把分最低的两行记下来。三分钟。</li>
<li>拿分数最高的那项任务，去问现在做这件事的同事：如果 AI 出了个初稿，你怎么判断它对不对。一句话答不上来，就先换下一项。</li>
</ul>
`,
    faq: [
      ['行政主管去安排 AI 培训，要先准备什么？', '办公室里每个岗位一行重复的活儿，公司已经批准的 AI 工具清单，以及不能输入这些工具的信息清单。课上所有内容都建在这三份清单上，而能把三份都拿出来的，通常只有管办公室的这位。'],
      ['行政、前台这些岗位需要懂技术才能上课吗？', '不需要。课程本来就是为大部分同事不写代码的团队设计的，行政和前台都在其中。指令模板用的是日常说法，核对清单只有一页纸。'],
      ['一场 AI 培训安排多长时间合适？', trainingFormatSummary('zh')],
      ['可以来我们达拉斯的办公室上课吗？', '可以。达拉斯—沃斯堡都会区内都能上门，包括 Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney 和 Arlington；在 DFW 以外，或者人分散在几个办公室的团队，可以远程上。中英文都行。'],
      ['怎么判断这次培训到底有没有用？', '课后两周，对每条工作流看三件事：有没有拿实际工作跑过、结果准不准到能直接用、这件事该继续、改做法还是停掉。出勤率和满意度打分回答不了这三个问题。'],
    ],
    pillar: ['面向达拉斯团队的实操 AI 培训', '/ai-training/'],
    related: [['企业 AI 培训：三种形式各讲什么', '/ai-training/'], ['团队 AI 培训需求表（免费模板）', '/templates/team-ai-training-brief/'], ['AI 就绪度自测（十道题）', '/tools/ai-readiness-assessment/'], ['给主管和负责人的 AI 用法', '/use-cases/leadership/']],
    sources: [],
  },
};
