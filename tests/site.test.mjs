import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { render, pageOf, langsOf } from '../src/layout.mjs';
import { llms } from '../src/llms.mjs';
import { OG_CARD } from '../src/config.mjs';
import { fileURLToPath } from 'node:url';

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
  // 2026-10-13: the home title/H1 no longer carry "Dallas–Fort Worth" — /ai-training/dallas/ owns that term (HANDOFF §1.1).
  for (const [lang, title, h1] of [['en', /Corporate AI Training for Business Teams/, /AI training for/], ['zh', /企业团队 AI 实操培训/, /企业团队的/]]) {
    const home = find(pages, '/', lang);
    assert.ok(home, `missing ${lang} home`);
    assert.match(head(home.html), new RegExp(`<title>[^<]*${title.source}`));
    assert.match(home.html, new RegExp(`<h1[^>]*>[^<]*${h1.source}`));
    assert.ok(home.html.includes(`property="og:image" content="https://aimanjack.com${OG_CARD[lang]}"`), `${lang} home OG card`);
    assert.match(home.html, /Book a Workflow Call|预约工作流咨询/);
    for (const p of ['/tools/', '/use-cases/', '/workflows/', '/ai-training/']) assert.match(home.html, new RegExp(`href="(?:/zh)?${p}`), `${lang} home links ${p}`);
    for (const re of BANNED) assert.doesNotMatch(body(home.html) + ld(home.html), re, `${lang} home contains ${re}`);
  }
});

