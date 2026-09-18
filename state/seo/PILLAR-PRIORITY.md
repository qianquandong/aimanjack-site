# Pillar 优先级矩阵 · AI Man Jack

**生成日期**: 2026-09-16
**输入**: `state/seo/keyword-research/all-keywords-merged.csv`（473 去重 / 512 raw）
**根词**: 8 个（ai training for sales / ai training for teams / ai workshop dallas / ai 前台 / ai 培训 / ai 工作流 / corporate ai training / prompt 培训 / 企业 ai 培训）
**过滤范围**: 仅 `target_status=new`（113 条 / 24 clusters），排除已存在 owner（/about/ /pricing/ /ai-training/）

---

## 关键发现（写在前面）

过滤 modifier 扩散后，仅 **2 个 zh cluster** 与公司定位（AI 企业培训）强匹配。剩余 92 个 zh clusters 全部是 modifier 泄漏（美容、诊所、pmp/pgmp/prp cert、coze 工具教程、前台实拍图、企业英语培训、德州培训、prompt 入门定义等），不应写 — 写它们会稀释 domain authority，分走 /zh/ai-training/ 的 link equity。

**为什么 8 根词 473 关键词只剩 2 条能打**：
- 根词 SERP 数据全部 `KD=-1`（GSC 未接），vol 都是 heuristic 估算
- 根词来源是 baidu/google/bing autocomplete → 噪音远高于真实 query log
- "AI 培训" 触发的是"找 AI 课程付费"人群，不是"找企业内训供应商"人群

**不要做的决策**：不要凭 heuristic vol 扩写其余 92 个 cluster。等接 GSC 后用 page+query 实数据重跑。

---

## Priority Matrix

| priority | pillar_URL | primary_keyword | cluster_size | est_vol | intent | KD_action | rationale |
|---|---|---|---:|---:|---|---|---|
| **P0** | /zh/ai-peixun-najia-zuihao/ | ai 培训机构哪家最好 | 3 | 1,620 | commercial | KD unknown → 写完接 GSC 立即查排名 | 商业意图明确 + cluster 总 vol 1620（最高） + 现有 /zh/ai-training/ 未覆盖"哪家最好"长尾；写成对比页可内链至 /book/ |
| **P1** | /zh/ai-peixun-shi/ | ai 培训学费一般是多少? | 1 | 530 | informational | KD unknown → 同上 | 信息意图 + 价格敏感 = 转化漏斗顶端；可借此教育"半天 $1,500 起"差异点，引导 /pricing/ |

**EN 候选全部 P3**（仅列不动）：
| priority | pillar_URL | primary_keyword | cluster_size | est_vol | intent | KD_action | rationale |
|---|---|---|---|---|---|---|---|
| P3 | /artificial-intelligence-corporate-training-insti/ | artificial intelligence corporate training institute | 1 | 75 | informational | 暂不写 | 通用词，无 Dallas/Dallas 地域信号，与定位弱关联 |
| P3 | /list-of-corporate-training-courses/ | list of corporate training courses | 1 | 70 | informational | 暂不写 | 列表型 query，无购买意图 |
| P3 | /who-has-the-best-sales-training-program/ | who has the best sales training program | 1 | 45 | informational | 暂不写 | 通用无 AI 修饰词 |
| P3 | /ai-certification-course-for-sales-professionals/ | ai certification course for sales professionals | 1 | 29 | informational | 暂不写 | cert 证书意图，不卖证 |

---

## 已过滤脏词（不写，列出避免重提）

以下 cluster_slug 命中 modifier 泄漏，与公司"AI 企业培训到公司现场"定位不符：

