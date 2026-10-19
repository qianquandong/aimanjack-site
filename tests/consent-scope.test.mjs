// PR01 (M01/M02): consent scope by brand × channel × purpose. Acceptance tests T07, T09–T15 (02_ACCEPTANCE_TESTS.md).
// Disposable in-memory PostgreSQL (PGlite) with the real migrations; providers are mocks; nothing leaves the machine.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHmac } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { fixture, provider } from './mailerlite-test-store.mjs';
import { mailerliteProcessor, mailerliteWebhook } from '../functions/mailerlite.mjs';
import { onRequest } from '../functions/v1/[[route]].js';
import { CONSENT_NOTICE_VERSION } from '../src/config.mjs';
import { identityKey, normalizeEmail, effectiveState, allowsMarketing, quoteConsents, MARKETING_PURPOSES } from '../src/consent.mjs';

const MIGRATION = new URL('../db/migrations/2026-10-19-consent-scope.sql', import.meta.url);
const SECRET = 'mock-existing-email-identity-key-only';   // same mock key as tests/mailerlite-test-store.mjs
const subject = (email) => createHmac('sha256', SECRET).update('subject:' + email).digest('hex');

// fixture() applies 2026-10-08 + 2026-10-16. migrate() adds 2026-10-19 on top, as production would.
async function scoped(t, { before } = {}) {
  const f = await fixture(t);
  if (before) await before(f);
  await f.pg.exec(await readFile(MIGRATION, 'utf8'));
  const event = (row) => f.rows(`insert into revenue.consent_events (subject_email_hash, consent_type, granted, decision, brand, channel, source, notice_version, source_occurred_at, occurred_at)
    values ($1,$2,$3,$4,$5,$6,$7,'notice-test',$8,coalesce($9::timestamptz, now())) returning event_id`,
    [row.subject, row.type, row.granted, row.decision ?? null, row.brand ?? 'aimanjack', row.channel ?? 'email', row.source ?? 'kit_form', row.source_at ?? null, row.at ?? null]);
  const state = async (subj, brand, purpose) => (await f.rows('select state from revenue.consent_effective where subject_email_hash=$1 and brand=$2 and channel=$3 and purpose=$4', [subj, brand, 'email', purpose]))[0]?.state ?? 'none';
  const allows = async (subj, brand, purpose) => (await f.rows('select revenue.consent_allows($1,$2,$3,$4) as ok', [subj, brand, 'email', purpose]))[0].ok;
  const ledger = (subj) => f.rows('select * from revenue.consent_events where subject_email_hash=$1 order by event_id', [subj]);
  // The same rows with timestamps as full-precision ISO strings (what a PostgREST client receives).
  const ledgerIso = (subj) => f.rows(`select event_id, subject_email_hash, consent_type, granted, decision, brand, channel, source,
    to_json(occurred_at)#>>'{}' as occurred_at, to_json(source_occurred_at)#>>'{}' as source_occurred_at
    from revenue.consent_events where subject_email_hash=$1 order by event_id`, [subj]);
  const suppressed = async (subj) => (await f.rows('select 1 from revenue.mailerlite_suppressions where identity_hash=$1', [subj])).length > 0;
  return { ...f, event, state, allows, ledger, ledgerIso, suppressed };
}
// The JS rules must give the same answer as the SQL view for every case below.
async function bothSay(f, subj, brand, purpose, expected) {
  assert.equal(await f.state(subj, brand, purpose), expected, `SQL ${brand}/${purpose}`);
  const scope = { subject: subj, brand, purpose, suppressed: await f.suppressed(subj) };
  for (const rows of [await f.ledger(subj), await f.ledgerIso(subj)]) {
    assert.equal(effectiveState(rows, scope), expected, `JS ${brand}/${purpose}`);
    assert.equal(allowsMarketing(rows, scope), MARKETING_PURPOSES.includes(purpose) && expected === 'granted', `JS allows ${brand}/${purpose}`);
  }
  assert.equal(await f.allows(subj, brand, purpose), MARKETING_PURPOSES.includes(purpose) && expected === 'granted', `SQL allows ${brand}/${purpose}`);
}

