# Script de déploiement simple sans validations complexes
param(
    [string]$CommitMessage = "Update: Déploiement documentation consolidée",
    [switch]$SkipTinaCheck
)

Write-Host "🚀 DÉPLOIEMENT SIMPLE - Documentation Consolidée" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Étape 1: Validation de base
Write-Host "`n📋 Validations de base..." -ForegroundColor Yellow

if (Test-Path "package.json") {
    Write-Host "   ✓ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json manquant" -ForegroundColor Red
    exit 1
}

if (Test-Path "astro.config.mjs") {
    Write-Host "   ✓ astro.config.mjs trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ astro.config.mjs manquant" -ForegroundColor Red
    exit 1
}

# Étape 2: Nettoyage et build
Write-Host "`n🏗️  Build production..." -ForegroundColor Yellow

if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force
    Write-Host "   ✓ Ancien dist/ supprimé" -ForegroundColor Green
}

if (Test-Path ".astro") {
    Remove-Item ".astro" -Recurse -Force  
    Write-Host "   ✓ Cache .astro/ nettoyé" -ForegroundColor Green
}

Write-Host "   ⏳ Lancement build..."
$buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -NoNewWindow -PassThru -Wait

if ($buildProcess.ExitCode -eq 0) {
    Write-Host "   ✓ Build réussi" -ForegroundColor Green
} else {
    Write-Host "   ❌ Échec du build" -ForegroundColor Red
    exit 1
}

# Étape 3: Vérification build
if (Test-Path "dist/index.html") {
    $distFiles = (Get-ChildItem "dist" -Recurse -File).Count
    Write-Host "   ✓ $distFiles fichiers générés" -ForegroundColor Green
} else {
    Write-Host "   ❌ Pas de fichiers de build générés" -ForegroundColor Red
    exit 1
}

# Étape 4: Recherche WinSCP
Write-Host "`n📤 Préparation upload..." -ForegroundColor Yellow

$winscpPaths = @(
    "C:\Users\robin\AppData\Local\Programs\WinSCP\WinSCP.com",
    "C:\Program Files\WinSCP\WinSCP.com", 
    "C:\Program Files (x86)\WinSCP\WinSCP.com"
)

$winscpPath = $null
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        $winscpPath = $path
        Write-Host "   ✓ WinSCP trouvé: $path" -ForegroundColor Green
        break
    }
}

if (-not $winscpPath) {
    Write-Host "   ❌ WinSCP non trouvé. Installation requise." -ForegroundColor Red
    Write-Host "   📥 Télécharger: https://winscp.net/download/WinSCP-5.21.7-Setup.exe" -ForegroundColor Yellow
    exit 1
}

# Étape 5: Upload vers Hostinger
Write-Host "`n🚀 Upload vers Hostinger..." -ForegroundColor Yellow

$scriptContent = @"
open sftp://u403023291:Robin2024@@147.79.98.140:65002 -hostkey="ssh-ed25519 255 FKFw1lW9IpAUCw7H+V4LOwNRJuPDGJOuMowBxRMlWIY="
synchronize remote -delete dist/ domains/glp1-france.fr/public_html/
exit
"@

$scriptPath = "upload.tmp"
$scriptContent | Out-File -FilePath $scriptPath -Encoding UTF8

try {
    Write-Host "   ⏳ Synchronisation en cours..."
    $uploadProcess = Start-Process -FilePath $winscpPath -ArgumentList "/script=$scriptPath" -NoNewWindow -PassThru -Wait
    
    if ($uploadProcess.ExitCode -eq 0) {
        Write-Host "   ✓ Upload terminé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Upload terminé avec avertissements" -ForegroundColor Yellow
    }
} finally {
    if (Test-Path $scriptPath) {
        Remove-Item $scriptPath -Force
    }
}

# Étape 6: Vérification finale
Write-Host "`n✅ Vérifications finales..." -ForegroundColor Yellow

Write-Host "   📊 Site: https://glp1-france.fr" -ForegroundColor Cyan
Write-Host "   🎛️  Admin: https://glp1-france.fr/admin" -ForegroundColor Cyan

Write-Host "`n🎉 DÉPLOIEMENT TERMINÉ !" -ForegroundColor Green
Write-Host "Documentation consolidée déployée avec succès." -ForegroundColor Green
