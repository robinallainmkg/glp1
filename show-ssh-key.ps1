# Script pour afficher la clé SSH
Write-Host "🔑 CLÉ PUBLIQUE SSH POUR HOSTINGER" -ForegroundColor Yellow
Write-Host "=================================" -ForegroundColor Yellow
Write-Host ""

$keyFile = "$env:USERPROFILE\.ssh\glp1_ed25519.pub"

if (Test-Path $keyFile) {
    $key = Get-Content $keyFile -Raw
    Write-Host $key -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 COPIEZ cette clé et ajoutez-la dans votre panel Hostinger :" -ForegroundColor Cyan
    Write-Host "1. Allez sur https://hpanel.hostinger.com" -ForegroundColor White
    Write-Host "2. Avance -> SSH Access -> Manage SSH Keys" -ForegroundColor White
    Write-Host "3. Add New SSH Key" -ForegroundColor White
    Write-Host "4. Collez la cle ci-dessus" -ForegroundColor White
    Write-Host "5. Nommez-la GLP1-Deployment" -ForegroundColor White
    Write-Host "6. Activez la cle" -ForegroundColor White
    Write-Host ""
    
    # Copier dans le presse-papiers si possible
    try {
        $key | Set-Clipboard
        Write-Host "✅ Clé copiée dans le presse-papiers !" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Copiez manuellement la clé ci-dessus" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Fichier de clé non trouvé : $keyFile" -ForegroundColor Red
}
