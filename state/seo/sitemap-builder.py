#!/usr/bin/env python3
"""sitemap.xml + robots.txt builder for aimanjack.com.

Reads `state/seo/published-urls.txt` (one URL per line, must start with /)
and rewrites `public/sitemap.xml` + `public/robots.txt`.

Run after every publish. Idempotent.
"""
from __future__ import annotations

import datetime as dt
from pathlib import Path

SITE = Path(__file__).resolve().parent.parent.parent   # aimanjack-site/
PUB_FILE = SITE / "state" / "seo" / "published-urls.txt"
SITEMAP = SITE / "sitemap.xml"
ROBOTS = SITE / "robots.txt"
INDEXNOW_KEY = ""  # optional: fill from .dev.vars SEO_INDEXNOW_KEY
HOST = "https://aimanjack.com"


def _load_urls() -> list[str]:
    if not PUB_FILE.exists():
        return []
    out: list[str] = []
    for line in PUB_FILE.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if not s.startswith("/"):
            continue
        out.append(s)
    seen = set()
    dedup = []
    for u in out:
        if u in seen:
            continue
        seen.add(u)
        dedup.append(u)
    return dedup


def build_sitemap(urls: list[str]) -> str:
    today = dt.date.today().isoformat()
    parts = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
    for u in urls:
        full = HOST + u
        # xhtml:link for bilingual pairs
        links = []
        if u.startswith("/zh/"):
            en = u.replace("/zh/", "/", 1)
            en_exists = (SITE / en.strip("/") / "index.html").exists() or (SITE / (en.strip("/") + ".html")).exists()
            if en_exists:  # zh-only pages (no EN twin) get no en alternate
                links.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{HOST}{en}"/>')
            links.append(f'    <xhtml:link rel="alternate" hreflang="zh-CN" href="{full}"/>')
        elif u == "/" or (not u.startswith("/zh/") and len(u.split("/")) <= 3):
            # English root or top-level section -> zh pair
            zh = "/zh" + u if u != "/" else "/zh/"
            links.append(f'    <xhtml:link rel="alternate" hreflang="en" href="{full}"/>')
            links.append(f'    <xhtml:link rel="alternate" hreflang="zh-CN" href="{HOST}{zh}"/>')
        parts.append(f"  <url>\n    <loc>{full}</loc>\n    <lastmod>{today}</lastmod>\n" +
                     ("\n".join(links) + "\n" if links else "") + "  </url>")
    parts.append("</urlset>")
    return "\n".join(parts) + "\n"


def build_robots() -> str:
    # explicit allow blocks for AI/search crawlers are deliberate (AI citation); keep them
    return f"""User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: *
Allow: /
Disallow: /functions/
Disallow: /.git/

Sitemap: {HOST}/sitemap.xml
"""


def main() -> int:
    urls = _load_urls()
    if not urls:
        print(f"no URLs in {PUB_FILE}; nothing to do")
        return 0
    SITEMAP.write_text(build_sitemap(urls), encoding="utf-8")
    ROBOTS.write_text(build_robots(), encoding="utf-8")
    print(f"wrote sitemap.xml ({len(urls)} urls) + robots.txt")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())