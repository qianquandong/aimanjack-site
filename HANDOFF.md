# HANDOFF MASTER — aimanjack.com（2026-09-18，企业 AI 培训 + SEO Operating System v2）

给下一个接手的人（或下一个会话）。读完这一页就能接着干，不用翻聊天记录。
规格看 `PRD.md`（2026-09-18 版）；09-09 的 AI 前台 PRD 已作废，在 git 历史里。

> **这版比原 HANDOFF 多做一件事：** 除了工程交接，还把 SEO 变成一套持续运行的系统。覆盖 LearningSEO.io 的核心流程（Keyword Research → Competition Analysis → Content Optimization → Technical SEO → Link Building → Strategy / Goals / Measurement / Reporting / Audit），并补齐 Bing / Microsoft 搜索生态（Bing Webmaster Tools、IndexNow、Bing Places、AI Performance / Copilot、Site Scan、URL Inspection、Site Explorer、Backlinks、Keyword Research、Recommendations）。
>
> **状态标记**
> - `[DONE]`：源码或当前文档明确已经完成。
> - `[P1/P2/P3/P4]`：开发/内容优先级。
> - `[MANUAL]`：需要 Jack 在外部平台操作，代码无法代劳。
> - `[VERIFY]`：当前 HANDOFF 没有足够证据证明已完成，上线后必须核实。
> - `[LEGACY]`：源码保留，但不属于当前对外业务和 SEO 主题。

> **2026-09-18 晚：第二份 PRD（Frontend + SEO/GEO + Free Tools，"look like Notion, grow like Ahrefs"）已落地 MVP。** 先读 `docs/site-audit.md`（架构、与上午 PRD 的 11 处冲突及取舍）、`docs/implementation-report.md`（做了什么、已知局限、下一批 10 页）、`docs/analytics-events.md`。要点：CTA 改成 **Book a Workshop**；导航 = Training · Use Cases · Free Tools · Templates · Resources · About，每项都是独立页面；首页重建；新增英文资源库 `/tools/` `/use-cases/` `/workflows/` `/templates/`（内容是 `src/content/*.mjs` 里的数据对象，加一条 = 加一页）；`/tools/ai-readiness-assessment/` 上线；build 支持只有英文版的路由。下面第 1、1.1、5、8、9 节里关于导航、首页结构、CTA 文案、事件名的描述以这三份 docs 为准。

> **分支 `redesign-2026-09`（未合并、未上线）**：按设计稿整站改版 + 资源库中文化。改动清单见 `docs/redesign-2026-09.md`。production 分支不受影响。

## 0. 当前状态（一句话）

**P0 已完成并提交到本地 `production`（commit `3d692c9`），还没 push，还没 deploy。** 线上现在仍是 09-18 早上的旧版（首页 = 培训页 + AI 前台交叉推荐）。上线步骤见第 6 节，上线前检查清单见第 7 节。

## 1. 这个站是什么

AI Man Jack LLC 的官网，Jack Qian 在达拉斯的生意。**唯一对外定位：Corporate AI Training + Practical AI Workflow Training**，面向 Dallas / DFW 的企业团队（sales / operations / marketing / 管理层），中英文授课，上门或远程。全站唯一主转化：**Plan a Team Workshop → `/book/`**（30 分钟通话）。

AI 前台（AI receptionist）这条产品线**隐藏，不删除**：源码都在，路由标了 `indexable: false`，从主导航、内部链接、sitemap 和搜索索引中撤下；知道旧 URL 的人仍可直接访问，页面保持 200。

### 可索引页面（进 sitemap，共 20 个 URL = 10 EN + 10 ZH）

| 页面 | 路径 | 源文件 | 内容 |
|---|---|---|---|
| 首页 | `/` | `src/pages/home.mjs` | Hero → Proof strip → Outcomes ×4 → Formats ×3 → Teams ×4 → 五步方法 → 真实活动照片 → Jack → Resources → FAQ ×8 → CTA。只回答「是谁、教谁、凭什么」 |
| 培训 pillar | `/ai-training/` | `src/pages/training.mjs` | 主 money page。Hero（含 $1,500 价格锚）→ Proof → `#teams` 四团队各 4 条 workflow → `#curriculum` 五步课纲 → `#formats` 三种形式 → Google 评价 → 社区来历 → FAQ ×7 → Jack → CTA |
| 资源 | `/blog/` + 文章 | `src/pages/blog.mjs` `src/posts/*.mjs` | 导航里叫 Resources，URL 不改。现有 1 篇 published |
| 关于 | `/about/` | `src/pages/about.mjs` | Jack = AI trainer / workflow builder / Dallas AI 社区组织者 |
| 联系 | `/contact/` | `src/pages/contact.mjs` | 三张卡：Book（主）/ Email / Text |
| 预约 | `/book/` | `src/pages/book.mjs` | 自建预约，见第 3 节 |
| 法务 | `/privacy` `/sms-terms` `/terms` | `src/pages/legal.mjs` | 前两个英文原文是 A2P 审核页，一字不动 |

### Legacy 路由（200 + `noindex, follow`，不进 sitemap，全站零内链）

`/ai-receptionist/` · `/pricing/` · `/industries/` + 5 个行业页 · `/integrations/` · `/tools/missed-call-calculator/` · `/case-studies/` + 2 个案例 · `/blog/how-much-do-missed-calls-cost/`

第一阶段不 301，先观察 GSC 和外链，之后再定 301 / 留着 / 删。**不要在 robots.txt 里 Disallow 它们**：爬虫得先能访问页面，才读得到 noindex。

### PRD 里还没做的（按优先级）

