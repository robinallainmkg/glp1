# Documentation Administration - GLP-1 France

## Vue d'ensemble

Le système d'administration de GLP-1 France est organisé dans le dossier `/admin/` et comprend deux modules principaux :

### 🔗 Structure des URLs

- **Dashboard principal** : `/admin/` 
- **Gestion des utilisateurs** : `/admin/user-data/`
- **Gestion de l'affiliation** : `/admin/affiliate/`

## 📁 Architecture des fichiers

```
src/pages/admin/
├── index.astro          # Dashboard principal d'administration
├── user-data.astro      # Gestion des utilisateurs
└── affiliate.astro      # Gestion de l'affiliation
```

## 🎯 Modules d'administration

### 1. Dashboard Principal (`/admin/`)

**Fichier :** `src/pages/admin/index.astro`

**Fonctionnalités :**
- Vue d'ensemble de l'administration
- Accès rapide aux différents modules
- Liens vers le site principal et Supabase

**Navigation :**
- Utilisateurs → `/admin/user-data/`
- Affiliation → `/admin/affiliate/`

---

### 2. Gestion des Utilisateurs (`/admin/user-data/`)

**Fichier :** `src/pages/admin/user-data.astro`

**Fonctionnalités :**
- Liste des utilisateurs inscrits
- Statistiques d'inscription
- Gestion des comptes utilisateurs
- Interface de recherche et filtrage

**Base de données :**
- Table : `users` (Supabase)
- Authentification via Supabase Auth

---

### 3. Gestion de l'Affiliation (`/admin/affiliate/`)

**Fichier :** `src/pages/admin/affiliate.astro`

**Fonctionnalités :**
- **Onglet Marques** : Gestion des marques partenaires
- **Onglet Produits** : Catalogue des produits affiliés
- **Onglet Deals** : Promotions et offres spéciales
- **Onglet Statistiques** : Métriques de performance

**Base de données :**
```sql
-- Tables Supabase utilisées
- brands          # Marques partenaires
- products        # Produits affiliés
- deals           # Promotions actives
- affiliate_stats # Statistiques de performance
```

## 🔧 Configuration technique

### Prérequis
- Astro.js v4.16+
- Supabase (base de données et authentification)
- TailwindCSS pour le styling

### Variables d'environnement
```env
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
TINA_TOKEN=your_tina_token
NEXT_PUBLIC_TINA_BRANCH=main
```

### 🗃️ Migration vers Supabase

#### État de la migration
Le site utilise maintenant **Supabase** pour la gestion des données au lieu des fichiers JSON locaux.

#### Vérification de la migration
```bash
# Vérifier l'état de la migration
.\scripts\migrate-data-to-supabase.ps1 -DryRun

# Effectuer la migration complète (si nécessaire)
.\scripts\migrate-data-to-supabase.ps1

# Test de connexion Supabase
npm run db:test
```

#### Nettoyage des anciens fichiers
```bash
# Supprimer le dossier data/ local (avec sauvegarde)
.\scripts\deployment\deploy-auto.ps1 -CleanLocalData

# Ou directement dans le script de migration
.\scripts\migrate-data-to-supabase.ps1
```

#### Configuration Supabase
- **Tables** : users, deals, products, submissions, newsletters
- **Authentification** : Supabase Auth avec RLS (Row Level Security)
- **API** : Auto-générée via `src/lib/supabase.ts`
- **Déploiement** : Plus de synchronisation du dossier `data/`

### Layout partagé
Toutes les pages admin utilisent le layout `AdminLayout.astro` qui fournit :
- Navigation commune
- Styles uniformes
- Gestion de l'authentification
- Menu latéral responsive

## 🚀 Fonctionnalités CRUD

### Gestion des marques
- ✅ Créer une nouvelle marque
- ✅ Modifier les informations
- ✅ Supprimer une marque
- ✅ Upload de logos

### Gestion des produits
- ✅ Ajouter des produits affiliés
- ✅ Associer aux marques
- ✅ Définir les catégories
- ✅ Gestion des prix et commissions

### Gestion des deals
- ✅ Créer des promotions
- ✅ Définir les périodes de validité
- ✅ Codes de réduction
- ✅ Suivi des performances

## 📊 Statistiques et monitoring

Le module d'affiliation fournit des métriques en temps réel :
- Nombre de clics par produit
- Taux de conversion
- Revenus générés
- Performance par marque

## 🔐 Sécurité

### Authentification
- Accès restreint aux administrateurs
- Sessions sécurisées via Supabase
- Protection CSRF

### Permissions
- Row Level Security (RLS) sur Supabase
- Policies restrictives par rôle
- Audit trail des modifications

