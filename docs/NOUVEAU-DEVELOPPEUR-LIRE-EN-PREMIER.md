# � GLP1 France - Guide Développeur Complet

> **⚡ NOUVELLE SESSION ?** Tout est dans ce fichier. Pas besoin de chercher ailleurs.

## � Le Projet en 30 Secon## 🎯 Checklist Nouvelle Session

1. ✅ **Lire ce guide** (vous y êtes)
2. ✅ **Test dev** : `npm run dev`
3. ✅ **Test Supabase** : `node scripts/test-supabase-migration.mjs`
4. ✅ **Check affiliation** : http://localhost:4321/collections/glp1-cout/acheter-wegovy-en-france/
5. ✅ **Ajouter produit** : `node scripts/add-product.mjs` (optionnel)

---

> **💡 MIGRATION TERMINÉE** : Système 100% dynamique via Supabase ! Plus de fichiers statiques.

*Dernière mise à jour : 26 août 2025 - Migration Supabase*e** : https://glp1-france.fr (Astro + TinaCMS)
- **Business Model** : Articles + Affiliation (Talika, Nutrimuscle)
- **Base de données** : Supabase (table `products`)
- **Déploiement** : GitHub Actions → Hostinger FTP

## 🏗️ Architecture

```
src/
├── components/
│   ├── InlineAffiliateProduct.astro    ← Produits dans articles ⭐
│   ├── AffiliateSidebar.astro          ← Sidebar produits ⭐
│   └── AdaptiveAffiliateDisplay.astro  ← Logique affichage ⭐
├── layouts/
│   └── ArticleWithAffiliateSidebar.astro ← Template articles
├── lib/
│   ├── affiliate.ts                    ← API Supabase ⭐
│   └── supabase.ts                     ← Connexion DB
└── pages/collections/[collection]/[slug].astro
```

## 💰 Système d'Affiliation (CORE BUSINESS) - ✅ MIGRÉ SUPABASE

### Comment ça marche
1. **Supabase** stocke les produits (table `products`) ⭐
2. **affiliate.ts** récupère et transforme les données dynamiquement
3. **AdaptiveAffiliateDisplay** gère sidebar + inline automatiquement
4. **JavaScript** injecte automatiquement aux paragraphes 2, 5, 7

### ✅ Migration Terminée (26 août 2025)
- ❌ **Anciennes données** : Fichiers MD statiques supprimés
- ✅ **Nouvelles données** : Base Supabase dynamique
- ✅ **Gestion facile** : Interface Supabase + scripts d'aide
- ✅ **Temps réel** : Modifications sans redéploiement

## 🚀 Avantages de la Migration Supabase

### Avant (Fichiers MD)
- ❌ Données statiques dans `/src/content/affiliate-products/`
- ❌ Modification = édition fichier + commit + redéploiement
- ❌ Pas d'interface de gestion
- ❌ Ajout produit = développeur requis

### Après (Supabase)
- ✅ **Données dynamiques** - Mises à jour instantanées
- ✅ **Interface web** - Gestion via Supabase Dashboard
- ✅ **Scripts utilitaires** - `add-product.mjs` pour ajout rapide
- ✅ **API REST** - Évolutivité et intégrations futures
- ✅ **Pas de redéploiement** - Changements visibles immédiatement

### Structure Supabase `products`
```sql
id: uuid
title: string              ← "Time Control 7+ - Talika"
product_id: string         ← "talika-time-control-7-plus"
brand: string              ← "Talika"
category: string           ← "Soin anti-âge"
product_image: string      ← "/images/products/talika-time-control-7.jpg"
external_link: string      ← "https://talika.fr/GLP1"
price: decimal             ← 52.00
discount_percent: integer  ← 15
discount_code: string      ← "GLP1"
featured: boolean          ← true
priority: integer          ← 2
benefits_text: text        ← HTML riche pour les bénéfices
description: text          ← Description simple
slug: string               ← "talika-time-control-7-plus"
```

