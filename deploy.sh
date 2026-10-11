#!/bin/sh
# Stage a clean copy (internal notes must not ship), deploy to Cloudflare Pages,
# then ping IndexNow (Bing) with all sitemap URLs. Builds and runs the test suite first; refuses to deploy on any failure.
#   sh deploy.sh                    prepare read-only preview locally; NO upload
#   sh deploy.sh --prepare-preview  same as above
#   sh deploy.sh --preview          upload read-only preview to aimanjack-review/review-<commit>
#   sh deploy.sh --production       explicit production upload, production branch only
set -e
cd "$(dirname "$0")"
mode=${1:---prepare-preview}
[ "$#" -le 1 ] || { echo 'deploy.sh: unexpected arguments'; exit 2; }
case "$mode" in
  --prepare-preview|--preview) ;;
  --production)
    [ "$(git symbolic-ref --quiet --short HEAD)" = production ] || { echo 'deploy.sh: production upload requires the production branch'; exit 2; } ;;
  *) echo 'Usage: sh deploy.sh [--prepare-preview|--preview|--production]'; exit 2 ;;
esac

# Gate (2026-09-28): never ship what the test suite rejects. Every deploy path goes through here — Jack, Claude, and the
# scheduled blog routine, which once published a post that linked a hidden page and overflowed on phones.
# There is no package.json or linter in this repo, so build + node --test is the whole gate.
node scripts/build.mjs >/dev/null
out=$(node --test tests/*.test.mjs 2>&1) || { printf '%s\n' "$out" | grep -E 'not ok|AssertionError|ℹ (pass|fail)' | head -30; echo 'deploy.sh: tests failed, nothing deployed'; exit 1; }

if [ "$mode" != --production ]; then
  node scripts/stage-preview.mjs
  [ "$mode" = --preview ] || { echo 'Read-only preview prepared in .preview/site; nothing uploaded.'; exit 0; }
  revision=$(git rev-parse HEAD)
  preview_branch="review-$(git rev-parse --short=12 HEAD)"
  # Independent config, inert Worker and explicit target; inherited production secrets cannot be used.
  (cd .preview && npx wrangler pages deploy site --project-name aimanjack-review --branch "$preview_branch" --commit-hash "$revision" --commit-dirty=true)
  exit 0
fi

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

npx wrangler pages deploy .deploy --project-name aimanjack --branch production

KEY=f613b8f49a0f40cdb8a3bf9c265efa53
URLS=$(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's/<[^>]*>//g' | sed 's/.*/"&"/' | paste -sd, -)
curl -s -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"aimanjack.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://aimanjack.com/$KEY.txt\",\"urlList\":[$URLS]}" \
  -w "\nIndexNow ping: HTTP %{http_code}\n"
