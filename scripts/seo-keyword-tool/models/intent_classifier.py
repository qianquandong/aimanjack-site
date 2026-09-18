"""Search-intent classification: regex first, optional local LLM second pass.

Labels: informational | commercial | transactional | navigational
LLM pass (optional, off by default): `--llm claude` shells out to the local
Claude Code CLI (`claude -p`), which uses your subscription, no API key. Only
keywords the regex could not confidently label are sent, in one batch.
"""
from __future__ import annotations

import json
import re
import shutil
import subprocess

from common import http

PATTERNS = {
    "zh": {
        "transactional": r"价格|多少钱|费用|报价|收费|套餐|购买|订购|下载|免费|试用|注册|开通|预约|办理|申请|租|买|定制|搭建|部署|开发|报名",
        "commercial": r"推荐|哪家|哪个好|哪种|对比|排名|排行|评测|测评|好用|最好|品牌|top\s*\d*|靠谱|口碑|优缺点|区别|vs|哪些|前十|十大|选择|怎么选|比较",
        "informational": r"是什么|什么是|怎么|如何|为什么|教程|介绍|原理|意思|方法|指南|吗$|能不能|可以|案例|周报|模板|范文|设计|图片|培训|学习|课程|入门|应用|作用|好处|优势|流程|步骤",
        "navigational": r"官网|登录|登陆|app$|小程序|公众号|客服电话|下载安装",
    },
    "en": {
        "transactional": r"\b(pric(e|es|ing)|cost|costs|buy|purchase|order|book|hire|demo|free trial|trial|sign ?up|subscribe|download|quote|near me|coupon|discount|deal|register|enroll|get started)\b",
        "commercial": r"\b(best|top|review|reviews|vs|versus|compar(e|ison)|alternative|alternatives|rank(ed|ing)|cheap|affordable|which|option|options|provider|providers|compan(y|ies)|service|services|software|tool|tools|platform|solution|solutions|for (small business|dental|dentist|law firm|clinic|salon|spa|restaurant|hvac|plumb|real estate|medical|contractor|auto|dealership)s?)\b",
        "informational": r"\b(what|what's|how|why|when|who|guide|tutorial|example|examples|meaning|definition|learn|explained|tips|ideas|benefits|pros|cons|does|do|can|is|are|should|course|training|template|checklist|statistics|history)\b",
        "navigational": r"\b(login|log in|sign in|official|website|app|portal|dashboard|support|phone number|customer service)\b",
    },
}
# Known brands => navigational when the keyword is basically "brand (+ generic)".
BRANDS = [
    "ringcentral", "dialpad", "smith.ai", "smith ai", "ruby receptionist", "goodcall", "bland ai",
    "vapi", "retell", "synthflow", "podium", "weave", "nextiva", "grasshopper", "ooma", "gohighlevel",
    "openai", "chatgpt", "gemini", "kimi", "deepseek", "doubao", "豆包", "通义", "千问", "文心", "讯飞",
    "钉钉", "飞书", "企业微信", "腾讯", "阿里", "百度", "华为", "小米", "字节", "亚马逊", "微软",
    "aimanjack", "jack qian",
]
ORDER = ["transactional", "commercial", "navigational", "informational"]


def classify_regex(keyword: str, lang: str) -> tuple[str, float]:
    """Return (label, confidence). Confidence 0.3 means 'default guess'."""
    kw = keyword.lower().strip()
    pats = PATTERNS["zh" if lang == "zh" else "en"]
    hits = {lab: len(re.findall(p, kw, re.I)) for lab, p in pats.items()}
    brand_hit = any(b in kw for b in BRANDS)
    if brand_hit and hits["transactional"] == 0 and hits["commercial"] == 0:
        return "navigational", 0.8
    if brand_hit and hits["commercial"]:
        return "commercial", 0.7   # "ringcentral vs dialpad"
    total = sum(hits.values())
    if total == 0:
        # bare head term: for a product/service noun phrase, buyers dominate => commercial
        return "commercial", 0.3
    best = max(ORDER, key=lambda l: (hits[l], -ORDER.index(l)))
    conf = 0.6 if hits[best] == 1 else 0.85
    if best == "informational" and hits["transactional"]:
        best, conf = "transactional", 0.65   # "how much does X cost"
    return best, conf


def classify_llm(keywords: list[str], lang: str, model: str = "haiku") -> dict[str, str]:
    """Batch-classify with the local `claude` CLI. Returns {} if unavailable."""
    if not keywords or not shutil.which("claude"):
        http.log("  [llm] claude CLI not found, skipping LLM pass")
        return {}
    prompt = (
        "You are an SEO analyst. Classify each search keyword's dominant intent as exactly one of: "
        "informational, commercial, transactional, navigational. "
        f"Language: {'Chinese' if lang == 'zh' else 'English'}. "
        "Reply with ONLY a JSON object mapping keyword -> label, no prose.\n\n"
        + json.dumps(keywords, ensure_ascii=False)
    )
    try:
        out = subprocess.run(
            ["claude", "-p", "--model", model, "--output-format", "text", prompt],
            capture_output=True, text=True, timeout=120,
        )
        txt = out.stdout.strip()
        m = re.search(r"\{.*\}", txt, re.S)
        data = json.loads(m.group(0)) if m else {}
        return {k: v for k, v in data.items() if v in ORDER}
    except Exception as e:  # noqa: BLE001
        http.log(f"  [llm] failed: {e}")
        return {}


def classify_all(keywords: list[str], lang: str, llm: str | None = None) -> dict[str, dict]:
    res: dict[str, dict] = {}
    unsure: list[str] = []
    for kw in keywords:
        lab, conf = classify_regex(kw, lang)
        res[kw] = {"intent": lab, "confidence": conf, "method": "regex"}
        if conf < 0.6:
            unsure.append(kw)
    if llm and unsure:
        http.log(f"  [llm] sending {len(unsure)} low-confidence keywords to {llm}")
        fixed = classify_llm(unsure, lang, "haiku" if llm in ("claude", "haiku") else llm)
        for kw, lab in fixed.items():
            if kw in res:
                res[kw] = {"intent": lab, "confidence": 0.75, "method": "llm"}
    return res
