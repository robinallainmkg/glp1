# Installation WinSCP automatique

Write-Host "Installation WinSCP pour deploiement automatique" -ForegroundColor Green

# Verifier si WinSCP est deja installe
$winscpPaths = @(
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpInstalled = $false
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        Write-Host "WinSCP deja installe: $path" -ForegroundColor Green
        $winscpInstalled = $true
        break
    }
}

if (-not $winscpInstalled) {
    Write-Host "Telechargement WinSCP..." -ForegroundColor Yellow
    
    # Verifier si winget est disponible
    if (Get-Command winget -ErrorAction SilentlyContinue) {
        try {
            Write-Host "Installation via winget..." -ForegroundColor Yellow
            winget install WinSCP.WinSCP
            Write-Host "WinSCP installe avec succes!" -ForegroundColor Green
        } catch {
            Write-Host "Erreur installation winget" -ForegroundColor Red
            Write-Host "Installation manuelle requise" -ForegroundColor Yellow
            Start-Process "https://winscp.net/download"
        }
    } else {
        Write-Host "winget non disponible" -ForegroundColor Yellow
        Write-Host "Ouverture du site de telechargement..." -ForegroundColor Yellow
        Start-Process "https://winscp.net/download"
        Write-Host ""
        Write-Host "INSTALLATION MANUELLE:" -ForegroundColor Cyan
        Write-Host "1. Telecharger WinSCP depuis le site ouvert"
        Write-Host "2. Installer avec les parametres par defaut"
        Write-Host "3. Relancer: npm run deploy:full"
    }
} else {
    Write-Host "WinSCP est pret pour le deploiement automatique!" -ForegroundColor Green
}
