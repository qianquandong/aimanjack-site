// /ai-training/ — content and schema carried over from the previous site (decision 2026-09-09, Q4).
// Only the chrome changed, plus the product cross-promo text/offer, which had to match the new pricing.
import { readFileSync } from 'node:fs';
import { SITE, EMAIL, SMS_TEL, SMS_DISPLAY } from '../config.mjs';

const schema = (lang) => {
  const g = JSON.parse(readFileSync(new URL(`../training-schema.${lang}.json`, import.meta.url), 'utf8'));
  const biz = g.find((n) => n['@type'] === 'ProfessionalService');
  biz.legalName = 'AI Man Jack LLC';
  biz.priceRange = '$199-$599/month';
  biz.availableLanguage = ['en', 'es', 'zh'];
  biz.makesOffer[1] = { '@type': 'Offer', itemOffered: { '@type': 'Service', '@id': `${SITE}/#service`, name: lang === 'zh' ? '预约制商家的 AI 前台' : 'AI receptionist for appointment businesses', url: `${SITE}${lang === 'zh' ? '/zh' : ''}/ai-receptionist/`,
    description: lang === 'zh' ? 'AI 前台接听来电、回答已确认的问题并预约，面向达拉斯—沃斯堡的预约制商家。每月 $199 起，加一次性安装费。' : 'An AI receptionist that answers calls, handles approved questions and books appointments for appointment businesses in Dallas–Fort Worth. From $199 a month plus a one-time setup fee.' },
    price: '199', priceCurrency: 'USD' };
  return g;
};

const SMS = `sms:${SMS_TEL}?body=TRAINING%20-%20`, MAIL = `mailto:${EMAIL}?subject=TRAINING%20-%20`;

