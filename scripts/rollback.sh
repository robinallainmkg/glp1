#!/bin/bash

# 🔄 Script de rollback GLP-1 France
# Restaure la version précédente en cas de problème

set -euo pipefail

# Configuration par défaut
SSH_USER="${SSH_USER:-u403023291}"
SSH_HOST="${SSH_HOST:-147.79.98.140}"
SSH_PORT="${SSH_PORT:-65002}"
REMOTE_PATH="${REMOTE_PATH:-/home/u403023291/domains/glp1-france.fr/public_html}"
SITE_URL="${SITE_URL:-https://glp1-france.fr}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${PURPLE}🔹 $1${NC}"
}

# Chargement de la configuration
load_env() {
    if [[ -f ".env.production" ]]; then
        log_info "Chargement de .env.production"
        set -a
        source .env.production
        set +a
    fi
}

# Test de connexion SSH
test_ssh_connection() {
    log_step "Test de la connexion SSH..."
    
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        log_success "Connexion SSH établie"
        return 0
    else
        log_error "Impossible de se connecter via SSH"
        return 1
    fi
}

# Lister les backups disponibles
list_backups() {
    log_step "Recherche des backups disponibles..."
    
    local backups=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        find . -maxdepth 1 -type d -name 'backup_*' | sort -r
    " 2>/dev/null)
    
    if [[ -z "$backups" ]]; then
        log_error "Aucun backup trouvé"
        return 1
    fi
    
    echo -e "${YELLOW}Backups disponibles:${NC}"
    local count=0
    while IFS= read -r backup; do
        if [[ -n "$backup" && "$backup" != "." ]]; then
            ((count++))
            local backup_name=$(basename "$backup")
            local backup_date=$(echo "$backup_name" | sed 's/backup_//' | sed 's/_/ /' | sed 's/\(.*\) \(.*\)/\1 \2/')
            
            # Essayer de convertir la date en format lisible
            if [[ "$backup_date" =~ ^[0-9]{8}\ [0-9]{6}$ ]]; then
                local formatted_date=$(date -d "${backup_date:0:8} ${backup_date:9:2}:${backup_date:11:2}:${backup_date:13:2}" '+%d/%m/%Y %H:%M:%S' 2>/dev/null || echo "$backup_date")
                echo -e "  ${GREEN}$count)${NC} $backup_name (${formatted_date})"
            else
                echo -e "  ${GREEN}$count)${NC} $backup_name"
            fi
            
            # Stocker pour la sélection
            eval "backup_$count='$backup'"
        fi
    done <<< "$backups"
    
    if [[ $count -eq 0 ]]; then
        log_error "Aucun backup valide trouvé"
        return 1
    fi
    
    return 0
}

# Sélectionner un backup
select_backup() {
    local selected_backup=""
    
    if [[ -n "${1:-}" ]]; then
        # Backup spécifié en argument
        if [[ "$1" =~ ^[0-9]+$ ]]; then
            local backup_var="backup_$1"
            selected_backup="${!backup_var:-}"
        else
            selected_backup="$1"
        fi
    else
        # Sélection interactive
        echo
        read -p "Sélectionnez un backup (numéro ou 'latest' pour le plus récent): " choice
        
        if [[ "$choice" == "latest" ]]; then
            selected_backup="${backup_1:-}"
        elif [[ "$choice" =~ ^[0-9]+$ ]]; then
            local backup_var="backup_$choice"
            selected_backup="${!backup_var:-}"
        fi
    fi
    
    if [[ -z "$selected_backup" ]]; then
        log_error "Backup non trouvé ou sélection invalide"
        return 1
    fi
    
    echo "$selected_backup"
    return 0
}

# Effectuer le rollback
perform_rollback() {
    local backup_path="$1"
    local backup_name=$(basename "$backup_path")
    
    log_step "Rollback vers: $backup_name"
    
    # Confirmation
    if [[ "${FORCE_ROLLBACK:-}" != "true" ]]; then
        echo -e "${YELLOW}⚠️  ATTENTION: Cette opération va remplacer le site actuel${NC}"
        echo -e "${YELLOW}   Site: $SITE_URL${NC}"
        echo -e "${YELLOW}   Backup: $backup_name${NC}"
        echo
        read -p "Êtes-vous sûr de vouloir continuer ? (oui/non): " confirm
        
        if [[ "$confirm" != "oui" ]]; then
            log_info "Rollback annulé par l'utilisateur"
            return 1
        fi
    fi
    
    # Créer un backup du site actuel avant rollback
    local current_backup="backup_before_rollback_$(date +%Y%m%d_%H%M%S)"
    log_step "Création d'un backup de sécurité: $current_backup"
    
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        if [[ -d '$(basename "$REMOTE_PATH")' ]]; then
            cp -r '$(basename "$REMOTE_PATH")' '$current_backup'
            echo 'Backup de sécurité créé: $current_backup'
        fi
    "
    
    # Effectuer le rollback
    log_step "Restauration du backup..."
    
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        
        # Supprimer le site actuel
        if [[ -d '$(basename "$REMOTE_PATH")' ]]; then
            rm -rf '$(basename "$REMOTE_PATH")'
        fi
        
        # Restaurer le backup
        if [[ -d '$backup_name' ]]; then
            cp -r '$backup_name' '$(basename "$REMOTE_PATH")'
            echo 'Rollback effectué avec succès'
        else
            echo 'Erreur: Backup non trouvé'
            exit 1
        fi
    "
    
    if [[ $? -eq 0 ]]; then
        log_success "Rollback effectué avec succès"
        log_info "Backup de sécurité disponible: $current_backup"
        return 0
    else
        log_error "Échec du rollback"
        return 1
    fi
}

