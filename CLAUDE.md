# CLAUDE.md — Contexte projet GLP1 France

## Stack technique

- **Framework** : Astro 4.x (output: `static`)
- **Base de données** : Supabase (PostgreSQL) — projet `ywekaivgjzsmdocchvum` uniquement (NE PAS toucher RB SEO)
- **Hébergement** : Hostinger mutualisé (FTP deploy)
- **CI/CD** : GitHub Actions → FTP vers Hostinger
- **Branche unique** : `main` (test local + deploy)
- **Analytics** : GA4 (`G-SFS6MEPVPC`) + Google Search Console (`sc-domain:glp1-france.fr`) + Hotjar
- **Sync Analytics** : GitHub Actions daily (`sync-analytics.yml`, 8h Paris) + routine analytics (12h Paris)

### Regle critique : Fraicheur donnees GA4/GSC

**A CHAQUE session** touchant SEO/trafic/analytics/monetisation, verifier :
```sql
SELECT 'ga_metrics' as tbl, MAX(date) FROM ga_metrics UNION ALL SELECT 'gsc_metrics', MAX(date) FROM gsc_metrics;
```
- GA > 2 jours de retard OU GSC > 5 jours = **ALERTE IMMEDIATE**
- **Cause probable** : refresh token Google expire
- **Fix** (4 commandes, 2 minutes) :
  1. `node scripts/sync-analytics.mjs --setup` (renouvelle token via navigateur)
  2. `node scripts/sync-analytics.mjs --days 10` (rattrape les donnees)
  3. `gh secret set GOOGLE_REFRESH_TOKEN < <(grep GOOGLE_REFRESH_TOKEN .env | cut -d= -f2-)` (met a jour GitHub Actions)
  4. `gh workflow run sync-analytics.yml` (verifie)

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
- **MARQUE "ZEPBOUND" INTERDITE SUR LE SITE** (réclamation DMCA Eli Lilly, juin 2026 — condition de réactivation Hostinger) : aucun texte, image, lien, meta ou URL ne doit mentionner Zepbound. Utiliser "tirzépatide" ou "Mounjaro". Toute occurrence détectée = suppression immédiate.

## Monetisation — Dossier GLP-1 payant + Coach IA (funnel gratuit)

