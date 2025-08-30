#!/bin/bash

echo "📊 DÉTECTION FINALE DE CONTENU TEMPORAIRE"
echo "=========================================="
echo ""

# Compter le nombre total d'articles
total_articles=$(find src/content -name "*.md" | wc -l)
echo "Total d'articles analysés : $total_articles"
echo ""

# Liste des marqueurs de vrai contenu temporaire
temp_markers="à réécrire\|TODO\|placeholder\|template"

# Articles avec vrai contenu temporaire
temp_files=()
echo "Articles avec VRAI contenu temporaire :"
echo ""

for file in $(find src/content -name "*.md"); do
    if grep -q "$temp_markers" "$file"; then
        article_name=$(basename "$file" .md)
        echo "   📝 $article_name"
        temp_files+=("$file")
    fi
done

temp_count=${#temp_files[@]}
echo ""
echo "📈 RÉSULTATS :"
echo "Nombre d'articles avec vrai contenu temporaire : $temp_count"
echo "Articles de qualité : $((total_articles - temp_count))"
echo "Taux de qualité : $(( (total_articles - temp_count) * 100 / total_articles ))%"
echo ""

if [ $temp_count -gt 0 ]; then
    echo "🎯 PROCHAINES ÉTAPES RECOMMANDÉES :"
    echo "1. Corriger les $temp_count articles avec contenu temporaire"
    echo "2. Commencer par les guides complets et effets secondaires"
    echo "3. Vérifier la cohérence du contenu médical"
    echo ""
    
    echo "📋 ARTICLES À TRAITER EN PRIORITÉ :"
    for file in "${temp_files[@]}"; do
        article_name=$(basename "$file" .md)
        if [[ $article_name == guide-complet-* ]] || [[ $article_name == effets-secondaires-* ]] || [[ $article_name == *-prix ]]; then
            echo "   ⭐ $article_name (PRIORITAIRE)"
        fi
    done
fi
