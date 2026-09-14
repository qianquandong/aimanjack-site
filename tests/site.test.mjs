import assert from 'node:assert/strict';
import test from 'node:test';
import { readdir, readFile } from 'node:fs/promises';
import { render } from '../src/layout.mjs';

const root = new URL('../', import.meta.url);

async function allPages() {
  const files = (await readdir(new URL('../src/pages/', import.meta.url))).filter((f) => f.endsWith('.mjs')).sort();
  const out = [];
  for (const file of files) {
    const { pages } = await import(`../src/pages/${file}`);
    for (const p of pages) for (const lang of ['en', 'zh']) out.push({ p, lang, html: render({ path: p.path, ...p[lang] }, lang) });
  }
  return out;
}

test('home page restores AI training as the primary offer in both languages', async () => {
  const pages = await allPages();
  for (const [lang, phrase] of [['en', 'AI Training'], ['zh', 'AI 实战培训']]) {
    const home = pages.find((x) => x.p.path === '/' && x.lang === lang);
    assert.ok(home, `missing ${lang} home`);
    assert.match(home.html, new RegExp(`<title>[^<]*${phrase}`, 'i'));
    assert.match(home.html, /<h1[^>]*>[^<]*(AI training|AI 实战培训)/i);
    assert.match(home.html, /og-training(?:-zh)?\.jpg/);
    assert.match(home.html, /Get a \$25 coupon for any service|领取适用于任何服务的 \$25 优惠券/);
  }
});

test('service pages retain their receptionist Open Graph fallback', async () => {
  const pages = await allPages();
  for (const [lang, image] of [['en', 'og-receptionist.jpg'], ['zh', 'og-receptionist-zh.jpg']]) {
    const service = pages.find((x) => x.p.path === '/ai-receptionist/' && x.lang === lang);
    assert.ok(service, `missing ${lang} receptionist page`);
    assert.match(service.html, new RegExp(`property="og:image" content="https://aimanjack.com/img/${image}"`));
  }
});

test('every rendered route keeps complete technical SEO metadata', async () => {
  for (const { p, lang, html } of await allPages()) {
    const route = `${lang}:${p.path}`;
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `${route} H1 count`);
    assert.match(html, /<title>[^<]+<\/title>/, `${route} title`);
    assert.match(html, /<meta name="description" content="[^"]+">/, `${route} description`);
    assert.match(html, /<link rel="canonical" href="https:\/\/aimanjack\.com\/[^"]*">/, `${route} canonical`);
    for (const hreflang of ['en', 'zh', 'x-default']) assert.match(html, new RegExp(`hreflang="${hreflang}"`), `${route} ${hreflang}`);
    assert.match(html, /<meta property="og:title" content="[^"]+">/, `${route} OG title`);
    assert.doesNotMatch(html, />undefined</, `${route} visible undefined copy`);
    if (!p[lang].noindex) assert.match(html, /<script type="application\/ld\+json">/, `${route} JSON-LD`);
  }
});

test('privacy policy discloses coupon email storage and delivery use in both languages', async () => {
  const pages = await allPages();
  for (const lang of ['en', 'zh']) {
    const privacy = pages.find((x) => x.p.path === '/privacy' && x.lang === lang);
    assert.ok(privacy, `missing ${lang} privacy policy`);
    assert.match(privacy.html, /coupon|优惠券/i);
    assert.match(privacy.html, /email/i);
  }
});

test('all consultation copy and booking source use 30 minutes', async () => {
  const files = [
    'src/config.mjs', 'src/i18n.mjs', 'src/components.mjs', 'src/pages/book.mjs',
    'src/pages/contact.mjs', 'src/pages/cases.mjs', 'src/pages/training.mjs',
    'src/training-schema.en.json', 'src/training-schema.zh.json', 'db/schema.sql',
  ];
  const text = (await Promise.all(files.map(async (f) => readFile(new URL(`../${f}`, import.meta.url), 'utf8')))).join('\n');
  assert.doesNotMatch(text, /(?:15|20)[ -]minute|(?:15|20) 分钟|15-min/i);
  assert.match(text, /30-minute demo call with Jack/);
  assert.match(text, /duration_min[^\n]*30|values \('aimanjack', 'demo-call', '30-minute demo call with Jack', 30/);
});

test('legacy AI training route stays accessible but canonicals to the restored home', async () => {
  const pages = await allPages();
  for (const [lang, canonical] of [['en', 'https://aimanjack.com/'], ['zh', 'https://aimanjack.com/zh/']]) {
    const legacy = pages.find((x) => x.p.path === '/ai-training/' && x.lang === lang);
    assert.ok(legacy, `missing ${lang} legacy training route`);
    assert.match(legacy.html, new RegExp(`<link rel="canonical" href="${canonical}">`));
    assert.equal(legacy.p[lang].noindex, true);
    assert.match(legacy.html, /<meta name="robots" content="noindex, follow">/);
  }
});

test('generated sitemap indexes the restored home and excludes duplicate legacy training URLs', async () => {
  const sitemap = await readFile(new URL('../sitemap.xml', import.meta.url), 'utf8');
  assert.match(sitemap, /<loc>https:\/\/aimanjack\.com\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/aimanjack\.com\/zh\/<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>[^<]*\/ai-training\/<\/loc>/);
});
