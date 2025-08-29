#!/bin/bash

# Script pour ajouter des images manquantes aux articles
echo "📸 AJOUT D'IMAGES MANQUANTES"
echo "============================"

added_images=0

# Fonction pour ajouter une image selon le type d'article
add_image_to_article() {
    local file="$1"
    local basename=$(basename "$file" .md)

    # Déterminer le type d'image selon le nom du fichier
    local image_path=""
    local alt_text=""

    if [[ $basename == prix-* ]]; then
        # Articles de prix
        local product=$(echo "$basename" | sed 's/prix-//')
        image_path="/images/thumbnails/${product}-prix.svg"
        alt_text="Prix et coût du traitement ${product}"
    elif [[ $basename == effets-secondaires-* ]]; then
        # Articles d'effets secondaires
        local product=$(echo "$basename" | sed 's/effets-secondaires-//')
        image_path="/images/thumbnails/${product}-effets-secondaires.svg"
        alt_text="Effets secondaires du traitement ${product}"
    else
        # Image générique
        image_path="/images/thumbnails/${basename}.svg"
        alt_text="Illustration pour l'article ${basename}"
    fi

    # Vérifier si l'image existe déjà dans le frontmatter
    if ! grep -q "thumbnail\|image" "$file"; then
        echo "📸 Ajout d'image à : $(basename "$file")"

        # Trouver la ligne avant la fin du frontmatter
        local frontmatter_end=$(grep -n "^---$" "$file" | tail -1 | cut -d: -f1)

        if [ -n "$frontmatter_end" ]; then
            # Insérer les champs image avant la fin du frontmatter
            sed -i '' "${frontmatter_end}i\\
thumbnail: \"${image_path}\"\\
thumbnailAlt: \"${alt_text}\"\\
" "$file"
            ((added_images++))
            echo "   ✅ Image ajoutée : $image_path"
        else
            echo "   ❌ Frontmatter non trouvé"
        fi
    else
        echo "   ⏭️ Image déjà présente dans $(basename "$file")"
    fi
}

# Traiter tous les articles sans image
find src/content -name "*.md" | while read file; do
    add_image_to_article "$file"
done

echo ""
echo "🎉 TRAITEMENT TERMINÉ !"
echo "======================"
echo "• Images ajoutées : $added_images"
