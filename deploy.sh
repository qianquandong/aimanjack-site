#!/bin/sh
# Deploy to Cloudflare Pages, then ping IndexNow (Bing) with all sitemap URLs.
set -e
cd "$(dirname "$0")"
npx wrangler pages deploy . --project-name aimanjack

KEY=f613b8f49a0f40cdb8a3bf9c265efa53
URLS=$(grep -o '<loc>[^<]*</loc>' sitemap.xml | sed 's/<[^>]*>//g' | sed 's/.*/"&"/' | paste -sd, -)
curl -s -X POST https://api.indexnow.org/indexnow \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"aimanjack.com\",\"key\":\"$KEY\",\"keyLocation\":\"https://aimanjack.com/$KEY.txt\",\"urlList\":[$URLS]}" \
  -w "\nIndexNow ping: HTTP %{http_code}\n"
