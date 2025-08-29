#!/bin/bash

# Script simplifié pour ajouter des sommaires
echo "🔍 Recherche des articles sans sommaire..."

find src/content -name "*.md" | while read file; do
    # Vérifier si le sommaire existe déjà
    if grep -q "## Sommaire\|## Table des matières" "$file"; then
        echo "⏭️ Sommaire déjà présent dans $file"
        continue
    fi

    echo "📝 Traitement de : $file"

    # Générer le sommaire
    toc_content=""
    grep "^## \|^### \|^#### " "$file" | while read line; do
        title=$(echo "$line" | sed 's/^#* //' | sed 's/^\*\*//' | sed 's/\*\*$//' | sed 's/^[*]*//' | sed 's/[*]*$//')
        anchor=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
        level=$(echo "$line" | grep -o '^#*' | wc -c)
        indent=""
        if [ $level -gt 2 ]; then
            indent="  "
        fi
        toc_content="${toc_content}${indent}- [$title](#$anchor)\n"
    done

    if [ -n "$toc_content" ]; then
        # Créer un backup
        cp "$file" "${file}.backup"

        # Trouver la fin du frontmatter
        frontmatter_end=$(grep -n "^---$" "$file" | tail -1 | cut -d: -f1)

        if [ -n "$frontmatter_end" ]; then
            # Insérer le sommaire après le frontmatter
            {
                head -n $frontmatter_end "$file"
                echo ""
                echo "## Sommaire"
                echo ""
                echo -e "$toc_content"
                echo ""
                tail -n +$((frontmatter_end + 1)) "$file"
            } > "${file}.tmp" && mv "${file}.tmp" "$file"
            echo "   ✅ Sommaire ajouté avec $(echo "$toc_content" | wc -l) entrées"
        else
            echo "   ❌ Frontmatter non trouvé"
        fi
    else
        echo "   ⚠️ Aucun titre H2/H3 trouvé"
    fi
    echo ""
done

echo "🎉 Traitement terminé !"
