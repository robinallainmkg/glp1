#!/bin/bash

# 🚀 Script de déploiement automatisé GLP-1 France vers Hostinger
# Version: 2.0
# Auteur: Équipe GLP-1
# Description: Déploiement sécurisé avec backup et vérifications

set -euo pipefail  # Mode strict bash

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration par défaut (peut être surchargée par .env.production)
SSH_USER="${SSH_USER:-u403023291}"
SSH_HOST="${SSH_HOST:-147.79.98.140}"
SSH_PORT="${SSH_PORT:-65002}"
REMOTE_PATH="${REMOTE_PATH:-/home/u403023291/domains/glp1-france.fr/public_html}"
SITE_URL="${SITE_URL:-https://glp1-france.fr}"
LOCAL_BUILD_DIR="${LOCAL_BUILD_DIR:-dist}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"

# Variables internes
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_${TIMESTAMP}"
LOG_FILE="deploy_${TIMESTAMP}.log"

# Fonction d'affichage avec couleurs
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}" | tee -a "$LOG_FILE"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}❌ $1${NC}" | tee -a "$LOG_FILE"
}

log_step() {
    echo -e "${PURPLE}🔹 $1${NC}" | tee -a "$LOG_FILE"
}

# Fonction pour charger les variables d'environnement
load_env() {
    if [[ -f ".env.production" ]]; then
        log_info "Chargement de .env.production"
        set -a
        source .env.production
        set +a
        log_success "Variables d'environnement chargées"
    else
        log_warning "Fichier .env.production non trouvé, utilisation des valeurs par défaut"
    fi
}

# Fonction de nettoyage en cas d'interruption
cleanup() {
    log_warning "Nettoyage en cours..."
    # Nettoyage des fichiers temporaires si nécessaire
    log_info "Nettoyage terminé"
}

# Trap pour le nettoyage
trap cleanup EXIT INT TERM

# Fonction de vérification des prérequis
check_prerequisites() {
    log_step "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        log_error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier rsync
    if ! command -v rsync &> /dev/null; then
        log_error "rsync n'est pas installé"
        exit 1
    fi
    
    # Vérifier ssh
    if ! command -v ssh &> /dev/null; then
        log_error "ssh n'est pas installé"
        exit 1
    fi
    
    # Vérifier la structure du projet
    if [[ ! -f "package.json" ]]; then
        log_error "package.json non trouvé. Êtes-vous dans le bon répertoire ?"
        exit 1
    fi
    
    # Vérifier les dépendances
    if [[ ! -d "node_modules" ]]; then
        log_warning "node_modules non trouvé, installation des dépendances..."
        npm install
    fi
    
    log_success "Tous les prérequis sont satisfaits"
}

# Fonction de test de connectivité SSH
test_ssh_connection() {
    log_step "Test de la connexion SSH..."
    
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        log_success "Connexion SSH établie avec succès"
        return 0
    else
        log_error "Impossible de se connecter via SSH"
        log_info "Vérifiez votre configuration SSH dans ~/.ssh/config"
        log_info "Ou lancez: ssh-copy-id -p $SSH_PORT $SSH_USER@$SSH_HOST"
        return 1
    fi
}

# Fonction de build du projet
build_project() {
    log_step "Build du projet..."
    
    # Nettoyage précédent
    if [[ -d "$LOCAL_BUILD_DIR" ]]; then
        rm -rf "$LOCAL_BUILD_DIR"
        log_info "Ancien build supprimé"
    fi
    
    # Build avec npm
    if npm run build; then
        log_success "Build réussi"
    else
        log_error "Échec du build"
        exit 1
    fi
    
    # Vérification que le build a créé les fichiers
    if [[ ! -d "$LOCAL_BUILD_DIR" ]] || [[ -z "$(ls -A "$LOCAL_BUILD_DIR")" ]]; then
        log_error "Le répertoire de build est vide ou inexistant"
        exit 1
    fi
    
    # Statistiques du build
    local file_count=$(find "$LOCAL_BUILD_DIR" -type f | wc -l)
    local total_size=$(du -sh "$LOCAL_BUILD_DIR" | cut -f1)
    log_info "Build contient: $file_count fichiers ($total_size)"
}

