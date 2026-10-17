// Per-event detail for the /events/ pages (2026-10-17). Facts come only from each session's Luma page (description, time, venue,
// sign-up count as shown on Luma), the DFW IT Association poster, and our own photos. Nothing here is a claim about outcomes.
// Keyed by EVENTS[].date in src/content/events.mjs; add an entry when a session is added there.
// Photos: [file in /img/events/ (webp), width, height, { en, zh } alt/caption]. A Luma poster is used where we have no photos.

const P = (file, w, h, en, zh) => [file, w, h, { en, zh }];

export const EVENT_PAGES = {
  '2026-04-02': {
    slug: 'dallas-openclaw-meetup-2026-04-02', luma: 'https://luma.com/5703yxcr',
    start: '2026-04-02T19:00:00-05:00', end: '2026-04-02T21:00:00-05:00', time: { en: '7:00–9:00 PM', zh: '晚上 7:00–9:00' },
    place: { name: 'Space Karaoke Bar & Cafe', street: '121 W Spring Creek Pkwy #331', city: 'Plano', zip: '75023' },
    lang: null, mode: 'offline',
    photos: [P('dallas-openclaw-2026-04-02-poster', 800, 800, 'The Luma poster for the first Dallas OpenClaw meetup', '第一次 Dallas OpenClaw 聚会的 Luma 海报')],
    en: {
      summary: 'The first Dallas OpenClaw meetup: an evening live demo of building AI agents with OpenClaw, the open-source AI agent, in a private lounge in Plano. 40 people signed up on Luma.',
      covered: ['“OpenClaw Live Demo: Build AI Agents in a Private Lounge” — the full agenda as posted on Luma: a live demo of building AI agents with OpenClaw.'],
      after: 'The interest from this first evening led to a second, larger OpenClaw meetup on May 17, with 70 sign-ups.',
      next: ['/ai-training/claude/', 'Claude training for business teams'],
    },
    zh: {
      summary: '第一次 Dallas OpenClaw 聚会：在 Plano 的一间私人包厢里，现场演示用开源 AI 智能体 OpenClaw 搭建 AI agent。Luma 上 40 人报名。',
      covered: ['“OpenClaw Live Demo: Build AI Agents in a Private Lounge”——Luma 上公布的完整议程：现场演示用 OpenClaw 搭建 AI agent。'],
      after: '第一次聚会的反响，促成了 5 月 17 日规模更大的第二次 OpenClaw 聚会，报名 70 人。',
      next: ['/ai-training/claude/', 'Claude 企业团队培训'],
    },
  },
  '2026-04-18': {
    slug: 'dallas-ai-hackathon-2026-04-18', luma: null,
    start: '2026-04-18', end: '2026-04-18', time: { en: 'Afternoon (about three hours)', zh: '下午（约三小时）' },
    place: { name: 'Venture X coworking space', street: '163 Town Pl', city: null, zip: null },
    lang: null, mode: 'offline',
    photos: [
      P('dallas-hackathon-room-teams-building', 1600, 900, 'Teams building at the Dallas AI hackathon', '黑客松现场，各组开工'),
      P('dallas-hackathon-team-laptops', 1600, 900, 'A team working through its project on laptops', '一个小组围着笔记本电脑推进项目'),
      P('dallas-hackathon-team-discussion', 1600, 900, 'A team deciding what to build', '小组讨论要做什么'),
      P('dallas-hackathon-team-demo', 1600, 900, 'A team demonstrating what it built', '小组演示做出来的成果'),
      P('dallas-hackathon-final-presentations', 1600, 900, 'Final presentations to the room', '面向全场的最终演示'),
      P('dallas-ai-hackathon-group', 1200, 910, 'Participants after the hackathon', '活动结束后的大合影'),
    ],
    en: {
      summary: 'The 4.18 Dallas AI Hackathon: 37 builders, working in teams, built AI projects over one three-hour afternoon and presented them to the room.',
      covered: ['Teams worked through their projects together on laptops.', 'Teams demonstrated what they had built.', 'Final presentations to the whole room, then a group photo.'],
      after: 'Building something real in a short session and showing it to the room is also how the company workshops end.',
      next: ['/ai-training/team-workshop/', '90-minute team workshop'],
    },
    zh: {
      summary: '4.18 达拉斯 AI 黑客松：37 位参与者分组，在一个约三小时的下午里动手做 AI 项目，最后向全场演示。',
      covered: ['各组围着笔记本电脑一起推进项目。', '各组演示做出来的成果。', '面向全场的最终演示，最后大合影。'],
      after: '在短时间里做出真东西、再拿给全场看，企业工作坊也是这样收尾的。',
      next: ['/ai-training/team-workshop/', '90 分钟团队工作坊'],
    },
  },
  '2026-05-17': {
    slug: 'openclaw-ai-agents-meetup-2026-05-17', luma: 'https://luma.com/u1tw9z8m',
    start: '2026-05-17T13:30:00-05:00', end: '2026-05-17T16:00:00-05:00', time: { en: '1:30–4:00 PM', zh: '下午 1:30–4:00' },
    place: { name: '2711 LBJ Freeway, Suite 136A', street: '2711 Lyndon B Johnson Fwy #136A', city: 'Dallas', zip: '75234' },
    lang: { en: 'Mandarin Chinese only', zh: '仅中文' }, mode: 'offline',
    photos: [
      P('dallas-ai-workshop-full-room-1600', 1600, 1200, 'A full room working on laptops at the second OpenClaw meetup in Dallas', '第二次 OpenClaw 聚会，满屋子的人在用笔记本电脑'),
      P('dallas-openclaw-2026-05-17-poster', 800, 800, 'The Luma poster for OpenClaw meetup #2', 'OpenClaw 聚会 #2 的 Luma 海报'),
    ],
    en: {
      summary: 'OpenClaw meetup #2, “Into the world of AI agents”: how Claude Code and OpenClaw turn AI from one chat assistant into several agents that split up a job like a small team. 70 people signed up — the largest session of the year.',
      covered: ['Multi-agent workflows: several agents with clear roles working together on a complex task, demonstrated with Claude Code and real cases.', 'E-commerce: product selection, listing copy, listing, customer service and the weekly review.', 'Teaching: course design, slides, practice exercises and student feedback.', 'Customer service teams: sorting questions, drafting replies, keeping the knowledge base current and summarising tickets.', 'Developers: breaking down requirements, writing code, testing, review and documentation.'],
      after: 'It was pitched well beyond engineers — at founders, e-commerce sellers, teachers, content creators, product managers and students who want an “AI team” for their own work.',
      next: ['/ai-training/claude/', 'Claude training for business teams'],
    },
    zh: {
      summary: 'OpenClaw 聚会 #2「走进 AI Agent 的世界」：用 Claude Code 和 OpenClaw，让 AI 从一个聊天助手变成多个分工明确、像小团队一样协作的 agent。报名 70 人，是今年规模最大的一场。',
      covered: ['Multi-Agent 工作流：多个角色清楚的 agent 协作完成复杂任务，用 Claude Code 和真实案例演示。', '电商：选品、文案、上架、客服到复盘。', '教学：课程设计、课件制作、练习生成到学员反馈。', '客服团队：问题分类、回复生成、知识库维护到工单总结。', '开发者：需求拆解、代码实现、测试、review 到文档整理。'],
      after: '面向的远不止工程师：创业者、电商从业者、老师、内容创作者、产品经理和学生，所有想用 AI 提升效率的人。',
      next: ['/ai-training/claude/', 'Claude 企业团队培训'],
    },
  },
  '2026-07-18': {
    slug: 'ai-workflow-automation-session-3-2026-07-18', luma: 'https://luma.com/rsihvu8x',
    start: '2026-07-18T13:30:00-05:00', end: '2026-07-18T16:00:00-05:00', time: { en: '1:30–4:00 PM', zh: '下午 1:30–4:00' },
    place: { name: '2711 LBJ Freeway, Suite 136A', street: '2711 Lyndon B Johnson Fwy #136A', city: 'Dallas', zip: '75234' },
    lang: { en: 'Chinese only', zh: '仅中文' }, mode: 'offline',
    photos: [
      P('dallas-session3-jack-presenting', 1600, 1066, 'Jack Qian presenting at the AI workflow automation session', 'Jack Qian 在 AI 工作流自动化分享会上讲解'),
      P('dallas-session3-hands-on', 1600, 1066, 'Attendees working hands-on during the session', '学员现场动手'),
      P('dallas-session3-group-demo', 1600, 1066, 'An attendee group showing its workflow', '学员小组展示自己的工作流'),
      P('dallas-session3-audience-view', 1600, 1066, 'The room at session 3', '第三期现场'),
    ],
    en: {
      summary: 'Session 3 of the AI Workflow Automation series: practical uses of AI workflow automation, building on the first two sessions, followed by an open showcase where attendees demonstrated their own projects. 40 people signed up.',
      covered: ['A talk on AI workflow automation in practice.', 'New material only: concepts from sessions 1 and 2 were not repeated, so newcomers were asked to read up beforehand.', 'An open showcase: attendees brought their own demos and workflows and walked the room through them.'],
      after: 'Turning a one-off prompt into a repeatable workflow is the core of the company program as well.',
      next: ['/workflows/', 'Step-by-step AI workflows'],
    },
    zh: {
      summary: 'AI Workflow Automation 系列讲座第三期：AI 工作流自动化的实战应用，在前两期基础上继续；后半场开放展示，学员上台演示自己的项目。报名 40 人。',
      covered: ['主题分享：AI Workflow Automation 实战。', '只讲新内容：前两期的基础概念不再重复，建议新朋友提前了解。', '开放展示：学员带着自己的 Demo 和工作流上台讲解。'],
      after: '把一次性的提示词变成可重复的工作流，也是企业课程的核心。',
      next: ['/workflows/', '分步骤的 AI 工作流'],
    },
  },
  '2026-07-25': {
    slug: 'dfw-it-association-fireside-chat-2026-07-25', luma: null,
    start: '2026-07-25T12:00:00-05:00', end: '2026-07-25T14:00:00-05:00', time: { en: '12:00–2:00 PM', zh: '中午 12:00–下午 2:00' },
    place: { name: 'Schimelpfenig Library', street: '5024 Custer Rd', city: 'Plano', zip: '75023' },
    lang: { en: 'English', zh: '英文' }, mode: 'offline', organizer: 'DFW IT Association',
    photos: [
      P('dfwit-fireside-2026-07-25-jack-podium', 1600, 1066, 'Jack Qian speaking at the DFW IT Association fireside chat', 'Jack Qian 在 DFW IT Association 炉边谈话上发言'),
      P('dfwit-fireside-2026-07-25-two-speakers', 1600, 1066, 'Jack Qian and a co-speaker taking questions', 'Jack Qian 与联合讲者答问'),
      P('dfwit-fireside-2026-07-25-room-wide', 1600, 1066, 'The room at Schimelpfenig Library in Plano', 'Plano Schimelpfenig 图书馆的现场'),
      P('dfwit-fireside-2026-07-25-audience', 800, 1200, 'IT professionals in the audience', '现场的 IT 从业者'),
      P('dfwit-fireside-2026-07-25-jack-gesture', 800, 1200, 'Jack Qian answering a question', 'Jack Qian 回答问题'),
    ],
    en: {
      summary: 'The DFW IT Association invited Jack Qian as the featured speaker for a fireside chat in Plano: “Work Smarter, Think Deeper, Live Better — Leveraging AI to Elevate Your Work, Skills & Life.”',
      covered: ['AI productivity tools and workflows for everyday work.', 'Turning experience into reusable assets instead of starting from scratch each time.', 'A personal knowledge base in Obsidian.', 'How to communicate with AI effectively.', 'What AI changes about careers.'],
      after: 'It is the same material the company training is built from, delivered to a room of IT professionals who had not met Jack before.',
      next: ['/ai-training/dallas/', 'Corporate AI training in Dallas–Fort Worth'],
    },
    zh: {
      summary: 'DFW IT Association 邀请 Jack Qian 作为特邀讲者，在 Plano 做了一场炉边谈话：“Work Smarter, Think Deeper, Live Better — 用 AI 提升你的工作、技能与生活”。',
      covered: ['日常工作中的 AI 生产力工具与工作流。', '把经验沉淀成可复用的资产，不必每次从头开始。', '用 Obsidian 搭建个人知识库。', '如何有效地与 AI 沟通。', 'AI 会怎样改变职业。'],
      after: '企业培训用的正是同一套材料，这次讲给了一屋子此前并不认识 Jack 的 IT 从业者。',
      next: ['/ai-training/dallas/', '达拉斯—沃斯堡企业 AI 培训'],
    },
  },
  '2026-08-22': {
    slug: 'first-ai-project-workshop-2026-08-22', luma: 'https://luma.com/xhx7oos8',
    start: '2026-08-22T13:30:00-05:00', end: '2026-08-22T15:00:00-05:00', time: { en: '1:30–3:00 PM', zh: '下午 1:30–3:00' },
    place: { name: '2711 LBJ Freeway, Suite 136A', street: '2711 Lyndon B Johnson Fwy #136A', city: 'Dallas', zip: '75234' },
    lang: { en: 'Chinese', zh: '中文' }, mode: 'offline',
    photos: [
      P('dallas-session-2026-08-22-room', 1600, 1066, 'The room at the “first AI project” session in Dallas', '“用 AI 完成第一个小项目”现场'),
      P('dallas-session-2026-08-22-teaching', 1600, 1066, 'Jack Qian walking through a step on screen', 'Jack Qian 对着屏幕讲解一个步骤'),
      P('dallas-session-2026-08-22-screen', 1600, 1066, 'Explaining how to turn a vague idea into a clear task', '讲解如何把模糊的想法变成清晰的任务'),
      P('dallas-session-2026-08-22-helping', 1600, 1066, 'Helping an attendee at her laptop', '在学员电脑旁一对一指导'),
      P('dallas-session-2026-08-22-table', 1600, 1066, 'Answering questions at a table', '在桌边答疑'),
      P('dallas-session-2026-08-22-after', 1600, 1066, 'Conversations after the session', '活动结束后的交流'),
    ],
    en: {
      summary: '“Zero to your first small AI project”: a free, hands-on session for students and parents. Instead of a tour of dozens of tools, everyone followed along step by step and finished one simple, useful AI project. 59 people signed up.',
      covered: ['How AI differs from ordinary software.', 'How to turn a vague idea into a clear task.', 'How to communicate with ChatGPT effectively.', 'How to judge and revise what the AI gives back.', 'How to use AI to finish a small project of your own.'],
      after: 'No coding and no prior AI experience were needed; people brought a laptop, a ChatGPT account and one small problem they wanted to solve. The same “one real task, step by step, then check the output” approach is how employees are taught.',
      next: ['/ai-training/chatgpt/', 'ChatGPT training for employees'],
    },
    zh: {
      summary: '“零基础也能上手：用 AI 完成你的第一个小项目”：面向学生和家长的免费实操讲座。不堆概念、不一次介绍几十种工具，大家跟着一步步操作，亲手完成一个简单实用的 AI 小项目。报名 59 人。',
      covered: ['AI 和普通软件有什么不同。', '如何把一个模糊想法变成清晰任务。', '怎样与 ChatGPT 有效沟通。', '如何判断和修改 AI 给出的结果。', '怎样借助 AI 完成一个属于自己的小项目。'],
      after: '不需要编程基础，也不要求用过 AI；带一台电脑、一个 ChatGPT 账号和一个想解决的小问题就行。“一项真实任务、一步步来、最后核验输出”，给企业员工上课也是这个方法。',
      next: ['/ai-training/chatgpt/', 'ChatGPT 员工培训'],
    },
  },
  '2026-09-16': {
    slug: 'ai-job-search-with-jason-jia-2026-09-16', luma: 'https://luma.com/7rbyqoui',
    start: '2026-09-16T21:00:00-05:00', end: '2026-09-16T22:30:00-05:00', time: { en: '9:00–10:30 PM (Central)', zh: '晚上 9:00–10:30（美中时间）' },
    place: null, lang: { en: 'Chinese', zh: '中文' }, mode: 'online', guest: 'Jason Jia',
    photos: [P('online-ai-job-search-2026-09-16-poster', 900, 900, 'Poster: “Finding a job in the AI era” with Jason Jia and Jack Qian', '海报：“AI 时代，我们怎么找工作？” Jason Jia × Jack Qian')],
    en: {
      summary: '“Finding a job in the AI era”, a live online conversation. Jack Qian put specific questions to Jason Jia, a software engineer at Netflix (previously LinkedIn and Intuit) who has also interviewed candidates, about how hiring works now. 63 people signed up.',
      covered: ['How large companies screen résumés now, and whether AI changed the bar.', 'What an interviewer thinks when a résumé says “proficient with AI tools”.', 'Where applicant tracking systems filter people out.', 'From the job description to a master résumé to a version tailored for each role, and building a job-search agent.', 'What to put on GitHub, and whether open-source work helps.', 'What happens when someone is caught using AI to cheat in an interview.', 'How much of the team’s code AI now writes, which tasks it has taken over, and how new-grad hiring changed in three years.'],
      after: 'The second half was set aside for questions, with an open offer to look at résumés live.',
      next: ['/ai-training/', 'Corporate AI training'],
    },
    zh: {
      summary: '“AI 时代，我们怎么找工作？”线上直播。Jack Qian 拿着一堆很具体的问题，问 Netflix 软件工程师 Jason Jia（曾在 LinkedIn 和 Intuit，也当过面试官）现在到底怎么招人。报名 63 人。',
      covered: ['大厂现在怎么筛简历，AI 出来之后标准变没变。', '简历上写“熟练使用 AI 工具”，面试官心里是什么反应。', 'ATS 到底卡在哪一步。', '从 JD 到 master resume 再到每个岗位定制的简历，以及求职 Agent 怎么搭。', 'GitHub 放什么，开源项目到底有没有用。', '面试里用 AI 作弊被发现会怎么样。', '他们组现在写代码 AI 占多少、哪些活儿被吃掉了，以及 new grad 的标准三年来怎么变。'],
      after: '后半场留给大家提问，也欢迎把简历发上来现场看。',
      next: ['/ai-training/', '企业 AI 培训'],
    },
  },
};
