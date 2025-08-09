#!/bin/bash

# 🔧 Installation des hooks Git pour GLP-1 France

set -euo pipefail

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔧 Installation des hooks Git pour GLP-1 France${NC}"
echo

# Vérifier qu'on est dans un repo Git
if [[ ! -d ".git" ]]; then
    echo -e "${YELLOW}⚠️  Ce script doit être exécuté depuis la racine d'un repo Git${NC}"
    exit 1
fi

# Créer le répertoire hooks s'il n'existe pas
mkdir -p .git/hooks

# Copier le hook pre-push
if [[ -f ".git/hooks/pre-push" ]]; then
    echo -e "${YELLOW}Hook pre-push existant sauvegardé vers pre-push.backup${NC}"
    cp .git/hooks/pre-push .git/hooks/pre-push.backup
fi

# Créer le hook pre-push
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

# 🛡️ Hook pre-push GLP-1 France
# Vérifie que le build fonctionne avant de pousser le code

set -euo pipefail

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🛡️  Hook pre-push GLP-1 France${NC}"
echo -e "${BLUE}Vérification du build avant push...${NC}"
echo

# Vérifier que nous sommes dans un projet Node.js
if [[ ! -f "package.json" ]]; then
    echo -e "${RED}❌ package.json non trouvé${NC}"
    echo -e "${YELLOW}Ce hook doit être exécuté depuis la racine du projet${NC}"
    exit 1
fi

# Vérifier que les dépendances sont installées
if [[ ! -d "node_modules" ]]; then
    echo -e "${YELLOW}⚠️  node_modules non trouvé, installation des dépendances...${NC}"
    npm install
fi

# Nettoyer les builds précédents
if [[ -d "dist" ]]; then
    rm -rf dist
    echo -e "${BLUE}🧹 Ancien build supprimé${NC}"
fi

if [[ -d ".astro" ]]; then
    rm -rf .astro
    echo -e "${BLUE}🧹 Cache Astro supprimé${NC}"
fi

# Tenter le build
echo -e "${BLUE}🏗️  Test du build...${NC}"
if npm run build > build_test.log 2>&1; then
    echo -e "${GREEN}✅ Build réussi${NC}"
    
    # Vérifier que le build a généré des fichiers
    if [[ -d "dist" ]] && [[ "$(ls -A dist 2>/dev/null)" ]]; then
        file_count=$(find dist -type f | wc -l)
        echo -e "${GREEN}📦 $file_count fichiers générés${NC}"
        
        # Vérifier la présence de index.html
        if [[ -f "dist/index.html" ]]; then
            echo -e "${GREEN}✅ index.html présent${NC}"
        else
            echo -e "${RED}❌ index.html manquant dans le build${NC}"
            echo -e "${YELLOW}Consultez build_test.log pour plus de détails${NC}"
            exit 1
        fi
        
    else
        echo -e "${RED}❌ Le répertoire dist est vide ou inexistant${NC}"
        echo -e "${YELLOW}Consultez build_test.log pour plus de détails${NC}"
        exit 1
    fi
    
    # Nettoyage du build de test
    rm -rf dist .astro
    rm -f build_test.log
    
    echo -e "${GREEN}🎉 Toutes les vérifications sont passées !${NC}"
    echo -e "${BLUE}📤 Push autorisé${NC}"
    echo
    
else
    echo -e "${RED}❌ Échec du build${NC}"
    echo -e "${YELLOW}Détails de l'erreur :${NC}"
    echo
    tail -20 build_test.log
    echo
    echo -e "${RED}🚫 Push bloqué${NC}"
    echo -e "${YELLOW}Corrigez les erreurs de build avant de pusher${NC}"
    echo -e "${YELLOW}Log complet disponible dans : build_test.log${NC}"
    exit 1
fi
EOF

# Rendre le hook exécutable
chmod +x .git/hooks/pre-push

echo -e "${GREEN}✅ Hook pre-push installé${NC}"

# Optionnel : Hook pre-commit pour les vérifications rapides
read -p "Installer aussi le hook pre-commit pour les vérifications rapides ? (y/n): " install_precommit

if [[ "$install_precommit" =~ ^[Yy]$ ]]; then
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

# 🧹 Hook pre-commit GLP-1 France
# Vérifications rapides avant commit

# Vérifier qu'il n'y a pas de console.log dans les nouveaux fichiers
if git diff --cached --name-only | grep -E '\.(js|ts|mjs)$' | xargs grep -l 'console\.log' 2>/dev/null; then
    echo "⚠️  Des console.log ont été détectés dans les fichiers à commiter"
    echo "Voulez-vous continuer ? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Vérifier qu'il n'y a pas de TODO/FIXME critique
if git diff --cached | grep -E 'TODO|FIXME|XXX' | grep -i 'critical\|urgent\|important'; then
    echo "⚠️  Des TODO/FIXME critiques détectés"
    echo "Assurez-vous de les traiter avant le déploiement"
fi
EOF

    chmod +x .git/hooks/pre-commit
    echo -e "${GREEN}✅ Hook pre-commit installé${NC}"
fi

echo
echo -e "${BLUE}🎉 Installation des hooks Git terminée !${NC}"
echo
echo -e "${YELLOW}Les hooks installés :${NC}"
echo "• pre-push : Vérifie le build avant push"
if [[ -f ".git/hooks/pre-commit" ]]; then
    echo "• pre-commit : Vérifications rapides avant commit"
fi
echo
echo -e "${YELLOW}Pour désactiver temporairement un hook :${NC}"
echo "git push --no-verify    # Ignorer le hook pre-push"
echo "git commit --no-verify  # Ignorer le hook pre-commit"
echo
echo -e "${YELLOW}Pour désinstaller les hooks :${NC}"
echo "rm .git/hooks/pre-push .git/hooks/pre-commit"
