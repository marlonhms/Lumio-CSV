' Lumio CSV - Inicializador Silencioso (Zero Janelas de Terminal)
Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")
strDir = objFSO.GetParentFolderName(WScript.ScriptFullName)
strTarget = strDir & "\index.html"

' Abre index.html no navegador padrão de forma 100% silenciosa
objShell.Run """" & strTarget & """", 1, False
