#!/usr/bin/env node
// Quality gate for one blog post, both languages, rendered in memory (works for drafts too).
//   node scripts/blog-check.mjs <slug>          exit 1 on any FAIL; WARN never blocks
// Checks the on-page signals the SEO playbook cares about (knowledge/marketing/seo-blog-playbook.md in the Agent OS repo).
// It cannot verify facts: numbers and first-person stories still go through the fact-check reviewer before hand-off.
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { render } from '../src/layout.mjs';
import { postPage, postPath } from '../src/blog.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const slug = process.argv[2];
if (!slug) { console.error('usage: node scripts/blog-check.mjs <slug>'); process.exit(2); }
const file = join(ROOT, 'src/posts', `${slug}.mjs`);
if (!existsSync(file)) { console.error(`no such post: src/posts/${slug}.mjs`); process.exit(2); }
const { post } = await import(file);

// Phrases that read as machine-written or as claims the site never makes. Case-insensitive substring match on body text.
const BANNED = {
  en: ['in today\'s fast-paced', 'in this article', 'delve', 'leverage', 'unlock', 'game-changer', 'game changer', 'revolutioniz', 'navigate the complexities', 'seamless', 'cutting-edge', 'it\'s important to note', 'in conclusion', 'never makes mistakes', 'replaces your front desk', 'guaranteed'],
  zh: ['赋能', '颠覆', '不是……而是', '不是…而是', '在当今', '值得注意的是', '综上所述', '永远不会出错', '完全替代前台', '保证排名'],
};
const PLACEHOLDER = /\[Jack 补/;
const strip = (h) => h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim();

let fails = 0, warns = 0;
const out = (level, lang, msg) => { if (level === 'FAIL') fails++; if (level === 'WARN') warns++; console.log(`${level.padEnd(4)} ${lang}  ${msg}`); };

for (const lang of ['en', 'zh']) {
  const c = post[lang];
  const F = (ok, msg) => out(ok ? 'PASS' : 'FAIL', lang, msg);
  const W = (ok, msg) => out(ok ? 'PASS' : 'WARN', lang, msg);
  if (!c) { out('FAIL', lang, 'missing language block'); continue; }

  const page = { path: postPath(post.slug), ...postPage(post, lang) };
  const html = render(page, lang);
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const body = strip(c.sections);
  const len = (s) => (lang === 'zh' ? s.replace(/\s/g, '').length : s.length);
  const words = lang === 'zh' ? body.replace(/\s/g, '').length : body.split(' ').filter(Boolean).length;

  // Head
  F(len(c.title) >= (lang === 'zh' ? 18 : 40) && len(c.title) <= (lang === 'zh' ? 34 : 62), `title length ${len(c.title)} (${lang === 'zh' ? '18–34 chars' : '40–62 chars'}): "${c.title}"`);
  F(/\| AI Man Jack$/.test(c.title), 'title ends with "| AI Man Jack"');
  F(len(c.description) >= (lang === 'zh' ? 50 : 110) && len(c.description) <= (lang === 'zh' ? 85 : 160), `description length ${len(c.description)} (${lang === 'zh' ? '50–85' : '110–160'})`);
  const kw = c.keyword.toLowerCase();
  F(c.title.toLowerCase().includes(kw) || c.h1.toLowerCase().includes(kw), `keyword "${c.keyword}" in title or h1`);
  const first = lang === 'zh' ? body.slice(0, 200) : body.split(' ').slice(0, 100).join(' ');
  W(first.toLowerCase().includes(kw), `keyword in first ${lang === 'zh' ? '200 chars' : '100 words'}`);

  // Structure
  F((main.match(/<h1[\s>]/g) || []).length === 1, 'exactly one h1');
  const h2s = (c.sections.match(/<h2[\s>]/g) || []).length;
  F(h2s >= 3, `${h2s} h2 sections (need ≥ 3)`);
  F(!/<h1[\s>]/.test(c.sections), 'no h1 inside sections');
  F(words >= (lang === 'zh' ? 900 : 700), `${words} ${lang === 'zh' ? 'chars' : 'words'} in body (min ${lang === 'zh' ? 900 : 700})`);
  W(words <= (lang === 'zh' ? 3500 : 2200), `body under ${lang === 'zh' ? 3500 : 2200} — longer posts should be split`);
  F(c.takeaways?.length >= 3 && c.takeaways.length <= 5, `${c.takeaways?.length ?? 0} takeaways (3–5)`);
  F(c.faq?.length >= 3, `${c.faq?.length ?? 0} FAQ pairs (need ≥ 3)`);
  F(/<h2[^>]*>[^<]*(not work|does not|doesn't|when .* fails|不灵|不适合|失败|不该)/i.test(c.sections), 'has a "when this does not work" section');

  // Links
  const links = [...c.sections.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  const internal = links.filter((h) => h.startsWith('/'));
  const external = links.filter((h) => /^https?:\/\//.test(h) && !h.includes('aimanjack.com'));
  F(internal.length >= 2, `${internal.length} internal links inside the body (need ≥ 2)`);
  F(c.pillar?.[1]?.startsWith('/'), `pillar path set (${c.pillar?.[1]})`);
  F(c.related?.length >= 2, `${c.related?.length ?? 0} related links (need ≥ 2)`);
  const badLang = internal.filter((h) => lang === 'zh' ? !h.startsWith('/zh') : h.startsWith('/zh'));
  F(badLang.length === 0, badLang.length ? `body links point at the other language: ${badLang.join(', ')}` : 'body links stay in the same language');
  for (const p of [...internal, ...(c.related || []).map((r) => r[1]), c.pillar[1]]) {
    const rel = p.replace(/#.*$/, '').replace(/^\//, '');
    const candidates = [join(ROOT, rel, 'index.html'), join(ROOT, rel + '.html'), join(ROOT, rel.replace(/\/$/, '') + '.html')];
    const exists = rel === '' || candidates.some(existsSync) || (lang === 'zh' && candidates.map((x) => x.replace(/\/zh\//, '/')).some(existsSync));
    F(exists, `internal target exists: ${p}`);
  }
  W(external.length >= 1, `${external.length} external source links (playbook wants ≥ 1 when a claim needs backing)`);

  // Voice / facts
  const hits = BANNED[lang].filter((b) => body.toLowerCase().includes(b.toLowerCase()) || c.title.toLowerCase().includes(b.toLowerCase()));
  F(hits.length === 0, hits.length ? `banned phrases: ${hits.join(', ')}` : 'no banned phrases');
  F(!PLACEHOLDER.test(c.sections + c.faq.map((f) => f.join(' ')).join(' ') + c.takeaways.join(' ')), 'no [Jack 补] placeholders left');
  const dollars = body.match(/\$\s?\d[\d,]*/g) || [];
  W(dollars.length === 0, dollars.length ? `prices in body (${dollars.join(', ')}) — only /pricing/ numbers are allowed; confirm in approved-claims.md` : 'no prices in body');
  const pct = body.match(/\d+(\.\d+)?\s?%/g) || [];
  W(pct.length === 0, pct.length ? `percentages in body (${pct.join(', ')}) — each needs a source in approved-claims.md or sources[]` : 'no percentages in body');
  F(/"@type":"Article"/.test(html) && /"@type":"BreadcrumbList"/.test(html), 'Article + BreadcrumbList JSON-LD present');
  F(!c.faq?.length || /"@type":"FAQPage"/.test(html), 'FAQPage JSON-LD present');
  F(/hreflang="x-default"/.test(html), 'hreflang block present');
}

console.log(`\n${post.slug}: ${fails} FAIL, ${warns} WARN, status=${post.status}`);
process.exit(fails ? 1 : 0);
