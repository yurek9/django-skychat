from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseNotAllowed, JsonResponse
# from django.core.paginator import Paginator
# from django.template.loader import render_to_string
from django.shortcuts import render
from django.utils import timezone
from chat.models import Message, Profile


# Widok zwracający listę wiadomości (HTML)
def get_messages(request):
    messages = list(Message.objects.order_by("-timestamp")[:50])
    messages.reverse()  # od najstarszej do najnowszej

    return render(
        request,
        "chat/message_list.html",
        {"messages": messages, "user": request.user},
    )


@login_required
def send_message(request):
    # Obsługuje tylko POST, zwraca 405 dla innych metod
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])
    # Pobiera treść wiadomości, sprawdza czy nie jest pusta, tworzy nową wiadomość i renderuje ją
    content = request.POST.get("content", "").strip()
    if not content:
        return HttpResponse(status=400, content="Message cannot be empty")
    # Tworzymy wiadomość z przypisanym użytkownikiem i treścią,
    new_message = Message.objects.create(user=request.user, content=content)
    # renderujemy tylko nową wiadomość, a nie całą listę wiadomości -
    # to jest kluczowe dla działania AJAX-a
    # dzięki czemu AJAX będzie mógł dodać tę wiadomość do istniejącej listy
    #  bez przeładowania całej strony
    return render(request, "chat/single_message.html", {"message": new_message})


@staff_member_required
def clear_chat(request):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    Message.objects.all().delete()
    return render(request, "chat/message_list.html", {"messages": []})


# Widok renderujący stronę czatu,
# która będzie zawierać miejsce na wiadomości i formularz do wysyłania nowych wiadomości.
@login_required
def chat_view(request):
    messages = Message.objects.order_by("-timestamp")[:50][::-1]
    return render(request, "chat/chat_room.html", {"messages": messages})


# Aktualizacja „pisze…”
@login_required
def user_typing(request):
    Profile.objects.update_or_create(
        user=request.user, defaults={"last_typing": timezone.now()}
    )
    return HttpResponse(status=204)


# Sprawdzanie „ktoś pisze…”
@login_required
def check_typing(request):
    five_seconds_ago = timezone.now() - timezone.timedelta(seconds=5)

    typing_user = (
        Profile.objects.filter(last_typing__gt=five_seconds_ago)
        .exclude(user=request.user)
        .select_related("user")
        .first()
    )

    if typing_user:
        return JsonResponse({"typing": True, "username": typing_user.user.username})
    return JsonResponse({"typing": False})


# Endpoint do pingowania, który aktualizuje status online użytkownika
@login_required
def ping_online(request):
    profile = Profile.objects.get(user=request.user)
    Profile.objects.filter(user=request.user).update(
        is_online=True, last_seen=timezone.now()
    )
    update_status(profile)
    return JsonResponse({"ok": True})  # return HttpResponse(status=204)


#  liczymy profile zaktualizowane w ciągu ostatnich 30 sekund
#  każdy użytkownik, który był widziany ostatnio ponad 30 sekund temu, jest uznawany za offline.
def mark_users_offline():
    threshold = timezone.now() - timezone.timedelta(seconds=30)
    # kto był nieaktywny dłużej niż 30 sekund, ten jest offline
    Profile.objects.filter(last_seen__lt=threshold).update(
        is_online=False,
        status="offline"
    )


@login_required
def users_online_count(request):
    mark_users_offline()
    count = Profile.objects.filter(is_online=True).count()
    return JsonResponse({"count": count})


def update_status(profile):
    now = timezone.now()
    delta = (now - profile.last_seen).total_seconds()

    if delta < 20:
        profile.status = "online"
        profile.is_online = True
    elif delta < 120:
        profile.status = "idle"
        profile.is_online = True
    elif delta < 300:
        profile.status = "busy"
        profile.is_online = True
    else:
        profile.status = "offline"
        profile.is_online = False

    profile.save(update_fields=["status", "is_online"])


# Widok zwracający statusy wszystkich użytkowników (JSON)
@login_required
def get_statuses(request):
    profiles = Profile.objects.select_related("user")

    data = {
        p.user.username: {
            "status": p.status,
        }
        for p in profiles
    }
    return JsonResponse(data)


# Widok zwracający listę użytkowników online (JSON)
@login_required
def get_online_users(request):
    mark_users_offline()
    online_users = Profile.objects.filter(is_online=True).select_related("user")
    data = [
        {
            "id": profile.user.pk,
            "username": profile.user.username,
            "last_seen": profile.last_seen.isoformat() if profile.last_seen else None,
            "status": profile.status,
        }
        for profile in online_users
    ]
    return JsonResponse(data, safe=False)


#  widok nie pobiera danych — dane będą pobierane AJAX-em z Twojego endpointu /get-online-users/.
@login_required
def online_view(request):
    return render(request, "chat/online.html")
