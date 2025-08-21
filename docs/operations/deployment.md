# Déploiement et CI/CD - GLP-1 France

## 📋 Vue d'ensemble

Documentation complète du processus de déploiement, incluant les pipelines CI/CD, les scripts automatisés, et la gestion des environnements.

## 🚀 Architecture de Déploiement

### Environnements

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│   (Local)       │───►│    (Preview)    │───►│   (Hostinger)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
    localhost:4321         preview.vercel.app      glp1-france.fr
    TinaCMS local          TinaCMS cloud           Mode statique
    JSON files             Supabase staging        JSON + backups
```

### Configuration par Environnement

```typescript
// config/environments.ts
export const environments = {
  development: {
    TINA_CLIENT_ID: 'd2c40213-494b-4005-94ad-b601dbdf1f0e',
    TINA_TOKEN: process.env.TINA_TOKEN,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_BASE_URL: 'http://localhost:4321/api',
    USE_LOCAL_DATA: true,
    ANALYTICS_ENABLED: false
  },
  
  staging: {
    TINA_CLIENT_ID: 'd2c40213-494b-4005-94ad-b601dbdf1f0e',
    TINA_TOKEN: process.env.TINA_TOKEN,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    API_BASE_URL: 'https://preview.glp1-france.vercel.app/api',
    USE_LOCAL_DATA: false,
    ANALYTICS_ENABLED: true
  },
  
  production: {
    API_BASE_URL: 'https://glp1-france.fr/api',
    USE_LOCAL_DATA: true,  // Mode statique
    ANALYTICS_ENABLED: true,
    GTM_ID: 'GTM-XXXXXXX'
  }
};
```

## 🛠️ Scripts de Déploiement

### Script Principal PowerShell

```powershell
# scripts/deploy.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force
)

# Configuration
$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Fonctions utilitaires
function Write-Step {
    param([string]$Message)
    Write-Host "`n🔄 $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Step "Vérification des prérequis..."
    
    # Node.js
    try {
        $nodeVersion = node --version
        Write-Host "Node.js version: $nodeVersion"
    } catch {
        throw "Node.js n'est pas installé"
    }
    
    # npm/pnpm
    try {
        $npmVersion = npm --version
        Write-Host "npm version: $npmVersion"
    } catch {
        throw "npm n'est pas installé"
    }
    
    # Git
    try {
        $gitVersion = git --version
        Write-Host "Git version: $gitVersion"
    } catch {
        throw "Git n'est pas installé"
    }
    
    Write-Success "Prérequis OK"
}

function Install-Dependencies {
    Write-Step "Installation des dépendances..."
    
    Set-Location $ProjectRoot
    
    if (Test-Path "package-lock.json") {
        npm ci
    } else {
        npm install
    }
    
    Write-Success "Dépendances installées"
}

function Run-Tests {
    Write-Step "Exécution des tests..."
    
    # Tests TypeScript
    npx tsc --noEmit
    
    # Tests de linting
    npx eslint src --ext .ts,.astro
    
    # Tests unitaires (si présents)
    if (Test-Path "jest.config.js") {
        npm test
    }
    
    Write-Success "Tests réussis"
}

function Build-Project {
    param([string]$Env = "production")
    
    if ($SkipBuild) {
        Write-Host "🚫 Build ignoré (--SkipBuild)"
        return
    }
    
    Write-Step "Build du projet pour $Env..."
    
    # Variables d'environnement
    $env:NODE_ENV = $Env
    $env:BUILD_TARGET = $Env
    
    # Build Astro
    npm run build
    
    # Optimisations post-build
    Optimize-Build
    
    Write-Success "Build terminé"
}

function Optimize-Build {
    Write-Step "Optimisation du build..."
    
    $distPath = Join-Path $ProjectRoot "dist"
    
    # Compression des images (si ImageMagick installé)
    try {
        Get-ChildItem -Path $distPath -Recurse -Include "*.jpg", "*.png" | ForEach-Object {
            $originalSize = $_.Length
            & magick $_.FullName -quality 85 $_.FullName
            $newSize = (Get-Item $_.FullName).Length
            $saved = $originalSize - $newSize
            Write-Host "  Optimisé: $($_.Name) (-$([math]::Round($saved/1KB, 1))KB)"
        }
    } catch {
        Write-Host "⚠️  ImageMagick non disponible, optimisation images ignorée"
    }
    
    # Minification CSS/JS additionnelle
    try {
        Get-ChildItem -Path $distPath -Recurse -Include "*.css" | ForEach-Object {
            $content = Get-Content $_.FullName -Raw
            $minified = $content -replace '\s+', ' ' -replace '/\*.*?\*/', ''
            Set-Content $_.FullName $minified
        }
    } catch {
        Write-Host "⚠️  Erreur minification CSS"
    }
    
    Write-Success "Optimisation terminée"
}

