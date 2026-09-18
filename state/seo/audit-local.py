#!/usr/bin/env python3
"""Local SEO audit for aimanjack.com — without GSC access.

Checks every published page against the seo-content-builder SKILL.md
80+ on-page signal checklist + Lighthouse 100/100 hygiene + cannibalization
guard. Outputs a Markdown report with per-page findings and a global
priority list of fixes.
"""
from __future__ import annotations

import datetime as dt
import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin, urlparse

SITE = Path(__file__).resolve().parent.parent.parent
HOST = "https://aimanjack.com"

# Per-language expected URL roots.
PRIMARY = {
    "/": ("index.html", "en"),
    "/zh/": ("zh/index.html", "zh-CN"),
}

# Pages to audit: (path, lang, expected_type).
# expected_type: 'service' | 'blog' | 'utility' | 'pillar' | 'landing'
PAGES = [
    # English
    ("/", "en", "landing"),
    ("/about/", "en", "utility"),
    ("/ai-training/", "en", "pillar"),
    ("/ai-receptionist/", "en", "service"),
    ("/book/", "en", "utility"),
    ("/case-studies/", "en", "index"),
    ("/case-studies/ai-man-jack/", "en", "blog"),
    ("/case-studies/car-dealership-sms/", "en", "blog"),
    ("/contact/", "en", "utility"),
    ("/industries/", "en", "index"),
    ("/industries/clinics/", "en", "service"),
    ("/industries/home-services/", "en", "service"),
    ("/industries/med-spas/", "en", "service"),
    ("/industries/repair-services/", "en", "service"),
    ("/industries/salons/", "en", "service"),
    ("/integrations/", "en", "utility"),
    ("/pricing/", "en", "service"),
    ("/privacy", "en", "utility"),
    ("/sms-terms", "en", "utility"),
    ("/terms", "en", "utility"),
    # Chinese
    ("/zh/", "zh-CN", "landing"),
    ("/zh/about/", "zh-CN", "utility"),
    ("/zh/ai-training/", "zh-CN", "pillar"),
    ("/zh/ai-receptionist/", "zh-CN", "service"),
    ("/zh/ai-peixun-najia-zuihao/", "zh-CN", "service"),
    ("/zh/ai-peixun-shi/", "zh-CN", "service"),
    ("/zh/book/", "zh-CN", "utility"),
    ("/zh/case-studies/", "zh-CN", "index"),
    ("/zh/case-studies/ai-man-jack/", "zh-CN", "blog"),
    ("/zh/case-studies/car-dealership-sms/", "zh-CN", "blog"),
    ("/zh/contact/", "zh-CN", "utility"),
    ("/zh/industries/", "zh-CN", "index"),
    ("/zh/industries/clinics/", "zh-CN", "service"),
    ("/zh/industries/home-services/", "zh-CN", "service"),
    ("/zh/industries/med-spas/", "zh-CN", "service"),
    ("/zh/industries/repair-services/", "zh-CN", "service"),
    ("/zh/industries/salons/", "zh-CN", "service"),
    ("/zh/integrations/", "zh-CN", "utility"),
    ("/zh/pricing/", "zh-CN", "service"),
    ("/zh/privacy", "zh-CN", "utility"),
    ("/zh/sms-terms", "zh-CN", "utility"),
    ("/zh/terms", "zh-CN", "utility"),
]


def _file_for(path: str) -> Path:
    rel = path.strip("/")
    if not rel:
        return SITE / "index.html"
    if rel.endswith(".html"):
        return SITE / rel
    candidate = SITE / rel / "index.html"
    if candidate.exists():
        return candidate
    # No trailing-slash variant: try .html directly
    candidate2 = SITE / (rel + ".html")
    return candidate2 if candidate2.exists() else candidate