## 📱 Interface utilisateur

### Design système
- Interface responsive (mobile-first)
- Composants TailwindCSS
- Icônes Heroicons
- Thème cohérent avec le site principal

### Navigation
- Menu latéral sur desktop
- Menu hamburger sur mobile
- Breadcrumbs pour l'orientation
- Messages de confirmation/erreur

## 🛠️ Maintenance

### Logs et debugging
- Console logs pour les erreurs
- Messages d'état pour les opérations CRUD
- Gestion des erreurs réseau

### Optimisations
- Lazy loading des données
- Cache des requêtes fréquentes
- Pagination pour les listes importantes

## � Gestion de Contenu - TinaCMS

### Vue d'ensemble

TinaCMS est intégré pour offrir une interface d'administration moderne pour la gestion des articles et contenus du site GLP-1 France.

**Accès :** `http://localhost:4321/admin` (en développement)

### 🚀 Démarrage de TinaCMS

**Commandes principales :**
```bash
# Démarrer TinaCMS en mode développement
npm run dev:tina

# Démarrer uniquement Astro
npm run dev

# Build avec TinaCMS
npm run build
```

### 📁 Structure TinaCMS

```
tina/
├── config.ts           # Configuration principale
├── config-local.ts     # Configuration locale
├── config-fixed.ts     # Configuration de backup
└── __generated__/      # Fichiers générés automatiquement
    ├── types.ts
    ├── client.ts
    └── schema.json
```

### 🗂️ Collections configurées

TinaCMS gère **9 collections d'articles** avec des champs standardisés pour un SEO optimal :

#### Collections disponibles :
1. **💊 Médicaments GLP1** (`medicaments_glp1`)
2. **⚖️ GLP1 Perte de Poids** (`glp1_perte_de_poids`)
3. **💰 Coût et Prix** (`glp1_cout`)
4. **🩺 GLP1 et Diabète** (`glp1_diabete`)
5. **⚠️ Effets Secondaires** (`effets_secondaires_glp1`)
6. **👨‍⚕️ Médecins France** (`medecins_glp1_france`)
7. **🔬 Recherche GLP1** (`recherche_glp1`)
8. **🥗 Régime GLP1** (`regime_glp1`)
9. **🔄 Alternatives GLP1** (`alternatives_glp1`)

### 🏗️ Champs standardisés

Chaque article dispose des champs suivants pour un SEO et une gestion optimaux :

#### Champs de base
- **Titre** : Titre principal (H1 et meta title)
- **Meta Description** : Description SEO (150-160 caractères)
- **Slug** : URL de l'article
- **Collection** : Sélection de la collection d'appartenance

#### Informations de publication
- **Date de publication** : Date de création
- **Date de mise à jour** : Dernière modification
- **Auteur** : Sélection parmi les auteurs prédéfinis

#### SEO et catégorisation
- **Catégorie principale** : Guide médical, Témoignage, etc.
- **Mots-clés** : Tags pour le référencement
- **Article en vedette** : Mise en avant sur l'accueil
- **Priorité d'affichage** : Ordre dans les listes

#### Images et médias
- **Image principale** : Thumbnail principal (1200x630px recommandé)
- **Texte alternatif** : Description pour l'accessibilité
- **Image Open Graph** : Image pour réseaux sociaux

#### SEO avancé
- **Titre SEO personnalisé** : Meta title spécifique
- **URL canonique** : Gestion des doublons
- **Exclusion moteurs** : Option noindex
- **Schema.org** : Type de contenu structuré

#### Contenu
- **Corps de l'article** : Éditeur riche Markdown
- **Temps de lecture** : Calcul automatique

### 🔧 Configuration technique

#### Variables d'environnement
```env
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
TINA_TOKEN=your_tina_token
NEXT_PUBLIC_TINA_BRANCH=main
```

#### Authentification
- **Client ID** : Intégration avec Tina Cloud
- **Branch** : Synchronisation avec Git (main)
- **Token** : Accès sécurisé à l'API

### 📸 Gestion des images

#### Structure des images
```
public/images/
├── thumbnails/         # Images des articles
│   ├── article-slug.jpg
│   └── article-slug-illus.jpg
└── uploads/           # Images uploadées via TinaCMS
```

#### Configuration média
- **Dossier racine** : `public/images`
- **Formats supportés** : JPG, PNG, WebP
- **Taille recommandée** : 1200x630px pour les thumbnails
- **Optimisation** : Compression automatique

### 🎯 Workflow éditorial

