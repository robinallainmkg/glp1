# 📚 Documentation Centrale GLP-1 France

> **Branche de référen## 📊 Dashboard admin et donnée---

## 🔗 APIs et système de données (**NOUVEAU**)

### APIs développées
- **[src/pages/api/contact.ts](./src/pages/api/contact.ts)** — API de contact avec newsletter
- **[src/pages/api/guide-beauty.ts](./src/pages/api/guide-beauty.ts)** — API pour téléchargement de guide
- **[src/pages/api/admin-data.ts](./src/pages/api/admin-data.ts)** — API d'administration des données

### Base de données (JSON)
- **[data/contact-submissions.json](./data/contact-submissions.json)** — Soumissions de contact
- **[data/newsletter-subscribers.json](./data/newsletter-subscribers.json)** — Inscrits newsletter
- **[data/guide-downloads.json](./data/guide-downloads.json)** — Téléchargements de guide

### Sécurité et validation
- Validation des emails côté serveur
- Protection CORS pour les APIs
- Authentification basique pour l'admin
- Autocomplete activé sur les formulaires sécurisés
- Stockage sécurisé des données utilisateurs

### Formulaires sécurisés (**AMÉLIORÉS**)
- **[src/pages/contact.astro](./src/pages/contact.astro)** — Formulaire de contact sécurisé
- **[src/pages/guide-beaute-perte-de-poids-glp1.astro](./src/pages/guide-beaute-perte-de-poids-glp1.astro)** — Formulaire guide optimisé

**Améliorations apportées** :
- Suppression du terme "beauté" dans les libellés du formulaire guide
- Activation de l'autocomplete pour une meilleure UX
- Validation en temps réel des données
- Intégration newsletter automatique
- Messages de confirmation et d'erreur améliorés

---

## 🔧 Administration

### Interface Admin
- `/admin-dashboard/` - Dashboard principal
- `/admin-user-data/` - Gestion des utilisateurs (source: users-unified.json)
- `/admin-affiliation/` - Gestion des produits affiliés

### APIs Utilisateurs
- `/api/users.php` - Liste des utilisateurs (GET)
- `/api/delete-user.php` - Suppression avec backup (POST)

> **Note**: Configuration `output: 'static'` → APIs en PHP pour compatibilité Hostinger

---

## 🧠 Logique d'audit de pertinence utilisateurs

### Dashboard principal
- Le dashboard admin est désormais unique : [src/pages/admin-dashboard.astro](./src/pages/admin-dashboard.astro)
- Le dashboard SEO visuel a été supprimé (anciennement `seo-analysis/dashboard.html`).
- Le score de pertinence de chaque article est affiché dans la tab Articles du dashboard admin.
- La colonne Action affiche uniquement un bouton "voir" pour accéder à l'article.

### Dashboard données utilisateurs (**NOUVEAU**)
- **URL** : https://glp1-france.fr/admin-user-data/
- **Page** : [src/pages/admin-user-data.astro](./src/pages/admin-user-data.astro)
- **API** : [src/pages/api/admin-data.ts](./src/pages/api/admin-data.ts)

**Fonctionnalités** :
- Affichage des données réelles des utilisateurs inscrits
- Liste des inscriptions newsletter avec source de provenance
- Statistiques détaillées des soumissions (contact, guide)
- Export CSV des données
- Interface sécurisée avec authentification basique
- Graphiques et métriques en temps réel

**Données collectées** :
- Inscriptions newsletter (email, nom, source, date)
- Soumissions de contact (nom, email, message, newsletter opt-in)
- Téléchargements de guide (préoccupations, newsletter consent)
- Statistiques agrégées par source et par période`production`**

Ce fichier centralise et référence toutes les documentations essentielles du projet GLP-1 France.

---

## 📋 Documentation Principale

- [README.md](./README.md) — Installation, déploiement et présentation générale
- [GUIDE_ESSENTIEL.md](./GUIDE_ESSENTIEL.md) — Workflow quotidien et actions essentielles
- [SEO_STRATEGIE.md](./SEO_STRATEGIE.md) — Stratégie SEO et mots-clés prioritaires
- [CHECKLIST_FINALE.md](./CHECKLIST_FINALE.md) — Checklist de déploiement
- [CHANGELOG.md](./CHANGELOG.md) — Historique des mises à jour (NOUVEAU)

## 🛒 Documentation Affiliation

- [GUIDE_AFFILIATION.md](./GUIDE_AFFILIATION.md) — Guide complet d'affiliation (système de liens avec codes promo)

## 📊 Documentation Système de Données (NOUVEAU)

- [docs/SYSTEME_DONNEES_UTILISATEURS.md](./docs/SYSTEME_DONNEES_UTILISATEURS.md) — Documentation complète du système de données utilisateurs

## 📁 Organisation

- **[docs/](./docs/)** — Documentation structurée avec index
- **[docs/archive/](./docs/archive/)** — Anciens guides et docs obsolètes

---

## ⚡ Actions Rapides

```bash
# Démarrage
git checkout production && npm install && npm run dev

# Déploiement Windows
npm run build && .\deploy-auto.ps1

# Déploiement Linux/Mac  
npm run build && node deploy-auto.js
```tion Centrale GLP-1 France

Ce fichier centralise et référence toutes les documentations, guides, plans, checklists, stratégies et scripts importants du projet GLP-1 France.

---

