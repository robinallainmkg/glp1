# CLAUDE.md — Contexte projet GLP1 France

## Stack technique

- **Framework** : Astro 4.x (output: `static`)
- **Base de données** : Supabase (PostgreSQL)
- **Hébergement** : Hostinger mutualisé (FTP deploy)
- **CI/CD** : GitHub Actions → FTP vers Hostinger
- **Branche unique** : `main` (test local + deploy)

### Règles absolues

- **PAS de Vercel** — le site est sur Hostinger mutualisé
- **PAS de Hetzner** — aucun VPS
- **PAS de Docker** — hébergement mutualisé uniquement
- **PAS de SSR** — Hostinger ne supporte que les fichiers statiques
- **Output Astro = `static`** — ne JAMAIS changer en `hybrid` ou `server`
- Les pages admin (`/admin/*`) doivent utiliser du **client-side JavaScript** pour fetcher les données Supabase en temps réel
- Le déploiement se fait via FTP dans `.github/workflows/deploy-hostinger.yml`
- Push sur `main` déclenche le deploy

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
claude -p "Reponds aux emails" --agent sav-email
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
- **Fonction** : Detection tendances GLP-1, gaps de contenu vs concurrents, priorisation CPA (Charles/Annette)
- **Output** : `content_opportunities` dans Supabase

### Agent Crawler (`.claude/agents/crawler.md`)
- **Fonction** : Verification post-deploy du site live — crawlabilite, indexation Google, schema.org, performance, liens sortants
- **Output** : `seo_audit_results` + `correction_tickets` dans Supabase
- Tourne APRES le validator (phase 4 du pipeline)
- Verifie les 30 URLs critiques en production, compare sitemap vs index Google

### Agent Editorial (`.claude/agents/editorial.md`)
- **Fonction** : 2 modes actifs — corrections (tickets) + maillage interne (liens). Creation DESACTIVEE.
- **Input** : `correction_tickets` (fact-check + validator + seo-audit) + `internal_link_suggestions`
- **Output** : Fichiers modifies dans `src/content/`, commit local uniquement, le validator push
- **Limites** : 30 tickets + 80 liens par run (maillage = priorite absolue)
- Seul agent autorise a modifier des fichiers source
- **Ne deploie PAS** — commit sur `main` uniquement, le validator fait le deploy

### Agent Validator (`.claude/agents/validator.md`)
- **Fonction** : Build check + validation technique + push main (deploy)
- **Output** : `validation_results` + `correction_tickets` (source_agent='validator') dans Supabase
- **12 types de checks** + detection cles YAML dupliquees
- **Si build OK** → push `main` → deploy FTP auto
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

### Agent SAV Email (`.claude/agents/sav-email.md`)
- **Fonction** : Sync IMAP emails entrants, reponse automatique personnalisee, redirection Coach IA
- **Output** : `incoming_emails` + `email_replies` dans Supabase, emails envoyes via SMTP + copies IMAP Sent
- Agent autonome, ne depend pas des autres agents du pipeline editorial
- Envoie depuis robin@glp1-france.fr via smtp.hostinger.com
- Tracking UTM sur tous les liens (utm_source=email, utm_medium=sav)
- Copie HTML complete dans INBOX.Sent (JAMAIS de texte brut)
- Categories : info_request, diagnostic_followup, remboursement, effets_secondaires, scam_victim, medecin, other

### Dependances entre agents
- `seo-audit` → cree des `correction_tickets` (source_agent='seo-audit') → `editorial` les consomme
- `fact-check` → cree des `correction_tickets` (source_agent='fact-check') → `editorial` les consomme
- `validator` → cree des `correction_tickets` (source_agent='validator') → `editorial` les consomme
- `opportunities` → cree des `content_opportunities` → `editorial` les consomme
- `internal-links` → cree des `internal_link_suggestions` → `editorial` les consomme
- `analytics` → cree des `correction_tickets` (source_agent='analytics', types: content_refresh, seo_optimization) → `editorial` les consomme
- `editorial` → modifie les fichiers, commit local → `validator` verifie + push + deploie
- `validator` → build check → si OK push `main` (deploy FTP auto)
- `sav-email` → autonome, sync IMAP + reponse SMTP + log Supabase (independant du pipeline editorial)
- **Pipeline complet** (5 phases sequentielles, lance via `curl -X POST localhost:7854/pipeline`) :
  - Phase 0 SYNC : sync analytics GA4/GSC → Supabase
  - Phase 1 GENERATE (parallele) : seo-audit + analytics + fact-check + opportunities + internal-links
  - Phase 2 EDIT : editorial x4 (consomme tous les tickets/suggestions/opportunites, commit local)
  - Phase 3 VALIDATE+DEPLOY : validator (build check, si OK → push main → deploy)
  - Phase 4 CRAWL : crawler (verification post-deploy du site live, indexation, schema.org)

### Dashboards Admin
- **Vue d'ensemble** (`src/pages/admin/index.astro`) — War room temps reel, statut des 7 agents, graphe dependances, live feed
- **Audit SEO** (`src/pages/admin/audit.astro`) — Resultats d'audit SEO
- **Analytics** (`src/pages/admin/analytics.astro`) — Suivi keywords, positions
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Resultats verifications medicales
- **Opportunites** (`src/pages/admin/opportunites.astro`) — Gaps de contenu, tendances
- **Editorial** (`src/pages/admin/editorial.astro`) — Tickets de correction, articles crees
- **Validator** (`src/pages/admin/validator.astro`) — Build status, erreurs frontmatter, liens casses
- **Maillage** (`src/pages/admin/links.astro`) — Suggestions de liens internes
- **SAV** (`src/pages/admin/chats.astro`) — Coach IA conversations + emails SAV entrants/sortants

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
- `incoming_emails` — Emails entrants syncs depuis IMAP (from, subject, body, status, category)
- `email_replies` — Reponses SAV envoyees (to, html, utm_campaign, sent_to_imap)

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
