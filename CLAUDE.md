# CLAUDE.md — Contexte projet GLP1 France

## Stack technique

- **Framework** : Astro 4.x (output: `static`)
- **Base de données** : Supabase (PostgreSQL) — projet `ywekaivgjzsmdocchvum` uniquement (NE PAS toucher RB SEO)
- **Hébergement** : Hostinger mutualisé (FTP deploy)
- **CI/CD** : GitHub Actions → FTP vers Hostinger
- **Branche unique** : `main` (test local + deploy)
- **Analytics** : GA4 (`G-SFS6MEPVPC`) + Google Search Console (`sc-domain:glp1-france.fr`) + Hotjar

### Règles absolues

- **PAS de Vercel** — le site est sur Hostinger mutualisé
- **PAS de Hetzner** — aucun VPS
- **PAS de Docker** — hébergement mutualisé uniquement
- **PAS de SSR** — Hostinger ne supporte que les fichiers statiques
- **Output Astro = `static`** — ne JAMAIS changer en `hybrid` ou `server`
- Les pages admin (`/admin/*`) doivent utiliser du **client-side JavaScript** pour fetcher les données Supabase en temps réel
- Le déploiement se fait via FTP dans `.github/workflows/deploy-hostinger.yml`
- Push sur `main` déclenche le deploy
- **NE JAMAIS court-circuiter les agents** — toujours passer par le pipeline pour les modifications

## Monetisation — Strategie CPA

Le site monetise via des partenariats CPA avec 2 plateformes :

### Charles.co — Consultation + Traitement
- CPA : paiement par patient orienté vers Charles
- Offre : téléconsultation médicale + prescription GLP-1
- Cible : personnes prêtes à commencer un traitement
- Requêtes à forte valeur : "ordonnance", "prescription", "médecin", "téléconsultation"
- Landing pages : `/programme/` et `/charles/`

### Annette.care — Accompagnement
- CPA : paiement par patient orienté vers Annette
- Offre : coaching nutritionnel + suivi perte de poids
- Cible : personnes sous traitement qui cherchent un suivi
- Requêtes à forte valeur : "accompagnement", "suivi nutritionnel", "coaching", "programme alimentaire"
- Landing page : `/annette/`

Les agents (opportunities, editorial, internal-links) priorisent le contenu à forte intention d'achat pour ces personas.

## Structure du projet

```
config/astro.config.mjs    — Configuration Astro (redirige depuis astro.config.mjs racine)
src/pages/                 — Pages Astro (statiques)
src/pages/admin/           — Dashboards admin (fact-check, editorial, integration, agents)
src/lib/supabase.js        — Client Supabase (anon key uniquement)
.claude/agents/            — Definitions des Agent Teams Claude Code
scripts/                   — Scripts utilitaires (sync, routine, agent-server)
supabase/migrations/       — Migrations SQL
.github/workflows/         — CI/CD (deploy FTP, migrations)
```

## Routing — URLs du site

**REGLE CRITIQUE** : Toutes les URLs d'articles utilisent le prefixe `/collections/` :
- ✅ Correct : `/collections/traitements-glp1/guide-complet-ozempic/`
- ❌ Interdit : `/traitements-glp1/guide-complet-ozempic/`

**Collections** (12) : alternatives-glp1, avant-apres-glp1, effets-secondaires-glp1, glp1-cout, glp1-diabete, glp1-perte-de-poids, medecins-glp1-france, recherche-glp1, regime-glp1, temoignages, traitements-glp1, pages-statiques

**Pages hors collections** (PAS de prefixe /collections/) :
- `/guides/*` — Pages guides autonomes
- `/outils/*` — Calculateurs, outils
- `/programme/`, `/annette/`, `/charles/` — Landing pages partenaires
- `/contact/`, `/tarifs/`, `/partenaires/` — Pages statiques
- `/mon-espace/` — Espace utilisateur
- `/admin/*` — Dashboards (noindex)

## Agent Teams — Architecture

Les agents utilisent **Claude Code Agent Teams** lances **en local** avec l'abonnement **Claude Max**.
Chaque agent est defini dans `.claude/agents/*.md`.
La coordination se fait via Supabase (bus de donnees partage) + agent-server HTTP.

