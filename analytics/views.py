import requests
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import VisitorStats
from django.shortcuts import render
from user_agents import parse

def get_visitor_count(request):
    # Retrieve the stats without incrementing
    stats, created = VisitorStats.objects.get_or_create(id=1)
    return JsonResponse({"count": stats.total_visits})

@ensure_csrf_cookie
def log_visit(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    stats, created = VisitorStats.objects.get_or_create(id=1)
    stats.total_visits += 1
    stats.save()

    # 1. Capture metadata safely
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        ip = request.META.get("REMOTE_ADDR", "Unknown")

    user_agent_raw = request.META.get("HTTP_USER_AGENT", "")
    referrer = request.META.get("HTTP_REFERER", "Direct/Unknown")

    try:
        user_agent = parse(user_agent_raw)
        browser_name = f"{user_agent.browser.family} {user_agent.browser.version_string}".strip()
        os_name = f"{user_agent.os.family} {user_agent.os.version_string}".strip()
        device_name = str(user_agent.device.family or "Unknown")
    except Exception as e:
        print(f"User-agent parse error: {e}")
        browser_name = "Unknown"
        os_name = "Unknown"
        device_name = "Unknown"

    if not browser_name:
        browser_name = "Unknown"
    if not os_name:
        os_name = "Unknown"
    if not device_name:
        device_name = "Unknown"

    # Limit long text for Discord embed field rules
    referrer = str(referrer or "Direct/Unknown")[:1000]
    ip = str(ip or "Unknown")[:100]
    browser_name = str(browser_name)[:200]
    os_name = str(os_name)[:200]
    device_name = str(device_name)[:200]

    # 2. Get location from IP
    location = "Unknown"
    try:
        geo_res = requests.get(f"http://ip-api.com/json/{ip}", timeout=5).json()
        if geo_res.get("status") == "success":
            city = geo_res.get("city") or "Unknown city"
            country = geo_res.get("country") or "Unknown country"
            location = f"{city}, {country}"
    except Exception as e:
        print(f"Geo lookup error: {e}")

    location = str(location)[:200]

    # 3. Discord notification
    webhook_url = "https://discord.com/api/webhooks/1471824299534061761/ZOv0jd4_KiMBddhB1urOOD0hjA8sHKztkSqGR77zwShaFSzT80HxZaeEABpqWnq1pOXl"

    payload = {
        "embeds": [
            {
                "title": "New Portfolio Visit",
                "color": 16753920,
                "fields": [
                    {
                        "name": "Total Visits",
                        "value": str(stats.total_visits),
                        "inline": False
                    },
                    {
                        "name": "IP Address",
                        "value": ip or "Unknown",
                        "inline": True
                    },
                    {
                        "name": "Location",
                        "value": location or "Unknown",
                        "inline": True
                    },
                    {
                        "name": "Browser",
                        "value": browser_name or "Unknown",
                        "inline": True
                    },
                    {
                        "name": "OS",
                        "value": os_name or "Unknown",
                        "inline": True
                    },
                    {
                        "name": "Device",
                        "value": device_name or "Unknown",
                        "inline": True
                    },
                    {
                        "name": "Referrer",
                        "value": referrer or "Direct/Unknown",
                        "inline": False
                    },
                ],
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

        if response.status_code not in [200, 204]:
            print("Discord webhook failed with non-success status.")
    except Exception as e:
        print(f"Discord error: {e}")

    return JsonResponse({"count": stats.total_visits})

@ensure_csrf_cookie # This is the "Key" that opens the door
def home(request):
    return render(request, 'index.html')