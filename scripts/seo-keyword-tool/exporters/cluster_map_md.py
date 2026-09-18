"""Markdown topic-cluster map: pillar + satellite tree, target pages, and a Mermaid mindmap."""
from __future__ import annotations

import datetime as dt
from pathlib import Path


def _fmt_vol(v) -> str:
    try:
        v = int(float(v))
    except (TypeError, ValueError):
        return "?"
    return f"{v:,}"


def _kd(r: dict) -> str:
    kd = r.get("kd", -1)
    try:
        kd = int(kd)
    except (TypeError, ValueError):
        return "n/a"
    return "n/a" if kd < 0 else str(kd)


def render(rows: list[dict], clusters: list[dict], *, root: str, lang: str) -> str:
    by_kw = {r["keyword"]: r for r in rows}
    total_vol = sum(int(float(r.get("vol") or 0)) for r in rows)
    lines: list[str] = []
    lines.append(f"# Topic cluster map — `{root}` ({lang})")
    lines.append("")
    lines.append(f"Generated {dt.date.today().isoformat()} · {len(rows)} keywords · {len(clusters)} clusters · est. {total_vol:,} searches/mo (heuristic)")
    lines.append("")
    lines.append("Legend: **pillar** = cluster head (highest est. volume); satellites hang under it. "
                 "`KD` 0–100 (lower = easier). `→` target page; `NEW` = no matching page yet.")
    lines.append("")

    # summary table
    lines.append("## Clusters at a glance")
    lines.append("")
    lines.append("| # | Cluster (pillar) | Keywords | Est. vol | Avg KD | Dominant intent | Target |")
    lines.append("|---|---|---:|---:|---:|---|---|")
    for i, c in enumerate(clusters, 1):
        members = [by_kw[k] for k in c["members"] if k in by_kw]
        kds = [int(m["kd"]) for m in members if str(m.get("kd", "-1")).lstrip("-").isdigit() and int(m["kd"]) >= 0]
        avg_kd = f"{sum(kds) / len(kds):.0f}" if kds else "n/a"
        intents = {}
        for m in members:
            intents[m.get("intent", "")] = intents.get(m.get("intent", ""), 0) + 1
        dom = max(intents, key=intents.get) if intents else ""
        pillar = by_kw.get(c["pillar"], {})
        lines.append(f"| {i} | **{c['pillar']}** | {c['size']} | {_fmt_vol(c['total_vol'])} | {avg_kd} | {dom} | `{pillar.get('target_url', '')}` |")
    lines.append("")

    # tree
    lines.append("## Pillar → satellite tree")
    lines.append("")
    for c in clusters:
        pillar = by_kw.get(c["pillar"], {"keyword": c["pillar"]})
        lines.append(f"- **{pillar['keyword']}** · vol {_fmt_vol(pillar.get('vol'))} · KD {_kd(pillar)} · {pillar.get('intent', '')} → `{pillar.get('target_url', '')}`")
        for k in c["members"]:
            if k == c["pillar"]:
                continue
            m = by_kw.get(k, {"keyword": k})
            tgt = m.get("target_url", "")
            tgt_note = f" → `{tgt}`" if tgt and tgt != pillar.get("target_url") else ""
            lines.append(f"  - {m['keyword']} · vol {_fmt_vol(m.get('vol'))} · KD {_kd(m)} · {m.get('intent', '')}{tgt_note}")
        lines.append("")

    # opportunities: low KD, decent vol
    opp = [r for r in rows if str(r.get("kd", "-1")).lstrip("-").isdigit() and 0 <= int(r["kd"]) < 40 and int(float(r.get("vol") or 0)) >= 20]
    opp.sort(key=lambda r: (int(r["kd"]), -int(float(r.get("vol") or 0))))
    if opp:
        lines.append("## Quick wins (KD < 40, vol ≥ 20)")
        lines.append("")
        lines.append("| Keyword | KD | Est. vol | Intent | Cluster | Target |")
        lines.append("|---|---:|---:|---|---|---|")
        for r in opp[:25]:
            lines.append(f"| {r['keyword']} | {_kd(r)} | {_fmt_vol(r.get('vol'))} | {r.get('intent', '')} | {r.get('cluster_slug', '')} | `{r.get('target_url', '')}` |")
        lines.append("")

    # pages needed
    new_pages = sorted({r["target_url"] for r in rows if str(r.get("target_url", "")).startswith("NEW ")})
    if new_pages:
        lines.append("## Pages to create")
        lines.append("")
        for u in new_pages:
            kws = [r["keyword"] for r in rows if r.get("target_url") == u]
            lines.append(f"- `{u[4:]}` — {len(kws)} keywords: " + ", ".join(kws[:8]) + (" …" if len(kws) > 8 else ""))
        lines.append("")

    # mermaid mindmap
    lines.append("## Mindmap (Mermaid)")
    lines.append("")
    lines.append("```mermaid")
    lines.append("mindmap")
    lines.append(f"  root(({_mm(root)}))")
    for c in clusters:
        lines.append(f"    {_mm(c['pillar'])}")
        for k in c["members"]:
            if k != c["pillar"]:
                lines.append(f"      {_mm(k)}")
    lines.append("```")
    lines.append("")
    return "\n".join(lines)


def _mm(s: str) -> str:
    return s.replace("(", "（").replace(")", "）").replace("[", "［").replace("]", "］").replace('"', "”").replace(":", "：")


def write(rows: list[dict], clusters: list[dict], path: Path, *, root: str, lang: str) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(render(rows, clusters, root=root, lang=lang), encoding="utf-8")
    return path
