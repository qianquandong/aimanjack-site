"""Free keyword difficulty + volume estimator. No external API keys required.

KD heuristic (0-100):
  - Built-in authority table for known domains (Wikipedia/Zhihu/Reddit/etc.)
  - TLD/hosting heuristic for unknown domains
  - Top-10 SERP position-weighted authority
  - SERP feature / ad pressure adjustment
  - UGC discount when forums dominate the SERP (weak SERP = opportunity)

Volume estimator (0-100, normalised, NOT absolute search counts):
  - "evidence 0"   — keyword appeared in autocomplete (any source)
  - "evidence 1"   — Google Trends returns interest > 0
  - "evidence 2"   — Trends rising/breakout signal
  - "evidence 3"   — multiple independent sources confirm
  Composite score is mapped to 0-100 by piece-wise scaling and is intentionally
  conservative: a "100" here is roughly a 10k+/mo English head term.
"""
from __future__ import annotations

import math
import re
from urllib.parse import urlparse

from sources.serp_analyzer import Serp

KNOWN = {
    "google.com": 100, "youtube.com": 100, "wikipedia.org": 99, "facebook.com": 99,
    "amazon.com": 98, "apple.com": 98, "microsoft.com": 98, "linkedin.com": 98,
    "instagram.com": 97, "x.com": 97, "twitter.com": 97, "reddit.com": 96,
    "github.com": 96, "medium.com": 95, "quora.com": 93, "openai.com": 93,
    "chatgpt.com": 90, "gemini.google.com": 90, "forbes.com": 94, "nytimes.com": 95,
    "techcrunch.com": 93, "hubspot.com": 93, "zapier.com": 91, "shopify.com": 95,
    "wordpress.com": 94, "capterra.com": 90, "g2.com": 91, "trustpilot.com": 90,
    "yelp.com": 94, "indeed.com": 92, "glassdoor.com": 90, "fiverr.com": 90,
    "upwork.com": 90, "udemy.com": 92, "coursera.org": 93, "salesforce.com": 96,
    "zendesk.com": 91, "intercom.com": 88, "ringcentral.com": 88, "dialpad.com": 82,
    "twilio.com": 90, "vonage.com": 86, "gohighlevel.com": 78, "smith.ai": 72,
    "ruby.com": 74, "goodcall.com": 60, "bland.ai": 62, "vapi.ai": 64,
    "retellai.com": 58, "synthflow.ai": 55, "podium.com": 76, "weave.com": 70,
    "nextiva.com": 82, "ooma.com": 78, "grasshopper.com": 74, "deepai.org": 78,
    "ibm.com": 96, "aws.amazon.com": 96, "cloud.google.com": 95, "nvidia.com": 94,
    "canva.com": 93, "notion.so": 90, "producthunt.com": 88, "ycombinator.com": 90,
    "baidu.com": 99, "zhihu.com": 95, "bilibili.com": 94, "weibo.com": 95,
    "csdn.net": 90, "jianshu.com": 85, "sohu.com": 92, "163.com": 93,
    "qq.com": 96, "sina.com.cn": 92, "douban.com": 88, "xiaohongshu.com": 88,
    "taobao.com": 95, "tmall.com": 93, "jd.com": 94, "aliyun.com": 92,
    "tencent.com": 94, "cloud.tencent.com": 90, "huaweicloud.com": 88,
    "volcengine.com": 82, "kimi.com": 78, "moonshot.cn": 72, "deepseek.com": 84,
    "doubao.com": 80, "qianwen.aigc.cn": 70, "jimeng.jianying.com": 74,
    "36kr.com": 88, "sspai.com": 78, "juejin.cn": 82, "segmentfault.com": 80,
    "toutiao.com": 92, "zhipin.com": 84, "liepin.com": 78, "cnblogs.com": 82,
    "oschina.net": 78, "gitee.com": 80, "yuque.com": 78, "feishu.cn": 86,
    "dingtalk.com": 84, "wps.cn": 80, "meituan.com": 88, "dianping.com": 86,
    "tieba.baidu.com": 90, "zhidao.baidu.com": 92, "baijiahao.baidu.com": 90,
    "jingyan.baidu.com": 85, "wenku.baidu.com": 88, "mbd.baidu.com": 85,
    "bing.com": 97, "sogou.com": 90, "so.com": 88, "aimanjack.com": 12,
}
UGC_DOMAINS = {
    "reddit.com", "quora.com", "zhihu.com", "tieba.baidu.com", "zhidao.baidu.com",
    "douban.com", "facebook.com", "instagram.com", "tiktok.com", "xiaohongshu.com",
    "bilibili.com", "medium.com", "csdn.net", "jianshu.com", "toutiao.com",
    "baijiahao.baidu.com",
}
TRUST_TLDS = {".gov": 70, ".edu": 65, ".org": 25, ".io": 30}


def _authority(url: str) -> int:
    host = urlparse(url).netloc.lower().lstrip("www.")
    if host in KNOWN:
        return KNOWN[host]
    base = urlparse(url).hostname or ""
    for suf, sc in TRUST_TLDS.items():
        if base.endswith(suf):
            return sc
    parts = host.split(".")
    if len(parts) >= 2:
        tld = "." + parts[-1]
        if tld in {".com", ".net", ".cn", ".com.cn"}:
            return 35
    return 25


def _is_homepage(url: str) -> bool:
    from urllib.parse import urlparse
    p = urlparse(url)
    return p.path in ("", "/", "/index", "/index.html", "/index.php")


def score_serp(serp: Serp) -> int:
    """0-100 keyword difficulty based on the top-10 SERP."""
    if not serp.results:
        return 50
    raw = 0.0
    for i, r in enumerate(serp.results[:10]):
        weight = 1.0 / (i + 1)
        auth = _authority(r.url)
        if _is_homepage(r.url):
            auth = min(100, auth + 8)
        raw += weight * auth
    base = raw / sum(1.0 / (i + 1) for i in range(min(10, len(serp.results))))
    feats = serp.features or {}
    if feats.get("answer_box"):
        base += 4
    if feats.get("people_also_ask"):
        base += 3
    if feats.get("ads"):
        base += 6
    if feats.get("local_pack"):
        base += 5
    if feats.get("images"):
        base += 2
    if feats.get("video"):
        base += 2
    ugc_hits = sum(1 for r in serp.results[:10] if (r.domain or "").lower() in UGC_DOMAINS)
    if ugc_hits >= 6:
        base -= 18
    elif ugc_hits >= 4:
        base -= 10
    elif ugc_hits >= 2:
        base -= 4
    return max(0, min(100, int(round(base))))


def _label(kd: int) -> str:
    if kd <= 15:
        return "very_easy"
    if kd <= 30:
        return "easy"
    if kd <= 50:
        return "medium"
    if kd <= 70:
        return "hard"
    return "very_hard"


def estimate_volume(keyword: str, *, in_autocomplete: bool, trends_interest: int,
                    trends_breakout: bool, source_count: int) -> tuple[int, str]:
    """Return (volume 0-100, evidence_tier: 'unknown'|'weak'|'moderate'|'strong')."""
    score = 0
    if in_autocomplete:
        score += 8
    if trends_interest > 0:
        score += min(60, trends_interest * 0.55)
    if trends_breakout:
        score += 18
    if source_count >= 3:
        score += 10
    elif source_count == 2:
        score += 5
    score = max(0, min(100, int(round(score))))
    if score == 0:
        return 0, "unknown"
    if score < 20:
        return score, "weak"
    if score < 55:
        return score, "moderate"
    return score, "strong"


def difficulty_label(kd: int) -> str:
    return _label(kd)