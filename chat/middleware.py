
from django.utils import timezone
from django.utils.deprecation import MiddlewareMixin
from .models import Profile


class LastSeenMiddleware(MiddlewareMixin):
    def process_request(self, request):
        # ignorujemy niezalogowanych
        if not request.user.is_authenticated:
            return

        # ignorujemy statyczne pliki
        if request.path.startswith("/static/"):
            return

        # ignorujemy AJAX (fetch, htmx, axios)
        if request.headers.get("X-Requested-With") == "XMLHttpRequest":
            return

        # aktualizacja last_seen
        Profile.objects.filter(user=request.user).update(last_seen=timezone.now())
