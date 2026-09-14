#!/bin/sh
# Headless Chrome screenshots for the deploy report.
#   sh scripts/shoot.sh
# Saves into ../Desktop/AI-Man-Jack-Agent-OS/state/website-ai-training/2026-09-14-deploy/
set -e
OUT="/Users/joseesp/Desktop/AI-Man-Jack-Agent-OS/state/website-ai-training/2026-09-14-deploy"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="https://aimanjack.com"
mkdir -p "$OUT"
for combo in "desktop:1440,900" "mobile:390,844"; do
  name="${combo%%:*}"
  size="${combo##*:}"
  width="${size%%,*}"
  height="${size##*,}"
  $CHROME \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --hide-scrollbars \
    --user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" \
    --window-size="${size}" \
    --virtual-time-budget=8000 \
    --screenshot="$OUT/home-${name}.png" \
    "$URL" > /dev/null 2>&1
  echo "saved $OUT/home-${name}.png"
done
# AI training (legacy) and book
$CHROME --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1440,900 --virtual-time-budget=8000 --screenshot="$OUT/ai-training-desktop.png" "https://aimanjack.com/ai-training/" > /dev/null 2>&1 && echo "saved ai-training-desktop.png"
$CHROME --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1440,900 --virtual-time-budget=8000 --screenshot="$OUT/book-desktop.png" "https://aimanjack.com/book/" > /dev/null 2>&1 && echo "saved book-desktop.png"
$CHROME --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=390,844 --virtual-time-budget=8000 --screenshot="$OUT/home-mobile.png" "https://aimanjack.com/" > /dev/null 2>&1 && echo "saved home-mobile.png"
$CHROME --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=390,844 --virtual-time-budget=8000 --screenshot="$OUT/coupon-mobile.png" "https://aimanjack.com/#coupon" > /dev/null 2>&1 && echo "saved coupon-mobile.png"