### Lancement — 2 methodes

**Methode 1 : Tache planifiee (RECOMMANDE)**
Lancer la tache "GLP1 SEO ROUTINE" depuis la sidebar Claude Code → Scheduled → Run now.
Elle demarre l'agent-server + lance le pipeline complet automatiquement.

**Methode 2 : Manuel**
```bash
node scripts/agent-server.mjs          # Demarre le serveur sur port 7854
curl -X POST localhost:7854/pipeline    # Lance le pipeline complet
curl localhost:7854/pipeline/status     # Voir l'avancement
```

### Pipeline complet (5 phases sequentielles)

```
Phase 0 SYNC      → sync analytics GA4/GSC → Supabase
Phase 1 GENERATE  → seo-audit + fact-check + opportunities + internal-links (parallele)
Phase 2 EDIT      → editorial x4 (corrections + maillage, commit local)
Phase 3 VALIDATE  → validator (build check, si OK → push main → deploy FTP)
Phase 4 CRAWL     → crawler (verification post-deploy du site live)
```

Le serveur orchestre tout en arriere-plan. Notification Windows a la fin.

### Agent SEO Audit (`.claude/agents/seo-audit.md`)
- **Fonction** : Audit meta tags, headings, maillage interne, images, performance, thumbnails uniques
- **Output** : `seo_audit_results` + `correction_tickets` dans Supabase
- **Anti-faux-positifs** : ignore les pages redirect, admin, test, bare-path

### Agent Crawler (`.claude/agents/crawler.md`)
- **Fonction** : Verification post-deploy du site live — crawlabilite, indexation Google, schema.org, Core Web Vitals, E-E-A-T, FAQ Schema, duplicate content, liens sortants
- **Output** : `seo_audit_results` + `correction_tickets` dans Supabase
- Tourne APRES le validator (phase 4 du pipeline)

### Agent Analytics (`.claude/agents/analytics.md`)
- **Fonction** : Suivi positionnement mots-cles + detection chutes/quick-wins
- **Output** : `keyword_rankings` + `correction_tickets` dans Supabase

### Agent Fact-Check (`.claude/agents/fact-check.md`)
- **Fonction** : Verifie les articles GLP-1 contre les sources officielles FR via WebSearch
- **Output** : `fact_check_results` + `correction_tickets` dans Supabase
- **Regle** : ZERO donnee hardcodee, chaque claim verifie en temps reel

### Agent Opportunites (`.claude/agents/opportunities.md`)
- **Fonction** : Detection tendances GLP-1, gaps de contenu, priorisation CPA (Charles/Annette)
- **Output** : `content_opportunities` dans Supabase
- **Scoring** : bonus priorite -2 pour sujets a intention d'achat

### Agent Editorial (`.claude/agents/editorial.md`)
- **Fonction** : Corrections (tickets) + maillage interne (liens). Creation DESACTIVEE.
- **Input** : `correction_tickets` + `internal_link_suggestions`
- **Output** : Fichiers modifies dans `src/content/`, commit local uniquement
- **Limites** : 30 tickets + 80 liens par run
- Seul agent autorise a modifier des fichiers source
- **Thumbnails** : verifie unicite, chaque article doit avoir un thumbnail unique
- **Ne deploie PAS** — commit sur `main` uniquement, le validator fait le deploy

### Agent Validator (`.claude/agents/validator.md`)
- **Fonction** : Build check + validation technique + push main (deploy)
- **Si build OK** → push `main` → deploy FTP auto
- **Si build echoue** → revert + ticket urgent, pas de deploy

### Agent Internal Links (`.claude/agents/internal-links.md`)
- **Fonction** : Analyse du maillage interne, suggestions de liens entre articles
- **Output** : `internal_link_suggestions` dans Supabase
- **Strategie CPA** : bonus priorite -1 pour liens vers pages hub de conversion

### Agent UI Designer (`.claude/agents/ui-designer.md`)
- **Fonction** : Audit visuel et amelioration UX/UI
- Agent autonome

