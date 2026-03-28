@echo off
start cmd /k "npx @tailwindcss/cli -i ./src/input.css -o ./static/dist/output.css --watch"
start cmd /k "python manage.py runserver"
echo Czat i Tailwind zostaly uruchomione w osobnych oknach.
