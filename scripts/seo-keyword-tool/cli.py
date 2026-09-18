#!/usr/bin/env python3
"""seo-keyword-tool — a free, local SEMrush stand-in for aimanjack.com.

  python3 cli.py research --root "ai 前台" --lang zh --limit 30
  python3 cli.py cluster  state/seo/keyword-research/ai-qiantai-zh-2026-09-16.csv
  python3 cli.py audit    ~/Downloads/gsc-page-query.csv
  python3 cli.py serp     "ai receptionist" --lang en          # debug one SERP + KD
  python3 cli.py pages                                          # list pages used for target_url

Stdlib only. Optional extras: jieba (better zh tokens), Pillow (webp for pexels-search.py).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import time
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent
if str(TOOL_DIR) not in sys.path:
    sys.path.insert(0, str(TOOL_DIR))

from common import config, http                                  # noqa: E402
from common.text import contains_root, dedupe_key, detect_lang, slugify, tokenize  # noqa: E402
from sources import Candidate                                    # noqa: E402
from sources import (baidu_suggest, bing_suggest, ddg_suggest,   # noqa: E402
                     google_autocomplete, google_trends, pexels_tags, reddit, serp_analyzer)
from models import cluster as cluster_mod                        # noqa: E402
from models import intent_classifier, keyword_difficulty, target_url, volume  # noqa: E402
from exporters import cluster_map_md, csv_export                 # noqa: E402
from audit import cannibalization                                # noqa: E402

SOURCES = {
    "zh": ["baidu", "bing", "google", "ddg", "trends"],
    "en": ["google", "bing", "ddg", "reddit", "trends"],
}
ALL_SOURCES = ["baidu", "bing", "google", "ddg", "reddit", "trends", "pexels"]


def log(msg: str) -> None:
    http.log(msg)


# ----------------------------------------------------------------------------- collect
def collect(root: str, lang: str, sources: list[str], *, depth: int, alpha: bool) -> list[Candidate]:
    cands: list[Candidate] = [Candidate(keyword=root, source="root", rank=0, modifier="")]
    for name in sources:
        t0 = time.time()
        got: list[Candidate] = []
        try:
            if name == "baidu":
                got = baidu_suggest.suggest(root, lang, alpha=alpha)
            elif name == "bing":
                got = bing_suggest.suggest(root, lang, alpha=alpha and lang == "en")
            elif name == "google":
                got = google_autocomplete.suggest(root, lang, depth=depth, alpha=alpha)
            elif name == "ddg":
                got = ddg_suggest.suggest(root, lang)
            elif name == "reddit":
                got = reddit.suggest(root, lang)
            elif name == "trends":
                geo = "" if lang == "zh" else "US"
                got = google_trends.related_queries(root, lang, geo=geo)
            elif name == "pexels":
                got = pexels_tags.suggest(root, lang)
        except Exception as e:  # noqa: BLE001 — a dead source must not kill the run
            log(f"  [{name}] failed: {e}")
        log(f"  [{name}] {len(got)} candidates ({time.time() - t0:.1f}s)")
        cands.extend(got)
    return cands


def merge(cands: list[Candidate], root: str, lang: str) -> list[dict]:
    """Dedupe candidates across sources; keep provenance; drop off-topic ones."""
    root_toks = set(tokenize(root, lang))
    merged: dict[str, dict] = {}
    for c in cands:
        kw = c.keyword.strip()
        if not kw:
            continue
        if lang == "zh" and detect_lang(kw) != "zh" and c.source != "root":
            continue
        if lang == "en" and detect_lang(kw) == "zh":
            continue
        k = dedupe_key(kw)
        if len(k) < 2 or len(kw) > 80:
            continue
        r = merged.get(k)
        if r is None:
            on_topic = contains_root(kw, root)
            overlap = len(root_toks & set(tokenize(kw, lang))) / (len(root_toks) or 1)
            if not on_topic and overlap < 0.5 and c.source != "root":
                continue
            r = merged[k] = {
                "keyword": kw, "sources": [], "best_rank": c.rank, "modifier": c.modifier,
                "trends_value": None, "on_topic": on_topic, "extra": {},
            }
        if c.source not in r["sources"]:
            r["sources"].append(c.source)
        if c.rank < r["best_rank"]:
            r["best_rank"] = c.rank
        if c.modifier == "" or (len(c.modifier) > 1 and len(r["modifier"]) == 1):
            r["modifier"] = c.modifier
        if c.source.startswith("trends") and c.extra.get("trends_value") is not None:
            r["trends_value"] = c.extra["trends_value"]
        if c.extra:
            r["extra"].update({k2: v for k2, v in c.extra.items() if k2 not in r["extra"]})
    return list(merged.values())


def prioritize(rows: list[dict], root: str, lang: str, limit: int) -> list[dict]:
    for r in rows:
        r["demand"] = volume.demand_score(r["sources"], r["best_rank"], r["modifier"], r["keyword"], lang, r["trends_value"])
        if "pexels_alt" in r["sources"] and len(r["sources"]) == 1:
            r["demand"] *= 0.3
    rows.sort(key=lambda r: (-r["demand"], len(r["keyword"])))
    return rows[:limit]


# ----------------------------------------------------------------------------- enrich
def enrich_serp(rows: list[dict], lang: str) -> None:
    for i, r in enumerate(rows, 1):
        serp = serp_analyzer.fetch(r["keyword"], lang)
        kd = keyword_difficulty.keyword_difficulty(serp)
        r.update({"kd": kd["kd"], "kd_label": keyword_difficulty.kd_label(kd["kd"]), "avg_da": kd["avg_da"],
                  "ugc_count": kd["ugc_count"], "serp_ok": serp.ok,
                  "serp_top_domains": [x.domain for x in serp.results[:5]],
                  "serp_features": sorted(serp.features.keys()),
                  "serp_total": serp.total_results})
        log(f"  [serp {i}/{len(rows)}] {r['keyword']} → KD {kd['kd']} ({kd['note'] if kd['kd'] < 0 else r['kd_label']})")


def enrich_trends(rows: list[dict], root: str, lang: str) -> None:
    """Relative interest keyword/root, 4 keywords + root per Trends call."""
    geo = "" if lang == "zh" else "US"
    others = [r for r in rows if dedupe_key(r["keyword"]) != dedupe_key(root)]
    for i in range(0, len(others), 4):
        batch = others[i:i + 4]
        kws = [root] + [r["keyword"] for r in batch]
        data = google_trends.interest(kws, lang, geo=geo)
        if not data:
            if google_trends._disabled:
                log("  [trends] stopped (rate limited); remaining volumes use the heuristic")
                return
            continue
        base = data.get(root, 0.0)
        for r in batch:
            v = data.get(r["keyword"])
            r["trends_rel"] = (v / base) if (base and v is not None) else None
            r["trends_abs"] = v


def enrich_volume(rows: list[dict], root: str, lang: str, *, use_bing_wmt: bool) -> None:
    root_vol, src = volume.root_volume(root, lang)
    log(f"  [vol] root '{root}' ≈ {root_vol}/mo ({src})")
    for r in rows:
        est = volume.estimate(
            r["keyword"], root=root, lang=lang, sources=r["sources"], best_rank=r["best_rank"],
            modifier=r["modifier"], trends_rel=r.get("trends_rel"), trends_value=r.get("trends_value"),
            root_vol=root_vol, use_bing_wmt=use_bing_wmt)
        r.update(est)


def enrich_intent(rows: list[dict], lang: str, llm: str | None) -> None:
    res = intent_classifier.classify_all([r["keyword"] for r in rows], lang, llm=llm)
    for r in rows:
        x = res.get(r["keyword"], {"intent": "informational", "confidence": 0.3})
        r["intent"] = x["intent"]
        r["intent_confidence"] = x["confidence"]
        r["intent_method"] = x.get("method", "regex")


# ----------------------------------------------------------------------------- commands
def out_base(root: str, lang: str, out: str | None) -> Path:
    if out:
        p = Path(out).expanduser()
        return p if p.suffix == "" else p.with_suffix("")
    config.ensure_dirs()
    return config.OUT_DIR / f"{slugify(root)}-{lang}-{dt.date.today().isoformat()}"


def cmd_research(a: argparse.Namespace) -> int:
    root = a.root.strip()
    lang = a.lang or detect_lang(root)
    sources = a.sources.split(",") if a.sources else SOURCES[lang]
    if a.no_trends and "trends" in sources:
        sources.remove("trends")
    t0 = time.time()
    log(f"== research '{root}' lang={lang} limit={a.limit} sources={','.join(sources)}")

    cands = collect(root, lang, sources, depth=a.depth, alpha=not a.no_alpha)
    rows = merge(cands, root, lang)
    log(f"  {len(cands)} raw → {len(rows)} unique on-topic candidates")
    rows = prioritize(rows, root, lang, a.limit)
    log(f"  keeping top {len(rows)}")
    for r in rows:
        r["lang"], r["root"] = lang, root

    if a.no_serp:
        for r in rows:
            r.update({"kd": -1, "kd_label": "n/a", "serp_top_domains": [], "serp_features": [], "ugc_count": ""})
    else:
        log("-- SERP / keyword difficulty")
        enrich_serp(rows, lang)

    if not a.no_trends:
        log("-- Google Trends relative interest")
        enrich_trends(rows, root, lang)
    log("-- volume estimate")
    enrich_volume(rows, root, lang, use_bing_wmt=a.bing_wmt)
    log("-- intent")
    enrich_intent(rows, lang, a.llm)
    log("-- clustering")
    rows, clusters = cluster_mod.cluster(rows, lang, threshold=a.sim, max_clusters=a.max_clusters)
    log(f"  {len(clusters)} clusters")
    log("-- target pages")
    target_url.assign(rows, lang)

    rows.sort(key=lambda r: (-int(r.get("vol") or 0), r.get("kd", 999)))
    base = out_base(root, lang, a.out)
    csv_path = csv_export.write(rows, base.with_suffix(".csv"))
    json_path = base.with_suffix(".json")
    json_path.write_text(json.dumps({"root": root, "lang": lang, "generated": dt.datetime.now().isoformat(timespec="seconds"),
                                     "sources": sources, "rows": rows, "clusters": clusters},
                                    ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    md_path = cluster_map_md.write(rows, clusters, Path(str(base) + "-clusters.md"), root=root, lang=lang)

    print(f"\n{len(rows)} keywords · {len(clusters)} clusters · {time.time() - t0:.0f}s")
    print(f"CSV      {csv_path}")
    print(f"JSON     {json_path}")
    print(f"Clusters {md_path}")
    if not a.quiet:
        print()
        print(f"{'keyword':<34} {'KD':>3} {'vol':>6}  {'intent':<13} {'cluster':<26} target")
        for r in rows[: min(len(rows), 60)]:
            kw = r["keyword"] if len(r["keyword"]) <= 32 else r["keyword"][:31] + "…"
            print(f"{kw:<34} {r.get('kd', -1):>3} {r.get('vol', 0):>6}  {r.get('intent', ''):<13} {r.get('cluster_slug', '')[:26]:<26} {r.get('target_url', '')}")
    return 0


def cmd_cluster(a: argparse.Namespace) -> int:
    src = Path(a.csv).expanduser()
    rows = csv_export.read(src)
    if not rows:
        raise SystemExit(f"no keyword rows in {src}")
    lang = a.lang or detect_lang(rows[0]["keyword"])
    root = a.root or (rows[0].get("root") or rows[0]["keyword"])
    rows, clusters = cluster_mod.cluster(rows, lang, threshold=a.sim, max_clusters=a.max_clusters)
    target_url.assign(rows, lang)
    base = Path(a.out).expanduser().with_suffix("") if a.out else src.with_suffix("")
    if str(base).endswith("-clusters"):
        base = Path(str(base)[: -len("-clusters")])
    md = cluster_map_md.write(rows, clusters, Path(str(base) + "-clusters.md"), root=root, lang=lang)
    if a.rewrite_csv:
        csv_export.write(rows, src)
        print(f"CSV updated {src}")
    print(f"{len(rows)} keywords · {len(clusters)} clusters")
    print(f"Clusters {md}")
    return 0


def cmd_audit(a: argparse.Namespace) -> int:
    src = Path(a.csv).expanduser()
    rows = cannibalization.load(src)
    res = cannibalization.analyze(rows, min_impressions=a.min_impressions, share_threshold=a.share)
    config.ensure_dirs()
    base = Path(a.out).expanduser().with_suffix("") if a.out else config.OUT_DIR / f"cannibalization-{dt.date.today().isoformat()}"
    md = Path(str(base) + ".md")
    md.write_text(cannibalization.render_md(res, src), encoding="utf-8")
    c1 = cannibalization.write_csv(res, Path(str(base) + "-conflicts.csv"))
    c2 = cannibalization.write_owners_csv(res, Path(str(base) + "-owners.csv"))
    print(f"{res['queries']} queries · {res['pages']} pages · {len(res['conflicts'])} conflicts")
    print(f"Report   {md}")
    print(f"Conflicts{c1}")
    print(f"Owners   {c2}")
    for c in res["conflicts"][:10]:
        print(f"  [{c['severity']}] {c['query']}  owner={cannibalization._short(c['owner'])}  rivals=" +
              ", ".join(cannibalization._short(r["page"]) for r in c["rivals"]))
    return 0


def cmd_serp(a: argparse.Namespace) -> int:
    lang = a.lang or detect_lang(a.keyword)
    serp = serp_analyzer.fetch(a.keyword, lang)
    kd = keyword_difficulty.keyword_difficulty(serp)
    print(json.dumps({"keyword": a.keyword, "lang": lang, "ok": serp.ok, "error": serp.error,
                      "total_results": serp.total_results, "features": serp.features, "kd": kd,
                      "results": [{"pos": r.position, "domain": r.domain, "da": keyword_difficulty.domain_authority(r.domain, r.url),
                                   "title": r.title[:80], "url": r.url} for r in serp.results]},
                     ensure_ascii=False, indent=1))
    return 0


def cmd_pages(a: argparse.Namespace) -> int:
    for p in target_url.load_pages():
        if a.lang and p.lang != a.lang:
            continue
        print(f"{p.path:<40} {p.lang}  {p.title[:70]}")
    return 0


# ----------------------------------------------------------------------------- main
def build_parser() -> argparse.ArgumentParser:
    ap = argparse.ArgumentParser(prog="cli.py", description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("research", help="collect keywords → KD, volume, intent, clusters, target URL → CSV/MD")
    r.add_argument("--root", required=True, help='seed keyword, e.g. "ai 前台" or "ai receptionist"')
    r.add_argument("--lang", choices=["zh", "en"], help="default: auto-detect from --root")
    r.add_argument("--limit", type=int, default=50, help="keep the N strongest candidates (default 50)")
    r.add_argument("--sources", help=f"comma list from {','.join(ALL_SOURCES)} (default per language)")
    r.add_argument("--depth", type=int, default=1, help="Google autocomplete recursion depth (1 or 2)")
    r.add_argument("--no-alpha", action="store_true", help="skip a-z / 0-9 expansion (faster)")
    r.add_argument("--no-serp", action="store_true", help="skip SERP fetch (KD = -1)")
    r.add_argument("--no-trends", action="store_true", help="skip Google Trends (volume = heuristic only)")
    r.add_argument("--bing-wmt", action="store_true", help="use Bing Webmaster keyword API if BING_WEBMASTER_API_KEY is set")
    r.add_argument("--llm", choices=["claude", "haiku", "sonnet"], help="second-pass intent via local `claude -p` CLI")
    r.add_argument("--sim", type=float, default=0.32, help="cluster similarity threshold 0-1 (default 0.32)")
    r.add_argument("--max-clusters", type=int, help="fold small clusters until at most N remain")
    r.add_argument("--out", help="output base path (no extension); default state/seo/keyword-research/<slug>-<lang>-<date>")
    r.add_argument("--quiet", action="store_true", help="don't print the table")
    r.set_defaults(fn=cmd_research)

    c = sub.add_parser("cluster", help="(re)build the topic cluster map from a research CSV")
    c.add_argument("csv")
    c.add_argument("--lang", choices=["zh", "en"])
    c.add_argument("--root", help="label for the map title")
    c.add_argument("--sim", type=float, default=0.32)
    c.add_argument("--max-clusters", type=int)
    c.add_argument("--out", help="output base path (no extension)")
    c.add_argument("--rewrite-csv", action="store_true", help="write cluster_slug/target_url back into the CSV")
    c.set_defaults(fn=cmd_cluster)

    d = sub.add_parser("audit", help="cannibalization audit from a GSC page×query CSV export")
    d.add_argument("csv")
    d.add_argument("--min-impressions", type=float, default=5, help="ignore rival pages under this many impressions")
    d.add_argument("--share", type=float, default=0.2, help="rival counts if impressions ≥ share × owner impressions")
    d.add_argument("--out", help="output base path (no extension)")
    d.set_defaults(fn=cmd_audit)

    s = sub.add_parser("serp", help="debug: fetch one SERP and print the KD breakdown")
    s.add_argument("keyword")
    s.add_argument("--lang", choices=["zh", "en"])
    s.set_defaults(fn=cmd_serp)

    p = sub.add_parser("pages", help="list local pages used for target_url mapping")
    p.add_argument("--lang", choices=["zh", "en"])
    p.set_defaults(fn=cmd_pages)
    return ap


def main(argv: list[str] | None = None) -> int:
    a = build_parser().parse_args(argv)
    return a.fn(a)


if __name__ == "__main__":
    sys.exit(main())
