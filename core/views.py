from django.shortcuts import render, redirect
from django.contrib.auth import login
from core.forms import SignupForm


def index(request):
    return render(request, 'core/index.html')


def signup_view(request):
    if request.method == "POST":
        form = SignupForm(request.POST)
        if form.is_valid():
            # Zapisujemy użytkownika do bazy
            user = form.save()
            # Automatyczne logowanie po rejestracji
            login(request, user)
            # Przekierowanie do widoku czatu (podmień 'chat_room' na swoją nazwę URL)
            return redirect("chat_room")
    else:
        form = SignupForm()

    return render(request, "core/signup.html", {"form": form})
