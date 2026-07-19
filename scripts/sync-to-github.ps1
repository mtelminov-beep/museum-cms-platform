param(
  [string]$Reason = "auto",
  [switch]$Force
)

$ErrorActionPreference = "Stop"

function Build-RussianCommitMessage {
  param(
    [string[]]$Files,
    [string]$Reason
  )

  $hasAdmin = @($Files | Where-Object { $_ -match 'frontend/src/admin|AdminPage|adminAuth' }).Count -gt 0
  $hasBackend = @($Files | Where-Object { $_ -match '^backend/' }).Count -gt 0
  $hasFrontend = @($Files | Where-Object { $_ -match '^frontend/' }).Count -gt 0
  $hasDocs = @($Files | Where-Object { $_ -match '^docs/|^README' }).Count -gt 0
  $hasHooks = @($Files | Where-Object { $_ -match '^\.cursor/|^scripts/' }).Count -gt 0

  $parts = @()
  if ($hasAdmin) { $parts += "админку и редакторы контента" }
  if ($hasBackend) { $parts += "API бэкенда" }
  if ($hasFrontend -and -not $hasAdmin) { $parts += "публичный фронтенд" }
  if ($hasDocs) { $parts += "документацию" }
  if ($hasHooks) { $parts += "автосинхронизацию с GitHub" }
  if (-not $parts.Count) { $parts = @("файлы проекта") }

  $unique = @()
  foreach ($p in $parts) {
    if ($unique -notcontains $p) { $unique += $p }
  }

  if ($unique.Count -eq 1) { $what = $unique[0] }
  elseif ($unique.Count -eq 2) { $what = "$($unique[0]) и $($unique[1])" }
  else { $what = ($unique[0..($unique.Count - 2)] -join ", ") + " и " + $unique[-1] }

  switch ($Reason) {
    "watch"  { $prefix = "Автосохранение" }
    "stop"   { $prefix = "Синхронизация после работы агента" }
    "edit"   { $prefix = "Автосинхронизация" }
    "manual" { $prefix = "Синхронизация" }
    default  { $prefix = "Обновление" }
  }

  $count = @($Files).Count
  return ("{0}: обновлены {1} ({2} файл(ов))." -f $prefix, $what, $count)
}

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

if ($env:MUSEUM_CMS_AUTOSYNC -eq "0") {
  Write-Host "Автосинхронизация отключена (MUSEUM_CMS_AUTOSYNC=0)"
  exit 0
}

$lockPath = Join-Path $Root ".git\museum-cms-autosync.lock"
$stampPath = Join-Path $Root ".git\museum-cms-autosync.stamp"
$debounceSeconds = 8

if (Test-Path $lockPath) {
  $lockAge = (Get-Date) - (Get-Item $lockPath).LastWriteTime
  if ($lockAge.TotalMinutes -lt 5) {
    Write-Host "Синхронизация уже выполняется"
    exit 0
  }
  Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}

if (-not $Force -and (Test-Path $stampPath)) {
  $age = (Get-Date) - (Get-Item $stampPath).LastWriteTime
  if ($age.TotalSeconds -lt $debounceSeconds) {
    Write-Host "Пропуск: недавно уже синхронизировали"
    exit 0
  }
}

New-Item -ItemType File -Path $lockPath -Force | Out-Null

try {
  git rev-parse --is-inside-work-tree | Out-Null

  $status = git status --porcelain
  if (-not $status) {
    Write-Host "Нет изменений для синхронизации"
    exit 0
  }

  git add -A
  git reset HEAD -- .env 2>$null | Out-Null
  git reset HEAD -- ".env.*" 2>$null | Out-Null
  git reset HEAD -- "backend/data/runtime-state.json" 2>$null | Out-Null
  git reset HEAD -- "backend/data/uploads/" 2>$null | Out-Null
  if (Test-Path "backend/data/uploads/.gitkeep") {
    git add -- "backend/data/uploads/.gitkeep" 2>$null | Out-Null
  }

  $staged = @(git diff --cached --name-only | Where-Object { $_.Trim() })
  if (-not $staged.Count) {
    Write-Host "После фильтрации нечего коммитить"
    exit 0
  }

  $msg = Build-RussianCommitMessage -Files $staged -Reason $Reason
  git commit --trailer "Co-authored-by: Cursor <cursoragent@cursor.com>" -m $msg
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Коммит не создан"
    exit 0
  }

  git push origin HEAD
  if ($LASTEXITCODE -ne 0) {
    throw "Не удалось отправить изменения на GitHub"
  }

  (Get-Date).ToString("o") | Set-Content -Path $stampPath -Encoding utf8
  Write-Host ("Синхронизировано с GitHub: {0}" -f $msg)
}
finally {
  Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}