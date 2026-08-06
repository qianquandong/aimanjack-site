# aimanjack.com SEO / 收录状态

目标（2026-07-16 /goal，当日修正）：站点分三板块 AI Education / Website / AI Workflow for Business ✅；SEO 目标**从头部词 "Dallas AI" 改为盯可赢的长尾词**（Jack 决定）。

## 为什么放弃 "Dallas AI" 头部词（实测依据）

2026-07-16 实搜 "Dallas AI" 前 50 名结果：前排被 **dallas-ai.org**（一万多会员非营利 AI 组织，精确匹配域名）、**dallasai.com**（精确匹配域名）、Meetup、UT Dallas、Clutch 等多年权重站锁死。新站短期无法挤入。且该词搜索意图是"找社区/活动"，不是"买服务"——即使排上去也不带客户。**结论：不值得打，改盯长尾。**

## 已完成（我这边能控的全做了）

**三板块**：首页 index.html 重写，三个板块 + 锚点导航 + 定价 + 联系 + 关于。AI Education 板块 CTA 接 realagentusecases.com 订阅（不另搭后端）。

**技术 SEO**：
- title / meta description / keywords 都围绕 "Dallas AI" 及长尾（AI automation Dallas / AI education Dallas / AI website Dallas / AI workflow Dallas）
- canonical、robots meta、Open Graph、Twitter card
- JSON-LD 结构化数据（ProfessionalService + areaServed Dallas TX + 三个 Service Offer）
- robots.txt（Cloudflare 托管块 search=yes 放行 Googlebot）+ sitemap.xml

**Google Search Console**：
- 加了 Domain property `aimanjack.com`，用 TXT `google-site-verification=Pe2Z2EXsiO3Qyv-uddpdaOmXW0ODEQZHMU1b8D9vHMg`（已加进 Cloudflare DNS）验证通过
- 提交 sitemap https://aimanjack.com/sitemap.xml（状态暂显 "Couldn't fetch"，刚提交常见，Google 会重试；sitemap 本身 curl 200 可达）
- URL Inspection 首页：**已在 Google 索引**（域名从旧 Shopify 站就在索引里）+ 已「Request Indexing」进优先抓取队列，让 Google 认领新内容

## 不在我控制内（Google 说了算，要时间）

- **"Dallas AI" 排名进前 5 页**：这是几周尺度的结果，取决于 Google 重新抓取、竞争度、外链、停留数据。技术弹药和内容已就位，接下来是等 + 持续加内容。
- 提速建议（后续可做）：给三个板块各拆独立页面（/ai-education、/website、/ai-workflow）做深内容页比单页更容易吃长尾词；持续发 realagentusecases 内容互链；争取本地目录/GBP 外链。

## 第二轮：三个独立深度页（2026-07-16 同日）

为提升 "Dallas AI" 长尾词排名概率，把三个板块各拆成独立页，扩大可排名索引面：
- `/ai-education/` — 目标词 AI education Dallas / learn AI Dallas / Dallas AI training
- `/website/` — 目标词 Dallas website design / small business website Dallas / Google Business Profile Dallas
- `/ai-workflow/` — 目标词 AI workflow Dallas / AI automation Dallas / missed call text back Dallas

每页：独立 title/meta/keywords、canonical、Service + BreadcrumbList 结构化数据、面包屑、深度正文（非薄页）、页面互链。CSS 抽成共享 `/style.css`。首页改成三卡片入口 + 导航指向独立页。sitemap.xml 扩到 4 个 URL。

GSC：4 个页面全部 URL Inspection + Request Indexing，都进了 Google 优先抓取队列（首页本已收录，另三页是新页）。

## 第三轮：全站重定位到长尾词（2026-07-16，Jack 决定后）

四个页面的 title/meta/keywords/H1 全部从头部词改为高意图长尾 + 垂直行业词：

