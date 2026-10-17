// Offline browser-message harness only: never load Cal.com, gtag or a real booking endpoint.
import assert from 'node:assert/strict';
import test from 'node:test';
import vm from 'node:vm';
import { webcrypto } from 'node:crypto';
import { installCalBookingTracking } from '../src/cal-booking-tracking.mjs';
import { pages, CAL_URL } from '../src/pages/book.mjs';
import { render, pageOf } from '../src/layout.mjs';

const storageKey = 'amj_cal_booking_complete_v1';
const baseEmbed = `${CAL_URL}?embed=true&layout=month_view&theme=light`;
const valid = (uid = 'offline-test-uid') => ({
  originator: 'CAL', type: 'bookingSuccessfulV2', namespace: 'true', fullType: 'CAL:true:bookingSuccessfulV2',
  data: { uid, eventTypeId: 7521172, status: 'ACCEPTED', paymentRequired: false,
    // Deliberate poison fields prove that accepted payloads are never forwarded wholesale.
    attendee: { email: 'never-send@example.test', name: 'Private Person' }, title: 'Private title', startTime: '2026-10-19T14:00:00Z', },
});
const settle = () => new Promise((resolve) => setImmediate(resolve));
function harness({ url = 'https://aimanjack.com/book/', session = new Map(), local = new Map(), storageReadError = false,
  storageWriteError = false, gpc = false, digest = webcrypto.subtle.digest.bind(webcrypto.subtle), html } = {}) {
  const listeners = [], calls = [], attributes = new Map([['src', baseEmbed]]), fallbackAttributes = new Map([['href', CAL_URL]]), source = {};
  const pendingDigests = new Set();
  const trackedDigest = (...args) => {
    const pending = Promise.resolve(digest(...args));
    pendingDigests.add(pending);
    pending.then(() => pendingDigests.delete(pending), () => pendingDigests.delete(pending));
    return pending;
  };
  const u = new URL(url);
  const store = (values, readError = false, writeError = false) => ({
    getItem(key) { if (readError) throw new Error('blocked storage'); return values.get(key) ?? null; },
    setItem(key, value) { if (writeError) throw new Error('storage quota'); values.set(key, String(value)); },
  });
  const frame = { contentWindow: source, getAttribute: (key) => attributes.get(key), setAttribute: (key, value) => attributes.set(key, value) };
  const fallback = { getAttribute: (key) => fallbackAttributes.get(key), setAttribute: (key, value) => fallbackAttributes.set(key, value) };
  const win = {
    document: { getElementById: (id) => id === 'cal-booking-frame' ? frame : id === 'cal-booking-link' ? fallback : null },
    location: u, navigator: { globalPrivacyControl: gpc }, URL, URLSearchParams, TextEncoder,
    localStorage: store(local), sessionStorage: store(session, storageReadError, storageWriteError),
    crypto: { subtle: { digest: trackedDigest } },
    amjTrack: (name, props) => calls.push([name, props]),
    addEventListener: (type, fn) => { if (type === 'message') listeners.push(fn); },
  };
  if (html) {
    const code = html.match(/<script>(\(function installCalBookingTracking[\s\S]*?)<\/script>/)?.[1];
    assert.ok(code, 'built page embeds the exact tracking installer');
    vm.runInNewContext(code, { window: win, Set, Uint8Array });
  } else installCalBookingTracking(win);
  return { win, frame, calls, attributes, fallbackAttributes, session,
    emit(message = valid(), overrides = {}) {
      for (const fn of listeners) fn({ isTrusted: true, origin: 'https://cal.com', source, data: message, ...overrides });
    },
    async flush() {
      // WebCrypto uses the worker pool; event-loop turns cannot establish completion on a busy runner.
      // Its awaiting tracking continuation runs before this Promise.allSettled continuation.
      while (pendingDigests.size) await Promise.allSettled(Array.from(pendingDigests));
    },
  };
}

test('both rendered languages count only accepted Cal messages with fixed, nonpersonal properties', async () => {
  for (const lang of ['en', 'zh']) {
    const html = render(pageOf(pages[0], lang), lang), h = harness({ html, url: `https://aimanjack.com/${lang === 'zh' ? 'zh/' : ''}book/` });
    assert.match(html, /<iframe id="cal-booking-frame" src="https:\/\/cal.com\/aimanjack\/ai-workflow-call\?embed=true&layout=month_view&theme=light"/);
    assert.match(html, /loading="lazy" style="width:100%;min-height:720px;border:0;border-radius:16px;background:#fff"/);
    assert.match(html, /<a id="cal-booking-link" href="https:\/\/cal.com\/aimanjack\/ai-workflow-call" target="_blank" rel="noopener" data-event="booking_calcom_click" data-pos="book">/);
    h.emit(); await h.flush();
    assert.equal(h.calls.length, 1);
    assert.equal(JSON.stringify(h.calls), JSON.stringify([['booking_complete', { booking_provider: 'calcom', event_type: 'ai_workflow_call', location_type: 'phone' }]]));
    assert.doesNotMatch(JSON.stringify(h.calls), /never-send|Private|2026-10|offline-test-uid|eventTypeId|paymentRequired/);
    const hashes = JSON.parse(h.session.get(storageKey));
    assert.equal(hashes.length, 1); assert.match(hashes[0], /^[a-f0-9]{64}$/);
    assert.doesNotMatch(h.session.get(storageKey), /offline-test-uid/);
  }
});

test('forged origins, sources, synthetic events, malformed envelopes and other Cal event types never count', async () => {
  const h = harness();
  for (const overrides of [{ origin: 'https://cal.com.evil.test' }, { origin: 'http://cal.com' }, { origin: 'https://app.cal.com' },
    { source: {} }, { source: null }, { isTrusted: false }, { isTrusted: undefined }]) h.emit(valid(), overrides);
  for (const message of [null, [], 'CAL', {}, { ...valid(), originator: 'OTHER' }, { ...valid(), namespace: '' },
    { ...valid(), fullType: 'CAL::bookingSuccessfulV2' }, { ...valid(), fullType: 'CAL:true:bookingSuccessful' },
    ...['bookingSuccessful', 'dryRunBookingSuccessfulV2', 'rescheduleBookingSuccessfulV2', 'bookingCancelled'].map((type) => ({ ...valid(), type, fullType: `CAL:true:${type}` })),
    { ...valid(), data: null }, { ...valid(), data: [] }]) h.emit(message);
  await h.flush(); assert.equal(h.calls.length, 0); assert.equal(h.session.has(storageKey), false);
  h.frame.contentWindow = null; h.emit(valid(), { source: null });
  await h.flush(); assert.equal(h.calls.length, 0, 'null source cannot establish iframe identity');
});

test('pending, unknown, unpaid, wrong-event and invalid UID records fail closed', async () => {
  const h = harness();
  for (const fields of [
    ...['PENDING', 'AWAITING_PAYMENT', 'CANCELLED', 'REJECTED', 'UNKNOWN', '', ' ACCEPTED '].map((status) => ({ status })),
    { status: null }, { eventTypeId: 123 }, { eventTypeId: '7521172' }, { eventTypeId: undefined },
    { paymentRequired: true }, { paymentRequired: undefined }, { paymentRequired: null }, { paymentRequired: 0 },
    { uid: '' }, { uid: null }, { uid: 'contains spaces' }, { uid: 'name@example.test' }, { uid: 'x'.repeat(129) },
  ]) h.emit({ ...valid(), data: { ...valid().data, ...fields } });
  await h.flush(); assert.equal(h.calls.length, 0);
  h.emit({ ...valid(), data: { ...valid().data, status: 'accepted' } });
  await h.flush(); assert.equal(h.calls.length, 1, 'documented accepted status is case-normalized only');
});

test('flush waits for delayed real WebCrypto completion instead of a fixed number of event-loop turns', async () => {
  let release;
  const h = harness({ digest: (...args) => new Promise((resolve) => {
    release = () => resolve(webcrypto.subtle.digest(...args));
  }) });
  h.emit({ ...valid(), data: { ...valid().data, status: 'accepted' } });
  let flushed = false;
  const completion = h.flush().then(() => { flushed = true; });
  try {
    // Keep the real digest behind an explicit gate beyond the old eight-turn flush.
    for (let i = 0; i < 12; i++) await settle();
    assert.equal(h.calls.length, 0, 'unresolved digest must not produce an event');
    assert.equal(flushed, false, 'flush must still await the in-flight digest');
  } finally {
    release();
    await completion;
  }
  assert.equal(h.calls.length, 1, 'accepted booking is counted after the real digest resolves');
});

test('concurrent duplicate messages count once and hashed dedup survives page refresh', async () => {
  const queue = [], h = harness({ digest: (...args) => new Promise((resolve) => queue.push(() => resolve(webcrypto.subtle.digest(...args)))) });
  for (let i = 0; i < 6; i++) h.emit();
  assert.equal(queue.length, 6); queue.reverse().forEach((release) => release());
  await h.flush(); assert.equal(h.calls.length, 1);
  const refreshed = harness({ session: h.session });
  refreshed.emit(); await refreshed.flush(); assert.equal(refreshed.calls.length, 0);
  refreshed.emit(valid('second-offline-uid')); await refreshed.flush(); assert.equal(refreshed.calls.length, 1);
});

test('malformed/quota/blocked session storage use bounded in-memory dedup without leaking UID', async () => {
  for (const opts of [{ storageReadError: true, storageWriteError: true }, { storageWriteError: true },
    { session: new Map([[storageKey, '{malformed']]) }, { session: new Map([[storageKey, JSON.stringify({ uid: 'never-read-this-as-a-hash' })]]) }]) {
    const h = harness(opts);
    h.emit(); h.emit(); await h.flush(); h.emit(); await h.flush();
    assert.equal(h.calls.length, 1);
  }
  const old = Array.from({ length: 110 }, (_, i) => i.toString(16).padStart(64, '0'));
  const h = harness({ session: new Map([[storageKey, JSON.stringify([...old, 'not-a-hash'])]]) });
  h.emit(); await h.flush();
  const hashes = JSON.parse(h.session.get(storageKey));
  assert.equal(hashes.length, 100); assert.equal(new Set(hashes).size, 100);
  assert.ok(hashes.every((hash) => /^[a-f0-9]{64}$/.test(hash)));
});

test('preview hosts and privacy opt-outs do not call analytics or forward campaigns', async () => {
  for (const opts of [
    { url: 'http://127.0.0.1:8799/book/?utm_source=preview' }, { url: 'https://review.pages.dev/book/?utm_source=preview' },
    { url: 'https://evilaimanjack.com/book/?utm_source=preview' }, { url: 'https://crm.aimanjack.com/book/?utm_source=preview' },
    { url: 'https://aimanjack.com/book/?utm_source=privacy', gpc: true },
    { url: 'https://aimanjack.com/zh/book/?utm_source=privacy', local: new Map([['amj_analytics_off', '1']]) },
  ]) {
    const h = harness(opts); h.emit(); await h.flush();
    assert.equal(h.calls.length, 0); assert.equal(h.session.has(storageKey), false);
    assert.equal(h.attributes.get('src'), baseEmbed);
    assert.equal(h.fallbackAttributes.get('href'), CAL_URL);
  }
  const queue = [], local = new Map(), h = harness({ local, digest: (...args) => new Promise((resolve) => queue.push(() => resolve(webcrypto.subtle.digest(...args)))) });
  h.emit(); local.set('amj_analytics_off', '1'); queue.forEach((release) => release()); await h.flush();
  assert.equal(h.calls.length, 0, 'opt-out after digest starts still prevents delivery');
  const noCrypto = harness({ digest: async () => { throw new Error('unavailable'); } });
  noCrypto.emit(); await noCrypto.flush(); assert.equal(noCrypto.calls.length, 0, 'hash failure cannot bypass dedup');
});

test('campaign allowlist preserves event settings and never copies arbitrary query, PII fields or manage tokens', () => {
  for (const lang of ['en', 'zh']) {
    const html = render(pageOf(pages[0], lang), lang);
    const session = new Map([['amj_ft', JSON.stringify({ utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'dfw-team-ai',
      utm_content: 'team-workshops', utm_term: 'corporate ai training', name: 'Private Name', email: 'private@example.test',
      phone: '2145550147', id: 'SECRET-MANAGE-TOKEN', gclid: 'SECRET-CLICK-ID', ref: 'private-referrer.test' })]]);
    const h = harness({ html, session, url: `https://aimanjack.com/${lang === 'zh' ? 'zh/' : ''}book/?utm_source=later&name=Private&email=private%40example.test&phone=2145550147&id=SECRET-MANAGE-TOKEN&gclid=SECRET-CLICK-ID&gbraid=OTHER&wbraid=OTHER` });
    const cal = new URL(h.attributes.get('src'));
    assert.equal(cal.origin + cal.pathname, CAL_URL);
    assert.equal(cal.searchParams.get('embed'), 'true'); assert.equal(cal.searchParams.get('layout'), 'month_view'); assert.equal(cal.searchParams.get('theme'), 'light');
    assert.deepEqual(Array.from(cal.searchParams.keys()).sort(), ['embed', 'layout', 'theme', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term'].sort());
    assert.equal(cal.searchParams.get('utm_source'), 'google'); assert.equal(cal.searchParams.get('utm_term'), 'corporate ai training');
    assert.doesNotMatch(cal.href, /Private|private|2145550147|SECRET|gbraid|wbraid/);
    const external = new URL(h.fallbackAttributes.get('href'));
    assert.equal(external.origin + external.pathname, CAL_URL);
    assert.deepEqual(Array.from(external.searchParams.keys()).sort(), ['utm_campaign', 'utm_content', 'utm_medium', 'utm_source', 'utm_term']);
    for (const key of external.searchParams.keys()) assert.equal(external.searchParams.get(key), cal.searchParams.get(key));
    assert.doesNotMatch(external.href, /Private|private|2145550147|SECRET|gbraid|wbraid|embed|theme|layout/);
  }
  const fallback = harness({ session: new Map([['amj_ft', '{malformed']]), url: 'https://aimanjack.com/book/?utm_source=google&utm_campaign=dfw&email=private%40example.test&id=SECRET' });
  assert.equal(new URL(fallback.attributes.get('src')).searchParams.get('utm_source'), 'google');
  assert.equal(new URL(fallback.fallbackAttributes.get('href')).searchParams.get('utm_source'), 'google');
  const discard = harness({ url: 'https://aimanjack.com/book/?utm_source=person%40example.test&utm_medium=https%3A%2F%2Fprivate.test&utm_campaign=%2B1-214-555-0147&utm_content=%0Asecret&utm_term=' + 'x'.repeat(121) });
  assert.equal(discard.attributes.get('src'), baseEmbed);
  assert.equal(discard.fallbackAttributes.get('href'), CAL_URL);
});
