# 🚀 Script de Déploiement GLP-1 France
# Usage: .\deploy.ps1

Write-Host "🚀 DÉPLOIEMENT GLP-1 FRANCE" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Variables
$SERVER_HOST = "147.79.98.140"
$SERVER_PORT = "65002"
$SERVER_USER = "u403023291"
$REMOTE_PATH = "/home/u403023291/domains/glp1-france.fr/public_html"
$LOCAL_BUILD = "dist"

Write-Host "📋 Vérifications préliminaires..." -ForegroundColor Yellow

# 1. Vérifier que nous sommes dans le bon dossier
if (!(Test-Path "package.json")) {
    Write-Host "❌ Erreur: package.json non trouvé. Êtes-vous dans le bon dossier ?" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que le dossier dist existe
if (!(Test-Path $LOCAL_BUILD)) {
    Write-Host "⚠️  Dossier 'dist' non trouvé. Lancement du build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build échoué !" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Build trouvé dans: $LOCAL_BUILD" -ForegroundColor Green

# 3. Test de connexion SSH
Write-Host "🔐 Test de connexion SSH..." -ForegroundColor Yellow
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_HOST}" "echo 'OK'" 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Connexion SSH échouée !" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Connexion SSH OK" -ForegroundColor Green

# 4. Sauvegarde du site actuel
Write-Host "💾 Sauvegarde du site actuel..." -ForegroundColor Yellow
$BACKUP_NAME = "backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
ssh -p $SERVER_PORT "$SERVER_USER@$SERVER_HOST" "cd $REMOTE_PATH && tar -czf ../$BACKUP_NAME.tar.gz . 2>/dev/null || echo 'Pas de sauvegarde nécessaire'"
Write-Host "✅ Sauvegarde créée: $BACKUP_NAME.tar.gz" -ForegroundColor Green

# 5. Déploiement via SCP (Windows-compatible)
Write-Host "🚀 Déploiement en cours..." -ForegroundColor Yellow
Write-Host "   Source: $LOCAL_BUILD\" -ForegroundColor Cyan
Write-Host "   Destination: ${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}" -ForegroundColor Cyan

# Vider le dossier distant d'abord (sauf .htaccess)
Write-Host "🧹 Nettoyage du dossier distant..." -ForegroundColor Yellow
ssh -p $SERVER_PORT "${SERVER_USER}@${SERVER_HOST}" "cd $REMOTE_PATH && find . -maxdepth 1 -not -name '.htaccess' -not -name '.' -delete 2>/dev/null || true"

# Copie récursive avec SCP
Write-Host "📤 Upload des fichiers..." -ForegroundColor Yellow
scp -P $SERVER_PORT -r "$LOCAL_BUILD/*" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_PATH}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ DÉPLOIEMENT RÉUSSI !" -ForegroundColor Green
    Write-Host "🌐 Site live: https://glp1-france.fr" -ForegroundColor Green
    Write-Host "⏰ Déployé le: $(Get-Date -Format 'dd/MM/yyyy à HH:mm:ss')" -ForegroundColor Green
} else {
    Write-Host "❌ DÉPLOIEMENT ÉCHOUÉ !" -ForegroundColor Red
    Write-Host "💾 Restauration possible avec: $BACKUP_NAME.tar.gz" -ForegroundColor Yellow
    exit 1
}

Write-Host "================================" -ForegroundColor Green
Write-Host "🎉 DÉPLOIEMENT TERMINÉ" -ForegroundColor Green
