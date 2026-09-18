import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { render, pageOf } from '../src/layout.mjs';
import { llms } from '../src/llms.mjs';

async function allPages() {
  const files = (await readdir(new URL('../src/pages/', import.meta.url))).filter((f) => f.endsWith('.mjs')).sort();
  const out = [];
  for (const file of files) {
    const { pages } = await import(`../src/pages/${file}`);
    for (const p of pages) for (const lang of ['en', 'zh']) { const page = pageOf(p, lang); out.push({ p, lang, page, html: render(page, lang) }); }
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

test('home page is corporate AI training only, in both languages', async () => {
  const pages = await allPages();
  for (const [lang, title, h1] of [['en', /Corporate AI Training in Dallas/, /Practical AI training for teams/], ['zh', /企业 AI 培训/, /AI 实战培训/]]) {
    const home = find(pages, '/', lang);
    assert.ok(home, `missing ${lang} home`);
    assert.match(head(home.html), new RegExp(`<title>[^<]*${title.source}`));
    assert.match(home.html, new RegExp(`<h1[^>]*>[^<]*${h1.source}`));
    assert.match(home.html, /og-training(?:-zh)?\.jpg/);
    assert.match(home.html, /Plan a Team Workshop|聊聊团队培训/);
    for (const re of BANNED) assert.doesNotMatch(body(home.html) + ld(home.html), re, `${lang} home contains ${re}`);
  }
});

test('every indexable page carries complete technical SEO metadata and no receptionist marketing', async () => {
  for (const { p, lang, page, html } of await allPages()) {
    const route = `${lang}:${p.path}`;
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route} H1 count`);
    assert.match(html, /<title>[^<]+<\/title>/, `${route} title`);
    assert.match(html, /<meta name="description" content="[^"]+">/, `${route} description`);
    for (const hreflang of ['en', 'zh', 'x-default']) assert.match(html, new RegExp(`hreflang="${hreflang}"`), `${route} ${hreflang}`);
    assert.match(html, /<meta property="og:title" content="[^"]+">/, `${route} OG title`);
    assert.doesNotMatch(html, />undefined</, `${route} visible undefined copy`);
    if (page.noindex) { assert.match(html, /<meta name="robots" content="noindex, follow">/, `${route} noindex`); continue; }
    const self = `https://aimanjack.com${lang === 'zh' ? (p.path === '/' ? '/zh/' : '/zh' + p.path) : p.path}`;
    assert.match(html, new RegExp(`<link rel="canonical" href="${self.replace(/[/.]/g, '\\$&')}">`), `${route} self canonical`);
    assert.match(html, /<meta name="robots" content="index, follow/, `${route} index,follow`);
    assert.match(html, /<script type="application\/ld\+json">/, `${route} JSON-LD`);
    assert.match(html, /property="og:image" content="https:\/\/aimanjack\.com\/img\/og-training(?:-zh)?\.jpg"/, `${route} training OG image`);
    if (LEGAL.includes(p.path)) continue;
    for (const re of BANNED) assert.doesNotMatch(body(html) + ld(html), re, `${route} contains ${re}`);
    assert.match(html, /href="\/(?:zh\/)?book\/"/, `${route} links to /book/`);
  }
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
  assert.match(chrome, /Plan a Team Workshop/);
  for (const bad of ['/ai-receptionist/', '/pricing/', '/industries/', '/integrations/', '/tools/missed-call-calculator/', 'tel:+14695172968']) assert.doesNotMatch(chrome, new RegExp(bad.replace(/[/+]/g, '\\$&')), `chrome links ${bad}`);
  assert.doesNotMatch(home.html, /<dialog/, 'AI demo dialog is no longer injected');
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
