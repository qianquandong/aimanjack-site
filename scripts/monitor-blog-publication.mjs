// Independent evidence for cloud notifications. Never approves, commits, deploys or retries a release.
import { readFile, writeFile, appendFile, mkdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { ROOT, PACK, inspect, draftForRelease, json, sha256, textOnly, routeOf, dateInChicago, weekInChicago, assertApproval, ApprovalError, reviewedDirectoryCopy } from './editorial-queue.mjs';
import { verifyArticle } from './publish-approved-blog.mjs';

const REPO = 'qianquandong/aimanjack-site', PUBLISHER_ID = 384355210;
const ORIGIN = 'https://aimanjack.com';
const PROTECTED = ['/ai-training/', '/zh/ai-training/', '/book/', '/zh/book/', '/contact/', '/zh/contact/'];
const ALERTS = new Set(['approval_blocked', 'schedule_missing', 'publisher_failed', 'pending_verification', 'verification_failed', 'unknown']);

function dallasParts(now) {
  return Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(now).map(p => [p.type, p.value]));
}
export function publicationSlot(now = new Date()) {
  const today = dateInChicago(now), day = new Date(`${today}T12:00:00Z`), parts = dallasParts(now);
  const sinceWednesday = (day.getUTCDay() + 4) % 7;
  day.setUTCDate(day.getUTCDate() - sinceWednesday - (sinceWednesday === 0 && Number(parts.hour) < 9 ? 7 : 0));
  const date = day.toISOString().slice(0, 10);
  // 15:00 UTC is 09:00 CST or 10:00 CDT. Wednesday 09:00 never overlaps a DST transition.
  const start = new Date(`${date}T15:00:00Z`);
  start.setUTCHours(start.getUTCHours() + 9 - Number(dallasParts(start).hour));
  return { date, week: weekInChicago(start), startsAt: start.toISOString() };
}

export function selectMonitorTarget(report, approvals, now = new Date()) {
  const slot = publicationSlot(now);
  const matching = (item, entry) => item.slug === entry.slug && item.draftSha256 === entry.draftSha256;
  const inSlot = report.ledger.filter(e => e.state === 'verified' && (e.verifiedWeek || e.week) === slot.week);
  if (inSlot.length > 1) throw new Error('More than one verified publication occupies this Dallas week; manual review required');
  const pending = report.ledger.find(e => e.state === 'pending-verification');
  if (pending) {
    const item = report.items.find(item => matching(item, pending));
    if (!item) throw new Error('Pending ledger entry does not match the canonical bilingual bundle');
    return { slot, item, entry: pending };
  }
  if (inSlot.length) {
    const item = report.items.find(item => matching(item, inSlot[0]));
    if (!item) throw new Error('Verified ledger entry does not match the canonical bilingual bundle');
    return { slot, item, entry: inSlot[0] };
  }
  const item = report.items.find(item => {
    const approval = approvals[item.slug];
    return approval?.approved === true && /^\d{4}-\d{2}-\d{2}$/.test(approval.notBefore || '') && approval.notBefore <= slot.date
      && !report.ledger.some(e => e.state === 'verified' && matching(item, e));
  });
  return { slot, item: item || null, entry: null };
}

export function classifyPublisher(selection, runs, now = new Date()) {
  if (!selection.item) return 'no_due';
  if (selection.entry?.state === 'verified') return 'verify';
  const publisher = runs.filter(r => r.workflow_id === PUBLISHER_ID && r.head_branch === 'production'
    && Date.parse(r.created_at) >= Date.parse(selection.slot.startsAt));
  // A manual recovery may not have written its pending ledger yet. Observe it without dispatching anything.
  const active = publisher.filter(r => r.status !== 'completed' && ['schedule', 'workflow_dispatch'].includes(r.event));
  if (active.some(r => now.getTime() - Date.parse(r.run_started_at || r.created_at) >= 20 * 60000)) return 'unknown';
  if (active.length) return 'running';
  const relevant = publisher.filter(r => r.event === 'schedule').sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  if (selection.entry?.state === 'pending-verification') return 'pending_verification';
  if (relevant.some(r => !['success', 'skipped', 'neutral'].includes(r.conclusion))) return 'publisher_failed';
  if (now.getTime() < Date.parse(selection.slot.startsAt) + 30 * 60000) return 'waiting';
  // A successful no-op is not a release: there must be a verified ledger entry and both live pages.
  return 'schedule_missing';
}

