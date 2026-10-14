# aimanjack.com 在搜索引擎和 AI 平台上的可见度 — 2026-10-13 实测

探针方式：Jack 的 Chrome（美国、英文），Google 自然结果 + AI Overview、Google AI Mode、Perplexity、Bing Copilot Search；ChatGPT 未登录，未测。原始记录见会话 scratchpad `serp-ai-probe-2026-10-13.md`。

## 1. 排名现状

| 查询 | Google 自然 | Google AI Overview / AI Mode | Perplexity | Bing Copilot |
|---|---|---|---|---|
| corporate AI training Dallas | **#16**（首页，不是 /ai-training/） | AI Mode 两次卡在 "Thinking"，未出结果 | 未提及（AI Connex、ITECS、Teamland、NetCom、NobleProg、Agile Advantages） | 未提及（Teamland、Certstaffix、CompuMatrice） |
| AI workshop for my team Dallas | **第 2 页（约 #15）** | AI Overview 列 ITECS、Teamland、DFW-AI、NobleProg、Structured Thinking；未提及 | 未提及（Texas AI Lab 首推、Teamland、Chris Cheetham-West、Walker AI $1,500、Intellezy） | 未提及（Teamland、ISHIR、Dallas Seminars） |
| AI training for employees Dallas | **第 2 页**（/ai-training/，Google 把 title 改写成了 H1 "AI Training Built Around the Work You Already Do"） | — | — | — |
| AI training for employees small business（全国词） | 不在前 10 页可见范围；首页全是 Skillsoft / Claude Academy / US Chamber / OpenAI | — | 只给通用建议，不点名供应商 | — |
| 达拉斯 AI 企业培训（中文） | **#1**（/zh/） | — | — | — |
| AI Man Jack Dallas（品牌） | 首页 / contact / about / blog 全在；TikTok、GitHub | — | — | — |

Bing Webmaster 侧：Bing 搜索 0 曝光；Copilot 3 个月 280 次引用，全部指向两篇 /resources/ 文章（今天已恢复 200）。

本地包（Local pack）：三个 Dallas 培训查询都出了地图包，里面是 USAII、IA FOR AI CONSULTING LLC（5.0，6 条评价）、ACI Learning、NAF Tech Academy。AI Man Jack 有 17 条 5.0 评价却不在里面。

## 2. 排在前面的是谁，差距在哪