| 阶段 | 内容 | 备注 |
|---|---|---|
| P1 | `/ai-training-dallas/` `/ai-workflow-training/` `/ai-workshops/` | 新内容，不是清理。Dallas 页必须真 local（活动、照片、场地、onsite FAQ），不能是 pillar 换词 |
| P2 | `/ai-training/{sales,operations,marketing}-teams/` `/ai-training/leaders/` | 做完后 header 的 Teams 和首页 team 卡片从 `#teams` 改指这些页 |
| P3 | 训练案例：Dallas Multi-Agent Workshop、37-Person Hackathon | 做完后把 Case Studies 加回 header（现在故意没放，见第 8 节） |
| P4 | 内容集群、三个免费工具、外链、周边城市 | 每篇必须含一样 AI SEO 站生成不出来的真东西，否则不发 |

每上一个新页，同步加进 `scripts/health.mjs` 的 `EN` 数组和 footer。

### 1.1 SEO 页面职责 / Keyword Ownership（新增，防止 cannibalization）

每个可索引 URL 只承担一个主意图。不要为了覆盖同义词再复制页面。

| URL | Primary intent | Secondary topics | 主要转化 |
|---|---|---|---|
| `/` | Corporate AI training Dallas / brand | practical AI training, AI Man Jack, Dallas teams | Plan a Team Workshop |
| `/ai-training/` | corporate AI training / AI training for employees | workplace AI training, business AI training, employee AI skills | Plan a Team Workshop |
| `/ai-training-dallas/` `[P1]` | AI training Dallas | onsite AI workshop DFW, Dallas corporate AI training | Plan a Team Workshop |
| `/ai-workflow-training/` `[P1]` | AI workflow training | workflow design, human review, AI adoption | Plan a Team Workshop |
| `/ai-workshops/` `[P1]` | corporate AI workshop | AI workshop agenda, hands-on AI workshop | Plan a Team Workshop |
| `/ai-training/sales-teams/` `[P2]` | AI training for sales teams | account research, meeting prep, follow-up workflows | Team workshop |
| `/ai-training/operations-teams/` `[P2]` | AI training for operations teams | reporting, process docs, meeting-to-action | Team workshop |
| `/ai-training/marketing-teams/` `[P2]` | AI training for marketing teams | research, briefs, repurposing, analysis | Team workshop |
| `/ai-training/leaders/` `[P2]` | AI training for managers / leaders | adoption, governance, prioritization, measurement | Team workshop |
| `/blog/<slug>/` | informational query | one narrowly defined question | relevant money page |

**已知风险：`/` 和 `/ai-training-dallas/` 抢同一个词。** 首页 title 现在是 `Corporate AI Training in Dallas`（PRD §17 定的），P1 的 Dallas 页主词是 `AI training Dallas`，两页都带 Dallas + AI training。Dallas 页上线那天要同时决定：要么首页 title 让出 Dallas（改成品牌 + corporate AI training），要么 Dallas 页不做。上线后在 GSC 按 query 看这两个 URL 有没有轮流出现，有就是在互抢。

**同义词处理原则**：`corporate AI training`、`business AI training`、`enterprise AI training`、`employee AI training` 可以在同一 pillar 里自然覆盖；不要分别建 4 个高度相似 URL。

### 1.2 100 organic/day 的组合目标

约 `3,000 organic visits/month` 作为阶段性 portfolio target，不是保证。

- Local + commercial：600–900 / month
- Corporate AI training long-tail：700–1,000 / month
- Workflow / ChatGPT / Claude / Copilot educational：700–1,000 / month
- Case studies / templates / tools：500–800 / month
- Brand / community：200–400 / month

任何内容计划必须说明它属于哪一桶、服务哪个主页面、如何转化；不接受“为了更新频率而更新”。


## 2. 怎么改页面

站点是**生成的**：`src/` 是源，根目录 HTML、`sitemap.xml`、`llms.txt` 都是产物，两者都提交。**不要手改产物，下次 build 会盖掉。**

```bash
node scripts/build.mjs          # src/ → 全部 HTML + sitemap.xml + llms.txt
node --test tests/              # 9 个测试，必须全过
```

| 文件 | 管什么 |
|---|---|
| `src/config.mjs` | 所有事实常量：电话、邮箱、`BOOK_URL`、GA4 ID、**`FEATURES`**（定位开关，纯记录用）、**`PROOF`**（5 场 / 50+ / 37 人 / 10 条 / 5.0）、**`TRAINING`**（半天 $1,500 起、10 人以内）、sameAs 列表。`PRICING` 只给 legacy 页用 |
| `src/i18n.mjs` | 页头页脚、按钮、粘底条的中英文案。`demo` 块和 `cta.call` 等只有 legacy 页在读 |
| `src/layout.mjs` | 页面外壳：head / meta / hreflang / OG、header、footer、手机粘底 CTA、内联 JS（GA4 事件 + 粘底条显隐）。导出 `planBtn` `emailBtn` `textLink` `pageOf` |
| `src/schema.mjs` | **JSON-LD 唯一来源**：`business(lang, {full})` `person()` `website()` `trainingOffer()` `faqPage()` `AREA` `BUSINESS_REF`。三条 Google 评价原文也在这 |
| `src/llms.mjs` | `llms.txt` 的模板，build 时从 config 生成。改事实改 config，不要改产物 |
| `src/components.mjs` | 可复用块：`pageHero` `finalCta` `faq` `breadcrumb` `founder`（训练版）；其余（PhoneDemoCard、transcript、pricingCards、`callBtn`、`SERVICE_LD`…）只有 legacy 页在用 |
| `src/pages/*.mjs` | 每个文件一组页面，`en` 和 `zh` 并排写。路由对象：`{ path, priority?, changefreq?, indexable?, en, zh }` |
| `style.css` | 唯一样式表。源码里 `?v=0` 是占位，deploy.sh 在 staging 时按压缩后文件的 md5 改写成 8 位 hash |

