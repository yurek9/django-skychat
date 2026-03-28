from django.contrib import admin
from .models import Message, Profile


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "short_content", "timestamp", "is_read")
    list_filter = ("user", "timestamp", "is_read")
    search_fields = ("content", "user__username")
    ordering = ("-timestamp",)

    def short_content(self, obj):
        return (obj.content[:40] + "...") if len(obj.content) > 40 else obj.content

    short_content.short_description = "Treść"


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "is_online", "last_typing")
    list_filter = ("is_online",)
    search_fields = ("user__username",)
