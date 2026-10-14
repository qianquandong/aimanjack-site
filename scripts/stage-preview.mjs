// Offline staging only. The preview project receives no production backend/config.
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile, copyFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const publicTypes = new Set(['.html', '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2']);
const internal = /^(?:src|db|functions|tests|scripts|docs|state|output|editorial|design-system|node_modules)\//;
export async function stagePreview(repo = resolve(dirname(fileURLToPath(import.meta.url)), '..')) {
  const git = (...args) => execFileSync('git', args, { cwd: repo, encoding: 'utf8' }).trim();
  const head = git('rev-parse', 'HEAD');
  const out = join(repo, '.preview'), site = join(out, 'site');
  await rm(out, { recursive: true, force: true });
  await mkdir(site, { recursive: true });
  const files = git('ls-files', '-z').split('\0').filter(Boolean).filter(p =>
    !p.startsWith('.') && !internal.test(p) && (publicTypes.has(extname(p)) || p === '_redirects'));
  const cssHash = createHash('sha256').update(await readFile(join(repo, 'style.css'))).digest('hex').slice(0, 8);
  for (const path of files) {
    await mkdir(dirname(join(site, path)), { recursive: true });
    if (!path.endsWith('.html')) { await copyFile(join(repo, path), join(site, path)); continue; }
    let html = await readFile(join(repo, path), 'utf8');
    html = html.replace(/href=(['"])https:\/\/(?:www\.)?aimanjack\.com(\/[^'"\s]*)?\1/g, (_m, quote, p) => `href=${quote}${p || '/'}${quote}`)
      .replace(/\/style\.css\?v=[0-9a-f]+/g, `/style.css?v=${cssHash}`)
      // The home page's absolute header must start after the inserted banner.
      .replace(/<body([^>]*)>/i, '<body$1><style>body.on-photo > header.hdr{top:auto}</style><aside role="note" style="position:relative;z-index:99999;background:#ffeb9c;color:#191919;padding:12px 20px;text-align:center;font:14px/1.5 system-ui">页面预览 · 不会保存预约或发送邮件 · 请勿输入真实管理令牌<br>Read-only preview — booking, mailbox connection and email APIs are disabled.</aside>');
    await writeFile(join(site, path), html);
  }
  await copyFile(new URL('../src/preview-worker.mjs', import.meta.url), join(site, '_worker.js'));
  await writeFile(join(site, '_routes.json'), JSON.stringify({ version: 1, include: ['/*'], exclude: [] }) + '\n');
  await writeFile(join(site, 'robots.txt'), 'User-agent: *\nDisallow: /\n');
  await writeFile(join(out, 'wrangler.jsonc'), JSON.stringify({ name: 'aimanjack-review', pages_build_output_dir: './site', compatibility_date: '2026-06-01', send_metrics: false, vars: { SITE_ENV: 'preview' }, env: { preview: { vars: { SITE_ENV: 'preview' } } } }, null, 2) + '\n');
  await writeFile(join(out, 'manifest.json'), JSON.stringify({ head, dirty: !!git('status', '--porcelain'), mode: 'read_only', fileCount: files.length + 3 }, null, 2) + '\n');
  return site;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) console.log(await stagePreview());