**隐藏一个路由**：在它的路由对象上加 `indexable: false`，一处生效（noindex + 不进 sitemap，中英文一起）。逻辑在 `layout.mjs` 的 `pageOf()`，build 和 tests 都走它。

**博客**：`src/posts/<slug>.mjs`，中英同文件。`status: 'draft'` 不构建；`'published'` 构建 + 进 sitemap + 进索引页；**`'hidden'` 构建但 noindex、不进 sitemap 和索引页**（给旧文章留 URL 用）。新文章：`node scripts/blog-new.mjs <slug>` → 填 → `node scripts/blog-check.mjs <slug>`（0 FAIL）→ Jack 批 → 改 published → build → deploy。文章的 `pillar` 和 `related` 只能指向可索引页面。注意：文章从 published 改回 draft 后，build 不会删旧产物，要手动 `rm -rf blog/<slug> zh/blog/<slug>`。

**改评价数 / 活动数 / 价格**：只改 `src/config.mjs` 的 `PROOF` / `TRAINING`，重建。schema、llms.txt、首页 proof strip、FAQ 里的价格都跟着变。培训页 body 里的「5 talks / 1 hackathon / 10 Google reviews」和评价原文是手写的，要同步改 `training.mjs`。

## 3. 预约系统（没动过，仍然是好资产）

`BOOK_URL = '/book/'`。页面在 `src/pages/book.mjs`，API 是 Pages Function `functions/v1/[[route]].js`（同域 `/v1/*`，随 deploy.sh 一起上线），数据在 Supabase（项目 aimanjack-crm，schema `booking`；建表和种子 `db/schema.sql`，用 `node scripts/supabase-sql.mjs db/schema.sql` 应用）。

- 表单字段：姓名、手机、邮箱（选填）、公司（选填）、**团队人数 + 想用 AI 做什么（选填，09-18 新加）**。后两项用 ` — ` 拼进 `note`（API 上限 500 字符），后端没改。
- Supabase 里 service 的名字仍是 `demo-call` / "30-minute demo call with Jack"，只是内部标识，访客看不到，没改。
- 改可约时间 = 改 `availability_rules` 表（周一到周五 19:00–21:00、周六 10:00–18:00，中部时间）；放假用 `blocks` 表。
- 看预约：`GET /v1/bookings?business=aimanjack`，带 `Authorization: Bearer <ADMIN_TOKEN>`（令牌在本机 `.dev.vars`，Pages secret 已设 production + preview）。还需要 Pages secret `SB_SECRET_KEY`。
- 确认邮件走 Cloudflare Email Sending REST API，需要 secret `CF_EMAIL_TOKEN`；没设 = 不发邮件，预约照常成功。
- 改完 API 跑 `node scripts/booking-smoke.mjs <base-url> <token>`。

## 4. 硬规矩

- **禁词**：任何可索引页面（正文 + JSON-LD）不得出现 `AI receptionist` / `Call our AI demo` / `missed call calculator` / `$199` / `$299` / `$599` / `appointment businesses` / `AI 前台` / `拨打 AI 演示`。例外只有 legacy noindex 页和三个法务页。tests 和 health 都会扫，扫到就 FAIL，**FAIL 不得 deploy**。
- 电话有两个，都对，别「统一」：(469) 425-4142 是短信 / 主号，A2P 要求全站 `sms:` 用它；(469) 517-2968 是 AI 演示线，现在只有 legacy 页还在用。
- footer 最下面那段 SMS 合规文字（含 "when we miss your call"）是 A2P 要求，不能删。禁词扫描特意跳过 footer。
- `/privacy` 和 `/sms-terms` 英文正文是 A2P 审核页，一字不动。
- 不编数字。`PROOF` 里的数只有 Jack 核实后才能改，绝不为了营销自动增长。不编 ROI。
- 全站只用一套方法表述：**五步课纲**（选任务 → 给背景 → 从 chat 到工作流 → 核对 → 护栏）。首页是短版，培训页是完整版，博客那篇也是这五步。新页面不要再发明四步、六步。
- 中文文案不从英文直译，按中文语感重写；术语保留英文（AI、prompt、agent、workflow 可写「工作流」）。
- `.deployignore` 把 `src/`、`scripts/`、`*.md`、`db/`、`.planning` 等挡在静态产物之外，内部文档不会上线。`functions/` 不进静态目录，由 wrangler 从仓库根单独打包成 Pages Function。

### 4.1 Technical SEO 非谈判项

每个**可索引页面**必须同时满足：

- HTTP 200；
- exactly one H1；
- unique `<title>`；
- unique meta description；
- self-referencing canonical；
- EN/ZH/x-default hreflang 互相闭环；
- `index,follow`；
- 在 `sitemap.xml`；
- 至少一条 crawlable `<a href>` 内链可到达；
- JSON-LD 与页面可见内容一致；
- OG title / description / image 有效；
- 重要正文在构建后的 HTML 里可直接读，不依赖 client JS；
- 图片有 `width` / `height`，内容图有描述性 alt；
- 页面没有孤儿化；
- 不产生参数/重复 URL 的索引版本；
- 旧 URL 迁移优先 301 到**最接近的等价页**；无等价内容时不要全部乱跳首页；
- sitemap 只放 canonical + indexable URL，并维护准确 `lastmod`。

**哪些有自动检查在守**：200 / H1 / title / description / self canonical / hreflang / index,follow / sitemap parity / JSON-LD 可解析 / OG image / 禁词 → `tests/site.test.mjs` + `scripts/health.mjs`；**title 和 description 全站唯一、无孤儿页、`<img>` 有 width/height → `tests/site.test.mjs`（09-18 加）**；`lastmod` 准确 → `scripts/build.mjs`（页面 HTML 没变就沿用旧日期，09-18 改；之前是每次 build 全刷成今天）。其余几条（JSON-LD 与可见内容一致、alt 是否有描述性、参数 URL）靠人审，见 9.1 D。

