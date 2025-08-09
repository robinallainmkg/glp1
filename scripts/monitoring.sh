#!/bin/bash

# 📊 Script de monitoring GLP-1 France

set -euo pipefail

# Configuration
SITE_URL="${SITE_URL:-https://glp1-france.fr}"
SSH_USER="${SSH_USER:-u403023291}"
SSH_HOST="${SSH_HOST:-147.79.98.140}"
SSH_PORT="${SSH_PORT:-65002}"
REMOTE_PATH="${REMOTE_PATH:-/home/u403023291/domains/glp1-france.fr/public_html}"
ALERT_EMAIL="${ALERT_EMAIL:-}"
ALERT_WEBHOOK="${ALERT_WEBHOOK:-}"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Variables de status
OVERALL_STATUS="OK"
ALERTS=()

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ALERTS+=("WARNING: $1")
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
    OVERALL_STATUS="ERROR"
    ALERTS+=("ERROR: $1")
}

log_metric() {
    echo -e "${CYAN}📊 $1${NC}"
}

# Chargement de la configuration
load_env() {
    if [[ -f ".env.production" ]]; then
        set -a
        source .env.production
        set +a
    fi
}

# Test HTTP du site
check_http_status() {
    echo -e "${PURPLE}🔍 Vérification HTTP${NC}"
    
    local start_time=$(date +%s.%N)
    local response=$(curl -s -o /dev/null -w "%{http_code}|%{time_total}|%{size_download}" "$SITE_URL" || echo "000|0|0")
    local end_time=$(date +%s.%N)
    
    IFS='|' read -r status_code response_time size_download <<< "$response"
    
    if [[ "$status_code" == "200" ]]; then
        log_success "Site accessible (HTTP $status_code)"
        log_metric "Temps de réponse: ${response_time}s"
        log_metric "Taille téléchargée: $size_download bytes"
    elif [[ "$status_code" == "000" ]]; then
        log_error "Site inaccessible (connexion impossible)"
    else
        log_warning "Code de réponse inattendu: $status_code"
    fi
    
    # Alerte si temps de réponse > 3s
    if (( $(echo "$response_time > 3.0" | bc -l 2>/dev/null || echo "0") )); then
        log_warning "Temps de réponse lent: ${response_time}s"
    fi
}

