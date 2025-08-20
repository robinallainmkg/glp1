# 🎛️ Dashboard Admin TinaCMS

> Interface d'administration pour la gestion de contenu du site GLP-1 France

## 🚀 Accès Rapide

### Interface Admin
```
Production: https://glp1-france.fr/admin
Local: http://localhost:4321/admin
```

**🔐 Authentification** : GitHub OAuth (automatique avec accès repository)

## 📊 Vue d'Ensemble du Dashboard

### Collections Disponibles
```yaml
📚 Collections (9 total):
├── 💊 Médicaments GLP-1 (19 articles)
├── 🏥 Perte de Poids (15 articles)  
├── 👨‍⚕️ Témoignages (12 articles)
├── ❓ Guide Questions (10 articles)
├── 🔬 Études Cliniques (8 articles)
├── 💡 Conseils Pratiques (13 articles)
├── 📈 Avant/Après (7 articles)
├── 🍽️ Nutrition (20 articles)
└── 💰 Affiliation (15 articles)
```

**📈 Total** : 119 articles actifs | **🎯 Status** : Production ready

## 🎨 Interface Collections

### Navigation Principale
```
Dashboard TinaCMS
├── 📝 Content (Gestion articles)
│   ├── Créer nouveau
│   ├── Modifier existant  
│   └── Prévisualiser
├── 📁 Media (Gestion images)
│   ├── Upload images
│   ├── Optimisation auto
│   └── Bibliothèque média
└── ⚙️ Settings (Configuration)
    ├── Collections schema
    ├── Utilisateurs
    └── Webhooks
```

### Workflow Editorial
```
1. 📝 Création → Nouveau document
2. ✍️ Rédaction → Éditeur WYSIWYG
3. 🖼️ Médias → Upload et insertion images
4. 📋 Métadonnées → SEO et categorisation
5. 👁️ Préview → Aperçu temps réel
6. 💾 Sauvegarde → Commit Git automatique
7. 🚀 Publication → Deploy en production
```

## 📝 Éditeur de Contenu

### Interface WYSIWYG
```typescript
// Fonctionnalités éditeur
- Formatage riche (gras, italique, listes)
- Insertion d'images avec drag & drop
- Liens internes automatiques
- Prévisualisation en temps réel
- Validation schema automatique
- Auto-sauvegarde toutes les 30s
```

### Champs Personnalisés
```yaml
Article Standard:
  title: "Titre article"
  description: "Meta description (160 char max)"
  category: "Collection sélectionnée"
  tags: ["tag1", "tag2", "tag3"]
  featured_image: "Image principale"
  content: "Contenu riche HTML"
  seo:
    canonical_url: "URL canonique"
    robots: "index,follow"
    og_image: "Image réseaux sociaux"
  affiliate:
    products: ["Produit 1", "Produit 2"]
    commission_rate: "Taux commission"
```

### Validation Temps Réel
```
✅ Titre (30-60 caractères)
✅ Description (120-160 caractères)  
✅ Image featured (ratio 16:9)
✅ Contenu (min 800 mots)
✅ Tags (2-5 tags)
✅ URL slug (auto-généré)
⚠️ Liens internes (recommandé 3-5)
⚠️ Mots-clés SEO (densité 1-2%)
```

## 🖼️ Gestion des Médias

### Upload d'Images
```typescript
// Configuration images
Formats supportés: JPG, PNG, WebP, AVIF
Taille maximum: 5MB par image
Résolution recommandée: 1200x800px (16:9)
Compression automatique: 85% qualité
Génération thumbnails: Auto (150x150, 300x200, 600x400)
Optimisation WebP: Automatique
```

### Bibliothèque Média
```
📁 Images Library (400+ fichiers)
├── 📊 featured/ (Images principales articles)
├── 🏷️ thumbnails/ (Miniatures auto-générées)  
├── 👤 testimonials/ (Photos témoignages)
├── 💊 products/ (Images produits affiliation)
├── 📈 charts/ (Graphiques et infographies)
└── 🎨 ui/ (Éléments interface)
```

### Optimisation Automatique
```powershell
# Traitement automatique upload
1. Compression JPEG/PNG → 85% qualité
2. Génération WebP → Performance
3. Création thumbnails → 3 tailles
4. Validation dimensions → Alerte si problème
5. Alt text suggestion → Amélioration SEO
6. Stockage organisé → Dossier par type
```

## 🔗 Système d'Affiliation

### Dashboard Produits
```yaml
Produits Affiliés (15 actifs):
├── Ozempic (Semaglutide)
│   ├── Commission: 8%
│   ├── Lien: https://partenaire-ozempic.fr/ref/glp1france
│   └── Tracking: UTM automatique
├── Wegovy (Semaglutide)
│   ├── Commission: 6%
│   ├── Lien: https://wegovy-officiel.com/partner/glp1
│   └── Tracking: Conversion pixel
└── Compléments Naturels
    ├── Commission: 15-25%
    ├── Réseau: Commission Junction
    └── Tracking: API intégrée
```

### Insertion Produits
```typescript
// Widget affiliation dans éditeur
<AffiliateProduct 
  product="ozempic"
  position="inline"  // ou "sidebar", "footer"
  style="card"       // ou "button", "banner"
  tracking="true"
/>

// Génération automatique
- Lien avec UTM tracking
- Disclosure légal CNIL
- Bouton CTA optimisé
- Metrics tracking
```

### Analytics Affiliation
```
📊 Métriques disponibles:
├── 👥 Clics totaux par produit
├── 💰 Conversions tracking
├── 📈 Taux conversion par article
├── 🎯 Top performing content
├── 📱 Device breakdown (mobile/desktop)
└── 🌍 Géolocalisation (France focus)
```

