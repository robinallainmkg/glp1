# 🤖 INSTRUCTIONS AGENT AI - GLP-1 FRANCE

## 📋 CONTEXTE DU PROJET

**Site Web:** https://glp1-france.fr  
**Repository:** https://github.com/robinallainmkg/glp1.git  
**Type:** Site Astro 4.x statique avec collections d'articles GLP-1  
**Déploiement:** GitHub → Hostinger (auto-déploiement)

## 🏗️ ARCHITECTURE TECHNIQUE

### Structure des dossiers
```
glp1-main/
├── src/
│   ├── layouts/BaseLayout.astro (IMPORTANT: CSS avec import '../styles/global.css')
│   ├── pages/ (Pages dynamiques par collection)
│   ├── content/ (Articles .md par collection)
│   └── styles/global.css (29KB CSS complet)
├── data/ (Database JSON des articles)
├── scripts/ (Scripts d'automatisation)
└── deploy.sh (Script de déploiement manuel)
```

### Collections (9 total)
1. **glp1-cout** (Prix) - Couleur: Orange (`article-hero price`)
2. **medicaments-glp1** (Médicaments) - Couleur: Bleu (`article-hero medical`)
3. **glp1-perte-de-poids** (Perte de Poids) - Couleur: Vert (`article-hero weight-loss`)
4. **effets-secondaires-glp1** (Effets) - Couleur: Rouge (`article-hero effects`)
5. **glp1-diabete** (Diabète) - Couleur: Orange (`article-hero diabetes`)
6. **regime-glp1** (Régime) - Couleur: Orange-Jaune (`article-hero nutrition`)
7. **alternatives-glp1** (Alternatives) - Couleur: Cyan (`article-hero alternatives`)
8. **medecins-glp1-france** (Médecins) - Couleur: Vert foncé (`article-hero doctors`)
9. **recherche-glp1** (Recherche) - Couleur: Violet (`article-hero research`)

## 🚀 WORKFLOW DE DÉPLOIEMENT

### Déploiement automatique (RECOMMANDÉ)
```bash
# Sur n'importe quel device
git add .
git commit -m "Description des modifications"
git push origin production  # Déclenche auto-déploiement Hostinger
```

### Déploiement manuel (backup)
```bash
# Depuis glp1-main seulement
npm run build
bash deploy.sh  # Upload direct via SCP
```

## 💻 SETUP NOUVEAU DEVICE

### 1. Cloner le projet
```bash
git clone https://github.com/robinallainmkg/glp1.git
cd glp1
```

### 2. Installation
```bash
npm install
```

### 3. Configuration environnement
```bash
# Windows
npm run dev

# Mac/Linux  
npm run dev
```

### 4. Test local
- **URL:** http://localhost:4321
- **Port:** 4321 (configuré dans package.json)

## 🔧 COMMANDES ESSENTIELLES

### Développement
```bash
npm run dev          # Serveur local
npm run build        # Build production
npm run preview      # Preview du build
```

### Git & Déploiement
```bash
git status           # État des modifications
git add .            # Ajout de toutes les modifications
git commit -m "msg"  # Commit
git push origin main # Push développement
git push origin production  # Push production (auto-déploie)
```

### Scripts d'automatisation
```bash
node scripts/fix-collections.mjs        # Uniformiser collections
node scripts/fix-article-templates.mjs  # Uniformiser templates
```

## 🎨 SYSTÈME DE DESIGN

### CSS Classes principales
```css
.collection-grid     /* Grille des articles */
.article-card        /* Carte d'article */
.article-hero.{type} /* Couleur par collection */
.footer              /* Footer complet avec 4 sections */
```

### Couleurs par collection
```css
.article-hero.price       { background: orange; }
.article-hero.medical     { background: blue; }
.article-hero.weight-loss { background: green; }
.article-hero.effects     { background: red; }
.article-hero.diabetes    { background: orange; }
.article-hero.nutrition   { background: orange-yellow; }
.article-hero.alternatives{ background: cyan; }
.article-hero.doctors     { background: dark-green; }
.article-hero.research    { background: purple; }
```

## 🐛 PROBLÈMES FRÉQUENTS & SOLUTIONS

### 1. CSS ne s'applique pas sur le live
**Cause:** Mauvaise importation CSS dans BaseLayout.astro  
**Solution:** Vérifier que BaseLayout contient `import '../styles/global.css'` dans le frontmatter (pas un <link>)

### 2. Différences localhost vs live
**Cause:** Build/déploiement depuis mauvais dossier  
**Solution:** Toujours travailler dans glp1-main, vérifier `pwd`

### 3. Collections sans couleur
**Cause:** Mauvaise classe CSS sur article-hero  
**Solution:** Exécuter `node scripts/fix-collections.mjs`

### 4. Hook de pre-push échoue
**Solution:** `git push --no-verify` pour contourner temporairement

## 📊 MONITORING & VALIDATION

### Checklist avant déploiement
- [ ] `npm run build` fonctionne
- [ ] Localhost (4321) affiche correctement
- [ ] Toutes les collections ont les bonnes couleurs
- [ ] Footer complet visible
- [ ] Commit & push vers GitHub

### Checklist après déploiement
- [ ] Site live = localhost identique
- [ ] CSS appliqué (couleurs collections)
- [ ] Footer stylé et complet
- [ ] Navigation fonctionnelle

## 🔄 WORKFLOW MULTI-DEVICE

### Synchronisation entre devices
```bash
# Récupérer les dernières modifications
git pull origin main

# Travailler localement
npm run dev

# Pousser les modifications
git add .
git commit -m "Modifications depuis [device]"
git push origin main

# Déployer en production
git push origin production
```

## 📚 DOCUMENTATION TECHNIQUE

- **Architecture:** `DOCUMENTATION_TECHNIQUE.md`
- **Templates:** `TEMPLATE_REFERENCE_ADMIN.md`
- **Collections:** `GUIDE_COLLECTIONS_ARTICLES_2025.md`
- **Déploiement:** `GUIDE_DEPLOYMENT_COMPLET.md`

## 🆘 COMMANDES D'URGENCE

### Reset complet si problème
```bash
# Nettoyer et rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Restaurer version GitHub
```bash
git stash              # Sauvegarder modifications locales
git pull origin main   # Récupérer version GitHub
git stash pop          # Restaurer modifications si besoin
```

---

**⚠️ IMPORTANT:** Toujours vérifier que les modifications sont identiques entre localhost:4321 et glp1-france.fr avant de considérer le déploiement comme réussi.

**🎯 OBJECTIF:** Maintenir une synchronisation parfaite localhost ↔ GitHub ↔ Live avec un design uniforme sur toutes les collections.
