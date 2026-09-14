#!/usr/bin/env node
// Zero-dependency audit of generated HTML. Run after: node scripts/build.mjs
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SITE = 'https://aimanjack.com';
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
const outputFile = (pathname) => pathname.endsWith('/') ? join(ROOT, pathname, 'index.html') : join(ROOT, pathname + '.html');
const sitemap = readFileSync(join(ROOT, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));

for (const url of urls) {
  const file = outputFile(url.pathname);
  check(existsSync(file), `${url.pathname}: generated file missing`);
  if (!existsSync(file)) continue;
  const html = readFileSync(file, 'utf8');
  const route = url.pathname;
  check((html.match(/<h1[\s>]/g) || []).length === 1, `${route}: expected exactly one H1`);
  check(/<title>[^<]+<\/title>/.test(html), `${route}: title missing`);
  check(/<meta name="description" content="[^"]+">/.test(html), `${route}: description missing`);
  check(html.includes(`<link rel="canonical" href="${url.href}">`), `${route}: canonical mismatch`);
  for (const lang of ['en', 'zh', 'x-default']) check(html.includes(`hreflang="${lang}"`), `${route}: ${lang} hreflang missing`);
  check(html.includes('<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">'), `${route}: index robots missing`);
  check(!html.includes('>undefined<'), `${route}: visible undefined copy`);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  check(scripts.length > 0, `${route}: JSON-LD missing`);
  for (const script of scripts) try { JSON.parse(script[1]); } catch { errors.push(`${route}: invalid JSON-LD`); }

  for (const match of html.matchAll(/<a\b[^>]*href="(\/[^"]*)"/g)) {
    const target = new URL(match[1], SITE);
    if (target.pathname.startsWith('/v1/')) continue;
    check(existsSync(outputFile(target.pathname)), `${route}: broken internal link ${target.pathname}`);
  }
}

for (const [route, canonical] of [['/ai-training/', `${SITE}/`], ['/zh/ai-training/', `${SITE}/zh/`]]) {
  const html = readFileSync(outputFile(route), 'utf8');
  check(html.includes(`<link rel="canonical" href="${canonical}">`), `${route}: legacy canonical mismatch`);
  check(html.includes('<meta name="robots" content="noindex, follow">'), `${route}: legacy route must be noindex`);
  check(!sitemap.includes(`<loc>${SITE}${route}</loc>`), `${route}: legacy route must not be in sitemap`);
}

check(urls.length === 38, `sitemap: expected 38 indexable bilingual URLs, found ${urls.length}`);
if (errors.length) {
  for (const error of errors) console.error(`FAIL ${error}`);
  console.error(`\n${errors.length} local SEO audit failure(s)`);
  process.exit(1);
}
console.log(`PASS local SEO audit: ${urls.length} indexable URLs + 2 preserved noindex legacy routes`);
