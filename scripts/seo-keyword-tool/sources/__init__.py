"""Free keyword data sources. Every source exposes `suggest(root, lang) -> list[Candidate]`."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class Candidate:
    keyword: str
    source: str
    rank: int = 0            # position in the suggestion list (0 = first)
    modifier: str = ""       # expansion modifier used (if any)
    extra: dict = field(default_factory=dict)


# Suffix / prefix modifiers used to expand the root keyword.
MODIFIERS = {
    "zh": {
        "suffix": ["", "价格", "多少钱", "费用", "推荐", "哪家好", "怎么用", "是什么", "软件", "系统",
                   "电话", "预约", "培训", "公司", "方案", "案例", "对比", "免费", "试用", "小企业",
                   "诊所", "美容院", "餐厅", "教程", "怎么做", "好用吗", "靠谱吗"],
        "prefix": ["", "什么是", "如何", "怎么", "最好的", "美国", "达拉斯", "德州", "华人"],
        "alpha": list("abcdefghijklmnopqrstuvwxyz") + list("0123456789"),
    },
    "en": {
        "suffix": ["", "pricing", "cost", "for small business", "software", "free", "reviews",
                   "vs", "near me", "for dental office", "for salon", "for clinic", "how to",
                   "what is", "best", "phone", "demo", "training", "course", "dallas", "texas"],
        "prefix": ["", "best", "how to", "what is", "cheap", "free", "top"],
        "alpha": list("abcdefghijklmnopqrstuvwxyz"),
    },
}
