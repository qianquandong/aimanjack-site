# HANDOFF — aimanjack.com（2026-09-09）

给下一个接手的人（或下一个会话）。读完这一页就能接着干，不用翻聊天记录。

## 1. 这个站是什么

AI Man Jack LLC 的官网，Jack Qian 在达拉斯的生意。两条业务线，**首页是产品，培训是次页**（2026-09-09 刚换的，Jack 定的）：

| 页面 | EN | ZH | 内容 |
|---|---|---|---|
| 首页 | `/` | `/zh/` | AI 前台 + 预约系统，$2,000 一次性 + $200/月，面向 DFW 预约制诊所和店铺。入口是打 AI 演示线 (469) 517-2968 |
| 培训 | `/ai-training/` | `/zh/ai-training/` | 团队动手 AI 培训，按项目报价。CTA 是发短信 TRAINING 到 (469) 425-4142 |
| 其他 | `/privacy` `/sms-terms` | — | A2P 审核用，别动 |

手写静态 HTML + 一个 `style.css`，没有框架。仓库 `/Users/joseesp/aimanjack-site`，GitHub `qianquandong/aimanjack-site`，分支 `production`。跟 `jackqian-site`（realagentusecases.com，Next.js）是两个仓库，别混。

## 2. 目标与现状

Jack 的目标：每天 1000 个目标受众进站，转化率 ≥10%。截至今天两个数都刚开始能测：

| | 数值 | 来源 |
|---|---|---|
| GSC 近 28 天 | 2 次点击 / 269 次曝光 | 2026-08-12 → 09-06 |
| 排名词 | 「ai automation dallas」一类，50–90 位 | 跟新首页定位对得上，跟培训页对不上 |
| GA4 | 今天刚埋，0 数据 | 明天起有 |
| 转化 | 未知 | 宽口径 = 点 sms/tel/mailto（GA4 `cta_click`）；严口径 = 真收到短信/预约，Jack 手工报 |

阶梯和熔断阈值在 `HEALTH-CHECK.md` §0 和 §1，别在这里重复。

## 3. 今天接好的线（全部实测可用）

| 项 | 值 |
|---|---|
| GA4 property | AI Man Jack · 553511876（账号 EnglishmanJack，跟 realagentusecases 同账号不同 property） |
| Measurement ID | G-H7EF9HVN02，标签在 4 个 HTML 的 `</head>` 前，带 `cta_click` 事件监听 |
| CSP | `_headers` 已放行 googletagmanager / google-analytics |
| Google Cloud 项目 | claude-seo · inductive-album-508120-s2 |
| 已开 API | Search Console、PageSpeed Insights、Chrome UX Report、Analytics Data（Indexing API 没开，用不上） |
| Service account | claude-seo@inductive-album-508120-s2.iam.gserviceaccount.com，GSC Full + GA4 Viewer |
| 凭证文件 | `~/.config/claude-seo/google-api.json` + `service_account.json`（不在仓库里） |
| 验证命令 | `"$HOME/.claude/skills/seo/bin/claude-seo" run google_auth.py --check` → 应显示 Tier 2 全 OK |

## 4. 每天怎么转

- **定时任务** `aimanjack-daily-health`（本机，每天 7:00，App 开着才跑）：跑 `node scripts/health.mjs`，拉 GSC 7 天环比和 GA4，≤12 行中文日报。周六加全站审计、PSI、3 条 GEO 探针。prompt 在 `~/.claude/scheduled-tasks/aimanjack-daily-health/SKILL.md`。
- **健康脚本** `scripts/health.mjs`：零凭证，查 4 页 + sitemap/robots/llms.txt 是否 200、随机路径 404、`_redirects` 每条 301 仍成立、每页 1 个 H1、JSON-LD 可解析、≥2 个 sms CTA、GA4 标签在、robots 不挡 AI 爬虫、llms.txt 讲当前产品；title/description/canonical/hreflang/H1/schema/og:image 对比 `scripts/seo-baseline.json`。快照写 `scripts/health/YYYY-MM-DD.json`。
- **有意改了页面之后必须** `node scripts/health.mjs --baseline`，不然第二天报 drift。

