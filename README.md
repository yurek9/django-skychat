# 🚀 Django SkyChat (Tailwind 4 + HTMX)

Nowoczesna aplikacja czatu zbudowana w Django, wykorzystująca najnowsze technologie frontendowe dla zapewnienia płynności bez przeładowania strony.

## ✨ Funkcje
- **Real-time feel**: Wysyłanie wiadomości bez odświeżania strony (HTMX).
- **Modern UI**: Stylizacja przy użyciu Tailwind CSS 4.
- **Admin Tools**: Możliwość czyszczenia historii czatu (tylko dla personelu).
- **UX Essentials**: Licznik znaków w czasie rzeczywistym, wskaźniki ładowania (spinners) oraz obsługa błędów sieci.
- **Auth**: Pełny system rejestracji i logowania.

## 🛠️ Instalacja i uruchomienie

### 1. Klonowanie i środowisko
```bash
# Stwórz środowisko wirtualne
python -m venv venv
# Aktywuj (Windows)
venv\Scripts\activate
# Zainstaluj zależności
pip install django django-environ django-whitenoise

*** 2. Konfiguracja zmiennych
Skopiuj plik .env.example do .env i uzupełnij klucze:

---Bash
cp .env.example .env

*** 3. Baza danych i Tailwind
---Bash
python manage.py makemigrations
python manage.py migrate
# Uruchom kompilator Tailwind (w osobnym terminalu)
npm run dev
*** 4. Start serwera
---Bash
python manage.py runserver

*** 📦 Struktura technologiczna
Backend: Django 6.x

Frontend: Tailwind CSS 4 (Beta/Stable), HTMX

Ikony: Heroicons



