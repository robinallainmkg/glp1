# 🛒 GUIDE AFFILIATION COMPLET - GLP-1 France

> **Branche de référence : `production`**

## 🎯 Vue d'Ensemble

Le système d'affiliation GLP-1 France utilise un **système de liens d'affiliation classique avec codes promo**. Les produits sont intégrés automatiquement dans le contenu selon des règles contextuelles intelligentes.

**Important** : Le système fonctionne avec des liens d'affiliation directs et des codes promo, pas via la plateforme Shopify Collabs (malgré les références dans le code pour le tracking).

---

## 📋 ARCHITECTURE TECHNIQUE

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
- ✅ `src/pages/outils/produits-recommandes.astro` - Index produits affiliés
- ✅ `src/pages/produits/talika-bust-phytoserum.astro` - Page produit Talika

---

## 🛠️ DASHBOARD ADMIN

### Accès au Dashboard
1. Rendez-vous sur `/admin-dashboard/`
2. Cliquez sur l'onglet **💰 Affiliation**

### Fonctionnalités Disponibles
- **Gestion des produits** : Ajouter, modifier, supprimer des produits affiliés
- **Suivi des performances** : Tracking des clics et conversions
- **Configuration contextuelle** : Règles d'affichage par collection/article

### Interface Admin Détaillée

Accessible via `/admin-dashboard` > onglet "💰 Affiliation" :

1. **Deals** - Gestion des offres promotionnelles
2. **Partenaires** - Gestion des marques partenaires  
3. **Règles & Preview** - Configuration des règles de placement

---

## 🏗️ SYSTÈME TECHNIQUE AVANCÉ

### Structure des Données

```json
{
  "products": [...], // Produits existants (Talika, Nutrimuscle)
  "deals": [...],    // Nouveaux deals configurables
  "partners": [...], // Partenaires
  "rules": [...]     // Règles de placement (future)
}
```

### API Routes

- `GET/POST/PUT/DELETE /api/affiliate` - CRUD des données d'affiliation
- `POST /api/upload` - Upload d'images (produits/partenaires)
- `GET /api/content-placement-resolver` - Prévisualisation des règles

### Fonctionnalités Implémentées

#### ✅ Phase 1 - Infrastructure
- API routes Astro pour CRUD JSON
- Système d'upload d'images 
- Interface admin étendue avec sous-onglets
- Modales pour création/édition

#### ✅ Composants Réutilisés
- Styles existants du dashboard admin
- Structure de données des produits existants
- Système de placement de `AffiliateProduct.astro`
- Utilitaires UTM de `affiliate-manager.ts`

---

## 💡 UTILISATION PRATIQUE

### Ajouter un Nouveau Deal

1. Aller dans Admin > Affiliation > Deals
2. Cliquer sur "Nouveau Deal"
3. Remplir les informations :
   - Nom du produit
   - Code promo
   - Pourcentage de réduction
   - URL d'affiliation
   - Image du produit
4. Configurer les règles de placement
5. Sauvegarder et tester

### Ajouter un Nouveau Partenaire

1. Admin > Affiliation > Partenaires
2. Remplir les informations de la marque
3. Upload du logo
4. Configuration des paramètres de tracking
5. Activation

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
  - [ ] Page `/outils/produits-recommandes/` accessible et fonctionnelle
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

## 🔧 MAINTENANCE ET SUPPORT

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

### Troubleshooting
- Vérifier les URLs d'affiliation
- Contrôler les codes promo
- Tester le tracking analytics
- Valider l'affichage responsive

---

## 📞 Support Technique

Pour toute question concernant le système d'affiliation :
1. Consulter ce guide
2. Utiliser le dashboard admin
3. Vérifier les logs dans `/admin-dashboard`

---

**Note** : Ce système d'affiliation est conçu pour être évolutif et s'adapter aux besoins croissants de monétisation du site GLP-1 France.
