# 🚀 Script de déploiement simple GLP-1 France (PowerShell)

Write-Host ""
Write-Host "🚀 DÉPLOIEMENT GLP-1 FRANCE" -ForegroundColor Blue
Write-Host "=============================" -ForegroundColor Blue
Write-Host ""

# Étape 1 : Build
Write-Host "📦 Build du projet..." -ForegroundColor Yellow
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur de build" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du build : $_" -ForegroundColor Red
    exit 1
}

# Étape 2 : Vérification du dossier dist
if (!(Test-Path "dist")) {
    Write-Host "❌ Erreur: dossier dist non trouvé" -ForegroundColor Red
    exit 1
}

$fileCount = (Get-ChildItem -Recurse "dist" | Measure-Object).Count
Write-Host "📁 Dossier dist contient $fileCount fichiers" -ForegroundColor Cyan

# Étape 3 : Upload avec rsync via Git Bash
Write-Host ""
Write-Host "📤 Upload vers Hostinger..." -ForegroundColor Yellow
Write-Host "Utilisation de rsync via Git Bash..." -ForegroundColor Cyan

try {
    $rsyncCommand = "rsync -avz --delete --progress -e 'ssh -i ~/.ssh/hostinger_glp1 -p 65002' dist/ u403023291@147.79.98.140:/home/u403023291/domains/glp1-france.fr/public_html/"
    
    & "C:\Program Files\Git\bin\bash.exe" -c $rsyncCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Upload terminé avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de l'upload" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'upload : $_" -ForegroundColor Red
    exit 1
}

# Étape 4 : Vérification du site
Write-Host ""
Write-Host "🔍 Vérification du site..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://glp1-france.fr" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Site accessible mais code inhabituel : $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Impossible de vérifier le site : $_" -ForegroundColor Yellow
}

# Résumé final
Write-Host ""
Write-Host "🎉 DÉPLOIEMENT TERMINÉ" -ForegroundColor Green
Write-Host "======================" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Résumé :" -ForegroundColor Cyan
Write-Host "- Build : ✅ Réussi"
Write-Host "- Upload : ✅ Terminé"
Write-Host "- Site : https://glp1-france.fr"
Write-Host ""
Write-Host "🔗 Prochaines étapes :" -ForegroundColor Yellow
Write-Host "1. Vérifiez le site dans votre navigateur"
Write-Host "2. Testez les fonctionnalités principales"
Write-Host "3. Surveillez les performances"
Write-Host ""
