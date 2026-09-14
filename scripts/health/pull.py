# Daily GSC + GA4 pull for the aimanjack-daily-health task.
# Run: ~/.claude/skills/seo/.venv/bin/python scripts/health/pull.py YYYY-MM-DD urls.txt
# Merges results into scripts/health/<date>.json under "data".
import json, sys, datetime as dt
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric

cfg = json.load(open(Path.home() / ".config/claude-seo/google-api.json"))
today = dt.date.fromisoformat(sys.argv[1])
urls = [u.strip() for u in open(sys.argv[2]) if u.strip()] if len(sys.argv) > 2 else []
prop = cfg["default_property"]
creds = service_account.Credentials.from_service_account_file(
    cfg["service_account_path"],
    scopes=["https://www.googleapis.com/auth/webmasters.readonly", "https://www.googleapis.com/auth/analytics.readonly"])
sc = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
D = lambda d: d.isoformat()

def gsc(start, end, dims=None, limit=1000):
    body = {"startDate": D(start), "endDate": D(end), "rowLimit": limit}
    if dims: body["dimensions"] = dims
    return sc.searchanalytics().query(siteUrl=prop, body=body).execute().get("rows", [])

end = today - dt.timedelta(days=3)  # GSC 2-3 day lag
windows = {"last7": (end - dt.timedelta(days=6), end), "prev7": (end - dt.timedelta(days=13), end - dt.timedelta(days=7))}
g = {}
for k, (s, e) in windows.items():
    r = (gsc(s, e) or [{}])[0]
    g[k] = {"range": f"{D(s)}..{D(e)}", "clicks": r.get("clicks", 0), "impressions": r.get("impressions", 0),
            "ctr": round(r.get("ctr", 0) * 100, 2), "position": round(r.get("position", 0), 1)}
pi = g["prev7"]["impressions"]
g["impressions_wow_pct"] = round((g["last7"]["impressions"] - pi) / pi * 100, 1) if pi else None
q = gsc(*windows["last7"], dims=["query"])
q.sort(key=lambda r: -r["impressions"])
row = lambda r: {"query": r["keys"][0], "impressions": r["impressions"], "clicks": r["clicks"], "position": round(r["position"], 1)}
g["top10_queries"] = [row(r) for r in q[:10]]
g["quick_wins_imp20_pos8to20"] = [row(r) for r in q if r["impressions"] >= 20 and 8 <= r["position"] <= 20]
if urls:
    not_idx = []
    for u in urls:
        try:
            st = sc.urlInspection().index().inspect(body={"inspectionUrl": u, "siteUrl": prop}).execute()["inspectionResult"]["indexStatusResult"]
            if st.get("verdict") != "PASS": not_idx.append({"url": u, "state": st.get("coverageState")})
        except Exception as ex:
            not_idx.append({"url": u, "state": f"error: {ex.__class__.__name__}"})
    g.update(inspected=len(urls), indexed=len(urls) - len(not_idx), not_indexed=not_idx)

ga = BetaAnalyticsDataClient(credentials=creds)
gs, ge = today - dt.timedelta(days=7), today - dt.timedelta(days=1)
def ga4(dims, metric="sessions"):
    resp = ga.run_report(RunReportRequest(property=cfg["ga4_property_id"], date_ranges=[DateRange(start_date=D(gs), end_date=D(ge))],
                                          dimensions=[Dimension(name=x) for x in dims], metrics=[Metric(name=metric)], limit=500))
    return [([v.value for v in r.dimension_values], int(r.metric_values[0].value)) for r in resp.rows]

CTA = {"header_call_click", "demo_call_click", "sms_click", "book_demo_click", "form_submit", "cta_click"}
a = {"window": f"{D(gs)}..{D(ge)}"}
a["sessions_by_day"] = dict(sorted((k[0], v) for k, v in ga4(["date"])))
a["sessions_total"] = sum(a["sessions_by_day"].values())
a["by_country"] = {k[0]: v for k, v in ga4(["country"])}
cities = ga4(["region", "city"])
a["by_region_city"] = {"/".join(k): v for k, v in sorted(cities, key=lambda x: -x[1])}
a["dfw_sessions"] = sum(v for k, v in cities if k[0] == "Texas")  # ponytail: Texas ≈ DFW; split by city list if non-DFW TX traffic appears
a["jack_melissa_sessions"] = sum(v for k, v in cities if k == ["Texas", "Melissa"])
ev = ga4(["eventName", "city"], "eventCount")
a["cta_events"] = {}
for (name, city), n in ev:
    if name in CTA: a["cta_events"][name] = a["cta_events"].get(name, 0) + n
a["cta_clicks_total"] = sum(a["cta_events"].values())
a["cta_clicks_external"] = sum(n for (name, city), n in ev if name in CTA and city != "Melissa")
ext_sessions = a["sessions_total"] - a["jack_melissa_sessions"]
a["conversion_wide_pct"] = round(a["cta_clicks_total"] / a["sessions_total"] * 100, 1) if a["sessions_total"] else None
a["conversion_external_pct"] = round(a["cta_clicks_external"] / ext_sessions * 100, 1) if ext_sessions else None

f = Path(__file__).parent / f"{D(today)}.json"
snap = json.load(open(f))
snap["data"] = {"pulled_at": dt.datetime.utcnow().isoformat() + "Z", "gsc": g, "ga4": a}
json.dump(snap, open(f, "w"), indent=2, ensure_ascii=False)
print(json.dumps(snap["data"], indent=1, ensure_ascii=False))
