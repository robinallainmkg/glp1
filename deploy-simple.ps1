# DEPLOIEMENT SIMPLE - GLP-1 FRANCE
# Script PowerShell avec upload automatique WinSCP

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

# Recherche exhaustive de WinSCP
$winscpPaths = @(
    # Winget installation path
    "${env:LOCALAPPDATA}\Microsoft\WinGet\Packages\WinSCP.WinSCP_Microsoft.Winget.Source_8wekyb3d8bbwe\WinSCP.com",
    # Standard installations
    "${env:ProgramFiles}\WinSCP\WinSCP.com",
    "${env:ProgramFiles(x86)}\WinSCP\WinSCP.com",
    # Alternative paths
    "C:\Program Files\WinSCP\WinSCP.com",
    "C:\Program Files (x86)\WinSCP\WinSCP.com",
    # User directory
    "${env:USERPROFILE}\AppData\Local\Programs\WinSCP\WinSCP.com"
)

$winscpExe = $null
Write-Host "Recherche de WinSCP..." -ForegroundColor Yellow

foreach ($path in $winscpPaths) {
    if (Test-Path $path) {
        $winscpExe = $path
        Write-Host "WinSCP trouve: $path" -ForegroundColor Green
        break
    } else {
        Write-Host "Non trouve: $path" -ForegroundColor Gray
    }
}

# Si WinSCP n'est pas trouve, essayer de le localiser avec Get-Command
if (-not $winscpExe) {
    Write-Host "Recherche dans le PATH..." -ForegroundColor Yellow
    try {
        $winscpCmd = Get-Command "WinSCP.com" -ErrorAction SilentlyContinue
        if ($winscpCmd) {
            $winscpExe = $winscpCmd.Source
            Write-Host "WinSCP trouve dans PATH: $winscpExe" -ForegroundColor Green
        }
    } catch {
        Write-Host "WinSCP non trouve dans PATH" -ForegroundColor Gray
    }
}

# Si toujours pas trouve, recherche globale
if (-not $winscpExe) {
    Write-Host "Recherche globale en cours..." -ForegroundColor Yellow
    $searchPaths = @("C:\", "${env:ProgramFiles}", "${env:ProgramFiles(x86)}", "${env:LOCALAPPDATA}")
    
    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            try {
                $found = Get-ChildItem -Path $searchPath -Recurse -Name "WinSCP.com" -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($found) {
                    $winscpExe = Join-Path $searchPath $found
                    Write-Host "WinSCP trouve par recherche: $winscpExe" -ForegroundColor Green
                    break
                }
            } catch {
                # Ignorer les erreurs d'acces
            }
        }
    }
}

if ($winscpExe -and (Test-Path $winscpExe)) {
    Write-Host "Upload via WinSCP..." -ForegroundColor Yellow
    try {
        $process = Start-Process -FilePath $winscpExe -ArgumentList "/script=$scriptPath" -Wait -PassThru -NoNewWindow
        if ($process.ExitCode -eq 0) {
            Write-Host "Deploiement Hostinger reussi!" -ForegroundColor Green
            Write-Host "Site mis a jour: https://glp1-france.fr" -ForegroundColor Green
        } else {
            Write-Host "Erreur deploiement WinSCP (Code: $($process.ExitCode))" -ForegroundColor Red
            Write-Host "Deploiement manuel requis" -ForegroundColor Yellow
            Start-Process "dist"
        }
    } catch {
        Write-Host "Erreur execution WinSCP: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Deploiement manuel requis" -ForegroundColor Yellow
        Start-Process "dist"
    }
    
    Remove-Item $scriptPath -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "WinSCP non trouve - Installation automatique..." -ForegroundColor Yellow
    
    # Tentative d'installation automatique
    try {
        if (Get-Command winget -ErrorAction SilentlyContinue) {
            Write-Host "Installation WinSCP via winget..." -ForegroundColor Yellow
            winget install WinSCP.WinSCP --accept-package-agreements --accept-source-agreements --silent
            
            # Relancer le script apres installation
            if ($LASTEXITCODE -eq 0) {
                Write-Host "WinSCP installe! Relancement du deploiement..." -ForegroundColor Green
                Start-Sleep -Seconds 3
                & $PSCommandPath $CommitMessage
                return
            }
        }
    } catch {
        Write-Host "Installation automatique echouee" -ForegroundColor Red
    }
    
    Write-Host "Upload manuel requis:" -ForegroundColor Cyan
    Write-Host "1. Installer WinSCP: https://winscp.net/download"
    Write-Host "2. Host: 147.79.98.140:65002"
    Write-Host "3. User: u403023291"
    Write-Host "4. Pass: _@%p8R*XG.s+/5)"
    Write-Host "5. Path: /public_html"
    Start-Process "dist"
}

Write-Host ""
Write-Host "DEPLOIEMENT TERMINE!" -ForegroundColor Green