const en = {
  title: 'AI Training for Dallas Teams, Hands-On | AI Man Jack',
  description: 'Hands-on AI training for Dallas teams, in English or Chinese. People leave with one working workflow for a task they already do. 5.0 on Google, 10 reviews.',
  og: { title: 'Hands-On AI Training for Dallas Teams', description: 'Each person brings one task they already do and leaves with a working workflow for it. In English or Chinese. 5.0 on Google across 10 reviews.', image: '/img/og-training.jpg', alt: 'Hands-on AI training for your team, in English or Chinese — text TRAINING to (469) 425-4142' },
  body: `
<section class="hero-photo" aria-label="Hands-on AI training for Dallas teams">
<picture><source media="(max-width:720px)" srcset="/img/hero-workshop-portrait-960.webp"><img class="hero-bg" src="/img/hero-workshop-1600.webp" srcset="/img/hero-workshop-960.webp 960w, /img/hero-workshop-1600.webp 1600w, /img/hero-workshop-2400.webp 2400w" sizes="100vw" width="1600" height="1067" fetchpriority="high" decoding="async" alt="A full classroom in Dallas at one of Jack Qian's hands-on AI workshops, Jack presenting at the screen"></picture>
<div class="wrap"><div class="hero-copy">
<div class="kicker">AI training · Dallas–Fort Worth · English or Chinese</div>
<h1>Hands-on AI training for Dallas teams, <em>in English or Chinese</em></h1>
<p class="sub">Each person brings one task they already do every week and leaves with a working workflow for it, plus the habit of checking the output before it goes out. Taught in person, at your office.</p>
<div class="cta-row"><a class="btn btn-primary" href="${SMS}" data-event="sms_click" data-pos="training-hero">Text TRAINING to ${SMS_DISPLAY}</a><a class="btn btn-ghost" href="${MAIL}" data-event="email_click" data-pos="training-hero">Email Jack about training</a></div>
<ul class="trust-strip"><li>5 community talks, 50+ people each</li><li>5.0 across 10 Google reviews</li><li>Taught in person across Dallas–Fort Worth</li></ul>
</div></div></section>
<div class="wrap">
<p class="lead" style="margin-top:44px">AI Man Jack is Jack Qian&rsquo;s Dallas, Texas practice: hands-on AI training for teams, and a done-for-you <a href="/ai-receptionist/">AI receptionist</a> for appointment businesses.</p>
<section class="proof-strip" aria-label="Track record"><div><strong>5 talks</strong><span>50+ attendees each, across Plano and Dallas in 2026</span></div><div><strong>1 hackathon</strong><span>37 guests built and demonstrated live AI demos in three hours</span></div><div><strong>5.0 &#9733;</strong><span>10 Google reviews, all from people who attended a workshop</span></div></section>
<section class="section" id="curriculum"><div class="kicker">What we cover</div><h2>Task first, tool second</h2>
<p class="lead">Non-technical teams usually arrive with one of two problems: overwhelmed by the number of AI products, or they tried a chatbot, got an impressive answer, and still don&rsquo;t know how it fits their job. A product tour makes both worse. So the session starts with a task the person already does, and works through it in five parts.</p>
<ol class="steps long" style="margin-top:26px">
<li><strong>Choose a suitable task.</strong> Each person lists three things they repeat every week and scores them: does it happen often enough to matter, can the input and output be described clearly, can a knowledgeable person check the result quickly, can it be tested without exposing sensitive information?<span class="step-why">The best first use case is narrow. &ldquo;Prepare a five-point meeting brief from these approved notes&rdquo; is teachable. &ldquo;Run my department&rdquo; is not.</span></li>
<li><strong>Give the AI useful context.</strong> A prompt is a work instruction, not a secret formula. A reliable one has a goal, an approved source, constraints, a usable format, and what to flag for a person to verify. Everyone rewrites one weak instruction, runs it, and compares the result.</li>
<li><strong>Move from chat to workflow.</strong> A chat produces an answer. A workflow moves information through steps: collect the approved notes, extract decisions, identify owners, draft follow-ups, put the result in a review queue.<span class="step-why">This is where a team learns the difference between a chatbot and an agent &mdash; whether the task needs a response, or permission to take an action.</span></li>
<li><strong>Verify the output.</strong> Verification is part of the exercise, not a warning on the last slide. Can every claim be traced to the source? Did it follow the format? What context is missing? Could it harm a customer or a decision if wrong? Who approves it before use? At least one output in the session is deliberately flawed; finding it teaches more than another perfect demo.</li>
<li><strong>Apply data and approval guardrails.</strong> Three questions every participant leaves with a clear answer to: which tools are approved, which information is off-limits, and where a human must sign off before anything is used.</li>
</ol>
<p class="section-note">Two weeks later we ask whether the workflow was tested, whether the result was accurate enough to use, and whether the task should continue, change, or stop. A small documented workflow that survives real use is the outcome &mdash; not a room full of people who enjoyed the demonstration.</p></section>
<section class="section" id="formats"><div class="kicker">Formats</div><h2>Three ways to run it</h2><p class="lead">All three follow the same five parts. What changes is how much of it each person does with their own hands.</p>
<div class="tiers">
<div class="price-card"><div class="big">90 min <small>lunch-and-learn</small></div><div class="plus">One task &middot; one live build &middot; one checklist</div><ul><li>A live build on a task taken from your team, not a canned demo</li><li>The five-part instruction template everyone can reuse the same afternoon</li><li>A one-page verification checklist to take back to their desk</li></ul><a class="btn btn-ghost" href="${SMS}" data-event="sms_click" data-pos="training-format">Text about this format</a><p class="microcopy">Good for a first look across a whole department.</p></div>
<div class="price-card"><div class="big">Half day <small>hands-on workshop</small></div><div class="plus">Everyone builds &middot; bring laptops and one real task each</div><ul><li>Each person leaves with a working workflow for a task they already do</li><li>A deliberately flawed output to catch, so verification becomes a habit</li><li>A pilot plan with an owner, a tool, and a first test date</li></ul><a class="btn btn-primary" href="${SMS}" data-event="sms_click" data-pos="training-format">Text to book a 20-minute call</a><p class="microcopy">This is the format the Google reviews below are about.</p></div>
<div class="price-card"><div class="big">Multi-week <small>program</small></div><div class="plus">For a team that wants the workflows to stick</div><ul><li>Weekly sessions built on the team&rsquo;s own tasks, one workflow at a time</li><li>Review of what actually ran between sessions, and what broke</li><li>A written playbook the team keeps after I leave</li></ul><a class="btn btn-ghost" href="${SMS}" data-event="sms_click" data-pos="training-format">Text about this format</a><p class="microcopy">Scoped after the half-day, once we know which tasks are worth it.</p></div>
</div>
<p class="section-note">Priced per engagement, by format and team size. Tell me how many people and what they do; you&rsquo;ll have a recommended format and a quote after a 20-minute call.</p></section>
<section class="section" id="testimonials"><div class="kicker">Reviewed on Google</div><h2>What attendees say</h2><p class="lead">5.0 across 10 Google reviews. All ten are from people who came to one of the community AI workshops in Dallas.</p>
<div class="quote-grid">
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;I had such a great experience at this AI workshop. It was practical, inspiring, and genuinely fun. Jack, the host, did an amazing job of breaking down complex AI concepts in a way that was easy to understand…&rdquo;</p><b>emily xu</b><span>Google review · Dallas AI workshop</span></div>
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;I really enjoyed Jack’s AI seminar! He has a very forward-thinking perspective on AI and does a great job of explaining everything from understanding AI to actually using it in real life…&rdquo;</p><b>U Rachel</b><span>Google review · Dallas AI workshop</span></div>
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;This AI course was very informative and easy to follow. It covered the fundamentals of AI and its basic applications, making it especially suitable for beginners with little or no prior experience.&rdquo;</p><b>Yuqi Guan</b><span>Google review · Dallas AI workshop</span></div>
</div>
<p style="text-align:center;margin-top:24px"><a class="review-link" href="https://g.page/r/CWX_rCfFduC1EAI" target="_blank" rel="noopener"><span aria-hidden="true">★★★★★</span> Read all 10 on Google</a></p></section>
<section class="section" id="community-proof"><div class="kicker">Where the method came from</div><h2>Five talks, one hackathon, and a lot of rewriting</h2><p class="lead">The community series in Dallas is where this curriculum was built. Every part of it was tried on a room of volunteers before a company ever paid for it.</p>
<div class="feature-split"><figure class="figure"><img src="/img/events/dallas-multi-agent-workshop.webp" width="1200" height="900" loading="lazy" alt="Jack Qian teaching a hands-on community AI workshop in Dallas"><figcaption>A hands-on Multi-Agent AI community workshop in Dallas.</figcaption></figure><div><h3>Tried on a real room first</h3><p>The task-scoring exercise, the deliberately flawed output, the two-week check-in &mdash; each one earned its place by working in front of fifty people, or got cut. The five parts above are the ones that survived.</p></div></div></section>
<section class="section" id="products"><div class="kicker">Also from AI Man Jack</div><h2>Rather have it built than taught?</h2>
<div class="paths" style="margin-top:26px"><a class="path tinted" href="/ai-receptionist/"><div class="path-label">Product</div><b>An AI receptionist that answers calls and books appointments</b><span>For Dallas&ndash;Fort Worth salons, med spas, clinics, home-service and repair businesses. It answers from the details you approve, books into the connected workflow, and hands off when it should. Call the demo line first and hear it answer, then contact Jack for more.</span><div class="path-cta">See the AI receptionist</div></a></div></section>
<section class="section" id="faq"><div class="kicker">Common questions</div><h2>The training, answered plainly</h2>
<div class="faq" style="max-width:760px;margin-top:26px">
<details open><summary>Who is the AI training for?</summary><div class="faq-a"><p>Teams of roughly 5 to 60 people in Dallas&ndash;Fort Worth where most people are not technical: operations, sales, admin, front office, planning, customer service. No coding. Everyone works on a task they already do.</p></div></details>
<details><summary>What do people actually build during the training?</summary><div class="faq-a"><p>One working workflow for a task they already do every week &mdash; a meeting brief from approved notes, a first-draft customer reply, a weekly report pulled from a spreadsheet, a research summary on an account. It runs by the end of the session, and each person leaves with a checklist for verifying the output before it goes out.</p></div></details>
<details><summary>Is the training in English or Chinese?</summary><div class="faq-a"><p>Either. The community series in Dallas in 2026 ran in Chinese; company sessions run in whichever language the room works in, and the materials come in both.</p></div></details>
<details><summary>Which AI tools does the training use?</summary><div class="faq-a"><p>Whatever your company has already approved &mdash; ChatGPT, Claude, Gemini, Copilot. The method is the same across tools. The first thing covered is which data may go into a tool and which may not.</p></div></details>
<details><summary>How much does AI training for a team cost?</summary><div class="faq-a"><p>It&rsquo;s priced per engagement, by format and team size. Text TRAINING with your company name to ${SMS_DISPLAY}, or email <a href="mailto:${EMAIL}">${EMAIL}</a>. After a 20-minute call you&rsquo;ll have a recommended format and a quote.</p></div></details>
<details><summary>How do you know whether the training worked?</summary><div class="faq-a"><p>Two weeks after the session, we check whether the workflow was tested on real work, whether the result was accurate enough to use, where review took too long, and whether the task should continue, change, or stop. Attendance and satisfaction scores are not the measure.</p></div></details>
<details><summary>Can the training be run at our office?</summary><div class="faq-a"><p>Yes. Sessions are in person anywhere in the Dallas&ndash;Fort Worth metroplex &mdash; Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington, and everywhere between. Remote on request.</p></div></details>
<details><summary>Do you also build things?</summary><div class="faq-a"><p>Yes: a done-for-you AI receptionist and booking system for appointment businesses, on the <a href="/ai-receptionist/">AI receptionist page</a>. Training is the same person, the same method &mdash; just taught instead of installed.</p></div></details>
</div></section>
<section class="section" id="about"><h2>One method, two ways to get it</h2><div class="bio" style="margin-top:22px"><img src="/img/jack-portrait-256.webp" width="128" height="128" loading="lazy" decoding="async" alt="Jack Qian"><div class="who"><h3>Jack Qian</h3><p>I run community AI workshops and hands-on build events here in Dallas because useful AI education should be accessible, and I teach companies the same way. I also build the AI receptionist on the home page for businesses that would rather have it installed than taught. In both cases the work starts with one real task and an honest answer about whether AI belongs there.</p></div></div></section>
</div>
<section class="section final-cta" id="start"><div class="wrap narrow center"><h2>Bring one task. Leave with it running.</h2><p class="lead">Text TRAINING with your company name, or email. We&rsquo;ll find a 20-minute slot, and you&rsquo;ll have a format and a quote by the end of it.</p>
<div class="cta-row center"><a class="btn btn-primary btn-lg" href="${SMS}" data-event="sms_click" data-pos="training-final">Text TRAINING to ${SMS_DISPLAY}</a><a class="btn btn-secondary btn-lg" href="${MAIL}" data-event="email_click" data-pos="training-final">Email Jack about training</a></div></div></section>`,
};

