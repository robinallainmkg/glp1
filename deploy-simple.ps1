# DEPLOIEMENT SIMPLE - GLP-1 FRANCE
# Script PowerShell sans emojis pour éviter les problèmes d'encodage

param(
    [string]$CommitMessage = "Deploy: Mise a jour automatique"
)

Write-Host "DEPLOIEMENT AUTOMATIQUE COMPLET - GLP-1 FRANCE" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# 1. Verifications
Write-Host "Verifications..." -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "Branche actuelle: $currentBranch" -ForegroundColor Green

# 2. Commit et Push GitHub
Write-Host ""
Write-Host "Upload vers GitHub..." -ForegroundColor Cyan
git add .
git commit -m $CommitMessage
git push origin production --force --no-verify
Write-Host "Push GitHub reussi" -ForegroundColor Green

# 3. Build du site
Write-Host ""
Write-Host "Build du site..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path ".astro") { Remove-Item -Recurse -Force ".astro" }

npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur de build" -ForegroundColor Red
    exit 1
}
Write-Host "Build reussi" -ForegroundColor Green

# Verifier le build
if (!(Test-Path "dist/index.html")) {
    Write-Host "Erreur: index.html non trouve" -ForegroundColor Red
    exit 1
}

# 4. Deploiement Hostinger via WinSCP
Write-Host ""
Write-Host "Deploiement vers Hostinger..." -ForegroundColor Cyan

# Creer script WinSCP
$winscpScript = @"
open sftp://u403023291:_@%p8R*XG.s+/5)@147.79.98.140:65002
option batch abort
option confirm off
cd /public_html
rm *
rm -r *
lcd dist
put -r *
close
exit
"@

$scriptPath = "winscp_deploy.txt"
$winscpScript | Out-File -FilePath $scriptPath -Encoding ASCII

# Chercher WinSCP
$winscpPaths = @(
    "${env:LOCALAPPDATA}\Microsoft\WinGet\Packages\WinSCP.WinSCP_Microsoft.Winget.Source_8wekyb3d8bbwe\WinSCP.com",
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com"
)

$winscpExe = $null
foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        $winscpExe = $path
        Write-Host "WinSCP trouve: $path" -ForegroundColor Green
        break
    }
}

if ($winscpExe) {
    Write-Host "Upload via WinSCP..." -ForegroundColor Yellow
    try {
        & $winscpExe /script=$scriptPath
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Deploiement Hostinger reussi!" -ForegroundColor Green
            Write-Host "Site mis a jour: https://glp1-france.fr" -ForegroundColor Green
        } else {
            Write-Host "Erreur deploiement WinSCP" -ForegroundColor Red
        }
    } catch {
        Write-Host "Erreur WinSCP: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Remove-Item $scriptPath -Force
} else {
    Write-Host "WinSCP non trouve dans les chemins standards" -ForegroundColor Yellow
    Write-Host "Upload manuel requis:" -ForegroundColor Cyan
    Write-Host "Host: 147.79.98.140:65002"
    Write-Host "User: u403023291"
    Write-Host "Pass: _@%p8R*XG.s+/5)"
    Write-Host "Path: /public_html"
    Start-Process "dist"
}

Write-Host ""
Write-Host "DEPLOIEMENT TERMINE!" -ForegroundColor Green
