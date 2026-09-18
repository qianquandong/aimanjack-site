#!/usr/bin/env node
// Renders src/pages/*.mjs → static HTML in the repo root (committed, served as-is by Cloudflare Pages), plus sitemap.xml and llms.txt.
//   node scripts/build.mjs
// Each page module exports `pages`: [{ path: '/about/', priority?, changefreq?, indexable?, en: {...}, zh: {...} }].
// indexable: false → rendered with noindex,follow and left out of the sitemap (see pageOf in src/layout.mjs).
import { readdirSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, pageOf, langsOf } from '../src/layout.mjs';
import { zhPath, SITE } from '../src/config.mjs';
import { llms } from '../src/llms.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = (p) => p.endsWith('/') ? p + 'index.html' : p + '.html';   // '/pricing/' → pricing/index.html, '/privacy' → privacy.html
const write = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };

// lastmod must mean "this page changed", not "someone ran the build": a page whose HTML is byte-identical
// to what is already on disk keeps the lastmod it had in the previous sitemap.
const today = new Date().toISOString().slice(0, 10);
const read = (rel) => { const f = join(ROOT, rel); return existsSync(f) ? readFileSync(f, 'utf8') : ''; };
const prevLastmod = Object.fromEntries([...read('sitemap.xml').matchAll(/<loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1], m[2]]));

const urls = [];
for (const file of readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.mjs')).sort()) {
  const { pages } = await import(`../src/pages/${file}`);
  for (const p of pages) {
    for (const lang of langsOf(p)) {
      const page = pageOf(p, lang);
      const langPath = lang === 'zh' ? zhPath(p.path) : p.path;
      const rel = outFile(langPath).replace(/^\//, ''), html = render(page, lang), loc = SITE + langPath;
      const lastmod = html === read(rel) && prevLastmod[loc] ? prevLastmod[loc] : today;
      write(rel, html);
      if (!page.noindex) urls.push({ loc, lastmod, priority: p.priority ?? 0.7, changefreq: p.changefreq ?? 'monthly' });
    }
  }
}

write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) =>
  `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
write('llms.txt', llms());
console.log(`built ${urls.length} indexable pages + sitemap + llms.txt`);