Legacy `noindex,follow` 页：允许抓取、不进 sitemap、全站零内链、不用 robots.txt Disallow；上线后分别在 GSC 和 Bing URL Inspection 验证 noindex 被识别。

### 4.2 Content / On-page 标准

每个新 SEO 页面发布前必须写清：Primary query / intent、目标用户、当前 SERP 在回答什么、我们有什么独有证据、要链接到哪个 money page、成功指标是什么。

默认结构：

```text
H1
↓
40–80 words direct answer / proposition
↓
Proof / real example
↓
Main explanation
↓
Step-by-step workflow / framework
↓
Failure modes / limits / human review
↓
Relevant case / photo / screenshot / template
↓
FAQ（只有真问题才写）
↓
Relevant next step / Plan a Team Workshop
```

每篇重要页面至少包含一个别人无法直接复制的元素：真实 workshop observation、participant question、event photo、workflow screenshot、prompt + verified output、before/after process、failure case、Jack 自己跑过的数据或 template。没有就留 draft。


## 5. 追踪：GA4 + Google Search Console + Bing Webmaster Tools + AI Search

### 5.1 Google Search Console `[DONE/VERIFY after deploy]`

改版正式上线后固定做：sitemap 重新提交；URL Inspection `/`、`/ai-training/` 和每个新 P1/P2 money page；确认 Google-selected canonical；确认 legacy 页识别为 noindex；Performance 每周看 query/page/impressions/clicks/CTR/device，并单独维护 non-brand queries。新页面上线 14/28/56 天分别复盘一次。

### 5.2 Bing Webmaster Tools `[MANUAL + P0 after deploy]`

原 HANDOFF 的 Bing 缺口在这里。robots 放行 Bingbot、生产 deploy ping IndexNow 是好基础，但还需要真正接上 Bing Webmaster Tools。

**这一节全部要 Jack 本人登录 Microsoft 账号操作，Claude 不代输密码、不代建账号。** Jack 登录好之后，Claude 可以用浏览器工具帮着点 sitemap 提交、URL Inspection、Site Scan 和读报表。

上线后：
1. 添加并验证 `aimanjack.com`（可从 GSC import）；
2. 提交 sitemap；
3. 对 `/`、`/ai-training/` 和新 money pages 跑 URL Inspection；
4. 跑 Site Scan；
5. Site Explorer 看 Indexed / Error / Warning / Excluded / NOINDEX / Redirecting / Canonical source；
6. 查看 Recommendations / SEO Reports；
7. Backlinks 建 baseline；
8. 用 Bing Keyword Research 验证 Bing 自己的 query demand；
9. Search Performance 每周单独记录 Bing impressions / clicks / CTR / queries / pages；Bing 已宣布 Search Performance 支持 16 个月历史数据，月度/季度趋势分析用它看长期变化；
10. 有数据后打开 AI Performance，记录 Copilot / Bing AI citation。

### 5.3 IndexNow `[DONE in deploy flow, VERIFY in Bing]`

production `sh deploy.sh` 会把 sitemap 里全部 URL POST 给 `api.indexnow.org`，preview 不 ping。密钥文件在仓库根：`f613b8f49a0f40cdb8a3bf9c265efa53.txt`（deploy.sh 用的这把）和 `aeb754674ed11648ffe1d77105b2c689.txt`，内容必须等于文件名。注意 deploy.sh 只推 sitemap 里的 URL，所以 **被 noindex / 删除 / 301 的旧 URL 不会被通知**；这次 legacy 页转 noindex 要靠 Bing 自己重爬发现，或在 BWT 里手动提交。上线后必须在 Bing Webmaster Tools → IndexNow / IndexNow Insights 验证 submitted / crawled / indexed / redirects / noindex / robots-disallowed / deadlink 状态。

发布新 URL、重要更新、301/删除都要通知。IndexNow 解决 discovery/freshness，不保证 index 或 ranking。

### 5.4 Bing Sitemap `[MANUAL VERIFY]`

IndexNow 和 sitemap 两个都要留：IndexNow 管变化速度，sitemap 管完整 coverage。每周确认 status、last read、processing errors、URL 数与 repo build 一致。

### 5.5 Bing AI Performance / Copilot `[MANUAL]`

AI Performance 单独记录 AI citations、cited URLs、citation trend、top cited pages。不要把 AI visibility 等同于 web clicks。优先观察 `/ai-training/`、P1 money pages、case studies、About/entity pages。

### 5.6 Microsoft Clarity `[P1 optional]`

如接入，连接 GA4；重点看 homepage / `/ai-training/` / `/book/` 的 scroll depth、dead clicks、rage clicks、quick backs、CTA 前行为和 mobile friction。大改后两周复盘一次。

### 5.7 GA4 `[DONE]`

GA4 `G-H7EF9HVN02`，标签在 `load` 后异步加载，只在 `aimanjack.com` 域名下发。参数：`cta_position` `page` `language` `device`。

| 事件 | 触发 |
|---|---|
| `workshop_cta_click` | 任何 Plan a Team Workshop 按钮（header / hero / format 卡 / final / sticky） |
| `booking_start` | `/book/` 页面浏览；联系页的 Book 卡 |
| `booking_complete` / `booking_reschedule` / `booking_cancel` | 预约提交 / 改期 / 取消 |
| `training_page_view` | 首页和 `/ai-training/` 浏览 |
| `training_page_click` | 首页 hero 的 See How Training Works |
| `email_training_click` / `sms_training_click` | 邮件 / 短信链接 |
| `blog_view` `case_study_view` `language_change` | 沿用 |

