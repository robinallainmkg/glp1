# 🤖 GÉNÉRATION AUTOMATIQUE LEONARDO.AI

## ✅ SYSTÈME COMPLET CRÉÉ !

Vous avez maintenant 3 scripts pour automatiser complètement la génération d'images :

### 📁 **SCRIPTS DISPONIBLES :**

1. **`setup-leonardo-api.mjs`** - Configuration de l'API
2. **`test-leonardo-api.mjs`** - Test de la configuration  
3. **`leonardo-auto-generator.mjs`** - Génération automatique complète

## 🚀 DÉMARRAGE EN 3 ÉTAPES

### ÉTAPE 1 : Obtenir votre clé API

1. **Aller sur [leonardo.ai](https://leonardo.ai)**
2. **Se connecter** à votre compte
3. **Cliquer sur votre profil** (coin supérieur droit)
4. **User Settings > API Access**
5. **Generate API Key** et copier la clé

### ÉTAPE 2 : Configurer la clé

**Option A - Temporaire :**
```bash
export LEONARDO_API_KEY="sk-votre-cle-ici"
```

**Option B - Permanent :**
```bash
echo 'export LEONARDO_API_KEY="sk-votre-cle-ici"' >> ~/.zshrc
source ~/.zshrc
```

**Option C - Fichier .env :**
```bash
echo 'LEONARDO_API_KEY=sk-votre-cle-ici' > .env
```

### ÉTAPE 3 : Lancer la génération automatique

```bash
# Tester la configuration
node scripts/test-leonardo-api.mjs

# Lancer la génération complète (96 images)
node scripts/leonardo-auto-generator.mjs
```

## 🎯 CE QUI VA SE PASSER

Le script va automatiquement :

✅ **Traiter 96 articles SVG** par ordre de priorité  
✅ **Générer les images** via l'API Leonardo.AI  
✅ **Télécharger automatiquement** dans `/public/images/thumbnails/`  
✅ **Suivre les progrès** en temps réel  
✅ **Gérer les erreurs** et reprendre où ça s'est arrêté  
✅ **Respecter les limites** de l'API (150 crédits/jour)

## 📊 ORDRE DE PRIORITÉ AUTOMATIQUE

1. **MÉDICAMENTS** (39 images) - Leonardo Phoenix
2. **PERTE DE POIDS** (16 images) - Leonardo Diffusion XL  
3. **DIABÈTE** (15 images) - Leonardo Phoenix
4. **RÉGIMES** (14 images) - Leonardo Diffusion XL
5. **COÛTS** (5 images) - Leonardo Phoenix
6. **MÉDECINS** (5 images) - Leonardo Phoenix
7. **RECHERCHE** (2 images) - Leonardo Phoenix

## 💡 AVANTAGES DE L'AUTOMATISATION

- 🕐 **Aucune intervention manuelle** (fonctionne seul)
- 🎨 **Qualité optimale** (modèles et paramètres adaptés par collection)
- 📊 **Suivi en temps réel** (logs détaillés + fichier de progression)
- 🔄 **Reprise automatique** (en cas d'interruption)
- 💳 **Gestion des crédits** (respect des limites quotidiennes)
- 📂 **Nommage automatique** (selon les articles)

## 📋 FICHIERS GÉNÉRÉS

- `scripts/leonardo-api-progress.json` - Progression détaillée
- `scripts/leonardo-api.log` - Logs complets  
- `public/images/thumbnails/*.jpg` - Images générées

## ⏱️ TEMPS ESTIMÉ

- **Avec 150 crédits/jour :** 3-4 jours
- **Avec plan payant :** 2-3 heures complètes
- **Temps par image :** ~2-3 minutes (génération + téléchargement)

## 🎉 RÉSULTAT FINAL

À la fin, vous aurez :
- ✅ **96 images JPG professionnelles** générées automatiquement
- ✅ **Remplacement automatique des SVG** dans tous les articles
- ✅ **Système d'affiliation fonctionnel** avec vraies images
- ✅ **Site web complet** prêt pour production

---

**🚀 COMMANDEZ MAINTENANT :**
```bash
node scripts/leonardo-auto-generator.mjs
```

**Et regardez la magie opérer ! ✨**
