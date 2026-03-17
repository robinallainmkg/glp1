# Agent Autopilot — Un cycle du pipeline GLP-1

## COMMENCE IMMEDIATEMENT

NE CHERCHE PAS A COMPRENDRE LE CONTEXTE. N'explore PAS le repo. N'utilise PAS de sous-agent pour "trouver la config". Tu as TOUT ce qu'il te faut ici. Passe DIRECTEMENT a la Phase 1 CHECK ci-dessous.

## MISSION

Execute **UN cycle complet** du pipeline. Le serveur te relance automatiquement apres. Fais un cycle, termine proprement.

## REGLES

1. **UN SEUL CYCLE** — 4 phases puis termine.
2. **AUTONOME** — JAMAIS de question. JAMAIS AskUserQuestion.
3. **HTTP LAUNCH** — Lance les sous-agents via `curl http://localhost:7854/launch` (PAS via Agent tool). Cela les rend visibles dans l'arena admin.
4. **ZERO EXPLORATION** — Ne lis PAS d'autres fichiers que ceux necessaires. Pas de Glob, pas de find, pas de git log au demarrage.
5. **PAS DE FICHIERS ADMIN** — Uniquement `src/content/`.

## Connexion Supabase

Utilise `execute_sql` MCP pour les requetes SQL. Les credentials sont deja dans l'environnement.

## COMMENT LANCER UN AGENT (HTTP)

Pour lancer un agent visible dans l'arena :
```bash
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"<nom>"}'
```

Pour verifier le statut des agents en cours :
```bash
curl -s http://localhost:7854/status
```

Le champ `running` dans la reponse contient les agents actifs. Quand un agent termine, il disparait de `running`.

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

Si generation necessaire, lance les 4 agents EN PARALLELE via HTTP (chaque curl dans un seul Bash) :

```bash
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"fact-check"}' &
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"seo-audit"}' &
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"opportunities"}' &
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"internal-links"}' &
wait
```

Puis **attends** que tous les agents terminent en polling :
```bash
while true; do
  STATUS=$(curl -s http://localhost:7854/status)
  RUNNING=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); r=[k for k in d.get('running',{}) if k != 'autopilot']; print(len(r))")
  if [ "$RUNNING" = "0" ]; then break; fi
  sleep 15
done
```

### Phase 3 — EDIT (consommer le travail)

Lance UN SEUL agent editorial via HTTP (pas de multi-instance pour eviter les conflits git) :

```bash
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"editorial"}'
```

Puis attends qu'il termine :
```bash
while true; do
  STATUS=$(curl -s http://localhost:7854/status)
  RUNNING=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('running',{}); print('1' if 'editorial' in r else '0')")
  if [ "$RUNNING" = "0" ]; then break; fi
  sleep 15
done
```

L'editorial commit localement (PAS de push). Le validator se charge du push apres build check.

### Phase 4 — VALIDATE + DEPLOY

Lance le validator via HTTP :

```bash
curl -s -X POST http://localhost:7854/launch -H 'Content-Type: application/json' -d '{"agent":"validator"}'
```

Puis attends qu'il termine :
```bash
while true; do
  STATUS=$(curl -s http://localhost:7854/status)
  RUNNING=$(echo "$STATUS" | python3 -c "import sys,json; d=json.load(sys.stdin); r=d.get('running',{}); print('1' if 'validator' in r else '0')")
  if [ "$RUNNING" = "0" ]; then break; fi
  sleep 15
done
```

Le validator fait le `npm run build`, et si OK push `main` (declenche le deploy FTP).

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
- Phase GENERATE : lance les agents via HTTP en parallele (1 seul Bash)
- Phase EDIT : 1 seul appel HTTP editorial
- Phase VALIDATE : 1 seul appel HTTP validator
- ZERO reflexion inutile entre les phases. Juste execute.
- Pas de recapitulatif verbeux. Juste les chiffres.
