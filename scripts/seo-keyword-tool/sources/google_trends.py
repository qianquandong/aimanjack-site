"""Google Trends without pytrends: cookie handshake -> explore -> widget data.

Gives (a) relative interest 0-100 for up to 5 keywords per request, anchored on
the root keyword, and (b) related queries (top + rising) as extra candidates.
Trends rate-limits hard (429). We cache every response for CACHE_TTL and stop
calling once we hit 429 twice in a run.
"""
from __future__ import annotations

import json

from common import http
from common.text import dedupe_key
from . import Candidate

HOME = "https://trends.google.com/?geo=US"
EXPLORE = "https://trends.google.com/trends/api/explore?hl={hl}&tz=360&req={req}"
MULTILINE = "https://trends.google.com/trends/api/widgetdata/multiline?hl={hl}&tz=360&req={req}&token={tok}"
RELATED = "https://trends.google.com/trends/api/widgetdata/relatedsearches?hl={hl}&tz=360&req={req}&token={tok}"
PREFIX = ")]}',\n"

_disabled = False
_fail_count = 0


def _hl(lang: str) -> str:
    return "zh-CN" if lang == "zh" else "en-US"


def _explore(keywords: list[str], lang: str, geo: str, timeframe: str) -> dict | None:
    global _disabled, _fail_count
    if _disabled:
        return None
    req = {"comparisonItem": [{"keyword": k, "geo": geo, "time": timeframe} for k in keywords],
           "category": 0, "property": ""}
    url = EXPLORE.format(hl=_hl(lang), req=http.q(json.dumps(req, ensure_ascii=False)))
    try:
        # the NID cookie from the homepage is required, else explore returns 429/400
        http.get(HOME, family="trends", lang=lang, use_cache=False)
        return http.get_json(url, strip_prefix=PREFIX, family="trends", lang=lang, retries=1)
    except http.HttpError as e:
        http.log(f"  [trends] explore {e}")
        _fail_count += 1
        if _fail_count >= 2:
            _disabled = True
            http.log("  [trends] disabled for this run (rate limited); vol falls back to heuristic")
        return None
    except (json.JSONDecodeError, ValueError):
        return None


def _widget(widgets: list[dict], wid: str) -> dict | None:
    for w in widgets:
        if w.get("id") == wid:
            return w
    return None


def interest(keywords: list[str], lang: str = "en", geo: str = "", timeframe: str = "today 12-m") -> dict[str, float]:
    """Average weekly interest (0-100, relative within this batch) per keyword.
    Max 5 keywords per call. Missing keys => no data."""
    keywords = keywords[:5]
    data = _explore(keywords, lang, geo, timeframe)
    if not data:
        return {}
    w = _widget(data.get("widgets", []), "TIMESERIES")
    if not w:
        return {}
    url = MULTILINE.format(hl=_hl(lang), req=http.q(json.dumps(w["request"], ensure_ascii=False)), tok=w["token"])
    try:
        body = http.get_json(url, strip_prefix=PREFIX, family="trends", lang=lang, retries=1)
    except (http.HttpError, ValueError) as e:
        http.log(f"  [trends] multiline {e}")
        return {}
    series = body.get("default", {}).get("timelineData", [])
    if not series:
        return {k: 0.0 for k in keywords}
    n = len(keywords)
    sums = [0.0] * n
    for point in series:
        vals = point.get("value", [])
        for i in range(min(n, len(vals))):
            sums[i] += float(vals[i])
    return {keywords[i]: round(sums[i] / len(series), 2) for i in range(n)}


def related_queries(root: str, lang: str = "en", geo: str = "", timeframe: str = "today 12-m") -> list[Candidate]:
    data = _explore([root], lang, geo, timeframe)
    if not data:
        return []
    w = _widget(data.get("widgets", []), "RELATED_QUERIES")
    if not w:
        return []
    url = RELATED.format(hl=_hl(lang), req=http.q(json.dumps(w["request"], ensure_ascii=False)), tok=w["token"])
    try:
        body = http.get_json(url, strip_prefix=PREFIX, family="trends", lang=lang, retries=1)
    except (http.HttpError, ValueError) as e:
        http.log(f"  [trends] related {e}")
        return []
    out: list[Candidate] = []
    seen: set[str] = set()
    for li, ranked in enumerate(body.get("default", {}).get("rankedList", [])):
        kind = "top" if li == 0 else "rising"
        for i, item in enumerate(ranked.get("rankedKeyword", [])):
            q = item.get("query", "")
            k = dedupe_key(q)
            if q and k not in seen:
                seen.add(k)
                out.append(Candidate(keyword=q, source=f"trends_{kind}", rank=i,
                                     extra={"trends_value": item.get("value"), "formatted": item.get("formattedValue")}))
    return out
