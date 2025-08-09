#!/bin/bash

# 🚀 Script de configuration initiale GLP-1 France

set -euo pipefail

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
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

log_question() {
    echo -e "${CYAN}❓ $1${NC}"
}

# Vérifier les prérequis système
check_prerequisites() {
    log_step "Vérification des prérequis système..."
    
    local missing_tools=()
    
    # Outils essentiels
    if ! command -v git &> /dev/null; then
        missing_tools+=("git")
    fi
    
    if ! command -v node &> /dev/null; then
        missing_tools+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_tools+=("npm")
    fi
    
    if ! command -v ssh &> /dev/null; then
        missing_tools+=("ssh")
    fi
    
    if ! command -v rsync &> /dev/null; then
        missing_tools+=("rsync")
    fi
    
    if ! command -v curl &> /dev/null; then
        missing_tools+=("curl")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        log_error "Outils manquants: ${missing_tools[*]}"
        echo
        echo "Veuillez installer les outils manquants :"
        echo "- Git: https://git-scm.com/"
        echo "- Node.js: https://nodejs.org/"
        echo "- SSH client (généralement installé par défaut)"
        echo "- rsync (généralement installé par défaut sur Linux/Mac)"
        echo "- curl (généralement installé par défaut)"
        echo
        return 1
    fi
    
    log_success "Tous les prérequis sont installés"
    
    # Afficher les versions
    log_info "Versions détectées:"
    echo "  - Git: $(git --version | head -1)"
    echo "  - Node.js: $(node --version)"
    echo "  - npm: $(npm --version)"
    echo
}

# Configuration des clés SSH
setup_ssh_keys() {
    log_step "Configuration des clés SSH..."
    
    local ssh_key_path="$HOME/.ssh/id_rsa_glp1"
    
    if [[ -f "$ssh_key_path" ]]; then
        log_info "Clé SSH GLP-1 existe déjà: $ssh_key_path"
        
        log_question "Voulez-vous en créer une nouvelle ? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            rm -f "$ssh_key_path" "$ssh_key_path.pub"
        else
            log_info "Utilisation de la clé existante"
            return 0
        fi
    fi
    
    log_question "Email pour la clé SSH (laissez vide pour utiliser une valeur par défaut) :"
    read -r ssh_email
    if [[ -z "$ssh_email" ]]; then
        ssh_email="deploy@glp1-france.fr"
    fi
    
    log_info "Génération de la clé SSH..."
    ssh-keygen -t rsa -b 4096 -C "$ssh_email" -f "$ssh_key_path" -N ""
    
    log_success "Clé SSH générée: $ssh_key_path"
    
    # Afficher la clé publique
    echo
    log_info "Clé publique à ajouter à Hostinger :"
    echo "=================================="
    cat "$ssh_key_path.pub"
    echo "=================================="
    echo
    
    log_warning "IMPORTANT: Copiez cette clé publique et ajoutez-la dans votre panel Hostinger"
    log_info "Suivez le guide: GUIDE_CONFIGURATION_SSH.md"
    echo
    
    log_question "Appuyez sur Entrée quand vous avez configuré la clé sur Hostinger..."
    read -r
}

