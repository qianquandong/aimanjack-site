import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyArticle } from '../scripts/publish-approved-blog.mjs';
import { postPage } from '../src/blog.mjs';
import { render } from '../src/layout.mjs';

const origin = 'https://aimanjack.com';
const fixture = {
  slug: 'editorial-verification-fixture', date: '2026-10-21', status: 'published',
  ...Object.fromEntries(['en', 'zh'].map(lang => {
    const prefix = lang === 'zh' ? '/zh' : '';
    return [lang, {
      keyword: lang === 'zh' ? '培训核验' : 'training verification',
      title: `Approved ${lang} title | AI Man Jack`, description: `Approved ${lang} description`,
      h1: `Approved ${lang} headline`, sub: `Approved ${lang} introduction`,
      takeaways: [`Approved ${lang} takeaway`],
      sections: `<h2>Approved ${lang} section</h2><p>Approved ${lang} task and review.</p>
<a href="${prefix}/templates/team-ai-training-brief/#workflow-step">Task brief</a>
<a href="https://example.com/evidence">External source</a>
<a href="mailto:jack@aimanjack.com">jack@aimanjack.com</a>
<a href="sms:+14694254142">Text Jack</a><a href="tel:+14694254142">Phone</a>
<img src="/img/practice.webp" srcset="/img/practice-480.webp 480w, /img/practice-960.webp 960w" alt="Approved practice example">`,
      faq: [[`Approved ${lang} question?`, `Visible ${lang} answer. <a href="${prefix}/templates/two-week-workflow-review/">Review worksheet</a>`]],
      pillar: ['AI training', '/ai-training/'],
      related: [['Workshop', '/ai-training/team-workshop/'], ['Preparation', '/templates/ai-tool-approval-checklist/']], sources: [],
    }];
  })),
};
const route = post => `/blog/${post.slug}/`;
function pages(post = fixture) {
  return Object.fromEntries(['en', 'zh'].map(lang => [(lang === 'zh' ? '/zh' : '') + route(post), render({ path: route(post), ...postPage(post, lang) }, lang)]));
}
const alterMain = (html, change) => html.replace(/(<main\b[^>]*>)([\s\S]*?)(<\/main>)/i, (_, start, main, end) => start + change(main) + end);
function alterSchema(html, type, change) {
  const walk = value => {
    if (Array.isArray(value)) return value.map(walk);
    if (!value || typeof value !== 'object') return value;
    if (value['@type'] === type) return change(value);
    if (value['@graph']) value['@graph'] = walk(value['@graph']);
    return value;
  };
  return html.replace(/(<script\b[^>]*type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/gi, (_, start, body, end) => start + JSON.stringify(walk(JSON.parse(body))) + end);
}
async function withPublicMock({ post = fixture, change = html => html, response, omitAnchor = false } = {}, check) {
  const previousFetch = globalThis.fetch, calls = [], documents = pages(post);
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(input);
    calls.push({ url: url.href, method: options.method });
    assert.equal(options.method, 'GET', 'verification must explicitly use GET');
    assert.equal(options.redirect, 'manual', 'verification must inspect redirects before following');
    assert.equal(url.origin, origin, 'no external, mailto, sms or tel request');
    assert.doesNotMatch(decodeURIComponent(url.pathname), /^\/v1(?:\/|$)/, 'no production API request');
    const override = response?.(url);
    if (override) return { url: url.href, headers: new Headers(), text: async () => '', ...override };
    const html = documents[url.pathname];
    const body = url.pathname === '/sitemap.xml'
      ? Object.keys(documents).map(path => `<loc>${origin}${path}</loc>`).join('')
      : html ? change(html, url.pathname)
        : `<html><main${omitAnchor ? '' : ' id="workflow-step"'}>Public target</main></html>`;
    return { status: 200, url: url.href, headers: new Headers(), text: async () => body };
  };
  try { return await check(calls); }
  finally { globalThis.fetch = previousFetch; }
}

test('the current renderer verifies both languages and GET-checks live main links and all image candidates', async () => {
  await withPublicMock({}, async calls => {
    const result = await verifyArticle(fixture);
    assert.equal(result.checked.length, 2);
    assert.ok(result.checked.every(item => item.contentSha256 && item.resourcesSha256));
    for (const path of ['/img/practice.webp', '/img/practice-480.webp', '/img/practice-960.webp', '/templates/two-week-workflow-review/', '/zh/templates/two-week-workflow-review/', '/ai-training/team-workshop/', '/zh/ai-training/team-workshop/', '/img/jack-portrait-256.webp']) {
      assert.ok(calls.some(call => new URL(call.url).pathname === path), `actual live target checked: ${path}`);
    }
    assert.ok(calls.every(call => call.method === 'GET' && call.url.startsWith(origin + '/')));
  });
});

