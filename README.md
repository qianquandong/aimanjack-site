# aimanjack.com — 生成的静态站

源在 `src/`，产物是根目录的 HTML（两者都提交）。零依赖，Node 22。

```bash
node scripts/build.mjs                                   # src/ → HTML + sitemap.xml
python3 -m http.server 8787 --directory .                # 本地预览（或 .claude/launch.json 的 aimanjack-static）
node scripts/health.mjs                                  # 日检；改版后加 --baseline
sh deploy.sh                                             # 构建、测试、生成 .preview/site；不上传
sh deploy.sh --preview                                   # 只读预览 → aimanjack-review 项目的 review-<commit> 分支
sh deploy.sh --production                                # 仅 production 分支：正式上线 + IndexNow（需单独授权）
```

改事实（电话、价格、预约链接、GA4）只改 `src/config.mjs`。页面在 `src/pages/`，中英文并排。结构和规矩见 `HANDOFF.md`。

预览包不包含正式后端或数据库配置，所有 `/v1/*` 接口返回 `503 preview_read_only`；只能检查页面。脚本明确指定目标项目和分支，不依赖当前分支推断。正式配置仅在 `wrangler.toml [env.production.vars]`。完整功能预览需要另行准备独立数据库与测试邮箱，不得复用正式凭据。

原 `aimanjack` 项目的 Cloudflare Git 自动构建命令为 `node scripts/cloudflare-preview-build.mjs`，输出目录保持 `.deploy`，Node 版本由 `.node-version` 固定为 22。该入口仅接受 Pages 的非 production 分支且 `SITE_ENV=preview`；构建及完整离线测试通过后，复制只读页面包和拦截 API 的 `_worker.js` 到输出目录。自动构建不支持正式发布，正式发布仍需单独授权后手动执行。
