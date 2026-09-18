"""Google Autocomplete (free, undocumented `suggestqueries` endpoint)."""
from __future__ import annotations

from common import http
from common.text import dedupe_key
from . import MODIFIERS, Candidate

ENDPOINT = "https://suggestqueries.google.com/complete/search?client=firefox&hl={hl}&gl={gl}&q={q}"


def _fetch(query: str, lang: str) -> list[str]:
    hl, gl = ("zh-CN", "us") if lang == "zh" else ("en", "us")
    url = ENDPOINT.format(hl=hl, gl=gl, q=http.q(query))
    try:
        data = http.get_json(url, family="suggest", lang=lang)
    except http.HttpError as e:
        http.log(f"  [google] {e}")
        return []
    if isinstance(data, list) and len(data) > 1 and isinstance(data[1], list):
        return [s for s in data[1] if isinstance(s, str)]
    return []


def suggest(root: str, lang: str = "en", *, depth: int = 1, alpha: bool = True) -> list[Candidate]:
    """Expand `root` with modifiers (and a-z) via Google Autocomplete."""
    out: list[Candidate] = []
    seen: set[str] = set()
    mods = MODIFIERS[lang]
    queries: list[tuple[str, str]] = [(root, "")]
    joiner = "" if lang == "zh" else " "
    for m in mods["suffix"][1:]:
        queries.append((f"{root}{joiner}{m}" if lang == "zh" else f"{root} {m}", m))
    for m in mods["prefix"][1:]:
        queries.append((f"{m}{root}" if lang == "zh" else f"{m} {root}", m))
    if alpha:
        for a in mods["alpha"]:
            queries.append((f"{root} {a}", a))

    for qtext, mod in queries:
        for i, s in enumerate(_fetch(qtext, lang)):
            k = dedupe_key(s)
            if k in seen:
                continue
            seen.add(k)
            out.append(Candidate(keyword=s, source="google_autocomplete", rank=i, modifier=mod))

    # one level of recursion on the top suggestions
    if depth > 1:
        for c in list(out)[:15]:
            for i, s in enumerate(_fetch(c.keyword, lang)):
                k = dedupe_key(s)
                if k not in seen:
                    seen.add(k)
                    out.append(Candidate(keyword=s, source="google_autocomplete", rank=i, modifier=c.keyword))
    return out
