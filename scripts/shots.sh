#!/bin/sh
# Full-page screenshots of a fixed page set with headless Chrome, for before/after pixel comparison of CSS-only changes.
#   sh scripts/shots.sh <out-dir> [origin]        origin defaults to http://localhost:8899 (python3 -m http.server 8899)
# Compare two runs with: python3 scripts/shots-diff.py <dirA> <dirB>
set -e
OUT=$1; ORIGIN=${2:-http://localhost:8899}
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
mkdir -p "$OUT"
# One of every template, both languages where the layout differs, plus the legacy and legal pages that share style.css.
PAGES="/ /zh/ /ai-training/ /zh/ai-training/ /use-cases/ /use-cases/sales/ /workflows/ /workflows/prospect-research/ /zh/workflows/sop-creation/ /templates/ /templates/sales-meeting-prep/ /tools/ /tools/ai-readiness-assessment/ /blog/ /blog/ai-training-for-employees-start-with-one-task/ /about/ /contact/ /book/ /privacy /404.html /ai-receptionist/ /pricing/ /industries/salons/ /integrations/ /tools/missed-call-calculator/ /case-studies/ai-man-jack/ /blog/how-much-do-missed-calls-cost/"
# Headless Chrome hangs on windows narrower than ~500px, so the phone layout (≤720px breakpoint) is shot at 500.
# 1024 is in the set because a header overflow lived between the phone and desktop widths once (2026-09-19).
for W in ${WIDTHS:-1440 1024 500}; do
  for P in $PAGES; do
    N=$(echo "$P" | sed 's#^/$#home#; s#^/##; s#/$##; s#/#_#g')
    "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=$W,2600 \
      --virtual-time-budget=4000 --screenshot="$OUT/$W-$N.png" "$ORIGIN$P" >/dev/null 2>&1 &
    PID=$!; ( sleep 45; kill $PID 2>/dev/null ) & KILLER=$!; wait $PID 2>/dev/null || true; kill $KILLER 2>/dev/null || true
    [ -s "$OUT/$W-$N.png" ] || echo "NO SHOT: $W $P"
  done
done
ls "$OUT" | wc -l
