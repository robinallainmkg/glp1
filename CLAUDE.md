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
claude -p "Valide le site" --agent validator
claude -p "Analyse le maillage interne" --agent internal-links
claude -p "Ameliore le design du site" --agent ui-designer
```

### Agent SEO Audit (`.claude/agents/seo-audit.md`)
- **Fonction** : Audit crawlabilite, meta tags, maillage interne, accessibilite, performance
- **Output** : `seo_audit_results` + `correction_tickets` dans Supabase

### Agent Analytics (`.claude/agents/analytics.md`)
- **Fonction** : Suivi positionnement mots-cles prioritaires/secondaires + detection chutes/quick-wins
- **Output** : `keyword_rankings` + `correction_tickets` dans Supabase
- **Tickets** : `content_refresh` (chute position), `seo_optimization` (quick-win position 11-20)

### Agent Fact-Check (`.claude/agents/fact-check.md`)
- **Fonction** : Verifie les articles GLP-1 contre les sources officielles FR
- **Output** : `fact_check_results` + `correction_tickets` dans Supabase

### Agent Opportunites (`.claude/agents/opportunities.md`)
- **Fonction** : Detection tendances GLP-1, gaps de contenu vs concurrents
- **Output** : `content_opportunities` dans Supabase

### Agent Editorial (`.claude/agents/editorial.md`)
- **Fonction** : 3 modes — corrections (tickets), maillage interne (liens), creation (opportunites)
- **Input** : `correction_tickets` (fact-check + validator + seo-audit) + `internal_link_suggestions` + `content_opportunities`
- **Output** : Fichiers modifies dans `src/content/`, commit + push sur `main`
- **Limites** : 20 tickets + 15 liens + 3 articles par run
- Seul agent autorise a modifier des fichiers source
- **Ne deploie PAS** — commit sur `main` uniquement, le validator fait le deploy

### Agent Validator (`.claude/agents/validator.md`)
- **Fonction** : Build check + validation technique + **deploy sur production**
- **Output** : `validation_results` + `correction_tickets` (source_agent='validator') dans Supabase
- **12 types de checks** + detection cles YAML dupliquees
- **Si build OK** → merge `main` sur `production` → push → deploy FTP auto
- **Si build echoue** → revert + ticket urgent, pas de deploy
- Dernier rempart avant mise en ligne

### Agent Internal Links (`.claude/agents/internal-links.md`)
- **Fonction** : Analyse du maillage interne, suggestions de liens entre articles
- **Output** : `internal_link_suggestions` dans Supabase
- Les suggestions sont consommees par l'agent editorial

### Agent UI Designer (`.claude/agents/ui-designer.md`)
- **Fonction** : Audit visuel et amelioration UX/UI (typographie, couleurs, composants, navigation, animations)
- **Output** : Fichiers modifies + `correction_tickets` (source_agent='ui-designer', type='ui_improvement')
- Agent autonome, ne depend pas des autres agents
- Ne touche PAS aux pages admin, ni au contenu editorial, ni a la logique affiliate

### Dependances entre agents
- `seo-audit` → cree des `correction_tickets` (source_agent='seo-audit') → `editorial` les consomme
- `fact-check` → cree des `correction_tickets` (source_agent='fact-check') → `editorial` les consomme
- `validator` → cree des `correction_tickets` (source_agent='validator') → `editorial` les consomme
- `opportunities` → cree des `content_opportunities` → `editorial` les consomme
- `internal-links` → cree des `internal_link_suggestions` → `editorial` les consomme
- `analytics` → cree des `correction_tickets` (source_agent='analytics', types: content_refresh, seo_optimization) → `editorial` les consomme
- `editorial` → modifie les fichiers, commit+push `main` → `validator` verifie + deploie
- `validator` → build check → si OK merge `main`→`production` + push (deploy FTP auto)
- **Pipeline complet** (3 phases sequentielles) :
  - Phase 1 GENERATE (parallele) : seo-audit + analytics + fact-check + opportunities + internal-links
  - Phase 2 EDIT : editorial (consomme tous les tickets/suggestions/opportunites, push main)
  - Phase 3 VALIDATE+DEPLOY : validator (build check, si OK → merge production → deploy)

### Dashboards Admin
- **Vue d'ensemble** (`src/pages/admin/index.astro`) — War room temps reel, statut des 7 agents, graphe dependances, live feed
- **Audit SEO** (`src/pages/admin/audit.astro`) — Resultats d'audit SEO
- **Analytics** (`src/pages/admin/analytics.astro`) — Suivi keywords, positions
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Resultats verifications medicales
- **Opportunites** (`src/pages/admin/opportunites.astro`) — Gaps de contenu, tendances
- **Editorial** (`src/pages/admin/editorial.astro`) — Tickets de correction, articles crees
- **Validator** (`src/pages/admin/validator.astro`) — Build status, erreurs frontmatter, liens casses
- **Maillage** (`src/pages/admin/links.astro`) — Suggestions de liens internes

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
- `validation_results` — Resultats de validation technique (check_type, severity, message)
- `internal_link_suggestions` — Suggestions de liens internes (source, target, ancre, priorite)

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
