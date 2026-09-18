# Free SEMrush replacement for aimanjack.com

Pure-Python, zero-cost keyword research + cannibalization audit + Pexels image
search. Lives next to the site so we can run it on the same schedule as
deploys. No external paid APIs.

## Layout

```
scripts/seo-keyword-tool/
├── cli.py                       # entry: research / cluster / audit
├── common/                      # paths, cached HTTP client, tokenisation
│   ├── config.py
│   ├── http.py
│   └── text.py                  # jieba (optional) + zh/en slug helper
├── sources/                     # all free keyword / SERP / trends data
│   ├── google_autocomplete.py
│   ├── bing_suggest.py
│   ├── ddg_suggest.py
│   ├── baidu_suggest.py
│   ├── serp_analyzer.py
│   ├── google_trends.py
│   └── reddit.py
├── models/
│   ├── intent_classifier.py     # regex + optional local LLM (claude -p)
│   ├── keyword_difficulty.py    # SERP authority heuristic (0-100)
│   └── cluster.py               # TF-IDF single-link clustering
├── exporters/
│   └── csv_export.py            # CSV + cluster-map markdown
└── audit/
    └── cannibalization.py       # GSC CSV -> conflicts

scripts/pexels-search.py         # free Pexels API helper (200 req/h)
```

## Install

```bash
# zero pip install needed — urllib only. Optional:
python3 -m pip install --user jieba        # better zh tokenisation
```

Add the free Pexels key once to `.dev.vars`:

```
PEXELS_API_KEY=YOUR_FREE_KEY
```

(Grab one at https://www.pexels.com/api/. 200 req/h, 40 req/min.)

## Use

### 1. Keyword research

```bash
cd /Users/joseesp/aimanjack-site
python3 scripts/seo-keyword-tool/cli.py research \
  --root "ai 前台" \
  --lang zh \
  --limit 60 \
  --with-reddit \
  --out state/seo/keyword-research/zh-ai-front-desk.csv
```

Adds `--llm claude` if you want the local Claude CLI to reclassify the
keywords the regex wasn't sure about (uses your subscription, no API key).

### 2. Cluster into pillars + satellites

```bash
python3 scripts/seo-keyword-tool/cli.py cluster \
  --input state/seo/keyword-research/zh-ai-front-desk.csv \
  --out   state/seo/keyword-research/zh-ai-front-desk-clustered.csv \
  --map-out state/seo/topic-cluster-map-zh.md
```

### 3. Cannibalization audit

```bash
# 1. GSC -> Performance -> filter Pages+Queries -> Export CSV
# 2. Then:
python3 scripts/seo-keyword-tool/cli.py audit \
  --input ~/Downloads/gsc-export.csv \
  --out   state/seo/cannibalization-audit-$(date +%F).md
```

### 4. Pexels images

```bash
python3 scripts/pexels-search.py "ai receptionist answering phone" --count 5 --json
python3 scripts/pexels-search.py "ai 前台 接电话" --count 5 --lang zh-CN
```

Output: JSON manifest of the top N photos + cached JPEGs under
`scripts/pexels-cache/`.

## Output schemas

### `*.csv` (research + cluster)

| column | meaning |
|---|---|
| keyword | the candidate keyword |
| lang | en or zh |
| source | which free source it came from |
| kd | 0-100, heuristic from SERP top-10 authority |
| kd_label | very_easy / easy / medium / hard / very_hard |
| volume | 0-100, evidence-weighted composite (NOT absolute counts) |
| volume_evidence | unknown / weak / moderate / strong |
| intent | informational / commercial / transactional / navigational |
| cluster_slug | pillar slug (set by `cluster`) |
| cluster_label | pillar label (set by `cluster`) |
| pillar_url | target pillar URL (set by `cluster`) |
| target_url | per-keyword target URL (pillar or satellite) |
| priority | P0..P3 (P0 = strike now) |
| modifier | the expansion modifier that surfaced this keyword |

### `topic-cluster-map-*.md`

Pillars sorted by avg volume, with their satellites listed below each.

### `cannibalization-*.md`

Conflicts table with the owner page per query, plus count of conflicting
queries and pages.

### `pexels-search --json`

```json
{
  "query": "ai receptionist",
  "count": 5,
  "photos": [
    {
      "id": 12345,
      "url": "https://www.pexels.com/photo/...",
      "photographer": "...",
      "photographer_url": "...",
      "alt": "...",
      "src": {"original": "...", "large": "...", "medium": "...", "small": "..."},
      "cached_path": "scripts/pexels-cache/ai-receptionist-12345.jpg"
    }
  ]
}
```

## Triage rules (priority)

| priority | rule |
|---|---|
| P0 | KD ≤ 30, vol ≥ 40, commercial or transactional |
| P1 | KD ≤ 30, vol ≥ 25 |
| P2 | KD ≤ 50, vol ≥ 35 |
| P3 | everything else (including navigational) |

P0 + P1 should be the first 2-week content push.

## Knobs

- `--sources google_autocomplete,bing_suggest,ddg_suggest,baidu_suggest,reddit`
- `--no-trends` / `--no-serp` to skip those sources
- `--serp-limit N` to cap SERP fetches (default 40, ~0.4s each)
- `--llm claude` / `--llm haiku` for the optional intent reclassification pass

## Cost

- All keyword data: free, cache for 7 days, polite delays between requests.
- SERP fetches: free, ~0.4s each, capped at `--serp-limit`.
- Google Trends: free, rate-limited; stops on 429.
- Pexels: 200 req/h, 40 req/min.
- Optional LLM pass: uses local `claude -p` CLI (your subscription, no key).

No API keys. No third-party paid tools. No outbound cost.

## Why these defaults

- `KD ≤ 30` matches the Jono Catliff "steal this SEO" filter (keyword must be
  reachable by a brand-new site, not Wikipedia-class authority).
- `vol ≥ 40` is a conservative floor on the composite score to avoid
  long-tail noise. Tune in `exporters/csv_export.py:priority`.
- UGC discount (`keyword_difficulty.score_serp`) lowers KD when the top-10 is
  full of Reddit / Zhihu / Quora — those SERPs are beatable.
- `lang=zh` adds Baidu suggest + zh-specific modifiers automatically.