# aimanjack.com 每日 SEO / GEO 健康检验

> 2026-09-09 建。目标：每天 1000 个目标受众进站、转化率 ≥10%。
> 先说清楚：这两个数现在**一个都测不到**——站上没有任何埋点，GSC 也没接进自动化。所以第一阶段的 KPI 只有一个：把漏斗量出来。

## 0. 漏斗口径（先定义，再谈数字）

| 层 | 定义 | 数据来源 | 现状 |
|---|---|---|---|
| 目标受众进站 | 来自 DFW / 美国、搜索意图是「给团队做 AI 培训」或「诊所 AI 前台」的会话（排除中国大陆流量、bot、自己） | GA4 会话 × 国家/城市 + GSC 点击 | 未接 |
| 转化（宽口径） | 点了 `sms:` / `tel:` / `mailto:` 任一 CTA | GA4 事件 `cta_click`（见 §2） | 未接 |
| 转化（严口径） | 真收到 TRAINING 短信、AI 线路预约成功、邮件询盘 | Jack 手机 / 预约系统，人工填 | 手工 |

10% 只有按宽口径（点击 CTA）才有可能接近；按严口径会低得多。日报两个口径都报，别混着看。

**阶梯**（每级达标 14 天才升级，数字是闸门不是预测）：

| 阶段 | 目标受众/天 | 解锁靠什么 |
|---|---|---|
| 0 | 能测量 | GA4 + GSC 接通，跑满 14 天基线 |
| 1 | 10 | GBP 每周 1 帖 + 评价数涨；4 个页面的长尾词进 GSC 前 20 |
| 2 | 50 | 加页：城市页（Plano / Frisco / Fort Worth…）、培训形式页、行业页（诊所/医美/沙龙） |
| 3 | 200 | 非本地内容（培训课纲、AI 前台选型指南）吃全美长尾；AI 引擎开始引用；YouTube 导流 |
| 4 | 1000 | 本地 SEO 到不了这个量。到阶段 3 时重新决定：目标是 1000 访客，还是每周 N 个有效询盘 |

## 1. 三层检查

### 每日 · 机械层（脚本，零凭证，≈20 秒）

```bash
node scripts/health.mjs              # 对比基线
node scripts/health.mjs --baseline   # 有意改了 title/H1/schema 之后重打基线
```

查什么：4 个页面 + sitemap / robots / llms.txt 全 200；随机路径必须 404；`_redirects` 里每条 301 在线上仍成立（老页面的权重别丢）；sitemap 覆盖 4 页；每页恰 1 个 H1、JSON-LD 能解析且含 ProfessionalService、≥2 个 `sms:` CTA 指向 (469) 425-4142；title / description / canonical / hreflang / H1 / robots / schema 类型 / og:image 与基线逐项比对（漂移即 FAIL）；robots 不挡 AI 爬虫；llms.txt 描述的是**当前**产品（培训 + $2,000）；生产页有 GA4 标签。

结果写 `scripts/health/YYYY-MM-DD.json`，任一 FAIL 退出码 1。

### 每日 · 数据层（定时任务 `aimanjack-daily-health`，本机 7:00）

跑上面的脚本，然后用 claude-seo 的 `seo-google` 拉数（凭证见 §2）：
- GSC：近 7 天 vs 前 7 天的点击 / 曝光 / 平均排名；前 10 查询词；曝光 ≥20 且排名 8–20 的词（下一步优化对象）；索引页数是否仍是 6
- GA4：会话（按国家拆，DFW 单列）、`cta_click` 数、宽口径转化率
- 汇报 ≤12 行中文；FAIL 项置顶；连续 3 天同一 FAIL 就要求 Jack 处理

### 每周六 · 深检（同一个定时任务，周六多跑）

- claude-seo `/seo-audit https://aimanjack.com`：技术 + 内容 + schema 全量
- PSI 移动端 `/` 和 `/products/`（tier 0 API key 即可）：LCP / INP / CLS
- GEO 探针：web-search 3 条真实问法（「AI training for teams in Dallas」「hands-on AI workshop for my company Dallas」「AI receptionist for dental office Dallas」），记录 aimanjack.com 是否出现、第几位 → 追加 `scripts/geo-mentions.json`
- 提醒 Jack 做两件机器做不了的事：GBP 发 1 帖；看 GBP 评价数——若不再是 10 条 5.0，同步改 `index.html` 里的 AggregateRating 和 llms.txt

### 熔断（任一触发，日报第一行标红）

| 信号 | 阈值 |
|---|---|
| 站点 / redirect / schema | 任一 FAIL 连续 2 天 |
| GSC 索引页数 | < 4 或 > 8 |
| GSC 曝光 | 周环比跌 >50% |
| GA4 | 连续 3 天 0 会话（埋点掉了）或 0 `cta_click`（CTA 坏了） |
| 严口径转化 | 连续 14 天 0 询盘，而 GA4 有 `cta_click` → 号码 / 短信线路要查 |

## 2. 接线状态（2026-09-09 已由 Claude 通过浏览器完成）

| 项 | 值 | 状态 |
|---|---|---|
| GA4 property | AI Man Jack · 553511876（账号 EnglishmanJack） | 已建 |
| GA4 Measurement ID | G-H7EF9HVN02 | 标签已上线（4 个页面）+ `_headers` CSP 放行 |
| Google Cloud 项目 | claude-seo · inductive-album-508120-s2 | 已开 Search Console / PageSpeed / CrUX / Analytics Data 四个 API |
| Service account | claude-seo@inductive-album-508120-s2.iam.gserviceaccount.com | GSC Full 权限 ✓、GA4 Viewer ✓ |
| claude-seo 凭证 | `~/.config/claude-seo/google-api.json` + `service_account.json` | Tier 2，GSC / GA4 / PSI 三条通道实测可用 |
| GSC 基线 | 2026-08-12 → 09-06：2 次点击 / 269 次曝光 | 阶段 0 起点 |

还没做的：① 首个 `cta_click` 事件到达后，在 GA4 → Admin → Events 里把它星标成 Key event；② 可选：Cloudflare Pages 打开 Web Analytics 做对照。

## 3. 文件

| 路径 | 作用 | 是否上线 |
|---|---|---|
| `scripts/health.mjs` | 每日机械检查；页面清单在文件顶部的 `PAGES`，加页时改它 | 否（`.deployignore` 排除 scripts/ 和 *.md） |
| `scripts/seo-baseline.json` | on-page 基线 | 否 |
| `scripts/health/*.json` | 每日快照（任务会把 GSC/GA4 数追加进当天文件） | 否 |
| `scripts/geo-mentions.json` | 每周 GEO 探针记录 | 否 |
| `~/.claude/scheduled-tasks/aimanjack-daily-health/SKILL.md` | 定时任务 prompt | — |
