"""Reddit thread titles as long-tail / question candidates (old.reddit JSON, no auth).

Reddit is English-centric; for zh we still try (Chinese-language subs exist) but
usually return few results. Falls back to a DuckDuckGo `site:reddit.com` scrape.
"""
from __future__ import annotations

import html as html_mod
import re

from common import http
from common.text import dedupe_key, contains_root, normalize
from . import Candidate

SEARCH = "https://old.reddit.com/search.json?q={q}&limit=25&sort=relevance&t=year"
DDG_HTML = "https://html.duckduckgo.com/html/?q={q}"
UA = {"User-Agent": "Mozilla/5.0 (compatible; seo-keyword-tool/0.1; +https://aimanjack.com)"}

QUESTION_PAT = re.compile(
    r"^(how|what|why|which|is|are|does|do|can|should|anyone|best|has|who|where)\b", re.I)


def _titles_reddit(query: str) -> list[dict]:
    try:
        data = http.get_json(SEARCH.format(q=http.q(query)), family="reddit", headers=UA)
    except http.HttpError as e:
        http.log(f"  [reddit] {e}")
        return []
    posts = []
    for ch in (data.get("data", {}).get("children") or []):
        d = ch.get("data", {})
        posts.append({"title": d.get("title", ""), "sub": d.get("subreddit", ""),
                      "score": d.get("score", 0), "comments": d.get("num_comments", 0),
                      "url": "https://www.reddit.com" + d.get("permalink", "")})
    return posts


def _titles_ddg(query: str) -> list[dict]:
    try:
        body = http.get(DDG_HTML.format(q=http.q(f"{query} site:reddit.com")), family="reddit")
    except http.HttpError as e:
        http.log(f"  [reddit/ddg] {e}")
        return []
    out = []
    for m in re.finditer(r'class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)</a>', body, re.S):
        title = html_mod.unescape(re.sub(r"<[^>]+>", "", m.group(2))).strip()
        title = re.sub(r"\s*:\s*r/\w+\s*-\s*Reddit$", "", title)
        title = re.sub(r"\s*-\s*Reddit$", "", title)
        out.append({"title": title, "sub": "", "score": 0, "comments": 0, "url": m.group(1)})
    return out


def _clean_title(t: str) -> str:
    t = re.sub(r"\[[^\]]*\]|\([^)]*\)", " ", t)          # [Question] (2024)
    t = re.sub(r"[^\w\s一-鿿'?-]", " ", t)
    t = re.sub(r"\s+", " ", t).strip(" ?.-!")
    return t


def suggest(root: str, lang: str = "en", *, max_items: int = 20) -> list[Candidate]:
    posts = _titles_reddit(root) or _titles_ddg(root)
    out: list[Candidate] = []
    seen: set[str] = set()
    for i, p in enumerate(posts):
        t = _clean_title(p["title"])
        if not t or len(t) > 90:
            continue
        low = normalize(t)
        # keep titles that mention the root idea OR are questions about it
        if not contains_root(low, root) and not QUESTION_PAT.match(low):
            continue
        k = dedupe_key(low)
        if k in seen:
            continue
        seen.add(k)
        out.append(Candidate(keyword=low, source="reddit", rank=i,
                             extra={"sub": p["sub"], "score": p["score"], "comments": p["comments"], "url": p["url"]}))
        if len(out) >= max_items:
            break
    return out
