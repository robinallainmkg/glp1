# 🎨 GUIDE LEONARDO.AI - DÉMARRAGE RAPIDE

## 🚀 ÉTAPES IMMÉDIATES

### 1. **S'INSCRIRE SUR LEONARDO.AI**
- Aller sur [leonardo.ai](https://leonardo.ai)
- Créer un compte gratuit
- **150 crédits gratuits par jour** ✅

### 2. **CONFIGURER L'INTERFACE**
- Cliquer sur "Image Generation"
- Paramètres recommandés:
  - **Aspect Ratio:** 16:9
  - **Dimensions:** 1024x576px  
  - **Guidance Scale:** 7-10
  - **Quality:** High

### 3. **COMMENCER PAR LA PRIORITÉ 1**

#### 🎯 MÉDICAMENTS GLP-1 (39 images) - À traiter en PREMIER

**Modèle recommandé:** Leonardo Phoenix
**Style:** Medical Photography, Clean, Professional

#### Exemples de prompts prêts à copier-coller:

```
Professional medical illustration about Ozempic (sémaglutide), medical syringe, pharmaceutical vial, GLP-1 molecule structure, ultra-high quality, photorealistic, medical grade, clean composition, medical photography, clean, professional, no text, no people, medical professional style
```

```
Professional medical illustration about Wegovy perte de poids, weight loss injection, medical device, health monitoring, ultra-high quality, photorealistic, medical grade, clean composition, medical photography, clean, professional, no text, no people, medical professional style
```

```
Professional medical illustration about Mounjaro tirzepatide, dual hormone medication, innovative diabetes treatment, ultra-high quality, photorealistic, medical grade, clean composition, medical photography, clean, professional, no text, no people, medical professional style
```

### 4. **WORKFLOW DE GÉNÉRATION**

1. **Copier un prompt** de `scripts/leonardo-prompts-optimized.txt`
2. **Coller dans Leonardo.AI**
3. **Ajuster si nécessaire** (variez légèrement pour éviter la répétition)
4. **Générer l'image**
5. **Télécharger en haute qualité**
6. **Nommer le fichier** selon l'article: `nom-article.jpg`
7. **Placer dans** `/public/images/thumbnails/`

### 5. **NEGATIVE PROMPTS RECOMMANDÉS**
```
cartoon, anime, low quality, blurry, text, watermark, people, faces, logos, branding
```

## 📊 SUIVI DES PROGRÈS

**Vérifier l'avancement:**
```bash
node scripts/leonardo-progress-tracker.mjs
```

**État actuel:**
- ✅ 33 images JPG déjà présentes
- 🎨 96 nouvelles images à générer
- 💳 150 crédits disponibles aujourd'hui
- ⏳ ~3-4 jours pour tout terminer

## 🎯 ORDRE DE PRIORITÉ

1. **MÉDICAMENTS** (39 images) - Urgent ⚡
2. **PERTE DE POIDS** (16 images) - Important 🔥  
3. **DIABÈTE** (15 images) - Important 📈
4. **RÉGIMES** (14 images) - Moyen 🥗
5. **COÛTS** (5 images) - Moyen 💰
6. **MÉDECINS** (5 images) - Faible 👨‍⚕️
7. **RECHERCHE** (2 images) - Faible 🔬

## 💡 CONSEILS LEONARDO.AI

### ✅ BONNES PRATIQUES:
- Utilisez le negative prompt pour éviter les éléments indésirables
- Variez légèrement les prompts pour la diversité
- Sauvegardez en haute qualité (1024x576px minimum)
- Gardez le style médical professionnel cohérent

### ⚠️ ERREURS À ÉVITER:
- Ne pas inclure de texte dans les images
- Éviter les représentations de personnes
- Ne pas utiliser de logos ou marques
- Éviter les styles cartoon/anime

## 🔄 APRÈS GÉNÉRATION

Une fois toutes les images placées dans `/public/images/thumbnails/`:

```bash
# Mettre à jour les frontmatters automatiquement
node scripts/process-grok-images.mjs
node scripts/update-frontmatters-after-grok.mjs

# Vérifier que tout est correct
node scripts/check-image-progress.mjs
```

## 📋 FICHIERS UTILES

- **📄 Tous les prompts:** `scripts/leonardo-prompts-optimized.txt` (1522 lignes)
- **📊 Suivi progrès:** `node scripts/leonardo-progress-tracker.mjs`
- **🔄 Scripts post-génération:** `scripts/process-grok-images.mjs`

---

**🚀 PRÊT À COMMENCER !** 
Vous avez tous les outils pour générer efficacement 96 images professionnelles avec Leonardo.AI.

**Premier objectif:** Terminer les 39 médicaments aujourd'hui avec vos 150 crédits gratuits.