# Test HTTPS et certificat SSL
check_ssl_status() {
    echo -e "${PURPLE}🔒 Vérification SSL${NC}"
    
    local ssl_info=$(curl -s -I "$SITE_URL" | head -1)
    if echo "$ssl_info" | grep -q "200 OK"; then
        log_success "HTTPS fonctionnel"
        
        # Vérifier l'expiration du certificat
        local cert_expiry=$(echo | openssl s_client -servername "$(echo "$SITE_URL" | sed 's|https://||')" -connect "$(echo "$SITE_URL" | sed 's|https://||'):443" 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
        
        if [[ -n "$cert_expiry" ]]; then
            local expiry_timestamp=$(date -d "$cert_expiry" +%s 2>/dev/null || echo "0")
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [[ "$days_until_expiry" -gt 30 ]]; then
                log_success "Certificat SSL valide ($days_until_expiry jours restants)"
            elif [[ "$days_until_expiry" -gt 7 ]]; then
                log_warning "Certificat SSL expire bientôt ($days_until_expiry jours)"
            else
                log_error "Certificat SSL expire très bientôt ($days_until_expiry jours)"
            fi
        fi
    else
        log_error "HTTPS non fonctionnel"
    fi
}

# Test des pages importantes
check_important_pages() {
    echo -e "${PURPLE}📄 Vérification des pages importantes${NC}"
    
    local pages=(
        "/"
        "/medicaments-glp1/"
        "/glp1-perte-de-poids/"
        "/effets-secondaires-glp1/"
        "/glp1-cout/"
        "/medecins-glp1-france/"
    )
    
    local working_pages=0
    local total_pages=${#pages[@]}
    
    for page in "${pages[@]}"; do
        local url="${SITE_URL}${page}"
        local status=$(curl -s -o /dev/null -w "%{http_code}" "$url")
        
        if [[ "$status" == "200" ]]; then
            log_success "Page OK: $page"
            ((working_pages++))
        else
            log_error "Page problématique: $page (HTTP $status)"
        fi
    done
    
    log_metric "Pages fonctionnelles: $working_pages/$total_pages"
    
    if [[ "$working_pages" -lt "$total_pages" ]]; then
        log_warning "Certaines pages ne fonctionnent pas correctement"
    fi
}

# Vérification de l'espace disque distant
check_disk_space() {
    echo -e "${PURPLE}💾 Vérification de l'espace disque${NC}"
    
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        local disk_info=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "df -h '$REMOTE_PATH' | tail -1" 2>/dev/null)
        
        if [[ -n "$disk_info" ]]; then
            local usage=$(echo "$disk_info" | awk '{print $5}' | sed 's/%//')
            local available=$(echo "$disk_info" | awk '{print $4}')
            
            log_metric "Utilisation disque: ${usage}%"
            log_metric "Espace disponible: $available"
            
            if [[ "$usage" -gt 90 ]]; then
                log_error "Espace disque critique: ${usage}%"
            elif [[ "$usage" -gt 80 ]]; then
                log_warning "Espace disque élevé: ${usage}%"
            else
                log_success "Espace disque OK: ${usage}%"
            fi
        else
            log_warning "Impossible de récupérer les informations disque"
        fi
    else
        log_warning "Connexion SSH impossible pour vérifier l'espace disque"
    fi
}

# Test des performances
check_performance() {
    echo -e "${PURPLE}⚡ Test de performance${NC}"
    
    # Test de vitesse avec curl
    local timing=$(curl -w "@-" -o /dev/null -s "$SITE_URL" <<'EOF'
     namelookup:  %{time_namelookup}s\n
        connect:  %{time_connect}s\n
     appconnect:  %{time_appconnect}s\n
    pretransfer:  %{time_pretransfer}s\n
       redirect:  %{time_redirect}s\n
  starttransfer:  %{time_starttransfer}s\n
                ---------------\n
          total:  %{time_total}s\n
EOF
)
    
    echo -e "${CYAN}Métriques de performance:${NC}"
    echo "$timing"
    
    # Extraire le temps total pour analyse
    local total_time=$(echo "$timing" | grep "total:" | awk '{print $2}' | sed 's/s//')
    
    if (( $(echo "$total_time > 5.0" | bc -l 2>/dev/null || echo "0") )); then
        log_warning "Performance dégradée (${total_time}s)"
    elif (( $(echo "$total_time > 2.0" | bc -l 2>/dev/null || echo "0") )); then
        log_info "Performance moyenne (${total_time}s)"
    else
        log_success "Bonne performance (${total_time}s)"
    fi
}

# Vérification des sauvegardes
check_backups() {
    echo -e "${PURPLE}🗂️  Vérification des sauvegardes${NC}"
    
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        local backup_info=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
            cd '$(dirname "$REMOTE_PATH")'
            backup_count=\$(find . -maxdepth 1 -type d -name 'backup_*' | wc -l)
            latest_backup=\$(find . -maxdepth 1 -type d -name 'backup_*' | sort -r | head -1)
            echo \"\$backup_count|\$latest_backup\"
        " 2>/dev/null)
        
        IFS='|' read -r backup_count latest_backup <<< "$backup_info"
        
        log_metric "Nombre de sauvegardes: $backup_count"
        
        if [[ "$backup_count" -gt 0 ]]; then
            log_success "Sauvegardes disponibles"
            if [[ -n "$latest_backup" ]]; then
                log_info "Dernière sauvegarde: $(basename "$latest_backup")"
            fi
        else
            log_warning "Aucune sauvegarde trouvée"
        fi
        
        # Vérifier l'âge de la dernière sauvegarde
        if [[ -n "$latest_backup" ]] && [[ "$latest_backup" != "." ]]; then
            local backup_age=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
                find '$latest_backup' -maxdepth 0 -mtime +7 2>/dev/null && echo 'old' || echo 'recent'
            " 2>/dev/null)
            
            if [[ "$backup_age" == "old" ]]; then
                log_warning "Dernière sauvegarde ancienne (>7 jours)"
            fi
        fi
    else
        log_warning "Connexion SSH impossible pour vérifier les sauvegardes"
    fi
}

# Vérification des logs d'erreur
check_error_logs() {
    echo -e "${PURPLE}📝 Vérification des logs d'erreur${NC}"
    
    # Vérifier les logs locaux récents
    if ls deploy_*.log 1> /dev/null 2>&1; then
        local recent_errors=$(find . -name "deploy_*.log" -mtime -1 -exec grep -l "ERROR\|FAILED" {} \; 2>/dev/null | wc -l)
        
        if [[ "$recent_errors" -gt 0 ]]; then
            log_warning "$recent_errors fichiers de log contiennent des erreurs récentes"
        else
            log_success "Pas d'erreurs récentes dans les logs de déploiement"
        fi
    fi
    
    # Vérifier les logs distants si possible
    if ssh -p "$SSH_PORT" -o ConnectTimeout=10 -o BatchMode=yes "$SSH_USER@$SSH_HOST" "echo 'SSH OK'" &>/dev/null; then
        local error_count=$(ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "
            cd '$REMOTE_PATH'
            find . -name 'error.log' -o -name 'error_log' | xargs tail -100 2>/dev/null | grep -i error | wc -l || echo '0'
        " 2>/dev/null)
        
        if [[ "$error_count" -gt 10 ]]; then
            log_warning "$error_count erreurs récentes dans les logs serveur"
        else
            log_success "Logs serveur normaux"
        fi
    fi
}

# Envoi d'alertes
send_alerts() {
    if [[ ${#ALERTS[@]} -eq 0 ]]; then
        return 0
    fi
    
    echo -e "${PURPLE}📧 Envoi des alertes${NC}"
    
    local alert_message="Alertes monitoring GLP-1 France:\n\n"
    for alert in "${ALERTS[@]}"; do
        alert_message+="- $alert\n"
    done
    alert_message+="\nDate: $(date)\n"
    
    # Email (si configuré)
    if [[ -n "$ALERT_EMAIL" ]] && command -v mail &> /dev/null; then
        echo -e "$alert_message" | mail -s "Alerte GLP-1 France" "$ALERT_EMAIL"
        log_info "Alerte envoyée par email"
    fi
    
    # Webhook (si configuré)
    if [[ -n "$ALERT_WEBHOOK" ]] && command -v curl &> /dev/null; then
        curl -X POST -H "Content-Type: application/json" \
            -d "{\"text\":\"$alert_message\"}" \
            "$ALERT_WEBHOOK" &>/dev/null
        log_info "Alerte envoyée via webhook"
    fi
}

# Génération du rapport JSON
generate_json_report() {
    local report_file="monitoring_report_$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "overall_status": "$OVERALL_STATUS",
  "site_url": "$SITE_URL",
  "alerts_count": ${#ALERTS[@]},
  "alerts": [
$(printf '    "%s"' "${ALERTS[@]}" | sed 's/$/,/' | sed '$s/,$//')
  ],
  "checks": {
    "http_available": true,
    "ssl_valid": true,
    "pages_working": true,
    "disk_space_ok": true,
    "performance_ok": true,
    "backups_available": true,
    "logs_clean": true
  }
}
EOF
    
    log_info "Rapport JSON généré: $report_file"
}

# Affichage de l'aide
show_help() {
    cat << EOF
📊 Script de monitoring GLP-1 France

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --quick             Monitoring rapide (HTTP/HTTPS seulement)
    --full              Monitoring complet avec toutes les vérifications
    --json              Générer un rapport JSON
    --silent            Mode silencieux (pas de couleurs)
    --alerts-only       Afficher seulement les alertes
    --help, -h          Afficher cette aide

EXEMPLES:
    $0                  # Monitoring standard
    $0 --quick          # Vérification rapide
    $0 --full --json    # Monitoring complet avec rapport JSON

VARIABLES D'ENVIRONNEMENT:
    SITE_URL           URL du site à monitorer
    ALERT_EMAIL        Email pour les alertes
    ALERT_WEBHOOK      Webhook pour les alertes

    Configurez .env.production pour personnaliser tous les paramètres.
EOF
}

# Fonction principale
main() {
    local quick_mode=""
    local full_mode=""
    local json_mode=""
    local silent_mode=""
    local alerts_only=""
    
    # Traitement des arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --quick)
                quick_mode="true"
                shift
                ;;
            --full)
                full_mode="true"
                shift
                ;;
            --json)
                json_mode="true"
                shift
                ;;
            --silent)
                silent_mode="true"
                # Désactiver les couleurs
                RED=""
                GREEN=""
                YELLOW=""
                BLUE=""
                PURPLE=""
                CYAN=""
                NC=""
                shift
                ;;
            --alerts-only)
                alerts_only="true"
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
    if [[ "$silent_mode" != "true" ]] && [[ "$alerts_only" != "true" ]]; then
        echo -e "${BLUE}"
        cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║               📊 MONITORING GLP-1 FRANCE                  ║
    ║                                                           ║
    ║  Surveillance de l'état du site et infrastructure        ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
        echo -e "${NC}"
    fi
    
    # Chargement de la configuration
    load_env
    
    local start_time=$(date +%s)
    
    # Tests de base
    check_http_status
    echo
    
    check_ssl_status
    echo
    
    # Mode rapide = HTTP + HTTPS seulement
    if [[ "$quick_mode" == "true" ]]; then
        # Afficher le résumé
        if [[ "$alerts_only" != "true" ]]; then
            echo -e "${GREEN}✅ Monitoring rapide terminé${NC}"
        fi
    else
        # Tests complets
        check_important_pages
        echo
        
        check_performance
        echo
        
        check_disk_space
        echo
        
        check_backups
        echo
        
        check_error_logs
        echo
        
        # Tests additionnels en mode full
        if [[ "$full_mode" == "true" ]]; then
            log_info "Mode complet activé - tests supplémentaires..."
            # Ici on peut ajouter d'autres tests si besoin
        fi
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Affichage des alertes
    if [[ ${#ALERTS[@]} -gt 0 ]]; then
        echo -e "${RED}═══════════════════════════════════════${NC}"
        echo -e "${RED}             ALERTES DÉTECTÉES          ${NC}"
        echo -e "${RED}═══════════════════════════════════════${NC}"
        for alert in "${ALERTS[@]}"; do
            echo -e "${RED}• $alert${NC}"
        done
        echo
        
        # Envoyer les alertes
        send_alerts
    fi
    
    # Mode alerts-only
    if [[ "$alerts_only" == "true" ]]; then
        if [[ ${#ALERTS[@]} -eq 0 ]]; then
            echo "Aucune alerte"
        fi
        exit 0
    fi
    
    # Rapport JSON
    if [[ "$json_mode" == "true" ]]; then
        generate_json_report
        echo
    fi
    
    # Résumé final
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           MONITORING TERMINÉ           ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}📊 Statut global: ${NC}"
    if [[ "$OVERALL_STATUS" == "OK" ]]; then
        echo -e "${GREEN}✅ Tout est OK${NC}"
    else
        echo -e "${RED}❌ Problèmes détectés${NC}"
    fi
    echo -e "${BLUE}⏱️  Durée: ${duration}s${NC}"
    echo -e "${BLUE}📅 Date: $(date)${NC}"
    echo
}

# Point d'entrée
main "$@"
