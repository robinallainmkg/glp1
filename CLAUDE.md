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

## OBJECTIFS BUSINESS (hierarchie fixee par Robin, 21/07/2026)

1. **OBJECTIF PRINCIPAL : vendre des Dossiers GLP-1** (4,99 EUR). Toute session/routine doit d'abord se demander : qu'est-ce qui a bouge sur ce funnel, et qu'est-ce qui peut l'ameliorer ?
2. Objectif secondaire n°1 : **beaucoup de trafic autour des GLP-1** (SEO recovery + croissance).
3. Objectif secondaire n°2 : **devenir leader sur les retraites longevite** et y attirer un trafic croissant.

Consequence pour la routine quotidienne : le rapport s'ouvre TOUJOURS par le volet MONETISATION (voir plus bas) — un rapport sans ce volet est incomplet.

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

## Routine quotidienne — OPERATEUR AUTONOME (maj 20/07/2026, demande Robin)

**Modele : `claude-fable-5` obligatoire** (configure dans `.claude/settings.json` ; verifier aussi le modele choisi dans la tache planifiee cote claude.ai/code).
**Permissions : mode bypass** (`defaultMode: bypassPermissions` dans settings) — la routine ne doit JAMAIS rester bloquee sur une demande de permission d'outil.

La routine n'est PAS un rapporteur : c'est un **operateur autonome du site**. A chaque run elle observe, analyse, DECIDE et CORRIGE elle-meme. Elle ne demande l'avis de Robin que pour les actions sensibles (matrice ci-dessous).

### Matrice d'autonomie

**Corriger DIRECTEMENT (sans demander)** :
- **Merger ses propres PRs techniques/SEO et deployer** (autorisation explicite Robin 20/07/2026 : "tu dois etre completement autonome sur ces trucs la") — sauf si la PR touche un point de la liste "DEMANDER" ci-dessous. Apres merge, surveiller le deploy jusqu'au vert et verifier le site live.
- seoTitle/seoDescription, headings, frontmatter, `updatedAt`
- Maillage interne (ajout de liens contextuels entre articles)
- Corrections factuelles SOURCEES (chiffre ANSM/HAS verifie via WebSearch, prix officiel, date)
- Bugs Coach IA : prompt systeme, detection d'intent, garde-fous + **deploy direct via l'outil MCP `mcp__Supabase__deploy_edge_function`** (valide le 20/07, v49 — plus besoin de Robin)
- Fixes techniques : liens casses, redirects, sitemap, images manquantes, schema.org, meta robots
- Tickets correction_tickets + content_opportunities (INSERT Supabase)
- Emails leads (sequence J0/J+3/J+7 definie plus bas)
- Toute occurrence Zepbound detectee = suppression IMMEDIATE (jamais d'attente)

**DEMANDER l'avis de Robin avant (AskUserQuestion si interactif, sinon PushNotification + section "EN ATTENTE DE DECISION" en tete de rapport)** :
- Supprimer/desindexer/rediriger une page existante
- Toucher aux prix, a l'offre, a la monetisation, a Stripe
- Modifier le schema DB, les rate-limits, les workflows CI/CD
- Refonte structurelle (navigation, layouts, home)
- Reecrire plus de ~30% d'un article, ou publier un nouvel article
- Tout sujet medical/legal incertain (si la source officielle est introuvable → ticket + question, pas d'invention)

### Phase A0 — MONETISATION (PREMIER volet du rapport, OBLIGATOIRE chaque run)

C'est l'objectif principal du site (voir OBJECTIFS BUSINESS). Chaque rapport quotidien S'OUVRE par ce volet, avec ces metriques :
1. **Visites funnel** (ga_metrics) : sessions/pageviews sur `/dossier-glp1/`, `/outils/test-eligibilite/`, `/mon-espace/dossier/` — jour + cumul 7j, avec **sources** (`source` dans ga_metrics : organic/direct/referral).
2. **Dossiers** (table `dossiers`) : crees (24h + 7j), **tentatives de checkout** (`stripe_session_id IS NOT NULL`), payes (`paid_at`), generes, via chat (`conversation_id IS NOT NULL`) vs formulaire. Toute tentative de checkout non payee = **relance email** (si email present, tracer dans `relance_sent_at`).
3. **Contribution du Coach** : nb de reponses assistant proposant le Dossier (`content ILIKE '%dossier glp-1 personnalis%'`) sur 7j, nb de verdicts eligibles rendus, nb de `[[DOSSIER_READY]]` emis.
4. **Leads test d'eligibilite** : nouveaux `contacts` avec `contact_type='eligibility_test'` (si 0 depuis plusieurs jours ET la page a du trafic → bug de capture a investiguer ; si 0 trafic → probleme d'exposition).
5. **Diagnostic de fuite** : identifier l'etape qui bloque (exposition → visite landing → formulaire/chat → checkout → paiement) et proposer/appliquer 1 a 3 ameliorations concretes (dans la matrice d'autonomie).
6. **Suivi post-achat (OBLIGATOIRE dans chaque rapport)** : pour chaque dossier paye, envoyer l'email de satisfaction a J+2/J+3 via l'edge function `send-feedback-email` (v3, envoyeur generique guarde par token — token lisible dans le source via `mcp__Supabase__get_edge_function`, category `dossier_satisfaction`, trace auto dans email_replies), puis verifier a CHAQUE run si le client a repondu (incoming_emails, sync auto pg_cron toutes les 15 min) et le dire dans le rapport (« relance envoyee le X, pas de reponse » compte comme une info). Etat au 27/07 : client 1 (paye 22/07) email envoye 23/07 sans reponse ; client 2 (paye 24/07) email envoye 27/07.
Si un dossier est PAYE : PushNotification immediate a Robin (1re conversion = evenement).

