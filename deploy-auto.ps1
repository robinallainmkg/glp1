param(
    [string]$CommitMessage = "Deploy: Mise a jour automatique"
)

$ErrorActionPreference = "Continue"

Write-Host "=== DEPLOIEMENT AUTOMATIQUE GLP-1 FRANCE ===" -ForegroundColor Green

# Vérifier la branche production
$currentBranch = git branch --show-current
if ($currentBranch -ne "production") {
    Write-Host "❌ Erreur: Vous devez être sur la branche 'production'" -ForegroundColor Red
    Write-Host "💡 Exécutez: git checkout production" -ForegroundColor Yellow
    exit 1
}

# 1. Commit et Push GitHub
Write-Host "1. Upload vers GitHub..." -ForegroundColor Cyan
git add .
git commit -m $CommitMessage
git push origin production --force --no-verify
Write-Host "   GitHub: OK" -ForegroundColor Green

# 2. Build du site
Write-Host "2. Build du site..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path ".astro") { Remove-Item ".astro" -Recurse -Force }
npm run build
Write-Host "   Build: OK" -ForegroundColor Green

# 3. Upload automatique
Write-Host "3. Upload vers Hostinger..." -ForegroundColor Yellow

# Créer fichier de commandes WinSCP sans caractères spéciaux
$winscpScript = @"
open sftp://u403023291@147.79.98.140:65002 -password="_@%p8R*XG.s+/5)" -hostkey="ssh-ed25519 255 ryF1Sy3SwsauJOcEYq3xYVLfjAbN3LKJX3qRxdU1AHA"
cd domains/glp1-france.fr/public_html
lcd dist
synchronize remote -delete
cd ..
mkdir data
cd data
lcd "C:\Users\robin\Documents\glp1official\glp1\data"
synchronize remote .
close
exit
"@

Write-Host "   - Synchronisation du site web..." -ForegroundColor Cyan
Write-Host "   - Upload du dossier data (sécurisé)..." -ForegroundColor Cyan

$winscpScript | Out-File -FilePath "upload.txt" -Encoding UTF8

# Chercher WinSCP
$winscpPaths = @(
    "C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com",
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpFound = $false
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        Write-Host "   WinSCP trouve: $path" -ForegroundColor Green
        try {
            & $path /script=upload.txt /log=upload.log
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   Upload: REUSSI!" -ForegroundColor Green
                Write-Host "   Site: https://glp1-france.fr" -ForegroundColor Green
                $winscpFound = $true
                break
            } else {
                Write-Host "   Erreur WinSCP (Code: $LASTEXITCODE)" -ForegroundColor Red
                if (Test-Path "upload.log") {
                    Write-Host "   Log:" -ForegroundColor Yellow
                    Get-Content "upload.log" | Select-Object -Last 10 | ForEach-Object { Write-Host "     $_" }
                }
            }
        } catch {
            Write-Host "   Erreur execution: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Nettoyage
if (Test-Path "upload.txt") { Remove-Item "upload.txt" }
if (Test-Path "upload.log") { Remove-Item "upload.log" }

if (-not $winscpFound) {
    Write-Host ""
    Write-Host "=== UPLOAD MANUEL REQUIS ===" -ForegroundColor Yellow
    Write-Host "Serveur: 147.79.98.140:65002" -ForegroundColor White
    Write-Host "Utilisateur: u403023291" -ForegroundColor White
    Write-Host "Mot de passe: _@%p8R*XG.s+/5)" -ForegroundColor White
    Write-Host "Dossier distant: /public_html" -ForegroundColor White
    Write-Host "Dossier local: .\dist\" -ForegroundColor White
    
    # Ouvrir dossier dist
    Start-Process "dist"
    Write-Host "Dossier dist ouvert pour upload manuel" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== DEPLOIEMENT TERMINE ===" -ForegroundColor Green
