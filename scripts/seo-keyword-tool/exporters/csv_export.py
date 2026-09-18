"""CSV export. Required columns first (keyword | KD | vol | intent | cluster_slug | target_url),
then diagnostics so the file is still useful when pasted into a sheet."""
from __future__ import annotations

import csv
from pathlib import Path

REQUIRED = ["keyword", "KD", "vol", "intent", "cluster_slug", "target_url"]
EXTRA = ["kd_label", "vol_band", "vol_source", "intent_confidence", "role", "cluster_name",
         "target_status", "sources", "best_rank", "modifier", "demand", "serp_top_domains",
         "serp_features", "ugc_count", "lang", "root"]
COLUMNS = REQUIRED + EXTRA


def row_to_csv(r: dict) -> dict:
    return {
        "keyword": r.get("keyword", ""),
        "KD": r.get("kd", -1),
        "vol": r.get("vol", 0),
        "intent": r.get("intent", ""),
        "cluster_slug": r.get("cluster_slug", ""),
        "target_url": r.get("target_url", ""),
        "kd_label": r.get("kd_label", ""),
        "vol_band": r.get("vol_band", ""),
        "vol_source": r.get("vol_source", ""),
        "intent_confidence": r.get("intent_confidence", ""),
        "role": r.get("role", ""),
        "cluster_name": r.get("cluster_name", ""),
        "target_status": r.get("target_status", ""),
        "sources": "|".join(r.get("sources", [])) if isinstance(r.get("sources"), list) else r.get("sources", ""),
        "best_rank": r.get("best_rank", ""),
        "modifier": r.get("modifier", ""),
        "demand": r.get("demand", ""),
        "serp_top_domains": "|".join(r.get("serp_top_domains", [])) if isinstance(r.get("serp_top_domains"), list) else r.get("serp_top_domains", ""),
        "serp_features": "|".join(r.get("serp_features", [])) if isinstance(r.get("serp_features"), list) else r.get("serp_features", ""),
        "ugc_count": r.get("ugc_count", ""),
        "lang": r.get("lang", ""),
        "root": r.get("root", ""),
    }


def write(rows: list[dict], path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8-sig") as f:   # BOM so Excel opens Chinese correctly
        w = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
        w.writeheader()
        for r in rows:
            w.writerow(row_to_csv(r))
    return path


def read(path: Path) -> list[dict]:
    """Read a CSV produced by `write` (or any CSV with a keyword column) back into row dicts."""
    rows: list[dict] = []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        for rec in csv.DictReader(f):
            kw = (rec.get("keyword") or rec.get("Keyword") or "").strip()
            if not kw:
                continue
            r = {"keyword": kw}
            for k, v in rec.items():
                if k is None:
                    continue
                key = {"KD": "kd"}.get(k, k)
                r[key] = v
            for num in ("kd", "vol"):
                try:
                    r[num] = float(r.get(num, 0) or 0)
                    if num == "kd":
                        r[num] = int(r[num])
                    else:
                        r[num] = int(r[num])
                except ValueError:
                    r[num] = 0
            if isinstance(r.get("sources"), str):
                r["sources"] = [s for s in r["sources"].split("|") if s]
            rows.append(r)
    return rows
