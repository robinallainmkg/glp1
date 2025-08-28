# 🖼️ Gestion des images d'articles - Mise à jour

## ✅ Changements effectués

### 1. Support des images dans ArticleLayout.astro
- ✅ Ajout du prop `ogImage` 
- ✅ Fonction `getArticleImage()` qui priorise `ogImage` puis `thumbnail`
- ✅ Encodage automatique des URLs pour gérer les espaces et caractères spéciaux
- ✅ Affichage des images dans les en-têtes d'articles

### 2. Support des images dans ArticleCard.astro
- ✅ Même logique `getArticleImage()` que ArticleLayout
- ✅ Priorise `ogImage` puis `thumbnail`
- ✅ Encodage automatique des URLs
- ✅ Image de fallback élégante si aucune image n'est disponible
- ✅ Effets hover et transitions améliorés

### 3. Pages concernées par les améliorations
- ✅ **Pages d'articles individuels** : affichage de l'image en en-tête
- ✅ **Pages de collections** : toutes les collections affichent les images des articles
  - `/collections/medicaments-glp1/`
  - `/collections/glp1-perte-de-poids/`
  - `/collections/glp1-diabete/`
  - `/collections/glp1-cout/`
  - `/collections/effets-secondaires-glp1/`
  - `/collections/alternatives-glp1/`
  - `/collections/regime-glp1/`
  - `/collections/recherche-glp1/`
  - `/collections/medecins-glp1-france/`
  - `/collections/avant-apres-glp1/`
- ✅ **Page globale des articles** : `/articles/` affiche toutes les images

## 🎯 Fonctionnement technique

### Priorité des images
1. **`ogImage`** (champ prioritaire)
2. **`thumbnail`** (champ de fallback)
3. **Image générique** (icône 📄 si aucune image)

### Gestion des noms de fichiers
- ✅ Support des espaces dans les noms de fichiers
- ✅ Support des caractères spéciaux (accents, etc.)
- ✅ Encodage automatique avec `encodeURI()`

### Exemple de configuration dans un article
```yaml
---
title: "Mon article"
description: "Description de l'article"
# Image prioritaire (affichée en premier)
ogImage: "/images/thumbnails/Capture d'écran 2025-08-22 à 10.00.22.png"
# Image de fallback
thumbnail: "/images/thumbnails/mon-article-thumb.jpg"
thumbnailAlt: "Description de l'image"
---
```

## 🚀 Résultat
- **Articles individuels** : grande image en en-tête
- **Listes d'articles** : vignettes avec effet hover
- **Performance** : images lazy-loadées
- **Accessibilité** : attributs alt automatiques
- **Responsive** : images adaptatives selon l'écran
