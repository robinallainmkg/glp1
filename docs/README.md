# 🏥 GLP-1 France - Site Médical et Affiliation

> Site web médical dédié aux traitements GLP-1 avec système d'affiliation intégré

## ⚡ Quick Start

```bash
# Installation rapide
git clone https://github.com/robinallainmkg/glp1.git
cd glp1
npm install
npm run dev
```

**Site accessible** : http://localhost:4321/
**Admin TinaCMS** : http://localhost:4321/admin

## 🏗️ Architecture

- **Framework** : Astro.js v4.16+ avec TailwindCSS
- **CMS** : TinaCMS pour la gestion de contenu
- **Base de données** : Supabase (migration depuis JSON locaux)
- **Déploiement** : Hostinger via script PowerShell automatisé
- **Collections** : 9 collections d'articles (119 articles total)

## 📚 Documentation Complète

Consultez notre **[Index Central](MASTER-INDEX.md)** pour accéder à toute la documentation organisée.

### Navigation Rapide

| Section | Description | Lien |
|---------|-------------|------|
| 🔧 **Installation** | Setup projet en 5 min | [→ Guide](core/installation.md) |
| 👨‍💻 **Développement** | Workflow quotidien | [→ Guide](core/development.md) |
| 🚀 **Déploiement** | Mise en production | [→ Guide](core/deployment.md) |
| 🏗️ **Architecture** | Technique détaillée | [→ Guide](core/architecture.md) |

### Fonctionnalités

| Feature | Status | Guide |
|---------|--------|-------|
| 📊 **Admin Dashboard** | ✅ Opérationnel | [→ Guide](features/admin-dashboard.md) |
| 📄 **Collections SEO** | ✅ 9 collections | [→ Guide](features/collections-seo.md) |
| 👥 **Données Utilisateurs** | ✅ Supabase | [→ Guide](features/user-data-system.md) |
| 💰 **Affiliation** | ✅ Actif | [→ Guide](features/affiliate-system.md) |

## 🎯 Statut Projet

- **Collections** : 9 configurées, 119 articles
- **Images** : 20 images AI générées
- **CMS** : TinaCMS opérationnel
- **Base de données** : Migration Supabase terminée
- **Déploiement** : Script automatisé fonctionnel

## 🔗 Liens Utiles

- **Site web** : https://glp1-france.fr
- **Admin TinaCMS** : https://glp1-france.fr/admin
- **Dashboard Supabase** : https://supabase.com/dashboard/project/ywekaivgjzsmdocchvum
- **Repository** : https://github.com/robinallainmkg/glp1

## 🆘 Support Rapide

| Problème | Action |
|----------|--------|
| Erreur de build | `npm run dev` puis vérifier les logs |
| TinaCMS ne charge pas | `taskkill /f /im node.exe` puis `npm run dev:tina` |
| Images manquantes | `node scripts/image-generator.mjs --missing-only` |
| Déploiement | `.\scripts\deployment\deploy-auto.ps1` |

---

**Dernière mise à jour** : Août 2025 | **Statut** : ✅ Production