### Produits Actuels (4 produits)
- **Talika Time Control 7+** → 52€ → 44.20€ (-15%)
- **Talika Bust Phytoserum** → 45.90€ → 39.02€ (-15%)
- **Nutrimuscle Whey Native** → 89.90€ → 79.11€ (-12%)
- **Nutrimuscle Glutamine** → 34.90€ → 30.71€ (-12%)

## 🎨 Composants Optimisés (Août 2025)

### InlineAffiliateProduct.astro
- ✅ **Code promo dans bouton** : "Voir avec GLP1"
- ✅ **Design moderne** : Dégradés, animations
- ✅ **Responsive parfait** : Pas de chevauchement
- ✅ **Badges dynamiques** : Calculés depuis Supabase
- ✅ **Données temps réel** : Plus de fichiers statiques

### Props Interface
```typescript
interface AffiliateProduct {
  productName: string;
  brand: string;
  productImage: string;
  discountPercent?: number;    // Extrait des tags
  promoCode?: string;          // Extrait de l'URL
  externalLink: string;
  saleBadgeText?: string;      // "RECOMMANDÉ", "Promo"
  originalPrice?: number;
  discountedPrice?: number;    // Calculé automatiquement
  isOnSale?: boolean;
}
```

## 🚀 Commandes Essentielles

```bash
# Développement
npm run dev                              # http://localhost:4321

# Tests système d'affiliation ⭐ SUPABASE
node scripts/test-supabase-migration.mjs  # Test complet migration
node scripts/test-page-supabase.mjs       # Test page spécifique
node scripts/add-product.mjs              # Ajouter produit interactif

# Build et déploiement
npm run build
git push origin production               # Auto-deploy
```

## � URLs Importantes

- **Site live** : https://glp1-france.fr
- **Admin** : http://localhost:4321/admin
- **Test article affiliation** : http://localhost:4321/collections/glp1-cout/acheter-wegovy-en-france/

## 🔧 Fonctions Clés (affiliate.ts)

```typescript
// Chargement direct depuis Supabase
getAllAffiliateProducts()                 → Array<AffiliateProduct>
generateSaleBadge(15, true)               → "Promo -15%"
calculateDiscountedPrice(52.00, 15)      → 44.20
generateSlug("Time Control 7+ - Talika") → "time-control-7-talika"
```

## 🔍 Debugging Rapide

### Produits ne s'affichent pas ?
```bash
node scripts/test-supabase-migration.mjs
# Doit montrer 4 produits avec promo et prix calculés
```

### Nouveaux produits ? ⭐ FACILE MAINTENANT
1. **Interface Supabase** → Table `products` → Insert Row
2. **Script interactif** : `node scripts/add-product.mjs`
3. **Résultat immédiat** : Visible sur le site sans redéploiement
4. **Test rapide** : `node scripts/test-supabase-migration.mjs`

### Scripts disponibles
```bash
# Gestion des produits
node scripts/add-product.mjs              # Assistant ajout produit
node scripts/test-supabase-migration.mjs  # Validation complète
node scripts/test-page-supabase.mjs       # Test page spécifique

# SQL (si besoin)
scripts/migrate-to-supabase.sql           # Migration initiale (déjà fait)
```

## 📊 Status Système (26 Août 2025)

- 🟢 **Supabase** : 4 produits, migration MD→DB terminée ✅
- 🟢 **Système dynamique** : Modifications temps réel sans redéploiement
- 🟢 **Interface de gestion** : Supabase Dashboard + scripts interactifs
- 🟢 **Composants** : Optimisés, responsive, code promo dans CTA
- 🟢 **Injection** : Auto paragraphes 2, 5, 7
- 🟢 **Tracking** : URLs enrichies automatiquement
- 🟢 **Mobile** : Design adaptatif sans chevauchement

## 🎯 Checklist Nouvelle Session

1. ✅ **Lire ce guide** (vous y êtes)
2. ✅ **Test dev** : `npm run dev`
3. ✅ **Test Supabase** : `node scripts/test-supabase-direct.mjs`
4. ✅ **Check affiliation** : http://localhost:4321/collections/glp1-cout/acheter-wegovy-en-france/

---

> **💡 IMPORTANT** : Ce fichier contient TOUT. Système d'affiliation = 80% du business model.

*Dernière mise à jour : 26 août 2025*
