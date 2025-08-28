# 🎯 MASTER INDEX - GLP1 France

## ⚡ DÉMARRAGE RAPIDE

**🚨 NOUVEAU DANS LE PROJET ?** → [📖 GUIDE DE DÉMARRAGE RAPIDE](QUICK-START-SESSION.md)
> ⭐ **LECTURE OBLIGATOIRE** : Tout ce qu'il faut savoir pour comprendre le projet en 5 minutes

## ✅ Statut du Projet

**Site en Production** : https://glp1-france.fr  
**Page Partenaires** : https://glp1-france.fr/partenaires  
**Déploiement** : Automatisé via GitHub Actions  

## �️ Architecture Technique

### Framework & Build
- **Astro v4.16.18** - Génération statique
- **TinaCMS** - Gestion de contenu
- **Tailwind CSS** - Styling
- **Build Output** : 168+ pages statiques

### Déploiement
- **Hébergement** : Hostinger (147.79.98.140)
- **Méthode** : FTP automatisé via GitHub Actions
- **Déclencheur** : Push vers branche `production`
- **Délai** : 2-5 minutes

## 🏗️ Core - Fondamentaux Techniques

### [📖 Installation et Configuration](core/installation.md)
**Setup initial et déploiement**
- Prérequis système (Node.js, Git, éditeurs)
- Installation des dépendances (Astro, TinaCMS, Supabase)
- Configuration environnements (dev, staging, production)
- Première compilation et tests

### [⚡ Guide de Développement](core/development.md)
**Workflow quotidien et bonnes pratiques**
- Commandes essentielles (`npm run dev`, build, preview)
- Structure des dossiers et conventions
- Workflow Git et branches
- Debugging et troubleshooting

### [🏗️ Architecture Technique](core/architecture.md)
**Structure système et décisions techniques**
- Stack technologique (Astro.js, TinaCMS, Supabase)
- Architecture hybride APIs (TypeScript dev / PHP prod)
- Gestion des données et cache
- Performance et SEO

---

## 🚀 Features - Fonctionnalités Métier

## � Système d'Affiliation

### Documentation Principale
- [DOCUMENTATION-AFFILIATION-COMPLETE.md](./DOCUMENTATION-AFFILIATION-COMPLETE.md) - **Documentation complète et actuelle du système d'affiliation Supabase**
  - ✅ Structure Supabase réelle
  - ✅ Composants actuels (InlineAffiliateProduct, AffiliateSidebar)
  - ✅ Scripts de gestion des données
  - ✅ Intégration badges dynamiques et codes promo

### Migration & Évolution
- [MIGRATION-TINACMS-SUPABASE.md](./MIGRATION-TINACMS-SUPABASE.md) - **Migration du système TinaCMS vers Supabase**
  - 🔄 Historique de la migration
  - 📊 Comparaison avant/après
  - 🧪 Validation et tests
  - 🔮 Roadmap futures évolutions

### [📝 Système de Contenu TinaCMS](features/cms.md)
**Gestion de contenu et éditorial**
- Configuration collections TinaCMS
- Templates de contenu MDX
- Gestion médias et images
- Workflow éditorial et validation

### [👥 Système Utilisateurs et Données](features/users.md)
**Collecte, stockage et conformité RGPD**
- Modèle données unifié
- Sources de collecte (newsletter, guides, contact)
- Gestion préférences utilisateur
- Conformité RGPD et export données

---

## ⚙️ Operations - Maintenance et Déploiement

### [🚀 Déploiement et CI/CD](operations/deployment.md)
**Automatisation et pipelines**
- Scripts PowerShell de déploiement
- Pipeline GitHub Actions
- Gestion environnements multiples
- Validation post-déploiement

### [🔍 Maintenance et Monitoring](operations/monitoring.md)
**Surveillance système et maintenance préventive**
- Métriques de performance (Core Web Vitals, Lighthouse)
- Alertes automatiques et seuils
- Maintenance hebdomadaire et quotidienne
- Dashboard de monitoring temps réel

---

## 🚀 Quick Start

```bash
# 1. Clone et setup
git clone <repository>
cd glp1-github
npm install

# 2. Configuration
cp .env.example .env
# Configurer variables TinaCMS et Supabase

# 3. Développement
npm run dev          # http://localhost:4321
npm run tina         # TinaCMS sur http://localhost:4321/admin

# 4. Build et déploiement
npm run build
npm run preview      # Test build local
```

## 📋 Aide-Mémoire

### Commandes Essentielles
```bash
npm run dev                    # Serveur développement
npm run build                  # Build production
npm run preview               # Preview build local
npm run tina                  # TinaCMS standalone
npm run optimize-images       # Optimisation images
npm run health-check         # Vérification santé
```

