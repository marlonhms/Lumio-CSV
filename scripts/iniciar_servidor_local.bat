@echo off
title Lumio CSV - Servidor Local PWA
chcp 65001 >nul
node "%~dp0serve.js"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Certifique-se de que o Node.js esta instalado.
    pause
)
