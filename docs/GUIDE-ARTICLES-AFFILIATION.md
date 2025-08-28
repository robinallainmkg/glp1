# 📖 Guide de Gestion des Articles et de l'Affiliation

*Dernière mise à jour : 8 janvier 2025*

## 🎯 Vue d'ensemble

Ce guide explique comment gérer les articles et le système d'affiliation du site GLP-1 France. Le système est entièrement automatisé et s'appuie sur TinaCMS pour une gestion simplifiée.

### ✨ Nouvelles Fonctionnalités (Janvier 2025)

- **🖼️ Images produits pleine largeur** : Les images des produits d'affiliation prennent maintenant toute la largeur de la sidebar
- **🔗 Dropdown "Plus" réparé** : Menu déroulant du header fonctionnel avec animation fluide
- **📝 Édition TinaCMS complète** : Tous les textes des produits sont éditables via l'interface TinaCMS
- **🎨 Bienfaits enrichis** : Affichage amélioré des bienfaits produits avec styles visuels
- **🌐 Footer harmonisé** : Footer identique sur toutes les pages avec newsletter et produits recommandés
- **📱 Injection inline intelligente** : Placement contextuel des produits dans le contenu des articles

---

## 📝 Gestion des Articles

### Structure des Collections

Le site est organisé en collections thématiques :

```
src/content/
├── glp1-diabete/           # Articles sur GLP-1 et diabète
├── medicaments-glp1/       # Médicaments GLP-1
├── effets-secondaires-glp1/ # Effets secondaires
├── glp1-perte-de-poids/    # Perte de poids
├── glp1-cout/              # Coûts et remboursements
├── medecins-glp1-france/   # Médecins spécialisés
├── recherche-glp1/         # Recherche scientifique
├── regime-glp1/            # Régimes alimentaires
├── alternatives-glp1/      # Alternatives aux GLP-1
└── affiliate-products/     # Produits d'affiliation
```

### Création d'un Nouvel Article

#### 1. Frontmatter Standard

Chaque article doit avoir ce frontmatter minimum :

```yaml
---
title: "Titre de l'article"
description: "Meta description SEO (150-160 caractères)"
slug: "url-de-l-article"
pubDate: 2025-01-15T00:00:00.000Z
author: "Dr. [Nom]"
category: "Catégorie principale"
collection: "nom-de-la-collection"
thumbnail: "/images/thumbnails/nom-fichier.jpg"
thumbnailAlt: "Description de l'image"
featured: false
priority: 5
schema: Article
enableAffiliation: true
affiliateLayout: ArticleWithAffiliateSidebar
---
```

#### 2. Champs Obligatoires

- **title** : Titre principal (balise H1)
- **description** : Meta description pour le SEO
- **slug** : URL finale de l'article
- **pubDate** : Date de publication au format ISO
- **collection** : Nom de la collection (doit correspondre au dossier)
- **thumbnail** : Chemin vers l'image de miniature

#### 3. Système d'Affiliation Automatique

Ajoutez ces champs pour activer l'affiliation :

```yaml
enableAffiliation: true
affiliateLayout: ArticleWithAffiliateSidebar
affiliateConfig:
  enableAutoInjection: true
  mobileStrategy: both
  maxInlineProducts: 3
  injectionStrategy: auto
```

### Images d'Articles

#### Structure des Images

```
public/images/thumbnails/
├── article-name.jpg        # Image principale (JPG recommandé)
├── article-name.svg        # Image vectorielle (fallback)
└── collection-name.svg     # Image par défaut de collection
```

#### Spécifications Images

- **Format** : JPG (principal), SVG (fallback)
- **Taille** : 1200x630px pour JPG, responsive pour SVG
- **Qualité** : 85% pour optimiser le chargement
- **Alt text** : Toujours renseigner `thumbnailAlt`

---

## 🛍️ Système d'Affiliation

### Vue d'ensemble

Le système d'affiliation est entièrement automatisé et contextuel :
- **4 produits principaux** : 2 Talika + 2 Nutrimuscle
- **Placement intelligent** : Basé sur le contenu de l'article
- **Affichage adaptatif** : Sidebar desktop + blocs inline mobile
- **Gestion TinaCMS complète** : Interface d'administration pour tous les textes
- **Images pleine largeur** : Affichage optimisé dans la sidebar
- **Bienfaits enrichis** : Mise en forme visuelle des avantages produits

### 🎨 Nouvelles Fonctionnalités Produits

#### Images Optimisées
- **Format WebP** : Compression optimale pour de meilleures performances
- **Pleine largeur** : Les images prennent toute la largeur de la sidebar (100%)
- **Hauteur fixe** : 180px avec `object-fit: cover` pour un rendu uniforme

