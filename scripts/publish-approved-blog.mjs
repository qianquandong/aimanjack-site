// Cloud job. Only an owner-approved, exact-version bilingual draft may reach deploy.sh --production.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { ROOT, PACK, sha256, json, loadQueue, draftFor, draftForRelease, inspect, chooseRelease, routeOf, textOnly, dateInChicago, weekInChicago, isDallasPublicationWindow, applyDirectoryCopy } from './editorial-queue.mjs';
import { render } from '../src/layout.mjs';

const REPO = 'qianquandong/aimanjack-site';
const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
const run = (cmd, args) => execFileSync(cmd, args, { cwd: ROOT, stdio: 'inherit' });
function api(path, body, method) {
  return JSON.parse(execFileSync('gh', ['api', path, ...(body ? ['--input', '-'] : []), ...(method ? ['--method', method] : [])], { cwd: ROOT, encoding: 'utf8', input: body ? JSON.stringify(body) : undefined }));
}
async function remoteWrite(path, value, message) {
  let old;
  try { old = api(`repos/${REPO}/contents/${path}?ref=production`); }
  catch (e) { if (!String(e.stderr).includes('404')) throw e; }
  return api(`repos/${REPO}/contents/${path}`, { branch: 'production', message, content: Buffer.from(JSON.stringify(value, null, 2) + '\n').toString('base64'), ...(old ? { sha: old.sha } : {}) }, 'PUT');
}
const sourceHash = async path => existsSync(join(ROOT, path)) ? sha256(await readFile(join(ROOT, path))) : null;
async function ownerAction(mode) {
  if (process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch' || process.env.GITHUB_ACTOR !== 'qianquandong' || process.env.GITHUB_REF !== 'refs/heads/production') throw new Error('Approval/revocation requires an owner dispatch on production');
  const queue = await loadQueue(), item = queue.items.find(x => x.slug === process.env.BLOG_SLUG);
  if (!item) throw new Error('Select a known draft slug');
  const path = `${PACK}/approvals/${item.slug}.json`;
  if (mode === 'revoke') {
    const old = api(`repos/${REPO}/contents/${path}?ref=production`);
    api(`repos/${REPO}/contents/${path}`, { branch: 'production', sha: old.sha, message: `Revoke editorial approval: ${item.slug}` }, 'DELETE');
    console.log('Approval revoked. No site deployment.');
    return;
  }
  const draft = await draftFor(item);
  if (process.env.BLOG_DRAFT_SHA256 !== draft.digest) throw new Error('Enter the exact SHA-256 shown in the draft review; approval was not saved');
  const date = process.env.BLOG_NOT_BEFORE || '';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || date < dateInChicago()) throw new Error('Choose a valid release date today or later');
  if (await sourceHash(`src/posts/${item.slug}.mjs`) !== item.baseSourceSha256) throw new Error('The existing production article changed; reconcile it before approval');
  const record = { approved: true, slug: item.slug, draftSha256: draft.digest, configSha256: sha256(await readFile(join(ROOT, 'src/config.mjs'))), approvedBy: process.env.GITHUB_ACTOR, approvedAt: new Date().toISOString(), notBefore: date, approvalRun: `https://github.com/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID}` };
  await remoteWrite(path, record, `Approve exact bilingual draft for scheduled release: ${item.slug}`);
  console.log(`Owner approval recorded for ${item.slug}, not before ${date}. No site deployment.`);
}
const PUBLIC_ORIGIN = 'https://aimanjack.com';
function safePublicUrl(path, base = PUBLIC_ORIGIN) {
  const url = new URL(path, base);
  let decodedPath;
  try { decodedPath = new URL(decodeURIComponent(url.pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/'), PUBLIC_ORIGIN).pathname; }
  catch { throw new Error('Invalid public verification URL'); }
  if (url.origin !== PUBLIC_ORIGIN || /^\/v1(?:\/|$)/i.test(decodedPath)) throw new Error('Public verification is limited to first-party pages; no APIs');
  return url;
}
async function getPublic(path) {
  let url = safePublicUrl(path);
  // Follow redirects ourselves, so a public page cannot redirect verification to an API or another host.
  for (let redirects = 0; redirects <= 5; redirects++) {
    const r = await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': 'Aimanjack-Publication-Verification/1.0', 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
    if ([301, 302, 303, 307, 308].includes(r.status)) {
      const location = r.headers?.get('location');
      if (!location) throw new Error(`Public redirect has no destination: ${path}`);
      url = safePublicUrl(location, url);
      continue;
    }
    if (r.status !== 200) throw new Error(`Public GET failed: ${path} (${r.status})`);
    if (r.url) safePublicUrl(r.url);
    return { url: url.href, html: await r.text(), robotsHeader: r.headers?.get('x-robots-tag') || '' };
  }
  throw new Error(`Too many public redirects: ${path}`);
}
const protectedPages = ['/ai-training/', '/zh/ai-training/', '/book/', '/zh/book/', '/contact/', '/zh/contact/'];
async function publicBaseline() {
  const result = {};
  await Promise.all(protectedPages.map(async path => { const { html } = await getPublic(path); const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]; if (!main) throw new Error(`Protected page has no main: ${path}`); result[path] = sha256(textOnly(main)); }));
  return result;
}
export function allowedReleasePath(path, item) {
  const route = routeOf(item).slice(1);
  return [`src/posts/${item.slug}.mjs`, 'src/blog.mjs', `${route}index.html`, `zh/${route}index.html`, 'blog/index.html', 'zh/blog/index.html', 'sitemap.xml', 'llms.txt', `${PACK}/ledger.json`].includes(path);
}
function assertReleaseDiff(item) {
  const tracked = git('diff', '--name-only').split('\n').filter(Boolean);
  const untracked = git('ls-files', '--others', '--exclude-standard').split('\n').filter(Boolean);
  const bad = [...tracked, ...untracked].filter(p => !allowedReleasePath(p, item));
  if (bad.length) throw new Error(`Unexpected changed files; release stopped: ${bad.join(', ')}`);
  return [...new Set([...tracked, ...untracked])];
}
const decodeEntities = value => value.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity) => {
  if (entity[0] !== '#') return ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity.toLowerCase()];
  const code = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
  return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
});
function attributes(tag) {
  const result = {};
  for (const m of tag.matchAll(/([^\s=<>\/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)) result[m[1].toLowerCase()] = decodeEntities(m[2] ?? m[3] ?? m[4]);
  return result;
}
function decodeProtectedEmail(hex) {
  if (!/^(?:[0-9a-f]{2}){2,}$/i.test(hex || '')) throw new Error('Invalid Cloudflare email protection data');
  const bytes = Buffer.from(hex, 'hex'), email = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(bytes.subarray(1), b => b ^ bytes[0]));
  if (!email.includes('@') || /[\x00-\x20<>"']/.test(email)) throw new Error('Invalid Cloudflare protected email');
  return email;
}
const escapeText = value => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function normalizeCloudflare(html) {
  // Cloudflare can replace a visible address with a span or an anchor; decode it without executing its script.
  return html.replace(/<(span|a)\b([^>]*\bdata-cfemail\s*=\s*(?:"[^"]*"|'[^']*')[^>]*)>[\s\S]*?<\/\1>/gi, (whole, tag, attrs) => {
    const email = escapeText(decodeProtectedEmail(attributes(attrs)['data-cfemail']));
    return tag.toLowerCase() === 'a' ? `<a${attrs}>${email}</a>` : email;
  }).replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (whole, attrs) => {
    const src = attributes(attrs).src;
    if (!src) return whole;
    const scriptUrl = new URL(src, PUBLIC_ORIGIN);
    return scriptUrl.origin === PUBLIC_ORIGIN && /^\/cdn-cgi\/scripts\/[^?#]*\/cloudflare-static\/email-decode\.min\.js$/i.test(scriptUrl.pathname) ? '' : whole;
  });
}
function mainOf(html) {
  const main = normalizeCloudflare(html).match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  if (!main) throw new Error('Article main content missing');
  return main;
}
const normalizedText = html => decodeEntities(textOnly(html)).replace(/\s+/g, ' ').trim();
function resourceUrl(value, base, attrs = {}) {
  const url = new URL(value, base);
  if (url.origin === PUBLIC_ORIGIN && url.pathname === '/cdn-cgi/l/email-protection') {
    return new URL(`mailto:${decodeProtectedEmail(url.hash.slice(1) || attrs['data-cfemail'])}`).href;
  }
  return url.href;
}
function resourcesOf(main, base) {
  const resources = new Map();
  // Keep authored script src attributes but ignore script contents, including JSON-LD strings.
  const markup = main.replace(/<script\b([^>]*)>[\s\S]*?<\/script>/gi, (_, attrs) => `<script ${attrs}></script>`);
  for (const tag of markup.matchAll(/<[a-z][^>]*>/gi)) {
    const attrs = attributes(tag[0]);
    for (const name of ['href', 'src']) if (attrs[name] !== undefined) {
      const url = resourceUrl(attrs[name], base, attrs);
      resources.set(`${name}:${url}`, url);
    }
    if (attrs.srcset) for (const entry of attrs.srcset.split(',')) {
      const [raw, ...descriptor] = entry.trim().split(/\s+/);
      if (!raw) continue;
      const url = resourceUrl(raw, base, attrs);
      resources.set(`srcset:${url} ${descriptor.join(' ')}`.trim(), url);
    }
  }
  return resources;
}
function headSignals(html, base) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  if (!head) throw new Error('Article head missing');
  const description = [], canonical = [], hreflang = [], robots = [];
  for (const tag of head.matchAll(/<(meta|link)\b[^>]*>/gi)) {
    const a = attributes(tag[0]), name = a.name?.toLowerCase(), rel = a.rel?.toLowerCase().split(/\s+/) || [];
    if (name === 'description') description.push((a.content || '').replace(/\s+/g, ' ').trim());
    if (['robots', 'googlebot', 'bingbot'].includes(name)) robots.push(a.content || '');
    if (rel.includes('canonical')) canonical.push(resourceUrl(a.href || '', base));
    if (rel.includes('alternate') && a.hreflang) hreflang.push(`${a.hreflang.toLowerCase()}:${resourceUrl(a.href || '', base)}`);
  }
  return { title: [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)].map(m => normalizedText(m[1])), description, canonical: canonical.sort(), hreflang: hreflang.sort(), noindex: robots.some(value => /\bnoindex\b/i.test(value)) };
}
const stable = value => JSON.stringify(value, (_, item) => item && typeof item === 'object' && !Array.isArray(item) ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
function articleSchemas(html) {
  const nodes = [];
  const walk = value => {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (!value || typeof value !== 'object') return;
    const types = Array.isArray(value['@type']) ? value['@type'] : [value['@type']];
    if (types.includes('Article') || types.includes('FAQPage')) nodes.push(value);
    if (value['@graph']) walk(value['@graph']);
  };
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attributes(m[1]).type?.toLowerCase() !== 'application/ld+json') continue;
    try { walk(JSON.parse(m[2])); }
    catch { throw new Error('Invalid Article/FAQ JSON-LD'); }
  }
  return nodes.map(stable).sort();
}
export async function verifyArticle(post) {
  const checked = [], targets = new Map();
  const rendererFile = join(ROOT, 'src/blog.mjs');
  // applyDirectoryCopy may have changed this module earlier in this process. Bind expected output to current bytes.
  const { postPage } = await import(`${pathToFileURL(rendererFile).href}?verify=${sha256(await readFile(rendererFile))}`);
  const siteMap = await getPublic('/sitemap.xml');
  for (const lang of ['en', 'zh']) {
    const path = (lang === 'zh' ? '/zh' : '') + routeOf(post), canonical = `${PUBLIC_ORIGIN}${path}`;
    const live = await getPublic(path), expected = render({ path: routeOf(post), ...postPage(post, lang) }, lang);
    const liveMain = mainOf(live.html), expectedMain = mainOf(expected);
    if (normalizedText(liveMain) !== normalizedText(expectedMain)) throw new Error(`Live main differs from approved release: ${path}`);
    const liveResources = resourcesOf(liveMain, canonical), expectedResources = resourcesOf(expectedMain, canonical);
    if (stable([...liveResources.keys()].sort()) !== stable([...expectedResources.keys()].sort())) throw new Error(`Live links/assets differ from approved release: ${path}`);
    const actualHead = headSignals(live.html, canonical), expectedHead = headSignals(expected, canonical);
    for (const field of ['title', 'description', 'canonical', 'hreflang']) if (stable(actualHead[field]) !== stable(expectedHead[field])) throw new Error(`Live ${field} differs from approved release: ${path}`);
    if (actualHead.noindex || /\bnoindex\b/i.test(live.robotsHeader) || !siteMap.html.includes(`<loc>${canonical}</loc>`)) throw new Error(`Indexability/sitemap differs: ${path}`);
    if (stable(articleSchemas(live.html)) !== stable(articleSchemas(expected))) throw new Error(`Live Article/FAQ JSON-LD differs from approved release: ${path}`);
    for (const href of liveResources.values()) {
      const url = new URL(href);
      if (url.origin !== PUBLIC_ORIGIN) continue; // No external, mailto, sms or tel requests.
      safePublicUrl(url);
      const key = url.pathname + url.search;
      if (!targets.has(key)) targets.set(key, new Set());
      if (url.hash) targets.get(key).add(decodeURIComponent(url.hash.slice(1)));
    }
    targets.set(path, targets.get(path) || new Set());
    checked.push({ path, contentSha256: sha256(normalizedText(liveMain)), resourcesSha256: sha256(stable([...liveResources.keys()].sort())), canonical, status: 200 });
  }
  const pending = [...targets];
  while (pending.length) await Promise.all(pending.splice(0, 5).map(async ([path, anchors]) => {
    const { html } = await getPublic(path);
    const ids = new Set([...html.matchAll(/<[a-z][^>]*>/gi)].map(tag => attributes(tag[0]).id).filter(Boolean));
    for (const id of anchors) if (!ids.has(id)) throw new Error(`Broken anchor: ${path}#${id}`);
  }));
  return { checked, firstPartyPagesChecked: targets.size };
}
async function publish() {
  if (process.env.GITHUB_REF !== 'refs/heads/production' || git('branch', '--show-current') !== 'production') throw new Error('Publishing requires the latest production branch');
  if (git('status', '--porcelain')) throw new Error('Publishing requires a clean checkout');
  const report = await inspect(), selection = chooseRelease(report);
  if (!selection) { console.log('No due owner-approved manuscript, or this week already completed. Nothing published.'); return; }
  if (process.env.BLOG_AUTOPUBLISH_ENABLED !== 'true') throw new Error('Publishing is not enabled');
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) throw new Error('Cloudflare deployment credentials are missing; no article or branch was changed');
  const { item, pending } = selection, { post, digest } = await draftForRelease(item);
  git('fetch', 'origin', 'production');
  if (git('rev-parse', 'HEAD') !== git('rev-parse', 'origin/production')) throw new Error('Production advanced; rerun against its latest version');
  const liveBefore = await publicBaseline(), before = pending?.protectedBefore || liveBefore, source = `src/posts/${item.slug}.mjs`;
  if (protectedPages.some(path => before[path] !== liveBefore[path])) throw new Error('Protected page drift since the pending release; manual review required');
  let ledger = report.ledger, entry = pending;
  if (!pending) {
    if (await sourceHash(source) !== item.baseSourceSha256) throw new Error('Someone changed the current article; reconcile it instead of overwriting');
    const date = dateInChicago();
    const released = { ...post, status: 'published', date: item.existing ? item.originalDate : date, updated: item.existing ? date : undefined };
    if (!released.date) throw new Error('Original publication date missing');
    await applyDirectoryCopy();
    await writeFile(join(ROOT, source), `// Owner-approved bilingual editorial release.\nexport const post = ${JSON.stringify(released, null, 2)};\n`);
    entry = { slug: item.slug, draftSha256: digest, releaseSourceSha256: await sourceHash(source), protectedBefore: before, week: report.week, date, state: 'pending-verification', preparedAt: new Date().toISOString() };
    ledger = [...ledger, entry];
    await writeFile(join(ROOT, PACK, 'ledger.json'), JSON.stringify(ledger, null, 2) + '\n');
    run(process.execPath, ['scripts/blog-check.mjs', item.slug]);
    run(process.execPath, ['scripts/build.mjs']);
    run(process.execPath, ['--test', ...git('ls-files', 'tests/*.test.mjs').split('\n').filter(Boolean)]);
    const files = assertReleaseDiff(item);
    if (!files.includes(source)) throw new Error('Release has no approved article source');
    git('add', '--', ...files);
    const staged = git('diff', '--cached', '--name-only').split('\n').filter(Boolean);
    if (staged.some(p => !allowedReleasePath(p, item))) throw new Error('Unexpected staged change');
    git('-c', 'user.name=github-actions[bot]', '-c', 'user.email=41898282+github-actions[bot]@users.noreply.github.com', 'commit', '-m', `Publish approved bilingual article: ${item.slug}`);
    // A normal fast-forward push fails if somebody advanced production. No reset, force push or conflict overwrite.
    git('push', 'origin', 'HEAD:production');
  } else {
    if (await sourceHash(source) !== pending.releaseSourceSha256) throw new Error('Pending article changed; retry cannot overwrite it');
    run(process.execPath, ['scripts/blog-check.mjs', item.slug]);
  }
  const version = git('rev-parse', 'HEAD');
  git('fetch', 'origin', 'production');
  if (git('rev-parse', 'origin/production') !== version) throw new Error('Production advanced before deploy; stop and rerun');
  if (!isDallasPublicationWindow()) throw new Error('Dallas publication window closed before deployment; release remains pending for a permitted retry');
  const log = execFileSync('sh', ['deploy.sh', '--production'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  console.log(log);
  if (!/IndexNow ping: HTTP 200\b/.test(log)) throw new Error('Deployment did not confirm a successful IndexNow response');
  const { post: released } = await import(`${new URL(`../${source}`, import.meta.url).href}?release=${version}`);
  let verification, lastError;
  for (let n = 0; n < 6; n++) {
    try {
      verification = await verifyArticle(released);
      const after = await publicBaseline();
      if (protectedPages.some(path => before[path] !== after[path])) throw new Error('A protected training, contact or booking page changed; manual review required');
      lastError = null; break;
    } catch (e) { lastError = e; if (n < 5) await new Promise(resolve => setTimeout(resolve, 8000)); }
  }
  if (lastError) throw lastError;
  entry = { ...entry, state: 'verified', version, verifiedWeek: weekInChicago(), verifiedAt: new Date().toISOString(), ...verification, deploymentUrl: log.match(/https:\/\/[a-z0-9]+\.aimanjack\.pages\.dev/)?.[0] || null };
  ledger = ledger.map(x => x.slug === entry.slug && x.draftSha256 === entry.draftSha256 ? entry : x);
  await remoteWrite(`${PACK}/ledger.json`, ledger, `Record verified production article release: ${item.slug}`);
  const out = process.env.RUNNER_TEMP || join(ROOT, '.preview');
  await mkdir(out, { recursive: true });
  await writeFile(join(out, 'blog-production-verification.json'), JSON.stringify(entry, null, 2) + '\n');
  console.log(JSON.stringify(entry, null, 2));
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const mode = process.env.BLOG_MODE || process.argv[2] || 'dry-run';
  if (mode === 'approve' || mode === 'revoke') await ownerAction(mode);
  else if (mode === 'publish') await publish();
  else if (mode === 'dry-run') {
    const report = await inspect();
    console.log(JSON.stringify({ ...report, selected: chooseRelease(report)?.item.slug || null, dryRun: true }, null, 2));
  } else throw new Error('Unknown editorial action');
}
