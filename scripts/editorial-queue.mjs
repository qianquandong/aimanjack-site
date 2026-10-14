// Internal draft review and exact-version approval. Never publishes or contacts booking/email APIs.
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const PACK = 'editorial/ai-training-2026-10-14';
// Source approvals must survive Windows CRLF versus Linux LF checkouts. All hashed values here are UTF-8 text.
export const sha256 = value => createHash('sha256').update((typeof value === 'string' ? value : Buffer.from(value).toString('utf8')).replace(/\r\n/g, '\n')).digest('hex');
export const approvalBundle = (sourceBytes, item, directoryBytes) => Buffer.concat([sourceBytes, Buffer.from('\nRELEASE_PLAN\n' + JSON.stringify(item) + '\nDIRECTORY_COPY\n'), directoryBytes]);
export const textOnly = value => value.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&#160;|&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'").replace(/\s+/g, ' ').trim();
export const dateInChicago = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
export function weekInChicago(now = new Date()) {
  const d = new Date(`${dateInChicago(now)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function routeOf(post) {
  const route = post.path || `/blog/${post.slug}/`;
  if (!/^\/(blog|resources)\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/.test(route)) throw new Error('Unexpected article route');
  return route;
}
export async function json(path, fallback) {
  try { return JSON.parse(await readFile(path, 'utf8')); }
  catch (e) { if (e.code === 'ENOENT' && fallback !== undefined) return fallback; throw e; }
}
export function assertApproval(record, bytes, configBytes, owner, now = new Date()) {
  if (!record || record.approvedBy !== owner || record.approved !== true) throw new Error('No owner approval for this draft');
  if (record.draftSha256 !== sha256(bytes)) throw new Error('Draft changed after approval');
  if (record.configSha256 !== sha256(configBytes)) throw new Error('Site facts changed after approval; review again');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(record.notBefore || '') || Number.isNaN(Date.parse(record.notBefore)) || new Date(record.notBefore).toISOString().slice(0, 10) !== record.notBefore) throw new Error('Approval needs a valid release date');
  if (record.notBefore > dateInChicago(now)) throw new Error('Approved release is not due');
  if (!record.approvedAt || !record.approvalRun) throw new Error('Approval provenance is missing');
}
export async function loadQueue(root = ROOT) {
  const queue = await json(join(root, PACK, 'queue.json'));
  if (queue.version !== 1 || queue.owner !== 'qianquandong' || queue.timezone !== 'America/Chicago') throw new Error('Unexpected editorial queue configuration');
  const seen = new Set();
  for (const item of queue.items) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) || seen.has(item.slug)) throw new Error('Invalid or duplicate slug');
    seen.add(item.slug);
    routeOf(item);
  }
  return queue;
}
export async function draftFor(item, root = ROOT) {
  const file = join(root, PACK, 'posts', `${item.slug}.mjs`);
  const sourceBytes = await readFile(file);
  // One review hash covers EN + ZH, URL/date/baseline plan and the directory-copy correction.
  const bytes = approvalBundle(sourceBytes, item, await readFile(join(root, PACK, 'index-copy.json')));
  const { post } = await import(`${pathToFileURL(file).href}?sha=${sha256(sourceBytes)}`);
  if (post.slug !== item.slug || routeOf(post) !== routeOf(item) || post.status !== 'draft') throw new Error(`Draft identity/status mismatch: ${item.slug}`);
  if (!post.en || !post.zh) throw new Error('Both language versions are required');
  return { post, bytes, file, digest: sha256(bytes) };
}
export async function applyDirectoryCopy(root = ROOT) {
  const policy = await json(join(root, PACK, 'index-copy.json'));
  const path = join(root, 'src/blog.mjs'), current = await readFile(path, 'utf8');
  if (sha256(current) === policy.rendererAfterSha256) return;
  if (sha256(current) !== policy.rendererBeforeSha256) throw new Error('Blog renderer changed; reconcile directory copy before publication');
  let next = current;
  for (const [from, to] of policy.replacements) {
    if (next.split(from).length !== 2) throw new Error('Directory-copy replacement no longer matches');
    next = next.replace(from, to);
  }
  if (sha256(next) !== policy.rendererAfterSha256) throw new Error('Directory-copy result does not match the reviewed version');
  await writeFile(path, next);
}
export async function inspect(root = ROOT, now = new Date()) {
  const queue = await loadQueue(root), config = await readFile(join(root, 'src/config.mjs'));
  const ledger = await json(join(root, PACK, 'ledger.json'), []), rows = [];
  for (const item of [...queue.items].sort((a, b) => a.order - b.order)) {
    const draft = await draftFor(item, root), record = await json(join(root, PACK, 'approvals', `${item.slug}.json`), null);
    let eligible = true, reason = 'Approved and due';
    try { assertApproval(record, draft.bytes, config, queue.owner, now); }
    catch (e) { eligible = false; reason = e.message; }
    if (ledger.some(x => x.slug === item.slug && x.draftSha256 === draft.digest && x.state === 'verified')) { eligible = false; reason = 'This version is already published and verified'; }
    rows.push({ ...item, draftSha256: draft.digest, eligible, reason });
  }
  return { owner: queue.owner, timezone: queue.timezone, today: dateInChicago(now), week: weekInChicago(now), ledger, items: rows };
}
export function chooseRelease(report) {
  const pending = report.ledger.find(x => x.state === 'pending-verification');
  if (pending) {
    const item = report.items.find(x => x.slug === pending.slug && x.draftSha256 === pending.draftSha256);
    if (!item?.eligible) throw new Error('Pending release approval is no longer valid');
    return { item, pending };
  }
  if (report.ledger.some(x => (x.verifiedWeek || x.week) === report.week && x.state === 'verified')) return null;
  const item = report.items.find(x => x.eligible);
  return item ? { item, pending: null } : null;
}
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
export async function renderReview(root = ROOT) {
  const report = await inspect(root), out = join(root, PACK, 'review');
  await mkdir(out, { recursive: true });
  const style = 'body{font:17px/1.75 system-ui,sans-serif;color:#18332c;background:#fafaf6;margin:0}main{max-width:850px;padding:32px 24px;margin:auto}h1,h2,h3{line-height:1.3}h2{margin-top:2em}a{color:#075b4a}table{border-collapse:collapse;width:100%;font-size:15px}td,th{border:1px solid #cad6cf;padding:10px;text-align:left}pre{white-space:pre-wrap;background:#eef1eb;padding:16px}aside{padding:14px 18px;background:#fff0bb;border-radius:8px}.meta{color:#50645b;font-size:14px}li{margin-bottom:6px}';
  const wrap = (lang, title, body) => `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${escape(title)}</title><style>${style}</style><main>${body}</main></html>`;
  const links = [];
  for (const item of report.items) {
    const { post } = await draftFor(item, root);
    for (const lang of ['en', 'zh']) {
      const c = post[lang], name = `${item.slug}.${lang}.html`;
      const body = `<a href="index.html">← 全部稿件 / All drafts</a><p class="meta">${escape(item.slug)} · ${item.existing ? 'Existing article revision / 已有文章修订稿' : 'New article / 新文章'}</p><aside>待 Jack 审阅，尚未批准排期。Draft for Jack’s review; not approved for publication.<br>内容版本 SHA-256: <code>${item.draftSha256}</code></aside><h1>${c.h1}</h1><p>${c.sub}</p><p class="meta">Proposed title: ${escape(c.title)}<br>Description: ${escape(c.description)}</p><ul>${c.takeaways.map(x => `<li>${x}</li>`).join('')}</ul>${c.sections}<h2>${lang === 'zh' ? '常见问题' : 'Questions and answers'}</h2>${c.faq.map(([q, a]) => `<h3>${q}</h3><p>${a}</p>`).join('')}<h2>${lang === 'zh' ? '资料及相关页面' : 'Sources and related pages'}</h2><ul>${[...(c.sources || []), ...(c.related || [])].map(([t, u]) => `<li><a href="${u.startsWith('/') ? 'https://aimanjack.com' + (lang === 'zh' ? '/zh' : '') + u : u}">${t}</a></li>`).join('')}</ul>`;
      await writeFile(join(out, name), wrap(lang, c.h1, body.replace(/href="\/(?!\/)/g, 'href="https://aimanjack.com/')));
    }
    links.push(`<tr><td>${item.order}</td><td>${post.zh.h1}<br>${post.en.h1}</td><td>${item.existing ? '修订 / Update' : '新增 / New'}</td><td><a href="${item.slug}.zh.html">中文全文</a> · <a href="${item.slug}.en.html">English</a></td></tr>`);
  }
  const policy = await json(join(root, PACK, 'index-copy.json'));
  await writeFile(join(out, 'index.html'), wrap('zh', 'Aimanjack AI 培训文章待审稿', `<h1>Aimanjack AI 培训文章待审稿</h1><p>10 个主题，20 篇完整语言稿。现有文章保留原网址。每周三达拉斯时间上午 9 点最多发布一个已批准主题，中英文同批。</p><aside>目前所有新稿和修订稿均待批准。批准绑定中英文正文、原网址、生产基线、日期方案及下方目录说明；任何部分修改后需要重新批准。正式网站尚未应用这些稿件。</aside><table><thead><tr><th>顺序</th><th>主题</th><th>类型</th><th>阅读</th></tr></thead><tbody>${links.join('')}</tbody></table><h2>随首次批准文章上线的目录说明</h2><p>目录从“每篇都记录课堂真实发生的事情”调整为培训指南与明确标注的教学示例，避免把模拟练习说成真实经历。以下变更包含在每篇批准摘要中。</p><ul>${policy.replacements.map(([from, to]) => `<li><del>${escape(from)}</del><br>${escape(to)}</li>`).join('')}</ul>`));
  return out;
}
export async function validateAll(root = ROOT) {
  const queue = await loadQueue(root);
  for (const item of queue.items) {
    const { file } = await draftFor(item, root);
    execFileSync(process.execPath, ['scripts/blog-check.mjs', item.slug, '--file', file], { cwd: root, stdio: 'inherit' });
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mode = process.argv[2] || 'inspect';
  if (mode === 'inspect') console.log(JSON.stringify(await inspect(), null, 2));
  else if (mode === 'review') console.log(await renderReview());
  else if (mode === 'check') await validateAll();
  else throw new Error('Usage: node scripts/editorial-queue.mjs [inspect|review|check]');
}