## 👥 Gestion Utilisateurs

### Niveaux d'Accès
```yaml
Rôles TinaCMS:
├── 👑 Admin (Tous droits)
│   ├── Gestion utilisateurs
│   ├── Configuration schema
│   ├── Déploiement production
│   └── Analytics complets
├── ✍️ Editor (Éditorial)
│   ├── Création/modification articles
│   ├── Upload images
│   ├── Prévisualisation
│   └── Sauvegarde brouillons
└── 👀 Viewer (Lecture seule)
    ├── Consultation contenu
    ├── Commentaires
    └── Suggestions
```

### Workflow Collaboration
```
1. 👥 Multi-utilisateurs simultanés
2. 🔄 Conflits résolution automatique
3. 💬 Commentaires collaboratifs
4. 📝 Historique modifications
5. 🔔 Notifications temps réel
6. 🌐 Synchronisation Git
```

## ⚙️ Configuration Avancée

### Schema Collections
```typescript
// Example: Médicaments GLP-1 Collection
export const medicamentsSchema = {
  name: "medicaments-glp1",
  label: "Médicaments GLP-1",
  path: "src/content/medicaments-glp1",
  format: "mdx",
  fields: [
    {
      type: "string",
      name: "title",
      label: "Titre",
      required: true,
      validate: (value) => value.length >= 30 && value.length <= 60
    },
    {
      type: "rich-text",
      name: "body",
      label: "Contenu",
      isBody: true,
      templates: [...richTextComponents]
    },
    // ... autres champs
  ]
}
```

### Webhooks Configuration
```typescript
// Auto-deploy sur sauvegarde
export const webhooks = {
  afterSave: async (document) => {
    // Trigger build & deploy
    await fetch('/api/deploy', {
      method: 'POST',
      body: JSON.stringify({ document })
    })
  },
  
  afterDelete: async (document) => {
    // Cleanup orphan images
    await cleanupOrphanAssets(document)
  }
}
```

### Variables d'Environnement
```bash
# Configuration TinaCMS
TINA_CLIENT_ID=your_github_app_id
TINA_TOKEN=your_github_token
TINA_BRANCH=main

# Analytics & Tracking
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
AFFILIATE_TRACKING_ID=your_tracking_id

# Performance
TINA_CACHE_DURATION=3600  # 1 hour
IMAGE_OPTIMIZATION=true
AUTO_DEPLOY=true
```

## 📊 Analytics et Monitoring

### Dashboard Métriques
```
📈 KPIs TinaCMS:
├── 📝 Articles créés (par mois)
├── ✏️ Modifications actives
├── 👥 Utilisateurs actifs
├── 🚀 Déploiements (succès/échecs)
├── 🖼️ Images uploadées
├── 💾 Taille repository
├── ⚡ Performance éditeur
└── 🔄 Sync Git status
```

### Rapports Automatiques
```powershell
# Rapport hebdomadaire automatique
- Articles publiés: 5 nouveaux
- Images optimisées: 25 fichiers
- Performance éditeur: 98% uptime
- Erreurs deploy: 0 échecs
- Top articles: Liste des plus populaires
- Suggestions: Améliorations content
```

## 🚨 Dépannage Admin

### Erreurs Communes

**Échec de sauvegarde**
```typescript
// Solution: Vérifier Git sync
1. Ouvrir admin/debug
2. Vérifier status Git
3. Resync si nécessaire
4. Retry sauvegarde
```

**Images non affichées**
```typescript
// Solution: Vérification assets
1. Vérifier upload terminé
2. Regenerer thumbnails
3. Clear cache navigateur
4. Test autre navigateur
```

**Éditeur lent**
```typescript
// Solution: Optimisation
1. Clear cache TinaCMS
2. Réduire taille images
3. Limiter rich-text content
4. Update navigateur
```

### Support et Debug
```
🔧 Outils de debug:
├── /admin/debug → Status système
├── /admin/logs → Logs erreurs
├── /admin/cache → Gestion cache
├── /admin/sync → Statut Git
└── /admin/health → Health check
```

## 🎯 Bonnes Pratiques

### Workflow Recommandé
```
1. 📅 Planning éditorial mensuel
2. 🎯 1-2 articles par semaine
3. 🖼️ Images optimisées (WebP)
4. 🔗 Liens internes systématiques
5. 📱 Test mobile obligatoire
6. 🚀 Deploy après validation
7. 📊 Suivi analytics post-publication
```

### Optimisation SEO
```yaml
Standards requis:
├── Titre: 30-60 caractères avec mot-clé
├── Description: 120-160 caractères unique
├── H1: Unique et descriptif
├── Images: Alt text optimisé
├── Liens: 3-5 liens internes pertinents
├── Mots-clés: Densité 1-2% naturelle
├── Structure: H2-H6 hiérarchisée
└── Schema: Données structurées auto
```

### Performance Content
```
🎯 Objectifs:
├── ⚡ Temps chargement <3s
├── 📱 Mobile-first responsive
├── 🖼️ Images <500KB optimisées
├── 📝 Contenu >800 mots qualité
├── 🔗 Links ratio interne/externe 3:1
├── 📊 Engagement >2min temps lecture
└── 🎨 UX intuitive et accessible
```

---

**🎉 Admin Ready !** Interface complète pour gestion de contenu professionnel.

**Accès** : [glp1-france.fr/admin](https://glp1-france.fr/admin) | **Support** : [troubleshooting.md](../operations/troubleshooting.md)