| 对手 | 域名年龄 | 落地页 | 字数 | 本地信号 | 报价/形式 | Schema |
|---|---|---|---|---|---|---|
| teamland.com/ai-training/dallas | 2018 | 专门的 Dallas 页 | 2,287 | "Dallas" ×43，66 张图 | 4–200 人，on-site，30/60/90 天 pilot，NDA/SSO | FAQPage + Service + Organization |
| itecs.ai/training | 2025-07 | title "AI Training for Employees in Dallas" | 1,491 | LocalBusiness + GeoCoordinates | "guided agent builds"，报价 | LocalBusiness + HowTo + OfferCatalog + FAQPage |
| thecaravan.ai/locations/dallas | 2025-12 | "AI workshops for Dallas companies" | 1,893 | — | "1,000+ trained · 30+ companies"，Claude ×8 | FAQPage + Service + BusinessAudience |
| texasailab.com/dallas | 2026-04 | "Dallas AI Lab" | 941 | Dallas ×22，Plano/Frisco/Irving/McKinney 各 4–7 次 | 半天/全天 on-site，$1,000 / $1,500，30 天跟进 | Organization + Place + Person + ProfessionalService + FAQPage |
| dfw-ai.com/training | 2025-12 | "Team AI Training DFW" | 341 | — | $899 / $1,000 / $5,000，半天 | 无 |
| zavyans.com/locations/dallas | 2026-07 | "AI Training for Teams in Dallas" | — | — | — | — |
| **aimanjack.com/ai-training/** | 2026-05 | title 无 Dallas；H1 无关键词 | 1,756 | Dallas ×10，4 张图 | 四节 90 分钟 $499/人；团队"按需报价" | ProfessionalService + Offer + FAQPage |
| **aimanjack.com/**（实际参与排名的页） | | 品牌首页 | 960 | Dallas ×7 | | 无 FAQPage |

结论：**不是域名年龄问题**。thecaravan、dfw-ai、zavyans、texasailab、structuredthinking、itecs 都是 2025-07 之后注册的新站，全部排在前面。差距在四件事：

1. **没有一个 title/H1 直接说 "AI training/workshop for Dallas teams" 的落地页。** 对手人手一个 Dallas 专页；我们的 /ai-training/ 标题是 "Corporate AI Training for Employees | 4 Sessions"，Google 嫌 title 不贴，自己改写成了 H1，而 H1 里一个关键词都没有。HANDOFF 里 P1 的 `/ai-training-dallas/` 从来没做。
2. **查询语言是 "workshop / team / on-site / half-day / 多少钱"，我们的页面刻意不说这些词。** 测试里明确禁了 "Book a Workshop"、"half-day"、"$1,500"（09-28 单一产品决定）。Perplexity 和 Bing 推荐供应商的方式是"形式 + 人数 + 价格 + 跟进"，Walker AI 一句 "starts at $1,500 half-day" 就被点名；我们的 team-workshop 页写的是"按需报价"，AI 引擎没法转述。
3. **GBP 还是旧产品。** Google Maps 上 "AI Man Jack · 5.0 (17) · **Website designer**"，"From the owner" 最新帖（7 月 26 日）讲的是 $49/月漏接来电短信，营业时间"周四下午 5 点开"。类目和描述跟 AI 培训毫无关系，所以 17 条评价不如别人 6 条评价管用——本地包不认。
4. **第三方页面上没有我们。** Perplexity/Bing 的来源是 RevenueBase 的 "Top 16 AI training consultants in Dallas" 榜单、Dallas Seminars、Humanitix 活动页、Meetup、行业目录。aimanjack 外链 10 条，不在任何榜单或目录里。AI 引擎引用的是"别人怎么说你"，不是你自己的页。

次要差距：对手页面把 ChatGPT / Copilot / Claude / Gemini 各提 6–8 次（搜索"Copilot training Dallas"也能命中），我们各 2 次；Teamland 有 66 张图我们 4 张；thecaravan 用 "1,000+ trained · 30+ companies" 这种可转述的数字，我们的 5 场 / 50+ / 37 人 / 17 条 5.0 散在 config 里没集中展示。

## 3. 怎么改（按投入产出排序）

### 本周能做、零代码
1. **GBP 改类目和描述**（Jack 手动，30 分钟）：主类目改 "Training centre"（没有就 "Computer training school"），副类目 "Business management consultant"、"Educational consultant"；描述改成企业 AI 培训；删掉/覆盖 7 月那条漏接来电帖，改发一条培训帖；营业时间改成工作时间；传 5 场活动的照片；服务列表加 "AI training for teams"、"On-site AI workshop"。这一项单独就可能把 AI Man Jack 放进本地包。
2. **进榜单和目录**：RevenueBase 的 Dallas AI training consultants 列表（Perplexity 直接引它）、Clutch、GoodFirms、Alignable、Dallas AI（dallas-ai.org）讲师/合作方页、LinkedIn 公司页服务区。下一场免费工作坊挂到 Eventbrite/Humanitix——活动页本身会排名并被 AI 引用（Humanitix 的 Dallas 活动页排在我们前面）。

### 需要改站（走 PR）
3. **做 `/ai-training/dallas/`（或 HANDOFF 里的 `/ai-training-dallas/`）专页**：title "AI Training for Dallas–Fort Worth Teams | On-site Workshops | AI Man Jack"，H1 含 "AI training for Dallas–Fort Worth teams"，≥1,800 字，Dallas/Plano/Frisco/Irving/McKinney/Richardson 各出现几次（Jack 真实活动地点），LocalBusiness/ProfessionalService + GeoCoordinates + FAQPage，活动照片 ≥10 张，17 条评价摘 5 条带姓名。首页 title 同时让出 Dallas（改成品牌 + corporate AI training），避免首页和新页互抢（HANDOFF §1.1 已预警）。
4. **给 team-workshop 页一个可转述的形式和价格**：保留四节课程为主产品，但 `/ai-training/team-workshop/` 改成真正的"半天/全天 on-site 团队工作坊"页，写清人数范围、时长、起价、跟进方式（这是 Jack 的产品决定——要不要重新公开一个团队起价。不公开，这条查询就永远是对手的）。
5. **/ai-training/ 的 H1 加关键词**："AI training for employees, built around the work you already do"——Google 改写 title 时至少带上词；正文把四个工具名各提到 5 次以上，加一段 "Where we train: Dallas, Plano, Frisco…"。
6. **首页加 FAQPage + 证据块**：5 场 / 50+ / 37 人 / 17 条 5.0 评价集中成一块，带 3 条评价原文和照片。

### 持续
7. 周 agent 的 GEO 探针加上 "AI workshop for my team Dallas" 和 "AI training for employees Dallas" 两条固定问法，并记录 AI Overview 里列了谁。
8. Copilot 已经在"ChatGPT vs AI agents / AI curriculum for non-technical teams"这两个话题上信任这个站，姐妹篇优先围绕它们写（例如 "AI policy for small business employees" 那篇 draft 正好是）。

## 4. 不值得打的
- "AI training for employees small business" 这类全国头部词：首页是 Skillsoft、Claude Academy、US Chamber、OpenAI、Grow with Google，新站没有胜算，别为它写页。
- Google AI Mode：Jack 账号上两次都卡住没出结果，暂时无法作为观测面。
