# AI Man Jack — Final SEO + Front-End Rebuild PRD (2026-09-18)

Repository `qianquandong/aimanjack-site` · production branch `production` · https://aimanjack.com
Supersedes the 2026-09-09 receptionist PRD (see git history for `PRD.md` before this date).

## 1. 项目目标

把 AI Man Jack 从混合定位（AI Training + AI Receptionist + Local Business Automation）彻底收口为 **Corporate AI Training + Practical AI Workflow Training**。

核心用户：Dallas / DFW 企业团队、企业负责人、department leader、sales / operations / marketing 团队、希望员工真正开始使用 AI 的公司、需要 ChatGPT / Claude / Gemini / Copilot 实操培训的团队。

核心商业转化：**Plan a Team Workshop**（不再是 Call our AI demo）。

SEO 北极星：100+ organic visits/day（约 3,000+/月），但不做泛 AI 新闻站。漏斗：Organic Traffic → Relevant Business Visitor → Training / Workflow Page → Proof → Book 30-Minute Call → Corporate Training Lead。

## 2–3. 技术架构与 Source of Truth

不迁移框架。`src/pages/*.mjs` → `scripts/build.mjs` → `render()` → static HTML → Cloudflare Pages。开发只改 `src/ scripts/ tests/ _redirects robots.txt style.css`，然后 `node scripts/build.mjs`。根目录 HTML、`sitemap.xml`、`llms.txt` 是产物，不手改。

## 4–8. P0：AI 客服「隐藏，不删除」

原则：Preserve source code. Remove public marketing and SEO signals.

- `src/config.mjs` 增加 `FEATURES = { receptionistMarketing:false, aiDemoGlobalCTA:false, legacyReceptionistRoutes:true }`。
- Legacy 路由（`/ai-receptionist/ /industries/* /integrations/ /tools/missed-call-calculator/ /blog/how-much-do-missed-calls-cost/ /case-studies/*` 和 `/pricing/`）：`noindex, follow`，移出 sitemap / header / footer / homepage / training / blog 推荐 / 内链；源码保留，URL 仍可直接访问。第一阶段不 301。
- `/pricing/` Phase 2 再决定是否改造成 AI Training Pricing & Formats。

## 9–14. Header / CTA / Footer

Header：AI Training · Workshops · Teams · Case Studies · Resources · About + `[Plan a Team Workshop]` → `/book/`（中文：AI 培训 · 工作坊 · 团队场景 · 案例 · 资源 · 关于 + `[聊聊团队培训]` → `/zh/book/`）。路由：`/ai-training/`、`/ai-workshops/`、`/ai-training/#teams`（或未来 `/teams/`）、`/case-studies/`、`/blog/`、`/about/`。不做 mega menu。

Mobile sticky CTA：Plan a Team Workshop → `/book/`，不显示电话。删除 global AI demo dialog / QR / copy number / sticky call 逻辑（可留在 legacy 源码里）。

Footer 四栏：AI Training（Corporate / Dallas / Workflow / Workshops）· Teams（Sales / Ops / Marketing / Leaders）· Resources（Guides / Workflow guides / Case studies / Real Agent Use Cases ↗）· Company（About / Contact / Book）。最下 Privacy · Terms · SMS Terms（A2P 基础设施仍需要）。

## 15–27. Homepage

Homepage 不再等于 Training Page。只承担：AI Man Jack 是谁 + 为什么值得联系 + 服务什么团队。

