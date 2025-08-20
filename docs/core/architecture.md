# 🏗️ Architecture Technique

> Architecture complète du site GLP-1 France avec APIs, base de données et déploiement

## 📋 Vue d'Ensemble

### Stack Technique
- **Frontend** : Astro.js v4.16+ avec TailwindCSS
- **CMS** : TinaCMS pour la gestion de contenu
- **Base de données** : Supabase (migration depuis JSON)
- **Hébergement** : Hostinger (mode statique)
- **Déploiement** : Scripts PowerShell automatisés

### Architecture Hybride
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Astro.js      │    │    TinaCMS      │    │   Supabase      │
│   (Static)      │◄──►│   (Content)     │◄──►│  (Database)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Hostinger     │    │   GitHub        │    │   APIs REST     │
│   (Production)  │◄──►│   (Source)      │◄──►│   (Backend)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🗄️ Base de Données

### Migration Supabase (Terminée)

**Avant** : Fichiers JSON locaux
```
data/
├── contact-submissions.json
├── newsletter-subscribers.json
├── guide-downloads.json
├── users-unified.json
└── affiliate-products.json
```

**Après** : Supabase avec RLS
```sql
-- Tables principales
users              -- Utilisateurs avec auth
submissions         -- Contacts et newsletter
deals              -- Produits affiliés
guide_downloads    -- Téléchargements guides
```

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
