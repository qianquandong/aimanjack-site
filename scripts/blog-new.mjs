#!/usr/bin/env node
// Scaffold a blog post from src/posts/_TEMPLATE.mjs.
//   node scripts/blog-new.mjs <slug> [YYYY-MM-DD]
// Refuses to overwrite. Slug: lowercase letters, digits, hyphens. Then fill the file and run scripts/blog-check.mjs <slug>.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const [slug, date = new Date().toISOString().slice(0, 10)] = process.argv.slice(2);
if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) { console.error('usage: node scripts/blog-new.mjs <slug> [YYYY-MM-DD]   (slug = lowercase-with-hyphens)'); process.exit(2); }
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error(`bad date "${date}", want YYYY-MM-DD`); process.exit(2); }
const out = join(ROOT, 'src/posts', `${slug}.mjs`);
if (existsSync(out)) { console.error(`${out} already exists`); process.exit(1); }
const tpl = readFileSync(join(ROOT, 'src/posts/_TEMPLATE.mjs'), 'utf8').replace("slug: 'SLUG'", `slug: '${slug}'`).replace("date: 'YYYY-MM-DD'", `date: '${date}'`);
writeFileSync(out, tpl);
console.log(`created src/posts/${slug}.mjs (status: draft). Next: fill it, then node scripts/blog-check.mjs ${slug}`);
