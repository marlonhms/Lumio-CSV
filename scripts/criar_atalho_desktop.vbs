' =====================================================================
' Lumio CSV - Criador de Atalho Moderno para Windows (VBScript Silencioso)
' Cria atalho na Área de Trabalho com ícone e modo aplicativo standalone
' Sem abrir janelas de terminal ou prompt de comando
' =====================================================================
Option Explicit

Dim objShell, objFSO, strScriptDir, strProjectDir, strIndexHtml, strIconFile, strDesktopPath, objShortcut
Dim strBrowserExe, strFileUri, arrBrowserPaths, path

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strScriptDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
' If inside scripts folder, resolve project root
If LCase(objFSO.GetFileName(strScriptDir)) = "scripts" Then
    strProjectDir = objFSO.GetParentFolderName(strScriptDir)
Else
    strProjectDir = strScriptDir
End If

strIndexHtml = strProjectDir & "\index.html"
strIconFile = strProjectDir & "\assets\icons\lumio.ico"

If Not objFSO.FileExists(strIndexHtml) Then
    MsgBox "Erro: Arquivo index.html não encontrado em:" & vbCrLf & strProjectDir, 16, "Lumio CSV"
    WScript.Quit 1
End If

' Candidate Chromium paths for standalone application window mode
arrBrowserPaths = Array( _
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe", _
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe", _
    "C:\Program Files\Google\Chrome\Application\chrome.exe", _
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe", _
    objShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\Google\Chrome\Application\chrome.exe", _
    "C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe", _
    objShell.ExpandEnvironmentStrings("%LOCALAPPDATA%") & "\BraveSoftware\Brave-Browser\Application\brave.exe" _
)

strBrowserExe = ""
For Each path In arrBrowserPaths
    If objFSO.FileExists(path) Then
        strBrowserExe = path
        Exit For
    End If
Next

strDesktopPath = objShell.SpecialFolders("Desktop")
Set objShortcut = objShell.CreateShortcut(strDesktopPath & "\Lumio CSV.lnk")

If strBrowserExe <> "" Then
    strFileUri = "file:///" & Replace(strIndexHtml, "\", "/")
    objShortcut.TargetPath = strBrowserExe
    objShortcut.Arguments = "--app=""" & strFileUri & """ --disable-frame-rate-limit --enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --disable-features=UseEcoQoSForBackgroundProcess"
    objShortcut.Description = "Lumio CSV - Visualizador & Editor de CSV Ultraleve"
    objShortcut.WorkingDirectory = strProjectDir
    If objFSO.FileExists(strIconFile) Then
        objShortcut.IconLocation = strIconFile & ",0"
    End If
    objShortcut.Save
    MsgBox "✔ Atalho do Lumio CSV criado com sucesso na sua Área de Trabalho!" & vbCrLf & vbCrLf & _
           "Modo: Janela de Aplicativo Standalone" & vbCrLf & _
           "Navegador: " & objFSO.GetFileName(strBrowserExe), 64, "Lumio CSV"
Else
    objShortcut.TargetPath = strIndexHtml
    objShortcut.Description = "Lumio CSV - Visualizador & Editor de CSV Ultraleve"
    objShortcut.WorkingDirectory = strProjectDir
    If objFSO.FileExists(strIconFile) Then
        objShortcut.IconLocation = strIconFile & ",0"
    End If
    objShortcut.Save
    MsgBox "✔ Atalho do Lumio CSV criado com sucesso na sua Área de Trabalho!" & vbCrLf & vbCrLf & _
           "Modo: Navegador Padrão", 64, "Lumio CSV"
End If
