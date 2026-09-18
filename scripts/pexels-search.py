#!/usr/bin/env python3
"""pexels-search.py — fetch free stock photos for a keyword and cache them as WebP.

  python3 scripts/pexels-search.py "ai receptionist" --count 5
  python3 scripts/pexels-search.py "ai 前台" --count 3 --orientation landscape --max-width 1600
  python3 scripts/pexels-search.py "office phone" --placeholder      # no key: fake manifest, no downloads

Key: PEXELS_API_KEY in the environment or in <repo>/.dev.vars  (free at https://www.pexels.com/api/,
200 req/hour, 40 req/min). Without a key the script exits 2 unless --placeholder is given.

Output:
  img/pexels-cache/<slug>-<n>.webp          (Pillow; falls back to .jpg when Pillow is missing)
  img/pexels-cache/<slug>.json              manifest (also printed to stdout)
Each manifest entry: file, web_path, image_url, alt, photographer, photographer_url, page_url,
pexels_id, width, height, credit (ready-made attribution string).
"""
from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
CACHE_DIR = REPO / "img" / "pexels-cache"
API = "https://api.pexels.com/v1/search"
PEXELS_API_KEY_PLACEHOLDER = "YOUR_PEXELS_API_KEY"   # replace via .dev.vars, never edit here

sys.path.insert(0, str(REPO / "scripts" / "seo-keyword-tool"))
try:
    from common.text import slugify as _slugify  # reuse the zh→pinyin slug map
except Exception:  # pragma: no cover
    _slugify = None


def slugify(text: str) -> str:
    if _slugify:
        return _slugify(text, max_len=40)
    s = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode().lower()
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s or "kw-" + hashlib.md5(text.encode()).hexdigest()[:6]


def read_key() -> str | None:
    k = os.environ.get("PEXELS_API_KEY")
    if k:
        return k.strip()
    p = REPO / ".dev.vars"
    if p.exists():
        for line in p.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("PEXELS_API_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                if v and v != PEXELS_API_KEY_PLACEHOLDER:
                    return v
    return None


def api_search(key: str, query: str, count: int, orientation: str | None, size: str | None,
               locale: str | None, page: int) -> tuple[dict, dict]:
    params = {"query": query, "per_page": max(1, min(80, count)), "page": page}
    if orientation:
        params["orientation"] = orientation
    if size:
        params["size"] = size
    if locale:
        params["locale"] = locale
    url = API + "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"Authorization": key, "User-Agent": "aimanjack-pexels-search/1.0"})
    with urllib.request.urlopen(req, timeout=20) as resp:
        body = json.loads(resp.read().decode("utf-8"))
        rl = {k.lower(): v for k, v in resp.headers.items() if k.lower().startswith("x-ratelimit")}
    return body, rl


def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "aimanjack-pexels-search/1.0"})
    with urllib.request.urlopen(req, timeout=60) as resp:
        return resp.read()


def to_webp(data: bytes, max_width: int, quality: int) -> tuple[bytes, str, int, int]:
    try:
        from PIL import Image  # type: ignore
    except Exception:
        return data, "jpg", 0, 0
    im = Image.open(io.BytesIO(data))
    im = im.convert("RGB")
    if max_width and im.width > max_width:
        h = round(im.height * max_width / im.width)
        im = im.resize((max_width, h), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "WEBP", quality=quality, method=6)
    return buf.getvalue(), "webp", im.width, im.height


