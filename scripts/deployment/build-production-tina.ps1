# Script de build production avec TinaCMS
param(
    [string]$CommitMessage = "Build: Production avec TinaCMS actif"
)

Write-Host "🏗️  BUILD PRODUCTION AVEC TINACMS" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Étape 1: Nettoyer build précédent
Write-Host "`n🧹 Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path ".astro") { Remove-Item ".astro" -Recurse -Force }
if (Test-Path "admin") { Remove-Item "admin" -Recurse -Force }

# Étape 2: Charger variables d'environnement production
Write-Host "`n🔧 Configuration production..." -ForegroundColor Yellow
$env:NEXT_PUBLIC_TINA_CLIENT_ID = "d2c40213-494b-4005-94ad-b601dbdf1f0e"
$env:TINA_TOKEN = "f5ae6be5c8b2d3dbb575918e775be87d1f4ec29d"
$env:NODE_ENV = "production"
Write-Host "   OK Variables TinaCMS configurees" -ForegroundColor Green

# Étape 3: Build TinaCMS + Astro
Write-Host "`n🏗️  Build TinaCMS..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -NoNewWindow -PassThru -Wait

if ($buildProcess.ExitCode -eq 0) {
    Write-Host "   ✓ Build réussi" -ForegroundColor Green
    
    # Vérifier si admin/ est généré
    if (Test-Path "dist/admin") {
        Write-Host "   ✓ Interface admin générée" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Interface admin manquante" -ForegroundColor Yellow
    }
    
    # Compter les fichiers générés
    $distFiles = (Get-ChildItem "dist" -Recurse -File).Count
    Write-Host "   ✓ $distFiles fichiers générés" -ForegroundColor Green
    
} else {
    Write-Host "   ❌ Échec du build" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 BUILD PRODUCTION TERMINE !" -ForegroundColor Green
Write-Host "L'interface admin sera disponible sur: https://glp1-france.fr/admin" -ForegroundColor Cyan
