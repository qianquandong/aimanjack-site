#!/bin/sh
# Stage a clean copy (internal notes must not ship), deploy to Cloudflare Pages,
# then ping IndexNow (Bing) with all sitemap URLs. Run `node scripts/build.mjs` first.
#   sh deploy.sh            production branch → aimanjack.com + IndexNow
#   sh deploy.sh --preview  any branch → <branch>.aimanjack.pages.dev, no IndexNow
set -e
cd "$(dirname "$0")"

rm -rf .deploy && mkdir .deploy
rsync -a --exclude-from=.deployignore ./ .deploy/

# Minify the stylesheet into the staged copy only — the source stays readable.
# Measured 2026-09-02: 40,033 -> ~33,000 B raw (8.7 -> 6.5 KB brotli), which took
# the mobile home page from Lighthouse 90 to 100 and LCP 1815ms -> 1538ms.
npx --yes clean-css-cli -O1 style.css -o .deploy/style.css

# Cache-bust by content hash instead of a hand-bumped ?v= number. These assets
# are served immutable for a year (see _headers), so a forgotten bump would pin
# every returning visitor to a stale stylesheet. Hash the STAGED file — that is
# the one actually served, and it differs from the source now that it's minified.
hash_of() { md5 -q "$1" 2>/dev/null || md5sum "$1" | cut -d' ' -f1; }
for asset in style.css; do
  h=$(hash_of ".deploy/$asset" | cut -c1-8)
  find .deploy -name '*.html' -exec sed -i '' "s|/$asset?v=[0-9a-f]*|/$asset?v=$h|g" {} +
done

npx wrangler pages deploy .deploy --project-name aimanjack

# --preview: the current branch is not production; skip IndexNow (its URLs point at production).
[ "$1" = "--preview" ] && { echo "preview deploy, IndexNow skipped"; exit 0; }

KEY=f613b8f49a0f40cdb8a3bf9c265efa53
URLS=$(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's/<[^>]*>//g' | sed 's/.*/"&"/' | paste -sd, -)
curl -s -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"aimanjack.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://aimanjack.com/$KEY.txt\",\"urlList\":[$URLS]}" \
  -w "\nIndexNow ping: HTTP %{http_code}\n"
