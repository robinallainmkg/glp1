# Grosse session — Analyse sprint Sinocare + Audit site + Propositions stratégiques

Copie/colle TOUT ce qui suit dans une nouvelle session Claude Code. Repo : `C:\Users\robin\glp1\glp1`. Supabase MCP, Google Service Account (GA4 + GSC), Awin (compte 2879557, Sinocare mid 114180) déjà configurés.

---

## Mission

Session d'analyse stratégique en 3 parties :
- **Partie A** — Analyser les résultats du sprint d'intégration Sinocare (clics, conversions, top placements, ROI)
- **Partie B** — Audit complet du site avec les méthodes développées (data GA/GSC, SEO technique, affiliation, perf)
- **Partie C** — Proposer des idées concrètes sur 3 axes : (1) mieux analyser, (2) nouvelles opportunités de monétisation, (3) améliorer le SEO

**Tu produis un livrable d'analyse + des recommandations priorisées. Tu n'implémentes rien sans validation explicite du user.**

## Contexte projet (lire en premier)

- `CLAUDE.md` à la racine
- `MEMORY.md` dans `C:\Users\robin\.claude\projects\C--Users-robin-glp1-glp1\memory\`
- `PROMPT-SPRINT-SINOCARE.md` (le sprint qui vient d'être exécuté, pour comprendre ce qui a été mis en place)

**Stack** : Astro 4 static, Hostinger FTP, build `npm run astro:build`, deploy auto sur push main.

**État monétisation** :
- **Sinocare** (Awin mid 114180, EPC 0,17€, CR 7,12%) = focus principal. Intégré via : banner global (toutes pages), SinocareCTA + SinocareSidebar + mentions inline dans ~40 articles. Catalogue dans `src/lib/sinocareProducts.ts`, composants dans `src/components/sinocare/`.
- **Annette** = lien direct, top performer historique (~15 clics/10j) sur pages régime/effets/perte-poids. NE PAS toucher.
- **GlucoPulse** = en pause (page orpheline). NE PAS réactiver.
- **Sensilab** = validé Awin, peut-être intégré (vérifier dans le code).

**Trafic** : ~10 000 sessions/mois, en hausse. 45% obésité GLP-1, 10% DT2, 20% pharmacies, 9% prix générique. 89% intention prix/budget/remboursement.

---

## Méthodes développées (à réutiliser)

### 1. Data : Supabase + GA/GSC sync
Le sync GA4 + GSC tourne via service account :
```bash
GOOGLE_APPLICATION_CREDENTIALS="C:/Users/robin/.gcloud/ga-service-account.json" node scripts/sync-analytics.mjs --days 30
```
**Lance ce sync en début de session** pour avoir les données fraîches.

Tables Supabase utiles (projet `ywekaivgjzsmdocchvum`) :
- `ga_metrics` : page_path, date, sessions, pageviews, bounce_rate, avg_time_on_page
- `gsc_metrics` : query, page, date, clicks, impressions, position
- `affiliate_clicks` : partner, campaign (= clickref), page_url, element, session_id, created_at
- `product_interest` : emails capturés GlucoPulse (legacy, en pause)
- `correction_tickets`, `fact_check_results`, `seo_audit_results`, `content_opportunities` : pour les agents

### 2. Tracking ROI Sinocare — pattern clickref
Chaque lien Awin porte un `clickref` :
```
glp1france_<placement>_<product>_<slug>
```
Les clics sont dans `affiliate_clicks.campaign`. **MAIS les conversions/commissions ne sont QUE dans le dashboard Awin** — Supabase ne capture que les clics. Pour le ROI réel : navigue sur Awin via Claude in Chrome (user déjà loggé) → `https://ui.awin.com/` → rapports de transactions, filtrer par clickref.

### 3. Vérif visuelle : Claude in Chrome
Pour toute vérif UI, utiliser `mcp__Claude_in_Chrome__navigate` + `computer` (screenshot). Dev server : `npm run dev` (port 4327). Les screenshots du preview MCP timeout sur pages lourdes → préférer Claude in Chrome.

