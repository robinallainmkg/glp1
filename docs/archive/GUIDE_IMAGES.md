# 🖼️ Guide de Gestion des Images - GLP-1 France

## 🎯 Système d'Optimisation Automatique

Nous avons mis en place un système complet pour gérer et optimiser automatiquement vos images PNG lourdes.

### 📁 Structure des Dossiers

```
public/images/
├── uploads/          # 📤 Placez vos images PNG ici
├── optimized/        # 🎯 Images optimisées générées
├── originals/        # 💾 Backup des originaux
└── products/         # 🛍️ Images produits existantes
```

## 🚀 Utilisation Simple

### 1. Ajouter vos images
```bash
# Copiez vos fichiers PNG dans le dossier uploads
cp mes-images/*.png public/images/uploads/
```

### 2. Lancer l'optimisation
```bash
# Optimiser toutes les images en une commande
node scripts/image-optimizer.mjs
```

### 3. Récupérer les résultats
- **Images optimisées** : `public/images/optimized/`
- **Code d'intégration** : Fichiers `*-code.html` générés automatiquement
- **Originaux sauvés** : `public/images/originals/`

## 🎨 Types d'Images Reconnus

Le système détecte automatiquement le type selon le nom du fichier :

### Hero Images (`*hero*`, `*banner*`)
- **Qualité** : 85% (haute qualité)
- **Ratio** : 16:9
- **Usage** : Images de bannière, headers

### Images Produits (`*product*`, `*produit*`)
- **Qualité** : 90% (qualité maximale)
- **Ratio** : 1:1 (carré)
- **Usage** : Photos de produits, affiliations

### Images d'Articles (défaut)
- **Qualité** : 80% (qualité standard)
- **Usage** : Illustrations d'articles, contenu

### Miniatures (`*thumb*`, `*miniature*`)
- **Qualité** : 75% (optimisé pour la taille)
- **Usage** : Aperçus, galeries

## 📱 Versions Responsive Générées

Pour chaque image, le système génère automatiquement :

```
image-mobile.webp     (480px)  # Mobile
image-tablet.webp     (768px)  # Tablette
image-desktop.webp    (1200px) # Desktop
image-hero.webp       (1920px) # Full HD

# + versions JPG en fallback
image-mobile.jpg
image-tablet.jpg
image-desktop.jpg
```

## 🔧 Code d'Intégration Automatique

Le système génère automatiquement le code HTML optimisé :

```html
<!-- Exemple généré automatiquement -->
<picture class="responsive-image article-image">
  <source media="(max-width: 480px)" srcset="/images/optimized/mon-image-mobile.webp" type="image/webp">
  <source media="(max-width: 768px)" srcset="/images/optimized/mon-image-tablet.webp" type="image/webp">
  <source media="(max-width: 1200px)" srcset="/images/optimized/mon-image-desktop.webp" type="image/webp">
  <img src="/images/optimized/mon-image-desktop.jpg" 
       alt="mon image" 
       loading="lazy" 
       class="w-full h-auto">
</picture>
```

## 📊 Optimisations Appliquées

### Compression Intelligente
- **PNG → WebP** : Réduction de 80-90% de la taille
- **Progressive JPEG** : Chargement progressif
- **Métadonnées supprimées** : Fichiers plus légers

### Performances Web
- **Lazy loading** automatique
- **Format WebP** prioritaire (avec fallback JPG)
- **Responsive** natif
- **Aspect ratio** préservé

## 🎯 Exemples d'Usage

### Pour un article sur l'ozempic
```bash
# Nommez votre fichier
ozempic-injection-hero.png     # → Détecté comme hero
ozempic-effets.png            # → Détecté comme article
ozempic-produit-thumb.png     # → Détecté comme thumbnail
```

### Pour des produits d'affiliation
```bash
complement-product.png        # → Détecté comme produit
balance-connectee-product.png # → Détecté comme produit
```

## 🛠️ Configuration Avancée

Vous pouvez modifier les paramètres dans `scripts/image-optimizer.mjs` :

```javascript
const CONFIG = {
  quality: {
    hero: 85,      // Qualité images hero
    article: 80,   // Qualité images articles
    product: 90,   // Qualité images produits
    thumbnail: 75  // Qualité miniatures
  },
  sizes: {
    mobile: 480,   // Largeur mobile
    tablet: 768,   // Largeur tablette
    desktop: 1200, // Largeur desktop
    hero: 1920     // Largeur hero
  }
};
```

## 📋 Checklist d'Utilisation

### Avant d'ajouter des images :
- [ ] Nommez vos fichiers de façon descriptive
- [ ] Ajoutez `hero`, `product`, ou `thumb` si nécessaire
- [ ] Placez les fichiers dans `public/images/uploads/`

### Après optimisation :
- [ ] Vérifiez les images dans `public/images/optimized/`
- [ ] Utilisez le code HTML généré dans `*-code.html`
- [ ] Testez l'affichage sur mobile/desktop
- [ ] Vérifiez les performances (DevTools → Network)

## 🎉 Avantages

✅ **Automatisation complète** : Plus besoin de compresser manuellement  
✅ **Multi-format** : WebP moderne + JPG fallback  
✅ **Responsive** : Tailles adaptées automatiquement  
✅ **Performance** : Chargement optimisé  
✅ **Backup** : Originaux préservés  
✅ **Code prêt** : HTML généré automatiquement  

## 🆘 Dépannage

### ImageMagick non installé
```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick
```

### Permissions
```bash
# Si erreur de permissions
chmod +x scripts/image-optimizer.mjs
```

### Test rapide
```bash
# Vérifier qu'ImageMagick fonctionne
convert -version

# Tester le script
node scripts/image-optimizer.mjs
```

---

**Système créé le 13 août 2025 pour GLP-1 France**  
*Optimisation automatique de vos images PNG lourdes en images web performantes*
