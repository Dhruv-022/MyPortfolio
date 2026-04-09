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
    if request.method == "POST":
        stats, created = VisitorStats.objects.get_or_create(id=1)
        stats.total_visits += 1
        stats.save()

        # 1. Capture Metadata
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        user_agent_raw = request.META.get('HTTP_USER_AGENT', '')
        user_agent = parse(user_agent_raw)
        referrer = request.META.get('HTTP_REFERER', 'Direct/Unknown')

        # 2. Get Location via IP-API (Free)
        location = "Unknown"
        try:
            # Use 127.0.0.1 for testing, but in production 'ip' will be real
            geo_res = requests.get(f'http://ip-api.com/json/{ip}').json()
            if geo_res.get('status') == 'success':
                location = f"{geo_res.get('city')}, {geo_res.get('country')}"
        except:
            pass

        # 3. Refined Discord Notification
        webhook_url = "https://discord.com/api/webhooks/..."
        
        payload = {
            "embeds": [{
                "title": "🚀 New Portfolio Visit",
                "color": 16753920, # Lucid Blue-ish Orange or your preferred hex
                "fields": [
                    {"name": "Total Visits", "value": str(stats.total_visits), "inline": False},
                    {"name": "IP Address", "value": ip, "inline": True},
                    {"name": "Location", "value": location, "inline": True},
                    {"name": "Referrer", "value": referrer, "inline": False},
                    {"name": "Browser", "value": f"{user_agent.browser.family} {user_agent.browser.version_string}", "inline": True},
                    {"name": "OS", "value": f"{user_agent.os.family} {user_agent.os.version_string}", "inline": True},
                ],
                "footer": {"text": "Nexus Analytics Engine"}
            }]
        }

        try:
            requests.post(webhook_url, json=payload)
        except Exception as e:
            print(f"Discord error: {e}")

        return JsonResponse({"count": stats.total_visits})
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

@ensure_csrf_cookie # This is the "Key" that opens the door
def home(request):
    return render(request, 'index.html')