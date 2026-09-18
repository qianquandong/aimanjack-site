"""Keyword cannibalization audit from a Google Search Console page×query export.

Accepted input: one CSV with (at least) a query column and a page column, plus
clicks / impressions / ctr / position. Header names from the EN or ZH GSC UI,
Looker Studio, the Search Analytics API and "Search Analytics for Sheets" are all
recognised. If the file only has queries (no page column) we stop and explain.

Output:
  * owners   — for every query, the page that should own it (most clicks, then
               impressions, then best position)
  * conflicts— queries where ≥2 pages get meaningful impressions
  * page summary — per page: owned / contested queries and impressions at stake
"""
from __future__ import annotations

import csv
import datetime as dt
import re
from collections import defaultdict
from pathlib import Path

HEADER_ALIASES = {
    "query": {"query", "queries", "top queries", "search query", "keyword", "热门查询", "查询", "搜索查询"},
    "page": {"page", "pages", "top pages", "url", "landing page", "landing_page", "address", "热门网页", "网页", "页面"},
    "clicks": {"clicks", "click", "点击次数", "点击"},
    "impressions": {"impressions", "impr", "impr.", "展示次数", "展示"},
    "ctr": {"ctr", "click-through rate", "点击率"},
    "position": {"position", "avg. position", "average position", "avg position", "排名", "平均排名"},
}


def _norm_header(h: str) -> str:
    h = (h or "").strip().lower().lstrip("﻿")
    for key, names in HEADER_ALIASES.items():
        if h in names:
            return key
    return h


def _num(v: str) -> float:
    if v is None:
        return 0.0
    s = str(v).strip().replace(",", "").replace("%", "")
    if s in ("", "-", "—"):
        return 0.0
    try:
        return float(s)
    except ValueError:
        return 0.0


def _norm_page(u: str) -> str:
    u = (u or "").strip()
    u = re.sub(r"#.*$", "", u)
    u = re.sub(r"\?.*$", "", u)
    return u


def load(path: Path) -> list[dict]:
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        sample = f.read(4096)
        f.seek(0)
        try:
            dialect = csv.Sniffer().sniff(sample, delimiters=",;\t")
        except csv.Error:
            dialect = csv.excel
        reader = csv.reader(f, dialect)
        header = [_norm_header(h) for h in next(reader)]
        if "query" not in header:
            raise SystemExit("GSC CSV has no query column. Expected headers like 'Top queries' / 'Query' / '热门查询'.")
        if "page" not in header:
            raise SystemExit(
                "GSC CSV has no page column, so page×query pairs can't be built.\n"
                "Get a combined export one of these ways:\n"
                "  1. GSC → Performance → filter by Page → export Queries (repeat per page, then concat),\n"
                "  2. Looker Studio: add 'Landing Page' + 'Query' dimensions → export CSV,\n"
                "  3. Search Analytics for Sheets (dimensions: page, query),\n"
                "  4. Search Console API searchanalytics.query with dimensions=['page','query']."
            )
        rows = []
        for rec in reader:
            if not rec or all(not c.strip() for c in rec):
                continue
            d = dict(zip(header, rec))
            q = (d.get("query") or "").strip()
            p = _norm_page(d.get("page", ""))
            if not q or not p:
                continue
            rows.append({
                "query": q, "page": p,
                "clicks": _num(d.get("clicks")), "impressions": _num(d.get("impressions")),
                "ctr": _num(d.get("ctr")), "position": _num(d.get("position")),
            })
    return rows


def analyze(rows: list[dict], *, min_impressions: float = 5, share_threshold: float = 0.2) -> dict:
    by_q: dict[str, list[dict]] = defaultdict(list)
    for r in rows:
        by_q[r["query"]].append(r)

    owners: list[dict] = []
    conflicts: list[dict] = []
    page_stats: dict[str, dict] = defaultdict(lambda: {"owned": 0, "contested": 0, "lost": 0,
                                                       "clicks": 0.0, "impressions": 0.0, "impressions_at_stake": 0.0})
    for q, recs in by_q.items():
        # aggregate duplicate page rows (e.g. concatenated exports)
        agg: dict[str, dict] = {}
        for r in recs:
            a = agg.setdefault(r["page"], {"page": r["page"], "clicks": 0.0, "impressions": 0.0, "pos_w": 0.0})
            a["clicks"] += r["clicks"]
            a["impressions"] += r["impressions"]
            a["pos_w"] += r["position"] * max(1.0, r["impressions"])
        pages = list(agg.values())
        for p in pages:
            p["position"] = round(p["pos_w"] / max(1.0, p["impressions"]), 1) if p["impressions"] else 0.0
            page_stats[p["page"]]["clicks"] += p["clicks"]
            page_stats[p["page"]]["impressions"] += p["impressions"]
        pages.sort(key=lambda p: (-p["clicks"], -p["impressions"], p["position"] or 999))
        owner = pages[0]
        owners.append({"query": q, "owner": owner["page"], "clicks": owner["clicks"],
                       "impressions": owner["impressions"], "position": owner["position"],
                       "competing_pages": len(pages) - 1})
        page_stats[owner["page"]]["owned"] += 1

        rivals = [p for p in pages[1:] if p["impressions"] >= min_impressions and
                  (p["impressions"] >= share_threshold * max(1.0, owner["impressions"]) or p["clicks"] > 0
                   or (0 < p["position"] <= 20))]
        if not rivals:
            continue
        stake = owner["impressions"] + sum(p["impressions"] for p in rivals)
        if any(p["clicks"] > 0 for p in rivals) and owner["clicks"] > 0:
            severity = "high"
        elif any(p["clicks"] > 0 for p in rivals) or owner["clicks"] > 0:
            severity = "medium"
        else:
            severity = "low"
        # recommendation
        same_lang = all(_lang_of(p["page"]) == _lang_of(owner["page"]) for p in rivals)
        if not same_lang:
            rec = "expected: EN/ZH pair — verify hreflang; not a true conflict unless both rank in the same locale"
            severity = "info"
        elif any(_is_legal(p["page"]) for p in rivals + [owner]):
            rec = "legal page ranking — noindex or de-emphasise that page's copy for this query"
        elif owner["position"] and all(abs(p["position"] - owner["position"]) < 3 for p in rivals):
            rec = "pages rank side by side — consolidate: merge weaker page into owner (301) or set canonical"
        else:
            rec = "differentiate: retitle the rival page(s) for their own intent; add an internal link to the owner using this query as anchor"
        conflicts.append({
            "query": q, "severity": severity, "owner": owner["page"], "owner_pos": owner["position"],
            "owner_clicks": owner["clicks"], "owner_impr": owner["impressions"],
            "rivals": [{"page": p["page"], "position": p["position"], "clicks": p["clicks"], "impressions": p["impressions"]} for p in rivals],
            "impressions_at_stake": stake, "recommendation": rec,
        })
        page_stats[owner["page"]]["contested"] += 1
        page_stats[owner["page"]]["impressions_at_stake"] += stake
        for p in rivals:
            page_stats[p["page"]]["lost"] += 1
            page_stats[p["page"]]["impressions_at_stake"] += stake

    sev_rank = {"high": 0, "medium": 1, "low": 2, "info": 3}
    conflicts.sort(key=lambda c: (sev_rank[c["severity"]], -c["impressions_at_stake"]))
    owners.sort(key=lambda o: (-o["clicks"], -o["impressions"]))
    pages_out = [{"page": p, **s} for p, s in page_stats.items()]
    pages_out.sort(key=lambda p: (-p["contested"] - p["lost"], -p["impressions"]))
    return {"queries": len(by_q), "pages": len(page_stats), "owners": owners, "conflicts": conflicts, "page_summary": pages_out}


