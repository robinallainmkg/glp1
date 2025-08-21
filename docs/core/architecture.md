# Architecture Technique - GLP-1 France

## Vue d'ensemble

Architecture complète du projet GLP-1 France, incluant la structure technique, les APIs, et les décisions d'architecture.

## 🏗️ Architecture Générale

### Stack Technique
- **Framework** : Astro.js v4.16.18 (Static Site Generator)
- **CMS** : TinaCMS (Headless CMS)
- **Base de données** : Supabase + JSON Files
- **Styling** : CSS Custom Properties + Tailwind (composants)
- **Images** : SVG auto-génération + optimisation
- **Déploiement** : Mode statique (Hostinger)

### Configuration Astro

```typescript
// astro.config.mjs
export default defineConfig({
  output: 'static',           // Mode statique pour hébergement
  site: 'https://glp1-france.fr',
  integrations: [
    tailwind(),
    sitemap(),
    tina(),
  ],
  vite: {
    optimizeDeps: {
      include: ['tinacms']
    }
  }
});
```

## 📁 Structure du Projet

```
glp1-github/
├── src/
│   ├── components/          # Composants réutilisables
│   │   ├── AffiliateProduct.astro
│   │   ├── ArticleCard.astro
│   │   ├── SearchBox.astro
│   │   └── ExpertCard.astro
│   ├── layouts/            # Templates de page
│   │   ├── BaseLayout.astro         # Layout principal
│   │   ├── ArticleLayout.astro      # Articles
│   │   ├── CollectionLayout.astro   # Collections
│   │   └── AdminLayout.astro        # Interface admin
│   ├── pages/              # Pages du site
│   │   ├── api/           # Endpoints API
│   │   ├── admin/         # Interface administration
│   │   ├── collections/   # Pages de collections
│   │   ├── guides/        # Pages de guides
│   │   └── index.astro    # Homepage
│   ├── content/           # Contenu géré par TinaCMS
│   │   ├── medicaments-glp1/
│   │   ├── glp1-perte-de-poids/
│   │   ├── glp1-diabete/
│   │   └── [autres-collections]/
│   ├── styles/            # Feuilles de style
│   │   ├── global.css     # Styles globaux
│   │   └── components.css # Styles composants
│   └── utils/             # Fonctions utilitaires
│       ├── affiliate-manager.ts
│       ├── content-helpers.ts
│       └── seo-helpers.ts
├── public/
│   ├── images/            # Assets images
│   │   ├── thumbnails/    # Auto-générées
│   │   ├── uploads/       # Via TinaCMS
│   │   └── experts/       # Photos d'experts
│   └── api/               # APIs PHP (production)
├── data/                  # Base de données JSON
│   ├── users-unified.json
│   ├── affiliate-products.json
│   └── [autres-données].json
├── scripts/               # Scripts de maintenance
│   ├── generate-thumbnails.mjs
│   └── deployment/
└── docs/                  # Documentation
    ├── core/
    ├── features/
    └── operations/
```

## 🔌 Architecture des APIs

### Décisions Techniques

**Problème** : Astro en mode `output: 'static'` ne supporte pas les endpoints API TypeScript en production.

**Solution** : Système hybride TypeScript (dev) + PHP (production)

### Structure des APIs

#### Développement Local (TypeScript)
```
src/pages/api/
├── contact.ts          # Formulaire contact + newsletter
├── guide-beauty.ts     # Téléchargement guide
└── admin-data.ts       # Administration données
```

#### Production (PHP)
```
public/api/
├── users.php           # Gestion utilisateurs
├── delete-user.php     # Suppression utilisateur
└── contact.php         # Formulaire contact
```

### Détection d'Environnement

```typescript
// utils/environment.ts
export function isProduction(): boolean {
  return typeof window !== 'undefined' && 
         !window.location.hostname.includes('localhost');
}

export function getApiUrl(endpoint: string): string {
  if (isProduction()) {
    return `https://glp1-france.fr/api/${endpoint}.php`;
  }
  return `/api/${endpoint}`;
}
```

## � Gestion des Données

### Stratégie Hybride

1. **Développement** : JSON files + Supabase (optionnel)
2. **Production** : JSON files + backups automatiques

### Structure des Données

```typescript
// Types principaux
interface User {
  id: string;
  email: string;
  name?: string;
  source: string;
  preferences: object;
  created_at: string;
}

