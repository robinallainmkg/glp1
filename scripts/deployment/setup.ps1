# 🚀 Configuration initiale GLP-1 France (Windows PowerShell)

param(
    [switch]$Help
)

# Couleurs
function Write-Info {
    param([string]$Message)
    Write-Host "INFO: $Message" -ForegroundColor Cyan
}

function Write-Success {
    param([string]$Message)
    Write-Host "SUCCESS: $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "WARNING: $Message" -ForegroundColor Yellow
}

function Write-ErrorMsg {
    param([string]$Message)
    Write-Host "ERROR: $Message" -ForegroundColor Red
}

function Write-Step {
    param([string]$Message)
    Write-Host "STEP: $Message" -ForegroundColor Magenta
}

# Affichage de l'aide
function Show-Help {
    Write-Host @"
🚀 Configuration initiale GLP-1 France (Windows PowerShell)

Ce script vous aide à configurer le déploiement sur Windows.

USAGE:
    .\setup.ps1

PRÉREQUIS:
    - Git installé avec Git Bash
    - Node.js et npm installés
    - Accès SSH à Hostinger

ÉTAPES:
    1. Configuration SSH avec Git Bash
    2. Création du fichier .env.production
    3. Test de connexion
    4. Premier déploiement

Pour la configuration SSH complète, utilisez Git Bash:
    & 'C:\Program Files\Git\bin\bash.exe' scripts/setup.sh
"@
}

# Vérification des prérequis Windows
function Test-Prerequisites {
    Write-Step "Verification des prerequis Windows..."
    
    $missing = @()
    
    # Git
    try {
        $null = Get-Command git -ErrorAction Stop
        $gitVersion = & git --version
        Write-Success "Git installe: $gitVersion"
    } catch {
        $missing += "Git"
    }
    
    # Node.js
    try {
        $null = Get-Command node -ErrorAction Stop
        $nodeVersion = & node --version
        Write-Success "Node.js installe: $nodeVersion"
    } catch {
        $missing += "Node.js"
    }
    
    # npm
    try {
        $null = Get-Command npm -ErrorAction Stop
        $npmVersion = & npm --version
        Write-Success "npm installe: v$npmVersion"
    } catch {
        $missing += "npm"
    }
    
    # SSH (via Git)
    $gitBash = "C:\Program Files\Git\bin\bash.exe"
    if (Test-Path $gitBash) {
        Write-Success "Git Bash disponible: $gitBash"
    } else {
        Write-Warning "Git Bash non trouve au chemin standard"
    }
    
    if ($missing.Count -gt 0) {
        Write-ErrorMsg "Outils manquants: $($missing -join ', ')"
        Write-Host ""
        Write-Host "Veuillez installer:"
        Write-Host "- Git: https://git-scm.com/ (inclut Git Bash et SSH)"
        Write-Host "- Node.js: https://nodejs.org/"
        return $false
    }
    
    return $true
}

# Configuration rapide du fichier .env.production
function Set-EnvironmentFile {
    Write-Step "Configuration du fichier .env.production..."
    
    if (Test-Path ".env.production") {
        Write-Warning "Le fichier .env.production existe déjà"
        $response = Read-Host "Voulez-vous le reconfigurer ? (y/N)"
        if ($response -notmatch "^[Yy]$") {
            Write-Info "Conservation du fichier existant"
            return $true
        }
    }
    
    Write-Host ""
    Write-Info "Configuration rapide des paramètres essentiels..."
    Write-Host ""
    
    # Paramètres par défaut pour Hostinger
    $sshUser = "u403023291"
    $sshHost = "147.79.98.140"
    $sshPort = "65002"
    $remotePath = "/home/u403023291/domains/glp1-france.fr/public_html"
    $siteUrl = "https://glp1-france.fr"
    $sshKeyPath = "$env:USERPROFILE\.ssh\id_rsa_glp1"
    
    Write-Host "Paramètres par défaut:" -ForegroundColor Yellow
    Write-Host "SSH User: $sshUser"
    Write-Host "SSH Host: $sshHost"
    Write-Host "SSH Port: $sshPort"
    Write-Host "Site URL: $siteUrl"
    Write-Host "Clé SSH: $sshKeyPath"
    Write-Host ""
    
    $useDefaults = Read-Host "Utiliser ces paramètres par défaut ? (Y/n)"
    
    if ($useDefaults -match "^[Nn]$") {
        $sshUser = Read-Host "Nom d'utilisateur SSH [$sshUser]"
        if (-not $sshUser) { $sshUser = "u403023291" }
        
        $sshHost = Read-Host "Adresse IP SSH [$sshHost]"
        if (-not $sshHost) { $sshHost = "147.79.98.140" }
        
        $sshPort = Read-Host "Port SSH [$sshPort]"
        if (-not $sshPort) { $sshPort = "65002" }
        
        $siteUrl = Read-Host "URL du site [$siteUrl]"
        if (-not $siteUrl) { $siteUrl = "https://glp1-france.fr" }
    }
    
    # Créer le fichier .env.production
    $envContent = @"
# Configuration de déploiement GLP-1 France
# Généré le $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

# Configuration SSH
SSH_USER="$sshUser"
SSH_HOST="$sshHost"
SSH_PORT="$sshPort"
SSH_KEY_PATH="$sshKeyPath"

# Chemins
REMOTE_PATH="$remotePath"
LOCAL_BUILD_DIR="dist"

# Site
SITE_URL="$siteUrl"

# Options de déploiement
AUTO_BACKUP="true"
BACKUP_KEEP="5"
BACKUP_KEEP_DAYS="7"

# Optimisations
RSYNC_COMPRESS="true"
RSYNC_DELETE="true"
RSYNC_VERBOSE="false"

# Vérifications
VERIFY_DEPLOYMENT="true"
CHECK_SSL="true"
CHECK_PERFORMANCE="true"

# Logs
LOG_KEEP_DAYS="30"
LOG_LEVEL="INFO"

# Sécurité
STRICT_HOST_KEY_CHECKING="yes"
CONNECTION_TIMEOUT="30"
"@
    
    try {
        $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
        Write-Success "Fichier .env.production créé"
        return $true
    } catch {
        Write-ErrorMsg "Erreur lors de la creation du fichier: $_"
        return $false
    }
}

