"""Monthly search-volume *estimate* (no paid data).

Signals, in order of trust:
  1. Bing Webmaster Tools keyword API   (optional, needs BING_WEBMASTER_API_KEY in .dev.vars)
  2. Google Trends relative interest    (keyword vs. root, batches of 5; often 429s -> skipped)
  3. Demand heuristic                   (how many engines suggest it, at what rank, which modifier)

Absolute numbers come from a small calibration table of root keywords with
publicly quoted volumes. Everything else is scaled relative to its root, so
treat `vol` as an order-of-magnitude estimate and read `vol_band` instead of
the exact integer. Edit CALIBRATION when you learn a real number.
"""
from __future__ import annotations

import datetime as dt
import json
import math

from common import config, http
from common.text import dedupe_key, is_zh

# root keyword -> approx monthly searches (US for en, global Chinese for zh).
# Sources: public free tiers of keyword tools, 2025. Directionally right only.
CALIBRATION = {
    "ai receptionist": 5400,
    "ai phone answering": 1300,
    "ai answering service": 1900,
    "virtual receptionist": 12000,
    "answering service": 22000,
    "ai training": 9900,
    "ai training for employees": 720,
    "ai workshop": 1600,
    "ai前台": 260,
    "ai 前台": 260,
    "ai客服": 4400,
    "智能客服": 6600,
    "ai培训": 2900,
    "ai 培训": 2900,
    "企业ai培训": 480,
    "ai电话": 1900,
}
DEFAULT_ROOT_VOL = {"en": 800, "zh": 300}

BANDS = [(10, "0-10"), (100, "10-100"), (1000, "100-1k"), (10000, "1k-10k"), (100000, "10k-100k")]


def vol_band(v: float) -> str:
    for cap, name in BANDS:
        if v < cap:
            return name
    return "100k+"


# ---------------------------------------------------------------- Bing WMT (optional)
_BING_WMT = "https://ssl.bing.com/webmaster/api.svc/json/GetKeyword?apikey={key}&q={q}&country={cc}&language={lang}&startDate={d1}&endDate={d2}"


def bing_wmt_volume(keyword: str, lang: str) -> int | None:
    key = config.read_dev_var("BING_WEBMASTER_API_KEY")
    if not key:
        return None
    end = dt.date.today().replace(day=1) - dt.timedelta(days=1)
    start = (end - dt.timedelta(days=29))
    url = _BING_WMT.format(key=key, q=http.q(keyword), cc="cn" if lang == "zh" else "us",
                           lang="zh-CN" if lang == "zh" else "en-US",
                           d1=start.isoformat(), d2=end.isoformat())
    try:
        data = http.get_json(url, family="suggest", lang=lang, retries=0)
    except (http.HttpError, ValueError, json.JSONDecodeError) as e:
        http.log(f"  [bing-wmt] {e}")
        return None
    d = data.get("d") if isinstance(data, dict) else None
    if isinstance(d, dict):
        imp = d.get("Impressions") or d.get("BroadImpressions")
        if isinstance(imp, (int, float)):
            return int(imp)
    return None


# ---------------------------------------------------------------- heuristic
def root_volume(root: str, lang: str) -> tuple[int, str]:
    k = dedupe_key(root)
    for cal, v in CALIBRATION.items():
        if dedupe_key(cal) == k:
            return v, "calibration"
    return DEFAULT_ROOT_VOL["zh" if (lang == "zh" or is_zh(root)) else "en"], "default"


def demand_score(sources: list[str], best_rank: int, modifier: str, keyword: str, lang: str,
                 trends_value: float | None = None) -> float:
    """0-100. Higher = more engines surface it, earlier, with a lighter modifier."""
    distinct = {s for s in sources}
    score = 12.0 * min(4, len(distinct))               # up to 48
    score += 20.0 * max(0.0, 1.0 - best_rank / 10.0)    # up to 20
    if modifier == "":
        score += 22                                      # surfaced for the bare root
    elif len(modifier) == 1:
        score += 2                                       # a-z expansion = long-tail
    else:
        score += 9                                       # semantic modifier
    if trends_value is not None:
        score += 0.2 * min(100.0, float(trends_value))
    n = len(keyword) if lang == "zh" else len(keyword.split())
    if (lang == "zh" and n > 14) or (lang != "zh" and n > 6):
        score -= 12
    if "root" in distinct:
        score = 100.0
    return max(0.0, min(100.0, score))


def estimate(keyword: str, *, root: str, lang: str, sources: list[str], best_rank: int,
             modifier: str, trends_rel: float | None, trends_value: float | None,
             root_vol: int, use_bing_wmt: bool = False) -> dict:
    """Return {'vol': int, 'vol_band': str, 'vol_source': str, 'demand': float}."""
    dscore = demand_score(sources, best_rank, modifier, keyword, lang, trends_value)

    if use_bing_wmt:
        v = bing_wmt_volume(keyword, lang)
        if v is not None:
            return {"vol": v, "vol_band": vol_band(v), "vol_source": "bing_wmt", "demand": round(dscore, 1)}

    if dedupe_key(keyword) == dedupe_key(root):
        return {"vol": root_vol, "vol_band": vol_band(root_vol), "vol_source": "root", "demand": 100.0}

    if trends_rel is not None and trends_rel > 0:
        v = root_vol * trends_rel
        # blend with demand so a single noisy trends point cannot dominate
        v = 0.7 * v + 0.3 * root_vol * (dscore / 100.0) ** 2
        v = int(max(5, round(v, -1 if v >= 100 else 0)))
        return {"vol": v, "vol_band": vol_band(v), "vol_source": "trends", "demand": round(dscore, 1)}

    # pure heuristic: quadratic decay from root volume, floored at 5
    v = root_vol * (dscore / 100.0) ** 2.2
    v = int(max(5, round(v, -1 if v >= 100 else 0)))
    return {"vol": v, "vol_band": vol_band(v), "vol_source": "heuristic", "demand": round(dscore, 1)}


def log_bucket(v: int) -> int:
    return int(math.log10(max(1, v)))