#### Bienfaits Enrichis
Chaque produit affiche maintenant des bienfaits stylisés avec :
- **Zone mise en valeur** : Fond dégradé avec bordure colorée
- **Liste à puces** : Icônes ✅ et mise en forme structurée
- **Texte contextuel** : Lien avec les traitements GLP-1
- **Animation hover** : Effet subtil au survol

#### Édition TinaCMS Complète
Tous les textes sont maintenant éditables via TinaCMS :
- **benefitsText** : Rich text pour les bienfaits avec formatage HTML
- **description** : Description détaillée du produit
- **body** : Contenu principal (sections, détails, etc.)
- **Prévisualisation** : Aperçu temps réel des modifications

### Produits d'Affiliation

#### Structure d'un Produit (Mise à Jour 2025)

```yaml
---
title: "Nom du Produit"
productId: "identifiant-unique"
brand: "Talika" # ou "Nutrimuscle"
category: "Cosmétique" # ou "Complément"
productImage: "/images/products/produit.webp"  # Format WebP
externalLink: "https://lien-affilié.com"
discountPercent: 20
discountCode: "CODE2024"
featured: true
priority: 1
benefitsText: |
  <div class="benefits-highlight">
    <p><strong>🌟 Avantage principal :</strong> Description contextuelle.</p>
    <ul class="benefits-list">
      <li>✅ <strong>Bénéfice 1</strong> détaillé</li>
      <li>✅ <strong>Bénéfice 2</strong> spécifique</li>
      <li>✅ <strong>Bénéfice 3</strong> unique</li>
    </ul>
  </div>
description: "Description détaillée du produit"
---
```

#### Produits Actuels (Janvier 2025)

1. **Talika Bust Phytoserum** - Soin raffermissant pour la poitrine
   - Code : `GLP1` (-10%)
   - Image : `talika-bust-phytoserum.jpg`
   - Bienfaits : Raffermissement, hydratation, actifs naturels

2. **Talika Time Control 7+** - Anti-âge révolutionnaire
   - Code : `GLP1` (-15%)
   - Image : `talika-time-control-7.jpg`
   - Bienfaits : 7 actions anti-âge, fermeté, éclat jeunesse

3. **Nutrimuscle Whey Native** - Protéine premium non dénaturée
   - Code : `GLP1` (-12%)
   - Image : `whey-native.webp`
   - Bienfaits : Préservation musculaire, digestion facile, sans additifs

4. **Nutrimuscle Glutamine** - Acide aminé essentiel
   - Code : `GLP1` (-10%)
   - Image : `glutamine.webp`
   - Bienfaits : Récupération musculaire, santé intestinale, système immunitaire

### Logique de Placement

#### Algorithme de Recommandation

```javascript
// Priorisation automatique
1. Analyse du contenu de l'article
2. Correspondance avec les catégories de produits
3. Priorisation Talika/Nutrimuscle
4. Limitation à 3-4 produits maximum
```

#### Affichage Adaptatif

- **Desktop** : Sidebar fixe à droite + 2 blocs inline
- **Mobile** : 2-3 blocs inline intégrés dans le contenu
- **Tablette** : Hybride sidebar + inline

### Gestion TinaCMS

#### Accès à l'Administration

```bash
# Lancer TinaCMS
npm run dev
# Accéder à http://localhost:4321/admin
```

#### Modification des Produits

1. Aller dans **Collections** → **Affiliate Products**
2. Sélectionner le produit à modifier
3. Mettre à jour les champs nécessaires
4. Sauvegarder les modifications

---

## 🔧 Améliorations Techniques (Janvier 2025)

### 🎨 Interface Utilisateur

#### Footer Harmonisé
- **Identique partout** : Même footer sur homepage, articles et collections
- **Newsletter intégrée** : Formulaire d'inscription avec gestion API
- **Produit recommandé** : 1 produit d'affiliation affiché dans le footer
- **Liens complets** : Mentions légales, politique de confidentialité, contact

#### Menu Navigation Amélioré
- **Dropdown "Plus" fonctionnel** : Menu déroulant avec animation CSS
- **Responsive design** : Adaptation mobile/desktop/tablette
- **Accessibilité** : Navigation clavier et ARIA labels
- **Fermeture automatique** : Clic extérieur ferme le menu

### 🖼️ Gestion des Images

#### Format WebP Optimisé
```
/public/images/products/
├── glutamine.webp          # ✅ Optimisé
├── whey-native.webp        # ✅ Optimisé  
├── talika-bust-phytoserum.jpg  # Legacy
└── talika-time-control-7.jpg   # Legacy
```

