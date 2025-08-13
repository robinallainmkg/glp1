# 🛍️ AFFILIATION SHOPIFY COLLABS - TALIKA

## Configuration mise à jour le 12 août 2025

### 📋 Informations Clés

**Partenaire :** Talika  
**Plateforme :** Shopify Collabs  
**Produit :** Bust Phytoserum (raffermissant post-GLP1)  
**Code promo :** `GLP1`  
**Réduction :** 10%  
**URL de tracking :** https://talika.fr/GLP1  

### 🎯 Attribution et Tracking

- **Attribution :** Via code promo `GLP1` + lien tracké
- **URL courte :** talika.fr/GLP1
- **Tracking Google Analytics :** Shopify Collabs events
- **UTM automatiques :** source=glp1-france, medium=shopify-collabs

### 🔧 Intégration Technique

#### Base de données (affiliate-products.json)
```json
{
  "discountCode": "GLP1",
  "discount": "10%",
  "affiliateUrl": "https://talika.fr/GLP1",
  "price": "49,90 €",
  "originalPrice": "55,45 €"
}
```

#### Gestionnaire (affiliate-manager.ts)
- Interface Product mise à jour avec `discountCode`
- Tracking Shopify Collabs dédié
- UTM paramètres adaptés

#### Composant d'affichage (AffiliateProduct.astro)
- Nouveau design avec code promo en évidence
- Badge de réduction visible
- Bouton CTA avec code intégré
- Styles responsive optimisés

### 🎨 Design Features

#### Code Promo Visuel
- Badge noir/doré accrocheur
- Animation hover pour attirer l'attention
- Affichage dans tous les variants (featured, expanded, compact, card)

#### Bouton CTA
- Texte principal : "Profiter de -10% avec GLP1"
- Code promo intégré dans le bouton
- Couleurs contrastées pour maximum d'impact

#### Pricing
- Prix actuel mis en avant
- Prix barré pour l'ancien tarif
- Badge de réduction proéminant

### 📊 Dashboard Admin

L'onglet Affiliation affiche maintenant :
- Métriques en temps réel (1 produit actif, code GLP1, -10%, statut)
- Tableau avec vraies données Shopify Collabs
- Informations techniques (URL, code, placement, tracking)

### 🚀 Placement Intelligent

Le produit Talika s'affiche automatiquement :
- **Après 2 paragraphes** dans les articles pertinents
- **Selon contexte** : mots-clés liés à perte de poids, raffermissement, beauté
- **Fallback** : en fin d'article si non pertinent au début

### ✅ Checklist de Vérification

- [x] Code promo GLP1 configuré
- [x] URL talika.fr/GLP1 active
- [x] Tracking Shopify Collabs implémenté
- [x] Design code promo optimisé
- [x] Dashboard admin mis à jour
- [x] Placement intelligent fonctionnel
- [x] Tous les variants du composant mis à jour

### 🎯 Prochaines Étapes

1. **Test en production** : Vérifier affichage et tracking
2. **Monitoring des performances** : Suivre clics et conversions
3. **Optimisation continue** : A/B test sur placements et design
4. **Expansion** : Possibilité d'ajouter d'autres produits Talika

### 📞 Support

Pour toute question sur l'affiliation Shopify Collabs :
- Code source : `/src/utils/affiliate-manager.ts`
- Composant : `/src/components/AffiliateProduct.astro`
- Dashboard : `/admin-dashboard` (onglet Affiliation)
- Data : `/data/affiliate-products.json`

## 🔧 CORRECTIONS RÉCENTES (12 août 2025)

### ✅ Problèmes résolus

#### 1. **Doublons d'affichage supprimés**
- ❌ Code promo et réduction affichés plusieurs fois
- ✅ Affichage unique et clair par variant
- ✅ CSS simplifié pour éviter les conflits

#### 2. **Nouveau design de bannière d'affiliation**
- ✅ **Featured variant** : Prix et code promo côte à côte
- ✅ **Expanded variant** : Code promo inline compact
- ✅ **Compact variant** : Une seule ligne "-10% • GLP1"
- ✅ Suppression des anciens styles qui causaient doublons

#### 3. **Placement intelligent amélioré**
- ❌ Bannière en bas de l'article
- ✅ **Insertion après 2 paragraphes** de contenu
- ✅ Découpage intelligent par segments HTML
- ✅ Fallback en fin d'article si contenu trop court

### 🎨 Nouveau design simplifié

#### Featured (bannière principale)
```
[Image avec badge -10%]  |  [Titre + Description]
                         |  [Prix: 49,90€] [Code: GLP1]
                         |  [⭐⭐⭐⭐⭐ 4.6/5]
                         |  [Bouton CTA uni]
```

#### Expanded (dans article)
```
[Titre] - [Prix: 49,90€] [55,45€] [Code: GLP1 (-10%)]
[Bouton simple]
```

#### Compact (sidebar)
```
[Mini image] [Titre]
            [49,90€]
            [-10% • GLP1]
            [Voir →]
```

### 🧪 Pages de test disponibles

1. **http://localhost:4321/test-nouveau-placement**
   - Teste le nouveau placement après 2 paragraphes
   - Contenu long avec découpage intelligent
   - Variant "featured" avec nouveau design

2. **http://localhost:4321/test-shopify-collabs**  
   - Teste tous les variants côte à côte
   - Vérification des doublons (corrigés)
   - Design simplifié et cohérent

3. **http://localhost:4321/test-placement-intelligent**
   - Ancien système pour comparaison

### 🔍 Checklist de vérification

#### Design
- [ ] **Aucun doublon** de code promo ou réduction
- [ ] **Prix et code côte à côte** dans featured
- [ ] **Code promo bien visible** dans tous variants
- [ ] **Responsive** parfait mobile/desktop

#### Placement
- [ ] **Bannière après 2 paragraphes** (pas en bas)
- [ ] **Contenu court** → bannière en fin d'article
- [ ] **Découpage propre** des paragraphes HTML
- [ ] **Fallback intelligent** si pas assez de contenu

#### Fonctionnel
- [ ] **Lien talika.fr/GLP1** fonctionne
- [ ] **Tracking Shopify Collabs** actif
- [ ] **Aucune erreur console** 
- [ ] **Build réussi** sans erreur