test('T07: identity key and existing rows are unchanged by the consent-scope migration', async (t) => {
  // Key derivation is the one the intake API has used since 2026-10-08: HMAC(EMAIL_HASH_SECRET, 'subject:' + trim+lowercase).
  assert.equal(await identityKey(SECRET, '  Dana.Reyes+Ops@Example.TEST '), subject('dana.reyes+ops@example.test'));
  assert.equal(normalizeEmail(' A.B+tag@Gmail.com '), 'a.b+tag@gmail.com', 'dots and plus tags are kept');
  assert.notEqual(await identityKey(SECRET, 'a.b@gmail.com'), await identityKey(SECRET, 'ab@gmail.com'), 'no alias merging');
  assert.notEqual(await identityKey(SECRET, 'a+x@gmail.com'), await identityKey(SECRET, 'a@gmail.com'));
  assert.equal(await identityKey('', 'a@example.test'), null, 'never an unsalted hash');

  // Rows and a tombstone written BEFORE the migration keep their key and still match after it.
  const dana = subject('dana@example.test');
  const f = await scoped(t, { before: async (f) => {
    await f.intake(true);
    await f.rows(`insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason) values($1,'42','suppressed','unsubscribed')`, [subject('old@example.test')]);
    await f.intake(true, 'old@example.test');
  } });
  const rows = await f.ledger(dana);
  assert.equal(rows.length, 1);
  assert.ok(rows.every((r) => r.subject_email_hash === dana && r.brand === 'aimanjack' && r.channel === 'email' && r.decision === null && r.source_occurred_at === null));
  await bothSay(f, dana, 'aimanjack', 'newsletter', 'granted');
  await bothSay(f, subject('old@example.test'), 'aimanjack', 'newsletter', 'suppressed');
  // record_intake keeps working unchanged after the migration and the ledger stays append-only.
  await f.intake(false, 'new@example.test');
  assert.equal((await f.ledger(subject('new@example.test')))[0].brand, 'aimanjack');
  await assert.rejects(f.pg.exec('update revenue.consent_events set brand = \'rauc\''), /append-only/);
  await assert.rejects(f.pg.exec('delete from revenue.consent_events'), /append-only/);
});

test('T09: a request consent is not marketing consent and starts nothing', async (t) => {
  const f = await scoped(t); await f.enable();
  await f.rows(`select revenue.record_intake($1::jsonb,$2::jsonb)`, [JSON.stringify({ dedupe_key: 'a'.repeat(64), consent_request: true, consent_newsletter: false,
    consent_notice_version: 'notice-test', payload: { email: 'buyer2@example.test' }, subject_email_hash: subject('buyer2@example.test') }),
    JSON.stringify([{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: false }])]);
  const b = subject('buyer2@example.test');
  await bothSay(f, b, 'aimanjack', 'request_contact', 'granted');   // the request may be handled…
  await bothSay(f, b, 'aimanjack', 'newsletter', 'none');           // …but nothing grants marketing
  await bothSay(f, b, 'aimanjack', 'kit_sequence', 'none');
  assert.equal(await f.allows(b, 'aimanjack', 'request_contact'), false, 'request handling is never a marketing permission');
  assert.equal((await f.rows('select count(*)::int n from revenue.mailerlite_sync_events'))[0].n, 0, 'no enrollment queued');
  const p = provider(); await mailerliteProcessor({ ...f, fetchImpl: p.fetchImpl }).process();
  assert.equal(p.calls.filter((c) => c.method === 'POST').length, 0, 'provider mock receives no subscription call');
});

