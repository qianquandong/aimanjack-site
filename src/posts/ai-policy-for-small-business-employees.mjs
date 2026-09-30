// seo-blog workflow (Agent OS workflows/seo-blog.md), backlog T6. Every fact below comes from the live pages
// aimanjack.com/ai-training/, /templates/ai-tool-approval-checklist/, /templates/ai-data-boundaries-one-pager/
// and /templates/approved-source-inventory/. No first-person anecdotes: stories.md is still empty.
export const post = {
  slug: 'ai-policy-for-small-business-employees',
  date: '2026-09-29',
  updated: undefined,
  status: 'draft',
  en: {
    keyword: 'AI policy for small business employees',
    title: 'AI Policy for Small Business Employees | AI Man Jack',
    description: 'An AI policy for small business employees that fits on one page: which tools are approved, what never goes in, and who signs off. Two free templates.',
    h1: 'An AI policy for small business employees fits on one page',
    sub: 'Most small teams do not need a twenty-page policy. They need three answers that everyone can repeat back a week later.',
    takeaways: [
      'An AI policy for small business employees only has to answer three questions: which tools are approved, which information is off limits, and who signs off before an output is used.',
      'Approve one tool first, in writing, on company accounts. Comparing five tools delays the day people stop using personal accounts for company work.',
      'Read the vendor terms for the exact plan you will buy, on the day you decide, and paste the link into the approval. Terms differ by plan and change.',
      'Put a real name next to every sign-off. A role that nobody holds signs off nothing.',
      'A week after you share the page, ask three people which tools are approved. If they cannot answer, the policy has not landed.',
    ],
    sections: `
<h2>The three questions every session ends on</h2>
<p>The last of the five parts in our <a href="/ai-training/">AI training</a> is data and approval guardrails. Every participant leaves with a clear answer to three questions: which tools are approved, which information is off limits, and where a human must sign off. That is the whole of a workable AI policy for small business employees. Everything else is detail.</p>
<p>We put it at the end of every session for a plain reason. The first thing the training covers about tools is which data may go into them and which may not. A team that learns a fast workflow without those three answers learns it on whatever account each person happens to have.</p>

<h2>Why a small business needs this before it needs more training</h2>
<p>Picture the usual starting point: AI use has begun before anyone wrote a rule. Someone drafts customer emails in a personal ChatGPT account. Someone else summarises a contract in a free tool they found last month. Nobody decided this; it just happened, one person at a time.</p>
<p>The <a href="/templates/ai-tool-approval-checklist/">AI tool approval checklist</a> names the goal in one line: end "everyone uses their personal account" by approving one tool, in writing. The companion <a href="/templates/ai-data-boundaries-one-pager/">AI data boundaries one-pager</a> is built so that every employee can read it in two minutes. Between them, they are the policy. The rest of this post is how to fill them in, and where it goes wrong.</p>

<h2>How to write an AI policy for small business employees</h2>
<ol>
<li><strong>Approve one tool first.</strong> Pick the tool people already want for three named tasks, such as a first-draft customer reply, a weekly report or a meeting summary. Do not start by comparing five products; that only delays the day personal accounts stop.</li>
<li><strong>Read the vendor terms for the exact plan, on the day.</strong> Answer five questions from the vendor's current pages: does it train on what you enter, how long data is kept, where it is stored, whether you can delete it, and whether there is an admin console with an audit log. Paste the link and the date. If the answer is "trains on our data, no opt-out", the fix is usually a different plan, not a different tool.</li>
<li><strong>Write the "never goes in" list in plain words.</strong> The template starts with passwords and access keys, government ID numbers, bank and card details, health information about any person, customer data under a contract or NDA that forbids it, and unreleased financial results. Add your own lines. If people need a lawyer to read the list, they will not follow it.</li>
<li><strong>Add a "check first" list and a "fine to use" list.</strong> Check first: customer names with account details, employee information such as pay and performance, contracts and legal letters. Fine to use: public information, your own published material, and anonymised data with names removed before it goes in.</li>
<li><strong>Put a real name next to each sign-off.</strong> Anything sent to a customer, anything with a number in it, anything that goes to leadership: each one gets a person, not a job title.</li>
<li><strong>Say what happens when something goes in that should not have.</strong> One line: tell a named person the same day. The template adds that there is no blame for reporting; the problem is not reporting.</li>
<li><strong>Tell everyone the same day you decide.</strong> One message: which tool, for what, use your company account, never put this in, questions go to this person. Then walk the team through the page in ten minutes and pin it where the work happens.</li>
</ol>

<h2>What goes on the page</h2>
<div class="table-wrap"><table>
<thead><tr><th>Question</th><th>What you write</th><th>Example line</th></tr></thead>
<tbody>
<tr><td>Which tools are approved?</td><td>The tool, the plan, company accounts only, and who to ask about anything else</td><td>"Anything not on this list is not approved for company work."</td></tr>
<tr><td>Which information is off limits?</td><td>A "never" list, a "check first" list and a "fine to use" list</td><td>"Anonymised data: names and identifiers removed before it goes in."</td></tr>
<tr><td>Who signs off?</td><td>One named person per type of output</td><td>"Anything with a number in it: checked by the office manager."</td></tr>
</tbody>
</table></div>
<p>If you already keep a list of documents the AI is allowed to read, link it from the "fine to use" section. The <a href="/templates/approved-source-inventory/">approved source inventory</a> is the one-page version of that list.</p>

<h2>When a one-page AI policy does not work</h2>
<p>It does not replace legal or security advice when you handle regulated data. Both templates say so on the page: the approval checklist organises a decision, and the boundaries page records working rules. If your business holds health, financial or other regulated information, treat the one page as the summary your team reads, and have counsel review the actual policy.</p>
<p>It does not work when nobody owns it. The page has an owner line for a reason. Tools and terms move every few months, so the checklist sets a review date; a page with no owner quietly goes out of date and people stop trusting it.</p>
<p>It does not work as a ban with no alternative. If the policy says what is forbidden but approves nothing, the work that people were doing with AI does not stop. It moves back to personal accounts, where you cannot see it.</p>
<p>And it does not work if it never gets tested. Writing the page is the easy part. The template's own check is blunt: ask three people a week later which tools are approved.</p>

<h2>What to do in the next 14 days</h2>
<ul>
<li>List every AI tool people in the office use today, including personal accounts. Ask; do not guess. Fifteen minutes.</li>
<li>Fill in the approval checklist for the one tool most people already use, with the vendor terms open for the plan you would pay for. About thirty minutes.</li>
<li>Draft the "never goes in" list and the three sign-off names, share them, and put a reminder in the calendar one week out to ask three people which tools are approved.</li>
</ul>
`,
    faq: [
      ['Does a small business need an AI policy for employees?', 'If anyone on the team already uses AI for work, yes, because the rules exist either way; without a page, each person makes them up. A small business does not need a long document. One page that answers which tools are approved, what never goes in, and who signs off is enough to start.'],
      ['What should an employee AI policy include?', 'The approved tools and plans, with company accounts only. A list of information that never goes into an AI tool, a list to check first, and a list that is fine to use. A named person who signs off on each type of output, and who to tell the same day if something went in that should not have.'],
      ['Can employees use their personal ChatGPT account for work?', 'That is a decision for each company, and it is exactly the decision the approval checklist is there to make. The checklist is built around ending personal accounts for company work by approving one tool on company accounts, with a date after which personal accounts are no longer for company work.'],
      ['What information should employees never put into AI tools?', 'A common starting list is passwords and access keys, government ID numbers, bank and card details, health information about any person, customer data covered by a contract or NDA that forbids it, and unreleased financial results. Add anything specific to your business, and keep the wording plain.'],
      ['Is a one-page AI policy enough for a regulated business?', 'No. For regulated data, the one page is the summary employees read, not the policy itself. Have counsel and IT review the full policy, and keep the one page in step with it.'],
    ],
    pillar: ['hands-on AI training for Dallas teams', '/ai-training/'],
    related: [['AI data boundaries one-pager, free template', '/templates/ai-data-boundaries-one-pager/'], ['AI tool approval checklist, free template', '/templates/ai-tool-approval-checklist/'], ['AI for leaders and managers', '/use-cases/leadership/'], ['AI training for office managers', '/blog/ai-training-for-office-managers/']],
    sources: [],
  },
  zh: {
    keyword: '小公司员工 AI 使用规定',
    title: '小公司员工 AI 使用规定：一页纸说清三件事 | AI Man Jack',
    description: '员工已经在用 AI 了，规定还没有？一页纸回答三件事：用哪个工具、哪些信息不能放、谁来签字。附两份免费模板。',
    h1: '小公司员工 AI 使用规定，一页纸就够',
    sub: '小公司用不着二十页的制度。要的是三个答案，一周后随便问谁都答得上来。',
    takeaways: [
      '小公司员工 AI 使用规定只需要回答三件事：批准了哪些工具、哪些信息不能碰、输出用之前谁来签字。',
      '先批准一个工具，写下来，用公司账号。拿五个工具来比，只会把大家停用个人账号的那天往后拖。',
      '厂商条款要按你真正要买的那个方案去看，当天看，把链接贴进审批表。不同方案条款不一样，而且会改。',
      '每一项签字后面写一个真人的名字。没人担任的职位，等于没人签字。',
      '规定发出去一周后，随便问三个同事批准的是哪个工具。答不上来，就说明这页纸没落地。',
    ],
    sections: `
<h2>每堂课最后都落在这三个问题上</h2>
<p>我们的 <a href="/zh/ai-training/">AI 培训</a>一共五个环节，最后一个是数据和审批的规矩。每个学员下课时都要能答上三个问题：哪些工具批准了、哪些信息不能碰、哪里必须有人签字。小公司员工 AI 使用规定，说到底就是这三条，其他都是细节。</p>
<p>放在每堂课最后，道理很简单。讲工具时，我们头一件讲的就是哪些数据能放进去、哪些不能。一个团队要是只学会了一套好用的流程，却答不上这三个问题，那这套流程就是在各人手上随便哪个账号里跑的。</p>

<h2>为什么小公司先要这页纸，再谈多上课</h2>
<p>常见的起点是这样的：规矩还没写，AI 已经有人在用了。有人用自己的 ChatGPT 账号写客户邮件，有人把合同丢进上个月刚发现的免费工具里做摘要。没人拍过板，就是一个人接一个人自己用起来的。</p>
<p>站上的 <a href="/zh/templates/ai-tool-approval-checklist/">AI 工具审批清单</a>一句话把目标写明了：书面批准一个工具，结束"人人都用自己私人账号"的局面。配套的 <a href="/zh/templates/ai-data-boundaries-one-pager/">AI 数据边界一页纸</a>，设计成每个员工两分钟能读完。这两张纸合起来，就是你的规定。下面讲怎么填，以及容易在哪里出岔子。</p>

<h2>小公司员工 AI 使用规定怎么写</h2>
<ol>
<li><strong>先批准一个工具。</strong>挑大家本来就想用的那个，写明先用在哪三件事上，比如客户回复初稿、每周报表、会议纪要。别一上来比五款产品，比来比去，私人账号就一直停不下来。</li>
<li><strong>按你要买的方案看厂商条款，当天看。</strong>从厂商现在的页面上找五个答案：会不会拿你输入的内容训练模型、数据留多久、存在哪里、能不能删、有没有管理后台和操作日志。把链接和日期贴上去。如果答案是"会拿来训练，而且关不掉"，通常换个方案就行，不一定要换工具。</li>
<li><strong>"绝对不能放"的清单，用大白话写。</strong>模板里先列了这几样：密码和各种密钥、身份证件号码、银行卡和信用卡信息、任何人的健康信息、合同或保密协议明确不许外传的客户数据、还没公布的财务数字。再加上你们自己的。要是得请律师才看得懂，就没人会照着做。</li>
<li><strong>再加两张单子：先问一声的，和可以放心用的。</strong>先问一声：带账户细节的客户名字、员工的工资和绩效、合同和律师往来信件。放心用：公开信息、你们自己发布过的材料、放进去之前已经去掉姓名的匿名数据。</li>
<li><strong>每项签字，写上真人的名字。</strong>发给客户的、带数字的、要交给老板或管理层的，每一类都写一个人，别写职位。</li>
<li><strong>写清楚放错了东西怎么办。</strong>就一句：当天告诉某某。模板里还补了一句：报告了不追究，不报告才是问题。</li>
<li><strong>定下来当天就通知所有人。</strong>一条消息讲清楚：批准了哪个工具、用来干什么、用公司账号、哪些东西不许放、有问题找谁。然后花十分钟带大家过一遍，贴在大家干活的地方。</li>
</ol>

<h2>这页纸上写什么</h2>
<div class="table-wrap"><table>
<thead><tr><th>问题</th><th>写什么</th><th>举个例子</th></tr></thead>
<tbody>
<tr><td>批准了哪些工具？</td><td>工具名、方案、只用公司账号、其他工具问谁</td><td>"不在这张单子上的工具，一律不许用在公司的事情上。"</td></tr>
<tr><td>哪些信息不能碰？</td><td>"绝对不能放"、"先问一声"、"放心用"三张单子</td><td>"匿名数据：放进去之前先去掉姓名和各种编号。"</td></tr>
<tr><td>谁来签字？</td><td>每一类输出写一个具体的人</td><td>"带数字的内容：行政主管看过再发。"</td></tr>
</tbody>
</table></div>
<p>如果你们已经有一份"AI 可以读哪些资料"的清单，就在"放心用"那一栏把它链上。<a href="/zh/templates/approved-source-inventory/">可信来源清单</a>就是这份单子的一页纸版本。</p>

<h2>什么情况下一页纸的规定不灵</h2>
<p>涉及受监管的数据，这页纸代替不了法律和安全方面的意见。两个模板页面上都写明了：审批清单是帮你把决定理清楚，边界那页纸记的是团队日常的规矩。你的生意要是经手健康、金融这类受监管的信息，就把这页纸当成给员工看的摘要，正式的规定请律师把关。</p>
<p>没人负责，也不灵。页面上专门有一行写负责人，就是这个原因。工具和条款几个月就变一次，所以审批清单上要定复查日期；没人管的那页纸会悄悄过时，过时了大家也就不信它了。</p>
<p>只禁不批，同样不灵。规定里全是"不许"，一个工具都没批准，大家本来用 AI 干的活并不会停，只会退回到私人账号上，你还看不见。</p>
<p>最后，写完不检查也不灵。写这页纸是最容易的一步。模板自己给的检验办法很直接：一周后问三个同事，批准的是哪个工具。</p>

<h2>接下来 14 天能做的</h2>
<ul>
<li>把办公室里现在有人在用的 AI 工具全列出来，私人账号也算。要去问，别靠猜。十五分钟。</li>
<li>挑用的人最多的那个工具，把审批清单填一遍，同时打开你准备付费的那个方案的厂商条款对着看。半小时左右。</li>
<li>写出"绝对不能放"的清单和三个签字人的名字，发给大家，再在一周后的日历上提醒自己：去问三个同事批准的是哪个工具。</li>
</ul>
`,
    faq: [
      ['小公司需要给员工定 AI 使用规定吗？', '只要团队里有人已经在拿 AI 干活，就需要。规矩反正存在，没写下来，就是每个人自己定一套。小公司用不着长篇制度，一页纸讲清批准了哪些工具、什么不能放、谁来签字，就够起步了。'],
      ['员工 AI 使用规定应该写哪些内容？', '批准的工具和方案，只能用公司账号；三张单子：绝对不能放的、先问一声的、放心用的；每一类输出由哪个具体的人签字；以及放错了东西，当天该告诉谁。'],
      ['员工能用自己的 ChatGPT 账号处理公司的事吗？', '这要每家公司自己定，审批清单就是用来做这个决定的。清单的思路是：批准一个工具、统一用公司账号，并写明从哪天起私人账号不再用于公司的事。'],
      ['哪些信息员工绝对不能放进 AI 工具？', '常见的起步清单包括：密码和密钥、身份证件号码、银行卡和信用卡信息、任何人的健康信息、合同或保密协议不许外传的客户数据、还没公布的财务数字。再加上你们行业特有的，措辞保持大白话。'],
      ['受监管的行业，一页纸的规定够用吗？', '不够。涉及受监管的数据，这页纸只是给员工看的摘要，不是正式规定。完整的规定请律师和 IT 审一遍，这页纸跟着它同步更新。'],
    ],
    pillar: ['面向达拉斯团队的实操 AI 培训', '/ai-training/'],
    related: [['AI 数据边界一页纸（免费模板）', '/templates/ai-data-boundaries-one-pager/'], ['AI 工具审批清单（免费模板）', '/templates/ai-tool-approval-checklist/'], ['管理层的 AI 应用', '/use-cases/leadership/'], ['行政主管 AI 培训怎么安排', '/blog/ai-training-for-office-managers/']],
    sources: [],
  },
};
