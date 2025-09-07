# 📚 DOCUMENTATION TECHNIQUE - INFRASTRUCTURE GLP1 FRANCE

**Version :** 2.1 Production  
**Maintenue par :** Équipe Dev  
**Dernière mise à jour :** 7 septembre 2025

---

## 🏗️ ARCHITECTURE SYSTÈME

### **Framework & Technologies**
```yaml
Framework: Astro.js v4.x
Générateur: Static Site Generator (SSG)
Style: Tailwind CSS + CSS modules
Database: Supabase (produits affiliation)
Déploiement: 137 pages statiques
```

### **Structure Projet**
```
glp1-france/
├── src/
│   ├── content/               # Collections markdown
│   │   ├── traitements-glp1/  # 8 guides principaux
│   │   ├── temoignages/       # 4 témoignages unifiés [NOUVEAU]
│   │   ├── glp1-cout/         # 10 pages prix
│   │   └── ...autres collections
│   ├── layouts/
│   │   ├── BaseLayout.astro   # Layout principal
│   │   └── ArticleWithAffiliateSidebar.astro # Témoignages
│   ├── components/
│   │   ├── SiteHeader.astro   # Navigation principale
│   │   └── AffiliateProducts.astro # Sidebar produits
│   └── styles/
│       └── mounjaro-enhancement.css [NOUVEAU]
├── scripts/                   # Outils d'analyse
│   ├── check-broken-links.mjs # Santé des liens
│   └── analyze-images.mjs     # Santé des images
└── public/
    ├── images/               # Assets images
    └── _redirects           # Redirections Netlify
```

---

## 🎯 SYSTÈME DE COLLECTIONS

### **Collection Témoignages (NOUVEAU)**

**Emplacement :** `src/content/temoignages/`

**Structure Fichier :**
```yaml
# marie-transformation-glp1.md
---
title: "Témoignage Marie : -18kg avec Mounjaro"
slug: "marie-transformation-glp1"
description: "Découvrez comment Marie a perdu 18kg en 8 mois..."
author: "Marie D."
date: "2024-08-15"
featured: true
weight_loss: "18kg"
duration: "8 mois"
medication: "Mounjaro"
age: 34
image: "/images/temoignages/mariejourney9.jpg"
journey_steps:
  - step: 1
    title: "Premier rendez-vous médical"
    description: "Consultation initiale..."
---

# Le contenu markdown complet...
```

**Pages Générées :**
- **Index :** `/collections/temoignages/` (grille des témoignages)
- **Détail :** `/collections/temoignages/[slug]/` (page individuelle)

**Template Pages :**
```astro
// src/pages/collections/temoignages/index.astro
import { getCollection } from 'astro:content';
const temoignages = await getCollection('temoignages');

// src/pages/collections/temoignages/[slug].astro  
import { getCollection } from 'astro:content';
import ArticleWithAffiliateSidebar from '../../layouts/ArticleWithAffiliateSidebar.astro';
```

---

## 💰 SYSTÈME D'AFFILIATION

### **Configuration Supabase**
```javascript
// src/lib/supabase.js
const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = 'your-anon-key'

// Produits chargés : 8 produits actifs
// Table : affiliate_products
// Colonnes : name, description, price, affiliate_link, image_url
```

**Intégration Témoignages :**
```astro
<!-- ArticleWithAffiliateSidebar.astro -->
<main class="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
  <article class="lg:col-span-2">
    <slot /> <!-- Contenu témoignage -->
  </article>
  <aside class="lg:col-span-1">
    <AffiliateProducts /> <!-- 8 produits Supabase -->
  </aside>
</main>
```

---

## 🔗 GESTION DES REDIRECTIONS

### **Fichier Principal :** `public/_redirects`

**Redirections Critiques (Mounjaro) :**
```
# Pages Mounjaro (Traffic Spike)
/pages-statiques/serena-williams-glp1/  /collections/temoignages/serena-williams-glp1/  301
/guides/guide-complet-mounjaro/         /collections/traitements-glp1/guide-complet-mounjaro/  301
/guides/prix-mounjaro-france/           /collections/traitements-glp1/prix-mounjaro-france/  301

# Témoignages Migration
/temoignages/                           /collections/temoignages/  301
/temoignages/marie-transformation/      /collections/temoignages/marie-transformation-glp1/  301
```

**Redirections Collections :**
```
# Anciennes URLs guides → Collections
/guides/*  /collections/traitements-glp1/:splat  301
```

---

## 🛠️ SCRIPTS DE MAINTENANCE

### **1. Analyse Santé des Liens**

**Commande :** `node scripts/check-broken-links.mjs`