#### 1. Création d'article
1. Accéder à `/admin` → TinaCMS
2. Sélectionner la collection appropriée
3. Cliquer sur "New [Collection]"
4. Remplir les champs obligatoires
5. Ajouter le contenu Markdown
6. Sauvegarder

#### 2. Gestion des images
1. Uploader l'image principale via TinaCMS
2. Ajouter le texte alternatif
3. L'image apparaît automatiquement dans :
   - L'article lui-même
   - Les listes de collections
   - Les cartes d'articles
   - Les métadonnées Open Graph

#### 3. Publication
- **Automatique** : Sauvegarde = publication immédiate
- **Git sync** : Commits automatiques vers le repository
- **Deploy** : Redéploiement auto via Vercel/Netlify

### 📝 Gestion des métadonnées SEO

#### Champs critiques pour le SEO
- **Meta Description** : 150-160 caractères maximum
- **Titre SEO** : 50-60 caractères (inclut automatiquement "| GLP-1 France")
- **Mots-clés** : 3-5 mots-clés principaux séparés par des virgules
- **URL canonique** : Eviter les doublons de contenu

#### Bonnes pratiques métadonnées
```markdown
---
title: "Ozempic pour Maigrir : Guide Complet 2024"
metaDescription: "Découvrez comment Ozempic aide à perdre du poids, ses effets secondaires, prix et alternatives. Guide médical complet 2024."
slug: "ozempic-perte-de-poids-guide"
pubDate: 2024-01-15
keywords: ["ozempic maigrir", "perte de poids", "GLP-1", "diabète type 2"]
---
```

#### Validation automatique des métadonnées
Le script de déploiement vérifie automatiquement :
- Format correct des dates (sans quotes)
- Longueur des meta descriptions
- Présence des champs obligatoires
- Cohérence des slugs avec les noms de fichiers

### 🖼️ Gestion avancée des images

#### Convention de nommage
```
public/images/thumbnails/
├── ozempic-perte-de-poids-illus.jpg    # Format standard
├── wegovy-prix-france-illus.jpg        # Slug + "-illus.jpg"
└── mounjaro-effets-secondaires-illus.jpg
```

#### Optimisation des images
- **Résolution recommandée** : 1200x630px (ratio 1.91:1)
- **Format** : JPG pour les photos, PNG pour les graphiques
- **Poids** : < 200KB après compression
- **Alt text** : Description précise pour l'accessibilité

#### Génération automatique d'images
```powershell
# Script pour générer des images manquantes
.\scripts\image-generator.mjs --collection="medicaments-glp1" --missing-only
```

#### Images responsive
Les images sont automatiquement optimisées avec :
- **Lazy loading** : Chargement à la demande
- **WebP fallback** : Conversion automatique si supporté
- **Responsive sizes** : Adaptation mobile/desktop

### 🔧 Configuration TinaCMS avancée

#### Variables d'environnement critiques
```env
# Obligatoires pour TinaCMS
NEXT_PUBLIC_TINA_CLIENT_ID=d2c40213-494b-4005-94ad-b601dbdf1f0e
TINA_TOKEN=your_tina_token_here
NEXT_PUBLIC_TINA_BRANCH=main

# Optionnelles pour l'optimisation
NEXT_PUBLIC_TINA_SEARCH_ENABLED=true
TINA_GRAPHQL_ENDPOINT=https://content.tinajs.io/content/your-site-id/github/main
```

#### Personnalisation des champs
Pour ajouter un nouveau champ à toutes les collections :
```typescript
// tina/config.ts
const baseFields = [
  // ... champs existants
  {
    type: "string",
    name: "nouveauChamp",
    label: "Nouveau Champ",
    description: "Description du nouveau champ"
  }
]
```

#### Permissions et sécurité
- **Branch protection** : Commits validés uniquement
- **User roles** : Admin, Editor, Contributor
- **Content approval** : Workflow de validation optionnel

### 🚀 Optimisation des performances

#### Build optimisé
```bash
# Build avec optimisations TinaCMS
npm run build:optimized

# Build rapide pour développement
npm run build:dev

# Build avec analyse des bundles
npm run build:analyze
```

#### Cache et CDN
- **Static assets** : Mise en cache automatique (1 an)
- **Images** : Compression et WebP automatique
- **CSS/JS** : Minification et tree-shaking
- **TinaCMS admin** : Chargement à la demande

### 🔍 Monitoring et analytics

#### Métriques TinaCMS
- **Articles créés** : Tracking par collection
- **Images uploadées** : Suivi de l'utilisation de stockage
- **Temps de build** : Optimisation continue
- **Erreurs de validation** : Alertes automatiques

