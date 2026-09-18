"""DuckDuckGo autocomplete (free, generous rate limit). Mostly useful for EN."""
from __future__ import annotations

from common import http
from common.text import dedupe_key
from . import MODIFIERS, Candidate

ENDPOINT = "https://duckduckgo.com/ac/?type=list&kl={kl}&q={q}"


def _fetch(query: str, lang: str) -> list[str]:
    kl = "cn-zh" if lang == "zh" else "us-en"
    try:
        data = http.get_json(ENDPOINT.format(kl=kl, q=http.q(query)), family="suggest", lang=lang)
    except http.HttpError as e:
        http.log(f"  [ddg] {e}")
        return []
    if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
        return [s for s in data[1] if isinstance(s, str)]
    return []


def suggest(root: str, lang: str = "en") -> list[Candidate]:
    out: list[Candidate] = []
    seen: set[str] = set()
    mods = MODIFIERS[lang]
    queries = [(root, "")] + [((f"{root}{m}" if lang == "zh" else f"{root} {m}"), m) for m in mods["suffix"][1:10]]
    for qtext, mod in queries:
        for i, s in enumerate(_fetch(qtext, lang)):
            k = dedupe_key(s)
            if k not in seen:
                seen.add(k)
                out.append(Candidate(keyword=s, source="ddg_suggest", rank=i, modifier=mod))
    return out