function Deploy-To-Hostinger {
    Write-Step "Déploiement vers Hostinger..."
    
    $distPath = Join-Path $ProjectRoot "dist"
    $ftpServer = "ftp.hostinger.com"
    $ftpUser = $env:HOSTINGER_FTP_USER
    $ftpPass = $env:HOSTINGER_FTP_PASS
    $remotePath = "/public_html"
    
    if (-not $ftpUser -or -not $ftpPass) {
        throw "Variables FTP non configurées (HOSTINGER_FTP_USER, HOSTINGER_FTP_PASS)"
    }
    
    # Utiliser WinSCP si disponible, sinon curl
    if (Get-Command "WinSCP.exe" -ErrorAction SilentlyContinue) {
        Deploy-WithWinSCP $ftpServer $ftpUser $ftpPass $distPath $remotePath
    } else {
        Deploy-WithCurl $ftpServer $ftpUser $ftpPass $distPath $remotePath
    }
    
    Write-Success "Déploiement terminé"
}

function Deploy-WithWinSCP {
    param($Server, $User, $Pass, $LocalPath, $RemotePath)
    
    $winscp = @"
open ftp://$User`:$Pass@$Server
synchronize remote $LocalPath $RemotePath -delete -filemask="|.git/; .vscode/; node_modules/"
exit
"@
    
    $tempScript = Join-Path $env:TEMP "deploy-script.txt"
    Set-Content $tempScript $winscp
    
    try {
        & WinSCP.exe /script=$tempScript
    } finally {
        Remove-Item $tempScript -ErrorAction SilentlyContinue
    }
}

function Deploy-WithCurl {
    param($Server, $User, $Pass, $LocalPath, $RemotePath)
    
    Write-Host "Déploiement avec curl (fichier par fichier)..."
    
    Get-ChildItem -Path $LocalPath -Recurse -File | ForEach-Object {
        $relativePath = $_.FullName.Substring($LocalPath.Length + 1).Replace('\', '/')
        $remoteFile = "$RemotePath/$relativePath"
        
        Write-Host "  Uploading: $relativePath"
        
        try {
            & curl -T $_.FullName "ftp://$Server$remoteFile" --user "$User`:$Pass" --ftp-create-dirs
        } catch {
            Write-Warning "Erreur upload: $relativePath"
        }
    }
}

function Backup-Production {
    Write-Step "Sauvegarde des données de production..."
    
    $backupDir = Join-Path $ProjectRoot "backups\$(Get-Date -Format 'yyyy-MM-dd-HHmm')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Backup fichiers de données
    $dataFiles = @(
        "data/users-unified.json",
        "data/contact-submissions.json",
        "data/newsletter-subscribers.json",
        "data/affiliate-products.json"
    )
    
    foreach ($file in $dataFiles) {
        $sourcePath = Join-Path $ProjectRoot $file
        if (Test-Path $sourcePath) {
            $destPath = Join-Path $backupDir (Split-Path $file -Leaf)
            Copy-Item $sourcePath $destPath
            Write-Host "  Sauvegardé: $file"
        }
    }
    
    Write-Success "Sauvegarde créée: $backupDir"
}

function Validate-Deployment {
    Write-Step "Validation du déploiement..."
    
    $siteUrl = "https://glp1-france.fr"
    
    # Test de base
    try {
        $response = Invoke-WebRequest -Uri $siteUrl -UseBasicParsing -TimeoutSec 30
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Site accessible (HTTP $($response.StatusCode))"
        } else {
            throw "Status code: $($response.StatusCode)"
        }
    } catch {
        Write-Error "Site non accessible: $($_.Exception.Message)"
        return $false
    }
    
    # Test pages critiques
    $criticalPages = @(
        "/",
        "/collections/medicaments-glp1/",
        "/collections/glp1-perte-de-poids/",
        "/contact",
        "/privacy"
    )
    
    foreach ($page in $criticalPages) {
        try {
            $response = Invoke-WebRequest -Uri "$siteUrl$page" -UseBasicParsing -TimeoutSec 15
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $page OK"
            } else {
                Write-Warning "⚠️  $page Status: $($response.StatusCode)"
            }
        } catch {
            Write-Warning "⚠️  $page Error: $($_.Exception.Message)"
        }
    }
    
    Write-Success "Validation terminée"
    return $true
}

