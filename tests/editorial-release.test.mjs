import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assertApproval, sha256, chooseRelease, weekInChicago, dateInChicago, routeOf, approvalBundle } from '../scripts/editorial-queue.mjs';
import { allowedReleasePath } from '../scripts/publish-approved-blog.mjs';

const bytes = Buffer.from('approved bilingual manuscript'), config = Buffer.from('approved site facts');
const now = new Date('2026-10-21T14:00:00Z');
const approval = overrides => ({ approved: true, approvedBy: 'qianquandong', draftSha256: sha256(bytes), configSha256: sha256(config), approvedAt: '2026-10-14T15:00:00Z', approvalRun: 'https://github.com/qianquandong/aimanjack-site/actions/runs/123', notBefore: '2026-10-21', ...overrides });
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
  assert.match(workflow, /default: dry-run/);
  assert.match(publisher, /\['deploy\.sh', '--production'\]/);
  assert.doesNotMatch(publisher, /--force|--admin|--no-verify|booking-smoke|\/v1\/bookings|Mail\.Send/);
});
