#!/bin/bash

# Script pour ajouter ogImage à tous les fichiers [slug].astro des collections

echo "🔄 Mise à jour des pages de collection avec support ogImage..."

# Liste des collections à mettre à jour
collections=(
  "glp1-diabete"
  "recherche-glp1"
  "alternatives-glp1" 
  "effets-secondaires-glp1"
  "regime-glp1"
  "medecins-glp1-france"
)

for collection in "${collections[@]}"; do
  file="src/pages/collections/$collection/[slug].astro"
  if [ -f "$file" ]; then
    echo "📝 Mise à jour de $file..."
    
    # Ajouter ogImage={entry.data.ogImage} après thumbnail={entry.data.thumbnail}
    sed -i.bak 's/thumbnail={entry.data.thumbnail}/thumbnail={entry.data.thumbnail}\n  ogImage={entry.data.ogImage}/g' "$file"
    
    # Supprimer le fichier de sauvegarde
    rm "$file.bak" 2>/dev/null || true
    
    echo "✅ $collection mis à jour"
  else
    echo "⚠️  $file non trouvé"
  fi
done

echo "🎉 Mise à jour terminée pour toutes les collections !"