interface AffiliateProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount_price?: number;
  affiliate_url: string;
  promo_code?: string;
  description: string;
  image_url: string;
}
```

### Fichiers de Données

```
data/
├── users-unified.json           # Base utilisateurs unifiée
├── contact-submissions.json     # Messages de contact
├── newsletter-subscribers.json  # Inscrits newsletter
├── guide-downloads.json        # Téléchargements guide
├── affiliate-products.json     # Produits d'affiliation
├── authors-testimonials.json   # Auteurs et témoignages
├── collections.json            # Métadonnées collections
└── backups/                    # Sauvegardes automatiques
    ├── users-2025-08-20.json
    └── [autres-backups].json
```

## 🎨 Architecture Frontend

### Layouts Système

#### BaseLayout.astro
- Layout principal du site
- Header avec navigation responsive
- Footer avec liens
- SEO metadata
- Scripts Analytics

#### ArticleLayout.astro
- Template pour articles
- Intégration produits affiliés
- Breadcrumbs automatiques
- Related articles
- Schema.org markup

#### CollectionLayout.astro
- Pages de collections
- Filtrage et tri
- Pagination
- Call-to-actions

### Composants Architecture

```typescript
// Exemple : AffiliateProduct.astro
---
interface Props {
  product: AffiliateProduct;
  placement: 'sidebar' | 'inline' | 'footer';
  showDiscount?: boolean;
}

const { product, placement, showDiscount = true } = Astro.props;
---

<div class={`affiliate-product affiliate-product--${placement}`}>
  <!-- Contenu du produit -->
</div>

<style>
  .affiliate-product {
    /* Styles adaptatifs selon placement */
  }
</style>
```

## 🔍 Architecture SEO

### Métadonnées Automatiques

```typescript
// utils/seo-helpers.ts
export function generateSEOData(page: any) {
  return {
    title: `${page.title} | GLP-1 France`,
    description: page.description || page.excerpt,
    image: page.image || '/images/og-default.jpg',
    url: `https://glp1-france.fr${page.url}`,
    type: page.type || 'article',
    publishedTime: page.date,
    modifiedTime: page.updated || page.date
  };
}
```

### Schema.org Intégration

Génération automatique de structured data :
- Article schema pour les posts
- Organization schema pour l'entreprise
- Product schema pour les affiliés
- FAQ schema pour les guides

## 🖼️ Architecture Images

### Génération Automatique

```javascript
// scripts/generate-thumbnails.mjs
const imageStyles = {
  'medicaments-glp1': {
    gradient: 'linear-gradient(135deg, #3B82F6, #1E40AF)',
    icon: '💊',
    textColor: '#FFFFFF'
  },
  'glp1-perte-de-poids': {
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    icon: '⚖️',
    textColor: '#FFFFFF'
  },
  // ... autres styles
};
```

### Optimisation Performance

1. **SVG pour thumbnails** : Taille minimale, scalable
2. **WebP pour photos** : Compression optimale
3. **Lazy loading** : Chargement différé
4. **Responsive images** : Adaptation device

## 🔒 Architecture Sécurité

### Authentification Admin

```typescript
// Simple auth pour dashboard admin
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // À changer en production
};
```

### Validation Données

```typescript
// Validation email côté serveur
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Sanitisation input
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

### Backup Automatique

```typescript
// Backup avant modification
function createBackup(filename: string, data: any) {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupPath = `data/backups/${filename}-${timestamp}.json`;
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
}
```

---

> **Note** : Cette architecture évolue selon les besoins. Voir [Development](development.md) pour le workflow quotidien.

### Configuration Supabase
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY
)