**Politique active depuis 06/2026** : produit payant unique = **Dossier GLP-1 Personnalise (4,99€)**. Le Coach IA reste **gratuit** et sert de funnel. **AUCUNE affiliation** (Sinocare ET Annette desactives, zero revenu d'affiliation).

### Dossier GLP-1 Personnalise (4,99€) — produit principal
- **Landing** : `src/pages/dossier-glp1.astro` → `/dossier-glp1/` (hero + formulaire 6 etapes + FAQ)
- **Page retour paiement** : `src/pages/mon-espace/dossier/index.astro` (poll du statut + telechargement)
- **Edge functions** :
  - `stripe-payment` — cree la session Stripe Checkout (produit `dossier`, 499 cents, guest email OK, pas besoin de compte)
  - `stripe-webhook` — `handleDossierPurchase` : marque le dossier `paid` puis appelle `generate-dossier`
  - `generate-dossier` — genere le HTML (verdict eligibilite, CSO par departement, checklist RDV, questions medecin) → stocke dans le bucket Storage `dossiers`
- **Table Supabase** : `dossiers` (intake + `imc` calcule + verdict + pdf_url + statut `pending`→`paid`→`generated`)
- **Points d'entree** : bouton "Mon Dossier" (header), `DossierSidebar` (sidebar articles), bloc dedie sur la home, et via le chat (tag `[[DOSSIER_READY]]` parse dans ai-coach)
- **DA OBLIGATOIRE** : vert fonce `#1a3c34` / vert action `#16a34a` (coherence site) — JAMAIS de bleu

### Coach IA — funnel gratuit (PAS un produit payant)
- **Edge function** : `supabase/functions/ai-coach/index.ts` (Groq/Llama 3.3 70B + RAG Mistral)
- **Widget** : `src/components/AiCoach.astro` — chat flottant sur toutes les pages
- **Active dans** : BaseLayout, StaticLayout, UnifiedLayout, DiagnosticLayout
- **Composants** : `CoachCTA` (inline articles), `CoachSidebar` (sidebar articles)
- **Role** : aide gratuitement, puis propose le Dossier au bon moment (apres collecte IMC + comorbidites)
- **Style** : sobre, SANS emojis pictographiques (coches `✓` et fleches `→` OK)

### Test d'eligibilite (funnel d'entree du Dossier) — depuis 14/07/2026
- **Page** : `src/pages/outils/test-eligibilite.astro` → `/outils/test-eligibilite/`
- 3 etapes client-side : IMC → comorbidites → suivi nutritionnel → verdict selon les criteres officiels (IMC >= 40, ou >= 35 + comorbidite, apres 6 mois de prise en charge nutritionnelle)
- **Capture email** → table `contacts` avec `contact_type: 'eligibility_test'` (verdict + IMC dans `message`)
- **Upsell Dossier 4,99 EUR** affiche si eligible ou presque eligible
- Cible SEO : "suis-je eligible wegovy remboursement", "test eligibilite mounjaro"
- Lie depuis le footer ("Test d'eligibilite 65%")

### Sinocare / Annette — DESACTIVES
- **Plus aucune affiliation.** Composants Annette (PartnerCTA, PartnerSidebar, PartnerComparator) neutralises (rendu vide).
- Callouts Sinocare retires. Ancien code promo CARE50, anciens liens affilies — ne plus utiliser.
- **NE PAS reactiver** sans decision explicite de l'utilisateur.
- `affiliate_clicks` + `AffiliateTracker.astro` restent en place (historique) mais ne sont plus une source de revenus.

## Verticale Retraites Bien-Etre (lancee 13/07/2026)

- **Collection** : `retraites-bien-etre` (13e collection, dans src/content/config.ts + routes /collections/retraites-bien-etre/)
- **Hub** : `src/pages/retraites/index.astro` → `/retraites/` (page pilier SEO, lie depuis le footer, cible la requete tete "retraite perte de poids france")
- **PAS de landing offre premium pour le moment** (decision Robin 14/07/2026) : strategie 100% SEO/contenu d'abord. L'offre retraites medicalisees (peptides/Morpheus8) reste un projet a moyen terme — ne rien publier de commercial sans decision explicite.
- **Roadmap contenu restante** : pages stations thermales individuelles (Vittel, Capvern, Contrexeville avis/prix), cure thermale obesite 14 stations (article dedie liste complete + procedure remboursement), jeune et randonnee comparatif organisateurs FFJR, retraite yoga perte de poids. Ne PAS faire de fausse experience personnelle ("j'ai teste").
- **Maillage** : chaque nouvel article de n'importe quelle collection qui mentionne cure/sejour/repos/vacances doit lier vers /retraites/ ou un article du cluster
- **Articles publies** : protocole Wegovy+cure thermale rembourses, retraites GLP-1 europeennes (Lanserhof etc.), jeune sous GLP-1, top 10 retraites perte de poids France
- **Regles** : prix TOUJOURS sources et verifiables, zero invention ; pas d'affiliation ; thumbnails SVG uniques (DA verte #1a3c34/#16a34a) dans public/images/thumbnails/
- **Strategie** : first-mover sur "GLP-1 x retraite" (desert editorial FR) ; clusters cibles : cure thermale minceur (remboursee Secu), jeune et randonnee, sejour minceur, longevity/medical wellness
- Idees d'articles restantes (recherche 13/07) : Brides-les-Bains avis, combien coute une retraite, cure detox arnaque ?, peau relachee post-GLP-1 (pont Morpheus8), camp perte de poids adulte, comparatif thalasso, j'ai teste jeune et rando, retraites longevite

## Routine quotidienne — MANDAT ELARGI (demande Robin 14/07/2026)

La routine quotidienne ne se limite PAS au rapport SEO recovery + Coach IA. A chaque run, elle doit AUSSI :
1. **Checker les resultats de chaque projet actif** :
   - SEO recovery (baseline fixe : 922 sessions GA/jour, 106 clics GSC/jour — moyenne 15-23 juin)
   - Coach IA : volume, qualite, emissions `[[DOSSIER_READY]]` (1re emission le 13/07 apres fix v46)
   - Funnel Dossier 4,99 EUR : visites landing, dossiers pending/paid/generated
   - Test d'eligibilite : leads `contact_type='eligibility_test'` dans contacts, taux de capture
   - Verticale retraites : impressions/clics GSC des pages /retraites/ et /collections/retraites-bien-etre/ (indexation d'abord, positions ensuite)
2. **Ameliorer** : si un chiffre stagne ou regresse, diagnostiquer et proposer/appliquer un fix (tickets, ajustement prompt Coach, maillage, title/meta). Les corrections de contenu passent par correction_tickets (statut approved).
3. **Chercher des opportunites** : nouvelles requetes GSC en positions 5-20 avec impressions (quick wins), tendances (WebSearch si pertinent), gaps de contenu — alimenter content_opportunities et proposer les 2-3 meilleures actions du jour dans le rapport.
2ter. **Sequence email leads** : au-dela de l'email J0 (recap), relancer les leads eligibility_test a J+3 ("avez-vous pris rendez-vous ? comment choisir son CSO") et J+7 (proposition Dossier 4,99 EUR) — un seul theme par email, se desinscrire possible, tracer dans email_replies. Ne relancer que les leads n'ayant pas achete.
2bis. **Envoyer les emails "plan d'action" du test d'eligibilite** (ENGAGEMENT UTILISATEUR, sous 24h) : chaque run, recuperer les nouveaux leads `contacts` avec `contact_type='eligibility_test'` sans reponse envoyee, et leur envoyer leur recapitulatif par email (verdict + 3 etapes du parcours, stocke dans le champ `message`) via SMTP Hostinger (robin@glp1-france.fr, meme canal que scripts/send-email-replies.mjs). Contenu : verdict personnalise, 3 etapes generiques (medecin traitant → CSO/CHU → pharmacie), lien vers le Dossier 4,99 EUR. PAS de checklist detaillee ni de liste CSO (exclusivite du Dossier payant). Tracer l'envoi dans email_replies ou marquer le contact.
3bis. **Indexation des pages manquantes** : detecter les pages publiees mais non indexees (page dans le sitemap / recemment publiee MAIS 0 impression dans gsc_metrics depuis 3+ jours). La soumission GSC est MANUELLE (aucune API Google pour "demander une indexation" de pages classiques) : la routine produit la liste d'URLs prete a coller dans l'inspection GSC, en tete de rapport, et notifie Robin si la liste est non vide (max ~10 URLs/jour, prioriser par potentiel de trafic). Verifier aussi que le sitemap est a jour apres chaque publication.
4. **Alerter Robin** (PushNotification) seulement si : anomalie critique (site down, deindexation, erreur medicale du Coach, violation Zepbound), 1re conversion payante du Dossier, ou action bloquante cote Robin (ex : sync IMAP morte depuis le 20/05 — a relancer en local).

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
- `affiliate_clicks` — Clics sortants vers les partenaires (partner, campaign, element, page_url)

### Statuts des tickets
Les tickets sont **auto-approuves** (pas de validation humaine) :
`approved` → `in_progress` → `ready_to_deploy` → `deployed`

## Scripts utilitaires

- `scripts/agent-server.mjs` — Serveur HTTP pour orchestrer les agents (port 7854)
- `scripts/routine.mjs` — Script bloquant de routine (preferer le pipeline du serveur)
- `scripts/sync-analytics.mjs` — Sync GA4 + GSC → Supabase (`--days 7`, `--setup` pour OAuth)

## Preference de Robin (14/07/2026)

- **Franc-parler attendu** : signaler sans hesiter ce qui semble bizarre, contreproductif ou risque, et proposer des idees — meme non sollicitees. Ne pas se contenter d'executer.
- Points ouverts signales le 14/07 : (1) byline "Dr. Marie Dubois" probablement fictive = risque E-E-A-T/legal, recommandation : vrai relecteur credite ; (2) trop de micro-produits (Dossier 4,99 + consultation 3 EUR + Premium) → focus Dossier seul ; (3) pas de build check sur les PR avant deploy prod ; (4) a la reactivation de la creation auto : chaque chiffre source ou supprime.

## Conventions

- Commit messages en anglais
- Code et commentaires en français ou anglais (pas de mix dans un même fichier)
- **Thumbnails uniques** : chaque article doit avoir son propre thumbnail, pas de reutilisation
- Les agents tournent en local avec Claude Max — pas de clé API Anthropic nécessaire
- Ne jamais commit de secrets ou .env
- **Toujours utiliser le pipeline** pour les modifications du site (pas de modifications manuelles sans fact-check)
