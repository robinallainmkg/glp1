#!/bin/bash

# Script intelligent pour générer des images adaptées au contenu des articles
# Analyse automatiquement les articles et crée des prompts personnalisés pour Grok

# Charger les variables d'environnement depuis .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

API_KEY="${GROK_API_KEY:-your-api-key-here}"
OUTPUT_DIR="/Users/mac/Projet/glp1/public/images/thumbnails"
CONTENT_DIR="/Users/mac/Projet/glp1/src/content"

# Fonction pour analyser le contenu d'un article et créer un prompt adapté
analyze_article_content() {
    local ARTICLE_PATH="$1"
    local ARTICLE_NAME="$2"

    # Extraire le titre et le contenu principal
    TITLE=$(grep -m 1 "^title:" "$ARTICLE_PATH" | sed 's/title: //' | tr -d '"')
    DESCRIPTION=$(grep -m 1 "^description:" "$ARTICLE_PATH" | sed 's/description: //' | tr -d '"')

    # Analyser les premiers paragraphes pour comprendre le thème
    CONTENT_SAMPLE=$(grep -A 10 "^---" "$ARTICLE_PATH" | tail -n +11 | head -n 20 | tr '\n' ' ' | sed 's/"/'\''/g')

    # Déterminer le type d'article et créer un prompt adapté
    if [[ $ARTICLE_NAME == *"prix"* ]] || [[ $ARTICLE_NAME == *"cout"* ]]; then
        create_price_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    elif [[ $ARTICLE_NAME == *"effets"* ]] || [[ $ARTICLE_NAME == *"danger"* ]]; then
        create_side_effects_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    elif [[ $ARTICLE_NAME == *"guide"* ]] || [[ $ARTICLE_NAME == *"traitement"* ]]; then
        create_guide_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    elif [[ $ARTICLE_NAME == *"medecin"* ]] || [[ $ARTICLE_NAME == *"clinique"* ]]; then
        create_doctor_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    elif [[ $ARTICLE_NAME == *"regime"* ]] || [[ $ARTICLE_NAME == *"nutrition"* ]]; then
        create_nutrition_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    elif [[ $ARTICLE_NAME == *"alternatives"* ]] || [[ $ARTICLE_NAME == *"naturel"* ]]; then
        create_alternatives_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    else
        create_general_medical_prompt "$TITLE" "$DESCRIPTION" "$CONTENT_SAMPLE"
    fi
}

# Fonction pour créer un prompt pour les articles de prix
create_price_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    # Extraire le nom du médicament
    MEDICAMENT=$(echo "$TITLE" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    if [ -z "$MEDICAMENT" ]; then
        MEDICAMENT=$(echo "$CONTENT" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    fi

    echo "Scène réaliste en format paysage montrant un patient et son médecin discutant des coûts du traitement $MEDICAMENT en France. Au centre, un médecin d'âge mûr en blouse blanche explique les tarifs à un patient attentif assis à un bureau médical. Sur le bureau : une boîte de $MEDICAMENT, une carte Vitale française, des documents de remboursement Sécurité Sociale, et une calculatrice affichant les économies réalisées. En arrière-plan, des étagères avec des médicaments et des dossiers médicaux. Éclairage naturel venant d'une fenêtre, ambiance professionnelle et rassurante. Style photographique documentaire médical, haute qualité, détails réalistes des expressions faciales et de l'environnement médical français."
}

# Fonction pour créer un prompt pour les effets secondaires
create_side_effects_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    MEDICAMENT=$(echo "$TITLE" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    if [ -z "$MEDICAMENT" ]; then
        MEDICAMENT=$(echo "$CONTENT" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    fi

    echo "Consultation médicale réaliste en format paysage montrant un médecin expliquant les effets secondaires du $MEDICAMENT à son patient. Au centre, un médecin expérimenté en blouse blanche, stéthoscope autour du cou, montre une brochure d'information patient à une femme d'âge moyen assise en face de lui. Sur le bureau médical : boîte de $MEDICAMENT, documents d'information sur les effets secondaires, un bloc-notes avec des points importants surlignés. L'expression du médecin est attentive et rassurante, celle de la patiente montre de l'intérêt et de la confiance. En arrière-plan, une salle d'examen médicale avec équipement moderne. Éclairage doux et naturel, style photographique documentaire médical authentique."
}

# Fonction pour créer un prompt pour les guides de traitement
create_guide_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    MEDICAMENT=$(echo "$TITLE" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    if [ -z "$MEDICAMENT" ]; then
        MEDICAMENT=$(echo "$CONTENT" | grep -o -i '\(ozempic\|wegovy\|saxenda\|trulicity\|victoza\|rybelsus\)' | head -1 | tr '[:upper:]' '[:lower:]')
    fi

    echo "Scène éducative réaliste en format paysage dans un cabinet médical moderne. Au centre, un médecin spécialisé en endocrinologie explique le guide complet du traitement $MEDICAMENT à un couple de patients attentifs. Le médecin, d'âge mûr avec des lunettes, tient une tablette montrant des informations détaillées sur le $MEDICAMENT. À côté de lui : une boîte de $MEDICAMENT, des brochures d'information, et un modèle anatomique. Les patients prennent des notes et posent des questions. En arrière-plan, un écran d'ordinateur affichant des graphiques de suivi médical, et des étagères avec des ouvrages médicaux. Ambiance pédagogique et professionnelle, éclairage naturel, style photographique documentaire médical authentique."
}

# Fonction pour créer un prompt pour les médecins/cliniques
create_doctor_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    echo "Portrait professionnel en format paysage d'un endocrinologue français spécialisé dans les traitements GLP-1. Au centre, un médecin d'âge mûr en blouse blanche avec stéthoscope, souriant et confiant, dans son cabinet médical moderne. Derrière lui, un mur avec des diplômes médicaux français, des certificats de spécialisation en diabétologie et endocrinologie. Sur son bureau : ordinateur avec dossier patient, bloc d'ordonnances, et une boîte de médicament GLP-1. En arrière-plan, une salle d'attente visible à travers une porte vitrée avec des patients. Éclairage professionnel, style photographique portrait médical, expression bienveillante et compétente."
}

# Fonction pour créer un prompt pour la nutrition/régime
create_nutrition_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    echo "Scène éducative réaliste en format paysage dans une cuisine moderne transformée en espace de consultation nutritionnelle. Au centre, une diététicienne spécialisée en nutrition GLP-1 explique un plan alimentaire à une patiente motivée. La diététicienne, professionnelle et souriante, montre une assiette équilibrée avec des aliments sains : légumes frais, protéines maigres, glucides complexes. À côté : une balance, un carnet de suivi alimentaire, et des brochures nutritionnelles. La patiente prend des notes attentivement. En arrière-plan, une cuisine fonctionnelle avec des aliments frais et des ustensiles de cuisine saine. Éclairage naturel venant d'une fenêtre, ambiance positive et encourageante, style photographique documentaire nutritionnel."
}

# Fonction pour créer un prompt pour les alternatives naturelles
create_alternatives_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    # Déterminer le type d'alternative
    if [[ $CONTENT == *"berberine"* ]]; then
        ALTERNATIVE="berbérine"
        VISUAL="racine de berbérine séchée et gélules"
    elif [[ $CONTENT == *"cannelle"* ]]; then
        ALTERNATIVE="cannelle"
        VISUAL="bâtons de cannelle et poudre de cannelle en sachets"
    elif [[ $CONTENT == *"vinaigre"* ]]; then
        ALTERNATIVE="vinaigre de cidre"
        VISUAL="bouteille de vinaigre de cidre bio et cuillère doseuse"
    elif [[ $CONTENT == *"phytotherapie"* ]] || [[ $CONTENT == *"plantes"* ]]; then
        ALTERNATIVE="phytothérapie"
        VISUAL="diverses plantes médicinales et tisanes"
    else
        ALTERNATIVE="naturelles"
        VISUAL="aliments et compléments naturels"
    fi

    echo "Scène réaliste en format paysage montrant une consultation avec un naturopathe spécialisé en alternatives naturelles aux GLP-1. Au centre, un naturopathe expérimenté explique les bienfaits des alternatives $ALTERNATIVE à une patiente intéressée. Sur la table de consultation : $VISUAL disposés harmonieusement, des livres sur la phytothérapie, et un carnet de suivi naturel. Le naturopathe montre comment préparer une tisane ou prendre les compléments. La patiente écoute attentivement et pose des questions. En arrière-plan, des étagères avec des bocaux de plantes médicinales et des ouvrages de naturopathie. Ambiance chaleureuse et naturelle, éclairage doux, style photographique documentaire naturopathique."
}