test('training proof remains visible without self-serving rating markup, and offer areas resolve on the page', async () => {
  const pages = await allPages();
  const { PROOF, GBP_URL } = await import('../src/config.mjs');
  for (const lang of ['en', 'zh']) {
    for (const path of ['/', '/ai-training/', '/about/']) {
      const html = find(pages, path, lang).html;
      assert.doesNotMatch(ld(html), /"@type":"(?:Review|AggregateRating)"/);
      assert.ok(body(html).includes(GBP_URL), `${lang}:${path} keeps its Google source`);
      // The approved training copy links to Google without repeating a dated review count.
      if (path !== '/ai-training/') assert.ok(body(html).includes(String(PROOF.reviews)), `${lang}:${path} keeps the checked review count`);
    }
    for (const path of ['/ai-training/team-workshop/', '/ai-training/onsite-texas/']) {
      const nodes = JSON.parse(ld(find(pages, path, lang).html))['@graph'];
      const service = nodes.find(n => n['@type'] === 'Service');
      assert.equal(service.provider['@id'], 'https://aimanjack.com/#business');
      assert.ok(service.areaServed.some(a => a.name === 'Dallas–Fort Worth metroplex' && a['@type'] === 'AdministrativeArea'));
    }
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
  assert.match(chrome, /Book a Workflow Call/);
  assert.doesNotMatch(chrome, /Book a Workshop/);
  for (const p of ['/use-cases/', '/tools/', '/templates/', '/workflows/', '/blog/', '/about/']) assert.match(chrome, new RegExp(`href="${p}"`), `chrome links ${p}`);
  for (const bad of ['/ai-receptionist/', '/pricing/', '/industries/', '/integrations/', '/tools/missed-call-calculator/', 'tel:+14695172968']) assert.doesNotMatch(chrome, new RegExp(bad.replace(/[/+]/g, '\\$&')), `chrome links ${bad}`);
  assert.doesNotMatch(home.html, /<dialog/, 'AI demo dialog is no longer injected');
  const hdr = home.html.slice(home.html.indexOf('<header'), home.html.indexOf('</header>'));
  assert.doesNotMatch(hdr, /href="[^"]*#/, 'every header nav item is its own page, never an anchor');
});

test('legacy receptionist routes still render but are noindex and out of the sitemap', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const path of ['/ai-receptionist/', '/pricing/', '/industries/', '/industries/salons/', '/integrations/', '/tools/missed-call-calculator/', '/case-studies/ai-man-jack/', '/case-studies/car-dealership-sms/', '/blog/how-much-do-missed-calls-cost/']) {
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
  assert.match(t, /no public price list/i);
  assert.doesNotMatch(t, /\$\s?\d/, 'llms.txt states no price');
  assert.doesNotMatch(t, /\$1,500|half-day/i);
  assert.match(t, /aimanjack\.com\/ai-training\//);
  for (const re of [/receptionist/i, /\$199/, /517-2968/, /demo line/i]) assert.doesNotMatch(t, re);
});

test('all consultation copy and the booking seed use 20 minutes', async () => {
  const files = ['src/config.mjs', 'src/i18n.mjs', 'src/components.mjs', 'src/pages/book.mjs', 'src/pages/contact.mjs', 'src/pages/training.mjs', 'src/pages/home.mjs', 'db/schema.sql'];
  const text = (await Promise.all(files.map(async (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8')))).join('\n');
  assert.doesNotMatch(text, /(?:15|30)[ -]minute|(?:15|30) 分钟|15-min|demo call with Jack/i);
  assert.match(text, /20-minute workflow call/i);
  assert.match(text, /'20-Minute AI Workflow Call', 20,/);
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

test('case studies: the index and the livestream case are indexable proof pages; receptionist-era cases stay legacy and unlinked', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  const CASE = '/case-studies/livestream-agency-scheduling/', OLD = ['/case-studies/ai-man-jack/', '/case-studies/car-dealership-sms/'];
  for (const lang of ['en', 'zh']) {
    const pre = lang === 'zh' ? '/zh' : '', idx = find(pages, '/case-studies/', lang), c = find(pages, CASE, lang);
    for (const [x, path] of [[idx, '/case-studies/'], [c, CASE]]) {
      assert.ok(x && !x.page.noindex, `${lang}:${path} indexable`);
      assert.match(sitemap, new RegExp(`<loc>https://aimanjack\\.com${pre}${path}</loc>`), `${lang}:${path} in sitemap`);
    }
    assert.ok(idx.html.includes(`href="${pre}${CASE}"`), `${lang} index links the case`);
    const b = body(c.html);
    assert.match(ld(c.html), /"@type":"Article"/); assert.match(ld(c.html), /"@type":"BreadcrumbList"/);
    for (const to of ['/use-cases/operations/', '/workflows/', '/ai-training/', '/book/']) assert.ok(b.includes(`href="${pre}${to}"`), `${lang} case → ${to}`);
    // measured tables, all six failures, and the six-hour fact always next to its human-review caveat
    for (const n of ['41%', '0%', '392', '456', '17%', '26%']) assert.ok(b.includes(`>${n}<`), `${lang} table value ${n}`);
    assert.equal((b.match(/<ol><li><strong>/g) || []).length, 2); assert.ok((b.match(/<li><strong>/g) || []).length >= 12, 'six failures + six lessons');
    assert.match(b, lang === 'zh' ? /大约要 6 小时，现在这一步已经自动生成。最终班表仍由运营负责人审核、修改并发布/ : /about six hours each week\. That first draft is now generated automatically; a person still reviews, edits and publishes/);
    assert.doesNotMatch(b, /(6|six)[ -]hours? saved|saved? (about |roughly )?(6|six) hours|fully autonomous|zero human|100% automated/i);
  }
  // the proof block is on the home, training, operations and workflows pages, and keeps the caveat
  for (const path of ['/', '/ai-training/', '/use-cases/operations/', '/workflows/']) {
    const b = body(find(pages, path, 'en').html);
    assert.ok(b.includes(`href="${CASE}"`), `${path} links the case`); assert.match(b, /still reviews, edits and publishes/);
  }
  assert.ok(!body(find(pages, '/use-cases/sales/', 'en').html).includes(CASE), 'only the operations use case carries it');
  for (const x of pages.filter((x) => !x.page.noindex)) for (const o of OLD) assert.ok(!x.html.includes(`${o}"`), `${x.lang}:${x.p.path} links legacy case ${o}`);
  const t = llms();
  assert.match(t, /case-studies\/livestream-agency-scheduling\//); assert.match(t, /still reviews, edits and publishes/);
  for (const o of OLD) assert.ok(!t.includes(o));
});

test('the four-session program is the only offer on Home and Training; the client program is in progress, unnamed and claims no results', async () => {
  const pages = await allPages();
  for (const path of ['/', '/ai-training/']) {
    const b = body(find(pages, path, 'en').html), z = body(find(pages, path, 'zh').html);
    for (const re of [/Priced by quote/, /4 × 90 min/, /Remote across the U\.S\./, /Dallas–Fort Worth onsite/]) assert.match(b, re, `${path} shows ${re}`);
    for (const re of [/按需报价/, /4 × 90 分钟/, /全美远程/]) assert.match(z, re, `zh ${path} shows ${re}`);
    for (const x of [b, z]) {
      assert.equal((x.match(/<div class="prog[ "]/g) || []).length, 1, `${path} has exactly one offer card`);
      assert.match(x, /class="prog dark on-dark solo"/);
      assert.doesNotMatch(x, /\$1,500|Half day|half-day workshop|半天工作坊|Scoped after|Three ways to|Ways to work together/, `${path} shows no competing format`);
      assert.doesNotMatch(x, /gun|firearm|枪|California retail|hours? saved|ROI of|省了 ?\d+ ?小时/i, `${path} client proof stays unnamed and claims nothing`);
    }
    // The training rewrites omit the unfinished client card; both home pages keep its status.
    if (path !== '/ai-training/') {
      assert.match(b, /In progress/);
      assert.match(z, /进行中/);
    }
  }
  // every primary CTA on the money pages goes to /book/ or to the program; no page-level CTA points at a workshop
  for (const x of pages.filter((x) => !x.page.noindex && !x.p.path.startsWith('/blog/'))) assert.doesNotMatch(body(x.html) + ld(x.html), /\$1,500|Book a Workshop|预约团队培训/, `${x.lang}:${x.p.path}`);
  for (const lang of ['en', 'zh']) {
    assert.doesNotMatch(body(find(pages, '/book/', lang).html), /workshop in one call|规划团队的工作坊|team workshop|团队工作坊/);
    assert.doesNotMatch(ld(find(pages, '/ai-training/', lang).html), /"price"/, 'no price in structured data');
  }
});

// ── Revenue OS v6 (2026-10-08): team formats, quote intake, consent-aware analytics ─────────────────────────────────────
const { OFFERS, QUOTE_URL, INTAKE_FORM_VERSION, CONSENT_NOTICE_VERSION, GA4_ID } = await import('../src/config.mjs');
const urlOf = (path, lang) => (lang === 'zh' ? (path === '/' ? '/zh/' : '/zh' + path) : path);
// Owner-UNAPPROVED amounts (revenue-os config/offer_catalog.json proposals) and the retired half-day offer. None may be public.
const UNAPPROVED_PRICES = [/\$\s?1,?500(?!\d)/, /\$\s?4,?900(?!\d)/, /\$\s?95(?![\d,])/, /"price":"?(?:1500|4900|95)\b/, /\b(?:1,?500|4,?900) ?美元/, /半天 ?\$/];
// Retired formats are banned on every indexable page, including the corrected older posts.
const RETIRED_FORMAT = [/半天(?:的)?(?:实操)?工作坊/, /half[- ]day(?: hands-on)? workshop/i];
const UNAPPROVED = [...UNAPPROVED_PRICES, ...RETIRED_FORMAT];
const bannedFor = () => UNAPPROVED;

test('team workshop and onsite pages are indexable, bilingual, self-canonical, in the sitemap, and priced only by scoped quote', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const key of ['workshop', 'onsite']) {
    const o = OFFERS[key];
    for (const lang of ['en', 'zh']) {
      const x = find(pages, o.path, lang), route = `${lang}:${o.path}`;
      assert.ok(x && !x.page.noindex, `${route} indexable`);
      assert.deepEqual(x.page.langs, ['en', 'zh'], `${route} bilingual`);
      const self = `https://aimanjack.com${urlOf(o.path, lang)}`;
      assert.ok(x.html.includes(`<link rel="canonical" href="${self}">`), `${route} self canonical`);
      assert.ok(head(x.html).includes(`hreflang="en" href="https://aimanjack.com${o.path}"`) && head(x.html).includes(`hreflang="zh" href="https://aimanjack.com/zh${o.path}"`), `${route} hreflang pair`);
      assert.ok(sitemap.includes(`<loc>${self}</loc>`), `${route} in sitemap`);
      assert.equal((x.html.match(/<h1[\s>]/g) || []).length, 1, `${route} one H1`);
      const b = body(x.html), j = ld(x.html);
      assert.ok(b.includes(`href="${urlOf(QUOTE_URL, lang)}?format=${o.format}"`), `${route} quote CTA`);
      assert.ok(b.includes(`href="${urlOf('/book/', lang)}"`), `${route} workflow-call CTA`);
      assert.match(b, lang === 'zh' ? /按需报价/ : /Scoped quote/, `${route} pricing status`);
      assert.match(b, lang === 'zh' ? /价格取决于团队人数、授课地点和准备工作量/ : /Pricing depends on team size, location and preparation/, `${route} pricing drivers`);
      assert.match(b, lang === 'zh' ? /不是 ERP 或 CRM 定制开发/ : /not a custom ERP or CRM build/, `${route} says training, not an ERP/CRM build`);
      assert.deepEqual([...new Set([...b.matchAll(/\$\s?\d[\d,.]*/g)].map((m) => m[0]))], [], `${route} shows no price`);
      for (const re of UNAPPROVED) assert.doesNotMatch(b + j, re, `${route} ${re}`);
      assert.match(b, /<div class="faq"><details/, `${route} FAQ is plain HTML`);
      assert.match(j, /"@type":"Service"/);
      assert.doesNotMatch(j, /"@type":"(?:Review|AggregateRating|FAQPage|Offer|HowTo)"|"price"|ratingValue/, `${route} JSON-LD stays within guideline-safe types`);
      assert.ok(x.html.includes(`data-offer="${o.id}"`), `${route} view_offer id`);
      if (key === 'onsite') { const t = b.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '); for (const m of t.matchAll(/Odessa/g)) assert.match(t.slice(m.index, m.index + 160), /quoted separately|另行报价/, `${route} Odessa only next to a separate travel quote`); }
    }
  }
  for (const path of ['/', '/ai-training/']) for (const lang of ['en', 'zh']) {
    const b = body(find(pages, path, lang).html);
    assert.match(b, /id="team-paths"/, `${lang}:${path} has the three-path chooser`);
    for (const p of [OFFERS.workshop.path, OFFERS.onsite.path]) assert.ok(b.includes(`href="${urlOf(p, lang)}"`), `${lang}:${path} links ${p}`);
    assert.doesNotMatch(b.slice(b.indexOf('id="team-paths"')).split('</section>')[0], /class="prog/, `${lang}:${path} chooser cards are not offer cards`);
  }
});

test('no owner-unapproved price or retired half-day offer appears on any indexable page, built file, or llms.txt', async () => {
  const pages = await allPages();
  for (const x of pages.filter((x) => !x.page.noindex)) for (const re of bannedFor(x.p.path)) assert.doesNotMatch(body(x.html) + ld(x.html) + head(x.html), re, `${x.lang}:${x.p.path} ${re}`);
  for (const re of UNAPPROVED) assert.doesNotMatch(llms(), re, `llms.txt ${re}`);
  // Built HTML on disk, including anything hand-written outside src/: an indexable file must come from a src route and carry no unapproved price.
  const { readdirSync, readFileSync, statSync } = await import('node:fs');
  const root = fileURLToPath(new URL('../', import.meta.url)), SKIP = new Set(['.git', '.claude', '.deploy', '.preview', 'scripts', 'design-system', 'output', 'docs', 'src', 'db', 'functions', 'state', 'tests', 'node_modules']);
  const files = [], walk = (d) => { for (const f of readdirSync(root + d)) { const rel = d + f; if (SKIP.has(rel)) continue; if (statSync(root + rel).isDirectory()) walk(rel + '/'); else if (f.endsWith('.html')) files.push(rel); } };
  walk('');
  const routes = new Set(pages.map((x) => urlOf(x.p.path, x.lang)));
  let indexable = 0;
  for (const f of files) {
    const html = readFileSync(root + f, 'utf8');
    if (/<meta name="robots" content="noindex/.test(html)) continue;
    indexable += 1;
    const url = '/' + f.replace(/index\.html$/, '').replace(/\.html$/, '');
    assert.ok(routes.has(url), `${f} is indexable but no src/pages route generates it (hand-written pages drift; add a route or noindex it)`);
    for (const re of bannedFor(url)) assert.doesNotMatch(html, re, `${f} ${re}`);
  }
  assert.ok(indexable >= 98, `scanned ${indexable} indexable files`);
});

test('the two Chinese buyer guides are generated, current, and free of retired prices and rating schema', async () => {
  const pages = await allPages();
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  for (const path of ['/ai-peixun-shi/', '/ai-peixun-najia-zuihao/']) {
    const x = find(pages, path, 'zh'), url = `https://aimanjack.com/zh${path}`;
    assert.ok(x && !x.page.noindex, `zh${path} indexable`);
    assert.ok(!find(pages, path, 'en'), `zh${path} has no EN twin`);
    const h = head(x.html), b = body(x.html), j = ld(x.html);
    assert.ok(h.includes(`<link rel="alternate" hreflang="zh" href="${url}">`) && h.includes(`<link rel="alternate" hreflang="x-default" href="${url}">`), `zh${path} hreflang zh + x-default → itself`);
    assert.doesNotMatch(h, /hreflang="(?:en|zh-CN)"/, `zh${path} advertises no EN twin`);
    assert.ok(sitemap.includes(`<loc>${url}</loc>`), `zh${path} in sitemap`);
    assert.ok(b.includes('href="/zh/contact/quote/"') && b.includes('href="/zh/book/"'), `zh${path} CTAs point at the quote form and the workflow call`);
    assert.doesNotMatch(b, /\$\s?\d/, `zh${path} states no price`);
    assert.match(b, /按需报价|按团队报价|按团队书面报价/, `zh${path} says pricing is by quote`);
    for (const re of [...UNAPPROVED, /半天/, /30 ?分钟/, /24 ?小时/, /9 月 24/, /AI 前台/, /\/zh\/pricing\//]) assert.doesNotMatch(b + j, re, `zh${path} ${re}`);
    assert.doesNotMatch(j, /AggregateRating|"Review"|ratingValue|"price"/, `zh${path} carries no rating or price schema`);
  }
});

test('quote form: plain POST to /v1/intake, labelled fields, honeypot, two separate consents, newsletter never pre-checked', async () => {
  const pages = await allPages();
  for (const lang of ['en', 'zh']) {
    const x = find(pages, QUOTE_URL, lang), route = `${lang}:${QUOTE_URL}`;
    assert.ok(x, `${route} exists`);
    assert.equal(x.page.noindex, true, `${route} is a form page: noindex,follow`);
    const b = body(x.html), form = b.slice(b.indexOf('<form'), b.indexOf('</form>'));
    assert.match(form, /<form class="qf" id="quote-form" action="\/v1\/intake" method="post"/, `${route} works without JS`);
    const tags = [...form.matchAll(/<(input|select|textarea)\b[^>]*>/g)].map((m) => m[0]);
    const named = (n) => tags.find((t) => t.includes(`name="${n}"`)) || '';
    for (const n of ['name', 'email', 'company', 'company_website', 'industry', 'headcount', 'attendees', 'format', 'location', 'location_city', 'workflows', 'tools', 'timing', 'source', 'consent_request', 'consent_newsletter']) {
      const t = named(n), id = (t.match(/id="([^"]+)"/) || [])[1];
      assert.ok(t && id, `${route} has field ${n}`);
      assert.ok(form.includes(`<label for="${id}"`) || form.includes(`<label class="check" for="${id}"`), `${route} ${n} has a label`);
    }
    for (const n of ['name', 'email', 'company', 'industry', 'headcount', 'attendees', 'format', 'location', 'workflows', 'timing', 'consent_request']) assert.match(named(n), /\srequired/, `${route} ${n} required`);
    assert.match(named('email'), /type="email"/);
    const hp = named('company_url');
    assert.match(hp, /tabindex="-1"/, `${route} honeypot out of tab order`); assert.match(hp, /autocomplete="off"/);
    assert.match(form, /<div class="qf-hp" aria-hidden="true"><label for="qf-hp">[^<]+<\/label><input id="qf-hp" name="company_url"/, `${route} honeypot hidden from assistive tech`);
    const req = named('consent_request'), news = named('consent_newsletter');
    assert.notEqual(req, news, 'two separate consent inputs');
    assert.match(req, /type="checkbox"/); assert.match(news, /type="checkbox"/);
    assert.doesNotMatch(news, /\schecked|\srequired/, `${route} newsletter consent is optional and never pre-checked`);
    assert.doesNotMatch(req, /\schecked/, `${route} request consent is not pre-checked either`);
    assert.doesNotMatch(form, /\schecked[\s>=]/, `${route} nothing pre-checked`);
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref', 'landing', 'ts']) assert.ok(form.includes(`type="hidden" name="ft_${k}" value=""`), `${route} first-touch field ${k}`);
    assert.ok(form.includes(`name="form_version" value="${INTAKE_FORM_VERSION}"`) && form.includes(`name="lang" value="${lang}"`) && form.includes('name="fill_ms" value=""'));
    assert.match(form, /id="qf-msg" class="qf-msg" role="status" aria-live="polite"/, `${route} errors are announced`);
    assert.match(b, /id="received" class="qf-note ok" role="status"/); assert.match(b, /id="not-sent" class="qf-note" role="alert"/);
    // The receipt confirms receipt only: no booked meeting, no response-time promise.
    const receipt = b.slice(b.indexOf('id="received"'), b.indexOf('id="not-sent"')).replace(/<[^>]+>/g, '');
    assert.match(receipt, lang === 'zh' ? /并不代表已预约会议/ : /does not book a meeting/);
    assert.doesNotMatch(receipt, /(?:meeting|call) (?:is|has been) (?:booked|confirmed|scheduled)|within \d|business day|hours?\b|已预约成功|小时内|工作日/i, `${route} receipt makes no booking claim or response-time promise`);
    // Every format a CTA can preselect exists as an option.
    for (const key of ['workshop', 'onsite', 'program']) assert.ok(named('format') && form.includes(`<option value="${OFFERS[key].format}">`), `${route} format ${OFFERS[key].format}`);
    assert.match(x.html, /amjTrack\('submit_enterprise_inquiry'|tr\('submit_enterprise_inquiry'/, `${route} fires submit_enterprise_inquiry`);
    assert.match(x.html, /if\(r\.ok&&j\.ok\)\{[^}]*j\.receipt_id\)\{[^]*?tr\('submit_enterprise_inquiry',\{receipt_id:j\.receipt_id,offer_format:o\.format\|\|''\}\)/, `${route} inquiry event only after the server accepted, with no PII`);
  }
  for (const lang of ['en', 'zh']) assert.ok(body(find(pages, '/contact/', lang).html).includes(`href="${urlOf(QUOTE_URL, lang)}"`), `${lang} contact links the quote form`);
  const cfg = await readFile(new URL('../functions/v1/[[route]].js', import.meta.url), 'utf8');
  assert.ok(cfg.includes(`INTAKE_CONSENT_NOTICE_VERSION = '${CONSENT_NOTICE_VERSION}'`), 'server consent notice version matches src/config.mjs');
});

// Runs the site-wide inline script in a sandbox, as a browser would on load, and returns what it pushed to dataLayer.
async function runSiteScript(html, { url, referrer = '', gpc = false, session = {}, local = {} }) {
  const vm = await import('node:vm');
  const src = html.match(/<script>\n(\(function\(\)\{var D=document;[\s\S]*?)<\/script>/)[1];
  const u = new URL(url), load = [], appended = [], ss = new Map(Object.entries(session)), ls = new Map(Object.entries(local));
  const store = (m) => ({ getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) });
  const dataset = {}; for (const [, k, v] of (html.match(/<body([^>]*)>/)[1]).matchAll(/data-([a-z]+)="([^"]*)"/g)) dataset[k] = v;
  const ctx = {
    document: { referrer, documentElement: { lang: 'en' }, body: { dataset }, head: { appendChild: (s) => appended.push(s.src) }, createElement: () => ({}), getElementById: () => null, querySelectorAll: () => [], addEventListener() {} },
    location: { href: u.href, pathname: u.pathname, search: u.search, hostname: u.hostname, origin: u.origin },
    navigator: { maxTouchPoints: 1, globalPrivacyControl: gpc }, matchMedia: () => ({ matches: true }),
    sessionStorage: store(ss), localStorage: store(ls), addEventListener: (t, f) => { if (t === 'load') load.push(f); }, URL, URLSearchParams,
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(src, ctx);
  load.forEach((f) => f());
  return { calls: (ctx.dataLayer || []).map((a) => Array.from(a)), appended, ss, ls };
}

test('GA4 never receives a booking manage token; GPC and the opt-out switch keep GA4 off; first-touch attribution is first-party', async () => {
  const pages = await allPages();
  const book = find(pages, '/book/', 'en').html, home = find(pages, '/', 'en').html;
  // /book/?id=… : page_location is stripped, nothing in dataLayer carries the token
  const r = await runSiteScript(book, { url: 'https://aimanjack.com/book/?id=SECRETTOKEN0123' });
  assert.ok(r.appended.some((s) => s.includes(`id=${GA4_ID}`)), 'GA loads on the booking page');
  assert.doesNotMatch(JSON.stringify(r.calls), /SECRETTOKEN0123/, 'booking id never reaches GA4');
  const config = r.calls.find((c) => c[0] === 'config');
  assert.equal(config[2].page_location, 'https://aimanjack.com/book/');
  assert.ok(r.calls.some((c) => c[0] === 'set' && c[1].page_location === 'https://aimanjack.com/book/'), 'stripped location applies to every event');
  const zh = await runSiteScript(find(pages, '/book/', 'zh').html, { url: 'https://aimanjack.com/zh/book/?id=SECRETTOKEN0123' });
  assert.doesNotMatch(JSON.stringify(zh.calls), /SECRETTOKEN0123/, 'zh booking id never reaches GA4');
  // the next page after a manage link: referrer stripped too
  const after = await runSiteScript(home, { url: 'https://aimanjack.com/', referrer: 'https://aimanjack.com/book/?id=SECRETTOKEN0123' });
  assert.doesNotMatch(JSON.stringify(after.calls), /SECRETTOKEN0123/, 'booking id never leaks through page_referrer');
  // ordinary pages keep their address (campaign tags stay visible to GA4)
  const plain = await runSiteScript(home, { url: 'https://aimanjack.com/?utm_source=linkedin' });
  assert.equal(plain.calls.find((c) => c[0] === 'config')[2].page_location, undefined);
  // opt-outs: Global Privacy Control, or the switch on /privacy (localStorage)
  for (const opts of [{ gpc: true }, { local: { amj_analytics_off: '1' } }]) {
    const o = await runSiteScript(home, { url: 'https://aimanjack.com/', ...opts });
    assert.equal(o.appended.length, 0, `GA not loaded with ${JSON.stringify(opts)}`);
    assert.ok(!o.calls.some((c) => c[0] === 'config'), 'no GA config');
  }
  // view_offer carries only the offer id
  const offer = await runSiteScript(find(pages, OFFERS.workshop.path, 'en').html, { url: `https://aimanjack.com${OFFERS.workshop.path}` });
  const v = offer.calls.find((c) => c[0] === 'event' && c[1] === 'view_offer');
  assert.ok(v && v[2].offer_id === OFFERS.workshop.id, 'view_offer with offer_id');
  // first-touch attribution: stored once per tab in sessionStorage, no cookies, never overwritten by later pages
  const first = await runSiteScript(home, { url: 'https://aimanjack.com/?utm_source=linkedin&utm_medium=social&utm_campaign=q4-launch', referrer: 'https://www.linkedin.com/feed/' });
  const ft = JSON.parse(first.ss.get('amj_ft'));
  assert.deepEqual({ s: ft.utm_source, m: ft.utm_medium, c: ft.utm_campaign, ref: ft.ref, landing: ft.landing }, { s: 'linkedin', m: 'social', c: 'q4-launch', ref: 'www.linkedin.com', landing: '/' });
  assert.deepEqual(Object.keys(ft).sort(), ['landing', 'ref', 'ts', 'utm_campaign', 'utm_medium', 'utm_source']);
  const second = await runSiteScript(find(pages, '/about/', 'en').html, { url: 'https://aimanjack.com/about/?utm_source=other', referrer: 'https://aimanjack.com/', session: { amj_ft: first.ss.get('amj_ft') } });
  assert.equal(JSON.parse(second.ss.get('amj_ft')).utm_source, 'linkedin', 'first touch is kept');
  assert.doesNotMatch(home, /document\.cookie/, 'no first-party cookies');
  // previews and local copies never load GA
  assert.equal((await runSiteScript(home, { url: 'https://feat.aimanjack.pages.dev/' })).appended.length, 0);
});

test('privacy policy discloses the quote form, Supabase, GA4 and how to opt out, marked for legal review, with no invented address', async () => {
  const pages = await allPages();
  for (const lang of ['en', 'zh']) {
    const b = body(find(pages, '/privacy', lang).html);
    for (const re of lang === 'zh' ? [/培训报价/, /Supabase/, /Google Analytics/, /Global Privacy Control/, /退订/, /data-analytics-off/] : [/training quote form/, /Supabase/, /Google Analytics/, /Global Privacy Control/, /unsubscribe/, /data-analytics-off/]) assert.match(b, re, `${lang} privacy ${re}`);
    assert.doesNotMatch(b, /\b\d{2,5} [A-Z][a-z]+ (?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Pkwy|Suite)\b|\bTX \d{5}\b|P\.?O\.? Box/, `${lang} privacy states no mailing address`);
  }
  const src = await readFile(new URL('../src/pages/legal.mjs', import.meta.url), 'utf8');
  assert.match(src, /DRAFT_REQUIRES_OWNER_LEGAL_REVIEW/);
});

test('deploy gate runs the test suite with a glob (node --test tests/ fails on Node 22)', async () => {
  const sh = await readFile(new URL('../deploy.sh', import.meta.url), 'utf8');
  assert.match(sh, /node --test tests\/\*\.test\.mjs/);
  assert.doesNotMatch(sh, /node --test tests\/(?:\s|\))/);
});

// Unsourced service promises (revenue-os config/claims_inventory.json: promise-written-price-24h, promise-same-or-next-business-day).
// Removed 2026-10-08; restore only with an owner-approved, sourced commitment (and update this list deliberately).
test('no built page or llms.txt makes a 24-hour or same/next-business-day response promise', async () => {
  const PROMISES = [/24 hours/i, /24 ?小时/, /same or next business day/i, /当天或下一个工作日/];
  const outputs = (await allPages()).map(({ p, lang, html }) => [`${lang} ${p.path}`, html]).concat([['llms.txt', llms()]]);
  assert.ok(outputs.length > 50);
  for (const [where, text] of outputs) for (const re of PROMISES) assert.doesNotMatch(text, re, `${where} contains ${re}`);
});

// ── /ai-training/dallas/ (2026-10-13): the one local page; the home page and the onsite page must not compete for the term ──
test('the Dallas page owns the local term, lists real sessions, and keeps guideline-safe markup', async () => {
  const pages = await allPages();
  const { EVENTS, EVENT_STATS } = await import('../src/content/events.mjs');
  assert.ok(EVENT_STATS.hosted >= 6 && EVENT_STATS.registrations >= 300, 'event data is the 2026 Luma record');
  for (const lang of ['en', 'zh']) {
    const x = find(pages, '/ai-training/dallas/', lang), route = `${lang}:/ai-training/dallas/`;
    assert.ok(x && !x.page.noindex, `${route} indexable`);
    assert.match(head(x.html), lang === 'zh' ? /<title>达拉斯—沃斯堡/ : /<title>Corporate AI Training &(?:amp;)? Workshops in Dallas–Fort Worth/, `${route} title owns the term`);
    const b = body(x.html), j = ld(x.html);
    for (const e of EVENTS) assert.ok(b.includes(`datetime="${e.date}"`), `${route} lists ${e.date}`);
    assert.ok(b.includes(String(EVENT_STATS.registrations)) && b.includes('DFW IT Association'), `${route} shows sign-ups and the invited talk`);
    assert.ok((b.match(/<img [^>]*\/img\/events\//g) || []).length >= 6, `${route} shows real event photos`);
    for (const p of ['/ai-training/', OFFERS.workshop.path, OFFERS.onsite.path, '/book/']) assert.ok(b.includes(`href="${urlOf(p, lang)}`), `${route} links ${p}`);
    assert.match(j, /"@type":"FAQPage"/); assert.match(j, /"@type":"Place"/);
    assert.doesNotMatch(j, /"@type":"(?:Review|AggregateRating)"|ratingValue/, `${route} no self-serving review markup`);
    assert.deepEqual([...new Set([...b.matchAll(/\$\s?\d[\d,.]*/g)].map((m) => m[0]))], [], `${route} shows no price`);
    for (const re of BANNED) assert.doesNotMatch(b + j, re, `${route} contains ${re}`);
  }
  // Cannibalization guard: only the Dallas page carries the metro name in its <title> and <h1>.
  for (const path of ['/', '/ai-training/', OFFERS.onsite.path]) {
    const h = find(pages, path, 'en').html;
    assert.doesNotMatch(h.match(/<title>[^<]*<\/title>/)[0], /Dallas–Fort Worth/, `${path} title leaves the metro term to the Dallas page`);
    assert.doesNotMatch(h.match(/<h1[^>]*>[\s\S]*?<\/h1>/)[0], /Dallas–Fort Worth/, `${path} H1 leaves the metro term to the Dallas page`);
  }
});

test('tool training pages: indexable, full FAQ, no public price anywhere, and a working quick-quote form', async () => {
  const pages = await allPages();
  const { TOOL_PAGES } = await import('../src/pages/tool-training.mjs');
  for (const key of TOOL_PAGES) for (const lang of ['en', 'zh']) {
    const path = `/ai-training/${key}/`, x = find(pages, path, lang), route = `${lang}:${path}`;
    assert.ok(x && !x.page.noindex, `${route} indexable`);
    const h = head(x.html), b = body(x.html), j = ld(x.html);
    assert.equal((b.match(/<h1[\s>]/g) || []).length, 1, `${route} one H1`);
    if (lang === 'en') assert.match(h, /<title>[^<]*(Copilot|ChatGPT|Claude|Grok)[^<]*Dallas[^<]*<\/title>/, `${route} title names the tool and Dallas`);
    assert.ok((j.match(/"@type":"Question"/g) || []).length >= 12, `${route} FAQ has at least 12 questions`);
    assert.doesNotMatch(b + j, /\$\s?\d/, `${route} prints no price`);
    assert.doesNotMatch(j, /"@type":"Offer"|"price"|"(?:Review|AggregateRating)"/, `${route} no Offer/price or review markup`);
    assert.match(b, /<form class="qf" id="qq-form" action="\/v1\/intake" method="post"/, `${route} quick-quote form`);
    assert.ok(b.includes('name="kind" value="quick"') && b.includes(`name="tool" value="${key}"`) && b.includes(`name="page" value="${urlOf(path, lang)}"`), `${route} form carries kind/tool/page`);
    for (const p of ['/ai-training/dallas/', '/ai-training/', ...TOOL_PAGES.filter((k) => k !== key).map((k) => `/ai-training/${k}/`)]) assert.ok(b.includes(`href="${urlOf(p, lang)}`), `${route} links ${p}`);
    for (const re of BANNED) assert.doesNotMatch(b + j, re, `${route} contains ${re}`);
  }
});

test('no public price on any indexable page or in llms.txt (Jack, 2026-10-17: every format is quoted per team)', async () => {
  const pages = await allPages();
  // Legal pages are excluded: /terms still carries the retired receptionist product's billing terms, a legal text Jack edits himself.
  for (const x of pages.filter((x) => !x.page.noindex && !LEGAL.includes(x.p.path))) {
    assert.doesNotMatch(body(x.html).replace(/<pre[\s\S]*?<\/pre>/g, ''), /\$\s?\d/, `${x.lang}:${x.p.path} prints a price`);   // <pre> = illustrative example output, not our prices
    assert.doesNotMatch(ld(x.html), /"price":"(?!0")|"priceSpecification"/, `${x.lang}:${x.p.path} has price markup`);
  }
  assert.doesNotMatch(llms(), /\$\s?\d/);
});