# Configuration du fichier .env.production
setup_env_file() {
    log_step "Configuration du fichier .env.production..."
    
    if [[ -f ".env.production" ]]; then
        log_warning "Le fichier .env.production existe déjà"
        log_question "Voulez-vous le reconfigurer ? (y/N)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            log_info "Conservation du fichier existant"
            return 0
        fi
    fi
    
    echo
    log_info "Configuration des paramètres de déploiement..."
    echo
    
    # SSH
    log_question "Nom d'utilisateur SSH Hostinger (défaut: u403023291) :"
    read -r ssh_user
    ssh_user="${ssh_user:-u403023291}"
    
    log_question "Adresse IP Hostinger (défaut: 147.79.98.140) :"
    read -r ssh_host
    ssh_host="${ssh_host:-147.79.98.140}"
    
    log_question "Port SSH Hostinger (défaut: 65002) :"
    read -r ssh_port
    ssh_port="${ssh_port:-65002}"
    
    # Chemin distant
    log_question "Chemin distant (défaut: /home/u403023291/domains/glp1-france.fr/public_html) :"
    read -r remote_path
    remote_path="${remote_path:-/home/u403023291/domains/glp1-france.fr/public_html}"
    
    # URL du site
    log_question "URL du site (défaut: https://glp1-france.fr) :"
    read -r site_url
    site_url="${site_url:-https://glp1-france.fr}"
    
    # Options de déploiement
    log_question "Créer des backups automatiques ? (Y/n) :"
    read -r auto_backup
    if [[ "$auto_backup" =~ ^[Nn]$ ]]; then
        auto_backup="false"
    else
        auto_backup="true"
    fi
    
    log_question "Nombre de backups à conserver (défaut: 5) :"
    read -r backup_keep
    backup_keep="${backup_keep:-5}"
    
    # Email pour les alertes (optionnel)
    log_question "Email pour les alertes (optionnel, laissez vide pour désactiver) :"
    read -r alert_email
    
    # Clé SSH
    local ssh_key_path="$HOME/.ssh/id_rsa_glp1"
    
    # Créer le fichier .env.production
    cat > ".env.production" << EOF
# Configuration de déploiement GLP-1 France
# Généré le $(date)

# Configuration SSH
SSH_USER="$ssh_user"
SSH_HOST="$ssh_host"
SSH_PORT="$ssh_port"
SSH_KEY_PATH="$ssh_key_path"

# Chemins
REMOTE_PATH="$remote_path"
LOCAL_BUILD_DIR="dist"

# Site
SITE_URL="$site_url"

# Options de déploiement
AUTO_BACKUP="$auto_backup"
BACKUP_KEEP="$backup_keep"
BACKUP_KEEP_DAYS="7"

# Optimisations rsync
RSYNC_COMPRESS="true"
RSYNC_DELETE="true"
RSYNC_VERBOSE="false"

# Vérifications
VERIFY_DEPLOYMENT="true"
CHECK_SSL="true"
CHECK_PERFORMANCE="true"

# Alertes
ALERT_EMAIL="$alert_email"
ALERT_WEBHOOK=""

# Logs
LOG_KEEP_DAYS="30"
LOG_LEVEL="INFO"

# Sécurité
STRICT_HOST_KEY_CHECKING="yes"
CONNECTION_TIMEOUT="30"
EOF
    
    log_success "Fichier .env.production créé"
    
    # Sécuriser le fichier
    chmod 600 ".env.production"
    log_info "Permissions sécurisées appliquées au fichier"
}

# Test de la connexion SSH
test_ssh_connection() {
    log_step "Test de la connexion SSH..."
    
    if [[ ! -f ".env.production" ]]; then
        log_error "Fichier .env.production non trouvé. Exécutez d'abord la configuration."
        return 1
    fi
    
    # Charger la configuration
    set -a
    source .env.production
    set +a
    
    log_info "Test de connexion vers $SSH_USER@$SSH_HOST:$SSH_PORT..."
    
    if ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'Connexion SSH réussie'" 2>/dev/null; then
        log_success "Connexion SSH fonctionnelle"
        
        # Tester l'accès au répertoire de déploiement
        if ssh -i "$SSH_KEY_PATH" -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "test -d '$REMOTE_PATH' && echo 'Répertoire accessible'" 2>/dev/null | grep -q "accessible"; then
            log_success "Répertoire de déploiement accessible"
        else
            log_warning "Répertoire de déploiement non accessible ou inexistant: $REMOTE_PATH"
        fi
    else
        log_error "Connexion SSH échouée"
        echo
        echo "Vérifiez :"
        echo "1. La clé SSH est bien ajoutée sur Hostinger"
        echo "2. Les paramètres de connexion sont corrects"
        echo "3. Votre connexion internet"
        echo
        return 1
    fi
}

# Installation des dépendances Node.js
install_dependencies() {
    log_step "Installation des dépendances Node.js..."
    
    if [[ ! -f "package.json" ]]; then
        log_error "package.json non trouvé"
        return 1
    fi
    
    log_info "Installation via npm..."
    npm install
    
    log_success "Dépendances installées"
}

# Configuration des hooks Git
setup_git_hooks() {
    log_step "Configuration des hooks Git..."
    
    if [[ ! -d ".git" ]]; then
        log_warning "Pas de dépôt Git détecté, hooks non configurés"
        return 0
    fi
    
    if [[ -f "scripts/install-git-hooks.sh" ]]; then
        log_info "Installation des hooks Git..."
        bash scripts/install-git-hooks.sh
    else
        log_warning "Script d'installation des hooks non trouvé"
    fi
}

