"""Paths and shared constants. No root-level config files are touched."""
from __future__ import annotations

import os
from pathlib import Path

TOOL_DIR = Path(__file__).resolve().parent.parent          # scripts/seo-keyword-tool
SITE_ROOT = TOOL_DIR.parent.parent                          # repo root
OUT_DIR = SITE_ROOT / "state" / "seo" / "keyword-research"
CACHE_DIR = OUT_DIR / ".cache"

SITEMAP_PATH = SITE_ROOT / "sitemap.xml"
SITE_ORIGIN = "https://aimanjack.com"

USER_AGENT = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
)

# Seconds a cached HTTP response stays valid.
CACHE_TTL = int(os.environ.get("SEO_CACHE_TTL", 7 * 24 * 3600))

# Polite delays between live requests, per host family.
DELAY = {
    "suggest": 0.35,
    "serp": 0.9,
    "trends": 1.6,
    "reddit": 1.2,
}


def ensure_dirs() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    gi = OUT_DIR / ".gitignore"
    if not gi.exists():
        gi.write_text(".cache/\n", encoding="utf-8")


def read_dev_var(name: str) -> str | None:
    """Read a KEY=value line from the repo's .dev.vars (falls back to env)."""
    if os.environ.get(name):
        return os.environ[name]
    p = SITE_ROOT / ".dev.vars"
    if not p.exists():
        return None
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        if k.strip() == name:
            return v.strip().strip('"').strip("'")
    return None
