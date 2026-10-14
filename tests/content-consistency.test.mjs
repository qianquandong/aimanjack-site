import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRAINING, PROGRAM_PRICE, OFFERS } from '../src/config.mjs';
import { trainingFormatTable, trainingFormatSummary } from '../src/training-buyers.mjs';
import { buyerQuestions } from '../src/training-questions.mjs';
import { post as office } from '../src/posts/ai-training-for-office-managers.mjs';
import { post as employee } from '../src/posts/ai-training-for-employees-start-with-one-task.mjs';
import { pages as trainingPages, TRAINING_FAQ } from '../src/pages/training.mjs';
import { pages as offerPages } from '../src/pages/offers.mjs';
import { pages as guidePages } from '../src/pages/zhguides.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const disk = (route) => join(root, route.replace(/^\//, '') + (route.endsWith('/') ? 'index.html' : '.html'));
const oldClaims = /half[- ]day(?: hands-on)? workshop|半天(?:的)?(?:实操)?工作坊|up to ten people|最多十人|5 to 60|5 到 60/i;

test('older buying guides reuse current format facts in both languages', () => {
  for (const post of [office, employee]) for (const lang of ['en', 'zh']) {
    const c = post[lang], summary = trainingFormatSummary(lang);
    assert.ok(c.faq.some(([, answer]) => answer === summary));
    assert.ok(summary.includes(PROGRAM_PRICE));
    assert.ok(summary.includes(String(TRAINING.sessionMin)));
    assert.ok(summary.includes(String(OFFERS.workshop.minutes)));
    assert.doesNotMatch(c.sections + JSON.stringify(c.faq) + c.takeaways.join(' '), oldClaims);
    assert.equal(post.updated, '2026-10-13');
    assert.ok(post.date < post.updated, 'keep original publication date');
  }
});

test('office format table shares the service table and links to the correct language and section', () => {
  for (const lang of ['en', 'zh']) {
    const prefix = lang === 'zh' ? '/zh' : '';
    const table = trainingFormatTable(lang);
    assert.ok(office[lang].sections.includes(table));
    assert.ok(table.includes(`href="${prefix}/ai-training/#formats"`));
    for (const key of ['workshop', 'onsite']) assert.ok(table.includes(`href="${prefix}${OFFERS[key].path}"`));
    assert.doesNotMatch(table, /href="#formats"/, 'a blog table must not link to a nonexistent local anchor');
  }
});

test('program buyer answers appear in visible FAQ and matching FAQ structured data', () => {
  for (const lang of ['en', 'zh']) {
    const page = trainingPages[0][lang];
    const faq = page.jsonld.find((node) => node['@type'] === 'FAQPage');
    for (const [q, answer] of buyerQuestions(lang, 'program')) {
      assert.ok(TRAINING_FAQ[lang].some((pair) => pair[0] === q && pair[1] === answer));
      assert.ok(page.body.includes(q) && page.body.includes(answer));
      assert.ok(faq.mainEntity.some((node) => node.name === q));
    }
  }
});

test('retreat and larger-team questions clarify scope without adding a fixed offer', () => {
  for (const key of ['workshop', 'onsite']) for (const lang of ['en', 'zh']) {
    const page = offerPages.find((p) => p.path === OFFERS[key].path)[lang];
    for (const [q, answer] of buyerQuestions(lang, key)) assert.ok(page.body.includes(q) && page.body.includes(answer));
    assert.doesNotMatch(JSON.stringify(page.jsonld), /"@type":"Offer"|"price"/);
    assert.deepEqual([...new Set(page.body.match(/\$\s?\d[\d,.]*/g))], [PROGRAM_PRICE]);
  }
});

test('Chinese buying guides avoid unsupported market and retention claims and disclose software scope', () => {
  const price = guidePages.find((p) => p.path === '/ai-peixun-shi/').zh;
  for (const page of guidePages) assert.doesNotMatch(page.zh.body, /两周后很少有人记得|只有两三项|排的是广告位|最常见的动作就是|两周后没人再打开/);
  assert.ok(price.body.includes('培训费不包含工具许可证或订阅'));
  assert.ok(price.body.includes('不把它当作整个市场的统一价格'));
  assert.ok(price.body.includes(PROGRAM_PRICE));
});

test('links and fragments in the twelve reviewed pages resolve in the built site', () => {
  const routes = ['/ai-training/', OFFERS.workshop.path, OFFERS.onsite.path,
    '/blog/ai-training-for-office-managers/', '/blog/ai-training-for-employees-start-with-one-task/'];
  const all = [...routes, ...routes.map((p) => '/zh' + p), '/zh/ai-peixun-shi/', '/zh/ai-peixun-najia-zuihao/'];
  for (const route of all) {
    const html = readFileSync(disk(route), 'utf8');
    assert.doesNotMatch(html, oldClaims);
    for (const [, href] of html.matchAll(/href="([^"\s]+)"/g)) {
      if (!href.startsWith('/') && !href.startsWith('#')) continue;
      const url = new URL(href.replace(/&amp;/g, '&'), 'https://aimanjack.com' + route);
      if (url.pathname.startsWith('/cdn-cgi/') || /\.[a-z0-9]+$/i.test(url.pathname)) continue;
      const target = disk(url.pathname);
      assert.ok(existsSync(target), `${route} -> ${href}`);
      if (url.hash) {
        const id = decodeURIComponent(url.hash.slice(1));
        assert.ok(readFileSync(target, 'utf8').includes(`id="${id}"`), `${route} -> ${href}: missing anchor`);
      }
    }
  }
});
