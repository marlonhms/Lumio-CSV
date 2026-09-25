# =====================================================================
# Lumio CSV - Criador de Atalho Moderno para Windows
# Cria atalho de aplicativo na Área de Trabalho com ícone personalizado
# =====================================================================

param (
    [switch]$DefaultBrowser,
    [switch]$AddToStartMenu
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   Lumio CSV - Instalador de Atalho Moderno (Windows)    " -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$ProjectDir = (Resolve-Path "$PSScriptRoot\..").Path
$IndexHtml = Join-Path $ProjectDir "index.html"
$IconFile = Join-Path $ProjectDir "assets\icons\lumio.ico"

if (-not (Test-Path $IndexHtml)) {
    Write-Error "Arquivo index.html nao encontrado em: $ProjectDir"
    exit 1
}

# Detect Chromium browser for native standalone app-window mode
$CandidateBrowsers = @(
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe",
    "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$BrowserExe = $null
foreach ($path in $CandidateBrowsers) {
    if (Test-Path $path) {
        $BrowserExe = $path
        break
    }
}

if ($null -eq $BrowserExe) {
    $edgeCmd = (Get-Command msedge.exe -ErrorAction SilentlyContinue).Source
    $chromeCmd = (Get-Command chrome.exe -ErrorAction SilentlyContinue).Source
    if ($edgeCmd) { $BrowserExe = $edgeCmd }
    elseif ($chromeCmd) { $BrowserExe = $chromeCmd }
}

$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ShortcutPath = Join-Path $DesktopPath "Lumio CSV.lnk"

$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

if ($DefaultBrowser -or ($null -eq $BrowserExe)) {
    # Open with system default browser
    $Shortcut.TargetPath = $IndexHtml
    $Shortcut.WorkingDirectory = $ProjectDir
    $Shortcut.Description = "Lumio CSV - Visualizador e Editor Ultraleve de Dados"
    if (Test-Path $IconFile) {
        $Shortcut.IconLocation = "$IconFile,0"
    }
    Write-Host "[+] Criando atalho para o navegador padrao..." -ForegroundColor Yellow
} else {
    # Standalone App Window Mode (Frameless, clean native desktop look)
    $FileUri = "file:///" + ($IndexHtml -replace "\\", "/")
    $Shortcut.TargetPath = $BrowserExe
    $Shortcut.Arguments = "--app=""$FileUri"" --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --disable-features=UseEcoQoSForBackgroundProcess"
    $Shortcut.WorkingDirectory = $ProjectDir
    $Shortcut.Description = "Lumio CSV - Visualizador & Editor de CSV Ultraleve"
    if (Test-Path $IconFile) {
        $Shortcut.IconLocation = "$IconFile,0"
    }
    Write-Host "[+] Configurando modo Janela de Aplicativo Nativa (Standalone App)..." -ForegroundColor Green
}

$Shortcut.Save()
Write-Host "[OK] Atalho criado na Area de Trabalho: '$ShortcutPath'" -ForegroundColor Green

if ($AddToStartMenu) {
    $StartMenuPath = [Environment]::GetFolderPath("Programs")
    $StartShortcutPath = Join-Path $StartMenuPath "Lumio CSV.lnk"
    $StartShortcut = $WshShell.CreateShortcut($StartShortcutPath)
    $StartShortcut.TargetPath = $Shortcut.TargetPath
    $StartShortcut.Arguments = $Shortcut.Arguments
    $StartShortcut.WorkingDirectory = $Shortcut.WorkingDirectory
    $StartShortcut.Description = $Shortcut.Description
    $StartShortcut.IconLocation = $Shortcut.IconLocation
    $StartShortcut.Save()
    Write-Host "[OK] Atalho adicionado ao Menu Iniciar: '$StartShortcutPath'" -ForegroundColor Green
}

Write-Host ""
Write-Host "Pronto! O Lumio CSV agora pode ser iniciado diretamente pela Area de Trabalho." -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""
