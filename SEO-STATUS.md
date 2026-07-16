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
