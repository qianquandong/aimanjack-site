# HANDOFF — aimanjack.com（2026-09-18，定位收口为企业 AI 培训）

给下一个接手的人（或下一个会话）。读完这一页就能接着干，不用翻聊天记录。
规格看 `PRD.md`（2026-09-18 版）；09-09 的 AI 前台 PRD 已作废，在 git 历史里。

## 0. 当前状态（一句话）

**P0 已完成并提交到本地 `production`（commit `3d692c9`），还没 push，还没 deploy。** 线上现在仍是 09-18 早上的旧版（首页 = 培训页 + AI 前台交叉推荐）。上线步骤见第 6 节，上线前检查清单见第 7 节。

## 1. 这个站是什么

AI Man Jack LLC 的官网，Jack Qian 在达拉斯的生意。**唯一对外定位：Corporate AI Training + Practical AI Workflow Training**，面向 Dallas / DFW 的企业团队（sales / operations / marketing / 管理层），中英文授课，上门或远程。全站唯一主转化：**Plan a Team Workshop → `/book/`**（30 分钟通话）。

AI 前台（AI receptionist）这条产品线**隐藏，不删除**：源码都在，路由标了 `indexable: false`，对搜索引擎和访客都不可见，但直接访问 URL 仍然 200。

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

## 2. 怎么改页面

站点是**生成的**：`src/` 是源，根目录 HTML、`sitemap.xml`、`llms.txt` 都是产物，两者都提交。**不要手改产物，下次 build 会盖掉。**

```bash
node scripts/build.mjs          # src/ → 全部 HTML + sitemap.xml + llms.txt
node --test tests/              # 8 个测试，必须全过
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

**隐藏一个路由**：在它的路由对象上加 `indexable: false`，一处生效（noindex + 出 sitemap，中英文一起）。逻辑在 `layout.mjs` 的 `pageOf()`，build 和 tests 都走它。

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

## 5. 追踪

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
node scripts/build.mjs && node --test tests/     # 先生成，测试必须 8/8
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

## 7. 本次上线前检查清单（P0）

- [x] `node scripts/build.mjs` 通过，20 个可索引 URL
- [x] `node --test tests/` 8/8
- [x] `blog-check` 培训那篇 0 FAIL
- [x] 本地预览看过：桌面 + 手机、中英文，无横向溢出，粘底条只在 hero CTA 滚出后出现，console 无报错
- [ ] Jack 过目首页和 `/ai-training/` 的文案（尤其中文）
- [ ] Jack 确认第 8 节里的几个取舍
- [ ] push + `sh deploy.sh`
- [ ] 上线后三件事（第 6 节）

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

## 10. 待 Jack

1. 过目文案 → 说一声「上线」。
2. GA4 Key event 换成 `workshop_cta_click` + `booking_complete`（第 5 节）。
3. 上线后 GSC Request Indexing（第 6 节）。
4. Agent OS 里博客 backlog 清掉 receptionist 选题（第 9 节），或者告诉下一个会话去清。
5. 9 月 24 日那场公开课到底有没有（第 8 节第 4 条）。
6. Google 评价继续攒。数变了改 `src/config.mjs` 的 `PROOF` 和 `training.mjs` 里手写的那几处。
7. 演示线、车行 SMS agent、Twilio、A2P、Supabase booking 这些基建都还在跑，没动。演示线要不要停、号码要不要留，是另一个决定。

## 11. 相关文件

| 文件 | 用途 |
|---|---|
| `PRD.md` | 2026-09-18 定位收口 PRD（本次改版的规格，P0–P4） |
| `HEALTH-CHECK.md` | 漏斗口径、熔断阈值、接线记录（口径待更新） |
| `BOOKING-PLAN.md` | 预约系统 W1–W3 计划 |
| `SEO-STATUS.md` | 7 月以来的 SEO 历史流水 |
| `README.md` | 构建、部署、日检一句话 |
| `~/.claude/scheduled-tasks/aimanjack-daily-health/SKILL.md` | 日检任务的提示词 |
