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
n8n/prompts/               — System prompts historiques (sources des agents)
supabase/migrations/       — Migrations SQL
.github/workflows/         — CI/CD (deploy FTP, migrations)
```

## Agent Teams — Architecture

Les agents utilisent **Claude Code Agent Teams** lances **en local** depuis le terminal avec l'abonnement **Claude Max**.
Chaque agent est defini dans `.claude/agents/*.md`.
La coordination se fait via Supabase (bus de donnees partage).

**Zéro clé API Anthropic** — **Zéro GitHub Actions** — **Zéro cron** — tout est local et manuel.

### Lancement des agents

```bash
claude -p "Lance l'audit SEO" --agent seo-audit
claude -p "Analyse les keywords" --agent analytics
claude -p "Vérifie les articles" --agent fact-check
claude -p "Cherche les opportunités" --agent opportunities
claude -p "Traite les corrections" --agent editorial
```

### Agent SEO Audit (`.claude/agents/seo-audit.md`)
- **Fonction** : Audit crawlabilite, meta tags, maillage interne, accessibilite, performance
- **Output** : `seo_audit_results` dans Supabase

### Agent Analytics (`.claude/agents/analytics.md`)
- **Fonction** : Suivi positionnement mots-cles prioritaires/secondaires
- **Output** : `keyword_rankings` dans Supabase

### Agent Fact-Check (`.claude/agents/fact-check.md`)
- **Fonction** : Verifie les articles GLP-1 contre les sources officielles FR
- **Output** : `fact_check_results` + `correction_tickets` dans Supabase

### Agent Opportunites (`.claude/agents/opportunities.md`)
- **Fonction** : Detection tendances GLP-1, gaps de contenu vs concurrents
- **Output** : `content_opportunities` dans Supabase

### Agent Editorial (`.claude/agents/editorial.md`)
- **Fonction** : Redaction/correction articles + integration dans les .md + git workflow
- **Output** : Fichiers modifies dans `src/content/`, branche + push
- Seul agent autorise a modifier des fichiers source

### Dependances entre agents
- `seo-audit` et `analytics` : independants
- `fact-check` → cree des `correction_tickets` → `editorial` les consomme
- `opportunities` → cree des `content_opportunities` → `editorial` les consomme

### Dashboards Admin
- **Mission Control** (`src/pages/admin/mission-control.astro`) — War room temps reel, statut des 5 agents, live feed
- **Audit SEO** (`src/pages/admin/audit.astro`) — Resultats d'audit SEO avec historique
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Client-side fetching
- **Editorial** (`src/pages/admin/editorial.astro`) — Client-side fetching
- **Integration** (`src/pages/admin/integration.astro`) — Client-side fetching
- **Agent Teams** (`src/pages/admin/agents.astro`) — Supervision des 5 agents (statut, logs, dependances)

## Base de données Supabase

### Tables principales
- `articles` — Articles du site (content, slug, collection, is_active, last_fact_checked)
- `fact_check_results` — Resultats des verifications (score, statut, points)
- `correction_tickets` — Tickets individuels (before/after, urgence, type, statut)
- `agent_logs` — Logs d'execution des agents
- `agent_runs` — Suivi haut niveau des executions d'agents (statut, duree, metadata)
- `seo_audit_results` — Resultats d'audit SEO (type, severite, page, recommandation)
- `keyword_rankings` — Historique de positionnement mots-cles (position, semaine, mois)
- `content_opportunities` — Opportunites de contenu (sujet, priorite, statut)

### Statuts des tickets
Les tickets sont **auto-approuves** (pas de validation humaine) :
`approved` → `in_progress` → `ready_to_deploy` → `deployed`
`approved` → `rejected` (si necessaire manuellement)

## Conventions

- Commit messages en anglais
- Code et commentaires en français ou anglais (pas de mix dans un même fichier)
- Les secrets sont dans GitHub Secrets :
  - `SUPABASE_URL` — URL Supabase
  - `SUPABASE_SERVICE_ROLE_KEY` — Clé service role Supabase
  - `FTP_PASSWORD` — Mot de passe FTP Hostinger (deploy)
  - `PRIVATEHERE` — Token GitHub (push + PR)
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `ALERT_EMAIL_TO` — Alertes email (optionnel)
- Les agents tournent en local avec Claude Max — pas de clé API Anthropic nécessaire
- Ne jamais commit de secrets ou .env