def _lang_of(url: str) -> str:
    return "zh" if re.search(r"/zh(/|$)", url) else "en"


def _is_legal(url: str) -> bool:
    return bool(re.search(r"/(privacy|terms|sms-terms)/?$", url))


def render_md(result: dict, source: Path) -> str:
    L: list[str] = []
    L.append(f"# Cannibalization audit — {source.name}")
    L.append("")
    L.append(f"Generated {dt.date.today().isoformat()} · {result['queries']} queries · {result['pages']} pages · "
             f"**{len(result['conflicts'])} conflicts** "
             f"({sum(1 for c in result['conflicts'] if c['severity'] == 'high')} high, "
             f"{sum(1 for c in result['conflicts'] if c['severity'] == 'medium')} medium, "
             f"{sum(1 for c in result['conflicts'] if c['severity'] == 'low')} low, "
             f"{sum(1 for c in result['conflicts'] if c['severity'] == 'info')} info)")
    L.append("")
    L.append("## Conflicts")
    L.append("")
    if not result["conflicts"]:
        L.append("No cannibalization detected with the current thresholds.")
    else:
        L.append("| Sev | Query | Owner (pos / clicks / impr) | Rival pages (pos / clicks / impr) | Impr at stake | Fix |")
        L.append("|---|---|---|---|---:|---|")
        for c in result["conflicts"]:
            rivals = "<br>".join(f"`{_short(r['page'])}` ({r['position']} / {int(r['clicks'])} / {int(r['impressions'])})" for r in c["rivals"])
            L.append(f"| {c['severity']} | {c['query']} | `{_short(c['owner'])}` ({c['owner_pos']} / {int(c['owner_clicks'])} / {int(c['owner_impr'])}) | {rivals} | {int(c['impressions_at_stake'])} | {c['recommendation']} |")
    L.append("")
    L.append("## Page owners")
    L.append("")
    L.append("| Page | Owned queries | Contested | Losing to another page | Clicks | Impressions |")
    L.append("|---|---:|---:|---:|---:|---:|")
    for p in result["page_summary"]:
        L.append(f"| `{_short(p['page'])}` | {p['owned']} | {p['contested']} | {p['lost']} | {int(p['clicks'])} | {int(p['impressions'])} |")
    L.append("")
    L.append("## Query → owner (top 100 by clicks)")
    L.append("")
    L.append("| Query | Owner | Pos | Clicks | Impr | Other pages |")
    L.append("|---|---|---:|---:|---:|---:|")
    for o in result["owners"][:100]:
        L.append(f"| {o['query']} | `{_short(o['owner'])}` | {o['position']} | {int(o['clicks'])} | {int(o['impressions'])} | {o['competing_pages']} |")
    L.append("")
    return "\n".join(L)


def _short(url: str) -> str:
    return re.sub(r"^https?://[^/]+", "", url) or "/"


def write_csv(result: dict, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["query", "severity", "owner", "owner_position", "owner_clicks", "owner_impressions",
                    "rival_page", "rival_position", "rival_clicks", "rival_impressions", "impressions_at_stake", "recommendation"])
        for c in result["conflicts"]:
            for r in c["rivals"]:
                w.writerow([c["query"], c["severity"], c["owner"], c["owner_pos"], int(c["owner_clicks"]), int(c["owner_impr"]),
                            r["page"], r["position"], int(r["clicks"]), int(r["impressions"]), int(c["impressions_at_stake"]), c["recommendation"]])
    return path


def write_owners_csv(result: dict, path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["query", "owner", "position", "clicks", "impressions", "competing_pages"])
        for o in result["owners"]:
            w.writerow([o["query"], o["owner"], o["position"], int(o["clicks"]), int(o["impressions"]), o["competing_pages"]])
    return path
