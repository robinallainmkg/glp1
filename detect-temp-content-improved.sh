#!/bin/bash

echo "📊 DÉTECTION DE CONTENU TEMPORAIRE AMÉLIORÉE"
echo "=============================================="
echo ""

# Compter le nombre total d'articles
total_articles=$(find src/content -name "*.md" | wc -l)
echo "Total d'articles analysés : $total_articles"
echo ""

# Détecter le vrai contenu temporaire (excluant les faux positifs)
temp_count=0
echo "Articles avec vrai contenu temporaire :"
echo ""

for file in $(find src/content -name "*.md"); do
    # Vérifier les marqueurs de contenu temporaire
    if grep -q "à réécrire\|TODO\|placeholder\|template" "$file"; then
        echo "   📝 $(basename "$file" .md)"
        ((temp_count++))
    # Vérifier "temporaire" mais exclure les contextes légitimes
    elif grep -q "temporaire" "$file"; then
        # Vérifier si c'est dans un contexte médical légitime
        if ! grep -A2 -B2 "temporaire" "$file" | grep -q "effets secondaires\|gastro-intestinaux\|bénins\|généralement"; then
            echo "   📝 $(basename "$file" .md) (mot 'temporaire' suspect)"
            ((temp_count++))
        fi
    fi
done

echo ""
echo "Nombre d'articles avec contenu temporaire : $temp_count"
echo "Articles propres : $((total_articles - temp_count))"
