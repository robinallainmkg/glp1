#!/bin/bash

# 🧹 Script de nettoyage et maintenance GLP-1 France

set -euo pipefail

# Configuration
SSH_USER="${SSH_USER:-u403023291}"
SSH_HOST="${SSH_HOST:-147.79.98.140}"
SSH_PORT="${SSH_PORT:-65002}"
REMOTE_PATH="${REMOTE_PATH:-/home/u403023291/domains/glp1-france.fr/public_html}"
BACKUP_KEEP_DAYS="${BACKUP_KEEP_DAYS:-7}"
LOG_KEEP_DAYS="${LOG_KEEP_DAYS:-30}"

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
        set -a
        source .env.production
        set +a
    fi
}

# Nettoyage local
cleanup_local() {
    log_step "Nettoyage des fichiers locaux..."
    
    # Supprimer les builds
    if [[ -d "dist" ]]; then
        rm -rf dist
        log_info "Dossier dist supprimé"
    fi
    
    if [[ -d ".astro" ]]; then
        rm -rf .astro
        log_info "Cache Astro supprimé"
    fi
    
    # Nettoyer les logs de déploiement anciens
    if ls deploy_*.log 1> /dev/null 2>&1; then
        find . -name "deploy_*.log" -mtime +$LOG_KEEP_DAYS -delete 2>/dev/null || true
        local remaining_logs=$(ls deploy_*.log 2>/dev/null | wc -l)
        log_info "Logs de déploiement nettoyés (${remaining_logs} restants)"
    fi
    
    # Nettoyer les fichiers temporaires
    if ls build_test.log 1> /dev/null 2>&1; then
        rm -f build_test.log
        log_info "Logs de test supprimés"
    fi
    
    # Nettoyer les fichiers de sauvegarde d'éditeur
    find . -name "*~" -delete 2>/dev/null || true
    find . -name "*.bak" -delete 2>/dev/null || true
    find . -name ".DS_Store" -delete 2>/dev/null || true
    find . -name "Thumbs.db" -delete 2>/dev/null || true
    
    log_success "Nettoyage local terminé"
}

# Nettoyage distant
cleanup_remote() {
    log_step "Nettoyage des fichiers distants..."
    
    # Test de connexion SSH
    if ! ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        log_error "Impossible de se connecter au serveur distant"
        return 1
    fi
    
    # Nettoyage des anciens backups
    log_info "Nettoyage des anciens backups (>$BACKUP_KEEP_DAYS jours)..."
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$(dirname "$REMOTE_PATH")'
        
        # Compter les backups avant nettoyage
        backup_count_before=\$(find . -maxdepth 1 -type d -name 'backup_*' | wc -l)
        
        # Supprimer les anciens backups
        find . -maxdepth 1 -type d -name 'backup_*' -mtime +$BACKUP_KEEP_DAYS -exec rm -rf {} + 2>/dev/null || true
        
        # Compter les backups après nettoyage
        backup_count_after=\$(find . -maxdepth 1 -type d -name 'backup_*' | wc -l)
        
        echo \"Backups supprimés: \$((backup_count_before - backup_count_after))\"
        echo \"Backups restants: \$backup_count_after\"
        
        # Lister les backups restants
        if [[ \$backup_count_after -gt 0 ]]; then
            echo \"Backups conservés:\"
            find . -maxdepth 1 -type d -name 'backup_*' | sort -r | head -5
        fi
    "
    
    # Nettoyage des logs distants (si applicable)
    log_info "Nettoyage des logs distants..."
    ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
        cd '$REMOTE_PATH'
        
        # Nettoyer les logs d'erreur de PHP/Apache si présents
        find . -name 'error.log' -size +10M -exec truncate -s 0 {} + 2>/dev/null || true
        find . -name 'access.log' -size +50M -exec truncate -s 0 {} + 2>/dev/null || true
        
        # Nettoyer les fichiers temporaires
        find . -name 'tmp_*' -mtime +1 -delete 2>/dev/null || true
        find . -name '*.tmp' -mtime +1 -delete 2>/dev/null || true
        
        echo \"Nettoyage des logs distants terminé\"
    "
    
    log_success "Nettoyage distant terminé"
}

# Optimisation des images (si outils disponibles)
optimize_images() {
    log_step "Optimisation des images..."
    
    if command -v optipng &> /dev/null; then
        find public/images -name "*.png" -exec optipng -quiet {} \; 2>/dev/null || true
        log_info "Images PNG optimisées"
    else
        log_warning "optipng non disponible pour l'optimisation PNG"
    fi
    
    if command -v jpegoptim &> /dev/null; then
        find public/images -name "*.jpg" -o -name "*.jpeg" -exec jpegoptim --quiet {} \; 2>/dev/null || true
        log_info "Images JPEG optimisées"
    else
        log_warning "jpegoptim non disponible pour l'optimisation JPEG"
    fi
    
    log_success "Optimisation des images terminée"
}

