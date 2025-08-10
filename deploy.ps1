# 🚀 DÉPLOIEMENT GLP-1 FRANCE - WINDOWS
# Script PowerShell avec SSH automatique

# Configuration Hostinger
$HOSTINGER_HOST = "147.79.98.140"
$HOSTINGER_USER = "u403023291"
$HOSTINGER_PORT = 65002
$HOSTINGER_PATH = "/public_html"

Write-Host "🚀 DÉPLOIEMENT GLP-1 FRANCE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Vérifier la branche
$currentBranch = git branch --show-current
if ($currentBranch -ne "production") {
    Write-Host "❌ Erreur: Vous devez être sur la branche 'production'" -ForegroundColor Red
    Write-Host "💡 Exécutez: git checkout production" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Branche production confirmée" -ForegroundColor Green

# Nettoyer
Write-Host "🧹 Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".astro") { Remove-Item -Recurse -Force ".astro" }

# Build
Write-Host "🏗️  Build en cours..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build réussi" -ForegroundColor Green

# Vérifications
if (!(Test-Path "dist/index.html")) {
    Write-Host "❌ Erreur: index.html non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Build prêt pour déploiement" -ForegroundColor Green

# Déploiement automatique via SCP
Write-Host ""
Write-Host "🔄 Déploiement automatique vers Hostinger..." -ForegroundColor Cyan
Write-Host "Host: ${HOSTINGER_HOST}:${HOSTINGER_PORT}" -ForegroundColor Gray

# Vérifier si pscp est disponible (PuTTY)
if (Get-Command pscp -ErrorAction SilentlyContinue) {
    Write-Host "📤 Upload via pscp..." -ForegroundColor Yellow
    $scpCmd = "pscp -r -P $HOSTINGER_PORT dist/* ${HOSTINGER_USER}@${HOSTINGER_HOST}:${HOSTINGER_PATH}/"
    Write-Host "Commande: $scpCmd" -ForegroundColor Gray
    Invoke-Expression $scpCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Déploiement réussi!" -ForegroundColor Green
        Write-Host "🌐 Site mis à jour: https://glp1-france.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur de déploiement automatique" -ForegroundColor Red
        Write-Host "💡 Déploiement manuel nécessaire" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  pscp non trouvé - Déploiement manuel" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 ÉTAPES DE DÉPLOIEMENT MANUEL:" -ForegroundColor Cyan
    Write-Host "1. Connectez-vous à votre panel Hostinger"
    Write-Host "2. Ouvrez le File Manager"  
    Write-Host "3. Supprimez tout le contenu de public_html/"
    Write-Host "4. Uploadez tout le contenu du dossier dist/ vers public_html/"
    Write-Host ""
    Write-Host "📁 Ouverture du dossier dist..." -ForegroundColor Yellow
    Start-Process "dist"
}

Write-Host ""
Write-Host "🎉 Déploiement terminé!" -ForegroundColor Green