export function safeMonitorUrl(input, kind = 'public') {
  const url = new URL(input, kind === 'github' ? 'https://api.github.com' : ORIGIN);
  if (url.username || url.password || url.protocol !== 'https:') throw new Error('Read-only monitor URL refused');
  if (kind === 'github') {
    if (url.origin !== 'https://api.github.com' || url.pathname !== `/repos/${REPO}/actions/runs`) throw new Error('Only the repository read-only runs API is permitted');
  } else {
    let path = url.pathname;
    for (let n = 0; n < 3; n++) {
      try { const decoded = decodeURIComponent(path); if (decoded === path) break; path = decoded; }
      catch { throw new Error('Invalid public path'); }
    }
    const normalized = new URL(path.replace(/\\/g, '/').replace(/\/{2,}/g, '/'), ORIGIN);
    if (url.origin !== ORIGIN || normalized.origin !== ORIGIN || /^\/v1(?:\/|$)/i.test(normalized.pathname)) throw new Error('Only first-party public pages are permitted; no APIs');
  }
  return url;
}

async function readonlyResponse(input, { kind = 'public', method = 'GET', token = '', fetchImpl = fetch } = {}, allowNotFound = false) {
  if (method !== 'GET') throw new Error('Monitor requests must use GET');
  let url = safeMonitorUrl(input, kind);
  for (let redirects = 0; redirects <= 5; redirects++) {
    const headers = { 'User-Agent': 'Aimanjack-Read-Only-Blog-Monitor/1.0', 'Cache-Control': 'no-cache' };
    if (kind === 'github') {
      headers.Accept = 'application/vnd.github+json';
      headers['X-GitHub-Api-Version'] = '2022-11-28';
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetchImpl(url, { method: 'GET', redirect: 'manual', headers, signal: AbortSignal.timeout(20000) });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location');
      if (!location) throw new Error('Read-only redirect has no destination');
      url = safeMonitorUrl(new URL(location, url), kind); continue;
    }
    if (response.status !== 200 && !(allowNotFound && kind === 'public' && response.status === 404)) throw new Error(`Read-only GET failed: ${url.pathname} (${response.status})`);
    if (response.url) safeMonitorUrl(response.url, kind);
    return { status: response.status, url: url.href, body: await response.text() };
  }
  throw new Error('Too many read-only redirects');
}
export async function readonlyGet(input, options) { return (await readonlyResponse(input, options)).body; }
export async function readonlyProbe(input, options) { return readonlyResponse(input, options, true); }

export async function readPublisherRuns(slot, get = readonlyGet) {
  const runs = [];
  for (let page = 1; page <= 5; page++) {
    const query = new URLSearchParams({ branch: 'production', created: `>=${slot.startsAt}`, per_page: '100', page: String(page) });
    const body = JSON.parse(await get(`https://api.github.com/repos/${REPO}/actions/runs?${query}`, { kind: 'github', token: process.env.GH_TOKEN || process.env.GITHUB_TOKEN || '' }));
    if (!Array.isArray(body.workflow_runs)) throw new Error('GitHub did not return a complete runs page');
    runs.push(...body.workflow_runs.filter(r => r.workflow_id === PUBLISHER_ID));
    if (body.workflow_runs.length < 100) return runs;
  }
  throw new Error('GitHub run pagination limit reached; scheduler state is unknown, not missing');
}

async function validateSelectedApproval(item, approval, now, root = ROOT) {
  const draft = await draftForRelease(item, root);
  assertApproval(approval, draft.bytes, await readFile(join(root, 'src/config.mjs')), 'qianquandong', now);
  if (approval.slug !== item.slug) throw new Error('Approval slug does not match the selected bilingual manuscript');
  await reviewedDirectoryCopy(root, item);
  return draft;
}