test('T10: an unticked box records not_granted, keeps the earlier grant, and forges no new grant', async (t) => {
  const f = await scoped(t);
  const d = subject('dana@example.test');
  await f.intake(true);                 // subscribed earlier
  const grantsBefore = (await f.ledger(d)).filter((r) => r.granted).length;
  await f.intake(false);                // quotes again, box unticked
  const rows = await f.ledger(d);
  assert.equal(rows.at(-1).granted, false, 'this submission is recorded as not granted');
  assert.equal(rows.filter((r) => r.granted).length, grantsBefore, 'no grant was invented');
  await bothSay(f, d, 'aimanjack', 'newsletter', 'granted');
  // Only an explicit withdrawal changes it.
  await f.event({ subject: d, type: 'newsletter', granted: false, decision: 'withdrawn', source: 'owner_manual' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'withdrawn');
});

// Ledger level. MailerLite suppression callbacks store tombstones without a source time; they are monotone instead (see T14).
test('T11: a late, older active/grant cannot undo an unsubscribe; source and received times are both kept', async (t) => {
  const f = await scoped(t);
  const d = subject('late@example.test');
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-01T10:00:00Z', at: '2026-10-01T10:00:05Z' });
  await f.event({ subject: d, type: 'newsletter', granted: false, decision: 'withdrawn', source: 'provider_webhook', source_at: '2026-10-05T09:00:00Z', at: '2026-10-05T09:00:02Z' });
  // Arrives last, but describes an earlier moment (an old "active" update replayed by a provider).
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'provider_webhook', source_at: '2026-10-03T08:00:00Z', at: '2026-10-06T12:00:00Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'withdrawn');
  const last = (await f.ledger(d)).at(-1);
  assert.equal(new Date(last.source_occurred_at).toISOString(), '2026-10-03T08:00:00.000Z');
  assert.equal(new Date(last.occurred_at).toISOString(), '2026-10-06T12:00:00.000Z');
  // A provider tombstone wins over any later grant, and controllable marketing stays at zero.
  const e = subject('tomb@example.test');
  await f.rows(`insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason) values($1,'7','suppressed','unsubscribed')`, [e]);
  await f.event({ subject: e, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-10T00:00:00Z' });
  await bothSay(f, e, 'aimanjack', 'newsletter', 'suppressed');
  // Same story on the live MailerLite path (reported by review): queued enrollment must not go out.
  const q = await scoped(t); await q.enable();
  const g = subject('dana@example.test');
  await q.intake(true);
  await q.event({ subject: g, type: 'newsletter', granted: false, decision: 'withdrawn', source: 'provider_webhook' });
  await q.event({ subject: g, type: 'newsletter', granted: true, decision: 'granted', source: 'provider_webhook', source_at: '2026-10-01T00:00:00Z' });
  await bothSay(q, g, 'aimanjack', 'newsletter', 'withdrawn');
  const p = provider(); const out = await mailerliteProcessor({ ...q, fetchImpl: p.fetchImpl }).process();
  assert.equal(out.processed[0].outcome, 'cancelled'); assert.equal(out.processed[0].code, 'consent_not_effective');
  assert.equal(p.calls.filter((c) => c.method === 'POST').length, 0, 'controllable marketing stays at zero');
  // Source clocks may not run ahead of receipt.
  await assert.rejects(f.event({ subject: e, type: 'newsletter', granted: true, source_at: '2099-01-01T00:00:00Z' }), /source_time_check/);
});

test('T12: brand and purpose are isolated — RAUC or Kit-only consent never enables aimanjack.com long-term marketing', async (t) => {
  const f = await scoped(t);
  const r = subject('reader@example.test');
  await f.event({ subject: r, type: 'newsletter', granted: true, decision: 'granted', brand: 'rauc', source: 'owner_manual' });
  await bothSay(f, r, 'rauc', 'newsletter', 'granted');
  await bothSay(f, r, 'aimanjack', 'newsletter', 'none');
  const k = subject('kit@example.test');
  await f.event({ subject: k, type: 'kit_sequence', granted: true, decision: 'granted', source: 'kit_form' });
  await bothSay(f, k, 'aimanjack', 'kit_sequence', 'granted');
  await bothSay(f, k, 'aimanjack', 'newsletter', 'none');
  await bothSay(f, k, 'rauc', 'kit_sequence', 'none');
  // A quote form can only ever produce aimanjack.com consent.
  await assert.rejects(f.event({ subject: r, type: 'newsletter', granted: true, brand: 'rauc', source: 'quote_form' }), /quote_form_brand_check/);
  await assert.rejects(f.event({ subject: r, type: 'newsletter', granted: true, brand: 'other' }), /brand_check/);
  await assert.rejects(f.event({ subject: r, type: 'newsletter', granted: true, channel: 'sms' }), /channel_check/);
});

test('T12: the MailerLite enrollment path ignores another brand’s consent in both directions', async (t) => {
  const f = await scoped(t); await f.enable();
  const d = subject('dana@example.test');
  // aimanjack grant queued; a later RAUC withdrawal must not cancel it.
  await f.intake(true);
  await f.event({ subject: d, type: 'newsletter', granted: false, decision: 'withdrawn', brand: 'rauc', source: 'owner_manual' });
  let p = provider(); let out = await mailerliteProcessor({ ...f, fetchImpl: p.fetchImpl }).process();
  assert.equal(out.processed[0].outcome, 'delivered', 'RAUC withdrawal is not an aimanjack.com unsubscribe');
  // Another person: aimanjack unticked latest, then a RAUC grant — must not make them eligible here.
  const g = await scoped(t); await g.enable();
  const o = subject('other@example.test');
  await g.intake(true, 'other@example.test'); await g.intake(false, 'other@example.test');
  await g.event({ subject: o, type: 'newsletter', granted: true, decision: 'granted', brand: 'rauc', source: 'owner_manual' });
  p = provider(); out = await mailerliteProcessor({ ...g, fetchImpl: p.fetchImpl }).process();
  assert.equal(out.processed[0].outcome, 'cancelled');
  assert.equal(out.processed[0].code, 'latest_consent_not_granted');
  assert.equal(p.calls.filter((c) => c.method === 'POST').length, 0);
  // And a RAUC grant never enqueues aimanjack.com enrollment.
  assert.equal((await g.rows(`select count(*)::int n from revenue.mailerlite_sync_events e join revenue.consent_events c on c.event_id=e.consent_event_id where c.brand<>'aimanjack'`))[0].n, 0);
});

test('T13: after erasure, an identical resubmission and replayed provider events revive nothing', async (t) => {
  const f = await scoped(t); await f.enable();
  const d = subject('dana@example.test');
  await f.intake(true);
  await f.rows('select revenue.erase_subject($1)', [d]);
  assert.equal((await f.rows('select count(*)::int n from revenue.intake_receipts'))[0].n, 0, 'personal data gone');
  assert.equal((await f.rows('select count(*)::int n from revenue.mailerlite_sync_events'))[0].n, 0, 'queued work cascaded away');
  // The exact same request again (same person, same day → same dedupe key): refused, nothing stored, nothing queued.
  await assert.rejects(f.intake(true), /erased_replay/);
  assert.equal((await f.rows('select count(*)::int n from revenue.intake_receipts'))[0].n, 0, 'personal data not recreated');
  assert.equal((await f.rows('select count(*)::int n from revenue.mailerlite_sync_events'))[0].n, 0);
  const guards = await f.rows('select * from revenue.erasure_replay_guards');
  assert.equal(guards.length, 1); assert.ok(!JSON.stringify(guards).includes('@'), 'the guard holds only keyed hashes');
  // Replayed provider events dated before the erasure, and a new quote on another day: still no enrollment.
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'provider_webhook', source_at: '2026-10-01T00:00:00Z' });
  await f.event({ subject: d, type: 'kit_sequence', granted: true, decision: 'granted', source: 'provider_webhook' });
  await f.intake(true, 'dana@example.test', 'dana@example.test|another-day');
  await bothSay(f, d, 'aimanjack', 'newsletter', 'erased');
  await bothSay(f, d, 'aimanjack', 'kit_sequence', 'erased');
  assert.equal((await f.rows('select count(*)::int n from revenue.mailerlite_sync_events'))[0].n, 0, 'erased identity is not queued');
  let p = provider(); await mailerliteProcessor({ ...f, fetchImpl: p.fetchImpl }).process();
  assert.equal(p.calls.filter((c) => c.method === 'POST').length, 0, 'no DOI or subscription call');
  assert.ok((await f.ledger(d)).every((r) => !('payload' in r)), 'the ledger holds no personal fields');
  // Only an owner-reviewed recovery reopens the scope; later opt-ins then count again.
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'owner_manual' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'granted');
  await bothSay(f, d, 'aimanjack', 'kit_sequence', 'erased');   // recovery is per purpose
  await f.intake(true, 'dana@example.test', 'dana@example.test|third-day');
  p = provider(); const out = await mailerliteProcessor({ ...f, fetchImpl: p.fetchImpl }).process();
  assert.equal(out.processed[0].outcome, 'delivered', 'after recovery the normal DOI path applies');
  // A provider deletion tombstone still wins over everything.
  await f.rows(`insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason) values($1,'42','deleted','deleted') on conflict do nothing`, [d]);
  await bothSay(f, d, 'aimanjack', 'newsletter', 'suppressed');
});

