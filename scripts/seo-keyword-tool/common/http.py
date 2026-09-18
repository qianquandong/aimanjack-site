"""Tiny cached HTTP client on top of urllib (no third-party deps)."""
from __future__ import annotations

import hashlib
import http.cookiejar
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

from . import config

_cookie_jar = http.cookiejar.CookieJar()
_opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(_cookie_jar))
_last_call: dict[str, float] = {}


class HttpError(Exception):
    def __init__(self, status: int | str, url: str, msg: str = ""):
        super().__init__(f"HTTP {status} for {url} {msg}".strip())
        self.status = status
        self.url = url


def log(msg: str) -> None:
    print(msg, file=sys.stderr, flush=True)


def _cache_path(url: str, headers: dict | None) -> "config.Path":
    key = hashlib.sha1((url + json.dumps(headers or {}, sort_keys=True)).encode()).hexdigest()
    return config.CACHE_DIR / f"{key}.json"


def _throttle(family: str) -> None:
    delay = config.DELAY.get(family, 0.5)
    last = _last_call.get(family, 0.0)
    wait = delay - (time.time() - last)
    if wait > 0:
        time.sleep(wait)
    _last_call[family] = time.time()


def get(
    url: str,
    *,
    family: str = "suggest",
    headers: dict | None = None,
    lang: str = "en",
    timeout: int = 15,
    use_cache: bool = True,
    retries: int = 2,
) -> str:
    """GET `url` and return the body as text. Cached on disk for CACHE_TTL."""
    config.ensure_dirs()
    hdrs = {
        "User-Agent": config.USER_AGENT,
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.6" if lang == "zh" else "en-US,en;q=0.9",
        "Accept": "text/html,application/json;q=0.9,*/*;q=0.8",
    }
    if headers:
        hdrs.update(headers)

    cp = _cache_path(url, headers)
    if use_cache and cp.exists():
        try:
            rec = json.loads(cp.read_text(encoding="utf-8"))
            if time.time() - rec["ts"] < config.CACHE_TTL:
                return rec["body"]
        except Exception:
            pass

    last_err: Exception | None = None
    for attempt in range(retries + 1):
        _throttle(family)
        req = urllib.request.Request(url, headers=hdrs)
        try:
            with _opener.open(req, timeout=timeout) as resp:
                body = resp.read().decode("utf-8", "ignore")
            if use_cache:
                cp.write_text(json.dumps({"ts": time.time(), "url": url, "body": body}), encoding="utf-8")
            return body
        except urllib.error.HTTPError as e:
            last_err = HttpError(e.code, url)
            if e.code in (429, 503) and attempt < retries:
                time.sleep(2.5 * (attempt + 1))
                continue
            break
        except Exception as e:  # network / timeout
            last_err = HttpError("ERR", url, str(e)[:80])
            if attempt < retries:
                time.sleep(1.0)
                continue
    assert last_err is not None
    raise last_err


def get_json(url: str, *, strip_prefix: str = "", **kw):
    body = get(url, **kw)
    if strip_prefix and body.startswith(strip_prefix):
        body = body[len(strip_prefix):]
    return json.loads(body)


def q(s: str) -> str:
    return urllib.parse.quote(s, safe="")