// Presence is independent evidence, never a substitute for approval or full release verification.
export async function observeFormalPresence(item, { get = readonlyGet, probe = readonlyProbe } = {}) {
  const paths = [routeOf(item), '/zh' + routeOf(item)];
  const [pages, sitemap, ...directories] = await Promise.all([
    Promise.all(paths.map(path => probe(path))), get('/sitemap.xml'), get('/blog/'), get('/zh/blog/')
  ]);
  const observed = pages.map((page, index) => ({ url: ORIGIN + paths[index], finalUrl: page.url, status: page.status,
    inSitemap: sitemap.includes(`<loc>${ORIGIN + paths[index]}</loc>`),
    inDirectory: [...directories[index].matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].some(match => {
      try { return new URL(match[1], ORIGIN + (index ? '/zh/blog/' : '/blog/')).href === ORIGIN + paths[index]; } catch { return false; }
    }) }));
  return { state: observed.every(page => page.status === 404 && !page.inSitemap && !page.inDirectory) ? 'absent' : 'present_or_partial',
    verified: false, pages: observed };
}

async function verifyRelease(selection, approval, now, root = ROOT, get = readonlyGet) {
  const { item, entry } = selection, draft = await validateSelectedApproval(item, approval, now, root);
  if (!entry.releaseSourceSha256 || !entry.version) throw new Error('Verified release provenance is incomplete');
  const source = join(root, 'src/posts', `${item.slug}.mjs`), bytes = await readFile(source);
  if (sha256(bytes) !== entry.releaseSourceSha256) throw new Error('Published source changed after the verified release; manual review required');
  const { post } = await import(`${pathToFileURL(source).href}?monitor=${sha256(bytes)}`);
  const expected = { ...draft.post, status: 'published', date: item.existing ? item.originalDate : entry.date, updated: item.existing ? entry.date : undefined };
  if (!isDeepStrictEqual(JSON.parse(JSON.stringify(expected)), post)) throw new Error('Published source does not match the approved bilingual manuscript');
  // Current canonical approval, ledger and exact release source are authoritative; historical publisher artifacts are not reinterpreted.
  const verification = await verifyArticle(post);
  for (const lang of ['en', 'zh']) {
    const prefix = lang === 'zh' ? '/zh' : '', body = await get(`${prefix}/blog/`), route = prefix + routeOf(post);
    const found = [...body.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)].some(m => {
      try { return new URL(m[1], `${ORIGIN}${prefix}/blog/`).href === ORIGIN + route; } catch { return false; }
    });
    if (!found) throw new Error(`Article missing from formal ${lang} directory`);
  }
  for (const path of PROTECTED) {
    const body = await get(path), main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
    if (!main || !entry.protectedBefore?.[path] || sha256(textOnly(main)) !== entry.protectedBefore[path]) throw new Error(`Protected training/booking/contact page drift: ${path}`);
  }
  return { ...verification, approvedSource: true, directories: true, sitemap: true, metadataAndSchemas: true, protectedPagesChecked: PROTECTED.length };
}