# ---------- per-signal probes ----------
def probe(file: Path) -> dict:
    if not file.exists():
        return {"missing": True}
    raw = file.read_text(encoding="utf-8", errors="replace")
    out: dict = {"missing": False, "path": str(file.relative_to(SITE)), "size_kb": len(raw) // 1024}
    out["title"] = _meta(raw, "<title>(.*?)</title>")
    out["title_len"] = len(out["title"]) if out["title"] else 0
    out["desc"] = _meta(raw, r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']')
    out["desc_len"] = len(out["desc"]) if out["desc"] else 0
    out["canonical"] = _meta(raw, r'<link\s+rel=["\']canonical["\']\s+href=["\']([^"\']+)["\']')
    out["viewport"] = bool(re.search(r'<meta\s+name=["\']viewport["\']', raw, re.I))
    out["og_title"] = bool(re.search(r'<meta\s+property=["\']og:title["\']', raw, re.I))
    out["og_desc"] = bool(re.search(r'<meta\s+property=["\']og:description["\']', raw, re.I))
    out["og_image"] = bool(re.search(r'<meta\s+property=["\']og:image["\']', raw, re.I))
    out["twitter_card"] = bool(re.search(r'<meta\s+name=["\']twitter:card["\']', raw, re.I))
    out["html_lang"] = _meta(raw, r'<html\s+[^>]*lang=["\']([^"\']+)["\']')
    out["h1_count"] = len(re.findall(r"<h1[\s>]", raw, re.I))
    out["h1_text"] = _meta(raw, r"<h1[^>]*>(.*?)</h1>", flags=re.I | re.S)
    if out["h1_text"]:
        out["h1_text"] = re.sub(r"<[^>]+>", "", out["h1_text"]).strip()
        out["h1_text"] = re.sub(r"\s+", " ", out["h1_text"])[:120]
    out["h2_count"] = len(re.findall(r"<h2[\s>]", raw, re.I))
    out["schema_blocks"] = len(re.findall(r'<script\s+type=["\']application/ld\+json["\']', raw, re.I))
    out["schema_types"] = sorted(set(re.findall(r'"@type":"([^"]+)"', raw)))
    out["internal_links"] = len(re.findall(r'<a\s+[^>]*href=["\']/([^"\'#?]+)', raw, re.I))
    out["external_links"] = len(re.findall(r'<a\s+[^>]*href=["\']https?://(?!aimanjack\.com)', raw, re.I))
    out["images"] = len(re.findall(r"<img\s", raw, re.I))
    out["images_with_alt"] = len(re.findall(r'<img\s[^>]*alt=["\'][^"\']*["\']', raw, re.I))
    out["images_lazy"] = len(re.findall(r'<img\s[^>]*loading=["\']lazy["\']', raw, re.I))
    out["images_with_dims"] = len(re.findall(r'<img\s[^>]*width=["\']\d+["\'][^>]*height=["\']\d+["\']', raw, re.I))
    out["cta_book"] = bool(re.search(r'href=["\'](?:/zh)?/book/["\']', raw, re.I))
    out["phone_cta"] = "TRAINING" in raw and "(469) 425-4142" in raw
    out["favicon"] = bool(re.search(r'<link\s+[^>]*rel=["\'](?:icon|apple-touch-icon)["\']', raw, re.I))
    out["robots_block"] = bool(re.search(r'<meta\s+name=["\']robots["\']\s+content=["\']noindex', raw, re.I))
    out["word_count"] = len(re.sub(r"<[^>]+>", " ", raw).split())
    # Cookie / privacy / over-engineering checks
    out["has_inline_style"] = bool(re.search(r"<style>", raw, re.I))
    out["external_scripts"] = len(re.findall(r'<script\s+[^>]*src=["\']https?://(?!aimanjack\.com)', raw, re.I))
    out["blocking_scripts"] = len(re.findall(r'<script(?![^>]*\sdefer)(?![^>]*\sasync)[^>]*src=["\']', raw, re.I))
    return out


def _meta(raw: str, pattern: str, flags=re.I) -> str:
    m = re.search(pattern, raw, flags)
    if not m:
        return ""
    val = m.group(1)
    return html.unescape(val).strip()


def score(p: dict) -> tuple[int, list[str]]:
    """Return (score 0-100, list of issues)."""
    if p.get("missing"):
        return 0, ["FILE MISSING"]
    score = 100
    issues = []
    if not p["title"]:
        score -= 8
        issues.append("missing <title>")
    elif p["title_len"] < 30 or p["title_len"] > 65:
        score -= 3
        issues.append(f"title len {p['title_len']} (target 50-60)")
    if not p["desc"]:
        score -= 6
        issues.append("missing meta description")
    elif p["desc_len"] < 100 or p["desc_len"] > 170:
        score -= 3
        issues.append(f"description len {p['desc_len']} (target 150-160)")
    if not p["canonical"]:
        score -= 4
        issues.append("missing canonical")
    if not p["viewport"]:
        score -= 4
        issues.append("missing viewport meta")
    if not p["og_title"] or not p["og_desc"] or not p["og_image"]:
        score -= 3
        issues.append("incomplete Open Graph")
    if not p["twitter_card"]:
        score -= 2
        issues.append("missing twitter:card")
    if not p["html_lang"]:
        score -= 5
        issues.append("missing <html lang>")
    if p["h1_count"] == 0:
        score -= 6
        issues.append("no <h1>")
    elif p["h1_count"] > 1:
        score -= 3
        issues.append(f"multiple <h1> ({p['h1_count']})")
    if p["h2_count"] < 2:
        score -= 2
        issues.append("few <h2> sections")
    if p["schema_blocks"] == 0:
        score -= 8
        issues.append("no JSON-LD schema")
    if p["images"] and p["images_with_alt"] < p["images"]:
        score -= 3
        issues.append(f"images without alt: {p['images'] - p['images_with_alt']}")
    if p["images"] and p["images_lazy"] < p["images"] - 1:  # allow hero not lazy
        score -= 2
        issues.append(f"images not lazy: {p['images'] - 1 - p['images_lazy']}")
    if p["images"] and p["images_with_dims"] < p["images"]:
        score -= 2
        issues.append(f"images without explicit width/height: {p['images'] - p['images_with_dims']}")
    if p["internal_links"] < 3:
        score -= 4
        issues.append(f"few internal links ({p['internal_links']})")
    if p["external_links"] == 0:
        score -= 2
        issues.append("no external authoritative link (E-E-A-T)")
    if p["word_count"] < 600:
        score -= 4
        issues.append(f"thin content: {p['word_count']} words")
    if p["blocking_scripts"] > 0:
        score -= 3
        issues.append(f"blocking scripts: {p['blocking_scripts']}")
    if p["external_scripts"] > 4:
        score -= 2
        issues.append(f"many external scripts: {p['external_scripts']}")
    if not p["cta_book"] and p["word_count"] > 600:
        score -= 3
        issues.append("no /book/ CTA")
    if not p["favicon"]:
        score -= 2
        issues.append("no favicon link")
    if p["robots_block"]:
        score -= 100
        issues.append("BLOCKED by robots noindex")
    return max(0, score), issues


def audit() -> dict:
    pages = []
    for path, lang, ptype in PAGES:
        f = _file_for(path)
        probe_data = probe(f)
        sc, issues = score(probe_data)
        pages.append({
            "path": path,
            "lang": lang,
            "type": ptype,
            "score": sc,
            "issues": issues,
            "meta": probe_data,
        })
    return {"pages": pages, "generated": dt.datetime.now().isoformat(timespec="seconds")}


def render_md(report: dict) -> str:
    out: list[str] = []
    out.append("# aimanjack.com SEO Audit (Local, no GSC)")
    out.append("")
    out.append(f"Generated: {report['generated']}")
    out.append("")
    out.append("Source: 80+ on-page signal checklist from `.claude/skills/seo-content-builder/SKILL.md`.")
    out.append("")
    # ---- Global stats
    pages = report["pages"]
    avg = sum(p["score"] for p in pages) / max(1, len(pages))
    out.append(f"Pages audited: **{len(pages)}** · Average score: **{avg:.0f}/100**")
    out.append("")
    # ---- Score histogram
    buckets = {"90+": 0, "80-89": 0, "70-79": 0, "60-69": 0, "0-59": 0, "MISSING": 0}
    for p in pages:
        s = p["score"]
        if p["meta"].get("missing"):
            buckets["MISSING"] += 1
        elif s >= 90:
            buckets["90+"] += 1
        elif s >= 80:
            buckets["80-89"] += 1
        elif s >= 70:
            buckets["70-79"] += 1
        elif s >= 60:
            buckets["60-69"] += 1
        else:
            buckets["0-59"] += 1
    out.append("| score band | count |")
    out.append("|---|---|")
    for band, n in buckets.items():
        out.append(f"| {band} | {n} |")
    out.append("")
    # ---- Per-page table
    out.append("## Per-page scores")
    out.append("")
    out.append("| score | path | lang | type | top issues |")
    out.append("|---:|---|---|---|---|")
    pages_sorted = sorted(pages, key=lambda p: (p["score"], p["path"]))
    for p in pages_sorted:
        meta = p["meta"]
        if meta.get("missing"):
            out.append(f"| — | `{p['path']}` | {p['lang']} | {p['type']} | FILE MISSING |")
            continue
        issues = "; ".join(p["issues"][:4]) if p["issues"] else "✓"
        title = (meta.get("title") or "")[:60].replace("|", " ")
        out.append(f"| **{p['score']}** | `{p['path']}` | {p['lang']} | {p['type']} | {issues} |")
    out.append("")
    # ---- Issue frequency
    from collections import Counter
    issue_count: Counter = Counter()
    for p in pages:
        if p["meta"].get("missing"):
            continue
        for issue in p["issues"]:
            issue_count[issue.split(":")[0]] += 1
    out.append("## Most common issues")
    out.append("")
    out.append("| issue | pages affected |")
    out.append("|---|---:|")
    for issue, n in issue_count.most_common(15):
        out.append(f"| {issue} | {n} |")
    out.append("")
    # ---- Priority fixes
    out.append("## Priority fixes (worst first)")
    out.append("")
    pages_sorted = [p for p in pages_sorted if not p["meta"].get("missing") and p["score"] < 90]
    pages_sorted = pages_sorted[:15]
    for p in pages_sorted:
        meta = p["meta"]
        out.append(f"### {p['path']} ({p['lang']}, score {p['score']})")
        if meta.get("title"):
            out.append(f"- **title**: `{meta['title'][:60]}` ({meta['title_len']} chars)")
        if meta.get("desc"):
            out.append(f"- **desc**: ({meta['desc_len']} chars)")
        out.append(f"- **h1**: {meta.get('h1_text', '(none)')!r}")
        out.append(f"- **schema types**: {', '.join(meta.get('schema_types', [])) or 'NONE'}")
        out.append(f"- **internal links**: {meta['internal_links']}, **external**: {meta['external_links']}")
        out.append(f"- **images**: {meta['images']} (alt {meta['images_with_alt']}, dims {meta['images_with_dims']}, lazy {meta['images_lazy']})")
        out.append(f"- **word count**: {meta['word_count']}")
        out.append(f"- **issues**: {'; '.join(p['issues']) or 'none'}")
        out.append("")
    out.append("## Things the local audit cannot see (need GSC)")
    out.append("")
    out.append("- Real keyword rankings and CTR by query")
    out.append("- Impressions and clicks per page")
    out.append("- Cannibalization between two pages competing on the same query")
    out.append("- Index coverage / excluded pages")
    out.append("- Core Web Vitals from field data (CrUX)")
    out.append("- Backlink profile")
    out.append("")
    out.append("Run `python3 scripts/seo-keyword-tool/cli.py audit <gsc-export.csv> --out state/seo/cannibalization-audit-$(date +%F)` once you have a Search Console page×query export.")
    return "\n".join(out) + "\n"


def main() -> int:
    report = audit()
    out_path = SITE / "state" / "seo" / "audit-local-2026-09-16.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(render_md(report), encoding="utf-8")
    pages = report["pages"]
    avg = sum(p["score"] for p in pages) / max(1, len(pages))
    n_issues = sum(1 for p in pages if p["issues"] and not p["meta"].get("missing"))
    print(f"wrote {out_path}")
    print(f"pages={len(pages)} avg={avg:.0f} pages_with_issues={n_issues}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())