**待 Jack**：GA4 Admin → Events 把 `workshop_cta_click` 和 `booking_complete` 星标成 Key event；`demo_call_click` / `hero_call_click` 取消星标。PRD §74 里的 `team_page_view` `resource_to_training_click` `realagentusecases_outbound` 等 P1/P2 页面上线时再加。

## 6. 上线

```bash
cd /Users/joseesp/aimanjack-site
node scripts/build.mjs && node --test tests/     # 先生成，测试必须 9/9
git add -A && git commit -m "..."
git push origin production                       # deploy.sh 不 push，自己推
sh deploy.sh --preview                           # 可选：当前分支 → <branch>.aimanjack.pages.dev，不 ping IndexNow
sh deploy.sh                                     # 在 production 分支上跑 = 正式上线 + IndexNow
```

坑：wrangler 按**当前 git 分支名**决定 prod 还是 preview，正式上线必须人在 `production` 分支。deploy.sh 不检查工作区是否干净。回退 = `git revert <sha>` → 重建 → push → deploy.sh。

**上线后固定动作**：
1. `curl -s -A "Mozilla/5.0" https://aimanjack.com/ | grep -o '<title>[^<]*'` 确认是新 title（Cloudflare 会对默认 UA 返 403，务必带浏览器 UA）。
2. `node scripts/health.mjs --baseline` 重采基线 → commit → push。**这次是整站换定位，不重采的话明早 daily-health 会报一整页 drift。**
3. GSC：对 `/`、`/ai-training/` Request Indexing；重新提交 sitemap。
4. `[MANUAL]` Bing Webmaster Tools：确认站点已验证；提交/重新提交 sitemap；URL Inspection `/` + `/ai-training/`。
5. `[VERIFY]` Bing Webmaster Tools → IndexNow：确认 production deploy URL 已被接收。
6. `[MANUAL]` Bing Webmaster Tools → Site Scan：改版后跑一次 full scan。
7. `[MANUAL]` Bing Places / Bing for Business：核对公司名、网站、电话、服务区域、类别、照片，与网站/GBP 一致。
8. `[MANUAL]` Bing AI Performance：有数据时记录 baseline。

## 7. 本次上线前检查清单（P0）

- [x] `node scripts/build.mjs` 通过，20 个可索引 URL
- [x] `node --test tests/` 9/9
- [x] `blog-check` 培训那篇 0 FAIL
- [x] 本地预览看过：桌面 + 手机、中英文，无横向溢出，粘底条只在 hero CTA 滚出后出现，console 无报错
- [ ] Jack 过目首页和 `/ai-training/` 的文案（尤其中文）
- [ ] Jack 确认第 8 节里的几个取舍
- [ ] push + `sh deploy.sh`
- [ ] 上线后固定动作 1–3（第 6 节，Claude 可做 1–2，3 需要 Jack 的 GSC 登录）
- [ ] Bing Webmaster Tools 验证 + sitemap + URL Inspection
- [ ] IndexNow 在 BWT 内确认收到本次 production 更新
- [ ] Bing Site Scan 首次扫描无 P0 blocker
- [ ] Bing Places / Bing for Business 基本信息核对
- [ ] GSC + BWT 两边都确认 legacy `noindex` 策略符合预期

本地预览：`python3 -m http.server 8765 -d /Users/joseesp/aimanjack-site`，开 `http://localhost:8765/`（`/book/` 的 API 在本地不通，属正常）。

## 8. 这次做的取舍（Jack 没逐条批过，有异议直接改）

1. **Case Studies 暂时不在 header / footer**。PRD §9 的导航里有它，但现有两个案例都是 AI 前台，已 noindex；训练案例是 P3。放一个空页不如不放。P3 做完加回来。
2. **Workshops → `/ai-training/#formats`，Teams → `/ai-training/#teams`**。对应的独立页是 P1 / P2。
3. **footer 三栏 + 地区**，没有 PRD §14 的 Teams 栏：四个链接指同一个锚点没意义，team page 上线后再加。
4. **删了培训页 hero 里的「Next open session: Clinic AI Front Desk Workshop, Dallas, Sept 24」**。核实不了真假，而且是前台方向。如果真有这场公开课，加回 `training.mjs` 的 `trust-strip`。
5. **About 页写 Jack「by day a business planner at a Dallas semiconductor company」**，没点名公司。旧版写的是 engineer，已过时。
6. **首页 Resources 区只有 1 篇文章**（PRD 要 3 篇）。现在只有一篇 published，不编。
7. **全局拨号弹窗、二维码、复制号码的代码直接删了**（`src/qr-demo.svg` 也删了），没搬进 legacy 源。legacy 页上的 Call 按钮现在是普通 `tel:` 链接，桌面端不再弹窗。要恢复看 git 历史 `3d692c9^`。
8. **CSS `?v=` 没按 PRD §85–86 改 build**：deploy.sh 早就按 md5 改写了，线上一直是 hash，那个 bug 不存在。
9. **`_redirects`**：`/resources/*` → `/blog/`，`/community/*` 和 `/ai-workflow/` → `/ai-training/`；`/website/*` `/business-services/` `/missed-call-text-back/` `/products/` 没有对应新页，仍指首页。Cloudflare Pages 的 `_redirects` 不支持 410。
10. **schema 里没写 `priceRange`**：唯一公开的价格是半天 $1,500 起，已经在 Offer 里，不再另写一个范围。

## 9. 每天怎么转