### 4. Déploiement
- Build local OBLIGATOIRE avant push (`npm run astro:build`)
- Push main → deploy GitHub Actions. Scope detection : si commit ne touche pas composants/layouts/styles partagés ni pharmacies → deploy scoped ~3-5 min, sinon full sync ~30 min
- Toujours vérif prod après deploy

---

## Partie A — Analyse du sprint Sinocare

### A.1 Clics par placement (Supabase)
```sql
SELECT 
  campaign AS clickref,
  COUNT(*) AS clicks,
  COUNT(DISTINCT session_id) AS sessions,
  COUNT(DISTINCT page_url) AS pages,
  MIN(created_at)::date AS first, MAX(created_at)::date AS last
FROM affiliate_clicks
WHERE partner = 'sinocare'
GROUP BY campaign
ORDER BY clicks DESC;
```
Décomposer le `clickref` (`glp1france_<placement>_<product>_<slug>`) pour agréger :
- Par **type de placement** (inline, card, compare, callout, sidebar, banner, doctor, footer)
- Par **produit** (safe-aq-smart, aoj-50a-balance, bandelettes, etc.)
- Par **article**

### A.2 CTR par placement
Croiser les clics avec les sessions des pages où chaque placement apparaît (via `ga_metrics`). Calculer un CTR estimé par type de placement → identifier ce qui marche.

### A.3 Conversions réelles (Awin via Claude in Chrome)
Navigue sur le dashboard Awin, section rapports/transactions. Récupère par `clickref` (ou au moins global Sinocare) :
- Nombre de ventes
- Commission totale
- EPC réel
- Taux de conversion

### A.4 Verdict sprint
- Quels placements convertissent (à garder/étendre) ?
- Quels placements flop (à retirer) ?
- Quels produits se vendent (balance ? lecteur ? bandelettes ?) ?
- Quels articles génèrent le plus de revenu ?
- **ROI projeté mensuel** Sinocare avec la config actuelle

---

## Partie B — Audit complet du site

### B.1 Audit trafic & SEO (data-driven)
```sql
-- Top queries GSC + position (quick wins = position 5-15)
SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS imp, ROUND(AVG(position)::numeric,1) AS pos
FROM gsc_metrics WHERE date >= CURRENT_DATE - INTERVAL '28 days'
GROUP BY query HAVING SUM(impressions) > 50
ORDER BY imp DESC LIMIT 50;
```
- Identifier les pages position 5-15 (quick wins : un petit boost SEO = gros gain clics)
- Identifier les requêtes à fortes impressions mais faible CTR (titre/meta à optimiser)
- Pages en chute de position vs période précédente

### B.2 Audit SEO technique
- Run `npm run crawlability:only` (script `scripts/crawlability-analysis.mjs`)
- Query `seo_audit_results` pour findings récents
- Vérifier : titles, meta desc, H1 unique, schema.org, maillage interne, images alt

### B.3 Audit affiliation/monétisation
- Vérifier que toutes les pages ont au moins 1 placement monétisable
- Identifier les pages à fort trafic sous-monétisées
- Vérifier qu'aucun ghost (charles.co) ne traîne : `grep -r "charles\.co\|CharlesCTA" src/ public/`
- Cohérence du routing `src/lib/partnerRouter.ts`

### B.4 Audit perf & accessibilité
- Lighthouse sur top 5 pages (via Claude in Chrome ou chrome headless)
- Core Web Vitals (LCP, CLS, FID)
- Images sans dimensions (cause CLS), lazy loading manquant

### B.5 Audit contenu / fact-check (rappel risque YMYL)
- Les 13 articles cluster mutuelles ont des forfaits chiffrés potentiellement non vérifiés (voir `PROMPT-AUDIT-SESSION.md` si présent)
- Flagger les claims médicaux/financiers à vérifier

---

## Partie C — Propositions stratégiques (3 axes)