# Installation des dépendances
function Install-Dependencies {
    Write-Step "Installation des dependances..."
    
    if (-not (Test-Path "package.json")) {
        Write-ErrorMsg "package.json non trouve"
        return $false
    }
    
    try {
        Write-Info "Execution de npm install..."
        & npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Dependances installees"
            return $true
        } else {
            Write-ErrorMsg "Echec de l'installation des dependances"
            return $false
        }
    } catch {
        Write-ErrorMsg "Erreur lors de l'installation: $_"
        return $false
    }
}

# Test de build
function Test-Build {
    Write-Step "Test de build du projet..."
    
    try {
        Write-Info "Construction du projet..."
        & npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build reussi"
            
            if (Test-Path "dist") {
                $fileCount = (Get-ChildItem -Recurse "dist" | Measure-Object).Count
                Write-Info "Build genere: $fileCount fichiers dans dist/"
            }
            return $true
        } else {
            Write-ErrorMsg "Echec du build"
            return $false
        }
    } catch {
        Write-ErrorMsg "Erreur lors du build: $_"
        return $false
    }
}

# Résumé et prochaines étapes
function Show-Summary {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        CONFIGURATION TERMINÉE          ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Success "Configuration de base terminée !"
    Write-Host ""
    
    Write-Host "🔑 ÉTAPE IMPORTANTE - Configuration SSH:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Configurez vos clés SSH avec Git Bash:"
    Write-Host "   & 'C:\Program Files\Git\bin\bash.exe' scripts/setup.sh --ssh-only"
    Write-Host ""
    Write-Host "2. Ou suivez le guide manuel:"
    Write-Host "   - Consultez GUIDE_CONFIGURATION_SSH.md"
    Write-Host "   - Générez une clé SSH"
    Write-Host "   - Ajoutez-la dans votre panel Hostinger"
    Write-Host ""
    
    Write-Host "🚀 Déploiement:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Une fois SSH configuré:"
    Write-Host "1. Test de déploiement:"
    Write-Host "   .\deploy.ps1 -DryRun"
    Write-Host ""
    Write-Host "2. Premier déploiement:"
    Write-Host "   .\deploy.ps1"
    Write-Host ""
    
    Write-Host "📚 Scripts disponibles:" -ForegroundColor Cyan
    Write-Host "   .\deploy.ps1              - Déploiement (PowerShell)"
    Write-Host "   npm run deploy            - Déploiement (bash)"
    Write-Host "   npm run deploy:check      - Vérification du site"
    Write-Host "   npm run monitoring:check  - Monitoring complet"
    Write-Host ""
    
    Write-Host "📋 Documentation:" -ForegroundColor Blue
    Write-Host "   - GUIDE_CONFIGURATION_SSH.md"
    Write-Host "   - GUIDE_SCRIPTS.md"
    Write-Host "   - README.md"
    Write-Host ""
}

# Fonction principale
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    # Header
    Write-Host @"

    ╔═══════════════════════════════════════════════════════════╗
    ║           🚀 CONFIGURATION GLP-1 (WINDOWS)               ║
    ║                                                           ║
    ║  Configuration simplifiée pour Windows PowerShell        ║
    ╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Blue
    
    Write-Info "Début de la configuration Windows..."
    Write-Host ""
    
    # Vérifications
    if (-not (Test-Prerequisites)) {
        Write-ErrorMsg "Impossible de continuer sans les prerequis"
        return
    }
    Write-Host ""
    
    # Configuration .env
    if (-not (Set-EnvironmentFile)) {
        Write-ErrorMsg "Impossible de continuer sans configuration"
        return
    }
    Write-Host ""
    
    # Dependencies
    if (-not (Install-Dependencies)) {
        Write-Warning "Echec de l'installation des dependances"
    }
    Write-Host ""
    
    # Test build
    if (-not (Test-Build)) {
        Write-Warning "Echec du test de build"
    }
    Write-Host ""
    
    Show-Summary
}

# Point d'entrée
Main
