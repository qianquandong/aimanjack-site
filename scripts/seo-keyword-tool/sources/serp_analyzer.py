"""Top-10 SERP fetch + feature detection via Bing HTML (no API key, stable markup).

Google SERP HTML is bot-walled; Bing's `b_algo` list is a good proxy for
"who ranks for this" and supports zh-CN and en-US markets. Baidu's result page
throws a captcha from datacenter IPs so it is not used.
"""
from __future__ import annotations

import html as html_mod
import re
from dataclasses import dataclass, field
from urllib.parse import urlparse

from common import http

SEARCH = "https://www.bing.com/search?q={q}&setlang={lang}&cc={cc}&count=10"

FEATURE_CLASSES = {
    "ads": r'class="[^"]*\bb_ad\b',
    "answer_box": r'class="[^"]*\bb_ans\b',
    "video": r'class="[^"]*\bb_vidAns\b|mm_vtvc',
    "images": r'class="[^"]*\bb_imgAns\b|imgSetsBox',
    "people_also_ask": r'df_alaskcarousel|class="[^"]*\bb_expando\b|class="[^"]*\bb_hPanel\b',
    "related_searches": r'class="[^"]*\bb_rs\b',
    "shopping": r'class="[^"]*\bb_prod\b|pa_shop',
    "local_pack": r'class="[^"]*\bb_localAns\b|lMapContainer',
}


@dataclass
class SerpResult:
    position: int
    url: str
    domain: str
    title: str
    snippet: str = ""


@dataclass
class Serp:
    keyword: str
    lang: str
    results: list[SerpResult] = field(default_factory=list)
    total_results: int = 0
    features: dict = field(default_factory=dict)
    ok: bool = True
    error: str = ""


def _domain(url: str) -> str:
    try:
        host = urlparse(url).hostname or ""
    except Exception:
        return ""
    return host[4:] if host.startswith("www.") else host


def _strip(s: str) -> str:
    return html_mod.unescape(re.sub(r"<[^>]+>", "", s)).strip()


def parse(html: str, keyword: str, lang: str) -> Serp:
    serp = Serp(keyword=keyword, lang=lang)
    chunks = re.split(r'<li class="b_algo"', html)[1:]
    for i, chunk in enumerate(chunks[:10]):
        chunk = chunk.split("</li>", 1)[0]
        m = re.search(r'<h2[^>]*>\s*<a[^>]+href="(https?://[^"]+)"[^>]*>(.*?)</a>\s*</h2>', chunk, re.S)
        if not m:
            m2 = re.search(r'href="(https?://[^"]+)"', chunk)
            if not m2:
                continue
            url, title = m2.group(1), _strip(re.search(r"<h2[^>]*>(.*?)</h2>", chunk, re.S).group(1) if "<h2" in chunk else "")
        else:
            url, title = m.group(1), _strip(m.group(2))
        url = html_mod.unescape(url)
        snippet_m = re.search(r'<p[^>]*class="[^"]*b_lineclamp[^"]*"[^>]*>(.*?)</p>|<p[^>]*>(.*?)</p>', chunk, re.S)
        snippet = _strip(snippet_m.group(1) or snippet_m.group(2) or "") if snippet_m else ""
        serp.results.append(SerpResult(position=i + 1, url=url, domain=_domain(url), title=title, snippet=snippet[:200]))

    cm = re.search(r'class="sb_count"[^>]*>([^<]+)<', html)
    if cm:
        digits = re.sub(r"[^\d]", "", cm.group(1))
        serp.total_results = int(digits) if digits else 0
    for name, pat in FEATURE_CLASSES.items():
        n = len(re.findall(pat, html))
        if n:
            serp.features[name] = n
    return serp


def fetch(keyword: str, lang: str = "en") -> Serp:
    setlang, cc = ("zh-CN", "CN") if lang == "zh" else ("en-US", "US")
    url = SEARCH.format(q=http.q(keyword), lang=setlang, cc=cc)
    try:
        html = http.get(url, family="serp", lang=lang)
    except http.HttpError as e:
        s = Serp(keyword=keyword, lang=lang, ok=False, error=str(e))
        http.log(f"  [serp] {e}")
        return s
    serp = parse(html, keyword, lang)
    if not serp.results:
        serp.ok = False
        serp.error = "no organic results parsed"
    return serp