## 🗂️ Sommaire
- [README.md](./README.md) — Présentation générale du projet
- [GUIDE_ESSENTIEL.md](./GUIDE_ESSENTIEL.md) — Guide essentiel pour contributeurs et éditeurs
- [CHECKLIST_FINALE.md](./CHECKLIST_FINALE.md) — Checklist finale avant mise en ligne
- [SEO_STRATEGIE.md](./SEO_STRATEGIE.md) — Stratégie SEO unique et complète
- [content-length-analysis.json](./content-length-analysis.json) — Analyse de la longueur des contenus
- [seo-strategique-report.json](./seo-strategique-report.json) — Rapport d’audit SEO stratégique
- [seo-monitoring-report.json](./seo-monitoring-report.json) — Rapport de monitoring SEO

---

## 🛠️ Scripts et automatisations
- [scripts/audit-seo-strategique.mjs](./scripts/audit-seo-strategique.mjs) — Audit SEO stratégique
- [scripts/final-seo-optimization.mjs](./scripts/final-seo-optimization.mjs) — Optimisation SEO finale
- [scripts/enrich-short-articles.mjs](./scripts/enrich-short-articles.mjs) — Enrichissement automatique des articles courts
- [scripts/complete-missing-metadata.mjs](./scripts/complete-missing-metadata.mjs) — Complétion des métadonnées
- [scripts/fix-titles-seo-optimized.mjs](./scripts/fix-titles-seo-optimized.mjs) — Correction des titres SEO
- [scripts/generate-internal-links.mjs](./scripts/generate-internal-links.mjs) — Génération de liens internes
- [scripts/optimize-content-advanced.mjs](./scripts/optimize-content-advanced.mjs) — Optimisation avancée du contenu
- [scripts/audit-pertinence-content.mjs](./scripts/audit-pertinence-content.mjs) — Audit de pertinence du contenu

---

## 📊 Dashboard admin
- Le dashboard admin est désormais unique : [src/pages/admin-dashboard.astro](./src/pages/admin-dashboard.astro)
- Le dashboard SEO visuel a été supprimé (anciennement `seo-analysis/dashboard.html`).
- Le score de pertinence de chaque article est affiché dans la tab Articles du dashboard admin.
- La colonne Action affiche uniquement un bouton “voir” pour accéder à l’article.

## 🧠 Logique d’audit de pertinence
- Un script d’audit analyse chaque article et génère un score de pertinence (voir `pertinence-content-report.json`).
- Les articles à faible score sont à corriger ou enrichir en priorité.
- La stratégie SEO et la documentation sont centralisées dans ce fichier et dans `SEO_STRATEGIE.md`.

---

## 📂 Données et bases
- [data/articles-database.json](./data/articles-database.json) — Base des articles
- [data/collections.json](./data/collections.json) — Collections éditoriales
- [data/authors-testimonials.json](./data/authors-testimonials.json) — Témoignages et auteurs

---

## 📄 Guides et prompts
- [prompts/next-prompt.txt](./prompts/next-prompt.txt) — Prompt éditorial à suivre
- [guide-simple.ps1](./scripts/guide-simple.ps1) — Guide d’automatisation simple

---

## 🔗 Liens utiles
- [seo-dashboard.html](./seo-dashboard.html) — Dashboard SEO
- [site.config.json](./site.config.json) — Configuration du site

---

## 🧠 Méthode d'audit SEO & pertinence

### Score SEO (technique)
- **Mot-clé principal présent** (20 pts)
- **Densité du mot-clé** (10 pts)
- **Nombre de mots** (15 pts)
- **H1 unique** (10 pts)
- **Structure H2/H3** (10 pts)
- **Métadonnées complètes (title, description, tags)** (15 pts)
- **Liens internes/externes** (10 pts)
- **Balises importantes (alt images, etc.)** (10 pts)

### Score de pertinence (éditorial)
- **Clarté et qualité des phrases** (25 pts)
- **Structure logique et agréable** (20 pts)
- **Présence de données/faits importants** (20 pts)
- **Pertinence pour le lecteur** (20 pts)
- **Absence de contenu inutile/répétitif** (10 pts)
- **Section FAQ, résumé, ou “À retenir”** (5 pts)

Chaque score est calculé sur 100, et sauvegardé dans le rapport d'audit (`pertinence-content-report.json`).

---

## � Historique des mises à jour récentes

### Août 2025 - Système de données utilisateurs
- ✅ **Dashboard admin utilisateurs** créé avec données réelles
- ✅ **APIs TypeScript** développées pour contact, guide et admin
- ✅ **Base de données JSON** pour stockage des données utilisateurs
- ✅ **Formulaires sécurisés** avec autocomplete et validation
- ✅ **Système de tracking** des sources d'inscription newsletter
- ✅ **Interface d'export** CSV pour les données admin
- ✅ **Correction de contenu** : suppression "beauté" dans formulaire guide
- ✅ **Déploiement réussi** : 152 pages générées et mises en ligne

### Fonctionnalités déployées
1. **Admin Dashboard** : https://glp1-france.fr/admin-user-data/
2. **Contact sécurisé** : https://glp1-france.fr/contact/
3. **Guide optimisé** : https://glp1-france.fr/guide-beaute-perte-de-poids-glp1/
4. **APIs fonctionnelles** : `/api/contact`, `/api/guide-beauty`, `/api/admin-data`

---

## �📝 Mise à jour
Ce fichier doit être mis à jour à chaque ajout ou modification d’un document important.

---

> Pour toute question ou suggestion, contactez l’équipe éditoriale ou technique.
