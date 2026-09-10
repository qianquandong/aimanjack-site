#!/usr/bin/env node
// Aggregate demo-line (469) 517-2968 inbound calls from Twilio for the case study page.
//   node scripts/demo-line-stats.mjs 2026-10          # one calendar month (America/Chicago)
// Needs the Twilio CLI logged in (profile car-sms-agent). Prints aggregates only — never caller numbers.
import { execFileSync } from 'node:child_process';

const month = process.argv[2] ?? new Date().toISOString().slice(0, 7);
const [y, m] = month.split('-').map(Number);
const after = new Date(Date.UTC(y, m - 1, 1, 5)).toISOString();        // 00:00 CT ≈ 05:00Z (close enough for a monthly rollup)
const before = new Date(Date.UTC(y, m, 1, 5)).toISOString();
const raw = execFileSync('twilio', ['api:core:calls:list', '--to', '+14695172968', '--start-time-after', after, '--start-time-before', before, '--page-size', '1000', '--no-limit', '-o', 'json'], { encoding: 'utf8' });
const calls = JSON.parse(raw || '[]').filter((c) => c.direction === 'inbound');

const tz = { timeZone: 'America/Chicago' };
const count = (arr, f) => arr.reduce((o, c) => { const k = f(c); o[k] = (o[k] || 0) + 1; return o; }, {});
const secs = calls.map((c) => +c.duration || 0);
const out = {
  month, inbound_calls: calls.length, unique_callers: new Set(calls.map((c) => c.from)).size,
  total_minutes: +(secs.reduce((a, b) => a + b, 0) / 60).toFixed(1),
  answered_10s_plus: calls.filter((c) => c.status === 'completed' && (+c.duration || 0) >= 10).length,
  status: count(calls, (c) => c.status),
  by_hour_ct: count(calls, (c) => new Date(c.startTime).toLocaleString('en-US', { ...tz, hour: 'numeric', hour12: false })),
  by_weekday: count(calls, (c) => new Date(c.startTime).toLocaleDateString('en-US', { ...tz, weekday: 'short' })),
  median_seconds: secs.sort((a, b) => a - b)[Math.floor(secs.length / 2)] ?? 0,
};
console.log(JSON.stringify(out, null, 1));
// ponytail: Twilio only knows the call happened; bookings and hand-offs come from the booking system's `events` table (BOOKING-PLAN.md §2).