### Structure Dossiers Clés
```
src/
├── components/         # Composants réutilisables
├── layouts/           # Templates de page  
├── pages/             # Pages et APIs
├── content/           # Contenu TinaCMS
└── utils/             # Fonctions utilitaires

data/                  # Base de données JSON
docs/                  # Documentation (ce dossier)
scripts/              # Scripts maintenance
public/               # Assets statiques
```

### Points d'Entrée Importants
- **Homepage** : `src/pages/index.astro`
- **Collections** : `src/pages/collections/[collection].astro`
- **Admin** : `http://localhost:4321/admin` (TinaCMS)
- **APIs** : `src/pages/api/` (dev) + `public/api/` (prod)

---

## 🆘 Support et Troubleshooting

### Problèmes Courants

**Build échoue**
```bash
# Nettoyer cache et rebuilder
rm -rf node_modules dist .astro
npm install
npm run build
```

**TinaCMS ne fonctionne pas**
```bash
# Vérifier variables environnement
echo $TINA_CLIENT_ID
echo $TINA_TOKEN

# Relancer TinaCMS
npm run tina
```

**Images non optimisées**
```bash
# Réoptimiser toutes les images
npm run optimize-images
npm run build
```

### Ressources Utiles
- [Documentation Astro](https://docs.astro.build/)
- [TinaCMS Docs](https://tina.io/docs/)
- [Supabase Docs](https://supabase.com/docs)
- [GitHub Repository Issues](../../issues)

---

## 📊 État du Projet

### Fonctionnalités Implémentées ✅
- [x] Site statique Astro.js avec TinaCMS
- [x] Collections de contenu (8 collections actives après nettoyage)
- [x] Système d'affiliation Amazon intégré
- [x] Gestion utilisateurs unifiée (JSON + Supabase)
- [x] Interface admin avec authentification
- [x] APIs hybrides (TypeScript dev / PHP prod)
- [x] Optimisation SEO et performance
- [x] Scripts de déploiement automatisés
- [x] **Nettoyage collection medicaments-glp1** ([SUPPRESSION-MEDICAMENTS-GLP1.md](./SUPPRESSION-MEDICAMENTS-GLP1.md))

### En Cours de Développement 🔄
- [ ] Dashboard analytics avancé
- [ ] A/B testing pour CTA
- [ ] PWA (Progressive Web App)
- [ ] API GraphQL complète

### Roadmap Future 🎯
- [ ] Multi-langue (anglais)
- [ ] Chat bot IA intégré
- [ ] Application mobile
- [ ] Intégration e-commerce

---

## � Équipe et Contacts

### Développement Technique
- **Architecture** : Système modulaire Astro.js
- **CMS** : TinaCMS avec interface intuitive
- **Déploiement** : Automatisation PowerShell + GitHub Actions

### Support
- **Issues** : [GitHub Issues](../../issues)
- **Documentation** : Ce dossier `docs/`
- **Monitoring** : Dashboard temps réel

---

> **Note** : Cette documentation est mise à jour automatiquement. Pour contribuer, créer une pull request ou ouvrir une issue.

*Dernière synchronisation : Août 2025*
- Anciens guides de déploiement
- Documentation obsolète

## 🔄 Workflow de Mise à Jour

1. **Modification** : Éditer le fichier approprié dans la structure
2. **Index** : Mettre à jour ce MASTER-INDEX.md si nécessaire
3. **Validation** : Vérifier les liens et la cohérence
4. **Commit** : Un seul commit pour la modification

## 📋 Règles de Documentation

### ✅ Autorisé
- Mettre à jour les fichiers existants
- Ajouter des sections dans les fichiers appropriés
- Corriger les erreurs et améliorer le contenu
- Synthétiser l'information dispersée

### ❌ Interdit
- Créer de nouveaux fichiers MD hors structure
- Dupliquer l'information existante
- Créer des rapports temporaires
- Ignorer la structure établie

## 🎯 Navigation Rapide

### Par Type de Tâche
- **Je veux installer** → [core/installation.md](core/installation.md)
- **Je développe** → [core/development.md](core/development.md)
- **Je déploie** → [core/deployment.md](core/deployment.md)
- **Je gère le contenu** → [operations/content-management.md](operations/content-management.md)
- **J'ai un problème** → [operations/troubleshooting.md](operations/troubleshooting.md)

### Par Fonctionnalité
- **Admin** → [features/admin-dashboard.md](features/admin-dashboard.md)
- **Articles/SEO** → [features/collections-seo.md](features/collections-seo.md)
- **Utilisateurs** → [features/user-data-system.md](features/user-data-system.md)
- **Affiliation** → [features/affiliate-system.md](features/affiliate-system.md)

---

**Maintenu par** : Agent IA + Équipe technique | **Format** : Structure fixe 12 fichiers
