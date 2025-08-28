#!/bin/bash

# Script de test pour régénérer UNE SEULE image en format paysage

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

echo "🧪 TEST: Génération d'une seule image en format paysage"

# Fonction pour nettoyer les noms de fichiers
clean_filename() {
    local name="$1"
    echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//'
}

# Fonction pour analyser un article et créer un prompt paysage
create_landscape_prompt() {
    local ARTICLE_PATH="$1"
    local ARTICLE_NAME="$2"

    local TITLE=$(grep -m 1 "^title:" "$ARTICLE_PATH" 2>/dev/null | sed 's/title: //' | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
    local DESCRIPTION=$(grep -m 1 "^description:" "$ARTICLE_PATH" 2>/dev/null | sed 's/description: //' | tr -d '"' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    TITLE=${TITLE:-"Medical illustration for $ARTICLE_NAME"}
    DESCRIPTION=${DESCRIPTION:-"Professional medical illustration"}

    local PROMPT="LANDSCAPE FORMAT 16:9 aspect ratio, wide horizontal composition 1792x1024 pixels, professional medical illustration: $TITLE. $DESCRIPTION. High quality, clean design, optimized for web thumbnails, medical and healthcare theme, wide panoramic view, horizontal layout"

    echo "$PROMPT"
}

# Fonction pour générer une image avec Grok
generate_image() {
    local PROMPT="$1"
    local OUTPUT_FILE="$2"

    echo "📸 Génération: $OUTPUT_FILE"

    local JSON_FILE=$(mktemp)
    cat > "$JSON_FILE" << EOF
{
    "model": "grok",
    "prompt": "$PROMPT",
    "n": 1,
    "response_format": "url"
}
EOF

    local RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/images/generations" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $API_KEY" \
        --data @"$JSON_FILE")

    local IMAGE_URL=$(echo "$RESPONSE" | jq -r '.data[0].url' 2>/dev/null)

    rm -f "$JSON_FILE"

    if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
        curl -s -o "$OUTPUT_FILE" "$IMAGE_URL"
    fi

    if [ -f "$OUTPUT_FILE" ] && [ -s "$OUTPUT_FILE" ]; then
        echo "✅ Créé: $OUTPUT_FILE"
        file "$OUTPUT_FILE"
    else
        echo "❌ Échec: $OUTPUT_FILE"
        echo "   Réponse API: $RESPONSE"
    fi
}

# Tester avec le premier article trouvé
FIRST_ARTICLE=$(find "$CONTENT_DIR" -name "*.md" | head -1)

if [ -n "$FIRST_ARTICLE" ]; then
    ARTICLE_NAME=$(basename "$FIRST_ARTICLE" .md)
    CLEAN_NAME=$(clean_filename "$ARTICLE_NAME")
    OUTPUT_FILE="$OUTPUT_DIR/${CLEAN_NAME}-illus.jpg"
    
    echo "🎯 Test avec l'article: $ARTICLE_NAME"
    
    PROMPT=$(create_landscape_prompt "$FIRST_ARTICLE" "$ARTICLE_NAME")
    echo "📝 Prompt: $PROMPT"
    
    generate_image "$PROMPT" "$OUTPUT_FILE"
else
    echo "❌ Aucun article trouvé dans $CONTENT_DIR"
fi

echo "🎉 Test terminé!"
