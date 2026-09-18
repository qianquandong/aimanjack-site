"""Pexels alt-text as a *visual topic* candidate source (optional, needs PEXELS_API_KEY).

Pexels tags what people photograph. For "ai receptionist" it returns alts like
"woman in headset at office front desk" — useful as content-angle / image-topic
candidates, not as search queries. Rows are tagged source=pexels_alt and their
demand score is intentionally low. English only (Pexels alts are English).
"""
from __future__ import annotations

import json
import re

from common import config, http
from common.text import dedupe_key, normalize
from . import Candidate

ENDPOINT = "https://api.pexels.com/v1/search?query={q}&per_page=30&locale={loc}"


def suggest(root: str, lang: str = "en", *, max_items: int = 12) -> list[Candidate]:
    key = config.read_dev_var("PEXELS_API_KEY")
    if not key or key.startswith("YOUR_"):
        return []
    loc = "zh-CN" if lang == "zh" else "en-US"
    try:
        data = http.get_json(ENDPOINT.format(q=http.q(root), loc=loc), family="suggest",
                             headers={"Authorization": key}, lang=lang)
    except (http.HttpError, json.JSONDecodeError) as e:
        http.log(f"  [pexels] {e}")
        return []
    out: list[Candidate] = []
    seen: set[str] = set()
    for i, ph in enumerate(data.get("photos", [])):
        alt = normalize(ph.get("alt") or "")
        alt = re.sub(r"\b(a|an|the|of|in|on|at|with|and)\b", " ", alt)
        alt = re.sub(r"\s+", " ", alt).strip()
        if not alt or len(alt) > 70:
            continue
        k = dedupe_key(alt)
        if k in seen:
            continue
        seen.add(k)
        out.append(Candidate(keyword=alt, source="pexels_alt", rank=i,
                             extra={"pexels_id": ph.get("id"), "page_url": ph.get("url")}))
        if len(out) >= max_items:
            break
    return out