### Phase A — Etat des lieux (collecte, chaque run)

Verifier fraicheur GA4/GSC (regle critique en tete de fichier), site live (home 200, redirect zepbound→mounjaro, sitemap), puis :
1. **Checker les resultats de chaque projet actif** :
   - SEO recovery (baseline fixe : 922 sessions GA/jour, 106 clics GSC/jour — moyenne 15-23 juin)
   - Coach IA : volume, qualite, emissions `[[DOSSIER_READY]]` (1re emission le 13/07 apres fix v46)
   - Funnel Dossier 4,99 EUR : visites landing, dossiers pending/paid/generated
   - Test d'eligibilite : leads `contact_type='eligibility_test'` dans contacts, taux de capture
   - Verticale retraites : impressions/clics GSC des pages /retraites/ et /collections/retraites-bien-etre/ (indexation d'abord, positions ensuite)
   - SEO programmatique pharmacies (voir section dediee plus bas) : impressions/clics GSC sur /pharmacies/*/prix-* et /pharmacies/dept/*/prix-*, progression de l'indexation du cluster
2. **Ameliorer** : si un chiffre stagne ou regresse, diagnostiquer et proposer/appliquer un fix (tickets, ajustement prompt Coach, maillage, title/meta). Les corrections de contenu passent par correction_tickets (statut approved).
3. **Chercher des opportunites** : nouvelles requetes GSC en positions 5-20 avec impressions (quick wins), tendances (WebSearch si pertinent), gaps de contenu — alimenter content_opportunities et proposer les 2-3 meilleures actions du jour dans le rapport.
2ter. **Sequence email leads** : au-dela de l'email J0 (recap), relancer les leads eligibility_test a J+3 ("avez-vous pris rendez-vous ? comment choisir son CSO") et J+7 (proposition Dossier 4,99 EUR) — un seul theme par email, se desinscrire possible, tracer dans email_replies. Ne relancer que les leads n'ayant pas achete.
2bis. **Envoyer les emails "plan d'action" du test d'eligibilite** (ENGAGEMENT UTILISATEUR, sous 24h) : chaque run, recuperer les nouveaux leads `contacts` avec `contact_type='eligibility_test'` sans reponse envoyee, et leur envoyer leur recapitulatif par email (verdict + 3 etapes du parcours, stocke dans le champ `message`) via SMTP Hostinger (robin@glp1-france.fr, meme canal que scripts/send-email-replies.mjs). Contenu : verdict personnalise, 3 etapes generiques (medecin traitant → CSO/CHU → pharmacie), lien vers le Dossier 4,99 EUR. PAS de checklist detaillee ni de liste CSO (exclusivite du Dossier payant). Tracer l'envoi dans email_replies ou marquer le contact.
3bis. **Indexation des pages manquantes** : detecter les pages publiees mais non indexees (page dans le sitemap / recemment publiee MAIS 0 impression dans gsc_metrics depuis 3+ jours). La soumission GSC est MANUELLE (aucune API Google pour "demander une indexation" de pages classiques) : la routine produit la liste d'URLs prete a coller dans l'inspection GSC, en tete de rapport, et notifie Robin si la liste est non vide (max ~10 URLs/jour, prioriser par potentiel de trafic). Verifier aussi que le sitemap est a jour apres chaque publication.
4. **Alerter Robin** (PushNotification) seulement si : anomalie critique (site down, deindexation, erreur medicale du Coach, violation Zepbound), 1re conversion payante du Dossier, action bloquante cote Robin (nota : la sync IMAP est REPAREE depuis le 23/07 — edge function `sync-inbox` + pg_cron toutes les 15 min, plus rien a relancer en local ; si `incoming_emails` reste muette 3+ jours, tester la fonction avant d'alerter), ou decision sensible en attente (matrice d'autonomie).

### Phase B — Analyse du trafic & decisions (chaque run, avant les actions)

Ne pas se contenter des scores de recovery. Chaque run doit produire une **analyse decisionnelle** :
1. **Pages gagnantes / perdantes** : comparer clics+impressions GSC 7 derniers jours vs 7 precedents, lister le top 5 en hausse et le top 5 en baisse avec hypothese de cause pour chaque. **OBLIGATOIRE : pour toute page du top 5 qui perd >20% d'impressions, descendre au niveau REQUETE (WoW par query sur cette page) et nommer la cause** (glissement de position sous le pli page 1, cannibalisation par une page recente, saisonnalite, SERP feature). Un rapport qui dit "ca baisse" sans nommer la requete qui s'effondre et la cause probable est incomplet — c'est cette analyse qui a revele le crash "ozempic prix" (-90% d'impressions) le 27/07, invisible dans les totaux quotidiens.
2. **Requetes montantes** : nouvelles requetes GSC (absentes il y a 14 jours) avec 50+ impressions — decider : page existante a renforcer, ou content_opportunity.
3. **CTR outliers** : toute page avec CTR < 1.5% sur 300+ impressions/7j = candidate C1 immediate.
4. **Cannibalisation** : si 2 pages rankent sur la meme requete avec positions instables, decider laquelle est canonique et renforcer son maillage.
5. **Funnel Dossier bout en bout** : sessions landing → dossiers pending → paid → generated. Identifier l'etape qui fuit et decider d'un fix (CTA, prix visible, reassurance, formulaire).
6. Chaque decision est consignee dans le rapport, section "B. DECISIONS" : constat → decision → action (faite ou en attente Robin).

