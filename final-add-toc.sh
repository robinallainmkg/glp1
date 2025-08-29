#!/bin/bash

# Script final pour ajouter des sommaires à tous les articles
echo "🚀 AJOUT DE SOMMAIRES - PHASE FINALE"
echo "===================================="

total_processed=0
total_success=0

find src/content -name "*.md" | while read file; do
    ((total_processed++))

    # Vérifier si le sommaire existe déjà
    if grep -q "## Sommaire\|## Table des matières" "$file"; then
        echo "⏭️ [$total_processed] Sommaire déjà présent dans $(basename "$file")"
        continue
    fi

    echo "📝 [$total_processed] Traitement de : $(basename "$file")"

    # Générer le sommaire
    toc_content=""
    titles_count=0

    grep "^## \|^### \|^#### " "$file" | while read line; do
        ((titles_count++))
        title=$(echo "$line" | sed 's/^#* //' | sed 's/^\*\*//' | sed 's/\*\*$//' | sed 's/^[*]*//' | sed 's/[*]*$//')
        anchor=$(echo "$title" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-//' | sed 's/-$//')
        level=$(echo "$line" | grep -o '^#*' | wc -c)
        indent=""
        if [ $level -gt 2 ]; then
            indent="  "
        fi
        toc_content="${toc_content}${indent}- [$title](#$anchor)\n"
    done

    if [ $titles_count -gt 0 ]; then
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
                printf "$toc_content"
                echo ""
                tail -n +$((frontmatter_end + 1)) "$file"
            } > "${file}.tmp" && mv "${file}.tmp" "$file"

            ((total_success++))
            echo "   ✅ Sommaire ajouté ($titles_count entrées)"
        else
            echo "   ❌ Frontmatter non trouvé"
        fi
    else
        echo "   ⚠️ Aucun titre H2/H3 trouvé"
    fi
    echo ""
done

echo "🎉 TRAITEMENT TERMINÉ !"
echo "======================"
echo "• Articles traités : $total_processed"
echo "• Sommaires ajoutés : $total_success"
echo "• Articles sans titre : $((total_processed - total_success))"
echo ""
echo "📋 PROCHAINES ÉTAPES RECOMMANDÉES :"
echo "1. Vérifier quelques articles pour valider les sommaires"
echo "2. Tester le build pour s'assurer que tout fonctionne"
echo "3. Procéder à l'audit des mots-clés"
