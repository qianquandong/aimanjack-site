#!/usr/bin/env node
// Renders src/pages/*.mjs → static HTML in the repo root (committed, served as-is by Cloudflare Pages), plus sitemap.xml and llms.txt.
//   node scripts/build.mjs
// Each page module exports `pages`: [{ path: '/about/', priority?, changefreq?, indexable?, en: {...}, zh: {...} }].
// indexable: false → rendered with noindex,follow and left out of the sitemap (see pageOf in src/layout.mjs).
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render, pageOf } from '../src/layout.mjs';
import { zhPath, SITE } from '../src/config.mjs';
import { llms } from '../src/llms.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = (p) => p.endsWith('/') ? p + 'index.html' : p + '.html';   // '/pricing/' → pricing/index.html, '/privacy' → privacy.html
const write = (rel, html) => { const f = join(ROOT, rel); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, html); };

const urls = [];
for (const file of readdirSync(join(ROOT, 'src/pages')).filter((f) => f.endsWith('.mjs')).sort()) {
  const { pages } = await import(`../src/pages/${file}`);
  for (const p of pages) {
    for (const lang of ['en', 'zh']) {
      const page = pageOf(p, lang);
      const langPath = lang === 'zh' ? zhPath(p.path) : p.path;
      write(outFile(langPath).replace(/^\//, ''), render(page, lang));
      if (!page.noindex) urls.push({ loc: SITE + langPath, priority: p.priority ?? 0.7, changefreq: p.changefreq ?? 'monthly' });
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) =>
  `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`).join('\n')}\n</urlset>\n`);
write('llms.txt', llms());
console.log(`built ${urls.length} indexable pages + sitemap + llms.txt`);