- 定时任务 **`aimanjack-daily-health`**（本机每天 7:00）跑 `node scripts/health.mjs`，提示词 09-18 已按新定位改过：legacy 页 200 + noindex 算正常；本地 `v=0` 和线上 hash 不同算正常；周六审计 `/` 和 `/ai-training/`；GEO 探测词换成 "corporate AI training Dallas" 等三条。
- `health.mjs` 现在查：12 个页面（6 EN + 6 ZH）200、每页 1 个 H1、title / description / self canonical / hreflang / index,follow、JSON-LD 含 ProfessionalService、≥1 个 `/book/` 链接、CTA 标签和协议一致、**禁词扫描**、7 个 legacy 路由 200 + noindex 且不在 sitemap、`_redirects` 每条规则成立、robots 放行、llms.txt 含 "corporate AI training" + "$1,500" 且不含 receptionist；再跟 `scripts/seo-baseline.json` 比 drift。
- 博客流水线三个任务（周一选题 / 周二周四写稿上线 / 周日复盘）还在跑，规则在 Agent OS 仓库 `workflows/seo-blog.md`。**待办：那份 workflow 和 backlog 里还有 AI 前台方向的选题（R11 那条线），需要清掉，否则周二的任务会继续写 receptionist 文章，然后被禁词测试拦下。**
- `HEALTH-CHECK.md` 里的漏斗口径还是旧的（`cta_click`、`/products/`），读的时候把 `cta_click` 当 `workshop_cta_click`。值得重写，没排进 P0。

## 9.1 SEO Operating System（LearningSEO 框架补全）

原版 HANDOFF 的强项是部署、技术 SEO 和日检；要把自然流做到 100/day，还必须运行下面 7 个循环。

### A. Keyword Research（每月一次 + 新 cluster 前）

输入：GSC、Bing Search Performance、Bing Keyword Research、Google/Bing SERP、sales/community 真实问题、RealAgentUseCases、竞争对手排名词、workshop participant questions。

每个候选 query 记录：`query / intent / funnel / location / department / tool / existing URL / target URL / business relevance / proof / priority`。不要只看 search volume/KD；本地高客单 B2B 的低 volume 高 intent 词可以更值钱。

### B. Competition Analysis（季度深审 + 每月轻审）

SEO competitor ≠ business competitor。核心词至少覆盖 `corporate AI training`、`AI training Dallas`、`AI training for employees`、`AI workshop Dallas`、`AI workflow training`、各 department training。

对 SERP 前 10 记录：domain、page type、title/H1 angle、content depth、proof、local proof、pricing、author/entity、backlinks、SERP features、AI citations、我们能补的独有信息。季度做 keyword gap + backlink gap。

### C. Content Optimization（每周）

- impressions 上升 CTR 低 → title/snippet/intent；
- position 8–20 → 内容、proof、内链、外链；
- 有 clicks 无 conversion → CTA/offer/audience；
- 0 impression → indexing + targeting + quality；
- Bing/Google 表现不同 → 分开诊断；
- AI citation 有但 classic click 少 → 继续记录价值，同时增强品牌/CTA/entity。

### D. Technical SEO Audit（每月 + 每次大改）

自动 health 外，手动审 GSC indexing、Bing Site Explorer、Bing Site Scan、两边 URL Inspection 抽样、canonical/redirects/404、sitemap parity、hreflang、schema、CWV/PSI、orphan pages、broken links、images/mobile、legacy noindex 是否重新进入内链。

### E. Link Building / Digital PR（每周至少一个动作）

优先真实关系：Dallas AI 活动合作方/场地方/speaker/community partner；再做 local directories/chambers、linkable assets、podcast/newsletter、unlinked mentions、competitor backlink gap、broken link replacement。

每月记录 new/lost referring domains、links to money pages/resources、referral visits/leads。相关性和真实编辑理由优先于 DR；不买 PBN/垃圾 guest posts。

### F. Local SEO（Google + Bing）

每月核对 GBP、Bing Places/Bing for Business、网站 business facts：company name、website、phone、service area、categories、photos、reviews。Google/Bing 信息必须一致。Bing Places 主描述同步企业 AI 培训定位，不留 receptionist 主定位。

### G. AI Search / GEO / AEO

规则：不写“给 LLM 看”的假文风；每页单一主题；核心事实明确；entity 一致；用真实证据；重要 claim 可独立验证；正常 crawl/index；不做 prompt injection/AI manipulation；`llms.txt` 是辅助，不是 ranking requirement。

KPI：Bing AI Performance citations、AI referral sessions、cited URLs、brand/entity mentions、AI referral conversion；如启用 Clarity，再看其 AI visibility。

## 9.2 Bing / Microsoft Search 全量执行清单

### Bing Webmaster Tools — P0
- [ ] Site verified
- [ ] GSC import checked/used if convenient
- [ ] Sitemap submitted
- [ ] `/` URL inspected
- [ ] `/ai-training/` URL inspected
- [ ] P1 pages inspected after launch
- [ ] Site Scan completed
- [ ] Site Explorer reviewed
- [ ] Recommendations / SEO Reports reviewed
- [ ] Backlinks baseline noted
- [ ] Keyword Research used for primary cluster
- [ ] Search Performance baseline captured
- [ ] IndexNow dashboard verified
- [ ] AI Performance baseline captured when data appears

### IndexNow — P0
- [x] Production deploy triggers IndexNow per current HANDOFF
- [ ] Verify production submission in BWT
- [x] Key files reachable and self-consistent (verified 2026-09-18 via curl; re-verify in BWT)
- [ ] New/updated/removed/redirect URLs notify correctly
- [ ] Monitor IndexNow Insights issues

### Bing crawler / indexing — P1
- [x] `Bingbot Allow: /`
- [ ] Robots Tester check after deploy
- [ ] Site Explorer: NOINDEX legacy pages expected
- [ ] No unexpected Excluded/Error spike
- [ ] URL Inspection Live URL matches generated HTML
- [ ] Crawl Control stays default unless crawl-load evidence says otherwise