- **品牌/电话**: 曙海培训电话、美国机长培训
- **错位垂直**: 美容培训（4 个 cluster）、诊所培训（3 个）、餐厅培训（3 个）
- **其他认证**: pmp / pgmp / prp / prc / npdp / pr / pa / opl / AACTP 美国培训认证协会
- **工具教程**: comfyui / coze / 扣子工作流 / project 软件（不是 AI 培训）
- **前台实拍**: 餐厅前台 / 诊所前台 / 智能前台管理系统 / 企业前台 / 前台售价
- **其他 LMS/HR**: 培训网站系统 / 培训系统管理系统 / 绚星云云学习 / preply / 企业培训平台
- **其他地域/通用**: 德州培训（4 个）/ 美国企业员工培训 / 企业英语培训费用 / 软件工程企业培训 / 企业百万员工安全大培训
- **Prompt 通用**: 什么叫 prompt / prompt 证书 / prompt 通俗入门 / prompt 工程师培训课程
- **op-ed/HR**: 培训学时如何计算 / 培训经历怎么填写 / 培训是企业给员工最好的福利 / 在企业中如何培训新员工 / 如何开展企业危机培训
- **企业 ai 长尾（zhihu/小企业/哪家好一点）**: 知乎 Q 帖风，无商业意图

---

## 数据缺口（必须先补）

1. **Search Console**：`KD=-1` × 113 = 无 SERP 数据。接 GSC 后必须用 page+query 二维过滤，重新做 cannibalization 检查（虽然只有 2 条，但需确认 /zh/ai-training/ 未吃掉这 2 个长尾）。
2. **真实 vol**：现有 vol 全是 heuristic 估算。需要接 Google Keyword Planner 或 SEMrush/Ahrefs 验真。
3. **中文搜索量**：Baidu 索引（百度站长平台）+ Baidu Tongji（百度统计）应作为 zh 数据的真源。

---

## 2 周内可执行清单

### Week 1：写 2 个 zh pillar service page

| Day | 写什么 | 形式 | 长度 | 内部链接到 | CTA |
|---|---|---|---|---|---|
| D1-D2 | `/zh/ai-peixun-najia-zuihao/` | service + comparison page（"5 维度挑 AI 培训机构"框架） | 1500-2000 字 | /zh/ai-training/、/zh/pricing/、/zh/case-studies/ | 30 分钟咨询 |
| D3-D4 | `/zh/ai-peixun-shi/` | educational + pricing page（学费拆解：半天 / 90 分钟 / 多周对比） | 1200-1500 字 | /zh/pricing/、/zh/ai-training/、/book/ | 30 分钟咨询 |

**Week 1 资源**：每天 1 篇，约 4 工作日。

### Week 2：写 4 篇 zh blog（支持 internal link + 长尾覆盖）

| Day | URL | primary keyword | 形式 | 内链目标 |
|---|---|---|---|---|
| D1 | /zh/blog/ai-training-roi/ | 企业 ai 培训 投入产出比（info 类长尾） | 案例 + 数字 | /zh/ai-training/、/zh/case-studies/ |
| D2 | /zh/blog/ai-training-half-day-vs-full-day/ | ai 培训 半天 vs 全天（commercial） | 对比 + FAQ | /zh/ai-peixun-shi/、/book/ |
| D3 | /zh/blog/why-our-ai-workshop-works/ | ai 工作坊 为什么有效（commercial） | 客户故事 | /zh/case-studies/、/zh/ai-training/ |
| D4 | /zh/blog/prompt-vs-workflow-training/ | prompt 培训 vs 工作流培训（info 长尾） | 对比 + 决策树 | /zh/ai-training/、/zh/pricing/ |

**Week 2 资源**：每天 1 篇 + 配 1 张原创图。

### 同步动作（每天 10 分钟）

1. **接 Search Console**：先 zh，再 en。完成后重跑 cannibalization 检查。
2. **接 Baidu 站长平台 + 百度统计**：zh 真正流量源。
3. **加 2 个新页到 sitemap**（用 `sitemap-builder.py`），提交 GSC + Bing Webmaster。
4. **写完每页立刻**：self-canonical + hreflang 配对（/zh/ ↔ /en/）+ Open Graph。

---

## 停止条件（避免 scope creep）

- Week 2 末若 GSC 显示 /zh/ai-peixun-najia-zuihao/ 在 baidu/google 上未爬或未索引 → 立刻停止写新页，先排查技术问题
- 若 2 个 zh 页 30 天内 zero impressions → 触发新一轮 keyword research（用真实 query data 而不是 autocomplete）
- 除非这 2 页产生有效 lead，否则不写新 pillar（拒绝凭 heuristic vol 扩展脏词 cluster）