# Fonction de backup distant
create_remote_backup() {
    if [[ "$1" == "--skip-backup" ]]; then
        log_warning "Backup distant ignoré (--skip-backup)"
        return 0
    fi
    
    log_step "Création du backup distant..."
    
    # Vérifier si le répertoire distant existe
    if ! ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "test -d '$REMOTE_PATH'" 2>/dev/null; then
        log_warning "Le répertoire distant n'existe pas encore, création..."
        ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "mkdir -p '$REMOTE_PATH'"
        log_info "Premier déploiement détecté, pas de backup nécessaire"
        return 0
    fi
    
    # Créer le backup
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        if [[ -d '$(basename "$REMOTE_PATH")' ]]; then
            cp -r '$(basename "$REMOTE_PATH")' '$BACKUP_DIR'
            echo 'Backup créé: $BACKUP_DIR'
        fi
    "
    
    if [[ $? -eq 0 ]]; then
        log_success "Backup distant créé: $BACKUP_DIR"
    else
        log_error "Échec de la création du backup"
        exit 1
    fi
}

# Fonction de synchronisation rsync
sync_files() {
    local dry_run="$1"
    
    if [[ "$dry_run" == "--dry-run" ]]; then
        log_step "Test de synchronisation (dry-run)..."
        local rsync_opts="--dry-run"
    else
        log_step "Synchronisation des fichiers..."
        local rsync_opts=""
    fi
    
    # Options rsync optimisées
    rsync -avz --delete --progress \
        $rsync_opts \
        --exclude 'node_modules/' \
        --exclude '.git/' \
        --exclude '.env*' \
        --exclude '*.log' \
        --exclude '.DS_Store' \
        --exclude 'Thumbs.db' \
        --exclude '.vscode/' \
        --exclude '.astro/' \
        --exclude 'src/' \
        --exclude 'scripts/' \
        --exclude 'data/' \
        --exclude 'prompts/' \
        --exclude 'package*.json' \
        --exclude '*.md' \
        --exclude 'astro.config.mjs' \
        --exclude 'netlify.toml' \
        --exclude 'vercel.json' \
        --exclude 'deploy*.sh' \
        -e "ssh -p $SSH_PORT" \
        "$LOCAL_BUILD_DIR/" \
        "$SSH_USER@$SSH_HOST:$REMOTE_PATH/"
    
    if [[ $? -eq 0 ]]; then
        if [[ "$dry_run" == "--dry-run" ]]; then
            log_success "Test de synchronisation réussi"
        else
            log_success "Synchronisation terminée avec succès"
        fi
    else
        log_error "Échec de la synchronisation"
        exit 1
    fi
}

# Fonction de nettoyage des anciens backups
cleanup_old_backups() {
    log_step "Nettoyage des anciens backups..."
    
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        find . -maxdepth 1 -type d -name 'backup_*' -mtime +$BACKUP_KEEP_DAYS -exec rm -rf {} + 2>/dev/null || true
        backup_count=\$(find . -maxdepth 1 -type d -name 'backup_*' | wc -l)
        echo \"Backups restants: \$backup_count\"
    "
    
    log_success "Nettoyage des backups terminé"
}

# Fonction de vérification post-déploiement
verify_deployment() {
    if [[ "$1" == "--skip-verify" ]]; then
        log_warning "Vérification post-déploiement ignorée (--skip-verify)"
        return 0
    fi
    
    log_step "Vérification du déploiement..."
    
    # Test HTTP
    if command -v curl &> /dev/null; then
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" --connect-timeout 10 --max-time 30)
        if [[ "$http_status" == "200" ]]; then
            log_success "Site accessible (HTTP $http_status)"
        else
            log_warning "Site retourne HTTP $http_status"
        fi
    else
        log_warning "curl non disponible, impossible de tester l'URL"
    fi
    
    # Vérifier quelques fichiers importants
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$REMOTE_PATH'
        if [[ -f 'index.html' ]]; then
            echo '✅ index.html présent'
        else
            echo '❌ index.html manquant'
        fi
        
        file_count=\$(find . -name '*.html' | wc -l)
        echo \"📄 Fichiers HTML: \$file_count\"
        
        total_size=\$(du -sh . | cut -f1)
        echo \"📦 Taille totale: \$total_size\"
    "
}

