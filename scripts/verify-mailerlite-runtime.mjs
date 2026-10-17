// Extra native Workers verification. Dependency root is explicit: no install, credentials, or external API requests.
// node scripts/verify-mailerlite-runtime.mjs <folder-containing-esbuild-and-miniflare-node_modules>
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (!process.argv[2]) throw Error('Pass an existing local dependency root containing esbuild and miniflare.');
const require = createRequire(resolve(process.argv[2], 'package.json'));
const { build } = require('esbuild'), { Miniflare } = require('miniflare');
const directory = dirname(fileURLToPath(import.meta.url));
const bundle = await build({ stdin: { resolveDir: directory, contents: `
  import { mailerliteClient } from '../functions/mailerlite.mjs';
  export default { async fetch() {
    const client = mailerliteClient({ env: { MAILERLITE_API_TOKEN:'runtime-mock-only', MAILERLITE_QUOTE_GROUP_ID:'123' } });
    try { return Response.json({verified:await client.verifyGroup()}); }
    catch (error) { return Response.json({error:error.message},{status:502}); }
  }};` }, bundle: true, format: 'esm', platform: 'browser', write: false, target: 'es2022' });
let redirect = false, calls = 0;
// The preinstalled local workerd supports dates through 2026-05-22; use its supported test date.
const runtime = new Miniflare({ cf: false, compatibilityDate: '2026-05-15', compatibilityFlags: ['nodejs_compat'], modules: true,
  script: bundle.outputFiles[0].text, outboundService: request => {
    calls++; assert.equal(new URL(request.url).origin, 'https://connect.mailerlite.com');
    if (redirect) return new Response(null, { status: 302, headers: { location: 'https://must-not-follow.invalid/secret' } });
    return Response.json({ data: [{ id: '123', name: 'Native runtime mock' }] });
  } });
try {
  let response = await runtime.dispatchFetch('https://runtime.test/groups');
  assert.equal(response.status, 200); assert.deepEqual(await response.json(), { verified: true });
  redirect = true;
  response = await runtime.dispatchFetch('https://runtime.test/redirect');
  assert.equal(response.status, 502); assert.deepEqual(await response.json(), { error: 'provider_http_302' });
  assert.equal(calls, 2, 'workerd made one fixed-host fetch per request and never followed Location');
  console.log('Native Workers runtime: group read passes; redirect is rejected without following Location (2/2).');
} finally { await runtime.dispose(); }
