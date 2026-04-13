# LAUNCH — GLP1-EU Managed Agent (Option B Hybride)

> Checklist pas-à-pas pour lancer le Managed Agent Anthropic qui orchestre
> les 5 réplicas européens de GLP1 France.
>
> Temps estimé : **45-60 min** la première fois.
> Budget : **$54/mois** (hard cap).

---

## Pré-requis

- [ ] Compte Anthropic avec crédit API (min 10€ pour démarrer)
- [ ] `cloudflared` installé (`winget install cloudflare.cloudflared` ou https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
- [ ] Node 20+ sur le laptop
- [ ] Projet Supabase GLP1 France accessible (clés dans `.env`)
- [ ] `agent-server.mjs` fonctionne en local (pipeline déjà testé au moins une fois)

---

## Étape 1 — Générer un token d'auth pour le bridge

Sur le laptop :

```bash
# génère un token aléatoire (bash/git bash)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie la sortie et ajoute-la dans `.env` :

```
ORCHESTRATOR_TOKEN=<le_token_généré>
```

⚠️ Ce token est la **seule** barrière entre le cloud et ton laptop. Ne le
commit jamais, ne le partage jamais en clair.

---

## Étape 2 — Appliquer la migration Supabase

```bash
# via CLI Supabase (si installé)
supabase db push

# OU manuellement : copier le contenu de
# supabase/migrations/20260412_orchestrator_tables.sql
# et l'exécuter dans le SQL Editor Supabase du projet ywekaivgjzsmdocchvum
```

Vérification :
```sql
SELECT * FROM orchestrator_state;
-- doit retourner 1 row (id='singleton', current_phase='phase_0')
```

---

## Étape 3 — Lancer le bridge en local

Terminal 1 — démarre `agent-server.mjs` :
```bash
node scripts/agent-server.mjs
# écoute sur http://localhost:7854
```

Terminal 2 — démarre le bridge :
```bash
node scripts/orchestrator-bridge.mjs
# écoute sur http://localhost:7855
# tu dois voir "Budget cap: $54 (warn $40, degrade $48)"
```

Test rapide (terminal 3) :
```bash
curl -H "Authorization: Bearer $ORCHESTRATOR_TOKEN" http://localhost:7855/health
# doit retourner { "ok": true, "budget": {...}, "cap_usd": 54 }
```

Si `{"error":"unauthorized"}` → le token n'est pas le bon.
Si `{"error":"upstream_unreachable"}` → agent-server n'est pas lancé.

---

## Étape 4 — Exposer le bridge au cloud Anthropic via Cloudflare Tunnel

Terminal 4 :
```bash
cloudflared tunnel --url http://localhost:7855
```

Tu vois s'afficher une URL publique temporaire du type :
```
https://xxxxx-yyyy-zzzz.trycloudflare.com
```

**Garde cette URL** — c'est elle que le Managed Agent appellera.

Test depuis n'importe où :
```bash
curl -H "Authorization: Bearer <TOKEN>" https://xxxxx.trycloudflare.com/health
```

> 💡 Pour une URL **stable** (recommandé pour la prod), utilise un tunnel
> nommé Cloudflare (gratuit avec un domaine). Quick tunnel = URL qui change
> à chaque redémarrage, OK pour tester.

---

## Étape 5 — Configurer le Managed Agent dans la console Anthropic

1. Aller sur https://console.anthropic.com/
2. **Workspace** → créer une nouvelle workspace `glp1-eu`
3. **Settings → Usage limits** → définir un **hard cap à $54/mois**
4. **Agents** (ou section Managed Agents selon l'interface actuelle) → **Create agent**
5. Remplir :
   - **Name** : `glp1-eu-orchestrator`
   - **Model** : `claude-sonnet-4-6` (avec prompt caching activé si option dispo)
   - **System prompt** : copier-coller le contenu de `.claude/prompts/managed-agent-hybrid-system.md`
   - **Schedule** : `daily 09:00 Europe/Paris` (un seul run/jour au départ)
6. **Variables d'environnement** (secrets de la workspace) :
   - `BRIDGE_URL` = l'URL Cloudflare de l'étape 4
   - `BRIDGE_TOKEN` = `ORCHESTRATOR_TOKEN` de l'étape 1
   - `SUPABASE_URL` = même que `.env`
   - `SUPABASE_ANON_KEY` = même que `.env`
7. **MCP servers** à activer :
   - **HTTP client** (avec auth bearer) pointant sur `$BRIDGE_URL`
   - **Supabase MCP** (ou HTTP REST avec `$SUPABASE_URL` + anon key)
   - **GitHub MCP** scopé à `robinallainmkg/*`
   - **Web Search**
   - **Email** (optionnel — pour envoyer les rapports)

---

## Étape 6 — Smoke test (Phase 0 uniquement)

Dans la console Anthropic, déclenche l'agent manuellement une première fois
(**Run now**).

Attendu :
1. L'agent appelle `GET /health` sur ton bridge → tu vois la ligne dans le terminal du bridge
2. L'agent fait ~15-25 `web_search` pour produire le Market Scoring
3. L'agent écrit dans `countries` (5-7 rows)
4. L'agent écrit dans `orchestrator_reports` (1 row, `iso_week` de cette semaine)
5. L'agent appelle `POST /budget/track` avec un montant ~$2-3
6. L'agent s'arrête en disant "Validation humaine requise sur top 5"

Vérifications :
```sql
-- 1. Les candidats sont là
SELECT code, name, market_score, priority FROM countries ORDER BY market_score DESC;

-- 2. Le rapport est écrit
SELECT iso_week, budget_spent_usd, generated_at FROM orchestrator_reports ORDER BY id DESC LIMIT 1;

-- 3. Le budget cumulé est mis à jour
SELECT budget_cumulative_usd, current_phase FROM orchestrator_state;

-- 4. Les décisions sont loggées
SELECT ts, kind, country_code FROM orchestrator_decisions ORDER BY id DESC LIMIT 10;
```

Si tout est vert → **Phase 0 validée**.

---

## Étape 7 — Valider le top 5 humainement

Lis le rapport. Si tu es d'accord avec le top 5 proposé, execute :

```sql
UPDATE countries SET status = 'validated' WHERE code IN ('DE','UK','IT','ES','NL');
UPDATE orchestrator_state
SET notes = notes || '{"phase0_approved": true, "approved_countries": ["DE","UK","IT","ES","NL"]}'::jsonb,
    current_phase = 'phase_1'
WHERE id = 'singleton';
```

Au prochain run, l'agent passera automatiquement en Phase 1 (bootstrap).

---

## Étape 8 — Monitoring quotidien

### Check quotidien (1 min)
```bash
# Budget et mode
curl -H "Authorization: Bearer $ORCHESTRATOR_TOKEN" https://xxxxx.trycloudflare.com/health
```

Ou directement en SQL :
```sql
SELECT budget_cumulative_usd, current_phase, last_cycle_at
FROM orchestrator_state WHERE id = 'singleton';
```

### Check hebdo (5 min)
- Lire le dernier `orchestrator_reports` row (markdown)
- Résoudre les décisions `human_decisions_pending`
- Vérifier que le bridge tourne toujours (le laptop ne s'est pas mis en veille)

### Alertes auto
L'agent envoie une alerte immédiate (hors cycle) si :
- Cumul budget > $48
- Bridge injoignable > 2 runs consécutifs
- Fact-check bloqué > 24h
- Deploy KO > 2 fois

---

## Garder le bridge allumé H24 (ou pas)

**Option 1 — Laptop ouvert (simple)**
Tu laisses `agent-server.mjs` + `orchestrator-bridge.mjs` + `cloudflared`
tourner sur ton laptop. Quand tu fermes le capot, l'agent reçoit HTTP 502,
rapporte l'incident et attend le prochain run. Ça marche mais les cycles
de nuit ne tournent pas.

**Option 2 — Tâche planifiée Windows**
Tu crées 3 tâches planifiées qui lancent les 3 processus au boot avec
`Start-Process -WindowStyle Hidden`. Si tu laisses le laptop allumé H24,
tu as un vrai H24.

**Option 3 — Raspberry Pi dédié (recommandé si budget le permet ~50€ one-shot)**
Le Pi tourne H24 à 5W, lance `agent-server.mjs` + `bridge` + `cloudflared`,
sync les fichiers du repo via git pull automatique. Ton laptop reste libre.
Ce n'est **pas un VPS** (pas de cloud), c'est du hardware local, donc
conforme à la contrainte CLAUDE.md "pas de VPS".

Démarrage = Option 1. Tu migres vers 2 ou 3 quand le setup est stable.

---

## Kill switch (comment tout arrêter)

### Arrêt propre
1. Console Anthropic → désactiver le schedule de l'agent
2. Terminal : Ctrl+C sur `cloudflared`, `orchestrator-bridge.mjs`, `agent-server.mjs`

### Arrêt d'urgence (si l'agent se comporte mal)
1. Console Anthropic → **Pause agent** (bouton rouge)
2. OU → **Delete API key** (révoque toute la workspace)
3. Le hard cap à $54 te protège de toute façon : l'API coupe automatiquement

### Freeze budget manuel
```sql
UPDATE orchestrator_state
SET budget_cumulative_usd = 99
WHERE id = 'singleton';
```
Le bridge refuse alors toute requête POST (mode frozen).

---

## Troubleshooting

| Symptôme | Cause probable | Fix |
|---|---|---|
| `unauthorized` sur `/health` | Token mismatch | Vérifier `ORCHESTRATOR_TOKEN` dans `.env` et dans la workspace Anthropic |
| `upstream_unreachable` | `agent-server.mjs` down | Relancer terminal 1 |
| `budget_frozen` | Cumul > $48 | Normal en fin de mois. Reset le 1er du mois ou via SQL |
| Cloudflared URL change à chaque reboot | Quick tunnel | Passer à un named tunnel (gratuit avec un domaine) |
| L'agent ne déclenche aucun sous-agent | `notes.phase0_approved` à false | Valider le top 5 en SQL (étape 7) |
| Budget qui monte anormalement vite | Boucle ou WebSearch excessif | `Pause agent` + inspecter `orchestrator_decisions` |

---

## Ordre de lancement (TL;DR)

```
1. Révoquer l'ancienne clé API si elle a fuité
2. .env → ORCHESTRATOR_TOKEN=xxx
3. supabase db push (migration 20260412)
4. Terminal 1: node scripts/agent-server.mjs
5. Terminal 2: node scripts/orchestrator-bridge.mjs
6. Terminal 3: cloudflared tunnel --url http://localhost:7855
7. Copier URL Cloudflare
8. Console Anthropic: créer workspace glp1-eu, usage cap $54
9. Console Anthropic: créer agent avec system prompt + vars BRIDGE_URL/BRIDGE_TOKEN
10. Run now → check Supabase
11. Valider top 5 → laisser tourner
```

---

## Coûts attendus mois 1

| Poste | Coût |
|---|---|
| Phase 0 Market Scoring | ~$2 |
| Phase 1 Bootstrap 5 pays (étalé) | ~$8 |
| Cycles quotidiens x 30 jours | ~$25 |
| Rapports hebdo x 4 | ~$2 |
| Prospection CPA | ~$10 |
| Buffer incidents | ~$5 |
| **Total mois 1** | **~$52** |

Mois 2+ sans bootstrap : **~$40-45**.
