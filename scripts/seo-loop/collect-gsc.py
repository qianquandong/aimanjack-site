# Daily Search Console pull for the SEO loop (2026-10-19). Runs in GitHub Actions (.github/workflows/seo-loop-data.yml).
# Writes one file per day to <out>/gsc/YYYY-MM-DD.json on the `seo-data` branch: page totals and page×query rows.
# Google keeps 16 months of data, so this archive is also the long-term record.
#
#   python scripts/seo-loop/collect-gsc.py --out .seo-data              # the day 3 days ago (GSC data lag)
#   python scripts/seo-loop/collect-gsc.py --out .seo-data --backfill 90 # first run: the last 90 days
#
# Credentials, first match wins: GSC_SA_JSON (service-account JSON text, a GitHub secret) → GOOGLE_APPLICATION_CREDENTIALS
# → ~/.config/claude-seo/google-api.json (service_account_path). Read-only scope only. With none of them it exits 0 and says so,
# so the rest of the workflow still runs. Property: GSC_PROPERTY, default sc-domain:aimanjack.com.
import argparse, datetime as dt, json, os, sys, tempfile
from pathlib import Path

SCOPE = ["https://www.googleapis.com/auth/webmasters.readonly"]
SITE = "https://aimanjack.com"


def credentials_path():
    raw = os.environ.get("GSC_SA_JSON", "").strip()
    if raw:
        f = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False)
        f.write(raw); f.close()
        return f.name
    if os.environ.get("GOOGLE_APPLICATION_CREDENTIALS"):
        return os.environ["GOOGLE_APPLICATION_CREDENTIALS"]
    cfg = Path.home() / ".config/claude-seo/google-api.json"
    if cfg.exists():
        p = json.loads(cfg.read_text()).get("service_account_path")
        if p and Path(p).exists():
            return p
    return None


def path_of(url):
    return url[len(SITE):] or "/" if url.startswith(SITE) else url


def query_all(sc, prop, day, dims):
    rows, start = [], 0
    while True:
        body = {"startDate": day, "endDate": day, "dimensions": dims, "rowLimit": 25000, "startRow": start, "dataState": "final"}
        got = sc.searchanalytics().query(siteUrl=prop, body=body).execute().get("rows", [])
        rows += got
        if len(got) < 25000:
            return rows
        start += 25000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=".seo-data")
    ap.add_argument("--date", help="YYYY-MM-DD; default = 3 days ago")
    ap.add_argument("--backfill", type=int, default=0, help="also pull this many days before --date")
    ap.add_argument("--force", action="store_true", help="re-pull days that already have a file")
    a = ap.parse_args()

    key = credentials_path()
    if not key:
        print("::warning::collect-gsc: no Search Console credentials (add the GSC_SA_JSON repository secret); skipped")
        return 0
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    sc = build("searchconsole", "v1", credentials=service_account.Credentials.from_service_account_file(key, scopes=SCOPE), cache_discovery=False)
    prop = os.environ.get("GSC_PROPERTY", "sc-domain:aimanjack.com")

    last = dt.date.fromisoformat(a.date) if a.date else dt.date.today() - dt.timedelta(days=3)
    out = Path(a.out) / "gsc"; out.mkdir(parents=True, exist_ok=True)
    wrote = 0
    for k in range(a.backfill, -1, -1):
        day = (last - dt.timedelta(days=k)).isoformat()
        f = out / f"{day}.json"
        if f.exists() and not a.force:
            continue
        tot = (sc.searchanalytics().query(siteUrl=prop, body={"startDate": day, "endDate": day, "dataState": "final"}).execute().get("rows") or [{}])[0]
        pages = [[path_of(r["keys"][0]), r["clicks"], r["impressions"], round(r["position"], 2)] for r in query_all(sc, prop, day, ["page"])]
        rows = [[path_of(r["keys"][0]), r["keys"][1], r["clicks"], r["impressions"], round(r["position"], 2)] for r in query_all(sc, prop, day, ["page", "query"])]
        f.write_text(json.dumps({
            "date": day, "property": prop, "pulled_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
            "totals": {"clicks": tot.get("clicks", 0), "impressions": tot.get("impressions", 0), "position": round(tot.get("position", 0), 2)},
            "pages": sorted(pages, key=lambda r: -r[2]), "rows": sorted(rows, key=lambda r: -r[3]),
        }, ensure_ascii=False, separators=(",", ":")) + "\n")
        wrote += 1
    print(f"collect-gsc: wrote {wrote} day file(s) through {last.isoformat()} into {out}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
