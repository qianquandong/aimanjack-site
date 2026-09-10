import { L } from '../layout.mjs';
import { finalCta } from '../components.mjs';

const c = {
  en: { title: 'Page Not Found | AI Man Jack', description: 'This page is not available. Go to the AI receptionist, pricing, or call the AI demo line.', h1: 'This page is gone, but the AI still answers.', sub: 'The link may point to an older version of the site. Try the pages below, or call the demo line.', links: [['/', 'Home'], ['/ai-receptionist/', 'AI receptionist'], ['/pricing/', 'Pricing'], ['/ai-training/', 'AI training'], ['/contact/', 'Contact']] },
  zh: { title: '页面不存在 | AI Man Jack', description: '这个页面不存在。去看看 AI 前台、价格，或者拨打 AI 演示线。', h1: '这页没了，AI 照样接电话。', sub: '链接可能指向旧版网站。试试下面的页面，或者拨打演示线。', links: [['/', '首页'], ['/ai-receptionist/', 'AI 前台'], ['/pricing/', '价格'], ['/ai-training/', 'AI 培训'], ['/contact/', '联系']] },
};
const page = (lang) => ({
  title: c[lang].title, description: c[lang].description, noindex: true,
  body: `<section class="page-hero"><div class="wrap narrow"><p class="eyebrow">404</p><h1>${c[lang].h1}</h1><p class="lead">${c[lang].sub}</p><p class="cta-row">${c[lang].links.map(([p, l]) => `<a class="btn btn-secondary" href="${L(lang, p)}">${l}</a>`).join('')}</p></div></section>${finalCta(lang)}`,
  jsonld: [],
});
export const pages = [{ path: '/404', en: page('en'), zh: page('zh') }];