- Title `Corporate AI Training in Dallas | AI Man Jack`；Description `Practical, hands-on AI training for teams in Dallas and remotely. Build useful ChatGPT, Claude and AI workflows around work your team already does.`；H1 `Practical AI training for teams.`（自然语言，不堆关键词）。
- Sections：Hero（eyebrow `Corporate AI Training · Dallas + Remote`，CTA Plan a Team Workshop，secondary See How Training Works）→ Proof strip（5+ Dallas AI Workshops / 50+ attendees / 37-person hackathon / 5.0 ★ Google / English + 中文，数字必须真实）→ Outcomes（Find the right AI use cases / Build repeatable workflows / Verify AI output / Apply AI to real work）→ Formats（90-Minute / Half-Day from $1,500 up to 10 / Multi-Week）→ Teams（Sales / Operations / Marketing / Leaders & Managers，各 3–5 个真实 workflow）→ Workflow Method（全站统一一套：Find the work → Map the workflow → Build with AI → Test + improve，或保留五步 curriculum）→ Real proof（`img/events/*` 真实照片，不用 stock）→ Jack（Dallas-based / hands-on / community-built curriculum / real workflows / EN+ZH，完整背景去 `/about/`）→ Resources（3 篇）→ FAQ 6–8（不再提 receptionist）→ Final CTA。

## 28–40. Pillar 与新页面

- `/ai-training/`：取消 `canonicalPath:'/'` + `noindex`，改为 indexable、self-canonical、进 sitemap。Title `Corporate AI Training for Teams | AI Man Jack`，H1 `Corporate AI training built around real work.`。次级语义词（AI training for employees / workplace / business / enterprise / AI skills training / employee AI workshop）不单独开页。结构：Hero · Who it's for · What employees learn · Curriculum · Formats · Tools · Example workflows · Safety/human review · Proof · Testimonials · FAQ · Book。
- 新增 `/ai-training-dallas/`（Title `AI Training in Dallas for Teams | AI Man Jack`，H1 `Hands-on AI training for Dallas teams.`）必须真 local：DFW onsite、真实活动、照片、Plano/Dallas 历史、37 人 hackathon、Google review、service area、onsite FAQ、活动链接。不是复制 pillar 多写 30 次 Dallas。
- 新增 `/ai-workflow-training/`（H1 `Turn everyday work into practical AI workflows.`；Task → Input → AI → Human Review → Action → Measurement）。
- 新增 `/ai-workshops/`（90 minute / half day / agenda / bring / leave with / images / booking）。
- Team pages：`/ai-training/sales-teams/ operations-teams/ marketing-teams/ leaders/`，先四个。Sales：account research / meeting prep / follow-up / call summaries / proposal drafts / CRM prep。Ops：recurring reports / process docs / meeting→actions / document extraction / knowledge / planning。Marketing：research synthesis / campaign briefs / repurposing / competitive analysis / first drafts / performance summaries。Leaders：use-case prioritization / adoption / human review / data boundaries / ownership / measurement。
- 不批量做 city pages；Plano / Frisco / Richardson / Fort Worth 只有在有真实独特内容时才做。

## 41–44. Training 页面与 Schema

从 visible copy 删除所有 receptionist 交叉推荐（"Rather have it built than taught?"、Product card、"Do you also build things?"、bio 里 "I also build the AI receptionist"），中文同步。Schema 删除 `$199 Offer`、`priceRange $199-$599/month`、`availableLanguage es`（只有 en / zh）。推荐：Homepage = Organization + Person + WebSite；Training = Service + Organization ref + FAQPage + BreadcrumbList；Dallas = Service + Org + Breadcrumb；Article = Article/BlogPosting；真实活动 = Event。Google reviews 可继续展示，但 SEO 价值来自 proof + trust + entity consistency，不赌 Rich Result。

## 45–53. About / Contact / Book / Cases / Blog

- About 重写：Jack = AI trainer / AI workflow builder / Dallas AI community organizer / hands-on workshop host；公司 = helps teams learn and apply AI to real work；proof = 5 talks / 50+ / 37 hackathon / Google reviews / RealAgentUseCases。
- Contact：H1 `Talk with Jack about your team.`；Cards = Book a 30-minute call（primary）/ Email Jack / Text Jack。AI demo line 不再放第一位。
- Book：保留自建 booking；context 改为 AI training / workshop / workflow program；可少量收集 Company / Team size / Department / Main AI goal / Current tools，不加太多字段。
- Case studies：两个 receptionist case → noindex、出 sitemap、出 index，源码保留。新 case（P3）：Dallas Multi-Agent Workshop、37-Person AI Hackathon（Audience / Problem / Format / What participants built / What worked / What confused / What changed / Photos，不编 ROI），企业培训 case 有真实客户后再发。
- Blog 继续 `/blog/`，导航叫 Resources。`ai-training-for-employees-start-with-one-task` 保留，内链改到 training 集群。`how-much-do-missed-calls-cost` 与 calculator：源码保留、noindex、出 sitemap、出 index。

