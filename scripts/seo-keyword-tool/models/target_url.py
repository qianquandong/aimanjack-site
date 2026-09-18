"""Map keywords / clusters to an existing page on the static site (or propose a new URL).

Pages are discovered from the local HTML tree (index.html + top-level *.html),
not just sitemap.xml, so unlisted pages like /zh/ai-training/ are included.
Each page is scored by token overlap between the keyword and the page's
<title>, <h1>, meta description and <h2>s (title/h1 weighted 3x).
"""
from __future__ import annotations

import html as html_mod
import re
from collections import Counter
from dataclasses import dataclass, field
from pathlib import Path

from common import config
from common.text import slugify, tokenize

SKIP_DIRS = {".git", ".deploy", ".wrangler", ".claude", ".planning", "design-system", "output", "scripts",
             "src", "db", "functions", "tests", "state", "img", "fonts", "node_modules"}
SKIP_FILES = {"404.html"}
LEGAL = ("privacy", "terms", "sms-terms")


@dataclass
class Page:
    url: str          # https://aimanjack.com/zh/ai-receptionist/
    path: str         # /zh/ai-receptionist/
    lang: str
    title: str = ""
    h1: str = ""
    description: str = ""
    h2s: list[str] = field(default_factory=list)
    tokens: Counter = field(default_factory=Counter)


def _text(s: str) -> str:
    return html_mod.unescape(re.sub(r"<[^>]+>", " ", s)).strip()


def _parse(html: str) -> tuple[str, str, str, list[str]]:
    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.S | re.I)
    h1 = re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S | re.I)
    d = re.search(r'<meta[^>]+name=["\']description["\'][^>]+content=["\']([^"\']*)', html, re.I) or \
        re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]+name=["\']description["\']', html, re.I)
    h2s = [_text(m) for m in re.findall(r"<h2[^>]*>(.*?)</h2>", html, re.S | re.I)]
    return (_text(t.group(1)) if t else "", _text(h1.group(1)) if h1 else "",
            html_mod.unescape(d.group(1)) if d else "", h2s)


def load_pages(root: Path | None = None) -> list[Page]:
    root = root or config.SITE_ROOT
    pages: list[Page] = []
    for p in root.rglob("*.html"):
        rel = p.relative_to(root)
        if any(part in SKIP_DIRS for part in rel.parts[:-1]) or rel.name in SKIP_FILES:
            continue
        if len(rel.parts) > 4:
            continue
        if p.name == "index.html":
            path = "/" + "/".join(rel.parts[:-1])
            path = path if path.endswith("/") else path + "/"
        else:
            path = "/" + str(rel.with_suffix("")).replace("\\", "/")
        lang = "zh" if path == "/zh/" or path.startswith("/zh/") else "en"
        try:
            html = p.read_text(encoding="utf-8", errors="ignore")
        except OSError:
            continue
        title, h1, desc, h2s = _parse(html)
        pg = Page(url=config.SITE_ORIGIN + path, path=path, lang=lang, title=title, h1=h1, description=desc, h2s=h2s)
        toks: Counter = Counter()
        for weight, text in ((3, title), (3, h1), (1, desc), (1, " ".join(h2s)), (1, path.replace("/", " ").replace("-", " "))):
            for tok in tokenize(text, lang):
                toks[tok] += weight
        pg.tokens = toks
        pages.append(pg)
    pages.sort(key=lambda x: x.path)
    return pages


def score(keyword: str, page: Page, lang: str) -> float:
    ktoks = set(tokenize(keyword, lang))
    if not ktoks or not page.tokens:
        return 0.0
    hit = sum(page.tokens[t] for t in ktoks if t in page.tokens)
    cover = sum(1 for t in ktoks if t in page.tokens) / len(ktoks)
    s = cover * (1.0 + min(2.0, hit / 10.0))
    if any(page.path.rstrip("/").endswith(x) for x in LEGAL):
        s *= 0.2
    if page.path in ("/", "/zh/"):
        s *= 0.75     # prefer a specific page over the homepage
    return s


def best_page(keyword: str, pages: list[Page], lang: str, *, min_score: float = 0.5) -> tuple[str, float]:
    cands = [p for p in pages if p.lang == lang] or pages
    if not cands:
        return "", 0.0
    best = max(cands, key=lambda p: score(keyword, p, lang))
    s = score(keyword, best, lang)
    return (best.path, s) if s >= min_score else ("", s)


def propose_url(cluster_slug: str, lang: str) -> str:
    prefix = "/zh/" if lang == "zh" else "/"
    return f"NEW {prefix}{cluster_slug}/"


def assign(rows: list[dict], lang: str, pages: list[Page] | None = None) -> list[dict]:
    """Add target_url / target_score / target_status to every row.
    Cluster pillar decides the cluster's page; satellites inherit unless they match a
    different page much better (then they get their own target)."""
    pages = pages if pages is not None else load_pages()
    by_cluster: dict[str, list[dict]] = {}
    for r in rows:
        by_cluster.setdefault(r.get("cluster_slug", ""), []).append(r)
    for slug, members in by_cluster.items():
        pillar = next((m for m in members if m.get("role") == "pillar"), members[0])
        p_path, p_score = best_page(pillar["keyword"], pages, lang)
        cluster_target = p_path or propose_url(slug or slugify(pillar["keyword"]), lang)
        for m in members:
            own_path, own_score = best_page(m["keyword"], pages, lang)
            if own_path and own_path != p_path and own_score >= max(1.2, p_score + 0.4):
                m["target_url"], m["target_score"], m["target_status"] = own_path, round(own_score, 2), "existing"
            else:
                m["target_url"] = cluster_target
                m["target_score"] = round(p_score if p_path else own_score, 2)
                m["target_status"] = "existing" if p_path else "new"
    return rows
