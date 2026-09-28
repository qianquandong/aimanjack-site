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
  '@type': 'Offer', priceCurrency: 'USD', price: String(TRAINING.programFrom),
  priceSpecification: { '@type': 'UnitPriceSpecification', price: String(TRAINING.programFrom), priceCurrency: 'USD', unitText: zh(lang) ? '每人' : 'per person' },
  itemOffered: { '@type': 'Service', '@id': `${SITE}/#training`, name: zh(lang) ? '四次定制 AI 工作流培训项目' : '4-Session Customized AI Workflow Training Program', url: `${SITE}${langPath(lang, '/ai-training/')}`,
    description: zh(lang)
      ? `围绕学员已经在做的工作定制的实操 AI 培训：${TRAINING.sessions} 节 ${TRAINING.sessionMin} 分钟实时课程，每人 $${TRAINING.programFrom} 起，团队可定制报价。全美远程授课，达拉斯—沃斯堡可上门，中英文皆可。也提供 90 分钟专题分享和半天工作坊（$${TRAINING.halfDayFrom.toLocaleString()} 起，最多 ${TRAINING.halfDayMax} 人）。`
      : `Hands-on AI training customized around the work people already do: ${TRAINING.sessions} live ${TRAINING.sessionMin}-minute sessions, starting at $${TRAINING.programFrom} per person, with custom team pricing. Remote anywhere in the U.S., onsite in Dallas–Fort Worth, in English or Chinese. 90-minute sessions and half-day workshops (from $${TRAINING.halfDayFrom.toLocaleString()} for up to ${TRAINING.halfDayMax} people) are also available.` },
});

// full = reviews + aggregateRating + offer (home and /ai-training/, where the reviews are visible).
export const business = (lang, { full = false } = {}) => ({
  '@type': 'ProfessionalService', '@id': `${SITE}/#business`, name: 'AI Man Jack', legalName: LEGAL_NAME,
  description: zh(lang)
    ? 'AI Man Jack LLC 是 Jack Qian 在德州达拉斯的公司：为企业老板和团队提供定制的实操 AI 培训与 AI 工作流培训，全美远程授课，达拉斯—沃斯堡可上门，中英文皆可。'
    : 'AI Man Jack LLC is Jack Qian’s Dallas, Texas company: customized, hands-on AI training and practical AI workflow training for business owners and teams, remote across the U.S. or onsite in Dallas–Fort Worth, in English or Chinese.',
  url: `${SITE}/`, logo: `${SITE}/apple-touch-icon.png`, image: `${SITE}/img/hero-workshop-1600.webp`, email: EMAIL, telephone: '+1-469-425-4142',
  founder: { '@id': `${SITE}/#jack` }, areaServed: [...AREA, { '@type': 'Country', name: 'United States' }], availableLanguage: ['en', 'zh'], currenciesAccepted: 'USD',
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
