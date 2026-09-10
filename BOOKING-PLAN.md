# 预约系统计划（2026-09-09）

目标：一套 AI Man Jack 自己的预约系统。先给自己用（网站的 `BOOK_URL`，演示线替来电者约 Jack 的 15 分钟），跑通之后就是产品里 Growth / Pro 方案的预约流程。不引入第三方预约 SaaS，第三方只做对接。

现状（2026-09-09）：演示线 +1 (469) 517-2968 在 Twilio 账户 `car-sms-agent` 下，语音入口 `https://voice.aimanjack.com/voice-rt`，现在只能答问题，不能查空位、不能写预约。W1 之后网页端能约了，第二 CTA 已是「Book a 15-min demo」→ `/book/`；语音端接入是 W2。

## 1. 范围（v1，能上线的最小版本）

| 块 | 内容 | 给谁用 |
|---|---|---|
| 数据 | Supabase Postgres（schema `booking`，Jack 2026-09-09 决定，不用 D1）：`businesses` `services` `staff` `availability_rules` `blocks` `bookings` `events`（每次改动一条流水） | 全部 |
| API | 一个 Worker：`GET /v1/availability`、`POST /v1/bookings`、`PATCH /v1/bookings/:id`（改期）、`DELETE /v1/bookings/:id`（取消）、`GET /v1/bookings?business=…`；每个写请求带 `Idempotency-Key`；时区固定 `America/Chicago`，对外只用 ISO 8601 带时区 | 网页、语音 agent、短信 agent |
| 网页预约 | `https://aimanjack.com/book/`（静态页 + 一小段 JS 调 API），选服务 → 选时段 → 留姓名电话 → 确认页。这个地址就是 `src/config.mjs` 的 `BOOK_URL` | 网站访客 |
| 语音工具 | 给 `voice-rt` 加四个 tool：`check_availability` `create_booking` `reschedule_booking` `cancel_booking`，全部打同一个 API，AI 只复述 API 返回的时段，不自己算 | 演示线，之后是客户的线 |
| 通知 | 来电者：确认短信（从 (469) 425-4142 发，A2P 已覆盖这个号；文案要走 SMS terms）。店主：每条新预约 / 改期 / 取消一条摘要短信。Jack 自己：同步到 Google Calendar（Pilot） | 全部 |
| 管理 | 先不做后台。用 Supabase 后台 / `scripts/supabase-sql.mjs` 和一个只读的 `/v1/bookings` 列表（Cloudflare Access 保护）看数据 | Jack |

不做的：支付和定金、多店、员工登录、顾客账户、邮件提醒。这些等第一个付费客户提出再说。

## 2. 规则引擎（服务协议里能写清楚的都在这）

- 营业时间按星期，支持午休和节假日 `blocks`。
- 服务有 `duration_min` 和 `buffer_min`；staff 可选，指定则只查该 staff 的空位。
- 提前量：最早 `min_lead_min`（默认 60 分钟），最远 `max_days_ahead`（默认 30 天）。
- 每时段容量 `capacity`（上门服务用「时间窗 + 容量」，美发用「staff + 时长」，同一套字段）。
- 改期和取消受 `cancel_window_hours` 限制，超过窗口 API 拒绝并返回原因，AI 照着说。
- 双重预订用 Postgres 函数 `booking.create_booking` / `move_booking` 挡住：每个 staff 一把 advisory lock，锁内查容量再写。
- 每次写入记 `events`（who: web / voice / sms / admin），案例页的数字从这张表出。

## 3. 里程碑

| 周 | 交付 | 验收 |
|---|---|---|
| W1 ✅ 2026-09-09 | D1 建表 + API + `/book/` 页面，只配 AI Man Jack 自己（一个 service：15 分钟通话）。实现：Pages Function `functions/v1/[[route]].js` + Supabase schema `booking`（PostgREST）+ `src/pages/book.mjs`；列表接口用 Bearer token 而不是 Cloudflare Access（够用，少一处配置） | 网页能约、改、取消（本地 + preview 跑过 `scripts/booking-smoke.mjs`）；`BOOK_URL='/book/'`，第二 CTA 已变「Book a 15-min demo」 |
| W2 | 语音四个 tool 接入 `voice-rt`；确认短信 | 打演示线完成 PRD 的三件事：问价、约时间、改时间；来电者收到确认短信 |
| W3 | Google Calendar 同步（Jack 的日历）；店主摘要短信；`events` 汇总脚本 | 日历里出现预约；案例页能从 `events` 出数 |
| W4 | 第一个 Growth 客户配置：services / staff / rules 从表单导入 | 客户的线端到端走通一次真实预约 |

## 4. 第三方对接测试（网站 `/integrations` 标签升级的依据）

顺序按客户可能用的概率排：Google Calendar → Square Appointments → Booksy → Vagaro → Fresha → Calendly → RingCentral / Grasshopper。

每个系统跑同一张测试卡，全过才能标「Supported」，过一半标「Pilot」，没跑标「Ask us」：

1. 读空位：拿到未来 7 天的可约时段，和对方后台一致。
2. 写预约：API 创建一条，对方后台 30 秒内出现，字段（姓名、电话、服务、时间）都对。
3. 改期：改到另一个时段，旧的消失，新的出现。
4. 取消：对方后台状态变取消。
5. 失败回退：故意断开 token，AI 走兜底（留言 / 转接 / 短信店主），Jack 收到告警。
6. 双写冲突：对方后台手工占了一个时段，API 查空位不再返回它。

结果回写 `src/components.mjs` 的 `INTEGRATIONS`，重建站点，`node scripts/health.mjs --baseline`。

## 5. 数据和归属

- 预约数据属于对应客户，存在客户自己的 `business` 记录下；不跨客户共享，不出售。
- 号码归客户（2026-09-09 第二轮评审后定）：客户转接的自有号码关掉转接即可；AI Man Jack 帮申请的号码，服务结束时按运营商规定转到客户名下。不锁客户。
- 通话录音和转写：v1 不存录音，只存结构化结果（意图、时段、结果）和 Twilio 的通话元数据。

## 6. 网站需要同步改的地方

- `src/config.mjs`：`BOOK_URL`。
- `/case-studies/ai-man-jack/`：W3 之后用 `events` 表出第一个完整月的数字。
- `/integrations/`：按第 4 节的结果改标签。
- FAQ 第 5 条（改期取消）：上线后把「being built」的口径删掉。