### Bing AI / Copilot content controls

对希望进入 Search/Copilot citation 的主页面：不要加 `NOARCHIVE`、`NOCACHE`、`NOSNIPPET`，也不要用 `data-nosnippet` 包住核心证据。Legacy receptionist 页继续 `noindex`。

### Bing Places / Bing for Business — P0/P1
- [ ] Claim / verify AI Man Jack
- [ ] Name / website / main contact consistent
- [ ] Dallas/DFW service area correct
- [ ] description = corporate AI training / workflows
- [ ] no receptionist positioning in primary listing
- [ ] categories verified from actual choices
- [ ] real photos added
- [ ] quarterly listing audit

## 9.3 SEO Reporting

### Weekly scorecard
`Google clicks/impressions · Bing clicks/impressions · non-brand clicks · Dallas/DFW queries · Top10/Top20 count · indexed coverage · workshop CTA clicks · booking starts/completes · organic leads · Bing AI citations · AI referrals · new referring domains`

### Monthly business view
`organic sessions · qualified leads · booked calls · organic→booking conversion · top landing pages by lead · top queries by intent · content→money-page clicks · local contribution · Bing contribution · AI search contribution`

North star 不是 pageviews，而是：`organic discovery → relevant training page → proof → workshop CTA → booking`。

## 9.4 Troubleshooting Playbook

页面不排名：按 `indexable → indexed Google → indexed Bing → canonical → intent → page type → title/H1 → unique evidence → internal links → external authority → local relevance → competitor changes` 排查。

流量掉：先拆 Google/Bing、brand/non-brand、sitewide/directory、click/impression、desktop/mobile、country，再查 deploy/robots/noindex/canonical/redirect/sitemap/server/algorithm/SERP changes。

CTR 低先查 intent/title/snippet/SERP/brand/AI answer，不要第一反应重写正文。

有流量没 lead：查 audience、CTA timing、proof、offer clarity、pricing expectation、mobile UX、booking friction；如已接 Clarity，看 recordings/heatmaps。

## 9.5 内容生产 SOP

`query/SERP/competitor data → intent+target URL → cannibalization check → proprietary proof → outline → angle review → draft → fact review → internal links → metadata/schema → tests → human review → publish → IndexNow+sitemap → GSC/Bing monitoring → 14/28/56-day review`。

SEO Agent 不得自动批量城市页、写 receptionist 方向、只凭 KD 选题、改写竞品后发布、制造数据、未 review 改 money-page positioning。

## 10. 待 Jack

1. 过目文案 → 说一声「上线」。
2. GA4 Key event 换成 `workshop_cta_click` + `booking_complete`（第 5 节）。
3. 上线后 GSC Request Indexing（第 6 节）。
4. Agent OS 里博客 backlog 清掉 receptionist 选题（第 9 节），或者告诉下一个会话去清。
5. 9 月 24 日那场公开课到底有没有（第 8 节第 4 条）。
6. Google 评价继续攒。数变了改 `src/config.mjs` 的 `PROOF` 和 `training.mjs` 里手写的那几处。
7. 演示线、车行 SMS agent、Twilio、A2P、Supabase booking 这些基建都还在跑，没动。演示线要不要停、号码要不要留，是另一个决定。
8. `[MANUAL]` Bing Webmaster Tools：完成/确认验证、sitemap、URL Inspection、Site Scan、IndexNow dashboard。
9. `[MANUAL]` Bing Places / Bing for Business：claim/verify 并把定位改成 corporate AI training。
10. `[MANUAL]` 建统一 SEO weekly scorecard：Google + Bing + AI citations + bookings。
11. `[P1]` 第一次 keyword map + competitor gap，作为 P1 三个新页面 brief 输入。
12. `[P1]` 建 link prospect list（Dallas AI/community/event/local business + competitor backlink gap）。
13. `[P1]` 如接 Microsoft Clarity，连接 GA4 并给首页 / training / book 建 baseline。

## 11. 相关文件

| 文件 | 用途 |
|---|---|
| `PRD.md` | 2026-09-18 定位收口 PRD（本次改版的规格，P0–P4） |
| `HEALTH-CHECK.md` | 漏斗口径、熔断阈值、接线记录（口径待更新） |
| `BOOKING-PLAN.md` | 预约系统 W1–W3 计划 |
| `SEO-STATUS.md` | 7 月以来的 SEO 历史流水 |
| `README.md` | 构建、部署、日检一句话 |
| `~/.claude/scheduled-tasks/aimanjack-daily-health/SKILL.md` | 日检任务的提示词 |

## 12. LearningSEO Coverage Matrix

| LearningSEO area | 原版覆盖 | 这版补强 | 下一步 |
|---|---:|---|---|
| Keyword Research | 弱 | 月度流程 + query map + Bing data | P1 |
| Competition Analysis | 缺 | 季度/月度 competitor gap | P1 |
| Content Optimization | 中 | intent / unique evidence / 14-28-56 review | ongoing |
| Technical SEO | 强 | Bing validation + monthly audit | ongoing |
| Link Building | 弱 | local / digital PR / KPI | weekly |
| SEO Strategy / Goals | 中强 | 100/day portfolio + funnel | monthly |
| Measurement / Reporting | 中 | Google + Bing + AI + conversion | weekly/monthly |
| SEO Audit | 中 | monthly manual + Bing Site Scan | monthly |
| Local SEO | 弱 | Google + Bing Places + reviews + local links | monthly |
| AI Search | 中 | Bing AI Performance + AI referral KPI | weekly/monthly |
| Other Search Engines | 很弱 | Bing ecosystem 基本补齐 | P0/P1 |
| Automation | 强 | 保留 health/build/deploy + agent guardrails | ongoing |
| Testing/Troubleshooting | 中强 | ranking/traffic/CTR/conversion playbooks | ongoing |

