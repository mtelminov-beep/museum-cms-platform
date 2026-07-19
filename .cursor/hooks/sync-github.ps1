# Cursor hook: после правок/завершения агента — синхронизация с GitHub (RU commit).

$ErrorActionPreference = "SilentlyContinue"
$inputJson = [Console]::In.ReadToEnd()

# .cursor/hooks → корень проекта
$Root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$Sync = Join-Path $Root "scripts\sync-to-github.ps1"

if (-not (Test-Path $Sync)) {
  Write-Output '{}'
  exit 0
}

$reason = "edit"
try {
  $payload = $inputJson | ConvertFrom-Json
  $eventName = "$($payload.hook_event_name)$($payload.event)$($payload.hookEvent)"
  if ($eventName -match "stop") { $reason = "stop" }
} catch {}

Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy", "Bypass",
  "-File", $Sync,
  "-Reason", $reason
) -WorkingDirectory $Root -WindowStyle Hidden

Write-Output '{}'
exit 0