# Fonction de rollback
rollback() {
    log_step "Rollback en cours..."
    
    # Trouver le backup le plus récent
    local latest_backup=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        find . -maxdepth 1 -type d -name 'backup_*' | sort -r | head -1
    ")
    
    if [[ -n "$latest_backup" && "$latest_backup" != "." ]]; then
        ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
            cd '$(dirname "$REMOTE_PATH")'
            rm -rf '$(basename "$REMOTE_PATH")'
            mv '$latest_backup' '$(basename "$REMOTE_PATH")'
        "
        log_success "Rollback effectué vers: $latest_backup"
    else
        log_error "Aucun backup trouvé pour le rollback"
        exit 1
    fi
}

# Fonction d'affichage du rapport final
show_report() {
    local start_time="$1"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo
    echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║           RAPPORT DE DÉPLOIEMENT       ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}✅ Déploiement terminé avec succès${NC}"
    echo -e "${BLUE}📅 Date: $(date)${NC}"
    echo -e "${BLUE}⏱️  Durée: ${duration}s${NC}"
    echo -e "${BLUE}🌐 URL: $SITE_URL${NC}"
    echo -e "${BLUE}📁 Chemin distant: $REMOTE_PATH${NC}"
    echo -e "${BLUE}📋 Log: $LOG_FILE${NC}"
    echo
    echo -e "${YELLOW}Prochaines étapes recommandées:${NC}"
    echo "1. Vérifiez manuellement le site: $SITE_URL"
    echo "2. Testez les fonctionnalités principales"
    echo "3. Surveillez les erreurs dans les 24h"
    echo
}

# Fonction d'affichage de l'aide
show_help() {
    cat << EOF
🚀 Script de déploiement GLP-1 France

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --dry-run           Test de déploiement sans upload réel
    --skip-backup       Ignorer la création du backup distant
    --skip-verify       Ignorer la vérification post-déploiement
    --rollback          Effectuer un rollback vers le backup précédent
    --help, -h          Afficher cette aide

EXEMPLES:
    $0                  # Déploiement complet standard
    $0 --dry-run        # Test sans modification du serveur
    $0 --skip-backup    # Déploiement rapide sans backup
    $0 --rollback       # Annuler le dernier déploiement

CONFIGURATION:
    Créez un fichier .env.production pour personnaliser les variables.
    Voir le fichier .env.production.example pour les options disponibles.

SUPPORT:
    En cas de problème, consultez le log généré : deploy_YYYYMMDD_HHMMSS.log
EOF
}

# Fonction principale
main() {
    local start_time=$(date +%s)
    local dry_run=""
    local skip_backup=""
    local skip_verify=""
    local do_rollback=""
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                dry_run="--dry-run"
                shift
                ;;
            --skip-backup)
                skip_backup="--skip-backup"
                shift
                ;;
            --skip-verify)
                skip_verify="--skip-verify"
                shift
                ;;
            --rollback)
                do_rollback="true"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Header
    echo -e "${CYAN}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║               🚀 DÉPLOIEMENT GLP-1 FRANCE                 ║
    ║                                                           ║
    ║  Déploiement automatisé vers Hostinger avec backup       ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Chargement de la configuration
    load_env
    
    # Rollback si demandé
    if [[ -n "$do_rollback" ]]; then
        check_prerequisites
        test_ssh_connection || exit 1
        rollback
        exit 0
    fi
    
    # Déploiement normal
    log_info "Début du déploiement vers $SSH_USER@$SSH_HOST:$REMOTE_PATH"
    
    check_prerequisites
    test_ssh_connection || exit 1
    
    if [[ "$dry_run" != "--dry-run" ]]; then
        build_project
        create_remote_backup "$skip_backup"
    fi
    
    sync_files "$dry_run"
    
    if [[ "$dry_run" != "--dry-run" ]]; then
        cleanup_old_backups
        verify_deployment "$skip_verify"
        show_report "$start_time"
    else
        log_success "Test de déploiement terminé avec succès"
        log_info "Lancez sans --dry-run pour effectuer le déploiement réel"
    fi
}

# Point d'entrée
main "$@"
