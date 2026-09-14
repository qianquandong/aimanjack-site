import { SITE, EMAIL, GBP_URL } from '../config.mjs';
import { L } from '../layout.mjs';
import { pageHero, breadcrumb, finalCta, geoFacts, AREA, T } from '../components.mjs';

// The one full ProfessionalService node (no reviews here — those stay on /ai-training/ where they are visible).
export const BUSINESS_FULL = (lang) => ({
  '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'AI Man Jack', legalName: 'AI Man Jack LLC',
  description: lang === 'zh'
    ? 'AI Man Jack LLC 是 Jack Qian 在德州达拉斯的公司：主要为团队提供中英文 AI 实战培训，也为预约制商家安装 AI 前台和预约系统。'
    : 'AI Man Jack LLC is Jack Qian’s Dallas, Texas company: it primarily runs hands-on AI training for teams in English or Chinese and also installs AI receptionists and booking workflows.',
  url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, image: `${SITE}/img/jack-headshot.jpg`, email: EMAIL, telephone: '+1-469-425-4142',
  founder: { '@id': `${SITE}/#jack` }, areaServed: AREA, availableLanguage: ['en', 'es', 'zh'], priceRange: '$199-$599/month',
  address: { '@type': 'PostalAddress', addressLocality: 'Dallas', addressRegion: 'TX', addressCountry: 'US' },
  sameAs: [GBP_URL, 'https://nextdoor.com/page/ai-man-jack-melissa-tx/', 'https://www.linkedin.com/in/quandong-qian-156563191/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/JackQianAI', 'https://www.facebook.com/profile.php?id=100084925451350'],
  knowsAbout: ['AI training', 'corporate AI training', 'AI workshops', 'workflow automation', 'AI receptionist', 'appointment booking automation'],
});

const PERSON = {
  '@type': 'Person', '@id': `${SITE}/#jack`, name: 'Jack Qian', alternateName: 'AI Man Jack', url: `${SITE}/about/`, image: `${SITE}/img/jack-headshot.jpg`,
  jobTitle: ['Founder', 'AI Trainer'], worksFor: { '@id': `${SITE}/#business` }, knowsLanguage: ['en', 'zh'],
  sameAs: ['https://realagentusecases.com/', 'https://github.com/qianquandong', 'https://www.linkedin.com/in/quandong-qian-156563191/', 'https://www.youtube.com/@JackBuildAI', 'https://x.com/JackQianAI', 'https://www.threads.com/@jack_qian616'],
};

