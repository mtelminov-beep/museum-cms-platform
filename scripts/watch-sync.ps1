# Фоновый watcher: при изменении файлов — дебаунс и push на GitHub.

$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$SyncScript = Join-Path $PSScriptRoot "sync-to-github.ps1"
Set-Location $Root

Write-Host "Автосинхронизация GitHub запущена для: $Root"
Write-Host "Остановка: Ctrl+C"
Write-Host "Отключение: `$env:MUSEUM_CMS_AUTOSYNC='0'"

$script:pending = $false
$watcher = New-Object System.IO.FileSystemWatcher $Root, "*"
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [IO.NotifyFilters]'FileName, LastWrite, DirectoryName'

$handler = {
  $path = $Event.SourceEventArgs.FullPath
  if ($path -match '\\node_modules\\|\\\.git\\|\\dist\\|\\uploads\\|runtime-state\.json$|museum-cms-autosync|\.stamp$|\.lock$') {
    return
  }
  $script:pending = $true
}

Register-ObjectEvent $watcher Created -Action $handler | Out-Null
Register-ObjectEvent $watcher Changed -Action $handler | Out-Null
Register-ObjectEvent $watcher Deleted -Action $handler | Out-Null
Register-ObjectEvent $watcher Renamed -Action $handler | Out-Null

while ($true) {
  Start-Sleep -Milliseconds 800
  if ($script:pending) {
    Start-Sleep -Seconds 2
    if ($script:pending) {
      $script:pending = $false
      try {
        & powershell -NoProfile -ExecutionPolicy Bypass -File $SyncScript -Reason watch
      } catch {
        Write-Host "Ошибка синхронизации: $($_.Exception.Message)"
      }
    }
  }
}
