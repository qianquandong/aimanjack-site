// JSON-LD nodes, one source. Pages compose these into an @graph; facts come from config.mjs.
import { SITE, LEGAL_NAME, EMAIL, GBP_URL, PROOF, TRAINING, BUSINESS_SAME_AS, JACK_SAME_AS, langPath } from './config.mjs';

const zh = (lang) => lang === 'zh';

export const AREA = [
  { '@type': 'AdministrativeArea', '@id': `${SITE}/#dfw`, name: 'Dallas–Fort Worth metroplex', sameAs: 'https://en.wikipedia.org/wiki/Dallas%E2%80%93Fort_Worth_metroplex',
    containedInPlace: { '@type': 'State', name: 'Texas', containedInPlace: { '@type': 'Country', name: 'United States' } } },
  ...['Dallas', 'Fort Worth', 'Plano', 'Richardson', 'Frisco', 'McKinney', 'Arlington'].map((n) => ({ '@type': 'City', name: n, containedInPlace: { '@id': `${SITE}/#dfw` } })),
];

// Short reference for pages that only need to point at the business.
export const BUSINESS_REF = { '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'AI Man Jack', url: `${SITE}/`, telephone: '+1-469-425-4142', email: EMAIL };

// Real Google reviews shown on /ai-training/. Text as it appears on Google; do not edit or add.
const REVIEWS = [
  ['emily xu', 'I had such a great experience at this AI workshop. It was practical, inspiring, and genuinely fun. Jack, the host, did an amazing job of breaking down complex AI concepts in a way that was easy to understand…'],
  ['U Rachel', 'I really enjoyed Jack’s AI seminar! He has a very forward-thinking perspective on AI and does a great job of explaining everything from understanding AI to actually using it in real life…'],
  ['Yuqi Guan', 'This AI course was very informative and easy to follow. It covered the fundamentals of AI and its basic applications, making it especially suitable for beginners with little or no prior experience.'],
].map(([name, body]) => ({ '@type': 'Review', reviewBody: body, reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' }, author: { '@type': 'Person', name }, itemReviewed: { '@id': `${SITE}/#business` }, publisher: { '@type': 'Organization', name: 'Google' } }));

export const trainingOffer = (lang) => ({
  '@type': 'Offer', priceCurrency: 'USD', price: String(TRAINING.halfDayFrom),
  itemOffered: { '@type': 'Service', '@id': `${SITE}/#training`, name: zh(lang) ? '团队 AI 实战培训' : 'Corporate AI Training for Teams', url: `${SITE}${langPath(lang, '/ai-training/')}`,
    description: zh(lang)
      ? '面向达拉斯—沃斯堡团队的动手 AI 培训，中英文皆可。三种形式：90 分钟分享、半天动手工作坊、多周项目。每个人拿自己已经在做的任务练，带着一条能跑的工作流和核对清单走。半天工作坊 $1,500 起，10 人以内。'
      : `Hands-on AI training for Dallas–Fort Worth teams, in English or Chinese. Three formats: a 90-minute session, a half-day hands-on workshop and a multi-week program. Each participant works on a task they already do and leaves with a working workflow and a verification checklist. Half-day workshops from $${TRAINING.halfDayFrom.toLocaleString()} for up to ${TRAINING.halfDayMax} people.` },
});

// full = reviews + aggregateRating + offer (home and /ai-training/, where the reviews are visible).
export const business = (lang, { full = false } = {}) => ({
  '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'AI Man Jack', legalName: LEGAL_NAME,
  description: zh(lang)
    ? 'AI Man Jack LLC 是 Jack Qian 在德州达拉斯的公司：给团队做动手 AI 培训和 AI 工作流培训，中英文皆可，上门或远程。'
    : 'AI Man Jack LLC is Jack Qian’s Dallas, Texas company: hands-on corporate AI training and practical AI workflow training for teams, in English or Chinese, onsite or remote.',
  url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, image: `${SITE}/img/hero-workshop-1600.webp`, email: EMAIL, telephone: '+1-469-425-4142',
  founder: { '@id': `${SITE}/#jack` }, areaServed: AREA, availableLanguage: ['en', 'zh'], currenciesAccepted: 'USD',
  address: { '@type': 'PostalAddress', addressLocality: 'Dallas', addressRegion: 'TX', addressCountry: 'US' },
  sameAs: BUSINESS_SAME_AS,
  knowsAbout: ['corporate AI training', 'AI training for employees', 'AI workshops', 'AI workflows', 'ChatGPT', 'Claude', 'Gemini', 'Microsoft Copilot', 'AI agents'],
  makesOffer: [trainingOffer(lang)],
  ...(full ? { review: REVIEWS, aggregateRating: { '@type': 'AggregateRating', ratingValue: PROOF.rating, reviewCount: PROOF.reviews, bestRating: '5', worstRating: '1' } } : {}),
});

export const person = () => ({
  '@type': 'Person', '@id': `${SITE}/#jack`, name: 'Jack Qian', alternateName: 'AI Man Jack', url: `${SITE}/about/`, image: `${SITE}/img/jack-headshot.jpg`,
  jobTitle: ['Founder', 'AI Trainer', 'Dallas AI Community Organizer'], worksFor: { '@id': `${SITE}/#business` }, knowsLanguage: ['en', 'zh'],
  knowsAbout: ['AI training', 'AI workflows', 'AI agents', 'workflow automation'], sameAs: JACK_SAME_AS,
});

export const website = () => ({ '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'AI Man Jack', inLanguage: ['en', 'zh'], publisher: { '@id': `${SITE}/#business` } });

export const faqPage = (items, id) => ({ '@type': 'FAQPage', ...(id ? { '@id': id } : {}), mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q.replace(/<[^>]+>/g, ''), acceptedAnswer: { '@type': 'Answer', text: a.replace(/<[^>]+>/g, '') } })) });

export { GBP_URL };
