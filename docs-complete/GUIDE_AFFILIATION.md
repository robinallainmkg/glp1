# 🛒 GUIDE AFFILIATION COMPLET - GLP-1 France

> **Branche de référence : `production`**

## 🎯 Vue d'Ensemble

Le système d'affiliation GLP-1 France utilise un **système de liens d'affiliation classique avec codes promo**. Les produits sont intégrés automatiquement dans le contenu selon des règles contextuelles intelligentes. 

**Important** : Malgré les références "Shopify Collabs" dans le code (tracking), le système fonctionne avec des liens d'affiliation directs et des codes promo, pas via la plateforme Shopify Collabs.

---

## 📋 SYSTÈME TECHNIQUE

### 🔧 Composants Core
- ✅ `src/components/AffiliateProduct.astro` - Composant d'affiliation réutilisable
- ✅ `src/utils/affiliate-manager.ts` - Gestionnaire des produits (données statiques)
- ✅ `data/affiliate-products.json` - Base de données des produits affiliés

### 🎨 Intégration Layouts
- ✅ `src/layouts/ArticleLayout.astro` - Affichage contextuel dans articles
- ✅ `src/layouts/PostLayout.astro` - Encarts automatiques
- ✅ `src/layouts/BaseLayout.astro` - Intégration footer + header
- ✅ `src/layouts/CollectionLayout.astro` - Bannières et grilles collection

### 📄 Pages Créées
- ✅ `src/pages/produits-recommandes.astro` - Index produits affiliés
- ✅ `src/pages/produits/talika-bust-phytoserum.astro` - Page produit Talika

---

## 🛠️ UTILISATION DU DASHBOARD ADMIN

### Accès au Dashboard
1. Rendez-vous sur `/admin-dashboard/`
2. Cliquez sur l'onglet **💰 Affiliation**

### Fonctionnalités Disponibles
- **Gestion des produits** : Ajouter, modifier, supprimer des produits affiliés
- **Suivi des performances** : Tracking des clics et conversions
- **Configuration contextuelle** : Règles d'affichage par collection/article

---

## ✅ CHECKLIST DE DÉPLOIEMENT

### 🔍 Tests Techniques Pre-Déploiement
- [ ] **Composant AffiliateProduct.astro**
  - [ ] Vérifier l'affichage sur tous les variants (compact, expanded, minimal, featured)
  - [ ] Tester le responsive design (mobile, tablet, desktop)
  - [ ] Valider le Schema.org Product markup
  - [ ] Contrôler le tracking des clics d'affiliation
  - [ ] Vérifier les disclaimers d'affiliation

- [ ] **Intégration Layouts**
  - [ ] ArticleLayout.astro : produits avant/après contenu
  - [ ] PostLayout.astro : remplacement des anciens encarts
  - [ ] BaseLayout.astro : footer et header
  - [ ] CollectionLayout.astro : bannière et grille
  - [ ] Tester l'affichage conditionnel basé sur le contexte

### 🎯 Tests Fonctionnels
- [ ] **Navigation et UX**
  - [ ] Page `/produits-recommandes/` accessible et fonctionnelle
  - [ ] Pages produits individuelles (ex: `/produits/talika-bust-phytoserum/`)
  - [ ] Liens d'affiliation correctement trackés
  - [ ] Disclaimers présents et conformes

- [ ] **Performance et SEO**
  - [ ] Temps de chargement optimisés
  - [ ] Métadonnées correctes sur toutes les pages
  - [ ] Schema.org markup validé
  - [ ] Images optimisées et responsive

### 🚀 Déploiement Final
- [ ] Build sans erreurs (`npm run build`)
- [ ] Test sur environnement de staging
- [ ] Déploiement production (`.\deploy-auto.ps1` ou `node deploy-auto.js`)
- [ ] Validation post-déploiement sur site live

---

## 🎯 PRODUITS ACTUELS

### Talika Bust Phytoserum
- **Type** : Liens d'affiliation direct (pas Shopify Collabs)
- **Code promo** : `GLP1` (-10%)
- **URL d'affiliation** : talika.fr/GLP1
- **Contexte** : Articles perte de poids, raffermissement post-GLP1
- **Placement** : Automatique après 2 paragraphes dans articles pertinents
- **Tracking** : Google Analytics + UTM parameters

---

## 🔧 MAINTENANCE

### Ajout d'un Nouveau Produit
1. Modifier `data/affiliate-products.json`
2. Ajouter les visuels dans `public/images/products/`
3. Créer la page produit dans `src/pages/produits/`
4. Tester l'intégration dans le dashboard admin
5. Déployer

### Suivi des Performances
- Utiliser le dashboard admin `/admin-dashboard/`
- Analyser les métriques de clics et conversions
- Ajuster le placement selon les performances
- Optimiser les descriptions et visuels

---

## 📞 SUPPORT

Pour toute question technique ou éditoriale concernant le système d'affiliation, consulter ce guide ou le dashboard admin.