#### Styles Images Sidebar
```css
.product-image img {
  width: 100%;              /* Pleine largeur */
  height: 180px;            /* Hauteur fixe */
  object-fit: cover;        /* Recadrage intelligent */
  border-radius: 8px;       /* Coins arrondis */
}
```

### 🎯 Injection Contextuelle

#### Algorithme Intelligent
- **Analyse de contenu** : Détection automatique des sujets
- **Placement optimal** : Après paragraphes spécifiques
- **Évitement doublons** : Produits différents sidebar vs inline
- **Score de pertinence** : Algorithme de matching contextuel

#### Configuration Injection
```javascript
const config = {
  maxInlineProducts: 2,        // Maximum 2 produits inline
  startAfterParagraphs: 2,     // Après 2e paragraphe
  mobileStrategy: 'both',      // Sidebar + inline
  injectionStrategy: 'auto'    // Automatique
};
```

---

## 🔧 Administration Technique

### Scripts Utiles

#### Validation du Système

```bash
# Vérifier les produits d'affiliation
node scripts/validate-tinacms-products.mjs

# Valider les améliorations récentes
node scripts/validate-product-improvements.mjs

# Analyser la structure des articles
node scripts/analyze-articles-structure.mjs

# Générer des images manquantes avec Grok
node scripts/generate-product-images-grok.mjs

# Vérifier l'affichage Talika
node scripts/validate-talika-display.mjs
```

#### Correction Automatique

```bash
# Corriger les frontmatters
node scripts/clean-frontmatter-complete.mjs

# Optimiser les titres
node scripts/optimize-titles-2025.mjs

# Corriger les layouts et imports
node scripts/fix-all-collection-templates.mjs
node scripts/fix-affiliate-imports.mjs

# Debug sidebar et affiliation
node scripts/debug-sidebar.mjs
```

#### Génération de Contenu

```bash
# Générer prompts Grok pour images
node scripts/generate-grok-prompts.mjs

# Enrichir articles courts
node scripts/enrich-short-articles.mjs

# Optimisation SEO finale
node scripts/final-seo-optimization.mjs
```

### Fichiers Clés

#### Configuration Astro
- `astro.config.mjs` - Configuration principale
- `src/content/config.ts` - Schémas des collections

#### Système d'Affiliation
- `src/lib/affiliate.js` - Logique des produits
- `src/lib/content-injection.ts` - Injection automatique
- `src/layouts/ArticleWithAffiliateSidebar.astro` - Layout principal

#### Composants
- `src/components/AffiliateSidebar.astro` - Sidebar desktop
- `src/components/InlineAffiliateProduct.astro` - Blocs inline
- `src/components/AdaptiveAffiliateDisplay.astro` - Affichage adaptatif

---

## 📊 Monitoring et Analytics

### Métriques Importantes

- **Taux de couverture images** : 100% (target)
- **Produits d'affiliation actifs** : 4/4
- **Collections actives** : 9/10
- **Articles avec affiliation** : 100% (automatique)

### Tests de Validation

```bash
# Test d'intégration complet
node scripts/test-4-products-system.mjs

# Validation des images
node scripts/generate-grok-prompts.mjs

# Vérification des imports
node scripts/check-affiliate-integration.mjs
```

---

## 🚀 Déploiement

### Processus de Publication

1. **Créer l'article** avec le frontmatter complet
2. **Ajouter l'image** dans `/public/images/thumbnails/`
3. **Vérifier l'affiliation** (automatique si `enableAffiliation: true`)
4. **Tester localement** avec `npm run dev`
5. **Déployer** sur la branche production

### Checklist Pré-Déploiement

- [ ] Frontmatter complet et valide
- [ ] Image de l'article présente
- [ ] Affiliation activée et fonctionnelle
- [ ] Pas d'erreurs dans la console
- [ ] Sidebar visible sur desktop
- [ ] Blocs inline visibles sur mobile

---

## 🆘 Dépannage

### Problèmes Courants

#### Sidebar Manquante
```bash
# Vérifier les produits
node scripts/debug-sidebar.mjs

# Corriger les imports
node scripts/fix-affiliate-imports.mjs
```

#### Images 404
```bash
# Générer les images manquantes
node scripts/generate-product-images-grok.mjs
```

#### Erreurs de Layout
```bash
# Corriger tous les templates
node scripts/fix-all-collection-templates.mjs
```

### Support

Pour toute question technique :
1. Consulter les logs dans la console
2. Vérifier les scripts de validation
3. Tester avec `npm run dev`
4. Consulter cette documentation

