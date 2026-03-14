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
src/pages/admin/           — Dashboards admin (fact-check, editorial, integration, agents)
src/lib/supabase.js        — Client Supabase (anon key uniquement)
.claude/agents/            — Definitions des Agent Teams Claude Code
scripts/                   — Scripts utilitaires (sync, etc.)
scripts/legacy/            — Anciens scripts agents (archives)
n8n/prompts/               — System prompts historiques (portes dans .claude/agents/)
supabase/migrations/       — Migrations SQL
.github/workflows/         — CI/CD (deploy, agent-*, migrations)
```

## Agent Teams — Architecture

Les agents utilisent **Claude Code Agent Teams** (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`).
Chaque agent est defini dans `.claude/agents/*.md` et declenche via GitHub Actions.
La coordination se fait via Supabase (bus de donnees partage).

**PAS d'appels API Anthropic dans le code** — les agents sont natifs Claude Code.

### Agent SEO Audit (`.claude/agents/seo-audit.md`)
- **Fonction** : Audit crawlabilite, meta tags, maillage interne, accessibilite, performance
- **Output** : `seo_audit_results` dans Supabase
- **Workflow** : `.github/workflows/agent-seo-audit.yml` (dimanche 6h UTC)

### Agent Analytics (`.claude/agents/analytics.md`)
- **Fonction** : Suivi positionnement mots-cles prioritaires/secondaires
- **Output** : `keyword_rankings` dans Supabase
- **Workflow** : `.github/workflows/agent-analytics.yml` (lundi 5h UTC)

### Agent Fact-Check (`.claude/agents/fact-check.md`)
- **Fonction** : Verifie les articles GLP-1 contre les sources officielles FR
- **Output** : `fact_check_results` + `correction_tickets` dans Supabase
- **Workflow** : `.github/workflows/agent-fact-check.yml` (lundi 7h UTC)

### Agent Opportunites (`.claude/agents/opportunities.md`)
- **Fonction** : Detection tendances GLP-1, gaps de contenu vs concurrents
- **Output** : `content_opportunities` dans Supabase
- **Workflow** : `.github/workflows/agent-opportunities.yml` (1er et 15 du mois)

### Agent Editorial (`.claude/agents/editorial.md`)
- **Fonction** : Redaction/correction articles + integration dans les .md + git workflow
- **Output** : Fichiers modifies dans `src/content/`, branche + push
- **Workflow** : `.github/workflows/agent-editorial.yml` (quotidien 9h UTC)
- Seul agent autorise a modifier des fichiers source

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
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Client-side fetching
- **Editorial** (`src/pages/admin/editorial.astro`) — Client-side fetching
- **Integration** (`src/pages/admin/integration.astro`) — Client-side fetching
- **SEO Opportunites** (`src/pages/admin/seo.astro`) — Gestion des opportunites, approbation/rejet
- **Content Creator** (`src/pages/admin/content-creator.astro`) — Pipeline de creation d'articles
- **Agent Teams** (`src/pages/admin/agents.astro`) — Supervision des 5 agents (statut, logs, dependances)

## Base de données Supabase

### Tables principales
- `articles` — Articles du site (content, slug, collection, is_active, last_fact_checked)
- `fact_check_results` — Resultats des verifications (score, statut, points)
- `correction_tickets` — Tickets individuels (before/after, urgence, type, statut)
- `seo_opportunities` — Opportunites de contenu detectees par l'agent SEO
- `agent_logs` — Logs d'execution des agents
- `agent_runs` — Suivi haut niveau des executions d'agents (statut, duree, metadata)
- `seo_audit_results` — Resultats d'audit SEO (type, severite, page, recommandation)
- `keyword_rankings` — Historique de positionnement mots-cles (position, semaine, mois)
- `content_opportunities` — Opportunites de contenu (sujet, priorite, statut)

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
  - `ANTHROPIC_API_KEY` — Cle API Anthropic (Claude Code CLI pour Agent Teams)
  - `FTP_PASSWORD` — Mot de passe FTP Hostinger (deploy)
  - `PRIVATEHERE` — Token GitHub (agent integration : push + PR)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL_TO` — Alertes email (optionnel)
- Ne jamais commit de secrets ou .env
