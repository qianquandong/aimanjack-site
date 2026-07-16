# aimanjack.com — 纯静态站

一个 `index.html`，零依赖。本地预览：直接双击打开，或 `python3 -m http.server --directory .`。

## 上线前待办

- [x] 电话已填：(832) 888-6016
- [x] 邮箱已填：jack@aimanjack.com（收件已验证通）

## 部署（Cloudflare Pages）

```sh
npx wrangler pages project create aimanjack --production-branch main
npx wrangler pages deploy . --project-name aimanjack
```

以后改完再跑第二条命令即可。

## 域名从 Shopify 切过来

1. Cloudflare Pages 项目 → Custom domains → 加 `www.aimanjack.com` 和 `aimanjack.com`
2. DNS 里把原来指向 Shopify 的记录（A 23.227.38.65 / CNAME shops.myshopify.com 之类）删掉，按 Pages 提示指到 `aimanjack.pages.dev`
3. 确认新站通了之后，再去 Shopify 后台把域名解绑、关店（别忘了先导出订单/客户数据，Shopify 月费也记得停）
