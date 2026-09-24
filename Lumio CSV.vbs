' =====================================================================
' Lumio CSV - Inicializador Silencioso (Zero Janelas de Terminal)
' Abre o visualizador diretamente em modo Janela de Aplicativo Standalone
' =====================================================================
Option Explicit

Dim objShell, objFSO, strDir, strTarget, arrBrowserPaths, path, strBrowserExe, strFileUri

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strTarget = strDir & "\index.html"

If Not objFSO.FileExists(strTarget) Then
    MsgBox "Arquivo index.html não encontrado na pasta do Lumio CSV.", 16, "Lumio CSV"
    WScript.Quit 1
End If

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

If strBrowserExe <> "" Then
    strFileUri = "file:///" & Replace(strTarget, "\", "/")
    objShell.Run """" & strBrowserExe & """ --app=""" & strFileUri & """", 1, False
Else
    objShell.Run """" & strTarget & """", 1, False
End If
