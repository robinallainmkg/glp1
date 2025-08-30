#!/bin/bash

# Script pour nettoyer les doublons d'introduction dans les articles
echo "🧹 NETTOYAGE DES DOUBLONS D'INTRODUCTION"
echo "======================================="

cleaned=0

find src/content -name "*.md" | while read file; do
    intro_count=$(grep -c "^## Introduction" "$file")

    if [ $intro_count -gt 1 ]; then
        echo "🔧 Nettoyage de : $(basename "$file" .md)"

        # Créer un backup
        cp "$file" "${file}.backup"

        # Supprimer tous les doublons d'introduction sauf le premier
        awk '
        BEGIN { intro_count = 0 }
        /^## Introduction/ {
            intro_count++
            if (intro_count > 1) {
                # Skip this line and the next non-empty lines until next heading
                skip = 1
                next
            }
        }
        skip && /^## / {
            skip = 0
        }
        skip && /^$/ {
            next
        }
        !skip {
            print
        }
        ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"

        ((cleaned++))
        echo "   ✅ Doublons supprimés"
    fi
done

echo ""
echo "🎉 NETTOYAGE TERMINÉ !"
echo "======================"
echo "• Articles nettoyés : $cleaned"