| 页面 | 新 title | 主攻长尾词 |
|------|----------|-----------|
| `/` | AI Automation & Websites for Dallas Small Business | AI automation for small business Dallas, missed call text back Dallas, AI for nail salons Dallas, barbershop website Dallas |
| `/ai-education/` | AI Training for Dallas Professionals & Small Teams | AI training Dallas, AI training for small business Dallas, AI classes for professionals Dallas |
| `/website/` | Small Business Website Design Dallas — $500, Live in a Week | small business website Dallas, affordable website design Dallas, nail salon website Dallas, barbershop website Dallas |
| `/ai-workflow/` | Missed Call Text Back & AI Automation for Dallas Small Business | missed call text back Dallas, Google review automation Dallas, AI for nail salons/barbershops Dallas |

首页 H1 也改成服务意图（"AI automation and websites for Dallas small businesses — that actually bring in customers"），正文点名 nail salons / barbershops / clinics，这些垂直+本地词竞争最弱、意图最强。

## 待复查
- 过一两天回 GSC 看：sitemap 是否转 "Success"、四个页面 Last crawl 是否更新、Pages 报告是否从 "not indexed" 转 "indexed"。
- Performance 报告里观察**长尾词**的曝光和排名位置（几周内才有数据）。重点看 "missed call text back Dallas"、"small business website Dallas"、"nail salon website Dallas" 这类。
- 首页内容已大改，可在 GSC 对 `/` 再 Request Indexing 一次让 Google 认领新版本。

## 后续能继续推排名的（非今日必须）
- 外链：把 aimanjack.com 三个页面从 realagentusecases.com 内容里链过来；本地目录（GBP、Yelp、Nextdoor）留一致 NAP。
- 持续更新：给每个板块加真实案例/FAQ，Google 偏好活跃、有深度的页面。

## 第四轮：全站视觉重设计（2026-07-16 晚，taste + ui-ux-pro-max skill 指导）

回滚了当日早前的 GSAP 试验（git 基线 5823d81），用 design-taste-frontend / redesign-existing-projects / ui-ux-pro-max 三个 skill 从头设计：

- **设计系统**：冷调中性底（#f7f8f7）+ 品牌深绿唯一 accent（#0b5d38）+ Satoshi 自托管变量字体（42KB）。圆角规则：交互件 pill / 容器 16px
- **布局**：非对称分栏 hero（首页=头像照、教育页=授课实拍、website 页=作品截图）；首页 1+2 路径卡（featured 带图）；作品 2 联卡；定价左文右卡分栏；步骤连线；bio 卡
- **taste 规则执行**：全站 em-dash 清零（含 title/og）、hero 副文案 ≤20 词、眉标全站仅 1 个、无三等宽卡、无衬线默认、动效 transform-only + reduced-motion
- **SEO 不变量**：URL/H1 语义/正文关键词/JSON-LD/canonical/sitemap 全保留；title 只改标点；图片全部带尺寸+关键词 alt
- git: 5823d81 基线 → d2f04f7 重设计。回滚随时 `git revert`/`git checkout 5823d81`

## 第五轮：内容扩张后的 GSC 提交（2026-07-17）

Jack 扩站到 13 页（business-services 枢纽、2 案例页、community 活动页、resources 集群）后：
- 修复：活动照片压缩（2MB→740KB）、case-study 时间线 dash 标点、手机导航显示全部 4 项（Free AI Education / Business Services / Events / Resources 单行排布）
- GSC Request Indexing 已提交 9/10：`/`、/business-services/、/ai-education/、/community/free-ai-workshops-dallas/、/resources/、2 个 case-studies、/resources/chatgpt-vs-ai-agents/、/resources/ai-training-curriculum-nontechnical-teams/
- **未提交（当日配额用尽）**：/resources/ai-data-safety-checklist/ —— 明天补交，或等 sitemap 自动发现

## 第四轮：产品转向后的重定位 + 技术性能（2026-07-26）

主推产品变成 Missed-Call Rescue（$49/mo），但首页 title/H1 还停在旧定位，一个字没提目标词。全部重写：