# Test de build
test_build() {
    log_step "Test de build du projet..."
    
    log_info "Construction du projet..."
    if npm run build; then
        log_success "Build réussi"
        
        # Vérifier que le dossier dist existe et contient des fichiers
        if [[ -d "dist" ]] && [[ -n "$(ls -A dist)" ]]; then
            local file_count=$(find dist -type f | wc -l)
            log_info "Build généré: $file_count fichiers dans dist/"
        else
            log_warning "Le dossier dist est vide ou inexistant"
        fi
    else
        log_error "Échec du build"
        return 1
    fi
}

# Résumé de la configuration
show_summary() {
    echo
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║        CONFIGURATION TERMINÉE          ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo
    
    log_info "Configuration complétée avec succès !"
    echo
    
    echo -e "${YELLOW}Prochaines étapes :${NC}"
    echo
    echo "1. 🔍 Tester le déploiement :"
    echo "   npm run deploy:dry"
    echo
    echo "2. 🚀 Premier déploiement :"
    echo "   npm run deploy"
    echo
    echo "3. 📊 Vérifier le site :"
    echo "   npm run deploy:check"
    echo
    echo "4. 📋 Monitoring :"
    echo "   npm run monitoring:check"
    echo
    
    echo -e "${CYAN}Scripts disponibles :${NC}"
    echo "   npm run deploy          - Déploiement complet"
    echo "   npm run deploy:quick    - Déploiement rapide"
    echo "   npm run deploy:dry      - Test de déploiement"
    echo "   npm run deploy:check    - Vérification du site"
    echo "   npm run deploy:rollback - Retour en arrière"
    echo "   npm run maintenance:*   - Scripts de maintenance"
    echo "   npm run monitoring:*    - Scripts de monitoring"
    echo
    
    echo -e "${BLUE}📚 Documentation :${NC}"
    echo "   - GUIDE_CONFIGURATION_SSH.md - Configuration SSH"
    echo "   - GUIDE_DEPLOYMENT.md        - Guide de déploiement"
    echo "   - README.md                  - Documentation générale"
    echo
}

# Affichage de l'aide
show_help() {
    cat << EOF
🚀 Script de configuration initiale GLP-1 France

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --skip-ssh          Ignorer la configuration SSH
    --skip-deps         Ignorer l'installation des dépendances
    --skip-test         Ignorer les tests
    --auto              Mode automatique (utilise les valeurs par défaut)
    --help, -h          Afficher cette aide

EXEMPLES:
    $0                  # Configuration complète interactive
    $0 --auto           # Configuration automatique
    $0 --skip-ssh       # Configuration sans SSH

Ce script configure :
- Vérification des prérequis système
- Génération des clés SSH
- Configuration du fichier .env.production
- Test de la connexion SSH
- Installation des dépendances
- Configuration des hooks Git
- Test de build du projet
EOF
}

# Fonction principale
main() {
    local skip_ssh=""
    local skip_deps=""
    local skip_test=""
    local auto_mode=""
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-ssh)
                skip_ssh="true"
                shift
                ;;
            --skip-deps)
                skip_deps="true"
                shift
                ;;
            --skip-test)
                skip_test="true"
                shift
                ;;
            --auto)
                auto_mode="true"
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
    ║           🚀 CONFIGURATION INITIALE GLP-1                ║
    ║                                                           ║
    ║  Configuration automatisée du système de déploiement     ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    if [[ "$auto_mode" == "true" ]]; then
        log_info "Mode automatique activé - utilisation des valeurs par défaut"
    fi
    
    echo
    log_info "Début de la configuration initiale..."
    echo
    
    # Étapes de configuration
    check_prerequisites
    echo
    
    if [[ "$skip_deps" != "true" ]]; then
        install_dependencies
        echo
    fi
    
    if [[ "$skip_ssh" != "true" ]]; then
        if [[ "$auto_mode" != "true" ]]; then
            setup_ssh_keys
            echo
        fi
        
        setup_env_file
        echo
        
        if [[ "$auto_mode" != "true" ]]; then
            test_ssh_connection
            echo
        fi
    fi
    
    setup_git_hooks
    echo
    
    if [[ "$skip_test" != "true" ]]; then
        test_build
        echo
    fi
    
    show_summary
}

# Point d'entrée
main "$@"
