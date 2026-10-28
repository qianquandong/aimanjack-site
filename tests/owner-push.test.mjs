import test from 'node:test';
import assert from 'node:assert/strict';
import { ownerPush, ownerPushPayload, suggestedReply, BOOKING_LINK } from '../src/owner-push.mjs';

const full = { name: 'Dana Smith', email: 'dana@acme-drilling.com', company: 'Acme Drilling', format: 'On-site', attendees: 12,
  timing: 'Next month', workflows: 'Call me at 214-555-0100 about quoting', lang: 'en' };
const quick = { kind: 'quick', name: 'Lee', email: 'lee@gmail.com', tool: 'chatgpt', attendees: 3, workflows: 'secret plans', lang: 'en' };

test('push payload names the company and group size, never the person, email or free text', () => {
  const p = ownerPushPayload('topic-x', full, { quick: false, companyDomain: 'acme-drilling.com' });
  assert.equal(p.topic, 'topic-x');
  assert.equal(p.title, '新询价：Acme Drilling');
  assert.match(p.message, /12 人 · On-site · Next month/);
  assert.equal(p.priority, 5);
  const all = JSON.stringify(p);
  for (const secret of ['Dana', 'dana@', '214-555', 'quoting']) assert.ok(!all.includes(secret), `push leaks ${secret}`);
  const q = JSON.stringify(ownerPushPayload('t', quick, { quick: true, companyDomain: 'gmail.com' }));
  for (const secret of ['Lee', 'lee@', 'secret plans']) assert.ok(!q.includes(secret), `quick push leaks ${secret}`);
  assert.match(q, /新询价：gmail\.com/);
});

test('no NTFY_TOPIC means no push and no network call', async (t) => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  globalThis.fetch = async () => { throw new Error('should not fetch'); };
  await ownerPush({}, full, { quick: false, companyDomain: 'acme-drilling.com' });
  await ownerPush({ NTFY_TOPIC: '  ' }, full, { quick: false, companyDomain: 'acme-drilling.com' });
});

test('with NTFY_TOPIC the push is one JSON POST to ntfy, and a refused push throws', async (t) => {
  const original = globalThis.fetch; t.after(() => { globalThis.fetch = original; });
  const calls = [];
  globalThis.fetch = async (url, o) => { calls.push([url, o]); return new Response('{}', { status: calls.length === 1 ? 200 : 429 }); };
  await ownerPush({ NTFY_TOPIC: 'abc' }, full, { quick: false, companyDomain: 'acme-drilling.com' });
  assert.equal(calls[0][0], 'https://ntfy.sh/');
  assert.equal(calls[0][1].method, 'POST');
  assert.equal(JSON.parse(calls[0][1].body).topic, 'abc');
  await assert.rejects(ownerPush({ NTFY_TOPIC: 'abc' }, full, { quick: false, companyDomain: 'acme-drilling.com' }), /owner push/);
});

test('suggested reply: first name, company, the booking link, no price', () => {
  const en = suggestedReply(full, { quick: false });
  assert.match(en, /^Hi Dana,/);
  assert.match(en, /AI training for Acme Drilling \(12 people\)/);
  assert.ok(en.includes(BOOKING_LINK));
  assert.ok(!en.includes('$'));
  assert.match(suggestedReply({ ...quick, name: '' }, { quick: true }), /^Hi there,[\s\S]*your team \(3 people\)/);
  const zh = suggestedReply({ ...full, name: '王 小明', lang: 'zh' }, { quick: false });
  assert.match(zh, /^王，你好！/);
  assert.ok(zh.includes(BOOKING_LINK));
});
