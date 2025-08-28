#!/bin/bash

# Script pour générer des vraies images d'experts médicaux
# Utilise Grok pour créer des portraits professionnels

# Charger les variables d'environnement
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

if [ -z "$GROK_API_KEY" ] || [ "$GROK_API_KEY" = "your-api-key-here" ]; then
    echo "❌ Erreur: GROK_API_KEY n'est pas défini dans .env.local"
    exit 1
fi

API_KEY="$GROK_API_KEY"
OUTPUT_DIR="/Users/mac/Projet/glp1/public/images/experts"

# Créer le dossier s'il n'existe pas
mkdir -p "$OUTPUT_DIR"

echo "🩺 Génération d'images d'experts médicaux..."

# Fonction pour générer une image avec Grok
generate_expert_image() {
    local PROMPT="$1"
    local OUTPUT_FILE="$2"
    local EXPERT_NAME="$3"

    echo "📸 Génération de l'image pour $EXPERT_NAME..."

    # Créer un fichier temporaire pour la requête JSON
    local JSON_FILE=$(mktemp)
    cat > "$JSON_FILE" << EOF
{
    "model": "grok",
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

    # Pause pour éviter la limitation de taux
    sleep 3
}

# Générer les images pour chaque expert

# Dr. Claire Morel - Endocrinologue
PROMPT1="Professional portrait of Dr. Claire Morel, female endocrinologist, 45 years old, wearing white medical coat, stethoscope around neck, confident smile, short brown hair, glasses, medical office background, professional headshot, high quality, realistic, medical professional"
generate_expert_image "$PROMPT1" "$OUTPUT_DIR/dr-claire-morel.jpg" "Dr. Claire Morel"

# Élodie Carpentier - Diabétologue
PROMPT2="Professional portrait of Dr. Élodie Carpentier, female diabetologist, 38 years old, wearing white medical coat, holding a clipboard, warm smile, long blonde hair, medical clinic background, professional headshot, high quality, realistic, healthcare professional"
generate_expert_image "$PROMPT2" "$OUTPUT_DIR/elodie-carpentier.jpg" "Élodie Carpentier"

# Julien Armand - Endocrinologue
PROMPT3="Professional portrait of Dr. Julien Armand, male endocrinologist, 42 years old, wearing white medical coat, stethoscope, serious but approachable expression, short black hair, clean-shaven, medical office with diplomas on wall, professional headshot, high quality, realistic"
generate_expert_image "$PROMPT3" "$OUTPUT_DIR/julien-armand.jpg" "Dr. Julien Armand"

# Marc Delattre - Nutritionniste
PROMPT4="Professional portrait of Dr. Marc Delattre, male nutritionist, 50 years old, wearing white medical coat, holding nutrition chart, friendly smile, gray hair, glasses, nutrition consultation room background, professional headshot, high quality, realistic, healthcare professional"
generate_expert_image "$PROMPT4" "$OUTPUT_DIR/marc-delattre.jpg" "Dr. Marc Delattre"

echo "🎉 Génération terminée!"
echo "📊 Vérification des images générées:"

# Vérifier les images générées
ls -la "$OUTPUT_DIR"/*.jpg

echo ""
echo "✅ Images d'experts générées avec succès!"
echo "📍 Elles sont dans: $OUTPUT_DIR"
echo "🚀 Prêtes pour le déploiement!"
