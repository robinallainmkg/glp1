# 🖼️ Guide d'Utilisation des Images - GLP-1 France

## 🚀 Workflow Simple pour Vos Images

### **Étape 1: Placez vos images**
```bash
# Copiez vos fichiers PNG/JPG dans ce dossier :
public/images/uploads/
```

### **Étape 2: Optimisez automatiquement**
```bash
# Optimisation standard (recommandé)
npm run optimize-images

# Avec versions responsives (pour images importantes)
npm run optimize-images:responsive
```

### **Étape 3: Utilisez dans vos articles**
```markdown
![Description de l'image](/images/optimized/mon-image-optimized.jpg)
```

---

## 📁 Structure des Dossiers Images

```
public/images/
├── uploads/           ← VOS IMAGES ICI (PNG/JPG lourds)
├── optimized/         ← Images compressées (utilisez celles-ci)
├── originals/         ← Backup automatique de vos originaux
└── products/          ← Images des produits d'affiliation
```

---

## 🎯 Exemples Concrets

### **Pour un article sur Ozempic**
1. **Placez votre image :** `public/images/uploads/ozempic-injection.png`
2. **Optimisez :** `npm run optimize-images`
3. **Résultat :** 
   - `public/images/optimized/ozempic-injection-optimized.png` (compressé)
   - `public/images/optimized/ozempic-injection.webp` (format moderne)

### **Utilisation dans l'article :**
```markdown
---
title: "Guide Ozempic"
---

# Comment bien utiliser Ozempic

![Technique d'injection Ozempic](/images/optimized/ozempic-injection-optimized.png)

Le processus d'injection est simple...
```

---

## 🛠️ Formats Générés Automatiquement

### **Optimisation Standard**
- ✅ **Image compressée** : Même format, 70% plus légère
- ✅ **Version WebP** : Format moderne, 80% plus léger
- ✅ **Redimensionnement** : Max 1200x800px
- ✅ **Backup original** : Sauvegardé automatiquement

### **Optimisation Responsive** (optionnel)
- ✅ **3 tailles** : 400px, 800px, 1200px
- ✅ **Versions WebP** : Pour chaque taille
- ✅ **Adaptation mobile** : Chargement optimal selon l'écran

---

## 💡 Conseils d'Utilisation

### **Nommage des fichiers**
```bash
# ✅ Bon
ozempic-injection.png
diabete-type2-symptomes.jpg
glp1-perte-poids-avant-apres.png

# ❌ Évitez
IMG_1234.png
photo.jpg
image-sans-nom.png
```

### **Types d'images par usage**
```bash
# Articles principaux
public/images/uploads/article-mon-sujet.png

# Images de produits
public/images/uploads/produit-nom-produit.jpg

# Images d'illustration
public/images/uploads/illustration-concept.png
```

### **Dans vos articles Markdown**
```markdown
# Version simple
![Alt text](/images/optimized/mon-image-optimized.jpg)

# Version avec légende
![Technique d'injection GLP-1](/images/optimized/injection-glp1-optimized.png)
*Figure 1: Technique recommandée pour l'injection sous-cutanée*
```

---

## 🚀 Commandes Disponibles

### **Optimisation de base**
```bash
npm run optimize-images
```
- Compresse toutes les images dans `uploads/`
- Génère versions optimisées + WebP
- Crée les backups automatiquement

### **Optimisation avancée**
```bash
npm run optimize-images:responsive
```
- Tout ce qui précède +
- Versions 400px, 800px, 1200px
- Optimisé pour le responsive design

### **Aide et options**
```bash
node scripts/optimize-images.mjs --help
```

---

## 📊 Résultats Typiques

### **Avant optimisation**
- `mon-image.png` : 800 KB
- Chargement : 3-5 secondes

### **Après optimisation**
- `mon-image-optimized.png` : 240 KB (-70%)
- `mon-image.webp` : 160 KB (-80%)
- Chargement : < 1 seconde

---

## 🔧 Installation des Dépendances

Le script installe automatiquement les outils nécessaires :
- **ImageMagick** : Compression et redimensionnement
- **WebP tools** : Conversion au format WebP moderne

Si installation manuelle nécessaire :
```bash
# macOS
brew install imagemagick webp

# Ubuntu/Debian
sudo apt-get install imagemagick webp
```

---

## 📝 Checklist Rapide

Quand vous avez de nouvelles images :

- [ ] **Placer** les images dans `public/images/uploads/`
- [ ] **Lancer** `npm run optimize-images`
- [ ] **Vérifier** que les images optimisées sont dans `public/images/optimized/`
- [ ] **Utiliser** le chemin `/images/optimized/` dans vos articles
- [ ] **Tester** l'affichage en local avec `npm run dev`

---

## 🎯 Résumé Ultra-Rapide

**3 étapes seulement :**

1. **Copiez** vos PNG/JPG dans `public/images/uploads/`
2. **Lancez** `npm run optimize-images`
3. **Utilisez** `/images/optimized/votre-image-optimized.jpg` dans vos articles

C'est tout ! Le script gère la compression, la conversion WebP, les backups et vous donne les statistiques de compression.