# Fonction pour créer un prompt général médical
create_general_medical_prompt() {
    local TITLE="$1"
    local DESCRIPTION="$2"
    local CONTENT="$3"

    echo "Scène médicale réaliste en format paysage dans un environnement de soins moderne. Au centre, une équipe médicale composée d'un médecin et d'une infirmière s'occupe d'un patient dans le cadre d'un traitement médical. Le médecin explique les aspects importants du traitement pendant que l'infirmière prépare les éléments nécessaires. Sur une table à proximité : documents médicaux, équipements de suivi, et médicaments appropriés. L'ambiance est professionnelle, rassurante et moderne. En arrière-plan, du matériel médical high-tech et des posters d'information santé. Éclairage clinique approprié, style photographique documentaire médical authentique, expressions de confiance et de compétence professionnelle."
}

# Fonction pour scanner tous les articles et identifier ceux sans image
scan_articles() {
    echo "🔍 Analyse des articles et identification des images manquantes..."

    # Arrays pour stocker les articles sans image
    declare -a ARTICLES_TO_PROCESS

    # Scanner chaque collection
    for COLLECTION_DIR in "$CONTENT_DIR"/*/; do
        if [ -d "$COLLECTION_DIR" ]; then
            COLLECTION_NAME=$(basename "$COLLECTION_DIR")

            # Scanner les fichiers markdown
            for ARTICLE_FILE in "$COLLECTION_DIR"*.md; do
                if [ -f "$ARTICLE_FILE" ]; then
                    ARTICLE_BASENAME=$(basename "$ARTICLE_FILE" .md)
                    EXPECTED_IMAGE="${ARTICLE_BASENAME}-illus.jpg"

                    # Vérifier si l'image existe
                    if [ ! -f "$OUTPUT_DIR/$EXPECTED_IMAGE" ]; then
                        ARTICLES_TO_PROCESS+=("$ARTICLE_FILE|$ARTICLE_BASENAME")
                        echo "📝 Article sans image: $ARTICLE_BASENAME"
                    fi
                fi
            done
        fi
    done

    echo "📊 ${#ARTICLES_TO_PROCESS[@]} articles identifiés sans image"

    # Retourner la liste des articles à traiter
    printf '%s\n' "${ARTICLES_TO_PROCESS[@]}"
}

# Fonction principale pour générer une image
generate_image_for_article() {
    local ARTICLE_INFO="$1"
    local ARTICLE_PATH=$(echo "$ARTICLE_INFO" | cut -d'|' -f1)
    local ARTICLE_NAME=$(echo "$ARTICLE_INFO" | cut -d'|' -f2)
    local IMAGE_NAME="${ARTICLE_NAME}-illus.jpg"

    echo "🎨 Génération d'image pour: $ARTICLE_NAME"

    # Analyser le contenu et créer le prompt
    PROMPT=$(analyze_article_content "$ARTICLE_PATH" "$ARTICLE_NAME")

    echo "Prompt créé: ${PROMPT:0:100}..."

    # Appel à l'API Grok
    RESPONSE=$(curl -s -X POST "https://api.x.ai/v1/images/generations" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $API_KEY" \
      -d "{
        \"model\": \"grok-2-image-1212\",
        \"prompt\": \"$PROMPT, high quality, professional medical photography, realistic details, authentic medical environment, 16:9 aspect ratio, photorealistic style\",
        \"n\": 1,
        \"response_format\": \"url\"
      }")

    # Extraire l'URL de l'image
    IMAGE_URL=$(echo $RESPONSE | jq -r '.data[0].url' 2>/dev/null)

    if [ "$IMAGE_URL" != "null" ] && [ -n "$IMAGE_URL" ]; then
        # Télécharger l'image
        curl -s -o "$OUTPUT_DIR/$IMAGE_NAME" "$IMAGE_URL"
        echo "✅ Généré: $IMAGE_NAME"
    else
        echo "❌ Erreur pour $IMAGE_NAME: $RESPONSE"
    fi

    # Pause pour éviter la limitation de débit
    sleep 3
}

# Vérifier si l'API key est configurée
if [ "$API_KEY" = "your-api-key-here" ]; then
    echo "❌ Veuillez configurer votre GROK_API_KEY"
    echo "export GROK_API_KEY='votre-cle-api'"
    exit 1
fi

# Créer le dossier de sortie s'il n'existe pas
mkdir -p "$OUTPUT_DIR"

echo "🚀 Démarrage de l'analyse intelligente des articles..."
echo "Service utilisé: Grok (xAI) avec modèle grok-2-image-1212"

# Scanner et traiter tous les articles sans image
ARTICLES_LIST=$(scan_articles)

if [ ${#ARTICLES_LIST[@]} -eq 0 ]; then
    echo "🎉 Toutes les images sont déjà présentes!"
    exit 0
fi

echo "📸 Génération des images manquantes..."

# Traiter chaque article
while IFS= read -r ARTICLE_INFO; do
    if [ -n "$ARTICLE_INFO" ]; then
        generate_image_for_article "$ARTICLE_INFO"
    fi
done <<< "$ARTICLES_LIST"

echo "🎉 Génération terminée!"
echo "Vérifiez le dossier: $OUTPUT_DIR"