# Vérification de l'intégrité des données
check_data_integrity() {
    log_step "Vérification de l'intégrité des données..."
    
    # Vérifier la base de données des articles
    if [[ -f "data/articles-database.json" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('data/articles-database.json', 'utf8'))" 2>/dev/null; then
            log_success "Base de données articles valide"
        else
            log_error "Base de données articles corrompue"
            return 1
        fi
    fi
    
    # Vérifier les collections
    if [[ -f "data/collections.json" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('data/collections.json', 'utf8'))" 2>/dev/null; then
            log_success "Fichier collections valide"
        else
            log_error "Fichier collections corrompu"
            return 1
        fi
    fi
    
    # Vérifier la configuration du projet
    if [[ -f "package.json" ]]; then
        if node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" 2>/dev/null; then
            log_success "package.json valide"
        else
            log_error "package.json corrompu"
            return 1
        fi
    fi
    
    log_success "Vérification de l'intégrité terminée"
}

# Statistiques de maintenance
show_stats() {
    log_step "Statistiques de maintenance..."
    
    # Taille du projet
    if command -v du &> /dev/null; then
        local project_size=$(du -sh . 2>/dev/null | cut -f1 || echo "N/A")
        log_info "Taille du projet: $project_size"
    fi
    
    # Nombre de fichiers
    local file_count=$(find . -type f | wc -l)
    log_info "Nombre de fichiers: $file_count"
    
    # Node modules
    if [[ -d "node_modules" ]]; then
        local nm_size=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "N/A")
        log_info "Taille node_modules: $nm_size"
    fi
    
    # Articles
    if [[ -f "data/articles-database.json" ]]; then
        local article_count=$(node -e "
            const db = JSON.parse(require('fs').readFileSync('data/articles-database.json', 'utf8'));
            console.log(db.totalArticles || db.allArticles?.length || 0);
        " 2>/dev/null || echo "0")
        log_info "Nombre d'articles: $article_count"
    fi
    
    # Git
    if [[ -d ".git" ]]; then
        local git_size=$(du -sh .git 2>/dev/null | cut -f1 || echo "N/A")
        log_info "Taille dépôt Git: $git_size"
        
        local branch=$(git branch --show-current 2>/dev/null || echo "unknown")
        log_info "Branche actuelle: $branch"
    fi
}

# Backup des configurations importantes
backup_config() {
    log_step "Backup des configurations..."
    
    local backup_dir="config_backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Sauvegarder les fichiers de configuration
    local config_files=(
        ".env.production"
        "package.json"
        "astro.config.mjs"
        "data/collections.json"
        "netlify.toml"
        "vercel.json"
    )
    
    for file in "${config_files[@]}"; do
        if [[ -f "$file" ]]; then
            cp "$file" "$backup_dir/"
            log_info "Sauvegardé: $file"
        fi
    done
    
    # Compresser le backup
    if command -v tar &> /dev/null; then
        tar -czf "${backup_dir}.tar.gz" "$backup_dir" && rm -rf "$backup_dir"
        log_success "Backup créé: ${backup_dir}.tar.gz"
    else
        log_success "Backup créé dans: $backup_dir"
    fi
}

# Affichage de l'aide
show_help() {
    cat << EOF
🧹 Script de nettoyage et maintenance GLP-1 France

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --local-only        Nettoyage local seulement (pas de connexion distante)
    --remote-only       Nettoyage distant seulement
    --with-images       Inclure l'optimisation des images
    --with-backup       Créer un backup des configurations
    --stats-only        Afficher seulement les statistiques
    --help, -h          Afficher cette aide

EXEMPLES:
    $0                      # Nettoyage complet local et distant
    $0 --local-only         # Nettoyage local seulement
    $0 --with-images        # Nettoyage + optimisation images
    $0 --stats-only         # Afficher les statistiques seulement

VARIABLES D'ENVIRONNEMENT:
    Configurez .env.production pour personnaliser les paramètres.
EOF
}

# Fonction principale
main() {
    local local_only=""
    local remote_only=""
    local with_images=""
    local with_backup=""
    local stats_only=""
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --local-only)
                local_only="true"
                shift
                ;;
            --remote-only)
                remote_only="true"
                shift
                ;;
            --with-images)
                with_images="true"
                shift
                ;;
            --with-backup)
                with_backup="true"
                shift
                ;;
            --stats-only)
                stats_only="true"
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
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║               🧹 MAINTENANCE GLP-1 FRANCE                 ║
    ║                                                           ║
    ║  Nettoyage et optimisation du projet                     ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Chargement de la configuration
    load_env
    
    # Statistiques seulement
    if [[ "$stats_only" == "true" ]]; then
        show_stats
        exit 0
    fi
    
    log_info "Début de la maintenance"
    echo
    
    # Backup des configurations si demandé
    if [[ "$with_backup" == "true" ]]; then
        backup_config
        echo
    fi
    
    # Vérification de l'intégrité
    check_data_integrity
    echo
    
    # Nettoyage local
    if [[ "$remote_only" != "true" ]]; then
        cleanup_local
        echo
    fi
    
    # Optimisation des images
    if [[ "$with_images" == "true" ]]; then
        optimize_images
        echo
    fi
    
    # Nettoyage distant
    if [[ "$local_only" != "true" ]]; then
        cleanup_remote
        echo
    fi
    
    # Statistiques finales
    show_stats
    
    echo
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           MAINTENANCE TERMINÉE         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}✅ Maintenance terminée avec succès${NC}"
    echo -e "${BLUE}📅 Date: $(date)${NC}"
    echo
    echo -e "${YELLOW}Prochaines étapes recommandées:${NC}"
    echo "1. Tester le build: npm run build"
    echo "2. Vérifier en local: npm run preview"
    echo "3. Déployer si nécessaire: npm run deploy"
    echo
}

# Point d'entrée
main "$@"
