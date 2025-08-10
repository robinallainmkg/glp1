#!/bin/bash

# 🚀 DÉPLOIEMENT GLP-1 FRANCE - MAC
# Script Bash avec SSH automatique

# Configuration Hostinger
HOSTINGER_HOST="147.79.98.140"
HOSTINGER_USER="u403023291"
HOSTINGER_PORT=65002
HOSTINGER_PATH="/public_html"

echo "🚀 DÉPLOIEMENT GLP-1 FRANCE"
echo "================================"

# Vérifier la branche
current_branch=$(git branch --show-current)
if [ "$current_branch" != "production" ]; then
    echo "❌ Erreur: Vous devez être sur la branche 'production'"
    echo "💡 Exécutez: git checkout production"
    exit 1
fi
echo "✅ Branche production confirmée"

# Nettoyer
echo "🧹 Nettoyage..."
rm -rf dist .astro

# Build
echo "🏗️  Build en cours..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erreur de build"
    exit 1
fi
echo "✅ Build réussi"

# Vérifications
if [ ! -f "dist/index.html" ]; then
    echo "❌ Erreur: index.html non trouvé"
    exit 1
fi

echo "📦 Build prêt pour déploiement"

# Déploiement automatique via SCP
echo ""
echo "🔄 Déploiement automatique vers Hostinger..."
echo "Host: $HOSTINGER_HOST:$HOSTINGER_PORT"

# Vérifier si scp est disponible
if command -v scp >/dev/null 2>&1; then
    echo "📤 Upload via scp..."
    
    # Supprimer le contenu distant et uploader
    echo "🗑️  Nettoyage du serveur..."
    ssh -p $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST "rm -rf $HOSTINGER_PATH/*"
    
    echo "📤 Upload des fichiers..."
    scp -P $HOSTINGER_PORT -r dist/* $HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/
    
    if [ $? -eq 0 ]; then
        echo "✅ Déploiement réussi!"
        echo "🌐 Site mis à jour: https://glp1-france.fr"
    else
        echo "❌ Erreur de déploiement automatique"
        echo "� Déploiement manuel nécessaire"
    fi
else
    echo "⚠️  scp non trouvé - Déploiement manuel"
    echo ""
    echo "�📋 ÉTAPES DE DÉPLOIEMENT MANUEL:"
    echo "1. Connectez-vous à votre panel Hostinger"
    echo "2. Ouvrez le File Manager"
    echo "3. Supprimez tout le contenu de public_html/"
    echo "4. Uploadez tout le contenu du dossier dist/ vers public_html/"
    echo ""
    echo "📁 Ouverture du dossier dist..."
    open dist
fi

echo ""
echo "🎉 Déploiement terminé!"