#### Dashboard de contenu
```bash
# Générer un rapport de contenu
npm run content:report

# Vérifier la cohérence des métadonnées
npm run meta:validate

# Analyser les images manquantes
npm run images:audit
```

### 🔄 Synchronisation

#### Git Integration
- **Auto-commit** : Chaque modification génère un commit
- **Branch protection** : Travail sur la branche principale
- **Historique** : Suivi des versions via Git

#### Données
- **Format** : Fichiers Markdown avec frontmatter YAML
- **Stockage** : Repository Git + média sur CDN
- **Backup** : Historique Git complet

### 🛠️ Maintenance TinaCMS

#### Commandes utiles
```bash
# Régénérer le schéma
npx @tinacms/cli build

# Nettoyer le cache
rm -rf tina/__generated__

# Réinitialiser la configuration
npm run tina:init

# Vérifier la santé du système
npm run tina:health-check
```

#### Dépannage courant
- **Port occupé** : `taskkill /f /im node.exe` puis relancer
- **Erreur de schéma** : Vérifier les noms de collections (underscores uniquement)
- **Images manquantes** : Vérifier les chemins dans `public/images/`
- **Build fail** : Vérifier les métadonnées et dates au bon format

#### Maintenance préventive
```bash
# Vérification hebdomadaire
npm run system:check-all

# Sauvegarde des configurations
git add tina/ && git commit -m "Backup TinaCMS config"

# Optimisation des images
npm run images:optimize

# Validation complète du contenu
npm run content:validate-all
```

#### Résolution des erreurs fréquentes

**1. Erreur "Invalid frontmatter"**
```bash
# Localiser les articles avec erreurs
grep -r "pubDate:" src/content/ | grep "'"

# Corriger automatiquement
node scripts/fix-quoted-pubdate.mjs
```

**2. Images 404**
```bash
# Identifier les images manquantes
npm run images:find-missing

# Générer les images manquantes
npm run images:generate-missing
```

**3. Erreurs de build TinaCMS**
```bash
# Nettoyer complètement
rm -rf node_modules tina/__generated__ .astro dist
npm install
npm run build
```

#### Monitoring automatisé
Le script `deploy-auto.ps1` vérifie automatiquement :
- Configuration TinaCMS valide
- Collections définies correctement
- Images thumbnails présentes
- Métadonnées cohérentes
- Variables d'environnement

### 🔄 Scripts d'automatisation

#### Scripts de maintenance disponibles
```powershell
# Validation complète du système TinaCMS
.\scripts\validate-tina-setup.ps1

# Validation avec correction automatique
.\scripts\validate-tina-setup.ps1 -FixIssues

# Rapport détaillé avec tous les détails
.\scripts\validate-tina-setup.ps1 -Verbose

# Déploiement complet avec vérifications
.\scripts\deployment\deploy-auto.ps1

# Déploiement rapide (skip vérifications TinaCMS)
.\scripts\deployment\deploy-auto.ps1 -SkipTinaCheck

# Génération d'images manquantes
.\scripts\image-generator.mjs --missing-only

# Optimisation des métadonnées
.\scripts\final-seo-optimization.mjs

# Validation de la structure
.\scripts\debug-title.mjs
```

#### Workflow de validation recommandé
1. **Validation quotidienne** : `.\scripts\validate-tina-setup.ps1`
2. **Correction automatique** : `.\scripts\validate-tina-setup.ps1 -FixIssues`
3. **Génération images** : `.\scripts\image-generator.mjs --missing-only`
4. **Déploiement** : `.\scripts\deployment\deploy-auto.ps1`

#### Automatisation des tâches répétitives
- **Images** : Génération automatique des thumbnails manquantes
- **SEO** : Validation et optimisation des métadonnées
- **Performance** : Compression et optimisation des assets
- **Qualité** : Vérification des liens et de la cohérence

### 📊 Statistiques de contenu

#### Contenu actuel
- **9 collections** configurées
- **119 articles** au total
- **20 images AI** générées
- **Routing fonctionnel** pour toutes les collections

#### Performance
- **Build time** : ~2-3 minutes avec TinaCMS
- **Hot reload** : Modifications en temps réel
- **SEO score** : Optimisé avec tous les champs meta

---

- [ ] Système de notifications push
- [ ] Export des données en CSV/Excel
- [ ] Historique des modifications
- [ ] Dashboard analytics avancé
- [ ] Gestion des rôles utilisateurs
- [ ] API REST pour intégrations tierces

---

**Dernière mise à jour :** Août 2025  
**Version :** 1.0  
**Mainteneur :** Équipe GLP-1 France
