@echo off
title Lumio CSV - Criar Atalho na Area de Trabalho
chcp 65001 >nul
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0criar_atalho_desktop.ps1"
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
) else (
    echo.
    echo Ocorreu um erro ao criar o atalho.
    pause
)