const zh = {
  title: '达拉斯团队 AI 实战培训 | AI Man Jack',
  description: '面向达拉斯团队的动手 AI 培训，中英文皆可。每个人带一个自己每周都在做的任务来，带着一条能跑的工作流走。Google 10 条评价，5.0 分。',
  og: { title: '达拉斯团队的动手 AI 培训', description: '每个人带一个自己每周都在做的任务来，带着一条能跑的工作流走。中英文皆可。Google 10 条评价，5.0 分。', image: '/img/og-training-zh.jpg', alt: '给你团队的动手 AI 培训，中英文皆可 — 发 TRAINING 到 (469) 425-4142' },
  body: `
<section class="hero-photo" aria-label="达拉斯团队的动手 AI 培训">
<picture><source media="(max-width:720px)" srcset="/img/hero-workshop-portrait-960.webp"><img class="hero-bg" src="/img/hero-workshop-1600.webp" srcset="/img/hero-workshop-960.webp 960w, /img/hero-workshop-1600.webp 1600w, /img/hero-workshop-2400.webp 2400w" sizes="100vw" width="1600" height="1067" fetchpriority="high" decoding="async" alt="达拉斯，Jack Qian 的一场动手 AI workshop，教室坐满了人，Jack 在大屏前讲解"></picture>
<div class="wrap"><div class="hero-copy">
<div class="kicker">AI 培训 · 达拉斯—沃斯堡 · 中文或英文</div>
<h1>给达拉斯团队的动手 AI 培训，<em>中文或英文都行</em></h1>
<p class="sub">不是带你把 AI 产品逛一遍。每个人带一个自己每周都在做的任务来，走的时候手里有一条能跑的工作流 &mdash; 还有一个习惯：结果发出去之前，先核一遍。面对面教，到你办公室。</p>
<div class="cta-row"><a class="btn btn-primary" href="${SMS}" data-event="sms_click" data-pos="training-hero">发 TRAINING 到 ${SMS_DISPLAY}</a><a class="btn btn-ghost" href="${MAIL}" data-event="email_click" data-pos="training-hero">给 Jack 发邮件问培训</a></div>
<ul class="trust-strip"><li>5 场社区讲座，每场 50+ 人</li><li>Google 10 条评价，5.0 分</li><li>达拉斯—沃斯堡面对面授课</li></ul>
</div></div></section>
<div class="wrap">
<p class="lead" style="margin-top:44px">AI Man Jack 是 Jack Qian 在德州达拉斯经营的工作室：给团队做动手 AI 培训，也给预约制商家装全包的 <a href="/zh/ai-receptionist/">AI 前台</a>。</p>
<section class="proof-strip" aria-label="Track record"><div><strong>5 场讲座</strong><span>每场 50+ 人，2026 年在 Plano 和达拉斯</span></div><div><strong>1 场 hackathon</strong><span>37 位来宾三小时内做出并演示了现场 AI demo</span></div><div><strong>5.0 &#9733;</strong><span>10 条 Google 评价，全部来自 workshop 学员</span></div></section>
<section class="section" id="curriculum"><div class="kicker">教什么</div><h2>先看任务，再看工具</h2>
<p class="lead">非技术团队来的时候，通常带着两个问题之一：被 AI 产品的数量压得喘不过气，或者试过 chatbot，拿到过一个挺唬人的答案，却还是不知道它跟自己的工作有啥关系。一堂以产品为中心的课，只会让这两个问题都更糟。所以课从每个人已经在做的一个任务讲起，分五步走完。</p>
<ol class="steps long" style="margin-top:26px">
<li><strong>选一个合适的任务。</strong>每个人列出三件自己每周都要重复做的事，用四个问题打分：发生得够不够频繁？输入和想要的结果能不能说清楚？懂行的人能不能很快检查结果？能不能在不泄露敏感信息的前提下试一试？<span class="step-why">最好的第一个用例通常都很窄。「根据这些批准过的笔记，整理一份五点的会议简报」，这能教；「帮我管整个部门」，这不能。</span></li>
<li><strong>给 AI 足够有用的背景。</strong>prompt 是一份工作交办说明，不是什么秘诀。一份靠谱的交办说明有目标、批准过的来源、约束、能直接用的格式，还有该标出来让人核实的地方。每个人拿一条写得不好的说明改一改，跑一遍，对比结果。</li>
<li><strong>从 chat 走到工作流。</strong>chat 给出的是一个答案。工作流描述的是信息怎样流过好几个步骤：收集批准过的会议笔记，抽取出决议，认出各项的负责人，起草跟进动作，再把结果放进待审核的队列。<span class="step-why">团队正是在这里学会 chatbot 和 agent 的区别 &mdash; 这个任务只需要一个回应，还是需要给它采取行动的权限。</span></li>
<li><strong>核对结果。</strong>核对是练习的一部分，不是最后一张幻灯片上的一句提醒。每一处说法能不能追回到来源？有没有照着要求的格式来？漏掉了哪些背景？如果错了会不会伤到某个客户或某个决定？用之前由谁批准？课上至少放进一个故意做错的结果，找出这个错，比再看一遍完美的演示教得更多。</li>
<li><strong>加上数据和审批的护栏。</strong>三个问题，每个学员走的时候都得有清楚的答案：哪些工具是批准过的，哪些信息是禁止的，哪些地方必须有人签字才能用。</li>
</ol>
<p class="section-note">课后两周，我们去问：那条工作流有没有试过，结果够不够拿来用，这个任务该继续、该改还是该停。一条小小的、写成文档、又经得起实际使用的工作流，才是结果 &mdash; 不是一屋子看演示看得很开心的人。</p></section>
<section class="section" id="formats"><div class="kicker">形式</div><h2>三种上法</h2><p class="lead">三种形式走的都是同样五步。区别在于，每个人有多少是自己动手做完的。</p>
<div class="tiers">
<div class="price-card"><div class="big">90 分钟 <small>午间分享</small></div><div class="plus">一个任务 &middot; 一次现场搭建 &middot; 一份清单</div><ul><li>拿你们团队的一个真实任务现场搭，不是提前准备好的 demo</li><li>五步交办说明的模板，当天下午就能用上</li><li>一页纸的核对清单，带回工位</li></ul><a class="btn btn-ghost" href="${SMS}" data-event="sms_click" data-pos="training-format">发短信问这种形式</a><p class="microcopy">适合整个部门先摸个底。</p></div>
<div class="price-card"><div class="big">半天 <small>动手 workshop</small></div><div class="plus">每个人都动手 &middot; 带上电脑和一个真实任务</div><ul><li>每个人带着一条能跑的工作流走，对应自己已经在做的事</li><li>一个故意做错的结果等着被找出来，核对从此成习惯</li><li>一份试点计划：负责人、工具、第一次测试的日期</li></ul><a class="btn btn-primary" href="${SMS}" data-event="sms_click" data-pos="training-format">发短信约 20 分钟通话</a><p class="microcopy">下面那些 Google 评价，说的就是这种形式。</p></div>
<div class="price-card"><div class="big">多周 <small>项目制</small></div><div class="plus">给想让工作流真正留下来的团队</div><ul><li>每周一次，围绕团队自己的任务，一次搭一条工作流</li><li>复盘两次课之间真正跑起来的东西，以及哪里坏了</li><li>一份写好的 playbook，我走了之后团队自己留着用</li></ul><a class="btn btn-ghost" href="${SMS}" data-event="sms_click" data-pos="training-format">发短信问这种形式</a><p class="microcopy">先上半天场，知道哪些任务值得做，再定这个范围。</p></div>
</div>
<p class="section-note">按项目定价，看形式和人数。告诉我多少人、他们平时做什么，聊 20 分钟，你就会有一个推荐的形式和报价。</p></section>
<section class="section" id="testimonials"><div class="kicker">Google 评价</div><h2>学员怎么说</h2><p class="lead">10 条 Google 评价，5.0 分。十条都来自参加过达拉斯社区 AI workshop 的人。原文是英文，在 Google 上。</p>
<div class="quote-grid">
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;这次 AI workshop 我收获特别大。内容实用，也很有启发，而且是真的好玩。主讲 Jack 把复杂的 AI 概念拆得很清楚，听着一点不费劲……&rdquo;</p><b>emily xu</b><span>Google 评价 · 达拉斯 AI workshop</span></div>
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;Jack 的 AI 讲座我听得很过瘾！他对 AI 的看法很超前，从怎么理解 AI，到怎么真的把它用起来，讲得都很到位……&rdquo;</p><b>U Rachel</b><span>Google 评价 · 达拉斯 AI workshop</span></div>
<div class="quote"><div class="stars" aria-hidden="true">★★★★★</div><p>&ldquo;这门 AI 课信息量很足，也很好跟。从 AI 的基础一路讲到基本的应用场景，对完全没接触过的人特别友好。&rdquo;</p><b>Yuqi Guan</b><span>Google 评价 · 达拉斯 AI workshop</span></div>
</div>
<p style="text-align:center;margin-top:24px"><a class="review-link" href="https://g.page/r/CWX_rCfFduC1EAI" target="_blank" rel="noopener"><span aria-hidden="true">★★★★★</span> 在 Google 上看全部 10 条</a></p></section>
<section class="section" id="community-proof"><div class="kicker">这套方法从哪来</div><h2>五场讲座、一场 hackathon，和大量返工</h2><p class="lead">这套课就是在达拉斯的社区活动里磨出来的。每一块内容，都先在一屋子志愿者身上跑过，才轮到公司付钱。</p>
<div class="feature-split"><figure class="figure"><img src="/img/events/dallas-multi-agent-workshop.webp" width="1200" height="900" loading="lazy" alt="达拉斯，Jack Qian 的一场动手 AI 社区工作坊"><figcaption>达拉斯的一场多智能体 AI 社区工作坊。</figcaption></figure><div><h3>先在真实的教室里跑过</h3><p>任务打分那个练习、故意做错的那份结果、课后两周的回访 &mdash; 每一样都是在五十号人面前跑通了才留下的，跑不通的当场就砍。上面那五步，是留下来的那些。</p></div></div></section>
<section class="section" id="products"><div class="kicker">AI Man Jack 还做这个</div><h2>不想学，想直接装好？</h2>
<div class="paths" style="margin-top:26px"><a class="path tinted" href="/zh/ai-receptionist/"><div class="path-label">产品</div><b>一个接电话、约时间的 AI 前台</b><span>给达拉斯&mdash;沃斯堡的美发美容、医美 spa、诊所、上门服务和维修商家。它按你确认过的信息回答，把预约写进接好的流程，该交接的时候交接。先拨演示线，听它怎么接，再联系 Jack 了解详情。</span><div class="path-cta">看 AI 前台</div></a></div></section>
<section class="section" id="faq"><div class="kicker">常见问题</div><h2>培训这件事，说清楚</h2>
<div class="faq" style="max-width:760px;margin-top:26px">
<details open><summary>这个 AI 培训是给谁的？</summary><div class="faq-a"><p>达拉斯&mdash;沃斯堡 5 到 60 人左右的团队，大多数人不是技术背景：运营、销售、行政、前台、计划、客服。不用写代码，每个人练的都是自己已经在做的任务。</p></div></details>
<details><summary>学员在培训里到底做出什么？</summary><div class="faq-a"><p>一条能跑的工作流，对应自己每周都在做的一件事 &mdash; 从批准过的笔记整理会议简报、客户回复的初稿、从表格里拉出来的周报、某个客户的调研摘要。课结束前它就已经在跑了，每个人还会带走一份核对清单，结果发出去之前先过一遍。</p></div></details>
<details><summary>用中文还是英文？</summary><div class="faq-a"><p>都可以。2026 年达拉斯的社区系列是中文场；企业场用现场最顺的那种语言，材料两种语言都有。</p></div></details>
<details><summary>培训用哪些 AI 工具？</summary><div class="faq-a"><p>你公司已经批准的那些 &mdash; ChatGPT、Claude、Gemini、Copilot 都行。方法跨工具通用。开头第一件事就是讲清楚：哪些数据可以放进工具，哪些不行。</p></div></details>
<details><summary>团队 AI 培训多少钱？</summary><div class="faq-a"><p>按项目定价，看形式和人数。发 TRAINING 加公司名到 ${SMS_DISPLAY}，或者发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>。聊 20 分钟，就会有一个推荐的形式和报价。</p></div></details>
<details><summary>怎么知道培训有没有效果？</summary><div class="faq-a"><p>课后两周去看：那条工作流有没有拿真实工作试过、结果准不准、够不够拿来用、审核在哪一步花的时间太长，以及这个任务该继续、该改还是该停。出勤率和满意度不算数。</p></div></details>
<details><summary>能到我们办公室来讲吗？</summary><div class="faq-a"><p>能。整个达拉斯&mdash;沃斯堡都会区都可以面对面 &mdash; Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington，中间的城市也都跑。有需要也可以远程。</p></div></details>
<details><summary>你也帮人做东西吗？</summary><div class="faq-a"><p>做：给预约制商家的全包 AI 前台 + 预约系统，在<a href="/zh/ai-receptionist/">AI 前台页</a>。培训和产品是同一个人、同一套方法 &mdash; 一个是教给你，一个是装给你。</p></div></details>
</div></section>
<section class="section" id="about"><h2>一套方法，两种拿法</h2><div class="bio" style="margin-top:22px"><img src="/img/jack-portrait-256.webp" width="128" height="128" loading="lazy" decoding="async" alt="Jack Qian"><div class="who"><h3>Jack Qian</h3><p>我在达拉斯办社区 AI 工作坊和动手活动，因为有用的 AI 教育应该人人够得着；给公司上课，也是同一个教法。我也给不想学、只想装好的商家做首页上那套 AI 前台。两件事都一样：从一个真实的任务开始，再诚实地判断 &mdash; AI 到底该不该用在这儿。</p></div></div></section>
</div>
<section class="section final-cta" id="start"><div class="wrap narrow center"><h2>带一个任务来，带着它跑起来走</h2><p class="lead">发 TRAINING 加上公司名，或者发邮件。我们约 20 分钟聊一次，聊完你就有形式和报价了。</p>
<div class="cta-row center"><a class="btn btn-primary btn-lg" href="${SMS}" data-event="sms_click" data-pos="training-final">发 TRAINING 到 ${SMS_DISPLAY}</a><a class="btn btn-secondary btn-lg" href="${MAIL}" data-event="email_click" data-pos="training-final">给 Jack 发邮件问培训</a></div></div></section>`,
};

export const pages = [{ path: '/ai-training/', priority: 0.8, changefreq: 'weekly',
  en: { ...en, jsonld: schema('en') }, zh: { ...zh, jsonld: schema('zh') } }];
