@echo off
:: J.A.R.V.I.S - Otimizador de PC
:: Clique duas vezes neste arquivo. Ele pede permissao de administrador e abre o menu.
chcp 65001 >nul
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0otimizador.ps1"
pause
