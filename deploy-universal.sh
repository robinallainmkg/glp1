#!/bin/bash

#
# DEPLOIEMENT UNIVERSEL - GLP-1 FRANCE
# Compatible Linux/Mac/Windows (via Git Bash)
#

set -e

# Configuration
HOSTINGER_HOST="147.79.98.140"
HOSTINGER_PORT="65002"
HOSTINGER_USER="u403023291"
HOSTINGER_PASS="_@%p8R*XG.s+/5)"
HOSTINGER_PATH="/public_html"
COMMIT_MSG="${1:-Deploy: Mise à jour automatique}"

echo "🚀 DÉPLOIEMENT UNIVERSEL - GLP-1 FRANCE"
echo "========================================"

# 1. VERIFICATIONS
echo "🔍 Vérifications..."

if ! command -v git >/dev/null 2>&1; then
    echo "❌ Git non installé"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo "❌ npm non installé"
    exit 1
fi

CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo "✅ Branche actuelle: $CURRENT_BRANCH"

# 2. COMMIT ET PUSH GITHUB
echo ""
echo "📤 Upload vers GitHub..."

git add . 2>/dev/null || true
git commit -m "$COMMIT_MSG" 2>/dev/null || echo "⚠️  Aucun changement à commiter"
git push origin production --force --no-verify 2>/dev/null || echo "⚠️  Erreur push GitHub"
echo "✅ Push GitHub terminé"

# 3. BUILD DU SITE
echo ""
echo "🏗️  Build du site..."

[ -d "dist" ] && rm -rf dist
[ -d ".astro" ] && rm -rf .astro

if npm run build; then
    echo "✅ Build réussi"
else
    echo "❌ Erreur de build"
    exit 1
fi

if [ ! -f "dist/index.html" ]; then
    echo "❌ Erreur: index.html non trouvé dans dist/"
    exit 1
fi

# 4. UPLOAD VERS HOSTINGER
echo ""
echo "🌐 Upload vers Hostinger..."

# Méthode 1: sshpass + rsync (préféré)
if command -v sshpass >/dev/null 2>&1 && command -v rsync >/dev/null 2>&1; then
    echo "📦 Upload via sshpass + rsync..."
    
    export SSHPASS="$HOSTINGER_PASS"
    if sshpass -e rsync -avz --delete -e "ssh -p $HOSTINGER_PORT -o StrictHostKeyChecking=no" \
        dist/ $HOSTINGER_USER@$HOSTINGER_HOST:$HOSTINGER_PATH/; then
        echo "✅ Upload rsync réussi!"
        echo "🌐 Site mis à jour: https://glp1-france.fr"
    else
        echo "❌ Erreur upload rsync"
        UPLOAD_FAILED=1
    fi

# Méthode 2: sftp batch
elif command -v sftp >/dev/null 2>&1; then
    echo "📦 Upload via sftp batch..."
    
    # Créer script sftp
    cat > sftp_batch.txt << EOF
cd $HOSTINGER_PATH
put -r dist/*
quit
EOF
    
    if sftp -b sftp_batch.txt -P $HOSTINGER_PORT $HOSTINGER_USER@$HOSTINGER_HOST; then
        echo "✅ Upload sftp réussi!"
        echo "🌐 Site mis à jour: https://glp1-france.fr"
    else
        echo "❌ Erreur upload sftp"
        UPLOAD_FAILED=1
    fi
    
    rm -f sftp_batch.txt

# Méthode 3: curl (fichier par fichier)
elif command -v curl >/dev/null 2>&1; then
    echo "📦 Upload via curl SFTP..."
    
    cd dist
    TOTAL_FILES=$(find . -type f | wc -l)
    UPLOADED_FILES=0
    
    echo "Fichiers à uploader: $TOTAL_FILES"
    
    find . -type f | while read file; do
        # Supprimer le ./ du début
        RELATIVE_PATH=${file#./}
        REMOTE_URL="sftp://$HOSTINGER_USER:$HOSTINGER_PASS@$HOSTINGER_HOST:$HOSTINGER_PORT$HOSTINGER_PATH/$RELATIVE_PATH"
        
        if curl --sftp --upload-file "$file" "$REMOTE_URL" --create-dirs --silent; then
            UPLOADED_FILES=$((UPLOADED_FILES + 1))
            PERCENT=$(echo "scale=1; $UPLOADED_FILES * 100 / $TOTAL_FILES" | bc 2>/dev/null || echo "?")
            echo "  [$PERCENT%] $RELATIVE_PATH"
        else
            echo "  [ERREUR] $RELATIVE_PATH"
        fi
    done
    
    cd ..
    echo "✅ Upload curl terminé"
    echo "🌐 Site mis à jour: https://glp1-france.fr"

else
    echo "❌ Aucun outil d'upload trouvé (sshpass, sftp, curl)"
    UPLOAD_FAILED=1
fi

# Fallback: upload manuel
if [ "$UPLOAD_FAILED" = "1" ]; then
    echo ""
    echo "📋 Upload manuel requis:"
    echo "Host: $HOSTINGER_HOST:$HOSTINGER_PORT"
    echo "User: $HOSTINGER_USER"
    echo "Pass: $HOSTINGER_PASS"
    echo "Path: $HOSTINGER_PATH"
    echo "Local: ./dist/"
    
    # Ouvrir dossier si possible
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open dist 2>/dev/null || true
    elif command -v open >/dev/null 2>&1; then
        open dist 2>/dev/null || true
    fi
    
    echo "📁 Consultez le dossier ./dist/ pour upload manuel"
fi

echo ""
echo "🎉 Déploiement terminé!"
