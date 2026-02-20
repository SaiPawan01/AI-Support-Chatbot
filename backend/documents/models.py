from django.db import models

# Create your models here.
class Document(models.Model):
    CATEGORY_CHOICES = [
        ("policy", "Policy"),
        ("faq", "FAQ"),
        ("manual", "Manual"),
        ("guide", "Guide"),
        ("other", "Other"),
    ]

    title = models.CharField(max_length=255)
    category = models.TextField(max_length=20, choices=CATEGORY_CHOICES)
    version = models.CharField(max_length=20)
    file = models.FileField(upload_to='documents/')
    status = models.CharField(
        max_length=20,
        choices=[
            ("pending", "Pending"),
            ("processing", "Processing"),
            ("completed", "Completed"),
            ("failed", "Failed"),
        ],
        default="pending",
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - {self.version}"