const changes = [
  ['headline', html => alterMain(html, main => main.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/, '<h1>Stale headline</h1>')), /Live main/],
  ['introduction', html => alterMain(html, main => main.replace(/Approved (en|zh) introduction/, 'Stale introduction')), /Live main/],
  ['title', html => html.replace(/<title>[\s\S]*?<\/title>/, '<title>Stale title</title>'), /Live title/],
  ['description', html => html.replace(/(<meta name="description" content=")[^"]*(")/, '$1Stale description$2'), /Live description/],
  ['link only', html => alterMain(html, main => main.replace(/href="(?:\/zh)?\/templates\/team-ai-training-brief\/#workflow-step"/, 'href="/old-wrong-route/"')), /Live links\/assets/],
  ['image source only', html => alterMain(html, main => main.replace('src="/img/practice.webp"', 'src="/img/stale.webp"')), /Live links\/assets/],
  ['srcset only', html => alterMain(html, main => main.replace('/img/practice-960.webp 960w', '/img/stale-960.webp 960w')), /Live links\/assets/],
  ['hreflang', html => html.replace(/(hreflang="zh" href=")[^"]*(")/, '$1https://aimanjack.com/zh/wrong/$2'), /Live hreflang/],
  ['canonical', html => html.replace(/(rel="canonical" href=")[^"]*(")/, '$1https://aimanjack.com/wrong/$2'), /Live canonical/],
  ['visible FAQ', html => alterMain(html, main => main.replace(/Visible (en|zh) answer\./, 'Stale visible answer.')), /Live main/],
  ['FAQ schema only', html => alterSchema(html, 'FAQPage', node => ({ ...node, mainEntity: [{ '@type': 'Question', name: 'Stale FAQ', acceptedAnswer: { '@type': 'Answer', text: 'Stale answer' } }] })), /Article\/FAQ JSON-LD/],
  ['Article date only', html => alterSchema(html, 'Article', node => ({ ...node, datePublished: '2020-01-01' })), /Article\/FAQ JSON-LD/],
  ['Article headline only', html => alterSchema(html, 'Article', node => ({ ...node, headline: 'Stale schema headline' })), /Article\/FAQ JSON-LD/],
];
for (const lang of ['en', 'zh']) for (const [label, change, message] of changes) {
  test(`${lang} ${label} drift cannot be called a verified production release`, async () => {
    const path = (lang === 'zh' ? '/zh' : '') + route(fixture);
    await withPublicMock({ change: (html, pathname) => pathname === path ? change(html) : html }, async () => {
      await assert.rejects(verifyArticle(fixture), message);
    });
  });
}

function protectedEmail(email) {
  const key = 0x42;
  return Buffer.from([key, ...Buffer.from(email).map(byte => byte ^ key)]).toString('hex');
}
for (const form of ['span', 'anchor']) test(`Cloudflare ${form} email protection and injected decoding script preserve the approved meaning`, async () => {
  const encoded = protectedEmail('jack@aimanjack.com');
  await withPublicMock({ change: html => alterMain(html, main => main.replace('<a href="mailto:jack@aimanjack.com">jack@aimanjack.com</a>', form === 'span'
    ? `<a href="/cdn-cgi/l/email-protection#${encoded}"><span class="__cf_email__" data-cfemail="${encoded}">[email&#160;protected]</span></a>`
    : `<a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="${encoded}">[email&#160;protected]</a>`) + '<script data-cfasync="false" src="/cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js"></script>').replace('/style.css?v=0', '/style.css?v=deadbeef') }, async calls => {
    await verifyArticle(fixture);
    assert.ok(calls.every(call => !call.url.includes('/cdn-cgi/')));
  });
});

test('a changed protected email fails rather than silently accepting a different contact', async () => {
  const encoded = protectedEmail('other@example.com');
  await withPublicMock({ change: html => alterMain(html, main => main.replace('<a href="mailto:jack@aimanjack.com">jack@aimanjack.com</a>', `<a href="/cdn-cgi/l/email-protection#${encoded}"><span data-cfemail="${encoded}">[email protected]</span></a>`)) }, async () => {
    await assert.rejects(verifyArticle(fixture), /Live main/);
  });
});

test('an approved-looking API link fails before any production API is requested', async () => {
  const post = structuredClone(fixture);
  post.en.sections += '<a href="/v1/intake">Unsafe API target</a>';
  await withPublicMock({ post }, async calls => {
    await assert.rejects(verifyArticle(post), /no APIs/);
    assert.ok(calls.every(call => !new URL(call.url).pathname.startsWith('/v1')));
  });
});

test('a public redirect to an API is refused before following it', async () => {
  await withPublicMock({ response: url => url.pathname === '/templates/team-ai-training-brief/' ? { status: 302, headers: new Headers({ location: '/v1/intake' }) } : undefined }, async calls => {
    await assert.rejects(verifyArticle(fixture), /no APIs/);
    assert.ok(calls.every(call => !new URL(call.url).pathname.startsWith('/v1')));
  });
});

test('missing anchors, missing assets and response noindex each fail production verification', async t => {
  await t.test('anchor', async () => withPublicMock({ omitAnchor: true }, async () => assert.rejects(verifyArticle(fixture), /Broken anchor/)));
  await t.test('asset', async () => withPublicMock({ response: url => url.pathname === '/img/practice-960.webp' ? { status: 404 } : undefined }, async () => assert.rejects(verifyArticle(fixture), /Public GET failed/)));
  await t.test('response header', async () => withPublicMock({ response: url => url.pathname === route(fixture) ? { status: 200, headers: new Headers({ 'x-robots-tag': 'noindex' }), text: async () => pages()[url.pathname] } : undefined }, async () => assert.rejects(verifyArticle(fixture), /Indexability/)));
});
