# Script de déploiement manuel pour Hostinger
# Utilise WinSCP ou peut être adapté pour FileZilla

Write-Host "=== Déploiement Manuel Hostinger ===" -ForegroundColor Green

# Configuration
$hostingerServer = "glp1-france.fr"
$hostingerUser = "u403023291"
$hostingerPath = "/public_html"
$localPath = "./dist"

Write-Host "Serveur: $hostingerServer" -ForegroundColor Yellow
Write-Host "Utilisateur: $hostingerUser" -ForegroundColor Yellow
Write-Host "Chemin distant: $hostingerPath" -ForegroundColor Yellow
Write-Host "Chemin local: $localPath" -ForegroundColor Yellow

# Vérifier que le build existe
if (-not (Test-Path $localPath)) {
    Write-Host "❌ Le dossier 'dist' n'existe pas. Lancez d'abord 'npm run astro:build'" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Dossier de build trouvé" -ForegroundColor Green

# Instructions pour FileZilla
Write-Host "`n=== Instructions pour FileZilla ===" -ForegroundColor Cyan
Write-Host "1. Ouvrez FileZilla" -ForegroundColor White
Write-Host "2. Configurez la connexion :" -ForegroundColor White
Write-Host "   - Hôte: $hostingerServer" -ForegroundColor White
Write-Host "   - Nom d'utilisateur: $hostingerUser" -ForegroundColor White
Write-Host "   - Mot de passe: 12031990Robin!" -ForegroundColor White
Write-Host "   - Port: 21 (FTP) ou 22 (SFTP)" -ForegroundColor White
Write-Host "3. Connectez-vous" -ForegroundColor White
Write-Host "4. Naviguez vers le dossier: $hostingerPath" -ForegroundColor White
Write-Host "5. Sélectionnez tous les fichiers dans: $(Resolve-Path $localPath)" -ForegroundColor White
Write-Host "6. Glissez-déposez vers le serveur" -ForegroundColor White

# Instructions pour WinSCP (si disponible)
Write-Host "`n=== Instructions pour WinSCP ===" -ForegroundColor Cyan
Write-Host "1. Ouvrez WinSCP" -ForegroundColor White
Write-Host "2. Configurez une nouvelle session :" -ForegroundColor White
Write-Host "   - Protocole: SFTP ou FTP" -ForegroundColor White
Write-Host "   - Nom d'hôte: $hostingerServer" -ForegroundColor White
Write-Host "   - Nom d'utilisateur: $hostingerUser" -ForegroundColor White
Write-Host "   - Mot de passe: 12031990Robin!" -ForegroundColor White
Write-Host "3. Connectez-vous" -ForegroundColor White
Write-Host "4. Synchronisez les dossiers" -ForegroundColor White

Write-Host "`n🎯 Une fois le déploiement terminé, votre page sera accessible à :" -ForegroundColor Green
Write-Host "https://glp1-france.fr/partenaires" -ForegroundColor Blue

Write-Host "`n📁 Fichiers à déployer depuis le dossier 'dist' :" -ForegroundColor Yellow
Get-ChildItem $localPath -Recurse | Select-Object Name, Length | Format-Table

Write-Host "`nAppuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
