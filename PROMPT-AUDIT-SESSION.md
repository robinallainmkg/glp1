# Prompt d'audit & fact-check — copier dans une nouvelle session Claude Code

Copie/colle TOUT ce qui suit dans une nouvelle session Claude Code. Le repo est déjà dans `C:\Users\robin\glp1\glp1`, Supabase MCP connecté, build prod sur Hostinger via GitHub Actions.

---

## Mission

Tu lances un audit complet de glp1-france.fr (site média indépendant français sur les traitements GLP-1). 4 dimensions à auditer en parallèle, livrer un rapport actionnable à la fin.

## Contexte technique

- **Stack** : Astro 4 static, output `static`, hébergement Hostinger mutualisé via FTP, CI GitHub Actions
- **Repo** : `C:\Users\robin\glp1\glp1`
- **Branche unique** : `main`
- **Supabase** : projet `ywekaivgjzsmdocchvum` (PAS l'autre, RB SEO)
- **Trafic** : ~5000-7000 sessions/mois, 89% intention prix/budget/remboursement, top pages : prix-mounjaro, prix-wegovy, prix-ozempic, wegovy-remboursement-mutuelle
- **Monétisation actuelle** : focus 100% Sinocare via Awin (advertiser ID 114180, EPC 0,17€). Banner Sinocare sur toutes les pages (BaseLayout/StaticLayout/UnifiedLayout) + sidebar + CTAs inline/bottom sur pages GLP-1. Annette en backup sur pages régime/effets. GlucoPulse en pause (page existe orpheline à `/produits/glucopulse/`).

## CRITICAL — règles à respecter

- **Ne JAMAIS** réintroduire CharlesCTA/CharlesSidebar (composants supprimés, partenaire abandonné)
- **Ne JAMAIS** déployer sans build local réussi
- **Ne JAMAIS** commit `secrets/`, `.env`, ou la clé service account GA4
- **NE PAS** réactiver GlucoPulse comme partenaire actif sans demande explicite
- **NE PAS** modifier `astro.config.mjs` redirects avec des `[...slug]` wildcards (cassent le build)
- Output Astro reste `static`, pas de SSR

---

## Audit 1 — Fact-check articles cluster mutuelles (PRIORITÉ : risque YMYL)

**Le problème** : 13 articles dans `src/content/glp1-cout/` ont été créés par un agent SANS WebSearch. Ils annoncent des forfaits chiffrés ("MGEN 300€/an", "Harmonie 60% sur devis", "Apicil 50-200€/an", etc.) **non vérifiés**. Risque légal et crédibilité E-E-A-T.

**Articles à fact-checker** (liste prioritaire) :
1. `wegovy-remboursement-mutuelle.md` (340 sess/mois — hub, prioritaire)
2. `wegovy-remboursement-mgen-2026.md`
3. `wegovy-remboursement-harmonie-2026.md`
4. `wegovy-remboursement-malakoff-2026.md`
5. `wegovy-remboursement-alan-2026.md`
6. `wegovy-remboursement-april-2026.md`
7. `wegovy-remboursement-apicil-2026.md`
8. `mutuelle-obesite-comparatif-2026.md`
9. `forfait-medecine-prevention-glp1.md`
10. 5 articles cross-border : `acheter-mounjaro-espagne-prix-pharmacie.md`, `acheter-wegovy-allemagne-prix.md`, `acheter-ozempic-belgique-prix.md`, `acheter-saxenda-portugal-pharmacie.md`, `glp1-pharmacie-en-ligne-europe-legal.md`

**Méthode** :
1. Pour chaque article, extraire TOUTES les claims chiffrées (forfaits, prix, conditions)
2. Vérifier chaque claim via **WebSearch** sur sites officiels (mutuelle.com, mgen.fr, sites mutuelles, ANSM, HAS, ameli.fr)
3. Si claim non vérifiable ou périmée → **reformuler** en formule prudente ("vérifiez votre tableau de garanties", "selon les conditions de votre contrat", etc.)
4. Si claim vérifiée → ajouter source officielle en référence

**Output** : un rapport markdown `AUDIT-FACTCHECK-2026.md` à la racine avec :
- Liste claims vérifiées (✅)
- Liste claims modifiées (⚠️ + le nouveau wording)
- Liste claims supprimées (❌ + raison)
- Commits proposés (un par article)

## Audit 2 — Audit SEO technique

**Méthode** :
1. Run `npm run crawlability:only` (script existant : `scripts/crawlability-analysis.mjs`)
2. Pour chaque article top trafic (Mounjaro/Wegovy/Ozempic + hub mutuelle), vérifier :
   - Title tag < 60 chars
   - Meta description 120-160 chars
   - H1 unique et keyword-rich
   - H2/H3 structurés
   - Schema.org Article + BreadcrumbList présents
   - Internal links sortants (≥3)
   - Images alt complet
3. Query Supabase `seo_audit_results` pour les findings récents :
   ```sql
   SELECT page_url, issue_type, severity, COUNT(*) AS n
   FROM seo_audit_results
   WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
   GROUP BY page_url, issue_type, severity
   ORDER BY severity, n DESC LIMIT 50;
   ```
4. Identifier les pages avec position GSC 5-15 (quick wins SEO)

**Output** : `AUDIT-SEO-2026.md` avec recommandations actionnables (corrections concrètes par article).

## Audit 3 — Audit affiliation & tracking

**Méthode** :
1. Vérifier que TOUTES les pages ont au moins un placement Sinocare visible (Banner via BaseLayout). Query :
   ```bash
   grep -L "SinocareBanner\|SinocareCTA\|SinocareSidebar" src/layouts/*.astro
   ```
   → tout layout sans Sinocare doit être justifié ou complété
2. Vérifier les clics affiliés ces 14 jours :
   ```sql
   SELECT partner, campaign, COUNT(*) AS clicks, COUNT(DISTINCT session_id) AS sessions
   FROM affiliate_clicks
   WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
   GROUP BY partner, campaign ORDER BY clicks DESC;
   ```
3. Identifier les pages à fort trafic SANS clic Sinocare (= banner pas vu / pas cliqué)
4. Vérifier le mapping `AWIN_MID_TO_PARTNER` dans `src/components/AffiliateTracker.astro` : assure-toi que **114180 → sinocare** est là (autres advertisers Awin à ajouter quand validés)
5. Vérifier qu'aucun lien `charles.co` ne traîne ailleurs :
   ```bash
   grep -r "charles\.co\|CharlesCTA\|CharlesSidebar" src/ public/
   ```
6. Pour Annette : vérifier que le routing dans `src/lib/partnerRouter.ts` reste cohérent avec la stratégie (Annette uniquement sur régime/effets/perte-poids/témoignages)

**Output** : `AUDIT-AFFILIATION-2026.md` avec liste de pages sous-monétisées + fix proposés.

## Audit 4 — Audit performance & accessibilité

**Méthode** :
1. Lancer Lighthouse sur les 5 top pages (programmatic via Bash + Chrome headless si dispo, sinon via Claude in Chrome)
2. Vérifier Core Web Vitals : LCP < 2.5s, CLS < 0.1, FID < 100ms
3. Identifier les images sans `width`/`height` (cause CLS)
4. Vérifier les `loading="lazy"` sur images hors viewport
5. Audit accessibilité : alt sur toutes les images, focus styles, contraste

**Output** : `AUDIT-PERF-2026.md` avec quick wins (souvent : preconnect fonts, image dims, lazy loading manquant).

---

## Workflow recommandé

1. **Commence par Audit 1 (fact-check)** — c'est le plus risqué légalement et tu peux le faire en parallèle des autres
2. **Audit 2 (SEO) en parallèle** — utilise les agents `.claude/agents/seo-audit.md` et `.claude/agents/crawler.md` si pertinent
3. **Audit 3 (affiliation)** — query Supabase, grep code, rapport
4. **Audit 4 (perf)** — Lighthouse sur top 5
5. **À la fin** : synthèse globale `AUDIT-SYNTHESE-2026.md` avec les 10 actions par ordre d'impact

## Format de livrable final

Une fois les 4 audits faits, livre :
- 4 rapports markdown détaillés (1 par audit)
- 1 synthèse `AUDIT-SYNTHESE-2026.md` avec top 10 actions priorisées par impact business
- Pour chaque action proposée : effort estimé, impact attendu, agent qui peut l'exécuter (editorial/seo-audit/etc.)
- Commits proposés (pas exécutés sauf demande explicite) avec messages

**Ne déploie rien sans demande explicite du user.** Présente les findings et propositions, attends validation.

---

## Tools disponibles dans la session

- `Bash`, `Read`, `Edit`, `Write`, `Glob`, `Grep`
- MCP Supabase (`mcp__100191b9-c65d-4d9c-9c03-438c9d242175__execute_sql` etc.)
- WebSearch + WebFetch
- Claude in Chrome (pour Lighthouse / vérif visuelle)
- Agents `.claude/agents/*.md` (seo-audit, fact-check, crawler, opportunities, editorial)

## Pour démarrer

Lis d'abord `CLAUDE.md` et `MEMORY.md` (sous `C:\Users\robin\.claude\projects\C--Users-robin-glp1-glp1\memory\`) pour le contexte projet. Puis attaque Audit 1.
