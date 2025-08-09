# 🚀 Script de déploiement Windows PowerShell - GLP-1 France

param(
    [switch]$DryRun,
    [switch]$SkipBackup,
    [switch]$SkipVerify,
    [switch]$Rollback,
    [switch]$Help
)

# Configuration par défaut
$SSH_USER = "u403023291"
$SSH_HOST = "147.79.98.140"
$SSH_PORT = "65002"
$REMOTE_PATH = "/home/u403023291/domains/glp1-france.fr/public_html"
$LOCAL_BUILD_DIR = "dist"
$SITE_URL = "https://glp1-france.fr"

# Couleurs PowerShell
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Info {
    param([string]$Message)
    Write-ColorOutput "ℹ️  $Message" "Cyan"
}

function Write-Success {
    param([string]$Message)
    Write-ColorOutput "✅ $Message" "Green"
}

function Write-Warning {
    param([string]$Message)
    Write-ColorOutput "⚠️  $Message" "Yellow"
}

function Write-Error {
    param([string]$Message)
    Write-ColorOutput "❌ $Message" "Red"
}

function Write-Step {
    param([string]$Message)
    Write-ColorOutput "🔹 $Message" "Magenta"
}

# Chargement de la configuration
function Load-Config {
    if (Test-Path ".env.production") {
        Get-Content ".env.production" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                $name = $matches[1].Trim()
                $value = $matches[2].Trim()
                # Supprimer les guillemets si présents
                $value = $value -replace '^"(.*)"$', '$1'
                Set-Variable -Name $name -Value $value -Scope Script
            }
        }
        Write-Info "Configuration chargée depuis .env.production"
    } else {
        Write-Warning "Fichier .env.production non trouvé, utilisation des valeurs par défaut"
    }
}

# Affichage de l'aide
function Show-Help {
    Write-Host @"
🚀 Script de déploiement GLP-1 France (Windows PowerShell)

USAGE:
    .\deploy.ps1 [OPTIONS]

OPTIONS:
    -DryRun         Simulation sans modification des fichiers
    -SkipBackup     Ignorer la création de backup
    -SkipVerify     Ignorer les vérifications post-déploiement
    -Rollback       Restaurer depuis le dernier backup
    -Help           Afficher cette aide

EXEMPLES:
    .\deploy.ps1                    # Déploiement complet
    .\deploy.ps1 -DryRun            # Test sans modification
    .\deploy.ps1 -SkipBackup        # Déploiement rapide
    .\deploy.ps1 -Rollback          # Restauration

PRÉREQUIS:
    - Node.js et npm installés
    - Clé SSH configurée pour Hostinger
    - Fichier .env.production configuré

Pour la configuration initiale, utilisez WSL ou Git Bash:
    bash scripts/setup.sh
"@
}

# Test de connexion SSH
function Test-SSHConnection {
    Write-Step "Test de connexion SSH..."
    
    $sshKey = if ($SSH_KEY_PATH) { $SSH_KEY_PATH } else { "$env:USERPROFILE\.ssh\id_rsa_glp1" }
    
    if (-not (Test-Path $sshKey)) {
        Write-Error "Clé SSH non trouvée: $sshKey"
        Write-Info "Utilisez 'bash scripts/setup.sh' pour configurer SSH"
        return $false
    }
    
    try {
        $testResult = & ssh -i $sshKey -p $SSH_PORT -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" 2>$null
        if ($testResult -eq "SSH OK") {
            Write-Success "Connexion SSH fonctionnelle"
            return $true
        } else {
            Write-Error "Connexion SSH échouée"
            return $false
        }
    } catch {
        Write-Error "Erreur de connexion SSH: $_"
        return $false
    }
}

# Build du projet
function Build-Project {
    Write-Step "Build du projet..."
    
    if (-not (Test-Path "package.json")) {
        Write-Error "package.json non trouvé"
        return $false
    }
    
    try {
        Write-Info "Exécution de npm run build..."
        $buildResult = & npm run build 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Build réussi"
            
            # Vérifier que le dossier dist existe
            if (Test-Path $LOCAL_BUILD_DIR) {
                $fileCount = (Get-ChildItem -Recurse $LOCAL_BUILD_DIR | Measure-Object).Count
                Write-Info "Build généré: $fileCount fichiers dans $LOCAL_BUILD_DIR/"
                return $true
            } else {
                Write-Error "Dossier $LOCAL_BUILD_DIR non créé"
                return $false
            }
        } else {
            Write-Error "Échec du build"
            Write-Host $buildResult
            return $false
        }
    } catch {
        Write-Error "Erreur lors du build: $_"
        return $false
    }
}

