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
```

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

## 📋 TODO / Améliorations futures

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
