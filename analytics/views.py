import requests
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from .models import VisitorStats
from django.shortcuts import render

def get_visitor_count(request):
    # Retrieve the stats without incrementing
    stats, created = VisitorStats.objects.get_or_create(id=1)
    return JsonResponse({"count": stats.total_visits})

@ensure_csrf_cookie
def log_visit(request):
    if request.method == "POST":
        # 1. Increment the count in the database
        # We use id=1 to always update the same single row
        stats, created = VisitorStats.objects.get_or_create(id=1)
        stats.total_visits += 1
        stats.save()

        # 2. Capture Visitor Metadata
        # Gets IP even if behind the Google Cloud proxy
        ip = request.META.get('HTTP_X_FORWARDED_FOR', request.META.get('REMOTE_ADDR'))
        user_agent = request.META.get('HTTP_USER_AGENT', 'unknown')
        referrer = request.META.get('HTTP_REFERER', 'Direct/Unknown')

        # 3. Discord Notification
        webhook_url = "https://discord.com/api/webhooks/1471824299534061761/ZOv0jd4_KiMBddhB1urOOD0hjA8sHKztkSqGR77zwShaFSzT80HxZaeEABpqWnq1pOXl"
        
        payload = {
            "embeds": [{
                "title": "🚀 New Portfolio Visit",
                "description": f"Total Visits: **{stats.total_visits}**",
                "color": 5814783,
                "fields": [
                    {"name": "IP Address", "value": ip, "inline": True},
                    {"name": "Referrer", "value": referrer, "inline": True},
                    {"name": "User Agent", "value": user_agent[:100] + "..." if len(user_agent) > 100 else user_agent}
                ]
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