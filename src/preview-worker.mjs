// Intentionally contains no production API, database client, or mail transport.
export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    const blocked = /^\/(?:v1|api)(?:\/|$)/i.test(path) || !['GET', 'HEAD'].includes(request.method);
    const response = blocked
      ? new Response(request.method === 'HEAD' ? null : JSON.stringify({ error: 'preview_read_only', message: 'Read-only preview. Booking and email APIs are disabled.' }), { status: 503, headers: { 'content-type': 'application/json; charset=utf-8' } })
      : await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    headers.set('X-Robots-Tag', 'noindex, nofollow');
    headers.set('Cache-Control', 'no-store');
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'");
    return new Response(response.body, { status: response.status, headers });
  }
};