# Vérifier le rollback
verify_rollback() {
    log_step "Vérification post-rollback..."
    
    # Test de base
    if command -v curl &> /dev/null; then
        local http_status=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL" --connect-timeout 10 --max-time 30)
        if [[ "$http_status" == "200" ]]; then
            log_success "Site accessible après rollback (HTTP $http_status)"
        else
            log_warning "Site retourne HTTP $http_status après rollback"
        fi
    fi
    
    # Vérifier la présence de fichiers essentiels
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$REMOTE_PATH'
        if [[ -f 'index.html' ]]; then
            echo '✅ index.html présent'
        else
            echo '❌ index.html manquant'
        fi
        
        file_count=\$(find . -name '*.html' | wc -l)
        echo \"📄 Fichiers HTML restaurés: \$file_count\"
    "
}

# Affichage de l'aide
show_help() {
    cat << EOF
🔄 Script de rollback GLP-1 France

USAGE:
    $0 [OPTIONS] [BACKUP_NUMBER|BACKUP_NAME]

OPTIONS:
    --list              Lister les backups disponibles
    --latest            Utiliser le backup le plus récent
    --force             Forcer le rollback sans confirmation
    --help, -h          Afficher cette aide

ARGUMENTS:
    BACKUP_NUMBER       Numéro du backup à restaurer (de la liste)
    BACKUP_NAME         Nom complet du backup à restaurer

EXEMPLES:
    $0 --list                    # Lister les backups
    $0 --latest                  # Rollback vers le plus récent
    $0 1                         # Rollback vers le backup #1
    $0 backup_20240809_143022    # Rollback vers un backup spécifique
    $0 --force --latest          # Rollback automatique sans confirmation

VARIABLES D'ENVIRONNEMENT:
    Créez un fichier .env.production pour personnaliser la configuration SSH.

SÉCURITÉ:
    Un backup du site actuel est automatiquement créé avant chaque rollback.
EOF
}

# Fonction principale
main() {
    local list_only=""
    local use_latest=""
    local backup_selection=""
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --list)
                list_only="true"
                shift
                ;;
            --latest)
                use_latest="true"
                shift
                ;;
            --force)
                export FORCE_ROLLBACK="true"
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            -*)
                log_error "Option inconnue: $1"
                show_help
                exit 1
                ;;
            *)
                backup_selection="$1"
                shift
                ;;
        esac
    done
    
    # Header
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║                🔄 ROLLBACK GLP-1 FRANCE                   ║
    ║                                                           ║
    ║  Restauration d'une version précédente du site           ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Chargement de la configuration
    load_env
    
    # Test de connexion
    test_ssh_connection || exit 1
    
    # Lister les backups
    if ! list_backups; then
        exit 1
    fi
    
    # Si on veut juste lister, on s'arrête là
    if [[ "$list_only" == "true" ]]; then
        exit 0
    fi
    
    # Sélection du backup
    local selected_backup=""
    if [[ "$use_latest" == "true" ]]; then
        selected_backup=$(select_backup "latest")
    elif [[ -n "$backup_selection" ]]; then
        selected_backup=$(select_backup "$backup_selection")
    else
        selected_backup=$(select_backup)
    fi
    
    if [[ -z "$selected_backup" ]]; then
        exit 1
    fi
    
    # Effectuer le rollback
    if perform_rollback "$selected_backup"; then
        verify_rollback
        
        echo
        echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║           ROLLBACK TERMINÉ              ║${NC}"
        echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
        echo
        echo -e "${GREEN}✅ Rollback effectué avec succès${NC}"
        echo -e "${BLUE}🌐 Site: $SITE_URL${NC}"
        echo -e "${BLUE}📁 Backup restauré: $(basename "$selected_backup")${NC}"
        echo -e "${BLUE}📅 Date: $(date)${NC}"
        echo
        echo -e "${YELLOW}Prochaines étapes:${NC}"
        echo "1. Vérifiez manuellement le site: $SITE_URL"
        echo "2. Testez les fonctionnalités principales"
        echo "3. Identifiez la cause du problème initial"
        echo "4. Effectuez un nouveau déploiement après correction"
        echo
    else
        echo
        log_error "Échec du rollback"
        echo "Vérifiez les logs et l'état du serveur"
        exit 1
    fi
}

# Point d'entrée
main "$@"
