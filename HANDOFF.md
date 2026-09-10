# HANDOFF — aimanjack.com（2026-09-09，PRD 改版）

给下一个接手的人（或下一个会话）。读完这一页就能接着干，不用翻聊天记录。

## 1. 这个站是什么

AI Man Jack LLC 的官网，Jack Qian 在达拉斯的生意。2026-09-09 按 `aimanjack_frontend_PRD.md`（Jack 的 Codex 输出目录）整站重做，产品是 **AI 前台 + 预约**，培训是次页。

| 页面 | EN | ZH | 内容 |
|---|---|---|---|
| 首页 | `/` | `/zh/` | Hero「Your phone can answer itself.」+ PhoneDemoCard + 怎么运作 + 示例通话 + 能力 + 行业 + 对接 + 案例 + 价格 + 创始人 + 12 条 FAQ + 终 CTA + GEO 事实段 |
| 产品 | `/ai-receptionist/` | `/zh/ai-receptionist/` | 一通电话里发生什么、语言与边界、需要你准备什么 |
| 价格 | `/pricing/` | `/zh/pricing/` | Starter $199+$750 / Growth $299+$1,500 / Pro $599+$2,000，网站 + GBP 是 +$500 可选加购，完整对比表，服务条款白话版 |
| 行业 | `/industries/` + `salons` `med-spas` `clinics` `home-services` `repair-services` | 同 `/zh/` | 每页 3 个来电场景、示例对话、需要准备什么、行业 FAQ |
| 对接 | `/integrations/` | `/zh/integrations/` | 每项标 Supported / Pilot / Ask us |
| 案例 | `/case-studies/` + `ai-man-jack` `car-dealership-sms` | 同 `/zh/` | 不编数字，写测了什么、还没验证什么 |
| 培训 | `/ai-training/` | `/zh/ai-training/` | 内容和 schema 沿用旧站，只换了壳；产品交叉推荐段不写价格，只说「联系 Jack 了解详情」 |
| 公司 | `/about/` `/contact/` | 同 `/zh/` | 联系页无表单：演示线 / 邮件 / 短信 |
| 法务 | `/privacy` `/sms-terms` `/terms` | `/zh/privacy` 等 | 前两个英文原文一字未动（A2P 审核用），`/terms` 是新写的（Jack 2026-09-09 让 Claude 拍板，已定稿） |

## 2. 怎么改页面（关键变化）

站点现在是**生成的**：`src/` 是源，根目录 HTML 是产物，两者都提交。

```bash
node scripts/build.mjs        # src/ → 38 个 HTML + sitemap.xml
```

| 文件 | 管什么 |
|---|---|
| `src/config.mjs` | 所有事实常量：两个电话、邮箱、**BOOK_URL**、三档价格、GA4 ID |
| `src/i18n.mjs` | 页头页脚、按钮、弹窗、粘底条的中英文案 |
| `src/layout.mjs` | 页面外壳：head/meta/hreflang、header、footer、拨号弹窗（含二维码）、粘底 Call 条、内联 JS（弹窗、复制号码、GA4 事件） |
| `src/components.mjs` | 可复用块：PhoneDemoCard、transcript、howItWorks、pricingCards/Table、faq、finalCta、geoFacts、breadcrumb；行业/对接/案例/FAQ 的数据也在这 |
| `src/pages/*.mjs` | 每个文件一组页面，`en` 和 `zh` 并排写 |
| `src/training-schema.*.json` | 培训页的 JSON-LD 原样保留（含 10 条评价 AggregateRating） |
| `src/qr-demo.svg` | 拨号二维码，`npx qrcode -t svg "tel:+14695172968"` 生成 |
| `style.css` | 唯一样式表；deploy 时压缩并按内容 hash 换 `?v=` |

**预约系统（2026-09-09 W1 已建）**：`BOOK_URL = '/book/'`，全站第二 CTA 已是「Book a 15-min demo」（事件 `book_demo_click`）。页面在 `src/pages/book.mjs`，API 是 Pages Function `functions/v1/[[route]].js`（同域 `/v1/*`，随 deploy.sh 一起上线），数据在 Supabase（项目 aimanjack-crm，schema `booking`；建表和种子 `db/schema.sql`，用 `node scripts/supabase-sql.mjs db/schema.sql` 应用，Management API 免 psql）。改 Jack 的可约时间 = 改 `availability_rules` 表（现在周一到周五 19:00–21:00、周六 10:00–18:00，中部时间）；放假用 `blocks` 表。看预约：`GET /v1/bookings?business=aimanjack`，带 `Authorization: Bearer <ADMIN_TOKEN>`（令牌在本机 `.dev.vars`，Pages secret 已设 production + preview）。API 还要一个 Pages secret `SB_SECRET_KEY`（Supabase 秘密 key，production + preview 都要）。改完 API 跑 `node scripts/booking-smoke.mjs <base-url> <token>`。