常用命令：

```bash
node scripts/health.mjs                # 日检
node scripts/health.mjs --baseline     # 改版后重打基线
"$HOME/.claude/skills/seo/bin/claude-seo" run gsc_query.py query --days 7 --dimensions query --limit 20
"$HOME/.claude/skills/seo/bin/claude-seo" run ga4_report.py --days 7
"$HOME/.claude/skills/seo/bin/claude-seo" run pagespeed_check.py https://aimanjack.com/ --strategy mobile
```

## 5. 上线

Jack 2026-09-09 说过：aimanjack.com 的上线不用再逐次跟他确认。

```bash
sh /Users/joseesp/aimanjack-site/deploy.sh
```

deploy.sh 顺序：暂存到 .deploy → 压缩 CSS + 内容 hash 换缓存 → `wrangler pages deploy` → ping IndexNow。**它不 push、也不检查工作区**（09-09 加过一次，被 1636856 revert 掉了）。所以上线前自己 commit + `git -C /Users/joseesp/aimanjack-site push origin production`，否则 GitHub 上没有对应版本，回退就没有锚点。回退 = `git revert <sha>` → push → deploy.sh。

坑：wrangler 按**当前 git 分支名**决定 prod 还是 preview。不在 `production` 上跑，只会发到 `<branch>.aimanjack.pages.dev`，aimanjack.com 不动。

上线后固定动作：curl 看 title 和 301 → `--baseline` → commit → push。

## 6. 待办（按重要性）

1. **Jack**：GSC 对 `/` 和 `/ai-training/` 各点一次 Request Indexing。没有 API，只能手点。
2. **Jack**：第一个 `cta_click` 到 GA4 后，Admin → Events 把它星标成 Key event。日报会提醒。
3. **Jack，每周**：GBP 发一条更新。评价数不再是 10 条 5.0 时告诉 Claude，改 `ai-training/index.html` 的 AggregateRating 和 `llms.txt`。
4. **Claude，14 天后**：基线跑满，按 `HEALTH-CHECK.md` 阶梯出阶段 1 内容清单。GSC 现有曝光词是 automation/前台方向，优先做这个集群的长尾页和城市页，培训词其次。
5. 可选：Cloudflare Pages 打开 Web Analytics 做 GA4 对照。

## 7. 硬规矩

- 电话有两个，都对：(469) 425-4142 是短信/主号（A2P 审核要求全站 CTA 用它），(469) 517-2968 是 AI 演示线。别「统一」。
- `/privacy` 和 `/sms-terms` 是 A2P 审核用的页面，改动前想清楚；它们有正常页脚和互链。A2P 审核状态未核实。
- ProfessionalService 实体 `#business`（含 10 条评价、AggregateRating）定义在 `/ai-training/` 页里，首页的 Service 用 `@id` 引用它。改评价数只改一处。
- `.deployignore` 排除 `*.md`、`scripts/`、`.planning` 等，内部文档不会上线。新增内部文件放这些位置。
- 老 URL 全部 301 在 `_redirects`：`/products/`→`/`，`/ai-education/`→`/ai-training/`，其余旧页面→首页或培训页。别删规则，健康脚本每天验它们。

## 8. 相关文件

| 文件 | 用途 |
|---|---|
| `HEALTH-CHECK.md` | 漏斗口径、阶梯、三层检查、熔断阈值、接线记录 |
| `SEO-STATUS.md` | 7 月以来的 SEO 历史流水，看背景用 |
| `README.md` | 部署与日检一句话 |
| `~/.claude/projects/-Users-joseesp-jackqian-site/memory/aimanjack-*.md` | Claude 的跨会话备忘（部署规矩、LLC 署名、健康检查） |
