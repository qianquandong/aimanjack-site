// Copy to src/posts/<slug>.mjs (or run: node scripts/blog-new.mjs <slug>). Files starting with "_" are never built.
// Every fact, number and first-person story must trace to knowledge/marketing/approved-claims.md, stories.md, or a live
// aimanjack.com page. Anything else is `[Jack 补：…]` for Jack to fill, and the post stays a draft until it is gone.
// Check before hand-off: node scripts/blog-check.mjs <slug>
export const post = {
  slug: 'SLUG',                    // must equal the file name; lowercase, hyphens, no dates
  date: 'YYYY-MM-DD',              // publish date; set the day it goes live
  updated: undefined,              // set when the post is materially revised (shows "Updated" + bumps dateModified)
  status: 'draft',                 // 'draft' → not built; 'published' → in sitemap
  en: {
    keyword: 'primary keyword',    // one search phrase; appears in title, h1, first 100 words
    title: 'Title 50–60 chars, keyword first | AI Man Jack',
    description: 'Meta description 120–160 chars: who it is for, what they get, one concrete detail.',
    h1: 'H1 as a plain sentence, keyword included, no colon-clickbait',
    sub: 'One sentence under the H1: what happened, and why the reader should care.',
    takeaways: [
      'Three to five one-line answers. Written so an AI assistant can quote each line alone.',
      'Each takeaway is a complete claim with its qualifier, not a teaser.',
      'Numbers only from approved-claims.md.',
    ],
    sections: `
<h2>Open with the specific thing that happened</h2>
<p>Where, when, who asked what. Not "AI is changing how businesses work".</p>
<h2>Why it matters for the reader</h2>
<p>The consequence in their week. Then one sentence on what the rest of the post gives them.</p>
<h2>How to do it</h2>
<ol>
<li><strong>Step one.</strong> One sentence of instruction, one concrete example.</li>
<li><strong>Step two.</strong> ...</li>
<li><strong>Step three.</strong> ...</li>
</ol>
<h2>When this does not work</h2>
<p>At least one paragraph on who should not do this, or what breaks. Written plainly, not as a disclaimer.</p>
<h2>What to do in the next 14 days</h2>
<ul>
<li>Two or three actions, each under 30 minutes.</li>
</ul>
`,
    faq: [
      ['Question people actually type into Google?', 'Answer in two to four sentences. Complete on its own.'],
      ['Second question?', 'Answer.'],
      ['Third question?', 'Answer.'],
    ],
    pillar: ['AI training for Dallas teams', '/ai-training/'],   // the one service page this post feeds
    related: [['Pricing', '/pricing/'], ['Case studies', '/case-studies/']],   // 2–4 internal links, real paths only
    sources: [],                   // [['Label', 'https://...']] external references, if any
  },
  zh: {
    keyword: '主关键词',
    title: '标题 25–30 字，关键词在前 | AI Man Jack',
    description: 'meta description 60–80 字：给谁看、能拿到什么、一个具体细节。',
    h1: '一句大白话的 H1，含关键词',
    sub: 'H1 下面一句：发生了什么，为什么读者该在意。',
    takeaways: ['三到五条一句话结论，每条单独拿出来也能被 AI 引用。'],
    sections: `
<h2>先讲具体发生了什么</h2>
<p>哪里、什么时候、谁问了什么。不写「AI 正在改变商业」。</p>
<h2>这对你意味着什么</h2>
<p>落到读者这一周会遇到的后果。再用一句话说清下面能拿到什么。</p>
<h2>怎么做</h2>
<ol>
<li><strong>第一步。</strong>一句指令，一个具体例子。</li>
<li><strong>第二步。</strong>……</li>
<li><strong>第三步。</strong>……</li>
</ol>
<h2>什么时候这招不灵</h2>
<p>至少一段：谁不该这么做，哪里会出问题。说人话，不是免责声明。</p>
<h2>接下来 14 天能做的</h2>
<ul>
<li>两三个动作，每个 30 分钟以内。</li>
</ul>
`,
    faq: [['大家会在 Google 里输入的问题？', '两到四句话答完，单独看也完整。']],
    pillar: ['达拉斯团队 AI 培训', '/ai-training/'],
    related: [['价格', '/pricing/'], ['案例', '/case-studies/']],
    sources: [],
  },
};