**改价格**：只改 `src/config.mjs` 的 `PRICING` 和 `src/components.mjs` 的 `TIER_COPY`，重建；schema 的 Offer 也跟着变。

## 3. 硬规矩（没变的）

- 电话有两个，都对：(469) 425-4142 是短信/主号（A2P 要求全站 `sms:` 用它），(469) 517-2968 是 AI 演示线（`tel:`）。别「统一」。
- `/privacy` 和 `/sms-terms` 英文正文是 A2P 审核页，一字未动；中文版是翻译。
- 不编数字：案例、集成标签、评价数都只写核实过的。评价数变了改 `src/training-schema.*.json` 和 `llms.txt`。
- 老 URL 全部 301 在 `_redirects`；`/case-studies/*` 那条已删（现在是真页面）。健康脚本每天验它们。
- `.deployignore` 排除 `src/`、`scripts/`、`*.md`、`.planning`，内部文件不会上线。

## 4. 追踪

GA4 `G-H7EF9HVN02`，标签在 `load` 后异步加载，只在 `aimanjack.com` 域名下发。事件按 PRD §35 命名：`hero_call_click` `header_call_click` `sticky_call_click` `demo_call_click` `email_click` `sms_click` `book_demo_click`（预约系统上线后）`language_change` `case_study_click` `integration_click`；页面级 `pricing_view` `case_study_view` `integration_view`。参数：`cta_position` `page` `language` `device`。旧的 `cta_click` 已停。**Jack**：GA4 Admin → Events 把 `demo_call_click` 和 `hero_call_click` 星标成 Key event。

## 5. 每天怎么转

- 定时任务 `aimanjack-daily-health`（本机 7:00）跑 `node scripts/health.mjs`：现在查 22 个页面（11 EN + 11 ZH）是否 200、每页 1 个 H1、JSON-LD 可解析且含 ProfessionalService、≥1 个 `tel:` 演示 CTA + ≥1 个 `sms:`、CTA 标签和协议一致、robots 放行、llms.txt 提到培训 + $199 + 两个号码；title/description/canonical/hreflang/H1/schema/og:image 对比 `scripts/seo-baseline.json`。
- **有意改了页面之后必须** `node scripts/health.mjs --baseline`，不然第二天报 drift。

## 6. 上线

```bash
node scripts/build.mjs                                   # 先生成
git -C /Users/joseesp/aimanjack-site add -A && git -C /Users/joseesp/aimanjack-site commit -m "..."
sh /Users/joseesp/aimanjack-site/deploy.sh --preview     # 当前分支 → <branch>.aimanjack.pages.dev，不 ping IndexNow
sh /Users/joseesp/aimanjack-site/deploy.sh               # 在 production 分支上跑 = 正式上线 + IndexNow
```

坑：wrangler 按**当前 git 分支名**决定 prod 还是 preview。正式上线必须 `git checkout production && git merge --ff-only redesign`（或对应分支）再跑 deploy.sh。deploy.sh 不 push、不检查工作区，所以上线前自己 commit + `git -C /Users/joseesp/aimanjack-site push origin production`。回退 = `git revert <sha>` → 重建 → push → deploy.sh。

上线后固定动作：curl 看 title 和 301 → `node scripts/health.mjs --baseline` → commit → push。

## 7. 待 Jack

1. 预约系统：2026-09-09 晚 Codex 在本仓库开始做（`functions/`、`db/`、`wrangler.toml`、`src/pages/book.mjs`、`scripts/booking-smoke.mjs`），`BOOK_URL` 已指到 `/book/`。**两个 agent 别同时改同一个文件**；Codex 负责 book.mjs / functions / db / wrangler，Claude 负责其余页面。第三方对接测试清单在 `BOOKING-PLAN.md` §4。
2. 车行案例：店名能不能公开、有没有数字。
3. 演示线数据：Twilio CLI 本机已登录（profile `car-sms-agent`，两个号码都在），`twilio api:core:calls:list --to +14695172968 --start-time-after <date>` 拉通话记录，只发汇总，不发号码。第一个完整月（2026 年 10 月）结束后回填 `/case-studies/ai-man-jack/`。
4. `/privacy` 最好加一段 AI 通话数据处理说明（现在只写了短信）；改之前想清楚 A2P 审核的影响。
5. GSC 对新页面 Request Indexing；GA4 星标 Key event。

## 8. 相关文件

| 文件 | 用途 |
|---|---|
| `HEALTH-CHECK.md` | 漏斗口径、阶梯、三层检查、熔断阈值、接线记录 |
| `SEO-STATUS.md` | 7 月以来的 SEO 历史流水 |
| `README.md` | 构建、部署、日检一句话 |
| `~/.claude/projects/-Users-joseesp-jackqian-site/memory/aimanjack-*.md` | Claude 的跨会话备忘 |
