# aimanjack.com DNS 迁移清单（GoDaddy → Cloudflare）

抓取时间：2026-07-16。原 nameserver：ns03/ns04.domaincontrol.com（GoDaddy）。

搬 nameserver 前，以下记录必须在 Cloudflare zone 里全部存在。邮箱/通讯类**一条都不能丢**。

## 邮箱 + 通讯（Microsoft 365，关键，不能断）

| 类型 | 名称 | 值 | 备注 |
|------|------|-----|------|
| MX | @ | `aimanjack-com.mail.protection.outlook.com` | 优先级 0 |
| TXT | @ | `v=spf1 include:secureserver.net -all` | SPF |
| TXT | @ | `NETORGFT20764012.onmicrosoft.com` | M365 域名验证 |
| TXT | _dmarc | `v=DMARC1; p=quarantine; adkim=r; aspf=r; rua=mailto:dmarc_rua@onsecureserver.net;` | DMARC |
| CNAME | autodiscover | `autodiscover.outlook.com` | Outlook 自动发现 |
| CNAME | lyncdiscover | `webdir.online.lync.com` | Teams/Skype |
| CNAME | sip | `sipdir.online.lync.com` | Teams/Skype |
| CNAME | msoid | `clientconfig.microsoftonline-p.net` | M365 |
| SRV | _sip._tls | `100 1 443 sipdir.online.lync.com` | |
| SRV | _sipfederationtls._tcp | `100 1 5061 sipfed.online.lync.com` | |

DKIM selector1/selector2 当前无记录，无需迁。

## 网站（这次要换掉，指向 Cloudflare Pages）

原 Shopify 记录（迁移后删掉，改由 Pages custom domain 自动生成）：
- A `@` → 23.227.38.32（Shopify）
- CNAME `www` → shops.myshopify.com（Shopify）

目标：Pages 项目 `aimanjack` 绑定 apex + www，Cloudflare 自动建 CNAME（apex 走 flattening）。

## Cloudflare 分配的 nameserver（GoDaddy 要改成这两个）

- `dom.ns.cloudflare.com`
- `ziggy.ns.cloudflare.com`

删掉原来的 `ns03.domaincontrol.com` / `ns04.domaincontrol.com`。GoDaddy 侧关掉 DNSSEC。

## 进度（2026-07-16）

- [x] 1. Cloudflare 加 zone `aimanjack.com`（Free）完成，自动扫描导入了 15 条记录
- [x] 2. 核对邮箱记录：MX / 2×TXT(SPF+M365) / DMARC / 2×SRV / autodiscover / lyncdiscover / sip / msoid 全部导入。唯一没导入的是 Shopify 的 `dns-verification.shopify.com` 验证 CNAME（关店后无用，忽略）
- [x] 3. Cloudflare nameserver：dom.ns.cloudflare.com / ziggy.ns.cloudflare.com
- [x] 4. GoDaddy 改 nameserver：完成（2026-07-16，Jack 在浏览器弹窗手输 6 位码通过）。GoDaddy 显示 "Using custom nameservers" dom.ns/ziggy.ns.cloudflare.com，传播中
- [x] 5. 7 条服务 CNAME（autodiscover/lyncdiscover/sip/msoid/email/pay/_domainconnect）全部改成 DNS only 灰云
- [x] 6. 删了 Shopify web 记录（apex A + www）→ Pages 绑 aimanjack.com + www，CF 自动建 CNAME @ / www → aimanjack.pages.dev
- [ ] 7. 待 Jack 手动：Shopify 导出订单/客户数据 → 关店停月费（域名已不指向 Shopify，店铺现在是孤儿）

## 完成状态（2026-07-16）

- NS 已传播：1.1.1.1 返回 dom.ns/ziggy.ns.cloudflare.com，apex 解析到 Cloudflare IP
- **站点已上线**：https://aimanjack.com + https://www.aimanjack.com 都 HTTP 200，SSL OK，标题正确
- 邮箱：MX/SPF/DMARC/autodiscover/Teams 记录全部迁移且 DNS-only，jack@aimanjack.com 应继续正常收信（M365 未动）
- CF 自建部署：https://aimanjack.pages.dev