function Send-DeploymentNotification {
    param([bool]$Success, [string]$Environment, [string]$Version)
    
    $status = if ($Success) { "✅ SUCCÈS" } else { "❌ ÉCHEC" }
    $message = "Déploiement $Environment $status`nVersion: $Version`nTimestamp: $(Get-Date)"
    
    Write-Host "`n$message"
    
    # Optionnel: webhook Discord/Slack
    # Send-WebhookNotification $message
}

# SCRIPT PRINCIPAL
try {
    Write-Host "🚀 Déploiement GLP-1 France - Environnement: $Environment" -ForegroundColor Yellow
    
    # 1. Prérequis
    Test-Prerequisites
    
    # 2. Sauvegarde (production uniquement)
    if ($Environment -eq "production") {
        Backup-Production
    }
    
    # 3. Dépendances
    Install-Dependencies
    
    # 4. Tests
    if (-not $Force) {
        Run-Tests
    } else {
        Write-Host "🚫 Tests ignorés (--Force)"
    }
    
    # 5. Build
    Build-Project $Environment
    
    # 6. Déploiement
    if ($Environment -eq "production") {
        Deploy-To-Hostinger
    } else {
        Write-Host "📋 Build prêt pour $Environment dans ./dist/"
    }
    
    # 7. Validation
    if ($Environment -eq "production") {
        $deploymentSuccess = Validate-Deployment
        Send-DeploymentNotification $deploymentSuccess $Environment (Get-Date -Format "yyyy.MM.dd-HHmm")
    }
    
    Write-Success "🎉 Déploiement $Environment terminé avec succès!"
    
} catch {
    Write-Error "💥 Erreur déploiement: $($_.Exception.Message)"
    Send-DeploymentNotification $false $Environment "ERROR"
    exit 1
}
```

### Script de Déploiement Rapide

```powershell
# scripts/quick-deploy.ps1
# Déploiement rapide sans tests complets

param(
    [Parameter(Mandatory=$false)]
    [switch]$Production
)

$Environment = if ($Production) { "production" } else { "staging" }

Write-Host "⚡ Déploiement rapide - $Environment" -ForegroundColor Yellow

