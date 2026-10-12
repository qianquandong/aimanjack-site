import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildPagesPreview } from '../scripts/cloudflare-preview-build.mjs';

const previewEnv = { ...process.env, CF_PAGES: '1', CF_PAGES_BRANCH: 'fix/example', SITE_ENV: 'preview' };
// Start a real child test runner, not another worker of the parent test runner.
delete previewEnv.NODE_TEST_CONTEXT;
async function fixture(t, failure = '') {
  const root = await mkdtemp(join(tmpdir(), 'pages-git-build-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const name of ['scripts', 'tests', 'functions', 'db']) await mkdir(join(root, name));
  const files = {
    'index.html': '<body>before build</body>', 'style.css': 'body{}',
    'scripts/build.mjs': failure === 'build' ? 'process.exit(1)' : "import {writeFileSync} from 'node:fs'; writeFileSync('index.html','<body>built page</body>')",
    'tests/gate.test.mjs': `import test from 'node:test'; import {writeFileSync} from 'node:fs'; test('offline gate',()=>{writeFileSync('test-ran.txt','yes');${failure === 'test' ? "throw new Error('expected gate failure')" : ''}})`,
    'functions/api.js': 'throw new Error("production backend must not ship")',
    'db/private.sql': 'do not publish', 'wrangler.toml': 'do not publish configuration',
    '.dev.vars': 'SECRET=test-only',
  };
  for (const [name, content] of Object.entries(files)) await writeFile(join(root, name), content);
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['add', '.'], { cwd: root });
  execFileSync('git', ['-c', 'user.name=Offline Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'], { cwd: root });
  await mkdir(join(root, '.deploy')); await writeFile(join(root, '.deploy/stale.txt'), 'old output');
  return root;
}

test('automatic Pages build refuses production and unknown contexts before side effects', async (t) => {
  const repo = await fixture(t);
  for (const changes of [{ CF_PAGES: '' }, { CF_PAGES_BRANCH: '' }, { CF_PAGES_BRANCH: 'production' }, { CF_PAGES_BRANCH: ' production ' }, { SITE_ENV: 'production' }, { SITE_ENV: '' }]) {
    await assert.rejects(buildPagesPreview({ repo, env: { ...previewEnv, ...changes }, stdio: 'pipe' }), /preview-only/);
    assert.equal(await readFile(join(repo, '.deploy/stale.txt'), 'utf8'), 'old output');
    assert.equal(await readFile(join(repo, 'index.html'), 'utf8'), '<body>before build</body>');
  }
});

test('automatic Pages build creates the expected directory with only inert preview assets', async (t) => {
  const repo = await fixture(t);
  const output = await buildPagesPreview({ repo, env: previewEnv, stdio: 'pipe' });
  assert.equal(output, join(repo, '.deploy'));
  assert.equal(await readFile(join(repo, 'test-ran.txt'), 'utf8'), 'yes');
  assert.deepEqual((await readdir(output)).sort(), ['_routes.json', '_worker.js', 'index.html', 'robots.txt', 'style.css']);
  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /built page/);
  assert.match(await readFile(join(output, 'index.html'), 'utf8'), /Read-only preview/);
  assert.equal(await readFile(join(output, '_worker.js'), 'utf8'), await readFile(new URL('../src/preview-worker.mjs', import.meta.url), 'utf8'));
  assert.deepEqual(JSON.parse(await readFile(join(output, '_routes.json'), 'utf8')).include, ['/*']);
});

test('a build or test failure leaves no publishable automatic preview output', async (t) => {
  for (const failure of ['build', 'test']) {
    const repo = await fixture(t, failure);
    await assert.rejects(buildPagesPreview({ repo, env: previewEnv, stdio: 'pipe' }));
    await assert.rejects(readdir(join(repo, '.deploy')), { code: 'ENOENT' });
    await assert.rejects(readdir(join(repo, '.preview')), { code: 'ENOENT' });
  }
});
