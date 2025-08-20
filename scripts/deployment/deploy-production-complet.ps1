# Script de déploiement complet pour production avec TinaCMS
param(
    [string]$CommitMessage = "Deploy: Production avec TinaCMS et documentation"
)

Write-Host "DEPLOIEMENT PRODUCTION COMPLET" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# Configuration des variables
$env:NEXT_PUBLIC_TINA_CLIENT_ID = "d2c40213-494b-4005-94ad-b601dbdf1f0e"
$env:TINA_TOKEN = "f5ae6be5c8b2d3dbb575918e775be87d1f4ec29d"
$env:NODE_ENV = "production"

Write-Host "`nEtape 1: Nettoyage..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item "dist" -Recurse -Force }
if (Test-Path ".astro") { Remove-Item ".astro" -Recurse -Force }

Write-Host "`nEtape 2: Commit et push..." -ForegroundColor Yellow
git add .
git commit -m $CommitMessage
git push origin production

Write-Host "`nEtape 3: Build avec TinaCMS..." -ForegroundColor Yellow
Write-Host "Tentative de build avec TinaCMS..." -ForegroundColor Gray

$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build TinaCMS: REUSSI" -ForegroundColor Green
} else {
    Write-Host "Build TinaCMS: ECHEC - Utilisation Astro uniquement" -ForegroundColor Yellow
    
    # Fallback vers Astro build simple
    Write-Host "Fallback: Build Astro simple..." -ForegroundColor Yellow
    $buildAstro = npx astro build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Build Astro: REUSSI" -ForegroundColor Green
    } else {
        Write-Host "Build Astro: ECHEC" -ForegroundColor Red
        Write-Host $buildAstro
        exit 1
    }
}

Write-Host "`nEtape 4: Verification build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    $fileCount = (Get-ChildItem "dist" -Recurse -File).Count
    Write-Host "Fichiers generes: $fileCount" -ForegroundColor Green
    
    if (Test-Path "dist/admin") {
        Write-Host "Interface admin: PRESENTE" -ForegroundColor Green
    } else {
        Write-Host "Interface admin: ABSENTE (sera configuree separement)" -ForegroundColor Yellow
    }
} else {
    Write-Host "Dossier dist manquant" -ForegroundColor Red
    exit 1
}

Write-Host "`nEtape 5: Upload vers Hostinger..." -ForegroundColor Yellow

# Configuration WinSCP (méthode qui marche)
$winscpScript = @"
open sftp://u403023291@147.79.98.140:65002 -password="_@%p8R*XG.s+/5)" -hostkey="ssh-ed25519 255 FKFw1lW9IpAUCw7H+V4LOwNRJuPDGJOuMowBxRMlWIY="
cd domains/glp1-france.fr/public_html/
synchronize remote -delete dist/
close
exit
"@

$winscpScript | Out-File -FilePath "upload.txt" -Encoding UTF8

# Recherche WinSCP
$winscpPaths = @(
    "C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com",
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpFound = $false
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        Write-Host "Upload via WinSCP..." -ForegroundColor Gray
        Start-Process -FilePath $path -ArgumentList "/script=upload.txt" -NoNewWindow -Wait
        $winscpFound = $true
        break
    }
}

if (-not $winscpFound) {
    Write-Host "WinSCP non trouve - Upload manuel requis" -ForegroundColor Yellow
    Write-Host "Serveur: 147.79.98.140:65002" -ForegroundColor White
    Write-Host "Utilisateur: u403023291" -ForegroundColor White
    Write-Host "Dossier distant: domains/glp1-france.fr/public_html/" -ForegroundColor White
    Start-Process "dist"
}

# Nettoyage
if (Test-Path "upload.txt") { Remove-Item "upload.txt" -Force }

Write-Host "`nDEPLOIEMENT TERMINE" -ForegroundColor Green
Write-Host "Site: https://glp1-france.fr" -ForegroundColor Cyan
Write-Host "Admin: https://glp1-france.fr/admin" -ForegroundColor Cyan
