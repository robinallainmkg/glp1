#!/bin/bash

# Script pour régénérer TOUTES les images en format paysage
# Supprime les anciennes images et les régénère avec les bonnes dimensions

# Vérifications préalables
if ! command -v curl &> /dev/null; then
    echo "❌ Erreur: curl n'est pas installé"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo "❌ Erreur: jq n'est pas installé"
    exit 1
fi

# Charger les variables d'environnement
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$GROK_API_KEY" ] || [ "$GROK_API_KEY" = "your-api-key-here" ]; then
    echo "❌ Erreur: GROK_API_KEY n'est pas défini dans .env.local"
    exit 1
fi

API_KEY="$GROK_API_KEY"
OUTPUT_DIR="/Users/mac/Projet/glp1/public/images/thumbnails"
CONTENT_DIR="/Users/mac/Projet/glp1/src/content"

# Créer le dossier de sortie s'il n'existe pas
mkdir -p "$OUTPUT_DIR"

echo "🗑️  Suppression des anciennes images..."
rm -f "$OUTPUT_DIR"/*-illus.jpg
rm -f "$OUTPUT_DIR"/*-illus.png

echo "🎨 Régénération de toutes les images en format PAYSAGE..."

# Fonction pour générer une image avec Grok
generate_image() {
    local PROMPT="$1"
    local OUTPUT_FILE="$2"

    echo "📸 Génération: $OUTPUT_FILE"

    # Créer un fichier temporaire pour la requête JSON
    local JSON_FILE=$(mktemp)
    cat > "$JSON_FILE" << EOF
{
    "model": "grok-beta",
    "prompt": "$PROMPT",
    "n": 1,
    "response_format": "url"
}
EOF

    # Appel à l'API Grok
    local RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/images/generations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        --data @"$JSON_FILE")

    # Extraire l'URL de l'image de la réponse
    local IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data[0].url' 2>/dev/null)

    # Nettoyer le fichier temporaire
    rm -f "$JSON_FILE"

    # Télécharger l'image si l'URL est valide
    if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
        curl -s -o "$OUTPUT_FILE" "$IMAGE_URL"
    fi

    # Vérifier si l'image a été créée et a une taille > 0
    if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
        echo "✅ Créé: $OUTPUT_FILE"
    else
        echo "❌ Échec: $OUTPUT_FILE"
        echo "   Réponse API: $RESPONSE"
    fi

    # Pause pour éviter la limitation de taux
    sleep 2
}

# Fonction pour analyser un article et créer un prompt paysage
create_landscape_prompt() {
    local ARTICLE_PATH="$1"
    local ARTICLE_NAME="$2"

    # Extraire les informations de l'article
    local TITLE=$(grep -m 1 "^title:" "$ARTICLE_PATH" 2>/dev/null | sed 's/title: //' | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    local DESCRIPTION=$(grep -m 1 "^description:" "$ARTICLE_PATH" 2>/dev/null | sed 's/description: //' | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    # Valeurs par défaut si rien n'est trouvé
    TITLE=${TITLE:-"Medical illustration for $ARTICLE_NAME"}
    DESCRIPTION=${DESCRIPTION:-"Professional medical illustration"}

    # Créer un prompt paysage spécifique
    local PROMPT="LANDSCAPE FORMAT 16:9 aspect ratio, wide horizontal composition 1792x1024 pixels, professional medical illustration: $TITLE. $DESCRIPTION. High quality, clean design, optimized for web thumbnails, medical and healthcare theme, wide panoramic view, horizontal layout"

    echo "$PROMPT"
}

# Fonction pour nettoyer les noms de fichiers
clean_filename() {
    local name="$1"
    # Remplacer les espaces et caractères spéciaux par des tirets
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//'
}

# Parcourir tous les articles et générer des images
echo "🔍 Analyse des articles..."

find "$CONTENT_DIR" -name "*.md" | while read -r article; do
    # Extraire le nom de l'article
    ARTICLE_NAME=$(basename "$article" .md)
    
    # Nettoyer le nom pour le fichier
    CLEAN_NAME=$(clean_filename "$ARTICLE_NAME")

    # Créer le nom de l'image de sortie
    OUTPUT_FILE="$OUTPUT_DIR/${CLEAN_NAME}-illus.jpg"

    # Vérifier si l'image existe déjà
    if [ -f "$OUTPUT_FILE" ]; then
        echo "⏭️  Image existe déjà: $OUTPUT_FILE"
        continue
    fi

    # Créer le prompt paysage
    PROMPT=$(create_landscape_prompt "$article" "$ARTICLE_NAME")

    # Générer l'image
    generate_image "$PROMPT" "$OUTPUT_FILE"

done

echo "🎉 Régénération terminée!"
echo "📊 Vérification des dimensions..."

# Vérifier les dimensions des nouvelles images
echo "Dimensions des images générées:"
file "$OUTPUT_DIR"/*-illus.jpg | head -10

echo ""
echo "✅ Toutes les images ont été régénérées en format paysage!"
echo "🔄 Vous pouvez maintenant mettre à jour les références dans les articles si nécessaire."