| 项 | 旧 | 新 |
|---|---|---|
| title | Practical AI Education & Business Services in Dallas (70字符，被截断) | Missed Call Text Back for Dallas Small Business \| AI Man Jack (61) |
| H1 | Practical AI for Dallas communities and small businesses | **Missed call text back** for Dallas small businesses（精确匹配目标词）|
| description | 泛泛讲教育+服务 | 十秒回短信 + $49/mo + 不换号（带钩子和价格，提高 CTR）|

**新增可见 FAQ 板块 + FAQPage schema（7 问）**：吃「what is missed call text back」「do I have to change my phone number」「how much does it cost」这类问句长尾；同时喂 AI 搜索（robots.txt 已放行 OAI-SearchBot / ChatGPT-User）。

**schema 增强**：areaServed 从 Dallas 一个城市扩到 Dallas / Richardson / Plano / Garland / Allen（对齐实际扫街范围）；makesOffer 首位换成 Missed-Call Rescue 并加 UnitPriceSpecification（月付）；补 priceRange `$49-$500`、currenciesAccepted；robots meta 加 max-image-preview:large。

**图片全站转 WebP**：13 张 2.17MB → 1.01MB（-53%），首页头图 67KB → 20KB。34 个 `<img src>` 全部指向 .webp，og:image 和 schema image 保留 jpg（社交爬虫更稳）。原 jpg 留在盘上做回退。目标是修 Cloudflare Analytics 里 LCP「50% Needs Improvement」。

**sitemap**：13 → 15 条（补 /privacy、/sms-terms 两个原孤儿页），首页 lastmod 更新为 2026-07-26 促重抓。全站 JSON-LD 语法校验通过。

## ⚠️ 遗留风险：NAP 不一致（最高优先级）

2026-07-26 全站电话从 **(832) 888-6016 换成 (469) 425-4142**（A2P 审核要求网站 CTA 号码 = Campaign 发信号）。但 **Google Business Profile / Yelp / Nextdoor 等外部目录若仍是 832，就构成 NAP 冲突**——这是本地 SEO 的核心信号之一，冲突会直接压制 map pack 排名。**必须去 GBP 和所有目录同步改成 469。**

## 下一步真正的瓶颈（不是技术 SEO）

技术面对一个 15 页的站已接近做满。剩下的排名全靠这两样，且都不在代码里：
1. **Google Business Profile**——本地服务生意的 map pack 全靠它，没有就等于在本地搜索里隐身。优先级高于站内任何一处改动。
2. **外链/权威**——从 realagentusecases.com 互链、本地目录、上门拍的内容发布后带链接。

## 双站互链（2026-07-26）

之前笔记里写的「AI Education 板块 CTA 接 realagentusecases 订阅」在改版中丢了，实测两边**一条互链都没有**。补上：

- **aimanjack.com → realagentusecases.com**：14 个页面页脚（/privacy 和 /sms-terms 故意留空白干净，A2P 审核员在看那两页）。锚文本 "Real Agent Use Cases — my weekly newsletter on AI agents working professionals actually run"。
- **realagentusecases.com → aimanjack.com**：96 个页面页脚（中英双语，走 i18n `footer.sisterSite`）。英文锚文本 "AI Man Jack — AI automation for Dallas small businesses"（带目标词），中文 "AI Man Jack — 帮达拉斯本地小店用 AI 少漏客人"。

**注意期望值**：同一个人名下两站互链，Google 会打折，权重远低于第三方编辑链接。真正的收益是 ①爬虫发现路径 ②实体关联（两站同属一个 brand）③真实转介流量。不要指望它顶替外链建设。

## 双站价值最大化：实体互认 + 正文上下文链接（2026-07-26 第二批）

页脚互链之上，把两站的关联做到机器可读的程度：