## 54–59. Content 与双站

Cluster A（Corporate AI Training）：How to Train Employees to Use AI · How to Create an AI Training Program · What Should a Corporate AI Workshop Include · AI Workshop Agenda · AI Training Exercises · What AI Skills Should Employees Learn in 2026 · How Long Should Corporate AI Training Take · How to Measure AI Training ROI。
Cluster B（AI Workflows）：What Is an AI Workflow · AI Workflow Examples · 20 AI Workflows for Office Workers · for Sales · for Operations · How to Identify Tasks Worth Automating · AI Agent vs AI Workflow · When Should Humans Review AI Output。
Cluster C（Tools）：ChatGPT for Business Teams · Claude for Business Teams · ChatGPT vs Claude for Work · Gemini vs ChatGPT for Teams · Best AI Tools for Non-Technical Employees。不写模型发布新闻。

Content Quality Rule：每篇必须含至少一个 100 个 AI SEO 站生成不出来的东西（真实 workshop 观察 / workflow / 截图 / 照片 / prompt / before-after / 错误 / 学员提问 / 模板 / 实验 / Jack 自己的结果），否则不发。

双站：RealAgentUseCases = Learn（agents / workflows / examples / tutorials）；AIManJack = Buy / Hire / Train。互相 contextual link，不复制文章。

## 60–72. llms / sitemap / redirects / robots / canonical / hreflang / OG / schema

- `llms.txt` 由 `src/llms.mjs` 在 build 时生成，只描述 training；不再有 receptionist / $199 / demo line / integrations。
- Build 支持 route-level `indexable:false` → `noindex,follow` + 不进 sitemap。
- `_redirects`：old URL → closest relevant new URL；无对应页面的宁可 404，不全扔首页。`/ai-receptionist/` 暂不 redirect（200 + noindex），观察 GSC 后再定 301 / 410 / 留。
- robots.txt 不 Disallow legacy（爬虫必须能读到 noindex）。
- 每个 indexable page self-canonical；hreflang en / zh / x-default；不做只翻译导航的中文页。
- OG 默认 `og-training.jpg` / `og-training-zh.jpg`。
- Schema 单一来源 `src/schema.mjs`（organization / person / service / breadcrumb / article）。

## 73–83. GA4 / Health / Tests

- GA4 `G-H7EF9HVN02` 保留。新事件：workshop_cta_click · booking_start · booking_complete · training_page_view · team_page_view · case_study_view · resource_to_training_click · email_training_click · sms_training_click · realagentusecases_outbound。demo_call_click / sticky_call_click 不再是主 KPI。
- `scripts/health.mjs` 页面表改为 training 集群（`/ /ai-training/ /ai-training-dallas/ /ai-workflow-training/ /ai-workshops/ /ai-training/{sales,operations,marketing}-teams/ /ai-training/leaders/ /case-studies/ /about/ /contact/ /book/` + zh），每页断言：200 · 一个 H1 · title · description · self canonical · hreflang · OG · schema · index,follow · 无 receptionist 信号。Banned marketing signal 扫描：AI receptionist / Call our AI demo / missed call calculator / Starter $199 / Growth $299 / Pro $599 / appointment businesses（例外：legacy noindex、legal）。修掉 `sitemap:pages` 自相矛盾和 GA4 PASS 却报 missing 的 detail 文案。
- `tests/site.test.mjs`：homepage 含 corporate AI training、不含 receptionist；`/ai-training/` indexable / self canonical / in sitemap；导航不链 receptionist、链 `/ai-training/` 与 `/book/`；首页 schema 无 receptionist / $199 / $299 / $599；legacy noindex + 不在 sitemap；llms 有 training 无 receptionist。

## 84–93. Front-End

