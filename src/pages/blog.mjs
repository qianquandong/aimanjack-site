// Blog index + one page pair per published post. Posts live in src/posts/<slug>.mjs (files starting with "_" are ignored).
// A post with status 'draft' is skipped by the build, so it can sit in the repo while Jack reviews it.
import { readdirSync } from 'node:fs';
import { postPage, indexPage, postPath, BLOG_PATH } from '../blog.mjs';

const dir = new URL('../posts/', import.meta.url);
const files = readdirSync(dir).filter((f) => f.endsWith('.mjs') && !f.startsWith('_')).sort();
const all = [];
for (const f of files) {
  const { post } = await import(new URL(f, dir));
  if (post.slug !== f.replace(/\.mjs$/, '')) throw new Error(`src/posts/${f}: slug "${post.slug}" must match the file name`);
  all.push(post);
}
export const published = all.filter((p) => p.status === 'published').sort((a, b) => (b.date < a.date ? -1 : 1));

export const pages = [
  { path: BLOG_PATH, priority: 0.7, changefreq: 'weekly', en: indexPage(published, 'en'), zh: indexPage(published, 'zh') },
  ...published.map((p) => ({ path: postPath(p.slug), priority: 0.6, changefreq: 'monthly', en: postPage(p, 'en'), zh: postPage(p, 'zh') })),
];
