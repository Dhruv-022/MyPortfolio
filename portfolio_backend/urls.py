from django.contrib import admin
from django.urls import path, include
from analytics.views import home, contact_page  # Import your new contact view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('analytics.urls')),
    path('contact/', contact_page, name='contact'),  # Add this clean URL route
    path('', home, name='home'),
]