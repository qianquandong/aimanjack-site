import { href } from '../layout.mjs';
import { finalCta } from '../components.mjs';

const c = {
  en: { title: 'Page Not Found | AI Man Jack', description: 'Page not found. Explore free AI tools, AI workflows and training from AI Man Jack.', h1: 'Page not found.', sub: 'The link may point to an older version of the site. Explore:', links: [['/tools/', 'Free Tools'], ['/workflows/', 'AI Workflows'], ['/ai-training/', 'Training'], ['/templates/', 'Templates'], ['/', 'Home']] },
  zh: { title: '页面不存在 | AI Man Jack', description: '页面不存在。可浏览 AI Man Jack 的免费 AI 工具、AI 工作流与培训内容。', h1: '未找到该页面。', sub: '该链接可能指向旧版网站。你可以浏览：', links: [['/tools/', '免费工具'], ['/workflows/', 'AI 工作流'], ['/ai-training/', 'AI 培训'], ['/templates/', '模板'], ['/', '首页']] },
};
const page = (lang) => ({
  title: c[lang].title, description: c[lang].description, noindex: true,
  body: `<section class="page-hero"><div class="wrap"><p class="eyebrow">404</p><h1>${c[lang].h1}</h1><p class="lead">${c[lang].sub}</p><p class="cta-row">${c[lang].links.map(([p, l]) => `<a class="btn btn-secondary" href="${href(lang, p)}">${l}</a>`).join('')}</p></div></section>${finalCta(lang)}`,
  jsonld: [],
});
export const pages = [{ path: '/404', en: page('en'), zh: page('zh') }];