test('T13: erasure timing — events at or before the latest erasure are void, even if received later', async (t) => {
  const f = await scoped(t);
  const d = subject('fresh@example.test');
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', at: '2026-10-01T00:00:00Z' });
  const erase = (at) => f.rows(`insert into revenue.consent_events (subject_email_hash, consent_type, granted, source, occurred_at) values ($1,'erasure',false,'dsar_erasure',$2)`, [d, at]);
  await erase('2026-10-02T00:00:00Z');
  await bothSay(f, d, 'aimanjack', 'newsletter', 'erased');
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'owner_manual', source_at: '2026-10-01T12:00:00Z', at: '2026-10-03T00:00:00Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'erased');   // an owner record dated before the erasure is a replay too
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'kit_form', at: '2026-10-04T00:00:00Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'erased');   // a form opt-in alone does not reopen an erased identity
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'owner_manual', at: '2026-10-05T00:00:00Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'granted');
  await erase('2026-10-06T00:00:00Z');                          // a second erasure closes it again
  await bothSay(f, d, 'aimanjack', 'newsletter', 'erased');
  await f.event({ subject: d, type: 'newsletter', granted: false, decision: 'withdrawn', source: 'provider_webhook', at: '2026-10-07T00:00:00Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'withdrawn');  // withdrawals always count
  // Erasure with no other events: every brand and purpose reads as erased, and nothing is allowed.
  const lone = subject('lone@example.test');
  await f.rows(`insert into revenue.consent_events (subject_email_hash, consent_type, granted, source) values ($1,'erasure',false,'dsar_erasure')`, [lone]);
  for (const [brand, purpose] of [['aimanjack', 'newsletter'], ['aimanjack', 'kit_sequence'], ['rauc', 'newsletter'], ['aimanjack', 'transactional']])
    await bothSay(f, lone, brand, purpose, 'erased');
});

test('ordering: ties, clock skew and sub-millisecond timestamps resolve the same way in SQL and JavaScript', async (t) => {
  const f = await scoped(t);
  // Equal times: the withdrawal wins whichever arrives last.
  const a = subject('tie-a@example.test'), b = subject('tie-b@example.test');
  await f.event({ subject: a, type: 'newsletter', granted: false, decision: 'withdrawn', source_at: '2026-10-05T09:00:00Z', at: '2026-10-05T09:00:01Z' });
  await f.event({ subject: a, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-05T09:00:00Z', at: '2026-10-05T09:00:02Z' });
  await bothSay(f, a, 'aimanjack', 'newsletter', 'withdrawn');
  await f.event({ subject: b, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-05T09:00:00Z', at: '2026-10-05T09:00:01Z' });
  await f.event({ subject: b, type: 'newsletter', granted: false, decision: 'withdrawn', source_at: '2026-10-05T09:00:00Z', at: '2026-10-05T09:00:02Z' });
  await bothSay(f, b, 'aimanjack', 'newsletter', 'withdrawn');
  // A source clock running 4 minutes ahead (allowed by the check) cannot beat a later withdrawal: it is clamped to receipt.
  const c = subject('skew@example.test');
  await f.event({ subject: c, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-05T10:04:00Z', at: '2026-10-05T10:00:00Z' });
  await f.event({ subject: c, type: 'newsletter', granted: false, decision: 'withdrawn', source_at: '2026-10-05T10:02:00Z', at: '2026-10-05T10:02:00Z' });
  await bothSay(f, c, 'aimanjack', 'newsletter', 'withdrawn');
  // Sub-millisecond digits never decide (reported by review): withdrawal at .000900 vs older grant at .000100 → same ms → withdrawal.
  const m = subject('micro@example.test');
  await f.event({ subject: m, type: 'newsletter', granted: false, decision: 'withdrawn', source_at: '2026-10-05T10:00:00.000900Z', at: '2026-10-05T10:00:01Z' });
  await f.event({ subject: m, type: 'newsletter', granted: true, decision: 'granted', source_at: '2026-10-05T10:00:00.000100Z', at: '2026-10-05T10:00:02Z' });
  await bothSay(f, m, 'aimanjack', 'newsletter', 'withdrawn');
  // Erasure at .000100 then consent at .000900 of the same millisecond: not after the erasure → erased in both.
  const n = subject('micro-erase@example.test');
  await f.event({ subject: n, type: 'newsletter', granted: true, decision: 'granted', at: '2026-10-05T09:00:00Z' });
  await f.rows(`insert into revenue.consent_events (subject_email_hash, consent_type, granted, source, occurred_at) values ($1,'erasure',false,'dsar_erasure','2026-10-05T10:00:00.000100Z')`, [n]);
  await f.event({ subject: n, type: 'newsletter', granted: true, decision: 'granted', source: 'owner_manual', at: '2026-10-05T10:00:00.000900Z' });
  await bothSay(f, n, 'aimanjack', 'newsletter', 'erased');
});

test('ordering: a provider clock running behind cannot hide a withdrawal; malformed rows fail closed in JavaScript', async (t) => {
  const f = await scoped(t);
  const d = subject('lag@example.test');
  await f.event({ subject: d, type: 'newsletter', granted: true, decision: 'granted', source: 'quote_form', at: '2026-10-05T10:00:10Z' });
  // The unsubscribe really happened after the opt-in, but the provider stamps it 10 s earlier than our clock.
  await f.event({ subject: d, type: 'newsletter', granted: false, decision: 'withdrawn', source: 'provider_webhook', source_at: '2026-10-05T10:00:00Z', at: '2026-10-05T10:00:20Z' });
  await bothSay(f, d, 'aimanjack', 'newsletter', 'withdrawn');
  const base = { event_id: 1, subject_email_hash: d, consent_type: 'newsletter', brand: 'aimanjack', channel: 'email', occurred_at: '2026-10-05T10:00:00Z' };
  const scope = { subject: d, brand: 'aimanjack', purpose: 'newsletter' };
  for (const bad of [{ granted: true, source_occurred_at: '2026-10-05T10:06:00Z' }, { granted: false, decision: 'granted' }, { granted: true, decision: 'maybe' },
    { granted: true, occurred_at: null }, { granted: true, occurred_at: 'not a date' }]) {
    assert.throws(() => effectiveState([{ ...base, ...bad }], scope), /invalid_consent_event/);
    assert.equal(allowsMarketing([{ ...base, ...bad }], scope), false);
  }
  assert.equal(allowsMarketing([{ ...base, granted: true }], scope), true);
  assert.equal(allowsMarketing([{ ...base, granted: true }, { ...base, consent_type: 'erasure', granted: false, occurred_at: null }], scope), false);
});

test('identity binding: JavaScript and SQL both refuse a missing identity and ignore other people’s rows', async (t) => {
  const f = await scoped(t);
  await f.event({ subject: null, type: 'newsletter', granted: true, decision: 'granted' });
  const orphan = await f.rows('select * from revenue.consent_events where subject_email_hash is null');
  assert.equal(orphan.length, 1);
  assert.equal(allowsMarketing(orphan, { subject: null, brand: 'aimanjack', purpose: 'newsletter' }), false);
  assert.equal(allowsMarketing(orphan, { brand: 'aimanjack', purpose: 'newsletter' }), false);
  assert.equal((await f.rows('select revenue.consent_allows(null,$1,$2,$3) as ok', ['aimanjack', 'email', 'newsletter']))[0].ok, false);
  assert.equal((await f.rows('select count(*)::int n from revenue.consent_effective where subject_email_hash is null'))[0].n, 0);
  const x = subject('x@example.test'), y = subject('y@example.test');
  await f.event({ subject: y, type: 'newsletter', granted: true, decision: 'granted' });
  const all = await f.rows('select * from revenue.consent_events');
  assert.equal(allowsMarketing(all, { subject: x, brand: 'aimanjack', purpose: 'newsletter' }), false, 'another person’s grant never counts');
  assert.equal(allowsMarketing(all, { subject: y, brand: 'aimanjack', purpose: 'newsletter' }), true);
});

test('a marketing tombstone suppresses only marketing purposes, not request handling or transactional notices', async (t) => {
  const f = await scoped(t);
  const d = subject('tx@example.test');
  await f.rows(`insert into revenue.mailerlite_suppressions(identity_hash,subscriber_id,state,reason) values($1,'9','suppressed','unsubscribed')`, [d]);
  for (const purpose of ['request_contact', 'transactional', 'newsletter', 'kit_sequence'])
    await f.event({ subject: d, type: purpose, granted: true, decision: 'granted', source: 'owner_manual' });
  await bothSay(f, d, 'aimanjack', 'request_contact', 'granted');
  await bothSay(f, d, 'aimanjack', 'transactional', 'granted');
  await bothSay(f, d, 'aimanjack', 'newsletter', 'suppressed');
  await bothSay(f, d, 'aimanjack', 'kit_sequence', 'suppressed');
});

test('migration chain: production order (schema, intake, ROS outbox, MailerLite, consent scope) applies and erasure still cascades', async (t) => {
  const { PGlite } = await import('@electric-sql/pglite');
  const pg = new PGlite(); t.after(() => pg.close());
  await pg.exec('create role anon; create role authenticated; create role service_role bypassrls;');
  for (const file of ['db/schema.sql', 'db/migrations/2026-10-08-revenue-intake.sql', 'db/migrations/2026-10-11-ros-event-outbox.sql',
    'db/migrations/2026-10-16-mailerlite-quote-outbox.sql', 'db/migrations/2026-10-19-consent-scope.sql'])
    await pg.exec(await readFile(new URL('../' + file, import.meta.url), 'utf8'));
  const hash = subject('chain@example.test');
  const p = { dedupe_key: 'b'.repeat(64), form_version: 'intake-test', payload: { email: 'chain@example.test' }, consent_request: true,
    consent_newsletter: true, consent_notice_version: 'notice-test', subject_email_hash: hash };
  const r = (await pg.query('select revenue.record_intake($1::jsonb,$2::jsonb) as r', [JSON.stringify(p), JSON.stringify([{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: true }])])).rows[0].r;
  assert.equal(r.deduped, false);
  assert.equal((await pg.query('select count(*)::int n from revenue.ros_events')).rows[0].n, 1, 'ROS capture still works (and stays unsent)');
  await pg.query('select revenue.erase_subject($1)', [hash]);
  assert.equal((await pg.query('select count(*)::int n from revenue.ros_events')).rows[0].n, 0, 'ROS rows cascade with the receipt');
  await assert.rejects(pg.query('select revenue.record_intake($1::jsonb,$2::jsonb)', [JSON.stringify(p), '[]']), /erased_replay/);
  assert.equal((await pg.query(`select state from revenue.consent_effective where subject_email_hash=$1 and purpose='newsletter'`, [hash])).rows[0].state, 'erased');
});

test('T14: suppression callbacks — valid single and batch persist; changed byte, missing/invalid signature and oversize write nothing', async (t) => {
  const f = await scoped(t);
  const sign = (body) => createHmac('sha256', f.env.MAILERLITE_WEBHOOK_SECRET).update(body).digest('hex');
  const req = (body, signature = sign(body)) => new Request('https://aimanjack.com/v1/mailerlite/webhook',
    { method: 'POST', headers: { 'content-type': 'application/json', ...(signature === null ? {} : { signature }) }, body });
  const count = async () => (await f.rows('select (select count(*) from revenue.mailerlite_suppressions)::int + (select count(*) from revenue.mailerlite_webhook_receipts)::int as n'))[0].n;
  const one = JSON.stringify({ id: '41', email: 'one@example.test', status: 'unsubscribed', event: 'subscriber.unsubscribed' });
  const batch = JSON.stringify({ events: [{ type: 'subscriber.deleted', subscriber: { id: '42', email: 'two@example.test', status: 'active', deleted_at: '2026-10-16T10:00:00Z' } },
    { type: 'subscriber.bounced', subscriber: { id: '43', email: 'three@example.test', status: 'active' } }], total: 2 });
  const tampered = batch.replace('two@example.test', 'twx@example.test');
  for (const [body, signature, status] of [[tampered, sign(batch), 401], [one, null, 401], [one, '0'.repeat(64), 401], ['x'.repeat(262144), undefined, 413]]) {
    const res = await mailerliteWebhook({ ...f, req: req(body, signature === undefined ? sign(body) : signature) });
    assert.equal(res.status, status);
  }
  assert.equal(await count(), 0, 'no invalid or oversized callback wrote anything');
  assert.equal((await mailerliteWebhook({ ...f, req: req(one) })).status, 200);
  assert.equal((await mailerliteWebhook({ ...f, req: req(batch) })).status, 200);
  const rows = await f.rows('select identity_hash, state from revenue.mailerlite_suppressions order by subscriber_id');
  assert.deepEqual(rows.map((r) => r.state), ['suppressed', 'deleted', 'suppressed'], 'batched deletion handled');
  assert.equal(rows[1].identity_hash, subject('two@example.test'));
  await bothSay(f, subject('two@example.test'), 'aimanjack', 'newsletter', 'suppressed');   // tombstone alone decides
  await bothSay(f, subject('two@example.test'), 'aimanjack', 'kit_sequence', 'suppressed');
  await bothSay(f, subject('two@example.test'), 'aimanjack', 'request_contact', 'none');    // not a marketing purpose
  await f.event({ subject: subject('two@example.test'), type: 'newsletter', granted: true, decision: 'granted' });
  await bothSay(f, subject('two@example.test'), 'aimanjack', 'newsletter', 'suppressed');
});

test('T15: the server does not trust the browser for consent or its notice version (persisted through the real SQL)', async (t) => {
  const env = { SITE_ENV: 'production', SUPABASE_URL: 'https://db.test', SB_SECRET_KEY: 'k', SITE_ORIGIN: 'https://aimanjack.com',
    OWNER_EMAIL: 'jack@aimanjack.com', EMAIL_HASH_SECRET: 'h'.repeat(32), IP_HASH_SALT: 's'.repeat(32) };
  const db = await scoped(t);
  const records = [], original = globalThis.fetch;
  t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async (url, options = {}) => {
    url = String(url);
    if (url.endsWith('/rpc/take_intake_rate_limit')) return Response.json(true);
    if (url.endsWith('/rpc/record_intake')) {   // PostgREST stand-in: the real function on PGlite
      const { p, p_consents } = JSON.parse(options.body); records.push({ p, p_consents });
      return Response.json((await db.rows('select revenue.record_intake($1::jsonb,$2::jsonb) as r', [JSON.stringify(p), JSON.stringify(p_consents)]))[0].r);
    }
    if (url.includes('/rest/v1/')) return Response.json([]);
    throw Error('unexpected fetch ' + url);
  };
  const body = (over) => ({ kind: 'quick', name: 'Dana Test', email: 'dana@example.test', consent_request: true, lang: 'en', fill_ms: '9000',
    form_version: 'intake-2026-10-17', consent_notice_version: 'privacy-2099-forged', ...over });
  const post = async (b) => {
    const jobs = [], res = await onRequest({ request: new Request('https://aimanjack.com/v1/intake', { method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://aimanjack.com', 'cf-connecting-ip': '203.0.113.9' }, body: JSON.stringify(b) }),
      env, params: { route: ['intake'] }, waitUntil: (p) => jobs.push(p) });
    await Promise.allSettled(jobs); return res;
  };
  // Browser `required` removed: missing or falsy request consent is refused before any database call.
  for (const over of [{ consent_request: undefined }, { consent_request: false }, { consent_request: 'no' }, { consent_request: 'granted' }]) {
    const res = await post(body(over));
    assert.equal(res.status, 400); assert.equal((await res.json()).error, 'consent_required');
  }
  assert.equal(records.length, 0);
  // A forged notice version is ignored: the stored version is the server's approved constant.
  assert.equal((await post(body({ consent_newsletter: 'yes' }))).status, 201);
  assert.equal(records[0].p.consent_notice_version, CONSENT_NOTICE_VERSION);
  assert.ok(!JSON.stringify(records[0]).includes('privacy-2099-forged'));
  assert.deepEqual(records[0].p_consents, [{ consent_type: 'request_contact', granted: true }, { consent_type: 'newsletter', granted: true }]);
  const stored = await db.rows('select consent_type, granted, notice_version, brand, channel, source from revenue.consent_events order by event_id');
  assert.deepEqual(stored.map((r) => [r.consent_type, r.granted, r.notice_version, r.brand, r.channel, r.source]), [
    ['request_contact', true, CONSENT_NOTICE_VERSION, 'aimanjack', 'email', 'quote_form'], ['newsletter', true, CONSENT_NOTICE_VERSION, 'aimanjack', 'email', 'quote_form']]);
  assert.equal((await db.rows('select consent_notice_version from revenue.intake_receipts'))[0].consent_notice_version, CONSENT_NOTICE_VERSION);
  // src/consent.mjs states the same rule (used by later PRs); it must agree with the live API.
  assert.deepEqual(quoteConsents(body({ consent_newsletter: 'yes' }), CONSENT_NOTICE_VERSION).events, records[0].p_consents);
  assert.equal(quoteConsents(body({ consent_request: undefined }), CONSENT_NOTICE_VERSION).ok, false);
  assert.equal(quoteConsents(body({}), CONSENT_NOTICE_VERSION).notice_version, CONSENT_NOTICE_VERSION);
});

test('migration: the two redefined MailerLite functions differ from 2026-10-16 only by the added brand and erasure guards', async () => {
  const lf = async (u) => (await readFile(u, 'utf8')).replace(/\r\n/g, '\n');
  const before = await lf(new URL('../db/migrations/2026-10-16-mailerlite-quote-outbox.sql', import.meta.url)), after = await lf(MIGRATION);
  const body = (src, name) => { const i = src.indexOf(`create or replace function revenue.${name}(`); return src.slice(i, src.indexOf('end $$;', i) + 7); };
  const strip = (s) => s.split('\n').filter((l) => !l.includes('2026-10-19 (D3)') && !l.includes("new.brand<>'aimanjack'") && !l.includes('revenue.consent_state(')).join('\n')
    .replace(" and ((c.consent_type='newsletter' and c.brand='aimanjack' and c.channel='email') or c.consent_type='erasure')", " and c.consent_type in('newsletter','erasure')")
    .replace(" or coalesce(latest.decision,'granted')<>'granted'", '');
  for (const name of ['mailerlite_capture_consent', 'mailerlite_context']) assert.equal(strip(body(after, name)), body(before, name), name);
  assert.match(after, /^-- 2026-10-19 PR01/); assert.match(after, /NOT APPLIED/);
  assert.doesNotMatch(after, /\bupdate revenue\.consent_events\b|\bdelete from revenue\.consent_events\b/i, 'no backfill of the append-only ledger');
});

test('migration: all existing MailerLite adapter tests still pass on the consent-scope schema', () => {
  const file = fileURLToPath(new URL('./mailerlite.test.mjs', import.meta.url));
  const { NODE_TEST_CONTEXT, ...parent } = process.env;   // run as an independent test process, not a child of this runner
  const run = spawnSync(process.execPath, ['--test', '--test-reporter=tap', file], { env: { ...parent, CONSENT_SCOPE_MIGRATION: '1' }, encoding: 'utf8', timeout: 240000 });
  assert.equal(run.status, 0, run.stdout.split('\n').filter((l) => /not ok|fail/.test(l)).join('\n'));
  assert.match(run.stdout, /# fail 0/);
  assert.match(run.stdout, /# pass [1-9]/);
});

test('migration: new objects are reachable only as intended (service_role may call the two gates; nothing else is exposed)', async (t) => {
  const f = await scoped(t);
  const can = async (role, fn) => (await f.rows(`select has_function_privilege('${role}', '${fn}', 'execute') as ok`))[0].ok;
  for (const role of ['anon', 'authenticated']) for (const fn of ['revenue.consent_allows(text,text,text,text)', 'revenue.consent_state(text,text,text,text)'])
    assert.equal(await can(role, fn), false, `${role} ${fn}`);
  assert.equal(await can('service_role', 'revenue.consent_allows(text,text,text,text)'), true);
  assert.equal(await can('service_role', 'revenue.consent_state(text,text,text,text)'), true);
  for (const fn of ['revenue.intake_receipts_keep_replay_guard()', 'revenue.intake_receipts_refuse_replay()', 'revenue.mailerlite_capture_consent()'])
    assert.equal(await can('service_role', fn), false, fn);
  for (const role of ['anon', 'authenticated', 'service_role']) for (const rel of ['revenue.consent_effective', 'revenue.erasure_replay_guards'])
    assert.equal((await f.rows(`select has_table_privilege('${role}', '${rel}', 'select') as ok`))[0].ok, false, `${role} ${rel}`);
  assert.equal((await f.rows(`select relrowsecurity from pg_class where oid = 'revenue.erasure_replay_guards'::regclass`))[0].relrowsecurity, true);
});
