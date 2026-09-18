"""百度下拉联想 (sugrec) — 中文站专用候选来源.

百度结果页 (相关搜索) 会触发安全验证, 所以这里只用联想接口,
并用修饰词做扩展 (价格 / 多少钱 / 哪家好 ...) 来模拟相关搜索.
"""
from __future__ import annotations

from common import http
from common.text import dedupe_key
from . import MODIFIERS, Candidate

ENDPOINT = "https://www.baidu.com/sugrec?prod=pc&ie=utf-8&wd={q}"


def _fetch(query: str) -> list[str]:
    try:
        data = http.get_json(ENDPOINT.format(q=http.q(query)), family="suggest", lang="zh",
                             headers={"Referer": "https://www.baidu.com/"})
    except http.HttpError as e:
        http.log(f"  [baidu] {e}")
        return []
    items = data.get("g") or []
    return [it.get("q", "") for it in items if isinstance(it, dict) and it.get("q")]


def suggest(root: str, lang: str = "zh", *, alpha: bool = True) -> list[Candidate]:
    if lang != "zh":
        return []
    out: list[Candidate] = []
    seen: set[str] = set()
    mods = MODIFIERS["zh"]
    queries = [(root, "")]
    for m in mods["suffix"][1:]:
        queries.append((f"{root}{m}", m))
    for m in mods["prefix"][1:]:
        queries.append((f"{m}{root}", m))
    if alpha:
        # 百度联想对空格敏感, 用不带空格的写法
        for a in mods["alpha"][:26]:
            queries.append((f"{root}{a}", a))
    for qtext, mod in queries:
        for i, s in enumerate(_fetch(qtext)):
            k = dedupe_key(s)
            if k not in seen:
                seen.add(k)
                out.append(Candidate(keyword=s, source="baidu_suggest", rank=i, modifier=mod))
    return out
