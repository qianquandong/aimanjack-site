"""Bing Autosuggest (free OpenSearch JSON endpoint, supports zh-CN market)."""
from __future__ import annotations

from common import http
from common.text import dedupe_key
from . import MODIFIERS, Candidate

ENDPOINT = "https://api.bing.com/osjson.aspx?mkt={mkt}&query={q}"


def _fetch(query: str, lang: str) -> list[str]:
    mkt = "zh-CN" if lang == "zh" else "en-US"
    try:
        data = http.get_json(ENDPOINT.format(mkt=mkt, q=http.q(query)), family="suggest", lang=lang)
    except http.HttpError as e:
        http.log(f"  [bing] {e}")
        return []
    if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
        return [s for s in data[1] if isinstance(s, str)]
    return []


def suggest(root: str, lang: str = "en", *, alpha: bool = False) -> list[Candidate]:
    out: list[Candidate] = []
    seen: set[str] = set()
    mods = MODIFIERS[lang]
    queries = [(root, "")]
    for m in mods["suffix"][1:12]:
        queries.append((f"{root}{m}" if lang == "zh" else f"{root} {m}", m))
    for m in mods["prefix"][1:6]:
        queries.append((f"{m}{root}" if lang == "zh" else f"{m} {root}", m))
    if alpha:
        for a in mods["alpha"][:26]:
            queries.append((f"{root} {a}", a))
    for qtext, mod in queries:
        for i, s in enumerate(_fetch(qtext, lang)):
            k = dedupe_key(s)
            if k not in seen:
                seen.add(k)
                out.append(Candidate(keyword=s, source="bing_suggest", rank=i, modifier=mod))
    return out