### Agent SAV Email (`.claude/agents/sav-email.md`)
- **Fonction** : Sync IMAP emails entrants, reponse automatique, redirection Coach IA
- Agent autonome, independant du pipeline editorial
- Envoie depuis robin@glp1-france.fr via smtp.hostinger.com

### Dependances entre agents
- `seo-audit` / `fact-check` / `validator` / `analytics` → creent des `correction_tickets` → `editorial` les consomme
- `opportunities` → cree des `content_opportunities` → `editorial` les consomme (creation desactivee)
- `internal-links` → cree des `internal_link_suggestions` → `editorial` les consomme
- `editorial` → modifie les fichiers, commit local → `validator` verifie + push + deploie
- `crawler` → verifie le site live apres deploy → cree des tickets si problemes
- `sav-email` → autonome

### Dashboards Admin
- **Vue d'ensemble** (`src/pages/admin/index.astro`) — Pipeline Routine, Agent Arena, KPIs, Console live
- **Audit SEO** (`src/pages/admin/audit.astro`) — Resultats seo-audit + crawler
- **Analytics** (`src/pages/admin/analytics.astro`) — Suivi keywords, positions, trafic
- **Fact-Check** (`src/pages/admin/fact-check.astro`) — Resultats verifications medicales
- **Opportunites** (`src/pages/admin/opportunites.astro`) — Gaps de contenu, tendances
- **Editorial** (`src/pages/admin/editorial.astro`) — Tickets de correction + bandeau pipeline live
- **Validator** (`src/pages/admin/validator.astro`) — Build status, erreurs
- **Maillage** (`src/pages/admin/links.astro`) — Suggestions de liens internes
- **Leads** (`src/pages/admin/leads.astro`) — Contacts, newsletter, diagnostic
- **SAV** (`src/pages/admin/chats.astro`) — Coach IA conversations + emails SAV

## Base de données Supabase

**Projet** : `ywekaivgjzsmdocchvum` (https://ywekaivgjzsmdocchvum.supabase.co)
**NE PAS toucher** : RB SEO (`udoppasqrexzpoqestvt`) — projet separe

### Tables principales
- `articles` (166) — Articles du site (content, slug, collection, is_active, last_fact_checked)
- `correction_tickets` (804+) — Tickets individuels (before/after, urgence, type, statut)
- `fact_check_results` (189+) — Resultats des verifications medicales
- `seo_audit_results` — Resultats d'audit SEO + crawler
- `keyword_rankings` (77+) — Positionnement mots-cles
- `content_opportunities` (159+) — Opportunites de contenu
- `internal_link_suggestions` (1599+) — Suggestions de liens internes
- `agent_runs` (387+) — Suivi des executions d'agents
- `agent_logs` — Logs d'execution
- `validation_results` — Resultats de validation technique
- `contacts` (23+) — Leads (diagnostic, contact, newsletter)
- `coach_messages` (74+) — Conversations Coach IA
- `ga_metrics` (3478+) — Donnees GA4 (pageviews, sessions, bounce rate)
- `gsc_metrics` (13391+) — Donnees Search Console (clicks, impressions, position)
- `incoming_emails` (36+) — Emails entrants IMAP
- `email_replies` (21+) — Reponses SAV envoyees

### Statuts des tickets
Les tickets sont **auto-approuves** (pas de validation humaine) :
`approved` → `in_progress` → `ready_to_deploy` → `deployed`

## Scripts utilitaires

- `scripts/agent-server.mjs` — Serveur HTTP pour orchestrer les agents (port 7854)
- `scripts/routine.mjs` — Script bloquant de routine (preferer le pipeline du serveur)
- `scripts/sync-analytics.mjs` — Sync GA4 + GSC → Supabase (`--days 7`, `--setup` pour OAuth)

## Conventions

- Commit messages en anglais
- Code et commentaires en français ou anglais (pas de mix dans un même fichier)
- **Thumbnails uniques** : chaque article doit avoir son propre thumbnail, pas de reutilisation
- Les agents tournent en local avec Claude Max — pas de clé API Anthropic nécessaire
- Ne jamais commit de secrets ou .env
- **Toujours utiliser le pipeline** pour les modifications du site (pas de modifications manuelles sans fact-check)
