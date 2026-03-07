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
src/pages/admin/           — Dashboards admin (fact-check, editorial)
src/lib/supabase.js        — Client Supabase
scripts/                   — Scripts agents (fact-check, editorial)
n8n/prompts/               — System prompts des agents
supabase/migrations/       — Migrations SQL
.github/workflows/         — CI/CD (deploy, fact-check, editorial, migrations)
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
- **Fonction** : Applique les corrections approuvées aux articles
- **Workflow** : `.github/workflows/editorial-agent.yml`

### Dashboard Fact-Check (`src/pages/admin/fact-check.astro`)
- **Statut** : À corriger — doit passer en client-side fetching
- **Problème** : Données figées au build (static), ne montre pas les nouveaux résultats
- **Solution** : Fetch Supabase côté client au chargement de la page

### Dashboard Editorial (`src/pages/admin/editorial.astro`)
- **Statut** : À corriger — même problème que fact-check

## Base de données Supabase

### Tables principales
- `articles` — Articles du site (content, slug, collection, is_active, last_fact_checked)
- `fact_check_results` — Résultats des vérifications (score, statut, points)
- `correction_tickets` — Tickets individuels (before/after, urgence, type, statut)
- `agent_logs` — Logs d'exécution des agents

### Statuts des tickets
`pending_review` → `approved` → `in_progress` → `ready_to_deploy` → `deployed`
`pending_review` → `rejected`
`pending_review` → `revision_needed` (avec note humaine)

## Conventions

- Commit messages en anglais
- Code et commentaires en français ou anglais (pas de mix dans un même fichier)
- Les secrets sont dans GitHub Secrets (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, FTP_PASSWORD)
- Ne jamais commit de secrets ou .env
