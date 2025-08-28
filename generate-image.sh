#!/bin/bash

# Script pour générer des images manquantes avec Grok
# Usage: ./generate-image.sh [type] [traitement]
# Exemple: ./generate-image.sh thumbnail ozempic

# Charger les variables d'environnement depuis .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

API_KEY="${GROK_API_KEY:-your-api-key-here}"bash

# Script pour générer des images manquantes avec Grok
# Usage: ./generate-images.sh [type] [traitement]
# Exemple: ./generate-images.sh thumbnail ozempic

API_KEY="${GROK_API_KEY:-your-api-key-here}"
TYPE="${1:-thumbnail}"
TRAITEMENT="${2:-ozempic}"

# Configuration selon le type
case $TYPE in
    "thumbnail")
        STYLE="medical illustration, professional, clean, high quality"
        SIZE="1200x630"
        ;;
    "illustration")
        STYLE="detailed medical illustration, scientific accuracy, professional"
        SIZE="1792x1024"
        ;;
    "icon")
        STYLE="simple icon, medical theme, minimal"
        SIZE="256x256"
        ;;
    *)
        echo "Types disponibles: thumbnail, illustration, icon"
        exit 1
        ;;
esac

# Prompts selon le traitement
declare -A PROMPTS=(
    ["ozempic"]="Professional medical illustration of Ozempic semaglutide pen injector held by healthcare professional, clean white background, pharmaceutical style, high quality, 16:9 aspect ratio"
    ["wegovy"]="Medical illustration showing Wegovy injection pen for weight management, professional healthcare setting, clean design, high quality"
    ["saxenda"]="Healthcare professional administering Saxenda liraglutide injection, medical clinic setting, professional illustration style"
    ["trulicity"]="Trulicity dulaglutide pen injector in medical professional hands, pharmaceutical illustration, clean background"
    ["victoza"]="Victoza liraglutide injection demonstration, medical education style, professional healthcare illustration"
    ["rybelsus"]="Rybelsus semaglutide oral tablets with glass of water, pharmaceutical product illustration, clean medical style"
)

PROMPT="${PROMPTS[$TRAITEMENT]}"
if [ -z "$PROMPT" ]; then
    echo "Traitement non reconnu. Traitements disponibles: ozempic, wegovy, saxenda, trulicity, victoza, rybelsus"
    exit 1
fi

# Générer l'image avec Grok
echo "Génération d'image pour $TRAITEMENT ($TYPE)..."

curl -X POST "https://api.x.ai/v1/images/generations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"model\": \"grok-vision-beta\",
    \"prompt\": \"$PROMPT, $STYLE\",
    \"n\": 1,
    \"size\": \"$SIZE\",
    \"response_format\": \"url\"
  }" | jq -r '.data[0].url' | xargs curl -o "/Users/mac/Projet/glp1/public/images/thumbnails/${TRAITEMENT}-${TYPE}.jpg"

echo "Image générée: ${TRAITEMENT}-${TYPE}.jpg"