**JSON-LD 实体互认（比链接更硬的信号）**：
- RAUC `lib/schema.ts` Person 加 `sameAs: [aimanjack.com, luma]` + `alternateName: "AI Man Jack"`；顺手把 jobTitle 从 Industrial Engineer 更正为 **Business Planner**（转岗已发生，全网 bio 应一致）
- aimanjack 首页 Person `sameAs` 加 realagentusecases.com
- 两边 Person 都叫 Jack Qian、互相 sameAs → Google 知识图谱可合并为同一实体，两站的权威信号互相灌注

**正文上下文链接（权重远高于页脚）**：
- RAUC Gmail agent 文章（EN+ZH）结尾各加一句 P.S.，自然桥接到 aimanjack（锚文本含 missed-call text back / 漏接来电自动短信回复）
- aimanjack `/ai-workflow/` 正文加"我自己每天在用并公开完整搭建"段落，链到 RAUC 那篇 Gmail agent 文章——既是外链也是信任背书

**核对过的现状**：RAUC 的 hreflang 其实一直有（React 渲染成 `hrefLang` 驼峰，合法），canonical/OG/sitemap/robots（含 GPTBot/ClaudeBot/PerplexityBot 放行）都健康。

**到此两站站内 SEO 都已做满。** 剩余杠杆全部在站外：GBP（最大）、第三方目录/外链、内容节奏。

## GBP 更新（2026-07-26 晚）

Jack 原本就有已验证的 GBP（AI Man Jack · Website designer · 服务区域含 Plano/Dallas 等）。我误建的重复档案已删除（未验证状态，无副作用）。对真档案提交了三处编辑（各需 ~10 分钟 Google 审核）：
1. **主电话 832 → (469) 425-4142** —— NAP 冲突解除，网站/GBP/A2P 三方一致
2. **Chat 短信号 832 → 469** —— Google 上的 "Chat" 短信直接进 missed-call 系统
3. **描述重写**：以 Missed-Call Rescue（$49/mo、10 秒回短信、不换号）打头，网站服务其次，覆盖五城市；结尾 "Call or text — if I miss you, you'll see the product work"

469 转拨逻辑（先响 Jack 手机 12 秒）意味着 GBP 上的每个来电都有短信兜底。NAP 遗留风险从 SEO-STATUS 移除，仅剩 Yelp/Nextdoor 等次要目录待同步 469。

## 2026-07-26 — GBP first post
- Services added (pending review): Missed call text back / AI workflow automation / Google Business Profile setup (+ existing 2)
- Phone on live panel now shows (469) 425-4142; Profile Strength = "Complete Info"
- First GBP post published (Update type): missed-call pitch, $49/mo, no phone number in text (policy), Learn more → aimanjack.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp_post, image img/jack-teaching.jpg
- Cadence plan: 1–2 posts/month; next = Offer post once first-month promo decided

## 2026-07-26 — /missed-call-text-back/ conversion page
- New dedicated service page (was only a homepage section). Buyer-POV copy, no face photo.
- Conversion stack: live-demo CTA (call 469 → experience the product), SMS mockup bubble, interactive loss calculator (calls/wk × avg ticket × 50% × 4.3), price anchor table (receptionist $2k+ / answering service & big-brand software $250-400 / us $49), founding offer (first 10 Dallas businesses, $49 locked for life, free in-person install), 30-day REFUND-by-text guarantee, no contract.
- SEO: Service + FAQPage(6) + Breadcrumb schema, canonical, sitemap 0.9, homepage internal link from #missed-call panel, cross-links to /website/ /ai-workflow/ /business-services/. A2P opt-in disclosure box included.
- Honesty constraints: no fake testimonials/reviews (zero customers yet), no fake countdown; scarcity = real capacity (personal install, 10 founding spots).
- Next: point GBP "Missed call text back" service URL + future GBP posts at this page; Richardson/Plano location pages + salon/barber/auto industry pages later.
- GBP wiring to new page (2026-07-26): service "Missed call text back" now has Fixed price $49 + 290-char description (live, no review wait). Services have NO url field — price+description is the only lever. GBP post CTA link repointed from homepage to /missed-call-text-back/?utm... (post went back to Pending review after edit). Additional categories Marketing agency + Internet marketing service now live.
