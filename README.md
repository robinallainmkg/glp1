# 🩺 GLP-1 France - Site d'Information et Affiliation

## 🏗️ Architecture Projet (Réorganisé - Août 2025)

### 📁 Structure Optimisée

```
glp1/
├── 📁 config/                      # 🔧 Configuration centralisée
│   ├── astro.config.mjs            # Configuration Astro
│   ├── tailwind.config.js          # Configuration Tailwind CSS
│   ├── site.config.json            # Configuration site global
│   └── vercel.json                 # Configuration déploiement Vercel
├── 📁 src/                         # 💻 Code source principal
│   ├── 📁 pages/                   # 🌐 Pages & Routing Astro
│   │   ├── 📁 admin/               # 👨‍💼 Interface administration
│   │   │   ├── index.astro         # Dashboard principal admin
│   │   │   ├── user-data.astro     # Gestion utilisateurs
│   │   │   └── affiliate-new.astro # Gestion affiliation complète
│   │   ├── 📁 api/                 # 🔌 API REST routes
│   │   │   ├── users.ts            # CRUD utilisateurs
│   │   │   ├── brands.ts           # CRUD marques
│   │   │   ├── products.ts         # CRUD produits
│   │   │   ├── deals.ts            # CRUD deals/promotions
│   │   │   └── affiliate-stats.ts  # Statistiques affiliation
│   │   ├── index.astro             # 🏠 Page d'accueil
│   │   └── [article].astro         # 📄 Pages articles dynamiques
│   ├── 📁 layouts/                 # 🎨 Layouts réutilisables
│   │   ├── BaseLayout.astro        # Layout principal
│   │   ├── ArticleLayout.astro     # Layout articles
│   │   └── AdminLayout.astro       # Layout administration
│   ├── 📁 components/              # 🧩 Composants UI
│   │   ├── 📁 ui/                  # Composants interface basiques
│   │   ├── 📁 admin/               # Composants spécifiques admin
│   │   └── 📁 common/              # Composants communs
│   ├── 📁 content/                 # 📚 Articles & contenu
│   │   └── articles/               # Articles par collection
│   ├── 📁 lib/                     # 📚 Logique métier
│   │   ├── 📁 services/            # Services business
│   │   │   ├── userService.js      # Gestion utilisateurs
│   │   │   └── affiliateService.ts # Gestion affiliation
│   │   ├── 📁 types/               # Types & interfaces
│   │   ├── 📁 utils/               # Utilitaires génériques
│   │   └── supabase.ts             # Client Supabase
│   └── 📁 styles/                  # 🎨 Styles globaux
├── 📁 data/                        # 📊 Données statiques
│   ├── authors-testimonials.json   # Auteurs & témoignages
│   ├── collections.json            # Collections articles
│   └── affiliate-products.json     # Produits affiliés
├── 📁 public/                      # 🖼️ Assets statiques
│   ├── 📁 images/                  # Images publiques
│   ├── favicon.ico                 # Favicon
│   └── robots.txt                  # SEO crawlers
├── 📁 scripts/                     # 🔧 Scripts utilitaires
│   ├── 📁 database/                # Scripts base de données
│   ├── 📁 deployment/              # Scripts déploiement
│   ├── 📁 maintenance/             # Scripts maintenance
│   └── 📁 migration/               # Scripts migration
├── 📁 supabase/                    # 🗄️ Base de données
│   ├── 📁 migrations/              # Migrations DB
│   └── initial-affiliate-data.sql  # Données initiales
├── 📁 docs-complete/               # 📖 Documentation complète
│   ├── README.md                   # Documentation principale
│   ├── GUIDE_ESSENTIEL.md          # Guide essentiel
│   ├── INSTALLATION-SUPABASE-5MIN.md # Setup rapide
│   └── DOCS_MASTER.md              # Architecture détaillée
├── package.json                    # 📦 Dependencies & scripts
└── astro.config.mjs               # 🔗 Redirection vers config/
```

## 🚀 Quick Start

### Installation
```bash
# Clone le projet
git clone https://github.com/robinallainmkg/glp1.git
cd glp1

# Installer dependencies
npm install

# Configuration environnement
cp .env.example .env
# Éditer .env avec vos clés Supabase
```

### Développement
```bash
# Démarrer serveur dev
npm run dev

# Build production
npm run build

# Preview build
npm run preview
```

### Administration
- **Dashboard** : `http://localhost:4321/admin`
- **Utilisateurs** : `http://localhost:4321/admin/user-data`
- **Affiliation** : `http://localhost:4321/admin/affiliate-new`

## 🔧 Technologies

- **Framework** : Astro v4.16.18 (SSG/SSR hybride)
- **Base de données** : Supabase PostgreSQL
- **Styles** : Tailwind CSS + CSS natif
- **Déploiement** : Vercel
- **APIs** : Routes API Astro (REST)

## 📊 Fonctionnalités

### 🌐 Site Public
- ✅ Articles GLP-1 optimisés SEO
- ✅ Collections thématiques
- ✅ Témoignages transformations
- ✅ Système affiliation intégré
- ✅ Performance optimisée

### 👨‍💼 Interface Admin
- ✅ Dashboard statistiques temps réel
- ✅ Gestion utilisateurs (CRUD complet)
- ✅ Gestion affiliation (marques, produits, deals)
- ✅ Monitoring performances
- ✅ Analytics intégrées

### 🔌 APIs REST
- ✅ Authentification sécurisée
- ✅ CRUD utilisateurs
- ✅ CRUD système affiliation
- ✅ Statistiques & analytics
- ✅ Validation données

## 🎯 Avantages Réorganisation

### AVANT (Chaos)
- ❌ 25+ fichiers en racine
- ❌ Scripts dispersés partout
- ❌ Configuration éparpillée
- ❌ Imports complexes `../../../`
- ❌ Documentation fragmentée

### APRÈS (Organisé)
- ✅ Structure claire et logique
- ✅ 5 fichiers racine maximum
- ✅ Configuration centralisée
- ✅ Imports absolus simples
- ✅ Documentation complète

## 🔗 Liens Utiles

- **Documentation** : `./docs-complete/`
- **Configuration** : `./config/`
- **Scripts** : `./scripts/`
- **Supabase** : `./supabase/`

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit changements
4. Push vers la branche
5. Ouvrir Pull Request

---

**Structure organisée, développement fluide, maintenance facile** ✨