**结论**：原版是很好的 P0 工程 handoff；这版才接近完整 SEO operations handoff。

## 13. Bing / Copilot 特别技术点

Microsoft 当前 Webmaster Guidelines 对 Search / Copilot / grounding 使用同一套 crawl/index/rank 基础。对本项目最重要：

1. IndexNow + sitemap 都保留；
2. 重要 URL 有 crawlable internal links；
3. sitemap 只列 canonical URL；
4. deleted/redirected URL 及时 sitemap + IndexNow；
5. robots 控 crawl，不等于 noindex；
6. legacy 用 NOINDEX；
7. 主页面避免 NOSNIPPET / NOARCHIVE / NOCACHE 等会限制 Bing/Copilot 摘要/grounding 的指令；
8. title/meta/headings/semantic HTML 清晰；
9. structured data = visible content；
10. entity naming 一致：AI Man Jack LLC / Jack Qian / Dallas–Fort Worth / corporate AI training；
11. 每个 URL 聚焦一个主题；
12. 不做 keyword stuffing、scaled thin AI content、misleading schema、prompt injection / AI manipulation。

## 14. Reference Basis

这版新增流程基于：

### LearningSEO.io
- Keyword Research
- Competition Analysis
- Content Optimization
- Technical SEO
- Link Building
- Strategy / Goals / Measurement / Reporting / Audit
- Local SEO
- SEO in Other Search Engines
- AI Search / GEO / AEO / LLMO
- Automation / Testing / Troubleshooting

### Microsoft Bing / Webmaster
- Bing Webmaster Guidelines
- Search Performance
- URL Inspection
- Site Explorer
- Site Scan
- Recommendations / SEO Reports
- Backlinks / Keyword Research
- Sitemaps
- IndexNow / IndexNow Insights
- AI Performance
- Copilot in Bing Webmaster Tools
- Bing Places / Bing for Business
- Crawl Control
- Microsoft Clarity（optional）

如果官方平台 UI/文档变化，以当时 Bing Webmaster Tools / GSC 实际界面为准。

## 15. Final Definition of Done

### Engineering
- [ ] Build/tests/health pass
- [ ] Production deploy clean + rollback path known
- [ ] no receptionist signal on indexable pages
- [ ] sitemap parity correct
- [ ] legacy noindex correct

### Google
- [ ] GSC sitemap processed
- [ ] main pages inspected
- [ ] canonical/indexing correct
- [ ] performance baseline saved

### Bing
- [ ] BWT verified
- [ ] sitemap processed
- [ ] IndexNow verified
- [ ] main pages URL inspected
- [ ] Site Scan run
- [ ] Site Explorer reviewed
- [ ] Search Performance baseline saved
- [ ] AI Performance baseline saved when available
- [ ] Bing Places aligned

### Content / Authority / Local
- [ ] P1 keyword research done
- [ ] competitor SERP analysis done
- [ ] every P1 page has proprietary proof
- [ ] internal linking map done
- [ ] 14/28/56 review dates set
- [ ] GBP + Bing Places current
- [ ] first 20 link prospects logged
- [ ] first linkable asset planned

### Measurement
- [ ] GA4 key events correct
- [ ] Google baseline
- [ ] Bing baseline
- [ ] AI citation/referral baseline
- [ ] booking conversion baseline
- [ ] weekly scorecard exists

到这里后，SEO 进入循环：`research → publish → earn authority → measure → learn → improve`。

## 16. 最终 North Star

网站必须让人和搜索系统都稳定理解：

> **AI Man Jack helps teams learn and apply AI to real work.**

并且能验证：

```text
Who: Jack Qian / AI Man Jack LLC
Where: Dallas–Fort Worth + remote
What: Corporate AI Training + Practical AI Workflow Training
Proof: real workshops + real attendees + real hackathon + real reviews + real workflows
Next step: Plan a Team Workshop
```

只要页面、schema、listing、外链锚文本、AI answer 或旧产品页开始把实体重新拉回 “AI receptionist company”，就进入排查队列。


## Case studies (2026-09-19)

- Current, indexable: `/case-studies/` + `/case-studies/livestream-agency-scheduling/` (EN + ZH). Content lives in `src/content/cases.mjs`; add the next case there and push it into `CURRENT_CASES`.
- Legacy, noindex, unlinked: `/case-studies/ai-man-jack/`, `/case-studies/car-dealership-sms/`. Never put them back on the index.
- Metric rule: "about six hours" = the old manual **first draft** only, always beside the human-review caveat. Do not write "6 hours saved" or any net/ROI figure until review time is measured (next number worth publishing: how many cells the operations lead changes before publishing).
- Privacy: no client name, staff names, links, keys or identifiable screenshots.
- Proof card `caseProof(lang)` is on home, training, operations and workflows. Footer → Resources → Case studies. Header unchanged.

## Motion (2026-09-19)

- Restrained motion layer, no library (React Bits was the reference; the site is not React and stays framework-free): H1 blur-in on load, count-up on `.stat-bar` numbers, CSS scroll-driven reveals (`rise`, `unmask` on real photos), pointer spotlight on `.prog` cards. All in the "MOTION 2026-09" block at the end of `style.css` + ~12 lines in the global script in `src/layout.mjs`.
- Guarantees: HTML always carries final numbers and full content; browsers without `animation-timeline: view()` show everything statically; everything is off under `prefers-reduced-motion`.
- Amends the redesign rule "colour-only transitions". Still banned: glitch/terminal/particle/cursor effects.
- `scripts/shots.sh` output near the bottom edge of the tall window can now show elements mid-reveal; compare with that in mind.
