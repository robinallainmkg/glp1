#!/bin/bash

# Script pour remplacer les images SVG par JPG dans les articles
echo "🖼️ CONVERSION DES IMAGES SVG VERS JPG"
echo "===================================="

converted=0
skipped=0

# Traiter tous les articles avec des images SVG
find src/content -name "*.md" -exec grep -l "thumbnail.*\.svg" {} \; | while read file; do
    basename_no_ext=$(basename "$file" .md)

    # Chercher l'image JPG correspondante
    jpg_path="public/images/thumbnails/${basename_no_ext}.jpg"

    if [ -f "$jpg_path" ]; then
        echo "🔄 Conversion de : $basename_no_ext"

        # Créer un backup
        cp "$file" "${file}.backup"

        # Remplacer la référence SVG par JPG dans le frontmatter
        sed -i '' "s|thumbnail: \".*\.svg\"|thumbnail: \"/images/thumbnails/${basename_no_ext}.jpg\"|g" "$file"
        sed -i '' "s|thumbnailAlt: \".*\"|thumbnailAlt: \"Illustration pour l'article ${basename_no_ext}\"|g" "$file"

        ((converted++))
        echo "   ✅ Converti : SVG → JPG"
    else
        echo "⏭️ Pas d'image JPG pour : $basename_no_ext"
        ((skipped++))
    fi
done

echo ""
echo "🎉 CONVERSION TERMINÉE !"
echo "========================"
echo "• Articles convertis : $converted"
echo "• Articles sans JPG : $skipped"
echo "• Total traité : $((converted + skipped))"