---

## ✅ Checklist de Validation (Mise à Jour 2025)

### Avant Publication d'un Article

- [ ] **Contenu** : Titre optimisé SEO et méta description
- [ ] **Images** : Thumbnail présente et optimisée
- [ ] **Frontmatter** : Tous les champs requis remplis
- [ ] **Affiliation** : `enableAffiliation: true` défini
- [ ] **Preview** : Vérification en mode preview TinaCMS

### Vérification Système d'Affiliation

- [ ] **Produits** : 4 produits actifs (2 Talika + 2 Nutrimuscle)
- [ ] **Images** : Format WebP quand possible
- [ ] **Bienfaits** : Texte enrichi avec HTML structuré
- [ ] **Codes promo** : Codes valides et à jour
- [ ] **Liens** : URLs d'affiliation fonctionnelles

### Interface Utilisateur

- [ ] **Footer** : Identique sur toutes les pages
- [ ] **Menu** : Dropdown "Plus" fonctionnel
- [ ] **Sidebar** : Images pleine largeur, bienfaits visibles
- [ ] **Mobile** : Affichage responsive correct
- [ ] **Newsletter** : Formulaire fonctionnel dans footer

### Tests Techniques

- [ ] **Performance** : Images WebP chargées
- [ ] **JavaScript** : Dropdown et interactions fonctionnels
- [ ] **CSS** : Styles bienfaits appliqués
- [ ] **TinaCMS** : Édition des produits opérationnelle
- [ ] **Injection** : Produits inline contextués

---

## 🎯 Bonnes Pratiques (2025)

### Gestion des Images

```bash
# Préférer le format WebP
/images/products/produit.webp (✅ Recommandé)
/images/products/produit.jpg  (🔄 Legacy)

# Optimiser les dimensions
Largeur: 400-800px
Hauteur: 300-600px
Format: WebP ou JPG optimisé
```

### Édition TinaCMS

1. **Bienfaits produits** : Utiliser la structure HTML recommandée
2. **Rich text** : Privilégier les champs `benefitsText` et `description`
3. **Preview** : Toujours prévisualiser avant publication
4. **Sauvegarde** : Commit automatique des modifications

### Textes d'Affiliation

```html
<!-- Structure recommandée pour benefitsText -->
<div class="benefits-highlight">
  <p><strong>🌟 Point fort :</strong> Description contextuelle avec GLP-1.</p>
  <ul class="benefits-list">
    <li>✅ <strong>Bénéfice 1</strong> détaillé</li>
    <li>✅ <strong>Bénéfice 2</strong> spécifique</li>
    <li>✅ <strong>Bénéfice 3</strong> unique</li>
  </ul>
</div>
```

### Maintenance Régulière

#### Quotidienne
- Vérifier les nouvelles images téléchargées
- Contrôler les modifications TinaCMS

#### Hebdomadaire  
- Exécuter `node scripts/validate-product-improvements.mjs`
- Vérifier les performances des liens d'affiliation

#### Mensuelle
- Mettre à jour les codes promo
- Optimiser les textes de bienfaits
- Analyser les métriques d'affiliation

---

## 📈 Évolutions Futures

### Roadmap 2025

- [x] **Images pleine largeur** : Affichage optimisé sidebar
- [x] **Dropdown "Plus"** : Menu navigation fonctionnel  
- [x] **Édition TinaCMS** : Tous textes produits éditables
- [x] **Footer harmonisé** : Identique sur toutes pages
- [x] **Bienfaits enrichis** : Mise en forme visuelle
- [ ] A/B testing des placements produits
- [ ] Analytics détaillés des conversions
- [ ] Interface d'administration enrichie
- [ ] Optimisation des performances avancée

### Maintenance Optimisée

- **Quotidienne** : Monitoring TinaCMS et images
- **Hebdomadaire** : Validation système avec scripts automatisés
- **Mensuelle** : Optimisation codes promo et liens d'affiliation  
- **Trimestrielle** : Analyse performance et UX
- **Semestrielle** : Mise à jour stratégie produits

### Nouveautés Janvier 2025

✅ **Footer harmonisé** sur 100% des pages  
✅ **Images WebP** pour les produits Nutrimuscle  
✅ **Dropdown fonctionnel** avec animation CSS  
✅ **Édition complète** des textes via TinaCMS  
✅ **Bienfaits visuels** avec mise en forme enrichie  
✅ **Scripts validation** pour monitoring automatisé  

---

*Documentation maintenue par l'équipe technique GLP-1 France*  
*Dernière révision majeure : 8 janvier 2025*
