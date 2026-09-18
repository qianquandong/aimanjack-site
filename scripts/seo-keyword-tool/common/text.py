"""Tokenisation, normalisation and slug helpers for zh / en keywords.

Chinese tokenisation uses jieba when installed, otherwise falls back to
character bigrams (good enough for TF-IDF similarity on short keywords).
"""
from __future__ import annotations

import re
import unicodedata

try:  # optional
    import jieba  # type: ignore

    jieba.setLogLevel(60)
    _HAS_JIEBA = True
except Exception:  # pragma: no cover
    _HAS_JIEBA = False

CJK = re.compile(r"[一-鿿]")
LATIN_WORD = re.compile(r"[a-z0-9][a-z0-9+#.\-]*")
STOP_EN = {
    "a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "is", "are",
    "what", "how", "do", "does", "can", "my", "your", "vs", "be", "it", "at", "by",
}
STOP_ZH = {"的", "了", "是", "吗", "呢", "和", "与", "及", "在", "有", "什么", "怎么", "如何"}

# Pinyin-ish transliteration for slugs of common site vocabulary (no pypinyin dependency).
ZH_SLUG_MAP = {
    "前台": "qiantai", "接待": "jiedai", "预约": "yuyue", "培训": "peixun", "达拉斯": "dallas",
    "团队": "tuandui", "价格": "jiage", "费用": "feiyong", "多少钱": "duoshaoqian", "非技术": "feijishu",
    "电话": "dianhua", "客服": "kefu", "机器人": "jiqiren", "软件": "ruanjian", "系统": "xitong",
    "公司": "gongsi", "智能": "zhineng", "语音": "yuyin", "助手": "zhushou", "小企业": "xiaoqiye",
    "企业": "qiye", "课程": "kecheng", "工具": "gongju", "自动": "zidong", "回复": "huifu",
    "短信": "duanxin", "诊所": "zhensuo", "美容": "meirong", "美发": "meifa", "牙科": "yake",
    "餐厅": "canting", "酒店": "jiudian", "推荐": "tuijian", "对比": "duibi", "评测": "pingce",
    "教程": "jiaocheng", "免费": "mianfei", "试用": "shiyong", "方案": "fangan", "服务": "fuwu",
    "德州": "texas", "美国": "usa", "华人": "huaren", "中文": "zhongwen", "老板": "laoban",
    "员工": "yuangong", "内训": "neixun", "学习": "xuexi", "入门": "rumen", "应用": "yingyong",
    "案例": "anli", "商家": "shangjia", "门店": "mendian", "接电话": "jiedianhua", "数字人": "shuziren",
    "虚拟": "xuni", "设计": "sheji", "图片": "tupian", "周报": "zhoubao", "官网": "guanwang",
    "下载": "xiazai", "登录": "denglu", "怎么": "zenme", "什么": "shenme", "如何": "ruhe",
    "是": "shi", "的": "", "和": "he", "与": "yu", "吗": "", "好": "hao", "哪家": "najia",
    "哪个": "nage", "排名": "paiming", "最好": "zuihao", "用": "yong", "做": "zuo",
    "开发": "kaifa", "定制": "dingzhi", "搭建": "dajian", "部署": "bushu", "私有": "siyou",
}


def normalize(kw: str) -> str:
    """Lowercase, NFKC, collapse whitespace, drop surrounding punctuation."""
    s = unicodedata.normalize("NFKC", kw or "").lower().strip()
    s = re.sub(r"[\s　]+", " ", s)
    s = s.strip(" \t,.;:!?，。；：！？\"'`“”‘’()（）[]【】")
    # remove the space between CJK chars and latin ('ai 前台' -> 'ai前台') for dedupe key only
    return s


def dedupe_key(kw: str) -> str:
    s = normalize(kw)
    s = re.sub(r"(?<=[一-鿿])\s+|\s+(?=[一-鿿])", "", s)
    return s


def is_zh(text: str) -> bool:
    return bool(CJK.search(text or ""))


def detect_lang(text: str) -> str:
    return "zh" if is_zh(text) else "en"


def tokenize(text: str, lang: str | None = None) -> list[str]:
    """Return tokens for similarity/overlap scoring."""
    text = normalize(text)
    lang = lang or detect_lang(text)
    toks: list[str] = []
    # latin words always
    toks += [t for t in LATIN_WORD.findall(text) if t not in STOP_EN and len(t) > 1]
    if lang == "zh" or is_zh(text):
        cjk_runs = re.findall(r"[一-鿿]+", text)
        for run in cjk_runs:
            if _HAS_JIEBA:
                words = [w for w in jieba.lcut(run) if w.strip() and w not in STOP_ZH]
                toks += words
                # also add bigrams so near-synonyms still overlap
                toks += [run[i:i + 2] for i in range(len(run) - 1)]
            else:
                if len(run) == 1:
                    toks.append(run)
                toks += [run[i:i + 2] for i in range(len(run) - 1)]
                # trigrams help longer compounds like 数字人前台
                toks += [run[i:i + 3] for i in range(len(run) - 2)]
    return toks


def slugify(text: str, max_len: int = 48) -> str:
    """ASCII slug for filenames / URLs. Chinese words use the built-in map,
    unmapped CJK is dropped; if nothing is left we use a short hash."""
    s = normalize(text)
    for zh, py in sorted(ZH_SLUG_MAP.items(), key=lambda kv: -len(kv[0])):
        if zh in s:
            s = s.replace(zh, f" {py} ")
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    s = re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")
    s = re.sub(r"-{2,}", "-", s)
    if not s:
        import hashlib

        s = "kw-" + hashlib.md5(text.encode()).hexdigest()[:6]
    return s[:max_len].strip("-")


def contains_root(kw: str, root: str) -> bool:
    """True if the keyword contains all latin words + all CJK chars of the root."""
    k = dedupe_key(kw)
    r = dedupe_key(root)
    for w in LATIN_WORD.findall(r):
        if w not in k:
            return False
    cjk = "".join(CJK.findall(r))
    return all(c in k for c in cjk)
