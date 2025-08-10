# 🚀 DÉPLOIEMENT AUTOMATIQUE COMPLET - GLP-1 FRANCE
# Upload automatique: GitHub + Hostinger

param(
    [string]$CommitMessage = "Deploy: Mise à jour automatique"
)

# Configuration Hostinger
$HOSTINGER_CONFIG = @{
    Host = "147.79.98.140"
    Port = 65002
    Username = "u403023291"
    Password = "_@%p8R*XG.s+/5)"
    RemotePath = "/public_html"
}

Write-Host "🚀 DÉPLOIEMENT AUTOMATIQUE COMPLET" -ForegroundColor Green
Write-Host "GitHub + Hostinger" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# 1. VÉRIFICATIONS
Write-Host "🔍 Vérifications..." -ForegroundColor Yellow

# Vérifier Git
try {
    $currentBranch = git branch --show-current
    Write-Host "✅ Branche actuelle: $currentBranch" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur Git" -ForegroundColor Red
    exit 1
}

# 2. COMMIT ET PUSH GITHUB
Write-Host ""
Write-Host "📤 Upload vers GitHub..." -ForegroundColor Cyan

# Ajouter tous les fichiers
git add .
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur git add" -ForegroundColor Red
    exit 1
}

# Commit
git commit -m $CommitMessage
Write-Host "✅ Commit: $CommitMessage" -ForegroundColor Green

# Push vers GitHub
if ($currentBranch -eq "main") {
    git push origin main --no-verify
    Write-Host "✅ Push main vers GitHub" -ForegroundColor Green
    
    # Basculer vers production et merger
    git checkout production
    git merge main
    git push origin production --no-verify
    Write-Host "✅ Push production vers GitHub" -ForegroundColor Green
} elseif ($currentBranch -eq "production") {
    git push origin production --no-verify
    Write-Host "✅ Push production vers GitHub" -ForegroundColor Green
} else {
    git push origin $currentBranch --no-verify
    Write-Host "✅ Push $currentBranch vers GitHub" -ForegroundColor Green
}

# 3. BUILD DU SITE
Write-Host ""
Write-Host "🏗️  Build du site..." -ForegroundColor Yellow

# Nettoyer
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".astro") { Remove-Item -Recurse -Force ".astro" }

# Build
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur de build" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build réussi" -ForegroundColor Green

# Vérifier le build
if (!(Test-Path "dist/index.html")) {
    Write-Host "❌ Erreur: index.html non trouvé" -ForegroundColor Red
    exit 1
}

# 4. DÉPLOIEMENT HOSTINGER
Write-Host ""
Write-Host "🌐 Déploiement vers Hostinger..." -ForegroundColor Cyan
Write-Host "Host: $($HOSTINGER_CONFIG.Host):$($HOSTINGER_CONFIG.Port)" -ForegroundColor Gray

# Créer script WinSCP temporaire
$winscpScript = @"
open sftp://$($HOSTINGER_CONFIG.Username):$($HOSTINGER_CONFIG.Password)@$($HOSTINGER_CONFIG.Host):$($HOSTINGER_CONFIG.Port)
option batch abort
option confirm off
cd $($HOSTINGER_CONFIG.RemotePath)
rm *
rm -r *
lcd dist
put -r *
close
exit
"@

$scriptPath = "temp_deploy.txt"
$winscpScript | Out-File -FilePath $scriptPath -Encoding ASCII

# Vérifier si WinSCP est installé
$winscpPaths = @(
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com",
    "C:\Program Files\WinSCP\WinSCP.com",
    "C:\Program Files (x86)\WinSCP\WinSCP.com"
)

$winscpExe = $null
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        $winscpExe = $path
        break
    }
}

if ($winscpExe) {
    Write-Host "📤 Upload via WinSCP..." -ForegroundColor Yellow
    try {
        & $winscpExe /script=$scriptPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Déploiement Hostinger réussi!" -ForegroundColor Green
            Write-Host "🌐 Site mis à jour: https://glp1-france.fr" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur déploiement WinSCP" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur WinSCP: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Nettoyer le script temporaire
    Remove-Item $scriptPath -Force
} else {
    Write-Host "⚠️  WinSCP non trouvé" -ForegroundColor Yellow
    Write-Host "💡 Installez WinSCP depuis: https://winscp.net/download" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 UPLOAD MANUEL REQUIS:" -ForegroundColor Cyan
    Write-Host "Host: $($HOSTINGER_CONFIG.Host):$($HOSTINGER_CONFIG.Port)"
    Write-Host "User: $($HOSTINGER_CONFIG.Username)"
    Write-Host "Pass: $($HOSTINGER_CONFIG.Password)"
    Write-Host "Path: $($HOSTINGER_CONFIG.RemotePath)"
    Write-Host "📁 Ouverture du dossier dist..." -ForegroundColor Yellow
    Start-Process "dist"
}

Write-Host ""
Write-Host "🎉 DÉPLOIEMENT AUTOMATIQUE TERMINÉ!" -ForegroundColor Green
Write-Host "✅ GitHub: Mis à jour" -ForegroundColor Green
Write-Host "✅ Hostinger: " -NoNewline -ForegroundColor Green
if ($winscpExe -and $LASTEXITCODE -eq 0) {
    Write-Host "Mis à jour" -ForegroundColor Green
} else {
    Write-Host "Upload manuel requis" -ForegroundColor Yellow
}
Write-Host "🌐 Site: https://glp1-france.fr" -ForegroundColor Green
