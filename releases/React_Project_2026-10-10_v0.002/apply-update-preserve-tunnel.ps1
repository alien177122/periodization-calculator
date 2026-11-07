# Apply React Project update on Windows (Venus) - archive old tree, preserve tunnel + DB.
# Usage (PowerShell, from folder containing source.tar.gz):
#   .\apply-update-preserve-tunnel.ps1 -TargetDir "C:\Users\user\Desktop\React_Project" -Archive ".\source.tar.gz"
param(
  [string]$TargetDir = "$env:USERPROFILE\Desktop\React_Project",
  [Parameter(Mandatory = $true)]
  [string]$Archive,
  [string]$ArchiveRoot = "$env:USERPROFILE\Desktop\_React_Project_Archive"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $Archive)) {
  throw "Archive not found: $Archive"
}

$stamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$preserveNames = @(
  ".env", ".env.local", ".env.public", ".env.public.local",
  ".env.docker", ".env.docker.local", ".env.production",
  "gym.db", "gym.db-wal", "gym.db-shm"
)

Write-Host "== React Project update (preserve tunnel) =="
Write-Host "Target: $TargetDir"
Write-Host "Archive: $Archive"

# 1) Stop node/docker that may lock gym.db (cloudflared token stays in .env.public)
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
if (Get-Command docker -ErrorAction SilentlyContinue) {
  Push-Location $TargetDir -ErrorAction SilentlyContinue
  if (Test-Path (Join-Path $TargetDir "docker-compose.yml")) {
    cmd /c "docker compose down 2>nul"
  }
  Pop-Location -ErrorAction SilentlyContinue
}

# 2) Backup preserve files to temp
$tempPreserve = Join-Path $env:TEMP "react-preserve-$stamp"
New-Item -ItemType Directory -Force -Path $tempPreserve | Out-Null

if (Test-Path $TargetDir) {
  foreach ($name in $preserveNames) {
    $src = Join-Path $TargetDir $name
    if (Test-Path $src) {
      Copy-Item -Recurse -Force $src (Join-Path $tempPreserve $name)
      Write-Host "Preserved: $name"
    }
  }
  if (Test-Path (Join-Path $TargetDir "docker-data")) {
    Copy-Item -Recurse -Force (Join-Path $TargetDir "docker-data") (Join-Path $tempPreserve "docker-data")
    Write-Host "Preserved: docker-data/"
  }
  if (Test-Path (Join-Path $TargetDir "workspace-files")) {
    Copy-Item -Recurse -Force (Join-Path $TargetDir "workspace-files") (Join-Path $tempPreserve "workspace-files")
    Write-Host "Preserved: workspace-files/"
  }

  # 3) Archive full old tree
  New-Item -ItemType Directory -Force -Path $ArchiveRoot | Out-Null
  $oldArchive = Join-Path $ArchiveRoot "React_Project_$stamp"
  Move-Item -Force $TargetDir $oldArchive
  Write-Host "Archived old version -> $oldArchive"
} else {
  Write-Host "No existing target - fresh install."
  New-Item -ItemType Directory -Force -Path $TargetDir | Out-Null
}

# 4) Extract tarball (requires tar on Windows 10+)
$parent = Split-Path $TargetDir -Parent
Push-Location $parent
tar -xzf (Resolve-Path $Archive)
Pop-Location

# Find extracted folder (React_Project* or React*)
$extracted = Get-ChildItem $parent -Directory |
  Where-Object { $_.Name -like "React_Project*" -or $_.Name -like "React*" } |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $extracted) { throw "Could not find extracted folder in $parent" }
if ($extracted.FullName -ne $TargetDir) {
  if (Test-Path $TargetDir) { Remove-Item -Recurse -Force $TargetDir }
  Move-Item -Force $extracted.FullName $TargetDir
}

# 5) Restore preserved secrets/data
foreach ($name in $preserveNames) {
  $src = Join-Path $tempPreserve $name
  if (Test-Path $src) {
    Copy-Item -Recurse -Force $src (Join-Path $TargetDir $name)
    Write-Host "Restored: $name"
  }
}
foreach ($dir in @("docker-data", "workspace-files")) {
  $src = Join-Path $tempPreserve $dir
  if (Test-Path $src) {
    Copy-Item -Recurse -Force $src (Join-Path $TargetDir $dir)
    Write-Host "Restored: $dir/"
  }
}

# 6) Install + build
Push-Location $TargetDir
npm install
npm run build
Pop-Location

Write-Host ""
Write-Host "Done. Tunnel config (.env.public) and gym.db preserved."
Write-Host "Restart public stack:"
Write-Host "  cd $TargetDir"
Write-Host "  npm run public:stable"
Write-Host "Or Docker: npm run docker:up"
