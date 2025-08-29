#!/bin/bash

# Script pour ajouter automatiquement des sommaires aux articles sans sommaire
# Usage: ./add-toc-to-articles.sh

echo "🔍 Recherche des articles sans sommaire..."

find src/content -name "*.md" -exec grep -L "## Sommaire\|## Table des matières" {} \; | while read file; do
    echo "📝 Traitement de : $file"

    # Créer un backup
    cp "$file" "${file}.backup"

    # Extraire les titres H2 (différents formats possibles)
    toc_content=""
    grep "^## \|^### \|^#### " "$file" | while read line; do
        # Nettoyer le titre
        title=$(echo "$line" | sed 's/^#* //' | sed 's/^\*\*//' | sed 's/\*\*$//' | sed 's/^[*]*//' | sed 's/[*]*$//')
        # Créer l'ancre
        anchor=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
        # Déterminer le niveau d'indentation
        level=$(echo "$line" | grep -o '^#*' | wc -c)
        indent=""
        if [ $level -gt 2 ]; then
            indent="  "
        fi
        toc_content="${toc_content}${indent}- [$title](#$anchor)\n"
    done

    if [ -n "$toc_content" ]; then
        # Trouver la position après le frontmatter
        frontmatter_end=$(grep -n "^---$" "$file" | tail -1 | cut -d: -f1)
        insert_line=$((frontmatter_end + 1))

        # Insérer le sommaire
        {
            head -n $frontmatter_end "$file"
            echo ""
            echo "## Sommaire"
            echo ""
            echo -e "$toc_content"
            echo ""
            tail -n +$((frontmatter_end + 1)) "$file"
        } > "${file}.tmp" && mv "${file}.tmp" "$file"

        echo "   ✅ Sommaire ajouté"
    else
        echo "   ⚠️ Aucun titre H2 trouvé, sommaire non ajouté"
    fi
    echo ""
done

echo "🎉 Traitement terminé !"