**Fonctionnalités :**
- Scan 202 fichiers source (.md, .astro)
- Détection liens internes/externes 404
- Vérification redirections
- Export rapport JSON

**Output Exemple :**
```json
{
  "totalLinks": 1247,
  "brokenLinks": 30,
  "healthScore": 94,
  "brokenByType": {
    "internal": 18,
    "external": 12
  }
}
```

### **2. Analyse Santé des Images**

**Commande :** `node scripts/analyze-images.mjs`

**Fonctionnalités :**
- Scan dossier `/public/images/` (234 images)
- Détection références markdown
- Images manquantes/vides
- Score santé calculé

**Output Exemple :**
```json
{
  "totalImages": 234,
  "referencedImages": 28,
  "missingImages": 0,
  "healthScore": 100
}
```

---

## 🎨 STYLING MOUNJARO

### **Fichier :** `src/styles/mounjaro-enhancement.css`

**Features :**
```css
/* CTA Buttons Optimisés */
.mounjaro-cta {
  background: linear-gradient(135deg, #0066CC 0%, #004499 100%);
  box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3);
  transition: all 0.3s ease;
}

/* Hero Sections */
.mounjaro-hero {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-left: 4px solid #0066CC;
}

/* Stats Transformations */
.transformation-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}
```

**Usage :**
```astro
---
// pages/collections/traitements-glp1/guide-complet-mounjaro.astro
---
<style>
  @import '../../styles/mounjaro-enhancement.css';
</style>
```

---

## 🚀 PROCESSUS DE BUILD

### **Build Production**
```bash
# Commande principale
npm run build

# Résultat attendu
✅ 137 pages générées
✅ 0 erreurs
✅ ~10 secondes
✅ Supabase connecté (8 produits)
```

### **Vérifications Pre-Deploy**
```bash
# 1. Santé des liens
node scripts/check-broken-links.mjs
# Target: >93% healthy

# 2. Santé des images  
node scripts/analyze-images.mjs
# Target: 100% healthy

# 3. Build test
npm run build
# Target: 0 erreurs
```

---

## 🔧 DÉPANNAGE COURANT

### **Erreurs Build Fréquentes**

**1. Import Path Errors**
```
Error: Layout.astro not found
Solution: Vérifier import BaseLayout.astro vs Layout.astro
```

**2. Collection Schema**
```
Error: frontmatter validation failed
Solution: Vérifier structure YAML dans config.ts
```

**3. Image References**
```
Error: Image not found /images/file.png
Solution: Vérifier extension (.jpg vs .png) et chemin
```

### **Navigation Debugging**

**Erreur Commune :**
```astro
<!-- INCORRECT -->
<a href="/guides/guide-name/">

<!-- CORRECT -->  
<a href="/collections/traitements-glp1/guide-name/">
```

**Vérification :**
```bash
# Chercher anciennes références
grep -r "/guides/" src/
grep -r "/temoignages/" src/
```

---

## 📊 MONITORING PRODUCTION

### **KPIs Techniques**
- **Build Time :** <15 secondes
- **Pages Generated :** 137 pages
- **Link Health :** >93%
- **Image Health :** 100%
- **Zero Errors :** Obligatoire

### **KPIs Business**
- **Traffic Mounjaro :** Pages optimisées
- **Conversion Témoignages :** Affiliate sidebar
- **SEO Collections :** Structure unifiée

### **Alertes à Configurer**
```yaml
Broken Links: >10% (current: 6%)
Build Failures: >0
Missing Images: >0
Supabase Down: Connection failed
```

---

## 🔄 PROCESSUS DE MISE À JOUR

### **Ajout Nouveau Témoignage**
1. Créer `src/content/temoignages/nouveau-temoignage.md`
2. Suivre structure YAML existante
3. Ajouter image dans `/public/images/temoignages/`
4. Tester build local
5. Vérifier liens avec script

### **Ajout Guide Mounjaro**
1. Créer dans `src/content/traitements-glp1/`
2. Importer CSS Mounjaro si besoin
3. Ajouter maillage interne
4. Configurer redirections si migration

### **Maintenance Mensuelle**
```bash
# 1. Audit complet
node scripts/check-broken-links.mjs
node scripts/analyze-images.mjs

# 2. Nettoyage logs
npm run clean

# 3. Mise à jour dépendances
npm audit
npm update
```

---

**📞 Support Technique**
- **Build Issues :** Vérifier imports et structure collections
- **Link Health :** Utiliser scripts d'analyse automatiques  
- **Performance :** Optimiser images et maillage interne

**🚀 Site opérationnel avec infrastructure moderne pour traffic spike Mounjaro ! 🎯**
