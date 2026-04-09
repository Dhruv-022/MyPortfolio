import requests
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import VisitorStats
from django.shortcuts import render
from user_agents import parse
import json
from django.views.decorators.csrf import csrf_exempt

def get_visitor_count(request):
    # Retrieve the stats without incrementing
    stats, created = VisitorStats.objects.get_or_create(id=1)
    return JsonResponse({"count": stats.total_visits})

@csrf_exempt
def log_visit(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    stats, created = VisitorStats.objects.get_or_create(id=1)
    stats.total_visits += 1
    stats.save()

    try:
        body = json.loads(request.body.decode("utf-8")) if request.body else {}
    except Exception as e:
        print(f"JSON parse error: {e}")
        body = {}

    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "Unknown")

    referrer = request.META.get("HTTP_REFERER", "Direct/Unknown")

    browser = (body.get("browser") or "Unknown").strip()
    browser_version = (body.get("browser_version") or "").strip()
    os_name = (body.get("os") or "Unknown").strip()
    os_version = (body.get("os_version") or "").strip()
    device_type = (body.get("device_type") or "Unknown").strip()

    browser_display = "Unknown"
    if browser != "Unknown":
        browser_display = f"{browser} {browser_version}".strip()

    os_display = "Unknown"
    if os_name != "Unknown":
        os_display = f"{os_name} {os_version}".strip()

    location = "Unknown"
    try:
        geo_res = requests.get(f"http://ip-api.com/json/{ip}", timeout=5).json()
        if geo_res.get("status") == "success":
            city = geo_res.get("city") or "Unknown city"
            country = geo_res.get("country") or "Unknown country"
            location = f"{city}, {country}"
    except Exception as e:
        print(f"Geo lookup error: {e}")

    webhook_url = "YOUR_DISCORD_WEBHOOK_URL"

    fields = [
        {
            "name": "Total Visits",
            "value": str(stats.total_visits),
            "inline": False
        },
        {
            "name": "IP Address",
            "value": str(ip or 'Unknown')[:100],
            "inline": True
        },
        {
            "name": "Location",
            "value": str(location or 'Unknown')[:200],
            "inline": True
        },
        {
            "name": "Referrer",
            "value": str(referrer or 'Direct/Unknown')[:1000],
            "inline": False
        }
    ]

    if browser_display != "Unknown":
        fields.append({
            "name": "Browser",
            "value": browser_display[:200],
            "inline": True
        })

    if os_display != "Unknown":
        fields.append({
            "name": "OS",
            "value": os_display[:200],
            "inline": True
        })

    if device_type != "Unknown":
        fields.append({
            "name": "Device Type",
            "value": device_type[:100],
            "inline": True
        })

    payload = {
        "embeds": [
            {
                "title": "New Portfolio Visit",
                "color": 16753920,
                "fields": fields,
                "footer": {
                    "text": "Nexus Analytics Engine"
                }
            }
        ]
    }

    try:
        response = requests.post(webhook_url, json=payload, timeout=10)
        print("Discord status:", response.status_code)
        print("Discord response:", response.text)
    except Exception as e:
        print(f"Discord error: {e}")

    return JsonResponse({"count": stats.total_visits})