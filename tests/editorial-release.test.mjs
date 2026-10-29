import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdtemp, mkdir, cp, copyFile, rm } from 'node:fs/promises';
import { execFileSync, spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ROOT, PACK, assertApproval, sha256, chooseRelease, weekInChicago, dateInChicago, routeOf, approvalBundle, isDallasPublicationWindow, planEditorialAction, inspect, loadQueue, draftFor, draftForRelease, reviewedDirectoryCopy, applyDirectoryCopy } from '../scripts/editorial-queue.mjs';
import { allowedReleasePath } from '../scripts/publish-approved-blog.mjs';

const bytes = Buffer.from('approved bilingual manuscript'), config = Buffer.from('approved site facts');
const now = new Date('2026-10-21T14:00:00Z');
const approval = overrides => ({ approved: true, approvedBy: 'qianquandong', draftSha256: sha256(bytes), configSha256: sha256(config), approvedAt: '2026-10-14T15:00:00Z', approvalRun: 'https://github.com/qianquandong/aimanjack-site/actions/runs/123', notBefore: '2026-10-21', ...overrides });

async function editorialFixture(t) {
  const root = await mkdtemp(join(tmpdir(), 'aimanjack-editorial-version-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, PACK), { recursive: true });
  await mkdir(join(root, PACK, 'approvals'));
  await mkdir(join(root, 'src'));
  await Promise.all([
    cp(join(ROOT, PACK, 'posts'), join(root, PACK, 'posts'), { recursive: true }),
    cp(join(ROOT, PACK, 'directory-copy'), join(root, PACK, 'directory-copy'), { recursive: true }),
    ...['queue.json', 'index-copy.json'].map(path => copyFile(join(ROOT, PACK, path), join(root, PACK, path))),
    copyFile(join(ROOT, 'src/config.mjs'), join(root, 'src/config.mjs'))
  ]);
  const queue = await loadQueue(root), configSha256 = sha256(await readFile(join(root, 'src/config.mjs')));
  for (const [index, item] of queue.items.slice(0, 2).entries()) {
    const draft = await draftFor(item, root);
    // Offline test decisions are independent of real approval/revocation records and never leave this temporary root.
    await writeFile(join(root, PACK, 'approvals', `${item.slug}.json`), JSON.stringify({ approved: true, slug: item.slug, approvedBy: queue.owner, draftSha256: draft.digest, configSha256, approvedAt: '2026-10-14T13:00:00Z', notBefore: ['2026-10-14', '2026-10-21'][index], approvalRun: 'offline-test-fixture-only' }));
  }
  return root;
}

test('a real inspection selection retains the owner-approved bilingual bundle digest', async t => {
  const root = await editorialFixture(t), report = await inspect(root, new Date('2026-10-14T18:00:00Z'));
  const selected = chooseRelease(report).item;
  const ownerApproval = JSON.parse(await readFile(join(root, PACK, 'approvals', `${selected.slug}.json`), 'utf8'));
  assert.equal(selected.eligible, true);
  const draft = await draftForRelease(selected, root);
  assert.equal(draft.digest, ownerApproval.draftSha256);
  assert.equal(draft.digest, selected.draftSha256);
  await assert.rejects(draftForRelease({ ...selected, draftSha256: 'changed' }, root), /no longer matches/);
  await assert.rejects(draftForRelease({ ...selected, slug: 'unknown-topic' }, root), /canonical draft queue/);
});

test('a reconciled topic binds its new renderer plan and still refuses any unreviewed renderer change', async t => {
  const root = await editorialFixture(t), queue = await loadQueue(root), item = queue.items[1];
  await copyFile(join(ROOT, 'src/blog.mjs'), join(root, 'src/blog.mjs'));
  const current = await readFile(join(root, 'src/blog.mjs'), 'utf8'), draft = await draftFor(item, root);
  assert.equal(await reviewedDirectoryCopy(root, item), current);
  await applyDirectoryCopy(root, item);
  assert.equal(await readFile(join(root, 'src/blog.mjs'), 'utf8'), current);
  await assert.rejects(reviewedDirectoryCopy(root, queue.items[0]), /renderer changed/, 'the original renderer gate is preserved');
  const path = join(root, PACK, item.directoryCopy), policy = JSON.parse(await readFile(path, 'utf8'));
  await writeFile(path, JSON.stringify({ ...policy, reason: 'Different review scope' }));
  assert.notEqual((await draftFor(item, root)).digest, draft.digest, 'the plan itself is included in the reviewed bundle');
  await writeFile(join(root, 'src/blog.mjs'), current + '\n// unreviewed edit\n');
  await assert.rejects(reviewedDirectoryCopy(root, item), /renderer changed/);
  await assert.rejects(applyDirectoryCopy(root, item), /renderer changed/);
  queue.items[1].directoryCopy = '../config.mjs';
  await writeFile(join(root, PACK, 'queue.json'), JSON.stringify(queue));
  await assert.rejects(loadQueue(root), /Unexpected per-article/);
});

test('a stale due approval is a visible plan blocker, with no release work selected', () => {
  const item = { slug: 'stale', draftSha256: 'version', eligible: false, approvalDue: true, approvalIssue: { code: 'site_facts_changed', message: 'Site facts changed after approval; review again' } };
  const report = { week: '2026-10-19', releaseWindowOpen: true, items: [item], ledger: [] };
  const plan = planEditorialAction('publish', report);
  assert.equal(plan.status, 'approval_blocked');
  assert.equal(plan.runRequired, false);
  assert.equal(plan.selected, null);
  assert.equal(plan.blockers[0].code, 'site_facts_changed');
  assert.equal(planEditorialAction('publish', { ...report, releaseWindowOpen: false }).status, undefined);
  assert.equal(planEditorialAction('publish', { ...report, ledger: [{ state: 'verified', week: report.week }] }).status, undefined);
});

test('the real next-Wednesday queue skips the verified first version and selects the next approved topic', async t => {
  const root = await editorialFixture(t), firstReport = await inspect(root, new Date('2026-10-14T18:00:00Z'));
  const first = chooseRelease(firstReport).item;
  const draft = await draftForRelease(first, root);
  await writeFile(join(root, PACK, 'ledger.json'), JSON.stringify([{ slug: first.slug, draftSha256: draft.digest, state: 'pending-verification', week: firstReport.week }]));
  const pending = chooseRelease(await inspect(root, new Date('2026-10-14T19:00:00Z')));
  assert.equal(pending.pending.draftSha256, draft.digest);
  assert.equal((await draftForRelease(pending.item, root)).digest, draft.digest);
  await writeFile(join(root, PACK, 'ledger.json'), JSON.stringify([{ slug: first.slug, draftSha256: draft.digest, state: 'verified', week: firstReport.week, verifiedWeek: firstReport.week }]));
  assert.equal(chooseRelease(await inspect(root, new Date('2026-10-14T19:00:00Z'))), null);
  const nextReport = await inspect(root, new Date('2026-10-21T14:00:00Z'));
  assert.equal(nextReport.items[0].reason, 'This version is already published and verified');
  const next = chooseRelease(nextReport).item;
  assert.equal(next.slug, 'choose-corporate-ai-trainer-dallas-fort-worth');
  assert.equal((await draftForRelease(next, root)).digest, next.draftSha256);
});
test('approval hashes are stable across Windows and Linux line endings but preserve real text edits', () => {
  assert.equal(sha256('English\r\n中文\r\n'), sha256(Buffer.from('English\n中文\n')));
  assert.notEqual(sha256('English\n中文\n'), sha256('English\n改稿\n'));
});
test('an owner approval binds both language versions and the current site facts', () => {
  assert.doesNotThrow(() => assertApproval(approval(), bytes, config, 'qianquandong', now));
  assert.throws(() => assertApproval(null, bytes, config, 'qianquandong', now), /No owner approval/);
  assert.throws(() => assertApproval(approval({ approvedBy: 'another-user' }), bytes, config, 'qianquandong', now), /No owner approval/);
  assert.throws(() => assertApproval(approval({ approved: false }), bytes, config, 'qianquandong', now), /No owner approval/);
  assert.throws(() => assertApproval(approval(), Buffer.from('changed Chinese paragraph'), config, 'qianquandong', now), /Draft changed/);
  assert.throws(() => assertApproval(approval(), bytes, Buffer.from('changed price'), 'qianquandong', now), /Site facts changed/);
  assert.throws(() => assertApproval(approval({ approvalRun: '' }), bytes, config, 'qianquandong', now), /provenance/);
});
test('approval dates cannot release early or silently normalize an invalid calendar date', () => {
  assert.throws(() => assertApproval(approval({ notBefore: '2026-10-22' }), bytes, config, 'qianquandong', now), /not due/);
  assert.throws(() => assertApproval(approval({ notBefore: '2026-02-31' }), bytes, config, 'qianquandong', now), /valid release date/);
  assert.throws(() => assertApproval(approval({ notBefore: 'tomorrow' }), bytes, config, 'qianquandong', now), /valid release date/);
});
test('approval becomes invalid when the original production baseline, URL, date plan or directory copy changes', () => {
  const item = { slug: 'example', path: '/resources/example/', existing: true, originalDate: '2026-09-17', baseSourceSha256: 'original-production-hash' };
  const directory = Buffer.from('reviewed directory copy');
  const original = sha256(approvalBundle(bytes, item, directory));
  for (const change of [{ path: '/blog/example/' }, { baseSourceSha256: 'someone-elses-new-production-edit' }, { existing: false }, { originalDate: '2026-10-21' }]) assert.notEqual(sha256(approvalBundle(bytes, { ...item, ...change }, directory)), original);
  assert.notEqual(sha256(approvalBundle(bytes, item, Buffer.from('unreviewed directory copy'))), original);
});
test('Dallas dates and weekly limits hold across UTC boundaries and daylight saving changes', () => {
  assert.equal(dateInChicago(new Date('2026-10-19T02:00:00Z')), '2026-10-18');
  assert.equal(weekInChicago(new Date('2026-10-19T02:00:00Z')), '2026-10-12');
  assert.equal(weekInChicago(new Date('2026-10-19T06:00:00Z')), '2026-10-19');
  assert.equal(dateInChicago(new Date('2026-11-04T15:00:00Z')), '2026-11-04');
});

test('Dallas publication opens Wednesday at 09:00 across summer and winter offsets', () => {
  for (const [instant, expected] of [
    ['2026-10-14T13:59:59Z', false], ['2026-10-14T14:00:00Z', true],
    ['2026-11-04T14:59:59Z', false], ['2026-11-04T15:00:00Z', true],
    ['2026-10-13T20:00:00Z', false], ['2026-10-15T20:00:00Z', false],
    ['2026-10-15T04:59:59Z', true], ['2026-10-15T05:00:00Z', false],
    ['2026-11-05T05:59:59Z', true], ['2026-11-05T06:00:00Z', false]
  ]) assert.equal(isDallasPublicationWindow(new Date(instant)), expected, instant);
});

test('an early or non-Wednesday run cannot publish or retry a pending deployment', () => {
  const item = { slug: 'first', draftSha256: 'abc', eligible: true };
  const report = { week: '2026-10-12', releaseWindowOpen: false, ledger: [], items: [item] };
  assert.equal(chooseRelease(report), null);
  assert.equal(chooseRelease({ ...report, ledger: [{ ...item, state: 'pending-verification' }] }), null);
  assert.equal(chooseRelease({ ...report, releaseWindowOpen: true }).item.slug, 'first');
});

test('the read-only plan skips all release work for closed, completed or empty publication slots', () => {
  const report = { week: '2026-10-12', releaseWindowOpen: true, ledger: [], items: [{ slug: 'first', eligible: true }] };
  assert.deepEqual(planEditorialAction('publish', report), { runRequired: true, selected: 'first', reason: 'Due approved release requires the existing checks' });
  for (const noOp of [
    { ...report, releaseWindowOpen: false },
    { ...report, ledger: [{ state: 'verified', week: report.week }] },
    { ...report, items: [] }
  ]) {
    const plan = planEditorialAction('publish', noOp);
    assert.equal(plan.runRequired, false);
    assert.equal(plan.selected, null);
  }
  for (const mode of ['dry-run', 'approve', 'revoke']) assert.equal(planEditorialAction(mode).runRequired, true);
  assert.throws(() => planEditorialAction('invalid'), /Unknown editorial action/);
});

test('the plan CLI reports a Thursday no-op to Actions without production credentials or deployment', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'aimanjack-editorial-plan-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const output = join(directory, 'github-output');
  const script = new URL('../scripts/editorial-queue.mjs', import.meta.url);
  const stdout = execFileSync(process.execPath, ['--input-type=module', '-e', `
    const RealDate = Date;
    globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-15T15:00:00Z'])); } };
    process.argv[1] = ${JSON.stringify(fileURLToPath(script))};
    process.argv[2] = 'plan';
    await import(${JSON.stringify(script.href)});
  `], { encoding: 'utf8', env: { ...process.env, BLOG_MODE: 'publish', GITHUB_OUTPUT: output, CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '', GH_TOKEN: '' } });
  assert.deepEqual(JSON.parse(stdout), { runRequired: false, selected: null, reason: 'Outside Wednesday 09:00–23:59 America/Chicago' });
  assert.equal(await readFile(output, 'utf8'), 'run_required=false\n');
});
test('the plan CLI exits unsuccessfully for stale due approvals without requesting release work', async t => {
  const directory = await editorialFixture(t);
  await writeFile(join(directory, 'src/config.mjs'), '// changed after fixture approval\n');
  await mkdir(join(directory, 'scripts'));
  await copyFile(new URL('../scripts/editorial-queue.mjs', import.meta.url), join(directory, 'scripts/editorial-queue.mjs'));
  const output = join(directory, 'github-output'), summary = join(directory, 'github-summary');
  const script = pathToFileURL(join(directory, 'scripts/editorial-queue.mjs'));
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    const RealDate = Date;
    globalThis.Date = class extends RealDate { constructor(...args) { super(...(args.length ? args : ['2026-10-21T15:00:00Z'])); } };
    process.argv[1] = ${JSON.stringify(fileURLToPath(script))};
    process.argv[2] = 'plan';
    await import(${JSON.stringify(script.href)});
  `], { encoding: 'utf8', env: { ...process.env, BLOG_MODE: 'publish', GITHUB_OUTPUT: output, GITHUB_STEP_SUMMARY: summary, CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_ACCOUNT_ID: '', GH_TOKEN: '' } });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).status, 'approval_blocked');
  assert.equal(await readFile(output, 'utf8'), 'run_required=false\n');
  assert.match(await readFile(summary, 'utf8'), /No publication or deployment was attempted/);
});
test('one due bilingual topic is selected and unapproved drafts cannot be selected', () => {
  const report = { week: '2026-10-19', ledger: [], items: [{ slug: 'no', eligible: false }, { slug: 'first', eligible: true }, { slug: 'second', eligible: true }] };
  assert.equal(chooseRelease(report).item.slug, 'first');
  assert.equal(chooseRelease({ ...report, items: report.items.map(x => ({ ...x, eligible: false })) }), null);
  assert.equal(chooseRelease({ ...report, ledger: [{ state: 'verified', week: '2026-10-19' }] }), null);
  assert.equal(chooseRelease({ ...report, ledger: [{ state: 'verified', week: '2026-10-12', verifiedWeek: '2026-10-19' }] }), null);
});
test('a merged but unverified release resumes before any new article and cannot lose its approval', () => {
  const pending = { slug: 'first', draftSha256: 'abc', state: 'pending-verification', week: '2026-10-12' };
  const report = { week: '2026-10-19', ledger: [pending], items: [{ slug: 'first', draftSha256: 'abc', eligible: true }, { slug: 'second', eligible: true }] };
  assert.equal(chooseRelease(report).pending, pending);
  assert.throws(() => chooseRelease({ ...report, items: [{ slug: 'first', draftSha256: 'changed', eligible: true }] }), /no longer valid/);
  assert.throws(() => chooseRelease({ ...report, items: [{ slug: 'first', draftSha256: 'abc', eligible: false }] }), /no longer valid/);
});
test('only the selected article and its generated discovery files can enter a release commit', () => {
  const item = { slug: 'example-topic' };
  for (const path of ['src/posts/example-topic.mjs', 'blog/example-topic/index.html', 'zh/blog/example-topic/index.html', 'blog/index.html', 'sitemap.xml']) assert.equal(allowedReleasePath(path, item), true, path);
  for (const path of ['src/config.mjs', 'src/pages/training.mjs', 'src/posts/someone-elses-post.mjs', 'functions/v1/[[route]].js', 'wrangler.toml', 'book/index.html', '_redirects', '.github/workflows/approved-blog-publisher.yml']) assert.equal(allowedReleasePath(path, item), false, path);
  assert.equal(allowedReleasePath('resources/old-resource/index.html', { slug: 'old-resource', path: '/resources/old-resource/' }), true);
  assert.equal(routeOf({ slug: 'old-resource', path: '/resources/old-resource/' }), '/resources/old-resource/');
  assert.throws(() => routeOf({ slug: 'bad', path: '/../book/' }), /Unexpected/);
});
test('the cloud job uses explicit production deployment and does not contain booking/email submissions', async () => {
  const workflow = await readFile(new URL('../.github/workflows/approved-blog-publisher.yml', import.meta.url), 'utf8');
  const publisher = await readFile(new URL('../scripts/publish-approved-blog.mjs', import.meta.url), 'utf8');
  assert.match(workflow, /timezone: America\/Chicago/);
  assert.match(workflow, /cron: '0 9 \* \* 3'/);
  assert.match(workflow, /cron: '17,47 9-23 \* \* 3'/);
  for (const name of ['Install locked test dependencies', 'Check the complete bilingual draft queue', 'Build and run existing offline release checks', 'Check cloud deployment credentials without deploying', 'Run the selected editorial action']) {
    const step = workflow.slice(workflow.indexOf(`- name: ${name}`)).split(/\r?\n      - /)[0];
    assert.match(step, /if: steps\.plan\.outputs\.run_required == 'true'/, name);
  }
  assert.match(workflow, /default: dry-run/);
  assert.match(publisher, /\['deploy\.sh', '--production'\]/);
  assert.match(publisher, /if \(!isDallasPublicationWindow\(\)\) throw new Error\([^\n]+\);\r?\n  const log = execFileSync\('sh', \['deploy\.sh', '--production'\]/);
  assert.doesNotMatch(publisher, /--force|--admin|--no-verify|booking-smoke|\/v1\/bookings|Mail\.Send/);
});
