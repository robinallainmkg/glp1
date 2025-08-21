# Script simple pour build production avec TinaCMS
param(
    [string]$CommitMessage = "Build: Production avec TinaCMS"
)

Write-Host "BUILD PRODUCTION AVEC TINACMS" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Nettoyage
Write-Host "Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path ".astro") { Remove-Item ".astro" -Recurse -Force }

# Configuration des variables TinaCMS
Write-Host "Configuration TinaCMS..." -ForegroundColor Yellow
$env:NEXT_PUBLIC_TINA_CLIENT_ID = "d2c40213-494b-4005-94ad-b601dbdf1f0e"
$env:TINA_TOKEN = "f5ae6be5c8b2d3dbb575918e775be87d1f4ec29d"
$env:NODE_ENV = "production"
Write-Host "Variables configurees: OK" -ForegroundColor Green

# Build
Write-Host "Build en cours..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build reussi" -ForegroundColor Green
    
    # Vérifications
    if (Test-Path "dist") {
        $fileCount = (Get-ChildItem "dist" -Recurse -File).Count
        Write-Host "Fichiers generes: $fileCount" -ForegroundColor Green
    }
    
    if (Test-Path "dist/admin") {
        Write-Host "Interface admin: OK" -ForegroundColor Green
    } else {
        Write-Host "Interface admin: MANQUANTE" -ForegroundColor Red
    }
    
} else {
    Write-Host "Echec du build:" -ForegroundColor Red
    Write-Host $buildResult -ForegroundColor Red
    exit 1
}

Write-Host "BUILD TERMINE" -ForegroundColor Green
