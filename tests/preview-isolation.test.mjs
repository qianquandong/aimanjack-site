import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHmac } from 'node:crypto';
import { onRequest } from '../functions/v1/[[route]].js';
import previewWorker from '../src/preview-worker.mjs';
import { stagePreview } from '../scripts/stage-preview.mjs';

test('every preview API fails closed even with production credentials or a wrong mode flag', async (t) => {
  let externalCalls = 0;
  t.mock.method(globalThis, 'fetch', () => { externalCalls++; throw new Error('preview must not call any external service'); });
  const endpoints = ['availability', 'bookings', 'bookings/some-id', 'coupons', 'admin/email-config', 'admin/m365/connect', 'admin/m365/poll', 'admin/m365/disconnect', 'notifications/process', 'notifications/requeue', 'intake', 'ros-events', 'ros-events/process', 'ros-events/1/replay', 'mailerlite/process', 'mailerlite/health', 'mailerlite/webhook'];
  const processToken = 'p'.repeat(40), webhookSecret = 'w'.repeat(32);
  const webhookBody = JSON.stringify({ id: '42', email: 'isolation@example.invalid', status: 'unsubscribed', event: 'subscriber.unsubscribed' });
  const headers = { authorization: `Bearer ${processToken}`, 'content-type': 'application/json',
    signature: createHmac('sha256', webhookSecret).update(webhookBody).digest('hex') };
  const cases = [
    ['https://review.aimanjack.pages.dev', { SITE_ENV: 'preview' }],
    ['https://review.aimanjack.pages.dev', { SITE_ENV: 'production' }],
    ['https://aimanjack.com', { SITE_ENV: 'preview' }],
    ['https://aimanjack.com', { SITE_ENV: 'production', CF_PAGES_BRANCH: 'fix/mail' }],
    ['https://aimanjack.com', {}],
    ['http://localhost:8788', { SITE_ENV: 'production' }],
  ];
  for (const [origin, settings] of cases) for (const path of endpoints) for (const method of ['GET', 'POST', 'PATCH', 'DELETE']) {
    const response = await onRequest({ request: new Request(`${origin}/v1/${path}`, { method, headers, ...(['POST', 'PATCH', 'DELETE'].includes(method) ? { body: webhookBody } : {}) }),
      env: { SUPABASE_URL: 'https://lalmvbxibkozmtnpfbcw.supabase.co', SB_SECRET_KEY: 'fake-live-key', ADMIN_TOKEN: 'fake-admin', ROS_EVENTS_ENABLED: 'true', ROS_EVENT_PROCESS_TOKEN: processToken,
        MAILERLITE_SYNC_ENABLED: 'true', MAILERLITE_DOI_ACKNOWLEDGED: 'true', MAILERLITE_QUOTE_GROUP_ID: '123',
        MAILERLITE_API_TOKEN: 'mock-complete-provider-api-token', MAILERLITE_PROCESS_TOKEN: processToken,
        MAILERLITE_WEBHOOK_SECRET: webhookSecret, EMAIL_HASH_SECRET: 'i'.repeat(40), ...settings },
      params: { route: path.split('/') }, waitUntil() { throw new Error('preview must not start background work'); } });
    assert.equal(response.status, 503, `${origin} ${method} ${path}`);
    assert.equal((await response.json()).error, 'preview_read_only');
  }
  assert.equal(externalCalls, 0, 'preview/local/branch/hostname rejection must precede every database or provider call');
});

test('inert preview Worker blocks API and writes before accessing any binding', async () => {
  const env = new Proxy({}, { get() { throw new Error('no binding access'); } });
  for (const path of ['/v1/availability', '/v1/admin/m365/connect', '/v1/mailerlite/process', '/v1/mailerlite/health', '/v1/mailerlite/webhook', '/api/test']) for (const method of ['GET', 'HEAD', 'POST', 'PATCH', 'DELETE']) {
    assert.equal((await previewWorker.fetch(new Request('https://preview.invalid' + path, { method }), env)).status, 503);
  }
  assert.equal((await previewWorker.fetch(new Request('https://preview.invalid/book/', { method: 'POST' }), env)).status, 503);
});

