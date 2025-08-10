# 📦 INSTALLATION WINSCP AUTOMATIQUE

Write-Host "📦 Installation WinSCP pour déploiement automatique" -ForegroundColor Green

# Vérifier si WinSCP est déjà installé
$winscpPaths = @(
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpInstalled = $false
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        Write-Host "✅ WinSCP déjà installé: $path" -ForegroundColor Green
        $winscpInstalled = $true
        break
    }
}

if (-not $winscpInstalled) {
    Write-Host "⬇️  Téléchargement WinSCP..." -ForegroundColor Yellow
    
    # Vérifier si winget est disponible
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            Write-Host "📦 Installation via winget..." -ForegroundColor Yellow
            winget install WinSCP.WinSCP
            Write-Host "✅ WinSCP installé avec succès!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur installation winget" -ForegroundColor Red
            Write-Host "💡 Installation manuelle requise" -ForegroundColor Yellow
            Start-Process "https://winscp.net/download"
        }
    } else {
        Write-Host "⚠️  winget non disponible" -ForegroundColor Yellow
        Write-Host "💡 Ouverture du site de téléchargement..." -ForegroundColor Yellow
        Start-Process "https://winscp.net/download"
        Write-Host ""
        Write-Host "📋 INSTALLATION MANUELLE:" -ForegroundColor Cyan
        Write-Host "1. Télécharger WinSCP depuis le site ouvert"
        Write-Host "2. Installer avec les paramètres par défaut"
        Write-Host "3. Relancer: npm run deploy:full"
    }
} else {
    Write-Host "🎉 WinSCP est prêt pour le déploiement automatique!" -ForegroundColor Green
}