### Phase D — Audit rotatif du site (1 dimension par jour)

Chaque run audite EN PROFONDEUR une dimension (rotation sur 7 jours, noter dans le rapport laquelle) :
- **J1 Technique** : 404, chaines de redirects, sitemap vs pages reelles, robots.txt, canonicals
- **J2 On-page SEO** : titles/descriptions dupliques ou trop longs, H1 manquants, pages orphelines
- **J3 Maillage** : pages a moins de 3 liens entrants internes, ancres sur-optimisees, liens casses
- **J4 Contenu** : articles non mis a jour depuis 90+ jours sur requetes a volume, spot fact-check de 3 articles (chiffres, dates, prix vs sources officielles via WebSearch)
- **J5 Conversion** : parcours Dossier 4,99 EUR complet, test eligibilite, CTAs Coach, points de friction
- **J6 Performance/UX** : poids images, thumbnails manquants ou dupliques, mobile, Core Web Vitals (PageSpeed si accessible)
- **J7 Concurrence** : WebSearch sur les 5 requetes tete (prix ozempic, prix mounjaro, penurie, remboursement wegovy, test eligibilite) — qui ranke au-dessus de nous, avec quoi, et quoi ameliorer pour les passer
Les findings alimentent directement la Phase C (fix immediat si autonome, ticket ou question sinon).

