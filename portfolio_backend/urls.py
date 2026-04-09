from django.contrib import admin
from django.urls import path, include
from analytics.views import home

urlpatterns = [
    # Fixed the admin path
    path('admin/', admin.site.urls),
    # This includes your visitor counter logic
    path('api/', include('analytics.urls')),
    path('', home, name='home'),
]