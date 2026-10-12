// Preview/local requests must never reach the production database or mailbox,
// even if inherited secrets or an incorrect environment flag are present.
const PRODUCTION_HOSTS = new Set(['aimanjack.com', 'www.aimanjack.com', 'aimanjack.pages.dev']);
export function productionApiEnabled(env, request) {
  return env.SITE_ENV === 'production' && PRODUCTION_HOSTS.has(new URL(request.url).hostname) &&
    (!env.CF_PAGES_BRANCH || env.CF_PAGES_BRANCH === 'production');
}
