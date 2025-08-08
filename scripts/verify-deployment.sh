#!/bin/bash

# ==============================================================================
# Script de Vérification Post-Déploiement - GLP-1 France
# ==============================================================================

echo "🔍 VÉRIFICATION POST-DÉPLOIEMENT - GLP-1 France"
echo "================================================="

DOMAIN="glp1-france.fr"
BASE_URL="https://$DOMAIN"

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de test d'URL
test_url() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description... "
    
    # Test avec curl
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url")
    
    if [ "$response" -eq 200 ]; then
        echo -e "${GREEN}✅ OK${NC} ($response)"
        return 0
    elif [ "$response" -eq 301 ] || [ "$response" -eq 302 ]; then
        echo -e "${YELLOW}⚠️  REDIRECT${NC} ($response)"
        return 1
    else
        echo -e "${RED}❌ FAILED${NC} ($response)"
        return 2
    fi
}

# Fonction de test DNS
test_dns() {
    echo "🌐 Test de résolution DNS..."
    echo "Serveurs DNS Hostinger attendus :"
    echo "  - ns1.dns-parking.com"
    echo "  - ns2.dns-parking.com"
    echo ""
    
    nslookup_result=$(nslookup $DOMAIN 2>/dev/null)
    
    if [[ $nslookup_result == *"Address:"* ]]; then
        echo -e "${GREEN}✅ DNS résolu${NC}"
        echo "$nslookup_result" | grep "Address:" | tail -n 1
        
        # Vérifier les serveurs DNS
        ns_result=$(nslookup -type=ns $DOMAIN 2>/dev/null)
        if [[ $ns_result == *"dns-parking.com"* ]]; then
            echo -e "${GREEN}✅ Serveurs DNS Hostinger détectés${NC}"
        else
            echo -e "${YELLOW}⚠️  Vérifiez les serveurs DNS chez votre registrar${NC}"
        fi
    else
        echo -e "${RED}❌ DNS non résolu${NC}"
        echo "⚠️  Vérifiez :"
        echo "   1. Configuration chez votre registrar"
        echo "   2. Propagation DNS (peut prendre jusqu'à 48h)"
        echo "   3. Test sur https://dnschecker.org"
    fi
    echo ""
}

# Fonction de test HTTPS
test_https() {
    echo "🔒 Test HTTPS..."
    
    # Test redirect HTTP vers HTTPS
    http_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://$DOMAIN")
    
    if [ "$http_response" -eq 301 ] || [ "$http_response" -eq 302 ]; then
        echo -e "${GREEN}✅ Redirection HTTP → HTTPS active${NC}"
    else
        echo -e "${YELLOW}⚠️  Pas de redirection automatique HTTPS${NC}"
    fi
    
    # Test certificat SSL
    ssl_info=$(echo | openssl s_client -connect $DOMAIN:443 -servername $DOMAIN 2>/dev/null | openssl x509 -noout -subject 2>/dev/null)
    
    if [[ $ssl_info == *"$DOMAIN"* ]]; then
        echo -e "${GREEN}✅ Certificat SSL valide${NC}"
    else
        echo -e "${RED}❌ Problème certificat SSL${NC}"
    fi
    echo ""
}

echo ""
echo "🚀 Démarrage des tests..."
echo ""

# Test DNS
test_dns

# Test HTTPS
test_https

# Tests des pages principales
echo "📄 Test des pages principales..."
echo "================================"

test_url "$BASE_URL/" "Page d'accueil"
test_url "$BASE_URL/glp1-cout" "Collection Coût"
test_url "$BASE_URL/medicaments-glp1" "Collection Médicaments"
test_url "$BASE_URL/glp1-perte-de-poids" "Collection Perte de Poids"
test_url "$BASE_URL/experts" "Page Experts"
test_url "$BASE_URL/avant-apres-glp1" "Page Avant/Après"

echo ""
echo "📝 Test des articles spécifiques..."
echo "==================================="

test_url "$BASE_URL/glp1-cout/wegovy-prix" "Article Wegovy Prix"
test_url "$BASE_URL/glp1-cout/saxenda-prix-pharmacie" "Article Saxenda Prix"
test_url "$BASE_URL/glp1-cout/acheter-wegovy-en-france" "Article Acheter Wegovy"

echo ""
echo "🔐 Test des pages admin..."
echo "=========================="

test_url "$BASE_URL/admin-login" "Page Login Admin"
admin_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/admin")

if [ "$admin_response" -eq 200 ]; then
    echo -e "Admin accessible: ${YELLOW}⚠️  ATTENTION - Admin non protégé${NC}"
    echo "   → Configurez la protection IP dans .htaccess"
elif [ "$admin_response" -eq 403 ]; then
    echo -e "Admin: ${GREEN}✅ Protégé (403 Forbidden)${NC}"
else
    echo -e "Admin: ${YELLOW}⚠️  Statut inattendu ($admin_response)${NC}"
fi

echo ""
echo "🗂️  Test des ressources statiques..."
echo "===================================="

test_url "$BASE_URL/logo.svg" "Logo SVG"
test_url "$BASE_URL/_astro/index.UwlMHB7c.css" "CSS principal (vérifiez le nom exact)"

echo ""
echo "📊 RÉSUMÉ"
echo "========="

# Test global du site
overall_test=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL")

if [ "$overall_test" -eq 200 ]; then
    echo -e "${GREEN}✅ Site globalement fonctionnel${NC}"
    echo ""
    echo "🎉 DÉPLOIEMENT RÉUSSI !"
    echo ""
    echo "🔗 Votre site est accessible à : $BASE_URL"
    echo ""
    echo "📋 Actions recommandées :"
    echo "   1. Configurez Google Analytics"
    echo "   2. Mettez en place le monitoring (UptimeRobot)"
    echo "   3. Configurez les sauvegardes automatiques"
    echo "   4. Testez les fonctionnalités en navigation privée"
    echo "   5. Vérifiez la protection admin si nécessaire"
    
else
    echo -e "${RED}❌ Site non accessible${NC}"
    echo ""
    echo "🔧 ACTIONS DE DÉPANNAGE :"
    echo "   1. Vérifiez que les fichiers sont dans public_html/"
    echo "   2. Vérifiez les permissions (755 pour dossiers, 644 pour fichiers)"
    echo "   3. Consultez les logs d'erreur Hostinger"
    echo "   4. Vérifiez la propagation DNS (24-48h)"
    echo "   5. Contactez le support Hostinger si nécessaire"
fi

echo ""
echo "📞 Support :"
echo "   - Support Hostinger : Chat 24/7 sur hpanel.hostinger.com"
echo "   - DNS Checker : https://dnschecker.org"
echo "   - SSL Checker : https://www.ssllabs.com/ssltest/"

echo ""
echo "✅ Test terminé."
