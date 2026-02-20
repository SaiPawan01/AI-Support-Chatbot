from django.contrib import admin
from django.contrib import admin
from .models import Document

# Register your models here.
@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "version", "uploaded_at")
    readonly_fields = ("status",)
    search_fields = ("title", "category", "version")
    list_filter = ("category", "uploaded_at")
    ordering = ("-uploaded_at",)