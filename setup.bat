# Dzięki temu nie musisz pamiętać komend – po prostu uruchamiasz jeden plik i całe środowisko buduje się samo.
@echo off
echo [1] Instaluj srodowisko DEWELOPERSKIE (z Pylint, IntelliSense itp.)
echo [2] Instaluj srodowisko PRODUKCYJNE (tylko Django i zaleznosci)
set /p choice="Wybierz opcje (1-2): "

if "%choice%"=="1" (
    echo Instalowanie wymagania dev...
    pip install -r requirements-dev.txt
    echo Gotowe! Twoje VS Code powinno teraz poprawnie podpowiadac kod.
) else if "%choice%"=="2" (
    echo Instalowanie wymagania produkcyjne...
    pip install -r requirements.txt
    echo Gotowe! Srodowisko gotowe do pracy na serwerze.
) else (
    echo Nieprawidlowy wybor.
)
pause
