#!/bin/bash

# 🔍 Script de vérification du site GLP-1 France
# Vérifie l'état et les performances du site après déploiement

set -euo pipefail

# Configuration
SITE_URL="${SITE_URL:-https://glp1-france.fr}"
TIMEOUT="${TIMEOUT:-30}"
USER_AGENT="GLP1-HealthCheck/1.0"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Fonction de test HTTP basique
test_http_response() {
    log_info "Test de réponse HTTP..."
    
    if command -v curl &> /dev/null; then
        local response=$(curl -s -o /dev/null -w "%{http_code}:%{time_total}:%{size_download}" \
            --connect-timeout "$TIMEOUT" \
            --max-time "$TIMEOUT" \
            --user-agent "$USER_AGENT" \
            "$SITE_URL")
        
        local http_code=$(echo "$response" | cut -d: -f1)
        local time_total=$(echo "$response" | cut -d: -f2)
        local size_download=$(echo "$response" | cut -d: -f3)
        
        case "$http_code" in
            200)
                log_success "HTTP $http_code - Temps: ${time_total}s - Taille: ${size_download} bytes"
                return 0
                ;;
            301|302)
                log_warning "Redirection HTTP $http_code détectée"
                return 1
                ;;
            *)
                log_error "Erreur HTTP $http_code"
                return 1
                ;;
        esac
    else
        log_error "curl non disponible pour les tests HTTP"
        return 1
    fi
}

# Fonction de test des pages importantes
test_important_pages() {
    log_info "Test des pages importantes..."
    
    local pages=(
        "/"
        "/glp1-perte-de-poids/"
        "/medicaments-glp1/"
        "/effets-secondaires-glp1/"
        "/admin-dashboard/"
    )
    
    local failed_pages=0
    
    for page in "${pages[@]}"; do
        local url="${SITE_URL}${page}"
        local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
            --connect-timeout 10 \
            --max-time 20 \
            --user-agent "$USER_AGENT" \
            "$url" 2>/dev/null || echo "000")
        
        if [[ "$http_code" == "200" ]]; then
            log_success "Page $page accessible"
        else
            log_error "Page $page inaccessible (HTTP $http_code)"
            ((failed_pages++))
        fi
    done
    
    if [[ $failed_pages -eq 0 ]]; then
        log_success "Toutes les pages importantes sont accessibles"
        return 0
    else
        log_error "$failed_pages page(s) problématique(s)"
        return 1
    fi
}

# Fonction de test des ressources statiques
test_static_resources() {
    log_info "Test des ressources statiques..."
    
    # Test du favicon
    local favicon_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout 5 \
        "$SITE_URL/favicon.svg" 2>/dev/null || echo "000")
    
    if [[ "$favicon_code" == "200" ]]; then
        log_success "Favicon accessible"
    else
        log_warning "Favicon non accessible (HTTP $favicon_code)"
    fi
    
    # Test du logo
    local logo_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout 5 \
        "$SITE_URL/logo.svg" 2>/dev/null || echo "000")
    
    if [[ "$logo_code" == "200" ]]; then
        log_success "Logo accessible"
    else
        log_warning "Logo non accessible (HTTP $logo_code)"
    fi
}

# Fonction de test de performance basique
test_performance() {
    log_info "Test de performance basique..."
    
    if command -v curl &> /dev/null; then
        local times=$(curl -s -o /dev/null -w "%{time_namelookup}:%{time_connect}:%{time_starttransfer}:%{time_total}" \
            --connect-timeout "$TIMEOUT" \
            --max-time "$TIMEOUT" \
            "$SITE_URL" 2>/dev/null || echo "0:0:0:0")
        
        local dns_time=$(echo "$times" | cut -d: -f1)
        local connect_time=$(echo "$times" | cut -d: -f2)
        local start_transfer_time=$(echo "$times" | cut -d: -f3)
        local total_time=$(echo "$times" | cut -d: -f4)
        
        echo "📊 Métriques de performance:"
        echo "   DNS lookup: ${dns_time}s"
        echo "   Connexion: ${connect_time}s"
        echo "   Premier byte: ${start_transfer_time}s"
        echo "   Total: ${total_time}s"
        
        # Évaluation des performances
        if (( $(echo "$total_time < 2.0" | bc -l 2>/dev/null || echo "0") )); then
            log_success "Performance excellente (<2s)"
        elif (( $(echo "$total_time < 5.0" | bc -l 2>/dev/null || echo "0") )); then
            log_success "Performance correcte (<5s)"
        else
            log_warning "Performance lente (>${total_time}s)"
        fi
    fi
}

