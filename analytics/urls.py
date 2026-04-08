from django.urls import path
from .views import log_visit
from .views import log_visit, get_visitor_count

urlpatterns = [
    # This creates the endpoint: /api/log-visit/
    path('log-visit/', log_visit, name='log_visit'),
    path('get-count/', get_visitor_count, name='get_count')
]