export const supabaseAdmin = createClient(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

## 🔌 APIs

### Architecture API

**Mode** : Astro Static (`output: 'static'`)
**Conséquence** : Endpoints TypeScript non supportés en production
**Solution** : APIs Supabase + Edge Functions

### Endpoints Principaux
```
/api/deals.ts          - Gestion produits affiliés (Supabase)
/api/products.ts       - Recherche produits (Supabase)
/api/contact.ts        - Formulaires contact (Supabase)
/api/newsletter.ts     - Inscriptions newsletter (Supabase)
```

### Sécurité
- **RLS** : Row Level Security sur toutes les tables
- **Auth** : Supabase Auth avec sessions JWT
- **CORS** : Configuration automatique Supabase
- **Rate Limiting** : Protection native Supabase

## 📄 Gestion de Contenu

### TinaCMS Configuration
```typescript
// tina/config.ts
export default defineConfig({
  branch: 'main',
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  
  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },
  
  media: {
    tina: {
      mediaRoot: 'images',
      publicFolder: 'public',
    },
  },
  
  schema: {
    collections: [
      // 9 collections configurées
      medicaments_glp1,
      glp1_perte_de_poids,
      glp1_cout,
      // ... autres collections
    ],
  },
})
```

### Collections Structure
```
src/content/
├── medicaments-glp1/         (19 articles)
├── glp1-perte-de-poids/      (15 articles)
├── glp1-cout/                (12 articles)
├── glp1-diabete/             (14 articles)
├── effets-secondaires-glp1/  (13 articles)
├── medecins-glp1-france/     (11 articles)
├── recherche-glp1/           (12 articles)
├── regime-glp1/              (13 articles)
└── alternatives-glp1/        (10 articles)
Total: 119 articles
```

## 🖼️ Gestion des Images

### Structure Images
```
public/images/
├── thumbnails/               # Images articles (slug-illus.jpg)
│   ├── ozempic-prix-illus.jpg
│   ├── wegovy-avis-illus.jpg
│   └── mounjaro-effets-illus.jpg
├── uploads/                  # Images TinaCMS
└── ai-generated/             # Images IA (20 générées)
```

### Optimisation
- **Format** : JPG 1200x630px (ratio 1.91:1)
- **Compression** : < 200KB par image
- **Lazy Loading** : Automatique avec Astro
- **WebP** : Conversion automatique si supporté
- **Alt Text** : Obligatoire pour accessibilité

## 🚀 Déploiement

### Workflow Automatisé
```powershell
# scripts/deployment/deploy-auto.ps1
1. Validation TinaCMS
2. Build Astro optimisé
3. Upload vers Hostinger (WinSCP)
4. Vérification post-déploiement
```

### Environnements

#### Développement
```bash
npm run dev          # Astro seul
npm run dev:tina     # Astro + TinaCMS
```

#### Production
- **Build** : `npm run build` (génération statique)
- **Upload** : Synchronisation SFTP via WinSCP
- **URL** : https://glp1-france.fr

### Variables d'Environnement
```env
# TinaCMS
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
TINA_TOKEN=your_tina_token
NEXT_PUBLIC_TINA_BRANCH=main

# Supabase
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Production
NODE_ENV=production
ASTRO_TELEMETRY_DISABLED=1
```

## 🔧 Scripts et Automatisation

### Scripts Principaux
```bash
# Déploiement
.\scripts\deployment\deploy-auto.ps1

# Validation système
.\scripts\validate-tina-setup.ps1

# Migration données
.\scripts\check-data-migration.ps1

# Génération images
.\scripts\image-generator.mjs
```

### Monitoring
- **Build Time** : ~2-3 minutes avec TinaCMS
- **Deploy Time** : ~5 minutes total
- **Uptime** : Monitoring Hostinger
- **Performance** : Lighthouse Score 90+

## 📊 Performance

### Métriques Cibles
- **LCP** : < 2.5s (images optimisées)
- **FID** : < 100ms (Astro static)
- **CLS** : < 0.1 (layout stable)
- **Bundle Size** : < 1MB (tree-shaking)

### Optimisations
- **Static Generation** : Pré-rendu complet
- **Image Optimization** : Compression automatique
- **CSS Purging** : TailwindCSS optimisé
- **JS Minimal** : Hydratation partielle Astro

---

**Maintenance** : Scripts automatisés | **Monitoring** : Logs centralisés | **Backup** : Supabase + Git