test('preview staging publishes only public files plus the inert worker, with no production configuration', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'site-preview-test-')); t.after(() => rm(root, { recursive: true, force: true }));
  for (const dir of ['functions/v1', 'src', 'db', 'state', 'docs', 'editorial/review']) await mkdir(join(root, dir), { recursive: true });
  const files = {
    'index.html': '<body><a href="https://aimanjack.com/book/">Book</a></body>', 'style.css': 'body{}',
    'functions/v1/api.js': 'DO NOT PUBLISH API', 'src/private.js': 'DO NOT PUBLISH SOURCE',
    'db/private.sql': 'DO NOT PUBLISH DB', '.dev.vars': 'PRIVATE_KEY=test-only', '.env.production': 'PRIVATE=test-only',
    'wrangler.toml': 'DO NOT PUBLISH CONFIG', 'state/private.json': '{}', 'docs/private.html': 'DO NOT PUBLISH DOCS',
    'editorial/review/draft.html': 'DO NOT PUBLISH UNAPPROVED DRAFT',
  };
  for (const [path, content] of Object.entries(files)) await writeFile(join(root, path), content);
  execFileSync('git', ['init', '-q'], { cwd: root }); execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Offline Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'], { cwd: root });
  const site = await stagePreview(root);
  assert.deepEqual((await readdir(site)).sort(), ['_routes.json', '_worker.js', 'index.html', 'robots.txt', 'style.css']);
  const config = JSON.parse(await readFile(join(root, '.preview/wrangler.jsonc'), 'utf8'));
  assert.equal(config.name, 'aimanjack-review');
  assert.deepEqual(config.vars, { SITE_ENV: 'preview' });
  assert.deepEqual(config.env.preview.vars, { SITE_ENV: 'preview' });
  const html = await readFile(join(site, 'index.html'), 'utf8');
  assert.match(html, /Read-only preview/); assert.match(html, /href="\/book\/"/);
  assert.deepEqual(JSON.parse(await readFile(join(site, '_routes.json'), 'utf8')).include, ['/*']);
  assert.equal(await readFile(join(site, '_worker.js'), 'utf8'), await readFile(new URL('../src/preview-worker.mjs', import.meta.url), 'utf8'));
});

test('deploy entry point defaults to preparation; preview and production cannot share a target', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'deploy-target-test-')); t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'bin')); await mkdir(join(root, '.preview'));
  await copyFile(new URL('../deploy.sh', import.meta.url), join(root, 'deploy.sh'));
  const commands = join(root, 'commands.log');
  for (const [name, content] of Object.entries({
    node: '#!/bin/sh\nexit 0\n',
    git: '#!/bin/sh\ncase "$*" in *symbolic-ref*) echo fix/mail;; *--short=12*) echo abc123456789;; *) echo abc1234567890000000000000000000000000000;; esac\n',
    npx: '#!/bin/sh\nprintf "%s\\n" "$*" >> "$TEST_COMMANDS"\n',
    curl: '#!/bin/sh\necho unexpected-curl >> "$TEST_COMMANDS"\nexit 99\n',
  })) await writeFile(join(root, 'bin', name), content, { mode: 0o755 });
  // Put fixtures first inside the shell, after Git for Windows has normalized PATH.
  const shellBin = join(root, 'bin').replace(/\\/g, '/').replace(/^([A-Za-z]):/, (_, drive) => `/${drive.toLowerCase()}`);
  const env = { ...process.env, TEST_BIN: shellBin, TEST_COMMANDS: commands };
  const deploy = (...args) => execFileSync('sh', ['-c', 'PATH="$TEST_BIN:$PATH"; export PATH; . ./deploy.sh "$@"', 'deploy.sh', ...args], { cwd: root, env, stdio: 'pipe' });
  deploy();
  await assert.rejects(readFile(commands), { code: 'ENOENT' });
  deploy('--preview');
  assert.equal((await readFile(commands, 'utf8')).trim(), 'wrangler pages deploy site --project-name aimanjack-review --branch review-abc123456789 --commit-hash abc1234567890000000000000000000000000000 --commit-dirty=true');
  assert.throws(() => deploy('--production'));
  assert.throws(() => deploy('--preview', '--project-name', 'aimanjack'));
  assert.equal((await readFile(commands, 'utf8')).trim().split('\n').length, 1, 'refused paths must not upload or ping IndexNow');
});