# Fonction de test du certificat SSL
test_ssl_certificate() {
    log_info "Vérification du certificat SSL..."
    
    if command -v openssl &> /dev/null; then
        local domain=$(echo "$SITE_URL" | sed 's|https\?://||' | sed 's|/.*||')
        local cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
        
        if [[ -n "$cert_info" ]]; then
            local not_after=$(echo "$cert_info" | grep "notAfter" | cut -d= -f2)
            log_success "Certificat SSL valide"
            log_info "Expiration: $not_after"
        else
            log_warning "Impossible de vérifier le certificat SSL"
        fi
    else
        log_warning "openssl non disponible pour vérifier le SSL"
    fi
}

# Fonction de test des meta tags importants
test_meta_tags() {
    log_info "Vérification des meta tags..."
    
    local html_content=$(curl -s --connect-timeout 10 --max-time 20 "$SITE_URL" 2>/dev/null || echo "")
    
    if [[ -n "$html_content" ]]; then
        # Test title tag
        if echo "$html_content" | grep -q "<title>" && echo "$html_content" | grep -q "GLP"; then
            log_success "Title tag présent et contient 'GLP'"
        else
            log_warning "Title tag manquant ou incorrect"
        fi
        
        # Test meta description
        if echo "$html_content" | grep -q 'name="description"'; then
            log_success "Meta description présente"
        else
            log_warning "Meta description manquante"
        fi
        
        # Test meta viewport
        if echo "$html_content" | grep -q 'name="viewport"'; then
            log_success "Meta viewport présent"
        else
            log_warning "Meta viewport manquant"
        fi
    else
        log_error "Impossible de récupérer le contenu HTML"
    fi
}

# Fonction de génération du rapport
generate_report() {
    local start_time="$1"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo
    echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║           RAPPORT DE VÉRIFICATION        ║${NC}"
    echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
    echo
    echo -e "${GREEN}🌐 Site vérifié: $SITE_URL${NC}"
    echo -e "${BLUE}📅 Date: $(date)${NC}"
    echo -e "${BLUE}⏱️  Durée: ${duration}s${NC}"
    echo
    echo -e "${YELLOW}Recommandations:${NC}"
    echo "1. Surveillez les logs serveur pour d'éventuelles erreurs"
    echo "2. Testez manuellement les fonctionnalités critiques"
    echo "3. Vérifiez les analytics dans les prochaines heures"
    echo
}

# Fonction principale
main() {
    local start_time=$(date +%s)
    
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════╗
    ║             🔍 VÉRIFICATION SITE GLP-1                ║
    ║                                                       ║
    ║  Contrôle de santé post-déploiement                   ║
    ╚═══════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Charger la config si disponible
    if [[ -f ".env.production" ]]; then
        set -a
        source .env.production
        set +a
    fi
    
    log_info "Début de la vérification de $SITE_URL"
    echo
    
    # Tests séquentiels
    test_http_response
    test_important_pages
    test_static_resources
    test_ssl_certificate
    test_meta_tags
    test_performance
    
    echo
    generate_report "$start_time"
}

# Gestion des arguments
case "${1:-}" in
    --help|-h)
        cat << EOF
🔍 Script de vérification du site GLP-1

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --help, -h          Afficher cette aide

VARIABLES D'ENVIRONNEMENT:
    SITE_URL           URL du site à vérifier (défaut: https://glp1-france.fr)
    TIMEOUT            Timeout pour les requêtes HTTP (défaut: 30s)

EXEMPLES:
    $0                                    # Vérification standard
    SITE_URL=https://test.glp1.fr $0     # Vérification d'un autre domaine
EOF
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac
