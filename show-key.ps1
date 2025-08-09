# Script simple pour afficher la cle SSH
Write-Host "CLE PUBLIQUE SSH POUR HOSTINGER" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
Write-Host ""

$keyFile = "$env:USERPROFILE\.ssh\glp1_ed25519.pub"

if (Test-Path $keyFile) {
    $key = Get-Content $keyFile -Raw
    Write-Host $key -ForegroundColor Green
    Write-Host ""
    Write-Host "INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host "1. Copiez la cle ci-dessus" -ForegroundColor White
    Write-Host "2. Allez sur https://hpanel.hostinger.com" -ForegroundColor White
    Write-Host "3. Avance -> SSH Access -> Manage SSH Keys" -ForegroundColor White
    Write-Host "4. Add New SSH Key" -ForegroundColor White
    Write-Host "5. Collez la cle" -ForegroundColor White
    Write-Host "6. Nommez-la GLP1-Deployment" -ForegroundColor White
    Write-Host "7. Activez la cle" -ForegroundColor White
    Write-Host ""
    
    # Copier dans le presse-papiers
    try {
        $key | Set-Clipboard
        Write-Host "Cle copiee dans le presse-papiers !" -ForegroundColor Green
    } catch {
        Write-Host "Copiez manuellement la cle ci-dessus" -ForegroundColor Yellow
    }
} else {
    Write-Host "Fichier de cle non trouve" -ForegroundColor Red
}
