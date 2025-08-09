#!/bin/bash

echo "🚀 Déploiement GLP-1 vers Hostinger..."

# Variables
REMOTE_USER="u403023291"
REMOTE_HOST="147.79.98.140"
REMOTE_PORT="65002"
REMOTE_PATH="/home/u403023291/domains/glp1-france.fr/public_html"
LOCAL_BUILD="dist"

# Option dry-run
DRY_RUN=""
if [ "$1" = "--dry-run" ]; then
    DRY_RUN="true"
    echo "🔍 Mode TEST - Aucun fichier ne sera vraiment uploadé"
fi

# 1. Build du projet
echo "📦 Build en cours..."
npm run build

# Vérification du build
if [ ! -d "$LOCAL_BUILD" ]; then
    echo "❌ Erreur: le dossier $LOCAL_BUILD n'existe pas"
    exit 1
fi

echo "✅ Build réussi!"

# 2. Upload vers Hostinger avec scp
if [ -n "$DRY_RUN" ]; then
    echo "🔍 TEST: Simulation - voici ce qui serait uploadé:"
    find $LOCAL_BUILD -type f | head -10
    echo "... et autres fichiers"
    echo "✅ Test réussi! Prêt pour le déploiement réel avec: npm run deploy"
else
    echo "📤 Upload vers le serveur avec scp..."
    echo "⚠️  Vous allez devoir saisir le mot de passe SSH: _@%p8R*XG.s+/5)"
    
    # Nettoyer le répertoire distant d'abord
    ssh -p $REMOTE_PORT $REMOTE_USER@$REMOTE_HOST "rm -rf $REMOTE_PATH/*"
    
    # Upload récursif avec scp
    scp -P $REMOTE_PORT -r $LOCAL_BUILD/* $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/
    
    if [ $? -eq 0 ]; then
        echo "✅ Déploiement réussi!"
        echo "🌐 Vérifiez: https://glp1-france.fr"
    else
        echo "❌ Erreur lors du déploiement"
        exit 1
    fi
fi