CSS 基础保留（Satoshi、focus-visible、responsive、reduced motion、WebP、sticky header）。CSS 版本号由 content hash 生成，不手动 bump（deploy.sh 已在 staging 时按 md5 改写 `?v=`）。Mobile menu `top:100%` 而不是假设 header 64px。撤掉 global dialog 后删除 QR / copy number / 桌面拨号拦截 / sticky demo observer。不加 autoplay video / GSAP / three.js / 粒子 / 首屏 chatbot。视觉：professional · practical · human · technical · evidence-driven；用真实 workshop 照片、流程图、截图；不用紫色 AI 渐变 / 机器人 / 大脑。宽度 1200 / 正文 720–800 保留。Header 最多 6 links + CTA + language。每篇 resource 至少链 1 个 commercial page + 1 篇相关 resource + 1 个 team page + 1 个 booking CTA。

## 94–101. Phase 3+ 与优先级

Tools（Phase 3）：AI Workflow Scorecard · AI Workshop Agenda Generator · AI Use Case Finder。发布节奏 1–2 高质量页/周。流量模型（非承诺）：commercial/local 600–900 · training long-tail 700–1,000 · workflow/tool 700–1,000 · case studies/templates 500–800 · brand/community 200–400 ≈ 3,000+/月。

优先级：**P0** global receptionist cleanup / homepage / schema / llms / sitemap / nav+footer / CTA / tests / health → **P1** `/ai-training/` `/ai-training-dallas/` `/ai-workflow-training/` `/ai-workshops/` → **P2** 四个 team pages → **P3** training case studies → **P4** content engine / free tools / backlinks / local expansion。

## 102–110. 执行顺序与 Definition of Done

文件顺序：config → i18n → layout → training → home → about/contact/book/notfound → legacy indexable:false（product / industries / integrations / tools）→ cases → blog → 新页面 → team pages → llms（build 生成）→ health + tests → `node scripts/build.mjs && node --test && node scripts/health.mjs` → 检查产物。

Deploy 前禁止条件：任何 indexable page 出现 AI receptionist / Call our AI demo / Starter $199 / Growth $299 / Pro $599 / missed call calculator（例外：legal、legacy noindex）。

P0 DoD：Homepage 只有 corporate AI training；Header / Footer 无 receptionist；Global CTA = Plan a Team Workshop；Schema 无 receptionist Offer；Sitemap 无 legacy；llms 无 receptionist；About = training + workflows；Contact = Jack / team training。

SEO DoD（核心页 `/ /ai-training/ /ai-training-dallas/ /ai-workflow-training/ /ai-workshops/`）：200 · index,follow · unique title / description · one H1 · self canonical · hreflang EN/ZH · valid schema · in sitemap · relevant internal links。

Front-End DoD：1440 / 1024 / 768 / 390 / 375 无横向溢出、CTA 可见、导航可用、键盘可用、focus 可见、图片稳定、无明显 CLS。

Conversion DoD：所有 commercial page primary CTA = Plan a Team Workshop → `/book/`，至少 top / mid / bottom 三处，但不要每屏一个。

North-Star Rule：每发布一页问「Does this make it clearer that AI Man Jack helps teams learn and apply AI to real work?」；每写一篇问「Does this contain something Jack actually learned, built, taught, tested, or observed?」；每加一个前端元素问「Does this improve understanding, trust, or conversion?」。不是就不发 / 删掉。最终：一个完全不认识 Jack 的企业访客 5 秒内明白 **AI Man Jack trains teams to use AI on real work.**

## 信息架构

```
                    AI MAN JACK
                         │
              CORPORATE AI TRAINING
                         │
        ┌────────────────┼────────────────┐
      LOCAL            TEAMS           SKILLS
      Dallas        Sales / Ops      Workflows / ChatGPT
                  Marketing / Leaders   Claude / Agents
        └──────────── RESOURCES ──────────┘
                         │
                   CASE STUDIES
                         │
                    BOOK WORKSHOP

RealAgentUseCases.com (educational authority: workflows / agents / tutorials)
        │ contextual links
        ↓
AIManJack.com (commercial authority: corporate AI training) → Book Workshop
```