### Axe 1 — Mieux analyser (data)
Propose des améliorations du dispositif analytique :
- Quelles **données manquantes** seraient utiles ? (ex : events GA4 custom sur les clics affiliés, scroll depth, attribution multi-touch)
- Comment **rapprocher** les clics Supabase et les conversions Awin (matching par clickref, import régulier des transactions Awin) ?
- Faut-il un **dashboard admin** dédié (`/admin/affiliation`) qui agrège clics + conversions + revenu par placement/produit/article en temps réel ?
- Quelles **métriques de cohorte** suivre (revenu par 1000 sessions = RPM, EPC par bucket d'intent) ?
- Proposer 3-5 requêtes/vues Supabase à créer pour le suivi récurrent

### Axe 2 — Nouvelles opportunités de monétisation
Au-delà de Sinocare :
- **Sensilab** (compléments minceur, validé Awin) — fit le 45% obésité. Quel potentiel ?
- **Autres advertisers Awin** à demander (DocMorris/Redcare pharmacie EU pour cross-border, DoktorABC téléconsultation pour prescription, etc.)
- **Effiliation** (réseau santé FR) pour les vraies mutuelles (MGEN, Harmonie...) sur les 89% intention remboursement
- **Mode B** : lead magnet PDF + email capture + revente leads / programme premium
- **Diversification produits Sinocare** : quels produits du catalogue sont sous-exploités ?
- Pour chaque opportunité : effort, potentiel revenu/mois estimé, fit avec l'audience

### Axe 3 — Améliorer le référencement naturel
- **Quick wins position 5-15** : lister les 10 pages les plus proches de la page 1 Google, avec actions concrètes (enrichir contenu, optimiser title, ajouter FAQ schema, maillage interne)
- **Gaps de contenu** : query `content_opportunities` Supabase + analyse des requêtes GSC à fortes impressions sans page dédiée
- **Maillage interne** : pages hub sous-liées, opportunités de clusters
- **E-E-A-T** : renforcer l'autorité (auteurs, sources, méthodologie) sur les pages YMYL
- **Pages techniques** : sitemap, vitesse, mobile, Core Web Vitals impact SEO
- Pour chaque reco : impact SEO estimé, effort, agent qui peut l'exécuter (`seo-audit`, `editorial`, `internal-links`, `crawler`)

---

## Livrables finaux

À la racine du repo :
- `ANALYSE-SPRINT-SINOCARE.md` — résultats Partie A (clics, conversions, verdict, ROI)
- `AUDIT-SITE.md` — résultats Partie B (SEO, affiliation, perf, contenu)
- `PROPOSITIONS-STRATEGIE.md` — Partie C, 3 axes, recommandations priorisées par impact/effort
- `SYNTHESE.md` — top 10 actions à faire ce mois, ordonnées par ROI, avec qui les exécute

**Format des recos** : pour chacune → {description, impact estimé, effort, données qui la justifient, agent/méthode d'exécution}.

## Garde-fous

- Ne JAMAIS réactiver Charles ou GlucoPulse
- Ne PAS toucher Annette (top performer)
- Ne PAS commit `secrets/` / clés
- Ne PAS implémenter sans validation user (cette session = analyse + propositions, pas exécution)
- Si tu proposes des modifs code, présente-les, attends le go

## Tools disponibles

- Read/Edit/Write/Glob/Grep/Bash
- Supabase MCP (`mcp__100191b9-c65d-4d9c-9c03-438c9d242175__execute_sql`)
- Claude in Chrome (navigate, computer, javascript_tool, tabs_context_mcp) — pour Awin dashboard + Lighthouse + vérif visuelle
- GA/GSC sync : `scripts/sync-analytics.mjs`
- WebSearch / WebFetch
- Agents `.claude/agents/*.md` (seo-audit, crawler, fact-check, opportunities, internal-links, editorial, analytics)

## Pour démarrer

1. **Lire** `CLAUDE.md`, `MEMORY.md`, `PROMPT-SPRINT-SINOCARE.md`
2. **Lancer le sync** GA/GSC (commande ci-dessus) pour data fraîche
3. **Partie A** : query `affiliate_clicks` + naviguer Awin dashboard via Claude in Chrome pour les conversions
4. **Partie B** : audits data-driven + technique
5. **Partie C** : propositions sur les 3 axes
6. **Livrer** les 4 fichiers markdown + présenter la synthèse au user
