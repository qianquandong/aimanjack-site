// Weekly SEO routine 2026-10-17. Sister post to /ai-training/copilot/ (bucket: Workflow / ChatGPT / Claude / Copilot educational).
// Microsoft facts come only from Microsoft's own pages listed in sources[] (checked 2026-10-17 via search; learn.microsoft.com was not
// directly fetchable from the routine's sandbox, so Jack should click each source once before publishing). The curriculum module,
// the IT checklist and the Excel/meeting workflows are taken from the live /ai-training/copilot/ page and /workflows/. No prices.
export const post = {
  slug: 'copilot-chat-vs-microsoft-365-copilot',
  date: '2026-10-17',
  updated: undefined,
  status: 'draft',
  en: {
    keyword: 'Copilot Chat vs Microsoft 365 Copilot',
    title: 'Copilot Chat vs Microsoft 365 Copilot for Teams | AI Man Jack',
    description: 'Copilot Chat vs Microsoft 365 Copilot: what the free work chat can do, what the license adds in Word, Excel, Outlook and Teams, and what to train on first.',
    h1: 'Copilot Chat vs Microsoft 365 Copilot: which one should your team learn first?',
    sub: 'Most companies on Microsoft 365 already have one of the two and are deciding whether to pay for the other. The training plan changes depending on which one each person actually has.',
    takeaways: [
      'Copilot Chat is the web-grounded work chat Microsoft includes with eligible Microsoft 365 plans; Microsoft 365 Copilot is the paid license that also grounds answers in your own email, files, meetings and chats.',
      'Without the license, Copilot Chat only sees company content a person gives it, for example a file they upload, according to Microsoft’s Copilot Chat FAQ.',
      'With the license, Microsoft states that Copilot only surfaces organizational data the user already has at least view permission to, so over-shared folders become visible faster.',
      'Train on Copilot Chat first if most people have no license yet: the prompt habits and the checking habits carry over unchanged when a license is added.',
      'Before buying licenses, have each team run one real task in Copilot Chat for two weeks; the tasks that kept needing work data are the ones a license is for.',
    ],
    sections: `
<h2>The question that comes up in the first ten minutes</h2>
<p>The first module of our <a href="/ai-training/copilot/">Microsoft Copilot training</a> is called “Copilot Chat vs. Copilot in the apps”, and it is there because the room is almost never on the same version. A few people have a Microsoft 365 Copilot license, most have Copilot Chat, and some have both open in different tabs without knowing which is which. The Copilot Chat vs Microsoft 365 Copilot question decides what each person can practise, so we answer it before anyone writes a prompt.</p>
<p>The names do not help. Both say Copilot, both show up in the browser and in the Microsoft 365 app, and both answer in a chat window. The difference is what each one can read.</p>

<h2>What each one can read</h2>
<p><strong>Copilot Chat</strong> is the work chat Microsoft includes for people who sign in with a work (Entra) account on an eligible Microsoft 365 plan. Microsoft describes it as grounded in the web. Its <a href="https://learn.microsoft.com/en-us/copilot/faq" target="_blank" rel="noopener">Copilot Chat FAQ</a> says that without a Microsoft 365 Copilot license it cannot reach shared company data, a person’s own mailbox and files, or data from Graph connectors. It works on what you give it: text you paste, a file you upload.</p>
<p><strong>Microsoft 365 Copilot</strong> is the paid license. Microsoft’s <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview" target="_blank" rel="noopener">Copilot overview</a> describes it as grounded in the web plus your work data through Microsoft Graph, and it is the version that appears inside Word, Excel, PowerPoint, Outlook and Teams on the licensed account. That is what lets it summarize a thread without anyone pasting it, or turn a Teams meeting into a recap.</p>
<p>The licensed version only reads what the person could already open. Microsoft’s <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy" target="_blank" rel="noopener">data, privacy and security page</a> says Copilot only surfaces organizational data to which individual users have at least view permissions. In practice that means a SharePoint site shared with “everyone” two years ago is now one question away, which is why the data part of our Copilot sessions starts with which sites and folders are in scope.</p>
<p>Agents are a third layer. The same FAQ says agents that reach SharePoint or Graph connector content are metered and switched off by default, while simple agents built only on instructions and public websites cannot see tenant data. Price and plan details change often, so we do not print them; check <a href="https://www.microsoft.com/en-us/microsoft-365-copilot/pricing" target="_blank" rel="noopener">Microsoft’s pricing page</a> for your plan.</p>

<h2>How to decide what your team trains on</h2>
<ol>
<li><strong>Find out who has what.</strong> Ask your IT lead four questions: who has a Microsoft 365 Copilot license, which apps have Copilot enabled, whether Teams meeting transcription is on, and whether agents are allowed. On our Copilot page that is the 15-minute call we ask for before a session.</li>
<li><strong>List one weekly task per person.</strong> The weekly status report, the meeting recap, the reply to the same customer question. Write next to each one whether the input is something the person can paste or upload, or something that lives across email, files and meetings.</li>
<li><strong>Run the paste-or-upload tasks in Copilot Chat.</strong> Drafting from a document someone uploads, rewriting for a different reader, pulling fields out of a PDF. None of these need the license, and the prompt habits (role, source, format, check) are the same ones the licensed version uses.</li>
<li><strong>Mark the tasks that kept needing work data.</strong> If the person had to open four emails and a spreadsheet and paste them in, that is a task the license would change. Meeting recaps are the obvious one; our <a href="/workflows/meeting-notes-to-action-items/">meeting notes to action items workflow</a> runs in either version, but only the licensed one reads the Teams transcript for you.</li>
<li><strong>Clean up sharing before licenses go live.</strong> Because the license reads everything a person can open, have IT review the sites shared with the whole company first. The <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> is the list of what never goes into a prompt in either version.</li>
<li><strong>Train Excel on real numbers, then check them.</strong> In the licensed version Copilot works on the open workbook; in Copilot Chat you upload an export with sensitive columns removed. Either way, each person checks totals against the source before the number goes into a report.</li>
<li><strong>Review after two weeks.</strong> For each task: was it used on real work, was the output good enough, and did it need data Copilot Chat could not reach? Count those last answers before deciding how many licenses to buy.</li>
</ol>

<h2>When this does not work</h2>
<p>It does not work if the company has not decided Copilot is the approved tool. If half the team uses ChatGPT on personal accounts and the other half uses Copilot Chat, the first job is picking one and writing down what may go into it; the <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> is for that. Training two tools at once to people who have not agreed on either teaches neither.</p>
<p>It also does not work when the files are the problem. If the current price list, policy and procedure are scattered across personal OneDrives, a license will find old versions as readily as new ones. That is a documentation job, and it comes before any Copilot training.</p>
<p>And a license is the wrong fix for a team whose work is mostly outside Microsoft 365. If the real work lives in a CRM, a line-of-business system or paper forms, Copilot in Outlook will not reach it. Our <a href="/resources/chatgpt-vs-ai-agents/">ChatGPT vs AI agents</a> guide covers when connecting other systems is worth the risk.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>Ask IT the four questions above and write the answers on one page. Fifteen minutes.</li>
<li>Have three people each run one weekly task in Copilot Chat, three times, and note every time they had to go and fetch something by hand.</li>
<li>Pull the list of SharePoint sites shared with everyone in the company. If it is long, schedule the cleanup before any license is assigned.</li>
</ul>
`,
    faq: [
      ['What is the difference between Copilot Chat and Microsoft 365 Copilot?', 'Copilot Chat is a web-grounded work chat included with eligible Microsoft 365 plans; it only sees company content you paste or upload. Microsoft 365 Copilot is a paid license that also reads the person’s own email, files, meetings and chats through Microsoft Graph and works inside Word, Excel, PowerPoint, Outlook and Teams.'],
      ['Is Copilot Chat free for businesses?', 'Microsoft describes Copilot Chat as available at no additional cost for people signed in with a work account on an eligible Microsoft 365 plan. Some agents inside it are metered. Check Microsoft’s pricing page for what applies to your plan.'],
      ['Should we train employees before buying Microsoft 365 Copilot licenses?', 'Yes, on Copilot Chat. The prompt and review habits are the same, and two weeks of real use shows which tasks keep needing email, files or meeting data, which is what the license adds.'],
      ['Can Microsoft 365 Copilot see files an employee should not see?', 'Microsoft states that Copilot only surfaces organizational data the user already has at least view permission to. If a file is over-shared, Copilot can surface it, so review company-wide sharing before assigning licenses.'],
      ['Do you run Copilot training in Dallas?', 'Yes. Sessions run onsite across Dallas–Fort Worth or live online anywhere in the U.S., in English or Chinese, on whichever Copilot version each person has. Each team gets a written quote.'],
    ],
    pillar: ['Microsoft Copilot training for teams', '/ai-training/copilot/'],
    related: [['Microsoft Copilot training for teams', '/ai-training/copilot/'], ['ChatGPT vs AI agents', '/resources/chatgpt-vs-ai-agents/'], ['Meeting notes to action items workflow', '/workflows/meeting-notes-to-action-items/'], ['AI tool approval checklist', '/templates/ai-tool-approval-checklist/']],
    sources: [
      ['Microsoft Learn: Frequently asked questions about Microsoft Copilot Chat', 'https://learn.microsoft.com/en-us/copilot/faq'],
      ['Microsoft Learn: What is Microsoft Copilot?', 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview'],
      ['Microsoft Learn: Data, privacy and security for Microsoft Copilot', 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy'],
      ['Microsoft: Copilot plans and pricing', 'https://www.microsoft.com/en-us/microsoft-365-copilot/pricing'],
    ],
  },
  zh: {
    keyword: 'Copilot Chat 和 Microsoft 365 Copilot',
    title: 'Copilot 免费版和付费版怎么选 | AI Man Jack',
    description: 'Copilot Chat 和 Microsoft 365 Copilot 的区别：免费工作版对话能做什么，许可证在 Word、Excel、Outlook 里多了什么，团队先学哪个。',
    h1: 'Copilot Chat 和 Microsoft 365 Copilot：团队应该先学哪一个？',
    sub: '用 Microsoft 365 的公司，大多已经有其中一个，正在考虑要不要为另一个付费。每个人手里到底是哪个版本，决定了培训怎么排。',
    takeaways: [
      'Copilot Chat 是微软随符合条件的 Microsoft 365 方案提供的、基于网页信息的工作版对话；Microsoft 365 Copilot 是付费许可证，还能基于你自己的邮件、文件、会议和聊天来回答。',
      '根据微软的 Copilot Chat 常见问题，没有许可证时，Copilot Chat 只能看到本人提供给它的公司内容，比如上传的文件。',
      '有许可证时，微软说明 Copilot 只会呈现用户本来至少有查看权限的组织数据，所以共享过度的文件夹会更快暴露出来。',
      '大多数人还没有许可证的话，先用 Copilot Chat 培训：写提示词和核验输出的习惯，加了许可证之后照样适用。',
      '买许可证之前，让每个团队用 Copilot Chat 跑两周真实任务；总要去别处找工作数据的那些任务，才是许可证真正有用的地方。',
    ],
    sections: `
<h2>开课十分钟内一定会被问到的问题</h2>
<p>Copilot Chat 和 Microsoft 365 Copilot 先学哪个，是我们 <a href="/zh/ai-training/copilot/">Microsoft Copilot 团队培训</a>开课就要回答的问题。第一个模块叫“Copilot Chat 与应用内 Copilot”，放在最前面，是因为教室里几乎从来不是同一个版本：少数人有 Microsoft 365 Copilot 许可证，多数人用的是 Copilot Chat，还有人两个都开在不同标签页里，分不清哪个是哪个。两者的区别决定了每个人能练什么，所以在写第一句提示词之前先讲清楚。</p>
<p>名字帮不上忙。两个都叫 Copilot，都出现在浏览器和 Microsoft 365 应用里，都是在对话框里回答。真正的区别在于各自能读到什么。</p>

<h2>两个版本各自能读到什么</h2>
<p><strong>Copilot Chat</strong> 是微软给使用工作账号（Entra）登录、且所在 Microsoft 365 方案符合条件的员工提供的工作版对话，微软称它基于网页信息回答。微软的 <a href="https://learn.microsoft.com/en-us/copilot/faq" target="_blank" rel="noopener">Copilot Chat 常见问题</a>写明：没有 Microsoft 365 Copilot 许可证时，它访问不到公司共享数据、个人的邮箱和文件，也访问不到 Graph 连接器的数据。它处理的是你给它的东西：粘贴的文字、上传的文件。</p>
<p><strong>Microsoft 365 Copilot</strong> 是付费许可证。微软的 <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview" target="_blank" rel="noopener">Copilot 概览</a>说它基于网页信息加上通过 Microsoft Graph 获取的工作数据来回答，而且在有许可证的账号上，它出现在 Word、Excel、PowerPoint、Outlook 和 Teams 里面。所以它能直接总结一串邮件，不用人先复制粘贴，也能把一场 Teams 会议整理成纪要。</p>
<p>有许可证的版本，也只能读到本人原本就能打开的内容。微软的<a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy" target="_blank" rel="noopener">数据、隐私与安全说明</a>写道：Copilot 只呈现用户至少有查看权限的组织数据。落到实际，就是两年前设成“所有人可见”的 SharePoint 站点，现在问一句就能翻出来。这也是我们的 Copilot 课在数据部分先讲“哪些站点和文件夹在范围内”的原因。</p>
<p>智能体是第三层。同一份常见问题说，能读取 SharePoint 或 Graph 连接器内容的智能体按用量计费，且默认关闭；只基于指令和公开网站搭建的简单智能体看不到公司内部数据。价格和方案细节变化很快，我们不在这里写数字，请到<a href="https://www.microsoft.com/en-us/microsoft-365-copilot/pricing" target="_blank" rel="noopener">微软的价格页面</a>查看你们的方案。</p>

<h2>怎么决定团队先学哪个</h2>
<ol>
<li><strong>先弄清谁有什么。</strong>问 IT 负责人四个问题：谁有 Microsoft 365 Copilot 许可证、哪些应用开了 Copilot、Teams 会议转录是否开启、是否允许使用智能体。我们的 Copilot 培训页上写的课前 15 分钟通话，就是问这四件事。</li>
<li><strong>每人列一项每周重复的任务。</strong>每周状态报告、会议纪要、对同一个客户问题的回复。在每项旁边写上：输入是本人可以粘贴或上传的东西，还是分散在邮件、文件和会议里的东西。</li>
<li><strong>能粘贴或上传的任务，用 Copilot Chat 练。</strong>根据上传的文档起草、按不同读者改写、从 PDF 里提取字段。这些都不需要许可证，而写提示词的习惯（角色、资料来源、格式、核验）和有许可证的版本完全一样。</li>
<li><strong>标出总要去找工作数据的任务。</strong>如果一个人得先打开四封邮件和一张表格再粘贴进去，这就是许可证能改变的任务。会议纪要是最明显的一个：我们的<a href="/zh/workflows/meeting-notes-to-action-items/">会议记录转行动项工作流</a>在两个版本里都能跑，但只有带许可证的版本会自己去读 Teams 转录。</li>
<li><strong>开通许可证之前先清理共享。</strong>许可证能读到本人能打开的一切，所以先请 IT 把对全公司共享的站点过一遍。<a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>列的是两个版本里都绝不能进提示词的内容。</li>
<li><strong>Excel 用真实数字练，然后核对。</strong>有许可证时，Copilot 直接处理打开的工作簿；用 Copilot Chat 时，上传一份去掉敏感列的导出表。无论哪种，数字进报告之前，每个人都要对照原始数据核对合计。</li>
<li><strong>两周后复盘。</strong>每项任务问三件事：用在真实工作上了吗？结果够不够用？是否需要 Copilot Chat 读不到的数据？最后一个问题的答案数一数，再决定买多少个许可证。</li>
</ol>

<h2>什么时候这套方法不灵</h2>
<p>公司还没决定 Copilot 是批准的工具时，这套方法不灵。如果一半人在用个人账号的 ChatGPT，另一半在用 Copilot Chat，第一件事是选定一个，并写清楚哪些内容可以放进去，<a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>就是做这个的。在大家都没达成一致的时候同时教两个工具，哪个都教不好。</p>
<p>文件本身有问题时也不灵。如果最新的价目表、制度和流程散落在每个人自己的 OneDrive 里，许可证找到旧版本和新版本的概率一样高。这是整理文档的活，要在 Copilot 培训之前做。</p>
<p>如果团队的工作大部分不在 Microsoft 365 里，买许可证也不对症。真正的工作在 CRM、业务系统或纸质表格里的话，Outlook 里的 Copilot 够不着。什么时候值得冒险去连接其他系统，可以看我们的 <a href="/zh/resources/chatgpt-vs-ai-agents/">ChatGPT 和 AI agent 怎么选</a>。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>把上面四个问题问 IT，答案写在一页纸上。15 分钟。</li>
<li>请三个人各拿一项每周任务，用 Copilot Chat 做三次，每次需要手动去别处找东西时记一笔。</li>
<li>导出对全公司共享的 SharePoint 站点清单。如果很长，在分配任何许可证之前先排上清理。</li>
</ul>
`,
    faq: [
      ['Copilot Chat 和 Microsoft 365 Copilot 有什么区别？', 'Copilot Chat 是随符合条件的 Microsoft 365 方案提供、基于网页信息的工作版对话，只能看到你粘贴或上传的公司内容。Microsoft 365 Copilot 是付费许可证，还能通过 Microsoft Graph 读取本人的邮件、文件、会议和聊天，并在 Word、Excel、PowerPoint、Outlook 和 Teams 里使用。'],
      ['企业用 Copilot Chat 要付费吗？', '微软的说法是，使用工作账号登录、方案符合条件的员工可以使用 Copilot Chat，不额外收费；其中部分智能体按用量计费。具体以微软价格页面上你们方案的说明为准。'],
      ['买 Microsoft 365 Copilot 许可证之前要先培训员工吗？', '要，用 Copilot Chat 先练。写提示词和复核的习惯是一样的，跑两周真实任务，就能看出哪些任务总需要邮件、文件或会议数据，而这正是许可证增加的能力。'],
      ['Microsoft 365 Copilot 会让员工看到不该看的文件吗？', '微软说明 Copilot 只呈现用户本来至少有查看权限的组织数据。如果文件共享过度，Copilot 就能把它翻出来，所以分配许可证之前先检查全公司范围的共享设置。'],
      ['你们在达拉斯做 Copilot 培训吗？', '做。可以到达拉斯—沃斯堡各地的公司现场上课，也可以全美线上直播，中英文都行，用每个人手里实际的 Copilot 版本来教。每个团队单独书面报价。'],
    ],
    pillar: ['Microsoft Copilot 团队培训', '/ai-training/copilot/'],
    related: [['Microsoft Copilot 团队培训', '/ai-training/copilot/'], ['ChatGPT 和 AI agent 怎么选', '/resources/chatgpt-vs-ai-agents/'], ['会议记录转行动项', '/workflows/meeting-notes-to-action-items/'], ['AI 工具审批清单', '/templates/ai-tool-approval-checklist/']],
    sources: [
      ['Microsoft Learn：Copilot Chat 常见问题', 'https://learn.microsoft.com/en-us/copilot/faq'],
      ['Microsoft Learn：什么是 Microsoft Copilot', 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-overview'],
      ['Microsoft Learn：Copilot 的数据、隐私与安全', 'https://learn.microsoft.com/en-us/microsoft-365/copilot/microsoft-365-copilot-privacy'],
      ['Microsoft：Copilot 方案与价格', 'https://www.microsoft.com/en-us/microsoft-365-copilot/pricing'],
    ],
  },
};
