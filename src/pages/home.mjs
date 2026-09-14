import { SITE } from '../config.mjs';
import { trainingPage } from './training.mjs';

const page = (lang) => {
  const training = trainingPage(lang, true);
  const websiteId = `${SITE}/#website`;
  const website = training.jsonld.find((n) => n['@type'] === 'WebSite' && n['@id'] === websiteId) ?? {
    '@type': 'WebSite', '@id': websiteId, url: `${SITE}/`, name: 'AI Man Jack',
    inLanguage: ['en', 'zh'], publisher: { '@id': `${SITE}/#business` },
  };
  const jsonld = [...training.jsonld.filter((n) => !(n['@type'] === 'WebSite' && n['@id'] === websiteId)), website];
  return { ...training, view: 'training_view', jsonld };
};

export const pages = [{ path: '/', priority: 1.0, changefreq: 'weekly', en: page('en'), zh: page('zh') }];