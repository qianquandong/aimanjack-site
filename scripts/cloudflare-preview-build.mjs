// Cloudflare Git-build entry point. Stages assets only; never invokes a deploy CLI.
import { execFileSync } from 'node:child_process';
import { cp, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stagePreview } from './stage-preview.mjs';

export async function buildPagesPreview({ repo = resolve(dirname(fileURLToPath(import.meta.url)), '..'), env = process.env, stdio = 'inherit' } = {}) {
  // Pages shares one build command across environments. Refuse production and
  // unknown contexts before running a build, tests, or touching existing output.
  const branch = env.CF_PAGES_BRANCH?.trim();
  if (env.CF_PAGES !== '1' || !branch || branch === 'production' || env.SITE_ENV !== 'preview') {
    throw new Error('Automatic build is preview-only; production requires a separately authorized manual deployment.');
  }
  const output = join(repo, '.deploy');
  await rm(output, { recursive: true, force: true });
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: repo, env, stdio });
  const tests = (await readdir(join(repo, 'tests'))).filter(p => p.endsWith('.test.mjs')).sort().map(p => join('tests', p));
  if (!tests.length) throw new Error('No offline tests found; refusing preview build.');
  execFileSync(process.execPath, ['--test', ...tests], { cwd: repo, env, stdio });
  const site = await stagePreview(repo);
  // The inert advanced-mode Worker takes precedence over the root /functions.
  // No production backend, configuration or credentials are copied to output.
  await cp(site, output, { recursive: true });
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  buildPagesPreview().then(output => console.log(`Read-only Pages preview ready: ${output}`)).catch(error => {
    console.error(error.message); process.exitCode = 1;
  });
}
