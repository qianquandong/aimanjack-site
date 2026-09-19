#!/bin/sh
# Regenerates the favicon set and the link-preview (OG) cards from scripts/brand/*.html with headless Chrome,
# so they use the real Satoshi file, the real workshop photo and the same J mark as the site header.
#   sh scripts/make-brand-assets.sh <og-suffix>      e.g. 2026-09  →  img/og-2026-09.jpg, img/og-2026-09-zh.jpg
# /img/* is served immutable for a year (_headers): NEVER overwrite an OG card in place — pass a new suffix and update
# OG_CARD in src/config.mjs. Favicons live at the root with a 7-day cache, so those are overwritten.
set -e
cd "$(dirname "$0")/.."
SUF=${1:?usage: make-brand-assets.sh <og-suffix>}
OG=1; [ -e "img/og-$SUF.jpg" ] && { echo "img/og-$SUF.jpg exists — leaving the OG cards alone (immutable cache); regenerating icons only"; OG=0; }
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMP=$(mktemp -d)
shot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --default-background-color=00000000 \
  --allow-file-access-from-files --virtual-time-budget=3000 --window-size="$2" --screenshot="$1" "$3" >/dev/null 2>&1; }
B="file://$PWD/scripts/brand"
[ $OG = 1 ] && { shot "$TMP/og-en.png" 1200,630 "$B/og.html"; shot "$TMP/og-zh.png" 1200,630 "$B/og.html?lang=zh"; }
shot "$TMP/icon-512.png" 512,512 "$B/icon.html"
shot "$TMP/touch.png" 512,512 "$B/icon.html?bleed=1"
python3 - "$TMP" "$SUF" "$OG" <<'PY'
import sys
from PIL import Image
tmp, suf, og = sys.argv[1], sys.argv[2], sys.argv[3] == "1"
for lang, out in ((("en", f"img/og-{suf}.jpg"), ("zh", f"img/og-{suf}-zh.jpg")) if og else ()):
    Image.open(f"{tmp}/og-{lang}.png").convert("RGB").save(out, quality=86, optimize=True, progressive=True)
icon = Image.open(f"{tmp}/icon-512.png").convert("RGBA")
for n in (16, 32):
    icon.resize((n, n), Image.LANCZOS).save(f"favicon-{n}.png", optimize=True)
icon.resize((48, 48), Image.LANCZOS).save("favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
Image.open(f"{tmp}/touch.png").convert("RGB").resize((180, 180), Image.LANCZOS).save("apple-touch-icon.png", optimize=True)
PY
cat > favicon.svg <<'SVG'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#1D1A19"/><g transform="translate(15 49)"><path fill="#fff" d="M0.88 -9.328V-11.616H7.744V-9.328Q7.744 -8.052 8.58 -7.04Q9.416 -6.028 11.44 -6.028Q13.42 -6.028 14.256 -6.996Q15.092 -7.964 15.092 -9.592V-32.56H22.22V-9.152Q22.22 -6.38 20.922 -4.18Q19.624 -1.98 17.226 -0.704Q14.828 0.572 11.528 0.572Q7.964 0.572 5.588 -0.726Q3.212 -2.024 2.046 -4.268Q0.88 -6.512 0.88 -9.328Z"/></g><circle cx="46.5" cy="18" r="5.5" fill="#A8552F"/></svg>
SVG
rm -rf "$TMP"
ls -la favicon.ico favicon.svg favicon-16.png favicon-32.png apple-touch-icon.png "img/og-$SUF.jpg" "img/og-$SUF-zh.jpg"