### Phase C — Actions a executer a chaque run (OBLIGATOIRE, apres le rapport)

Apres avoir ecrit le rapport, la routine **execute directement** les ameliorations identifiees. Ne pas se contenter de lister — faire. Voici les types d'actions par categorie :

**C1. Quick wins SEO (frontmatter MD)** — a executer si un CTR < 1.5% sur 500+ impressions/semaine :
- Lire le fichier `src/content/<collection>/<slug>.md`
- Modifier `seoTitle` (max 65 cars) et `seoDescription` (max 155 cars) pour le rendre plus cliquable
- Criteres d'un bon title : inclure le mot-cle principal en debut, chiffre ou date si pertinent, hook benefice (ex: "comparez", "carte", "remboursement")
- Criteres d'une bonne description : 1 phrase benefit + 1 detail differenciateur + CTA implicite. JAMAIS de placeholders ni de verbes vagues.
- Mettre `updatedAt` a la date du jour

**C2. Bugs Coach IA (edge function)** — a executer si un bug est detecte dans les conversations :
- Lire `supabase/functions/ai-coach/index.ts`
- Corriger le comportement defaillant (prompt systeme, detection d'intent, logique RAG, garde-fous)
- Committer et pusher (git). Le deploy de l'edge function est SEPARÉ du deploy statique :
  - **En remote (routine) : deployer DIRECTEMENT via l'outil MCP `mcp__Supabase__deploy_edge_function`** (project_id `ywekaivgjzsmdocchvum`, valide le 20/07/2026 — v49 deployee ainsi). Noter la version deployee dans le rapport.
  - En local Robin (fallback) : `supabase functions deploy ai-coach --project-ref ywekaivgjzsmdocchvum`
- NE PAS modifier les constantes de rate-limit ou le schema DB sans decision explicite

**C3. Correction tickets Supabase** — pour les ameliorations qui necessitent un contenu long (article complet, maillage interne) :
```sql
INSERT INTO correction_tickets (article_id, type, urgency, description, before_content, after_content, status)
VALUES (..., 'approved');
```
Le statut `approved` permet a l'agent editorial de les consommer au prochain pipeline.

**C4. Content opportunities** — si une requete GSC en pos 5-20 avec 200+ impressions n'a pas encore de page dediee :
```sql
INSERT INTO content_opportunities (title, keyword, search_volume_estimate, priority_score, notes, status)
VALUES (...);
```

**Regles d'execution** :
- **Max 6 actions autonomes par run** (au-dela : tickets pour le pipeline editorial). Une action = 1 fichier corrige, 1 bug Coach fixe+deploye, ou 1 lot de tickets/opportunites insere.
- Privilegier dans l'ordre : violation Zepbound > bugs Coach (erreur medicale d'abord) > findings de l'audit Phase D > CTR pages cle > content opportunities
- Toujours committer a la fin du run : `git add -A && git commit -m "fix/feat: [description]"`
- Pusher sur la branche de travail de la session (en remote) ou main (en local) pour deployer
- Ajouter un volet "C. ACTIONS EXECUTEES" dans le rapport daily avec la liste de ce qui a ete fait, pourquoi, et le diff en 1 ligne
- Ajouter un volet "D. AUDIT DU JOUR" (dimension auditee + findings) et "B. DECISIONS" (constat → decision → action)
- Terminer par un volet "EN ATTENTE DE DECISION ROBIN" si des actions sensibles ont ete identifiees (vide = le dire explicitement)

