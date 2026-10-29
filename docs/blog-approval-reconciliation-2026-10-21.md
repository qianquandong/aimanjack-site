# 博客审批与配置变更核对：2026-10-21

本次结果：本周目标文章尚未发布。修复及新版稿件已准备，尚未取得新版的正式 owner approval；不能把本地测试通过描述为云端监控恢复或文章上线。

## 当前生产证据

- Production HEAD：`d999e81169550c8bcfe52bcebbf5d5502f4818f7`，调查结束前再次读取仍一致。
- 最新确认的 [monitor 39701130938](https://github.com/qianquandong/aimanjack-site/actions/runs/39701130938) 于达拉斯时间 10 月 21 日 19:40 开始，失败原因仍是 `Site facts changed after approval; review again`。
- 同期 [publisher 39701109899](https://github.com/qianquandong/aimanjack-site/actions/runs/39701109899) 显示 success，但计划是 `runRequired:false`，安装、检查和发布步骤全部 skipped，没有发布验证 artifact。
- 实际 GET 检查：英文、中文正式 URL 均为 404；sitemap、英文和中文博客目录均无目标 URL。账本只有 10 月 14 日的 costs 文章，没有目标文章的 pending 或 verified 记录。
- 新稿正文、pillar 和 related 中的 12 个去重站内链接均通过实时 GET 检查。没有提交表单或调用生产业务 API。

原始状态、读取时间及只读检查结果在 [reapproval-evidence.json](../editorial/ai-training-2026-10-14/review/choose-corporate-ai-trainer-dallas-fort-worth.reapproval-evidence.json)。其中 localPatchedMonitor 是本地运行修复代码的结果，明确不是 GitHub 上的新成功运行。

## 从原审批版本到当前配置的差异

原审批运行 [38572484838](https://github.com/qianquandong/aimanjack-site/actions/runs/38572484838) 的代码版本为 `fdf16c5535c4517582de8fdba3df36d9c4d3d0d6`。读取该版本的 config，计算结果与旧审批完全吻合；这不是 LF/CRLF 差异。

| 项目 | 10 月 14 日版本 → 当前版本 | 对本稿的影响 |
| --- | --- | --- |
| 培训报价 | `programFrom:499` 和 `PROGRAM_PRICE` 已删除；所有形式按团队书面报价 | 实质变更；原中英文稿仍承诺每人 $499 起，必须修订和重新审批 |
| 旧 AI 前台页面 | legacy routes 从保留渲染改为停建，并列出退休路径，生产由既有 Worker 返回 410 | 正常业务调整，但需要核对文章链接；本稿无相关退休路径，12 个站内目标均可读取 |
| 报价表单/同意文案 | 新增 QUICK_FORM_VERSION；同意声明改为 privacy-2026-10-17-mailerlite | 本稿不描述表单同意细节；不能因此忽略整份配置的审批失效 |
| 社交资料 | 企业 LinkedIn/Facebook、个人 LinkedIn/X 等更新，个人 Facebook 从企业资料中移除 | 身份资料维护，本稿无这些旧 URL；无需据此改写正文 |
| 核心规格及证据 | 四次、每次 90 分钟和 PROOF 中的数量未变 | 没有编造或修改授课规格、客户效果或评分 |

完整差异：[config.diff](../editorial/ai-training-2026-10-14/review/choose-corporate-ai-trainer-dallas-fort-worth.config.diff)。

```text
原审批 config SHA-256
b09c0cad21fe40d919dabb7bcc8ad081d2978e535875bcaeda73aced580ec0b5

当前 config SHA-256
a06773fafab6bc3da356d32b81abdc07795fd0c6bfd06e7d1fe85f44d208fcdb
```

另查出一个会在重新审批后阻止发布的问题：`src/blog.mjs` 已因报价 CTA 更新和既有 AI Rollout Kit 表单而改变，其完整哈希不再符合原 `index-copy.json`。原先的六处目录文案修正均已在正式模板中生效。本次逐项检查这些文案，并比较首次发布之后的整个模板 diff，保留现有 CTA 和表单；不回退生产模板。

## 新的待审版本

目标：`choose-corporate-ai-trainer-dallas-fort-worth`。

- [English 全文](../editorial/ai-training-2026-10-14/review/choose-corporate-ai-trainer-dallas-fort-worth.en.html)
- [中文全文](../editorial/ai-training-2026-10-14/review/choose-corporate-ai-trainer-dallas-fort-worth.zh.html)

实际正文变更只有两段对应价格表述：

| 语言 | 原文 | 修订 |
| --- | --- | --- |
| English | The four-session program starts at $499 per person; workshop and onsite fees are by scoped quote. | Every format is priced by a written team quote based on group size, goals and preparation. |
| 中文 | 四次项目每人 $499 起；前两种按范围报价。 | 每种形式均按团队人数、目标和准备工作提供书面报价。 |

工具费用、DFW 以外差旅、两周回访和不包含 CRM/ERP 集成等范围说明均保留。没有新增客户成果、收益保证、评分或价格。

本稿使用独立的待审目录计划 `directory-copy/choose-corporate-ai-trainer-dallas-fort-worth.json`：精确绑定当前模板，before 与 after 相同，表示本次不修改模板。队列项和完整新计划一起进入新的双语 bundle。原共享目录计划和所有原审批记录保持原样。

```text
旧稿 bundle SHA-256
99125504db029a262a6c146686efbdf5d9d15dfc5090ac7da34beb00a240a0d5

新稿及新计划 bundle SHA-256（尚未批准）
2d89f87d9836a2937a304a5169b04c98cffd09f235988b2877740365c99483ed

完整当前模板 SHA-256
c650b6a5b71524505e4b3a5df5937a779113ef0c4170907e4889c8ae82edfb5b
```

旧审批另外逐字节归档在 [approval-history](../editorial/ai-training-2026-10-14/approval-history/choose-corporate-ai-trainer-dallas-fort-worth/2026-10-14.json)。它与 active approval 文件完全相同；Git 中的原记录和来源运行也保留。没有覆盖 active approval，没有改写其哈希，没有生成虚构的 approvedAt/approvedBy/approvalRun。

## 技术变更及验证边界

1. 审批校验保留所有条件，并给失效原因增加明确错误码。监控对配置、稿件或模板变更报告 `approval_blocked`，继续以 GET 采集正式页面、发现入口和运行证据，并保持失败状态。
2. GET 的 404 只允许用于诊断探测；正常页面验证及 GitHub 请求仍要求 200。存在页面或 HTTP 200 也不会被探测器标为 verified。
3. 到期审批失效时，publisher 计划明确失败，写入原因，且 `run_required=false`，不会选择部署工作。空队列、未来日期、非周三窗口和已完成周仍按原规则 no-op。
4. 新的 per-topic 目录计划只接受本稿自己的固定路径，其内容进入审批 bundle。审批和发布均核对精确模板，后续模板变化继续阻止发布。
5. ownerAction 在记录审批前增加模板预检，避免保存一个马上会被发布校验拒绝的版本。只有 owner 在 production 发起的既有 approve 工作流可以记录批准。

验证覆盖：全站构建；完整离线套件 309 项通过；全部十篇双语质量门禁无 FAIL；本稿 0 FAIL / 0 WARN；12 个实际站内链接 GET 全部通过；旧审批拒绝、稿件和模板变化拒绝、目录计划进入 bundle、404 诊断与正式验证隔离、绿色 no-op 不等于发布、审批阻塞 CLI 返回失败。其他稿件的价格及外部来源 WARN 仍保留，未因此放行旧审批。临时测试审批仅存在于测试临时目录，不会写入仓库或外部服务。

## 取得新版批准后的执行顺序

1. Owner 明确批准上面的新版全文、两段价格修订和模板快照，再合并修复 PR。代码变更采用普通 PR，不使用任何 SEO 自动发布命名分支。
2. 再读最新 production HEAD、config、模板、账本及运行状态。如果它们改变，重新核对，不照抄本报告的哈希。
3. 用 owner 身份在 **Approved bilingual blog publisher** 的 production 分支运行 `approve`，填写本稿 slug、新 bundle SHA-256，以及当日或之后的合法 Dallas `not_before` 日期。该动作只记录批准，不部署。GitHub 连接器未提供 dispatch 操作；可在获得授权后通过 GitHub 网页执行正式入口。
4. 读取新的审批运行和记录，确认 owner、配置及稿件版本。检查是否已有排队/运行中的发布或已完成记录，交给原有周三发布节奏；不得因旧失败通知再次发文。
5. 需要时先执行既有 dry-run。发布仍限周三 09:00–23:59 America/Chicago、每周一个主题、双语同批、待验证优先、普通 fast-forward push 及完整生产门禁。窗口关闭则等待下一合法窗口。
6. 发布后读取新账本，再运行只读监控；只有本稿同一版本的 verified 账本、两种语言页面及所有原有生产验证均通过，才能报告文章发布成功。

| 结果 | 能得出的结论 |
| --- | --- |
| 本地/CI 测试通过 | 修复通过离线验证；不代表云端生效或发布 |
| monitor no_due / waiting / running | 监控执行成功或正在观察；未确认文章发布 |
| monitor approval_blocked | 审批保护仍在阻止发布，需要正式复核 |
| publisher success 但步骤 skipped | no-op；不能当作文章发布成功 |
| monitor verified + 同版 verified 账本 + 实际页面核验通过 | 才能确认该版本双语文章真正发布 |

其他八篇未发布稿件也绑定旧 config，仍需各自核对和正式重新审批；本次没有为它们续批或改变正文。历史已发布文章的账本没有改动。