def placeholder_manifest(query: str, count: int, slug: str) -> list[dict]:
    out = []
    for n in range(1, count + 1):
        out.append({
            "file": f"{slug}-{n}.webp", "web_path": f"/img/pexels-cache/{slug}-{n}.webp",
            "image_url": f"https://images.pexels.com/photos/PLACEHOLDER/{slug}-{n}.jpeg",
            "alt": f"{query} (placeholder {n})", "photographer": "Placeholder Photographer",
            "photographer_url": "https://www.pexels.com/@placeholder", "page_url": "https://www.pexels.com/photo/placeholder/",
            "pexels_id": 0, "width": 1600, "height": 1067,
            "credit": "Photo by Placeholder Photographer on Pexels", "placeholder": True,
        })
    return out


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("keyword")
    ap.add_argument("--count", type=int, default=5)
    ap.add_argument("--orientation", choices=["landscape", "portrait", "square"])
    ap.add_argument("--size", choices=["large", "medium", "small"])
    ap.add_argument("--locale", help="e.g. zh-CN, en-US (auto: zh-CN when keyword has CJK)")
    ap.add_argument("--page", type=int, default=1, help="Pexels result page (use 2+ to get fresh photos)")
    ap.add_argument("--src", default="large2x", choices=["original", "large2x", "large", "medium"], help="Pexels size to download")
    ap.add_argument("--max-width", type=int, default=1600)
    ap.add_argument("--quality", type=int, default=82)
    ap.add_argument("--out-dir", default=str(CACHE_DIR))
    ap.add_argument("--force", action="store_true", help="re-download even if cached")
    ap.add_argument("--placeholder", action="store_true", help="emit a fake manifest without calling the API")
    ap.add_argument("--dry-run", action="store_true", help="call the API but don't download images")
    a = ap.parse_args()

    query = a.keyword.strip()
    slug = slugify(query)
    out_dir = Path(a.out_dir).expanduser()
    manifest_path = out_dir / f"{slug}.json"
    locale = a.locale or ("zh-CN" if re.search(r"[一-鿿]", query) else None)

    if a.placeholder:
        items = placeholder_manifest(query, a.count, slug)
        result = {"query": query, "slug": slug, "count": len(items), "placeholder": True, "images": items}
        print(json.dumps(result, ensure_ascii=False, indent=1))
        return 0

    key = read_key()
    if not key:
        print(json.dumps({"error": "missing PEXELS_API_KEY",
                          "fix": "Get a free key at https://www.pexels.com/api/ then add PEXELS_API_KEY=... to .dev.vars "
                                 "(or export it). Use --placeholder to test the pipeline without a key."},
                         indent=1))
        return 2

    if manifest_path.exists() and not a.force and not a.dry_run:
        cached = json.loads(manifest_path.read_text(encoding="utf-8"))
        if cached.get("count", 0) >= a.count and cached.get("page", 1) == a.page and all((out_dir / i["file"]).exists() for i in cached.get("images", [])):
            cached["cached"] = True
            cached["images"] = cached["images"][: a.count]
            print(json.dumps(cached, ensure_ascii=False, indent=1))
            return 0

    try:
        body, rl = api_search(key, query, a.count, a.orientation, a.size, locale, a.page)
    except urllib.error.HTTPError as e:
        msg = e.read().decode("utf-8", "ignore")[:200]
        print(json.dumps({"error": f"pexels HTTP {e.code}", "detail": msg,
                          "hint": "401 = bad key, 429 = rate limit (200/h, 40/min)"}, indent=1))
        return 1
    except Exception as e:  # noqa: BLE001
        print(json.dumps({"error": f"pexels request failed: {e}"}, indent=1))
        return 1

    photos = body.get("photos", [])
    if not photos:
        print(json.dumps({"query": query, "slug": slug, "count": 0, "images": [],
                          "note": "no results; try an English keyword or a broader term"}, ensure_ascii=False, indent=1))
        return 0

    out_dir.mkdir(parents=True, exist_ok=True)
    items: list[dict] = []
    for n, ph in enumerate(photos[: a.count], 1):
        src = ph.get("src", {})
        image_url = src.get(a.src) or src.get("large") or src.get("original")
        entry = {
            "file": None, "web_path": None, "image_url": image_url,
            "alt": ph.get("alt") or query, "photographer": ph.get("photographer", ""),
            "photographer_url": ph.get("photographer_url", ""), "page_url": ph.get("url", ""),
            "pexels_id": ph.get("id"), "width": ph.get("width"), "height": ph.get("height"),
            "avg_color": ph.get("avg_color"),
            "credit": f"Photo by {ph.get('photographer', '')} on Pexels",
        }
        if not a.dry_run and image_url:
            try:
                raw = download(image_url)
                data, ext, w, h = to_webp(raw, a.max_width, a.quality)
                fname = f"{slug}-{n}.{ext}"
                (out_dir / fname).write_bytes(data)
                entry["file"] = fname
                entry["web_path"] = f"/img/pexels-cache/{fname}"
                entry["bytes"] = len(data)
                if w and h:
                    entry["width"], entry["height"] = w, h
                time.sleep(0.2)
            except Exception as e:  # noqa: BLE001
                entry["download_error"] = str(e)[:120]
        items.append(entry)

    result = {"query": query, "slug": slug, "locale": locale, "page": a.page, "count": len(items),
              "total_results": body.get("total_results"), "ratelimit": rl,
              "generated": time.strftime("%Y-%m-%dT%H:%M:%S"), "images": items}
    if not a.dry_run:
        manifest_path.write_text(json.dumps(result, ensure_ascii=False, indent=1), encoding="utf-8")
        result["manifest"] = str(manifest_path)
    print(json.dumps(result, ensure_ascii=False, indent=1))
    return 0


if __name__ == "__main__":
    sys.exit(main())
