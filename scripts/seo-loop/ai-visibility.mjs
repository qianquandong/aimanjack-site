#!/usr/bin/env node
// Weekly AI-answer visibility sample (2026-10-19). Asks the frozen prompt set in state/seo/ai-prompts.json `runs` times each on
// Perplexity Sonar (the API that returns real web citations) and records, per prompt, the share of runs that MENTION the brand
// and the share that CITE aimanjack.com, with a 95% Wilson interval. Never a "position": AI answer lists rarely repeat.
// Logic borrowed from Auriti-Labs/geo-optimizer-skill (citations.py). The API answer is not identical to what people see in the
// Perplexity app; treat the trend, not the absolute number.
//
//   PERPLEXITY_API_KEY=… node scripts/seo-loop/ai-visibility.mjs [--data .seo-data] [--date YYYY-MM-DD]
// Without a key it exits 0 and says so.
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { wilson } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const data = arg('--data', '.seo-data'), date = arg('--date', new Date().toISOString().slice(0, 10));
const key = process.env.PERPLEXITY_API_KEY;
if (!key) { console.log('::notice::ai-visibility: no PERPLEXITY_API_KEY; skipped'); process.exit(0); }

const set = JSON.parse(readFileSync('state/seo/ai-prompts.json', 'utf8'));
const brandRe = new RegExp(set.brand.map((b) => b.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i');

async function ask(text) {
  const r = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'sonar', messages: [{ role: 'user', content: text }] }),
  });
  if (!r.ok) throw new Error(`Perplexity HTTP ${r.status}`);
  const j = await r.json();
  const answer = j.choices?.[0]?.message?.content || '';
  const urls = [...(j.citations || []), ...(j.search_results || []).map((s) => s.url)].filter(Boolean);
  return { mentioned: brandRe.test(answer), cited: urls.some((u) => u.includes(set.domain)), urls: [...new Set(urls)].slice(0, 10) };
}

const results = [];
for (const p of set.prompts) {
  const runs = [];
  for (let i = 0; i < set.runs; i++) {
    try { runs.push(await ask(p.text)); } catch (e) { runs.push({ error: String(e.message) }); }
  }
  const ok = runs.filter((r) => !r.error), m = ok.filter((r) => r.mentioned).length, c = ok.filter((r) => r.cited).length;
  results.push({ id: p.id, kind: p.kind, prompt: p.text, runs: ok.length, errors: runs.length - ok.length, mentioned: m, cited: c,
    mention_rate: ok.length ? +(m / ok.length).toFixed(2) : null, mention_ci: wilson(m, ok.length),
    cite_rate: ok.length ? +(c / ok.length).toFixed(2) : null, cite_ci: wilson(c, ok.length),
    top_sources: Object.entries(ok.flatMap((r) => r.urls.map((u) => new URL(u).hostname))
      .reduce((a, h) => ((a[h] = (a[h] || 0) + 1), a), {})).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([h]) => h) });
}
const core = results.filter((r) => r.kind === 'core'), runsN = core.reduce((a, r) => a + r.runs, 0);
const ctrlBrand = results.find((r) => r.kind === 'control-brand'), ctrlOff = results.find((r) => r.kind === 'control-unrelated');
const out = {
  date, engine: 'perplexity-sonar', prompt_set: set.version, runs_per_prompt: set.runs,
  core: { runs: runsN, mention_rate: runsN ? +(core.reduce((a, r) => a + r.mentioned, 0) / runsN).toFixed(2) : null, cite_rate: runsN ? +(core.reduce((a, r) => a + r.cited, 0) / runsN).toFixed(2) : null },
  // If the brand prompt stops finding us, or the unrelated prompt starts "finding" us, the measurement is off, not the site.
  measurement_ok: !!ctrlBrand?.mentioned && !ctrlOff?.mentioned,
  results,
};
mkdirSync(join(data, 'ai-visibility'), { recursive: true });
writeFileSync(join(data, 'ai-visibility', `${date}.json`), JSON.stringify(out, null, 1) + '\n');
console.log(`ai-visibility: core mention rate ${out.core.mention_rate}, cite rate ${out.core.cite_rate} over ${runsN} runs; measurement ${out.measurement_ok ? 'ok' : 'CHECK CONTROLS'}`);