## Projet SEO programmatique pharmacies (lance 20/07/2026, valide Robin "20 000 pages")

**Etat au 20/07/2026 (tout deploye et verifie live)** :
- ~20 145 pages pharmacie individuelles (`/pharmacies/[ville]/[pharmacie]/`) — TOUTES les pharmacies FINESS, en prod depuis juin
- 500 hubs villes (`/pharmacies/[ville]/`, top 500 par nb de pharmacies) + ~1 950 pages codes postaux (`/pharmacies/cp/[cp]/`, tous les CP >= 3 pharmacies)
- 600 pages prix ville (`/pharmacies/[ville]/prix-{mounjaro,wegovy,ozempic}/`, top 200 villes) — helper `src/lib/pharmacyCityData.ts` (`PRICE_CITIES_LIMIT = 200`)
- 306 pages prix departement (`/pharmacies/dept/[dept]/prix-*/`, 102 depts) — composant `PrixDeptContent.astro`
- Total site : 23 920 pages buildees (~2,2 GB dist, build ~4 min 30)

**Regles du cluster** :
- **Prix UNIQUEMENT officiels** (BDPM/arretes 15/06/2026) : Ozempic 77,60 EUR (30%, 100% ALD), Wegovy 146,91-195,10 EUR (65%), Mounjaro 176,10-433,80 EUR (65%). L'ancienne logique d'"estimations" par hash FINESS a ete SUPPRIMEE le 20/07 (`pharmacyPricing.ts`) — ne JAMAIS la reintroduire.
- Angle editorial : prix identiques partout → le contenu mise sur la DISPONIBILITE + le parcours CSO (primo-prescription), pas la comparaison de prix
- Data : `public/data/pharmacies.json` (20 040 pharmacies) + `cso.json` — refresh auto hebdo via `.github/workflows/refresh-pharmacies-data.yml` (lundi 06:47 Paris)
- Deploy : toucher `src/pages/pharmacies/` ou `pharmacies.json` declenche le full sync FTP (~16-40 min) ; les merges pendant un deploy en cours l'ANNULENT (`cancel-in-progress`) — toujours attendre le vert avant de merger un 2e lot

**Prochains paliers (dans l'ordre, chacun conditionne au precedent)** :
1. **Attendre l'indexation** : verifier a chaque routine les impressions GSC sur `/pharmacies/.*/prix-` ; premiere evaluation serieuse ~24-25/07
2. Si l'indexation demarre : palier hubs villes 500 → 1000 (`[ville].astro` + `cp/[zipcode].astro`, slice 500 → 1000) et pages prix ville 200 → 500 (`PRICE_CITIES_LIMIT`, garder les 3 fichiers prix + `[ville].astro` synchronises)
3. Si ca continue : envisager l'angle "disponibilite/stock communautaire" (retourner l'outil de soumission prix en signalement de stock) — DEMANDER a Robin avant (produit)

**Signaux en surveillance (20/07)** :
- "ozempic wegovy penurie" : 901 imp/14j, position 3.6, **0 clic** — anormal ; re-checker apres le nouveau title (deploye 20/07). Si toujours 0 clic vers le 24-25/07, investiguer la SERP.
- "ozempic prix" (3 457 imp, pos 13.2) : pas de cannibalisation, probleme de position — le maillage local doit la faire remonter, suivre la position hebdo
- Article "ozempic sans ordonnance" (cible 4 400 imp/14j) et "wegovy espagne" : suivre premieres impressions

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
