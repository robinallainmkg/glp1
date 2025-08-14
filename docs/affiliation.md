# Documentation du Système d'Affiliation Avancé

## Architecture

Le système d'affiliation utilise l'architecture Astro.js existante avec des API routes pour la gestion des données JSON.

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
- `GET /api/preview-resolve` - Prévisualisation des règles

### Interface Admin

Accessible via `/admin-dashboard` > onglet "💰 Affiliation" :

1. **Deals** - Gestion des offres promotionnelles
2. **Partenaires** - Gestion des marques partenaires  
3. **Règles & Preview** - Configuration des règles de placement

## Fonctionnalités Implémentées

### ✅ Phase 1 - Infrastructure
- API routes Astro pour CRUD JSON
- Système d'upload d'images 
- Interface admin étendue avec sous-onglets
- Modales pour création/édition

### ✅ Composants Réutilisés
- Styles existants du dashboard admin
- Structure de données des produits existants
- Système de placement de `AffiliateProduct.astro`
- Utilitaires UTM de `affiliate-manager.ts`

## Utilisation

### Ajouter un Nouveau Deal

1. Aller dans Admin > Affiliation > Deals
2. Cliquer "➕ Nouveau Deal" 
3. Remplir le formulaire :
   - Partenaire (Talika/Nutrimuscle)
   - Titre, code promo, réduction
   - Dates de validité
   - URL de tracking avec UTM
   - Image du produit (upload)
   - Priorité pour la résolution de conflits

### Ajouter un Partenaire

1. Aller dans Admin > Affiliation > Partenaires
2. Cliquer "➕ Nouveau Partenaire"
3. Nom, site web, logo, statut

### Prévisualiser les Règles

1. Aller dans Admin > Affiliation > Règles & Preview
2. Saisir un chemin de test (ex: `/articles/effets-secondaires-glp1`)
3. Ajouter des tags (ex: `glp1,effets-secondaires`)
4. Cliquer "🔍 Prévisualiser"

## Déploiement Local/Prod

### Sync des Images
```bash
# Script existant pour sync images
./download-images.ps1
```

### Données
Les données sont stockées dans `data/affiliate-products.json` et synchronisées via Git.

## Roadmap

### Phase 2 - Règles Avancées
- [ ] CRUD des règles de placement
- [ ] Système de poids et priorités
- [ ] Matching avancé (collections, tags, chemins)

### Phase 3 - Analytics
- [ ] Tracking des clics
- [ ] Rapports de performance
- [ ] A/B testing des placements

### Phase 4 - Optimisations
- [ ] Cache des règles
- [ ] Lazy loading des images
- [ ] SEO structured data