const copy = {
  en: {
    title: 'About Jack Qian and AI Man Jack LLC, Dallas | AI Man Jack',
    description: 'AI Man Jack LLC is Jack Qian’s Dallas company for hands-on AI training in English or Chinese, plus practical AI receptionist and workflow services.',
    h1: 'Built locally. Supported by a real person.',
    sub: 'AI Man Jack LLC is a one-person company in Dallas, Texas. Jack Qian does the setup, the testing and the support himself.',
    body: `
<h2>What the company does</h2>
<p>AI Man Jack primarily runs <a href="/">hands-on AI training for Dallas–Fort Worth teams</a> in English or Chinese. Each person works on a task they already do and leaves with a working workflow plus a way to verify the output. The Google reviews on this site come from those workshops.</p>
<p>The company also installs and manages <a href="/ai-receptionist/">AI phone reception</a> for appointment-based businesses. The AI answers approved questions, captures caller details and books appointments through the connected workflow. See <a href="/pricing/">AI receptionist pricing</a>.</p>
<h2>Who runs it</h2>
<p>Jack Qian is an engineer in Dallas who builds AI workflows for real work: booking agents, SMS agents, research and reporting pipelines. He started AI Man Jack after building websites and booking systems for local salons and seeing the same problem everywhere: the phone rings while the owner is with a customer, and the call goes to voicemail.</p>
<p>Since 2026 he has run five community AI talks in Plano and Dallas with 50 or more people each, and a 37-person AI hackathon. Attendees left ten Google reviews, all five stars. Those reviews are about the workshops, not the receptionist, and the site keeps them on the <a href="/ai-training/">training page</a> for that reason.</p>
<h2>How he works</h2>
<ul>
<li>Observe the real workflow first, then configure. The AI answers only from details the owner approves.</li>
<li>Build the fallback before launch: message, transfer, or a text to the owner when the AI should not answer.</li>
<li>Measure before claiming. Case studies publish numbers only once they have been counted. See <a href="/case-studies/">what is measured today</a>.</li>
<li>Stay reachable. Setup, tuning and support come from the same person.</li>
</ul>
<h2>Where</h2>
<p>Dallas–Fort Worth, Texas: Dallas, Fort Worth, Plano, Richardson, Frisco, McKinney, Arlington and the towns between. On-site setup across the metroplex; remote implementation where supported.</p>
<h2>Contact</h2>
<p>Call the AI demo line at <a href="tel:+14695172968" data-event="demo_call_click" data-pos="about">(469) 517-2968</a>, email <a href="mailto:${EMAIL}">${EMAIL}</a>, or text <a href="sms:+14694254142" data-event="sms_click" data-pos="about">(469) 425-4142</a>. More on the <a href="/contact/">contact page</a>.</p>`,
    crumb: 'About',
  },
  zh: {
    title: '关于 Jack Qian 和 AI Man Jack LLC | AI Man Jack',
    description: 'AI Man Jack LLC 是 Jack Qian 在达拉斯的公司，主要提供中英文 AI 实战培训，也为商家安装 AI 前台和实用工作流。',
    h1: '本地搭建，真人负责。',
    sub: 'AI Man Jack LLC 是德州达拉斯的一人公司。安装、测试和支持，都是 Jack Qian 本人来做。',
    body: `
<h2>公司做什么</h2>
<p>AI Man Jack 主要给达拉斯—沃斯堡团队做<a href="/zh/">中英文 AI 实战培训</a>。每个人拿自己正在做的任务练，带着一条能跑的工作流和核对输出的方法走。本站的 Google 评价来自这些工作坊。</p>
<p>公司也为预约制商家安装并维护<a href="/zh/ai-receptionist/">AI 电话前台</a>。AI 回答已确认的问题、记下来电者信息，并通过接好的流程完成预约。查看<a href="/zh/pricing/">AI 前台价格</a>。</p>
<h2>谁在做</h2>
<p>Jack Qian 是达拉斯的工程师，专门给真实工作搭 AI 流程：预约 agent、短信 agent、调研和报告流水线。他先是给本地美发店做网站和预约系统，到处看到同一个问题：老板正在给客人做头发，电话响了，最后进了语音信箱。于是有了 AI Man Jack。</p>
<p>2026 年以来，他在 Plano 和达拉斯办了五场社区 AI 讲座，每场 50 人以上，还办了一场 37 人的 AI hackathon。参加的人留下了十条 Google 评价，全是五星。这些评价说的是工作坊，不是 AI 前台，所以本站把它们放在<a href="/zh/ai-training/">培训页</a>。</p>
<h2>他怎么干活</h2>
<ul>
<li>先看真实流程，再配置。AI 只按店主确认过的信息回答。</li>
<li>上线前先做好兜底：AI 不该答的时候，留言、转接，或者短信通知店主。</li>
<li>先测量，再说话。案例里的数字，数过了才发。看看<a href="/zh/case-studies/">现在在测什么</a>。</li>
<li>随时找得到人。安装、调试和支持，都是同一个人。</li>
</ul>
<h2>在哪儿</h2>
<p>德州达拉斯—沃斯堡：Dallas、Fort Worth、Plano、Richardson、Frisco、McKinney、Arlington 及周边城镇。全都会区可上门安装，支持的情况下也可远程实施。</p>
<h2>联系</h2>
<p>拨打 AI 演示线 <a href="tel:+14695172968" data-event="demo_call_click" data-pos="about">(469) 517-2968</a>，发邮件到 <a href="mailto:${EMAIL}">${EMAIL}</a>，或发短信到 <a href="sms:+14694254142" data-event="sms_click" data-pos="about">(469) 425-4142</a>。更多方式见<a href="/zh/contact/">联系页</a>。</p>`,
    crumb: '关于',
  },
};

const page = (lang) => {
  const c = copy[lang], bc = breadcrumb(lang, [[c.crumb, '/about/']]);
  return {
    title: c.title, description: c.description,
    body: `<div class="wrap">${bc.html}</div>${pageHero(lang, { eyebrow: T[lang].nav.about, h1: c.h1, sub: c.sub })}
<section class="section"><div class="wrap"><div class="split"><div class="prose">${c.body}</div><div><img src="/img/jack-headshot.jpg" width="640" height="640" loading="lazy" decoding="async" alt="Jack Qian" style="border-radius:16px;max-width:420px"><p class="muted" style="font-size:14px;margin-top:10px">Jack Qian, AI Man Jack LLC, Dallas</p></div></div></div></section>
${finalCta(lang)}${geoFacts(lang)}`,
    jsonld: [BUSINESS_FULL(lang), PERSON, bc.ld],
  };
};

export const pages = [{ path: '/about/', priority: 0.7, en: page('en'), zh: page('zh') }];
