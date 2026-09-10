# aimanjack.com — 生成的静态站

源在 `src/`，产物是根目录的 HTML（两者都提交）。零依赖，Node 22。

```bash
node scripts/build.mjs                                   # src/ → HTML + sitemap.xml
python3 -m http.server 8787 --directory .                # 本地预览（或 .claude/launch.json 的 aimanjack-static）
node scripts/health.mjs                                  # 日检；改版后加 --baseline
sh deploy.sh --preview                                   # 当前分支 → <branch>.aimanjack.pages.dev
sh deploy.sh                                             # production 分支上 = 正式上线 + IndexNow
```

改事实（电话、价格、预约链接、GA4）只改 `src/config.mjs`。页面在 `src/pages/`，中英文并排。结构和规矩见 `HANDOFF.md`。

**注意**：wrangler 按当前 git 分支名决定 prod 还是 preview，正式上线必须在 `production` 分支上跑。
