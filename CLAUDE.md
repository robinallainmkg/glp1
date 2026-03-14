# CLAUDE.md — Contexte projet GLP1 France

## Stack technique

- **Framework** : Astro 4.x (output: `static`)
- **Base de données** : Supabase (PostgreSQL)
- **Hébergement** : Hostinger mutualisé (FTP deploy)
- **CI/CD** : GitHub Actions → FTP vers Hostinger
- **Branche de production** : `production` (PAS `main`)
- **Branche de dev** : `main`

### Règles absolues

- **PAS de Vercel** — le site est sur Hostinger mutualisé
- **PAS de Hetzner** — aucun VPS
- **PAS de Docker** — hébergement mutualisé uniquement
- **PAS de SSR** — Hostinger ne supporte que les fichiers statiques
- **Output Astro = `static`** — ne JAMAIS changer en `hybrid` ou `server`
- Les pages admin (`/admin/*`) doivent utiliser du **client-side JavaScript** pour fetcher les données Supabase en temps réel
- Le déploiement se fait via FTP dans `.github/workflows/deploy-hostinger.yml`
- Push sur `production` déclenche le deploy

## Structure du projet

```
config/astro.config.mjs    — Configuration Astro (redirige depuis astro.config.mjs racine)
src/pages/                 — Pages Astro (statiques)
src/pages/admin/           — Dashboards admin (fact-check, editorial, integration)
src/lib/supabase.js        — Client Supabase (anon key uniquement)
scripts/                   — Scripts agents (fact-check, editorial, integration)
n8n/prompts/               — System prompts des agents
supabase/migrations/       — Migrations SQL
.github/workflows/         — CI/CD (deploy, fact-check, editorial, integration, migrations)
```

## Agents IA — État d'avancement

### Agent Fact-Check (`scripts/fact-check-runner.mjs`)
- **Statut** : Opérationnel
- **Modèle** : claude-sonnet-4-20250514 + web search (15 max/article)
- **Fonction** : Vérifie les articles GLP-1 contre les sources officielles FR (ameli.fr, HAS, ANSM, VIDAL)
- **Output** : `fact_check_results` + `correction_tickets` dans Supabase
- **Retry** : Exponential backoff (60s-480s) pour rate limits
- **Déclencheur** : GitHub Actions (cron lundi 7h UTC) ou manuel
- **Workflow** : `.github/workflows/fact-check.yml`

### Agent Editorial (`scripts/editorial-agent.mjs`)
- **Statut** : Opérationnel
- **Fonction** : Rédige `after_final` pour les tickets approuvés/en révision
- **Workflow** : `.github/workflows/editorial-agent.yml`

### Agent Integration (`scripts/integration-agent.mjs`)
- **Statut** : Opérationnel
- **Fonction** : Applique les corrections au markdown, commit, push, crée une PR
- **Workflow** : `.github/workflows/integration-agent.yml` (manuel uniquement)
- **Secret GitHub** : `PRIVATEHERE` (token GitHub pour push + PR)

### Agent SEO Opportunity Finder (`scripts/seo-opportunity-agent.mjs`)
- **Statut** : Opérationnel
- **Modèle** : claude-sonnet-4-20250514 + web search (25 max)
- **Fonction** : Analyse le marché GLP-1 FR, détecte les lacunes de contenu, propose des opportunités
- **Output** : `seo_opportunities` dans Supabase (pending_review → approved → content_created)
- **Déclencheur** : GitHub Actions (cron mercredi 6h UTC) ou manuel
- **Workflow** : `.github/workflows/seo-opportunity.yml`
- **Options** : `--focus all|new|enrich`

### Agent Content Creator (`scripts/content-creator-agent.mjs`)
- **Statut** : Opérationnel
- **Modèle** : claude-sonnet-4-20250514 + web search (20 max/article)
- **Fonction** : Génère des articles complets à partir des opportunités SEO approuvées
- **Output** : Fichiers markdown dans `src/content/[collection]/`, commit + push automatique
- **Déclencheur** : GitHub Actions (cron quotidien 10h UTC) ou manuel
- **Workflow** : `.github/workflows/content-creator.yml`
- **Options** : `--limit N`, `--opportunity-id UUID`

### Dashboards Admin
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Client-side fetching, opérationnel
- **Editorial** (`src/pages/admin/editorial.astro`) — Client-side fetching, opérationnel
- **Integration** (`src/pages/admin/integration.astro`) — Client-side fetching, opérationnel
- **SEO Opportunités** (`src/pages/admin/seo.astro`) — Gestion des opportunités, approbation/rejet
- **Content Creator** (`src/pages/admin/content-creator.astro`) — Pipeline de création d'articles

## Base de données Supabase

### Tables principales
- `articles` — Articles du site (content, slug, collection, is_active, last_fact_checked)
- `fact_check_results` — Résultats des vérifications (score, statut, points)
- `correction_tickets` — Tickets individuels (before/after, urgence, type, statut)
- `seo_opportunities` — Opportunités de contenu détectées par l'agent SEO
- `agent_logs` — Logs d'exécution des agents

### Statuts des tickets de correction
`pending_review` → `approved` → `in_progress` → `ready_to_deploy` → `deployed`
`pending_review` → `rejected`
`pending_review` → `revision_needed` (avec note humaine)

### Statuts des opportunités SEO
`pending_review` → `approved` → `in_progress` → `content_created` → `published`
`pending_review` → `rejected`

### Pipeline automatisé complet
1. **SEO Opportunity Finder** (mercredi) → détecte des opportunités → `seo_opportunities`
2. **Humain** → approuve/rejette les opportunités dans le dashboard admin
3. **Content Creator** (quotidien) → génère les articles approuvés → `src/content/`
4. **Fact-Check** (lundi) → vérifie les articles → `correction_tickets`
5. **Editorial** (quotidien) → rédige les corrections finales
6. **Integration** (manuel) → applique les corrections → crée des PR

## Conventions

- Commit messages en anglais
- Code et commentaires en français ou anglais (pas de mix dans un même fichier)
- Les secrets sont dans GitHub Secrets :
  - `SUPABASE_URL` — URL Supabase
  - `SUPABASE_SERVICE_ROLE_KEY` — Clé service role Supabase
  - `ANTHROPIC_API_KEY` — Clé API Anthropic (agents fact-check + editorial)
  - `FTP_PASSWORD` — Mot de passe FTP Hostinger (deploy)
  - `PRIVATEHERE` — Token GitHub (agent integration : push + PR)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL_TO` — Alertes email (optionnel)
- Ne jamais commit de secrets ou .env
