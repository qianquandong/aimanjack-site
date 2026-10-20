# SEO loop (2026-10-19)

The weekly SEO routine used to publish without ever measuring afterwards. This loop closes it: **code measures and ranks,
Claude proposes, Jack approves page edits, every change is logged and scored at 14 and 28 days.**

```
daily   GitHub Actions  seo-loop-data.yml   pull GSC → score due changes → rank opportunities   → branch seo-data
Sunday  GitHub Actions  seo-loop-data.yml   AI-answer visibility sample (Perplexity, if key)    → branch seo-data
Monday  Claude routine  reads seo-data      ≤3 page edits + ledger lines → PR seo/onpage-DATE   → Jack merges → seo-onpage.yml deploys
Thursday Claude routine new post (unchanged) + a new-post ledger line → seo/weekly-DATE           → autopublish (no review)
```

## Files

| Path | What |
|---|---|
| `state/seo/targets.json` | The 20 target keywords Jack approved, each with one owner page and match words |
| `state/seo/changes.jsonl` | Append-only change ledger. One line per change: id, url, type, old/new, targets, hypothesis. No `shipped` field on new lines: the ship date is the day the line reached production (`git log -S`) |
| `state/seo/ai-prompts.json` | Frozen AI-visibility prompt set (bump `version` to change it) |
| `scripts/seo-loop/collect-gsc.py` | Daily page and page×query rows per day (read-only service account; `GSC_SA_JSON` secret) |
| `scripts/seo-loop/score.mjs` | 14/28-day verdicts vs unchanged pages as control → `seo-data:verdicts.jsonl` |
| `scripts/seo-loop/opportunities.mjs` | Target status (wrong page / striking / page one / not seen) + candidates (striking distance, low CTR, decay, cannibalization), 28-day cooldown → `seo-data:opportunities/DATE.{json,md}` |
| `scripts/seo-loop/ai-visibility.mjs` | Mention and citation rate per prompt over N runs, Wilson interval, two control prompts |
| `scripts/seo-loop/check-change.mjs` | Gate for `seo/onpage-*` PRs: allowlist, ledger rules, ≤3 changes, cooldown, title/description lengths |
| `scripts/seo-autopublish-gate.mjs` | Unattended branches may change posts and append `new-post` ledger lines; page modules only on `*-approved` branches |

## Rules worth knowing

- **One change per page, then 28 days of quiet.** At ~12 impressions a day a verdict is directional, not proof. `insufficient-data` is a normal answer.
- **Control group = every page the change did not touch.** A Google update or a quiet week moves the control too.
- **Data never goes to production.** `production` is what Cloudflare serves; queries stay on the `seo-data` branch.
- **Reverts** are ordinary on-page changes with `type: "revert"` (exempt from the cooldown).
- Sources for the method: FutureSearch self-optimizing SEO pipeline; Google's gen-AI content guidance (2026-10-01: fact-check AI titles/descriptions before publishing); elmohq/elmo and coreyhaines31/marketingskills (AI-visibility measurement); Auriti-Labs/geo-optimizer-skill (citation sampling).

## Jack's switches

- Secrets: `GSC_SA_JSON` (required for any data), `PERPLEXITY_API_KEY` (optional, AI visibility).
- First run: Actions → SEO loop data → Run workflow → backfill `90`.
- Pause page deploys: repository variable `SEO_ONPAGE_DEPLOY_ENABLED=false`. Pause posts: `SEO_AUTOPUBLISH_ENABLED=false`.
- Routine prompt: `docs/seo-loop-routine-prompt.md` (the live copy is in the claude.ai routine `trig_016KE4toQoBysY6E98ZFHc4W`).
