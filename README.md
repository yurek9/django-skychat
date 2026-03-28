# 🚀 Django SkyChat (Tailwind 4 + HTMX)

A modern chat application built with Django, leveraging cutting-edge frontend technologies for seamless real-time interaction without page reloads.

## ✨ Features
- **Real-time feel**: Send messages without page refresh (HTMX).
- **Modern UI**: Styled with Tailwind CSS 4.
- **Admin Tools**: Ability to clear chat history (staff only).
- **UX Essentials**: Real-time character counter, loading spinners, and error handling.
- **Auth**: Full registration and login system.

## 🛠️ Installation and Setup

### 1. Cloning and Environment
```bash
# Create virtual environment
python -m venv venv
# Activate (Windows)
venv\Scripts\activate
# Install dependencies
pip install django django-environ django-whitenoise
```

### 2. Environment Variables
Copy the .env.example file to .env and fill in the keys:

```bash
cp .env.example .env
```

### 3. Database and Tailwind
```bash
python manage.py makemigrations
python manage.py migrate
# Run Tailwind compiler (in a separate terminal)
npm run dev
```

### 4. Start Server
```bash
python manage.py runserver
```

## 📦 Technology Stack
Backend: Django 6.x

Frontend: Tailwind CSS 4 (Beta/Stable), HTMX

Icons: Heroicons



