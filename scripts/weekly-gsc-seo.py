import json
import os
import sys
from datetime import date, timedelta
from pathlib import Path

import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build

SITE = os.environ.get("GSC_SITE_URL", "sc-domain:journeyexpertbd.com")
BASE = "https://journeyexpertbd.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
ROUTES = [
    "/", "/about/", "/services/", "/destinations/", "/partners/",
    "/scholarships/", "/blogs/", "/contact/", "/booking/", "/finder/",
    "/checker/", "/ects-calculator/",
]

secret = os.environ.get("GSC_SERVICE_ACCOUNT_JSON", "").strip()
if not secret:
    raise SystemExit("GSC_SERVICE_ACCOUNT_JSON is not configured")

try:
    credentials = service_account.Credentials.from_service_account_info(
        json.loads(secret), scopes=SCOPES
    )
except Exception as exc:
    raise SystemExit(f"GSC_SERVICE_ACCOUNT_JSON is invalid: {type(exc).__name__}")

service = build("searchconsole", "v1", credentials=credentials, cache_discovery=False)
end = date.today()
start = end - timedelta(days=7)
analytics = service.searchanalytics().query(
    siteUrl=SITE,
    body={
        "startDate": start.isoformat(),
        "endDate": end.isoformat(),
        "dimensions": ["query", "page"],
        "rowLimit": 250,
    },
).execute()
sitemaps = service.sitemaps().list(siteUrl=SITE).execute().get("sitemap", [])

route_checks = []
for route in ROUTES:
    url = BASE + route
    response = requests.get(url, timeout=20, allow_redirects=True)
    body = response.text.lower()
    route_checks.append({
        "url": url,
        "status": response.status_code,
        "final_url": response.url,
        "redirects": len(response.history),
        "canonical_ok": f'<link rel="canonical" href="{url}"' in body,
        "has_title": "<title>" in body,
        "has_description": 'name="description"' in body,
        "jsonld_count": body.count("application/ld+json"),
    })

report = {
    "site": SITE,
    "period": {"start": start.isoformat(), "end": end.isoformat()},
    "analytics_rows": analytics.get("rows", []),
    "sitemaps": sitemaps,
    "route_checks": route_checks,
}
Path("weekly-seo-report.json").write_text(json.dumps(report, indent=2))

bad = [
    row for row in route_checks
    if row["status"] != 200
    or row["redirects"] > 1
    or not row["canonical_ok"]
    or not row["has_title"]
    or not row["has_description"]
]
print(json.dumps({
    "site": SITE,
    "bad_route_count": len(bad),
    "sitemap_count": len(sitemaps),
    "analytics_rows": len(analytics.get("rows", [])),
}, indent=2))
if bad:
    print(json.dumps(bad, indent=2))
    sys.exit(1)
