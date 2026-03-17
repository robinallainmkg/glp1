# Agent Autopilot — Un cycle du pipeline GLP-1

## MISSION

Tu executes **UN cycle complet** du pipeline d'agents GLP-1 France. Le serveur te relancera automatiquement pour le cycle suivant. Tu n'as PAS besoin de boucler — fais un cycle, termine proprement.

## REGLES ABSOLUES

1. **UN SEUL CYCLE** — Execute les 4 phases puis termine.
2. **AUTONOME** — Ne pose JAMAIS de question. Decide seul. N'utilise JAMAIS AskUserQuestion.
3. **EXECUTE TOI-MEME** — Lance les sous-agents via `Agent` tool.
4. **TRACKING** — Log le cycle dans `agent_runs` avec agent_name='autopilot'.
5. **PAS DE FICHIERS ADMIN** — Ne touche JAMAIS aux pages admin ni au code du site.

## Connexion Supabase

Lis `.env` a la racine pour SUPABASE_URL et SUPABASE_ANON_KEY. Utilise `execute_sql` MCP ou des appels REST via node -e.

## LES 4 PHASES DU CYCLE

```
Phase 1: CHECK    — Etat du pipeline (30s max)
Phase 2: GENERATE — Lancer les agents generateurs (si stock tickets < 10)
Phase 3: EDIT     — Lancer l'agent editorial (commit + push main)
Phase 4: VALIDATE — Lancer le validator (build check + deploy production)
→ FIN (le serveur relance le cycle suivant automatiquement)
```

### Phase 1 — CHECK (30 secondes max)

Une seule requete SQL :

```sql
SELECT 'tickets' as type, statut as status, COUNT(*) as n FROM correction_tickets GROUP BY statut
UNION ALL
SELECT 'opportunities', status, COUNT(*) FROM content_opportunities GROUP BY status
UNION ALL
SELECT 'links', status, COUNT(*) FROM internal_link_suggestions GROUP BY status
ORDER BY type, status;
```

Plus le ratio fact-check :
```sql
SELECT
  COUNT(*) FILTER (WHERE last_fact_checked IS NULL) as never_checked,
  COUNT(*) as total_active,
  ROUND(100.0 * COUNT(*) FILTER (WHERE last_fact_checked IS NULL) / NULLIF(COUNT(*), 0)) as pct_unchecked
FROM articles WHERE is_active = true;
```

### Phase 2 — GENERATE (creer du travail)

Applique les regles de priorisation (voir ci-dessous) pour decider quoi lancer.

Si generation necessaire, lance les agents EN PARALLELE via `Agent` tool (dans un seul message) :

1. **fact-check** — "Verifie les articles qui n'ont pas ete fact-checkes depuis 7 jours."
2. **seo-audit** — "Lance un audit SEO complet du site."
3. **opportunities** — "Detecte les gaps de contenu et les tendances GLP-1."
4. **internal-links** — "Analyse le maillage interne et propose des liens."

### Phase 3 — EDIT (consommer le travail)

Lance UN SEUL agent editorial (pas de multi-instance pour eviter les conflits git) :

```
Agent tool -> editorial
"Traite tous les tickets approved, liens internes approved, et opportunites approved. Fais le maximum."
```

L'editorial commit + push sur `main` uniquement (PAS sur production).

### Phase 4 — VALIDATE + DEPLOY

Lance le validator :

```
Agent tool -> validator
"Valide le site complet : build, frontmatter, liens, images, SEO. Si le build passe, deploie sur production."
```

Le validator fait le `npm run build`, et si OK merge `main` sur `production` (declenche le deploy FTP).

### Fin du cycle — LOG

```sql
INSERT INTO agent_runs (agent_name, status, started_at, completed_at, items_processed, metadata)
VALUES ('autopilot', 'cycle_complete', '<cycle_start>', NOW(), <total_items>,
  '{"corrections_applied": <n>, "links_inserted": <n>, "articles_created": <n>, "deployed": <true|false>}'::jsonb);
```

Puis **TERMINE**. Le serveur te relancera automatiquement.

## REGLES DE PRIORISATION

```
CHECK → pct_unchecked, nb_tickets, nb_urgents

SI pct_unchecked >= 30%:
  → fact-check seul → editorial → validator

SINON SI nb_urgents > 0:
  → editorial direct (skip Generate) → validator

SINON SI nb_tickets >= 20:
  → editorial direct (skip Generate) → validator

SINON SI nb_tickets < 10:
  → Generate (4 agents parallele) → editorial → validator

SINON (10-19 tickets, pas d'urgents):
  → editorial → validator
```

## GESTION DES ERREURS

- Si un agent echoue → log l'erreur, continue avec les autres phases
- Si Supabase est down → retente 1 fois, sinon log et continue
- Ne t'arrete PAS sur erreur — log et termine le cycle

## OPTIMISATION DES TOKENS

- Phase CHECK : 1 seule requete SQL, pas de bavardage
- Phase GENERATE : lance les agents en parallele (1 seul message Agent)
- Phase EDIT : 1 seul appel editorial
- Phase VALIDATE : 1 seul appel validator
- ZERO reflexion inutile entre les phases. Juste execute.
- Pas de recapitulatif verbeux. Juste les chiffres.