try {
    # Build seulement
    Write-Host "🔨 Building..."
    npm run build
    
    if ($Production) {
        # Upload direct
        Write-Host "📤 Uploading..."
        & $PSScriptRoot\deploy.ps1 -Environment production -SkipBuild -Force
    } else {
        Write-Host "✅ Build prêt dans ./dist/"
    }
    
    Write-Host "🎉 Déploiement rapide terminé!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
```

## 🔄 Pipeline CI/CD GitHub Actions

### Configuration Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy GLP-1 France

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '18'
  TINA_CLIENT_ID: 'd2c40213-494b-4005-94ad-b601dbdf1f0e'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: TypeScript check
      run: npx tsc --noEmit
      
    - name: Lint code
      run: npx eslint src --ext .ts,.astro
      
    - name: Run tests
      run: npm test
      if: hashFiles('jest.config.js') != ''

  build:
    needs: test
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        environment: [staging, production]
        
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build project
      run: npm run build
      env:
        NODE_ENV: ${{ matrix.environment }}
        TINA_TOKEN: ${{ secrets.TINA_TOKEN }}
        
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      with:
        name: dist-${{ matrix.environment }}
        path: dist/
        retention-days: 7

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: dist-staging
        path: dist/
        
    - name: Deploy to Vercel (staging)
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-args: '--prod'
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    environment:
      name: production
      url: https://glp1-france.fr
    
    steps:
    - name: Download build artifacts
      uses: actions/download-artifact@v4
      with:
        name: dist-production
        path: dist/
        
    - name: Deploy to Hostinger
      run: |
        # Installation lftp pour FTP
        sudo apt-get update
        sudo apt-get install -y lftp
        
        # Déploiement FTP
        lftp -c "
          set ssl:verify-certificate no;
          open -u ${{ secrets.FTP_USER }},${{ secrets.FTP_PASS }} ${{ secrets.FTP_HOST }};
          mirror -R --delete --verbose dist/ public_html/;
          bye
        "
        
    - name: Validate deployment
      run: |
        # Test site accessible
        curl -f https://glp1-france.fr || exit 1
        
        # Test pages critiques
        pages=("/" "/collections/medicaments-glp1/" "/contact")
        for page in "${pages[@]}"; do
          echo "Testing: $page"
          curl -f "https://glp1-france.fr$page" > /dev/null || echo "Warning: $page failed"
        done
        
    - name: Notify deployment
      uses: 8398a7/action-slack@v3
      if: always()
      with:
        status: ${{ job.status }}
        text: "Déploiement production ${{ job.status }}"
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Workflow de Hotfix

```yaml
# .github/workflows/hotfix.yml
name: Hotfix Deploy

on:
  workflow_dispatch:
    inputs:
      description:
        description: 'Description du hotfix'
        required: true
        type: string

jobs:
  hotfix-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Quick build and deploy
      run: |
        npm ci
        npm run build
        
        # Déploiement direct sans tests complets
        echo "🚨 HOTFIX: ${{ github.event.inputs.description }}"
        
        # Upload FTP rapide (fichiers modifiés uniquement)
        # ... logique de déploiement rapide
        
    - name: Notify hotfix
      run: |
        echo "🚨 Hotfix déployé: ${{ github.event.inputs.description }}"
```

## 📊 Monitoring de Déploiement

### Health Check Script

```powershell
# scripts/health-check.ps1
param(
    [Parameter(Mandatory=$false)]
    [string]$Url = "https://glp1-france.fr"
)

function Test-SiteHealth {
    param([string]$BaseUrl)
    
    $results = @()
    
    # Pages à tester
    $pages = @(
        @{ Path = "/"; Name = "Homepage" },
        @{ Path = "/collections/medicaments-glp1/"; Name = "Médicaments GLP-1" },
        @{ Path = "/collections/glp1-perte-de-poids/"; Name = "Perte de Poids" },
        @{ Path = "/contact"; Name = "Contact" },
        @{ Path = "/privacy"; Name = "Privacy" },
        @{ Path = "/admin"; Name = "Admin" }
    )
    
    foreach ($page in $pages) {
        $url = "$BaseUrl$($page.Path)"
        
        try {
            $start = Get-Date
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
            $end = Get-Date
            $duration = ($end - $start).TotalMilliseconds
            
            $result = @{
                Name = $page.Name
                Url = $url
                Status = $response.StatusCode
                Duration = $duration
                Success = $response.StatusCode -eq 200
                Error = $null
            }
            
        } catch {
            $result = @{
                Name = $page.Name
                Url = $url
                Status = 0
                Duration = -1
                Success = $false
                Error = $_.Exception.Message
            }
        }
        
        $results += $result
    }
    
    return $results
}

function Test-ApiEndpoints {
    param([string]$BaseUrl)
    
    $endpoints = @(
        @{ Path = "/api/users"; Method = "GET"; Name = "Users API" },
        @{ Path = "/api/contact"; Method = "POST"; Name = "Contact API" }
    )
    
    $results = @()
    
    foreach ($endpoint in $endpoints) {
        $url = "$BaseUrl$($endpoint.Path)"
        
        try {
            if ($endpoint.Method -eq "GET") {
                $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            } else {
                # Test POST avec données vides (devrait retourner 400)
                $response = Invoke-WebRequest -Uri $url -Method POST -UseBasicParsing -TimeoutSec 5 -Body "{}"
            }
            
            $success = $response.StatusCode -in @(200, 400, 401) # Codes attendus
            
        } catch {
            $success = $_.Exception.Response.StatusCode -in @(400, 401)
        }
        
        $results += @{
            Name = $endpoint.Name
            Url = $url
            Success = $success
        }
    }
    
    return $results
}

function Generate-HealthReport {
    param($PageResults, $ApiResults)
    
    $report = @"
# 🏥 Health Check Report - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

## 📄 Pages Status

| Page | Status | Duration | URL |
|------|--------|----------|-----|
"@
    
    foreach ($result in $PageResults) {
        $status = if ($result.Success) { "✅ OK" } else { "❌ FAIL" }
        $duration = if ($result.Duration -gt 0) { "$([math]::Round($result.Duration))ms" } else { "N/A" }
        $report += "`n| $($result.Name) | $status | $duration | $($result.Url) |"
    }
    
    $report += @"

## 🔌 API Endpoints

| Endpoint | Status |
|----------|--------|
"@
    
    foreach ($result in $ApiResults) {
        $status = if ($result.Success) { "✅ OK" } else { "❌ FAIL" }
        $report += "`n| $($result.Name) | $status |"
    }
    
    # Résumé
    $totalPages = $PageResults.Count
    $successfulPages = ($PageResults | Where-Object { $_.Success }).Count
    $totalApis = $ApiResults.Count
    $successfulApis = ($ApiResults | Where-Object { $_.Success }).Count
    
    $report += @"

## 📊 Summary

- **Pages**: $successfulPages/$totalPages OK
- **APIs**: $successfulApis/$totalApis OK
- **Overall**: $(if ($successfulPages -eq $totalPages -and $successfulApis -eq $totalApis) { "✅ HEALTHY" } else { "⚠️  ISSUES DETECTED" })
"@
    
    return $report
}

# Exécution du health check
Write-Host "🏥 Health Check - $Url" -ForegroundColor Yellow

$pageResults = Test-SiteHealth $Url
$apiResults = Test-ApiEndpoints $Url

$report = Generate-HealthReport $pageResults $apiResults

Write-Host $report

# Sauvegarder rapport
$reportPath = "logs/health-check-$(Get-Date -Format 'yyyy-MM-dd-HHmm').md"
New-Item -ItemType Directory -Path (Split-Path $reportPath) -Force | Out-Null
Set-Content $reportPath $report

Write-Host "`n📝 Rapport sauvegardé: $reportPath" -ForegroundColor Green

# Exit code selon résultats
$allSuccessful = ($pageResults | Where-Object { -not $_.Success }).Count -eq 0 -and 
                 ($apiResults | Where-Object { -not $_.Success }).Count -eq 0

if (-not $allSuccessful) {
    Write-Host "⚠️  Des problèmes ont été détectés!" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Tous les tests sont OK!" -ForegroundColor Green
exit 0
```

### Monitoring Continu

```powershell
# scripts/monitor.ps1
# Monitoring continu avec alertes

param(
    [Parameter(Mandatory=$false)]
    [int]$IntervalMinutes = 5,
    
    [Parameter(Mandatory=$false)]
    [string]$LogPath = "logs/monitoring.log"
)

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    Write-Host $logEntry
    Add-Content $LogPath $logEntry
}

function Send-Alert {
    param([string]$Message)
    
    Write-Log "ALERT: $Message" "ERROR"
    
    # Optionnel: envoyer email/webhook
    # Send-MailMessage -To "admin@glp1-france.fr" -Subject "Site Alert" -Body $Message
}

Write-Log "🔍 Démarrage monitoring (interval: ${IntervalMinutes}min)"

while ($true) {
    try {
        # Test santé du site
        $healthResult = & $PSScriptRoot\health-check.ps1 -Url "https://glp1-france.fr"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "Site healthy" "SUCCESS"
        } else {
            Send-Alert "Health check failed!"
        }
        
        # Test espace disque (si local)
        if (Test-Path "C:\") {
            $disk = Get-PSDrive C
            $freePercentage = ($disk.Free / $disk.Used) * 100
            
            if ($freePercentage -lt 10) {
                Send-Alert "Low disk space: $([math]::Round($freePercentage, 1))% free"
            }
        }
        
        # Test taille logs
        if (Test-Path $LogPath) {
            $logSize = (Get-Item $LogPath).Length / 1MB
            if ($logSize -gt 10) {
                Write-Log "Rotating log file (size: $([math]::Round($logSize, 1))MB)"
                $backupPath = $LogPath.Replace('.log', "-$(Get-Date -Format 'yyyyMMdd').log")
                Move-Item $LogPath $backupPath
            }
        }
        
    } catch {
        Write-Log "Monitoring error: $($_.Exception.Message)" "ERROR"
    }
    
    Start-Sleep -Seconds ($IntervalMinutes * 60)
}
```

---

> **Note** : Les scripts de déploiement doivent être adaptés selon l'infrastructure cible et les outils disponibles.
