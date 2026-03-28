from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

User = get_user_model()


class Message(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="messages")
    content = models.TextField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["timestamp"]  # rosnąco – zgodne z widokami

    def __str__(self):
        content = str(self.content)
        preview = content[:20] + ("..." if len(content) > 20 else "")
        return f"{self.user.username}: {preview}"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    last_typing = models.DateTimeField(null=True, blank=True)
    last_seen = models.DateTimeField(null=True, blank=True)
    is_online = models.BooleanField(default=False)
    status = models.CharField(
        max_length=20,
        choices=[
            ("online", "Online"),    # gdy użytkownik pingował w ostatnich 20 sekundach
            ("idle", "Zaraz wracam"),  # brak aktywności 20–120 sekund
            ("busy", "Zajęty"),      # brak aktywności ponad 120 sekund
            ("offline", "Offline"),  # brak aktywności ponad 5 minut
        ],
        default="offline",
    )

    def __str__(self):
        return f"Profil: {self.user.username}"

    @property
    def is_typing(self):
        if not self.last_typing:
            return False
        return (timezone.now() - self.last_typing).total_seconds() < 5


# --- SIGNALS ---


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """
    Tworzy profil przy rejestracji użytkownika.
    Jeśli profil istnieje – aktualizuje go.
    """
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
