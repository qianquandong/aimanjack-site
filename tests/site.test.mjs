import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { render, pageOf, langsOf } from '../src/layout.mjs';
import { llms } from '../src/llms.mjs';
import { OG_CARD } from '../src/config.mjs';

async function allPages() {
  const files = (await readdir(new URL('../src/pages/', import.meta.url))).filter((f) => f.endsWith('.mjs')).sort();
  const out = [];
  for (const file of files) {
    const { pages } = await import(`../src/pages/${file}`);
    for (const p of pages) for (const lang of langsOf(p)) { const page = pageOf(p, lang); out.push({ p, lang, page, html: render(page, lang) }); }
  }
  return out;
}
const find = (pages, path, lang) => pages.find((x) => x.p.path === path && x.lang === lang);
const head = (html) => html.slice(0, html.indexOf('</head>'));
const body = (html) => html.slice(html.indexOf('<main'), html.indexOf('<footer'));   // visible copy + schema-free; footer carries A2P legal text
const ld = (html) => [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((x) => x[1]).join('');

// Receptionist-era marketing that must not appear on any indexable page (PRD 2026-09-18 §79, §103).
const BANNED = [/AI receptionist/i, /Call our AI demo/i, /missed[- ]call calculator/i, /\$199/, /\$299/, /\$599/, /appointment businesses/i, /AI 前台/, /拨打 AI 演示/];
const LEGAL = ['/privacy', '/terms', '/sms-terms'];

test('home page positions AI Man Jack as practical AI training for teams, in both languages', async () => {
  const pages = await allPages();
  for (const [lang, title, h1] of [['en', /Practical AI Training for Teams/, /Make AI useful/], ['zh', /实操型 AI 培训/, /让 AI 真正落地/]]) {
    const home = find(pages, '/', lang);
    assert.ok(home, `missing ${lang} home`);
    assert.match(head(home.html), new RegExp(`<title>[^<]*${title.source}`));
    assert.match(home.html, new RegExp(`<h1[^>]*>[^<]*${h1.source}`));
    assert.ok(home.html.includes(`property="og:image" content="https://aimanjack.com${OG_CARD[lang]}"`), `${lang} home OG card`);
    assert.match(home.html, /Book a Workshop|预约团队培训/);
    for (const p of ['/tools/', '/use-cases/', '/workflows/', '/ai-training/']) assert.match(home.html, new RegExp(`href="(?:/zh)?${p}`), `${lang} home links ${p}`);
    for (const re of BANNED) assert.doesNotMatch(body(home.html) + ld(home.html), re, `${lang} home contains ${re}`);
  }
});

test('every indexable page carries complete technical SEO metadata and no receptionist marketing', async () => {
  for (const { p, lang, page, html } of await allPages()) {
    const route = `${lang}:${p.path}`;
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route} H1 count`);
    assert.match(html, /<title>[^<]+<\/title>/, `${route} title`);
    assert.match(html, /<meta name="description" content="[^"]+">/, `${route} description`);
    for (const hreflang of [...page.langs, 'x-default']) assert.match(html, new RegExp(`hreflang="${hreflang}"`), `${route} ${hreflang}`);
    assert.match(html, /<meta property="og:title" content="[^"]+">/, `${route} OG title`);
    assert.doesNotMatch(html, />undefined</, `${route} visible undefined copy`);
    if (page.noindex) { assert.match(html, /<meta name="robots" content="noindex, follow">/, `${route} noindex`); continue; }
    const self = `https://aimanjack.com${lang === 'zh' ? (p.path === '/' ? '/zh/' : '/zh' + p.path) : p.path}`;
    assert.match(html, new RegExp(`<link rel="canonical" href="${self.replace(/[/.]/g, '\\$&')}">`), `${route} self canonical`);
    assert.match(html, /<meta name="robots" content="index, follow/, `${route} index,follow`);
    assert.match(html, /<script type="application\/ld\+json">/, `${route} JSON-LD`);
    assert.ok(html.includes(`property="og:image" content="https://aimanjack.com${OG_CARD[lang]}"`), `${route} OG card`);
    assert.match(html, /<link rel="icon" type="image\/svg\+xml" href="\/favicon\.svg">/, `${route} svg icon`);
    if (LEGAL.includes(p.path)) continue;
    for (const re of BANNED) assert.doesNotMatch(body(html) + ld(html), re, `${route} contains ${re}`);
    assert.match(html, /href="\/(?:zh\/)?book\/"/, `${route} links to /book/`);
  }
});

// HANDOFF §4.1: unique title + description, no orphan pages, every <img> sized (no CLS).
test('indexable pages have unique titles and descriptions, are reachable by an internal link, and size their images', async () => {
  const pages = (await allPages()).filter((x) => !x.page.noindex);
  const url = (x) => (x.lang === 'zh' ? (x.p.path === '/' ? '/zh/' : '/zh' + x.p.path) : x.p.path);
  for (const [name, re] of [['title', /<title>([^<]+)<\/title>/], ['description', /<meta name="description" content="([^"]+)">/]]) {
    const seen = new Map();
    for (const x of pages) { const v = x.html.match(re)[1]; assert.ok(!seen.has(v), `duplicate ${name}: ${url(x)} and ${seen.get(v)}`); seen.set(v, url(x)); }
  }
  const linked = new Set(pages.flatMap((x) => [...x.html.matchAll(/<a [^>]*href="(\/[^"#?]*)/g)].map((m) => m[1]).filter((h) => h !== url(x))));
  for (const x of pages) assert.ok(linked.has(url(x)), `orphan: nothing links to ${url(x)}`);
  for (const x of pages) for (const [img] of x.html.matchAll(/<img [^>]*>/g)) assert.match(img, /width="\d+"[^>]*height="\d+"|height="\d+"[^>]*width="\d+"/, `${url(x)} unsized image: ${img.slice(0, 80)}`);
});

test('/ai-training/ is the indexable, self-canonical pillar and is in the sitemap', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const [lang, url] of [['en', 'https://aimanjack.com/ai-training/'], ['zh', 'https://aimanjack.com/zh/ai-training/']]) {
    const t = find(pages, '/ai-training/', lang);
    assert.ok(t, `missing ${lang} training page`);
    assert.equal(t.page.noindex, false);
    assert.match(t.html, new RegExp(`<link rel="canonical" href="${url}">`));
    assert.match(sitemap, new RegExp(`<loc>${url}</loc>`));
    assert.match(t.html, /id="teams"/);
    assert.match(t.html, /id="formats"/);
  }
  assert.match(sitemap, /<loc>https:\/\/aimanjack\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/aimanjack\.com\/zh\/<\/loc>/);
});

test('global navigation links training and booking, never the receptionist cluster', async () => {
  const pages = await allPages();
  const home = find(pages, '/', 'en');
  const chrome = home.html.slice(home.html.indexOf('<header'), home.html.indexOf('<main')) + home.html.slice(home.html.indexOf('<footer'));
  assert.match(chrome, /href="\/ai-training\/"/);
  assert.match(chrome, /href="\/book\/"/);
  assert.match(chrome, /Book a Workshop/);
  for (const p of ['/use-cases/', '/tools/', '/templates/', '/workflows/', '/blog/', '/about/']) assert.match(chrome, new RegExp(`href="${p}"`), `chrome links ${p}`);
  for (const bad of ['/ai-receptionist/', '/pricing/', '/industries/', '/integrations/', '/tools/missed-call-calculator/', 'tel:+14695172968']) assert.doesNotMatch(chrome, new RegExp(bad.replace(/[/+]/g, '\\$&')), `chrome links ${bad}`);
  assert.doesNotMatch(home.html, /<dialog/, 'AI demo dialog is no longer injected');
  const hdr = home.html.slice(home.html.indexOf('<header'), home.html.indexOf('</header>'));
  assert.doesNotMatch(hdr, /href="[^"]*#/, 'every header nav item is its own page, never an anchor');
});

test('legacy receptionist routes still render but are noindex and out of the sitemap', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const path of ['/ai-receptionist/', '/pricing/', '/industries/', '/industries/salons/', '/integrations/', '/tools/missed-call-calculator/', '/case-studies/', '/case-studies/car-dealership-sms/', '/blog/how-much-do-missed-calls-cost/']) {
    for (const lang of ['en', 'zh']) {
      const x = find(pages, path, lang);
      assert.ok(x, `legacy ${lang}:${path} must still be rendered`);
      assert.equal(x.page.noindex, true, `${lang}:${path} noindex`);
    }
    assert.doesNotMatch(sitemap, new RegExp(`<loc>[^<]*${path.replace(/[/-]/g, '\\$&')}</loc>`), `${path} in sitemap`);
  }
});

test('llms.txt describes training and nothing about the receptionist', () => {
  const t = llms();
  assert.match(t, /corporate AI training/i);
  assert.match(t, /\$1,500/);
  assert.match(t, /aimanjack\.com\/ai-training\//);
  for (const re of [/receptionist/i, /\$199/, /517-2968/, /demo line/i]) assert.doesNotMatch(t, re);
});

test('all consultation copy and booking source use 30 minutes', async () => {
  const files = ['src/config.mjs', 'src/i18n.mjs', 'src/components.mjs', 'src/pages/book.mjs', 'src/pages/contact.mjs', 'src/pages/training.mjs', 'src/pages/home.mjs', 'db/schema.sql'];
  const text = (await Promise.all(files.map(async (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8')))).join('\n');
  assert.doesNotMatch(text, /(?:15|20)[ -]minute|(?:15|20) 分钟|15-min/i);
  assert.match(text, /30-minute call/);
  assert.match(text, /duration_min[^\n]*30|30-minute demo call with Jack', 30/);
});

test('privacy policy discloses coupon email storage and delivery use in both languages', async () => {
  const pages = await allPages();
  for (const lang of ['en', 'zh']) {
    const privacy = find(pages, '/privacy', lang);
    assert.ok(privacy, `missing ${lang} privacy policy`);
    assert.match(privacy.html, /coupon|优惠券/i);
    assert.match(privacy.html, /email/i);
  }
});

// PRD (Frontend + SEO/GEO + Free Tools) §33: the library must be internally linked, and the tool must score deterministically.
test('every workflow links to its use case, a related workflow, a tool or template, and training; templates link back', async () => {
  const pages = await allPages();
  const { WORKFLOWS } = await import('../src/content/workflows.mjs');
  const { TEMPLATES } = await import('../src/content/templates.mjs');
  for (const w of WORKFLOWS) {
    for (const lang of ['en', 'zh']) assert.ok(find(pages, `/workflows/${w.slug}/`, lang), `${lang} ${w.slug}`);
    const html = body(find(pages, `/workflows/${w.slug}/`, 'en').html);
    assert.match(html, new RegExp(`href="/use-cases/${w.department}/"`), `${w.slug} → use case`);
    assert.ok(w.related.length >= 2 && w.related.every((r) => html.includes(`href="/workflows/${r}/"`)), `${w.slug} → related workflows`);
    assert.match(html, /href="\/tools\/ai-readiness-assessment\/"/, `${w.slug} → tool`);
    assert.match(html, /href="\/ai-training\/"/, `${w.slug} → training`);
    if (w.template) assert.match(html, new RegExp(`href="/templates/${w.template}/"`), `${w.slug} → template`);
    assert.doesNotMatch(html, /time saved|hours saved|\d+% faster/i, `${w.slug} makes an unmeasured time claim`);
  }
  for (const t of TEMPLATES) {
    const html = body(find(pages, `/templates/${t.slug}/`, 'en').html);
    assert.match(html, new RegExp(`href="/workflows/${t.workflows[0]}/"`), `${t.slug} → workflow`);
    assert.match(html, new RegExp(`href="/use-cases/${t.category}/"`), `${t.slug} → use case`);
  }
  // The library exists in both languages (redesign 2026-09): each page advertises its twin, and zh pages link to zh pages.
  for (const x of pages.filter((x) => /^\/(tools|use-cases|workflows|templates)\//.test(x.p.path) && !x.page.noindex)) {
    assert.deepEqual(x.page.langs, ['en', 'zh'], `${x.p.path} is bilingual`);
    assert.match(x.html, /hreflang="zh"/, `${x.p.path} advertises its zh version`);
    if (x.lang === 'zh') assert.doesNotMatch(body(x.html), /href="\/(tools|use-cases|workflows|templates)\//, `zh ${x.p.path} links to an English library page`);
  }
});

test('AI readiness score is deterministic, bounded, and never gated behind email', async () => {
  const { score, QUESTIONS, BANDS } = await import('../src/pages/freetools.mjs');
  const n = QUESTIONS.length;
  assert.equal(score(Array(n).fill(0), QUESTIONS).overall, 0);
  assert.equal(score(Array(n).fill(4), QUESTIONS).overall, 100);
  const mixed = QUESTIONS.map((_, i) => i % 5);
  assert.deepEqual(score(mixed, QUESTIONS), score(mixed, QUESTIONS));
  const r = score(QUESTIONS.map(([c]) => (c === 'governance' ? 0 : 4)), QUESTIONS);
  assert.equal(r.cats.governance, 0); assert.equal(r.cats.people, 100); assert.equal(r.overall, 80);
  assert.deepEqual(BANDS.map((b) => b[0]), [0, 26, 51, 76]);
  const html = find(await allPages(), '/tools/ai-readiness-assessment/', 'en').html;
  assert.equal((html.match(/class="ara-q"/g) || []).length, n, 'all questions are in the HTML (indexable, works as a sheet without JS)');
  assert.doesNotMatch(html, /type="email"/, 'no email field anywhere on the tool');
  assert.match(html, /not a validated benchmark/, 'the result screen says what the score is not');
  assert.match(html, /Is the score scientifically validated\?<\/summary><div class="faq-a"><p>No\./, 'and the FAQ answers the validation question with No');
  assert.match(html, /"@type":"WebApplication"/);
});

// Both of these shipped to preview once and overflowed a 375px screen: an inline grid beats every media query, and a bare table cannot scroll.
test('no inline grid columns and no unwrapped tables on indexable pages (mobile overflow guards)', async () => {
  for (const x of (await allPages()).filter((x) => !x.page.noindex)) {
    assert.doesNotMatch(x.html, /style="[^"]*grid-template-columns/, `${x.lang}:${x.p.path} inline grid-template-columns`);
    const tables = (x.html.match(/<table/g) || []).length, wrapped = (x.html.match(/class="table-wrap"><table/g) || []).length;
    assert.equal(tables, wrapped, `${x.lang}:${x.p.path} has a table outside .table-wrap`);
  }
});

test('brand assets exist: OG cards named in config, full favicon set', async () => {
  const { access } = await import('node:fs/promises');
  for (const f of [OG_CARD.en, OG_CARD.zh, '/favicon.ico', '/favicon.svg', '/favicon-16.png', '/favicon-32.png', '/apple-touch-icon.png']) await access(new URL('..' + f, import.meta.url));
});

// Flywheel order: assessment result → free template → use case → training (and the worksheet templates lead back to the tool).
test('every assessment area leads to a template first; that template leads on to a use case and training', async () => {
  const { NEXT, CATEGORIES } = await import('../src/pages/freetools.mjs');
  const { templateBySlug } = await import('../src/content/templates.mjs');
  const pages = await allPages();
  assert.deepEqual(Object.keys(NEXT).sort(), Object.keys(CATEGORIES).sort(), 'one destination per area');
  for (const [lang, pre] of [['en', ''], ['zh', '/zh']]) {
    const tool = find(pages, '/tools/ai-readiness-assessment/', lang).html;
    for (const [area, [tpl, uc]] of Object.entries(NEXT)) {
      assert.ok(templateBySlug[tpl], `${area} → template ${tpl} exists`);
      assert.ok(tool.includes(`"${pre}/templates/${tpl}/"`), `${lang} result data links ${tpl}`);
      assert.ok(tool.includes(`"${pre}/use-cases/${uc}/"`), `${lang} result data links use case ${uc}`);
      const t = body(find(pages, `/templates/${tpl}/`, lang).html);
      assert.ok(t.includes(`href="${pre}/use-cases/${templateBySlug[tpl].category}/"`), `${lang} ${tpl} → use case`);
      assert.ok(t.includes(`href="${pre}/ai-training/"`), `${lang} ${tpl} → training`);
      assert.ok(t.includes(`href="${pre}/book/"`), `${lang} ${tpl} → book`);
      if (templateBySlug[tpl].standalone) assert.ok(t.includes(`href="${pre}/tools/ai-readiness-assessment/"`), `${lang} ${tpl} → back to the tool`);
    }
  }
});