export async function monitor(now = new Date(), { root = ROOT, get = readonlyGet, probe = readonlyProbe } = {}) {
  const result = { schemaVersion: 1, generatedAt: now.toISOString(), timezone: 'America/Chicago', dallasDate: dateInChicago(now), readOnly: true,
    monitorRun: process.env.GITHUB_RUN_ID ? `https://github.com/${REPO}/actions/runs/${process.env.GITHUB_RUN_ID}` : null, status: 'unknown' };
  try {
    const report = await inspect(root, now), approvals = {};
    for (const item of report.items) approvals[item.slug] = await json(join(root, PACK, 'approvals', `${item.slug}.json`), null);
    const selection = selectMonitorTarget(report, approvals, now);
    result.slot = selection.slot;
    if (selection.item) {
      result.target = { slug: selection.item.slug, draftSha256: selection.item.draftSha256, scheduledDate: approvals[selection.item.slug]?.notBefore,
        englishUrl: ORIGIN + routeOf(selection.item), chineseUrl: ORIGIN + '/zh' + routeOf(selection.item) };
    }
    if (!selection.item) { result.status = 'no_due'; result.message = 'No approved unpublished topic is due in this Dallas publication slot.'; return result; }
    // An invalid approval is a known release blocker. Keep collecting GET-only evidence,
    // but fail visibly and never report a scheduler outage or verified publication.
    try { await validateSelectedApproval(selection.item, approvals[selection.item.slug], now, root); }
    catch (error) {
      if (!(error instanceof ApprovalError)) throw error;
      const approval = approvals[selection.item.slug], configSha256 = sha256(await readFile(join(root, 'src/config.mjs')));
      result.status = 'approval_blocked'; result.error = error.message;
      result.message = 'Owner review and exact-version reapproval are required. No publication or retry was attempted.';
      result.approval = { code: error.code, approvedAt: approval?.approvedAt, approvalRun: approval?.approvalRun,
        approvedDraftSha256: approval?.draftSha256, currentDraftSha256: selection.item.draftSha256,
        approvedConfigSha256: approval?.configSha256, currentConfigSha256: configSha256 };
      try { result.publication = await observeFormalPresence(selection.item, { get, probe }); }
      catch (observationError) { result.publication = { state: 'unknown', verified: false, error: observationError.message }; }
      try { result.publisherRuns = (await readPublisherRuns(selection.slot, get)).map(r => ({ id: r.id, event: r.event, status: r.status, conclusion: r.conclusion, createdAt: r.created_at, url: r.html_url })); }
      catch (historyError) { result.publisherHistoryError = historyError.message; }
      return result;
    }
    // Run history is read even for a verified release, so the artifact includes independent scheduler evidence.
    const runs = await readPublisherRuns(selection.slot, get);
    result.publisherRuns = runs.map(r => ({ id: r.id, event: r.event, status: r.status, conclusion: r.conclusion, createdAt: r.created_at, url: r.html_url }));
    result.status = classifyPublisher(selection, runs, now);
    if (result.status === 'verify') {
      result.release = { version: selection.entry.version, verifiedAt: selection.entry.verifiedAt, releaseSourceSha256: selection.entry.releaseSourceSha256 };
      try { result.checks = await verifyRelease(selection, approvals[selection.item.slug], now, root, get); result.status = 'verified'; }
      catch (error) { result.status = 'verification_failed'; throw error; }
    }
    result.message = ({ verified: 'Both formal language pages, approved content, discovery and first-party links verified with fresh GET requests.',
      waiting: 'Within the first 30 minutes of the Dallas slot; no publication confirmed yet.', running: 'A scheduled/manual publisher run is queued or running; no duplicate action is taken.',
      pending_verification: 'A release is pending verification; it must not be published again by this monitor.', publisher_failed: 'A scheduled publisher attempt failed and no verified release is recorded.',
      unknown: 'Publisher timeout checkpoint: a scheduled/manual run remains queued or running after 20 minutes; completion is unconfirmed, not a reason to publish again.',
      schedule_missing: 'No verified release by the 09:30 Dallas checkpoint; a missing trigger or successful no-op is not publication.' })[result.status];
  } catch (error) { result.error = error.message; }
  return result;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const report = await monitor(), out = process.env.RUNNER_TEMP || join(tmpdir(), 'aimanjack-blog-monitor');
  await mkdir(out, { recursive: true });
  await writeFile(join(out, 'blog-publication-monitor.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY,
    `## Read-only bilingual publication check\n\nStatus: **${report.status}** · ${report.generatedAt}\n\n${report.message || report.error || ''}\n\n`
    + (report.target ? `[English](${report.target.englishUrl}) · [中文](${report.target.chineseUrl})\n\n` : '')
    + `Full evidence: artifact \`blog-publication-monitor-${process.env.GITHUB_RUN_ID}\`. No publication, retry or website change was performed.\n`);
  if (ALERTS.has(report.status) || report.error) process.exitCode = 1;
}
