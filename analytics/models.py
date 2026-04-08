from django.db import models

class VisitorStats(models.Model):
    # Field to store the running total of visitors
    total_visits = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Total Visits: {self.total_visits}"