# Création de backup distant
function Create-RemoteBackup {
    if ($SkipBackup) {
        Write-Info "Backup ignoré (--skip-backup)"
        return $true
    }
    
    Write-Step "Création du backup distant..."
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = "backup_$timestamp"
    
    try {
        $sshKey = if ($SSH_KEY_PATH) { $SSH_KEY_PATH } else { "$env:USERPROFILE\.ssh\id_rsa_glp1" }
        
        $backupScript = @"
cd '$(Split-Path $REMOTE_PATH -Parent)'
if [ -d '$REMOTE_PATH' ]; then
    cp -r '$REMOTE_PATH' '$backupName'
    echo 'Backup créé: $backupName'
else
    echo 'Répertoire de déploiement non trouvé'
    exit 1
fi
"@
        
        $result = $backupScript | & ssh -i $sshKey -p $SSH_PORT "$SSH_USER@$SSH_HOST" "bash"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Backup créé: $backupName"
            return $true
        } else {
            Write-Error "Échec de la création du backup"
            return $false
        }
    } catch {
        Write-Error "Erreur lors de la création du backup: $_"
        return $false
    }
}

# Synchronisation des fichiers (avec robocopy comme alternative à rsync)
function Sync-Files {
    Write-Step "Synchronisation des fichiers..."
    
    if ($DryRun) {
        Write-Info "Mode DRY-RUN - Aucune modification ne sera effectuée"
    }
    
    try {
        $sshKey = if ($SSH_KEY_PATH) { $SSH_KEY_PATH } else { "$env:USERPROFILE\.ssh\id_rsa_glp1" }
        
        # Utiliser scp pour Windows (moins optimal que rsync mais fonctionnel)
        Write-Info "Synchronisation via SCP..."
        
        if ($DryRun) {
            Write-Info "SIMULATION: scp -r $LOCAL_BUILD_DIR/* $SSH_USER@$SSH_HOST:$REMOTE_PATH/"
            return $true
        }
        
        # Créer le répertoire distant s'il n'existe pas
        & ssh -i $sshKey -p $SSH_PORT "$SSH_USER@$SSH_HOST" "mkdir -p '$REMOTE_PATH'"
        
        # Synchroniser les fichiers
        & scp -i $sshKey -P $SSH_PORT -r "$LOCAL_BUILD_DIR\*" "$SSH_USER@$SSH_HOST`:$REMOTE_PATH/"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Synchronisation terminée"
            return $true
        } else {
            Write-Error "Échec de la synchronisation"
            return $false
        }
    } catch {
        Write-Error "Erreur lors de la synchronisation: $_"
        return $false
    }
}

# Vérification post-déploiement
function Verify-Deployment {
    if ($SkipVerify) {
        Write-Info "Vérifications ignorées (--skip-verify)"
        return $true
    }
    
    Write-Step "Vérification du déploiement..."
    
    try {
        Write-Info "Test HTTP du site..."
        $response = Invoke-WebRequest -Uri $SITE_URL -Method Head -TimeoutSec 30 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Success "Site accessible (HTTP $($response.StatusCode))"
            return $true
        } else {
            Write-Warning "Code de réponse inattendu: $($response.StatusCode)"
            return $false
        }
    } catch {
        Write-Error "Site inaccessible: $_"
        return $false
    }
}

# Fonction principale
function Main {
    # Header
    Write-Host @"

    ╔═══════════════════════════════════════════════════════════╗
    ║               🚀 DÉPLOIEMENT GLP-1 FRANCE                ║
    ║                                                           ║
    ║  Déploiement automatisé vers Hostinger (Windows)         ║
    ╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Blue
    
    if ($Help) {
        Show-Help
        return
    }
    
    # Chargement de la configuration
    Load-Config
    
    $startTime = Get-Date
    Write-Info "Début du déploiement - $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')"
    Write-Host ""
    
    # Rollback
    if ($Rollback) {
        Write-Warning "Fonctionnalité rollback non encore implémentée dans la version PowerShell"
        Write-Info "Utilisez: bash scripts/rollback.sh"
        return
    }
    
    # Vérifications préliminaires
    if (-not (Test-SSHConnection)) {
        Write-Error "Impossible de continuer sans connexion SSH"
        return
    }
    Write-Host ""
    
    # Build
    if (-not (Build-Project)) {
        Write-Error "Impossible de continuer sans build réussi"
        return
    }
    Write-Host ""
    
    # Backup
    if (-not (Create-RemoteBackup)) {
        Write-Error "Impossible de continuer sans backup"
        return
    }
    Write-Host ""
    
    # Synchronisation
    if (-not (Sync-Files)) {
        Write-Error "Échec de la synchronisation"
        return
    }
    Write-Host ""
    
    # Vérification
    if (-not (Verify-Deployment)) {
        Write-Warning "Déploiement effectué mais vérifications échouées"
    }
    
    # Résumé final
    $endTime = Get-Date
    $duration = $endTime - $startTime
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║           DÉPLOIEMENT TERMINÉ          ║" -ForegroundColor Green  
    Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Success "Déploiement terminé avec succès"
    Write-Info "Durée: $([math]::Round($duration.TotalSeconds, 1))s"
    Write-Info "Site: $SITE_URL"
    Write-Host ""
    
    Write-Host "Prochaines étapes recommandées:" -ForegroundColor Yellow
    Write-Host "1. Vérifier le site: $SITE_URL"
    Write-Host "2. Tester les fonctionnalités principales"
    Write-Host "3. Monitoring: & 'C:\Program Files\Git\bin\bash.exe' scripts/monitoring.sh"
    Write-Host ""
}

# Point d'entrée
Main
