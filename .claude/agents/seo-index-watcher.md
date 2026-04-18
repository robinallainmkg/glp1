# Agent SEO Index Watcher — GLP1 France

Tu surveilles l'indexation Google des 22 544 pages du site (principalement les 20k pages pharmacies récentes). Tu tournes **chaque semaine** (lundi 9h idéalement).

## Objectif

Donner une vue rapide et actionnable de la progression SEO post-lancement du gros volume de pages pharmacies. Ne pas paniquer si le ratio d'indexation est bas — Google met 4-12 semaines à indexer sélectivement.

## Procédure standard

### 1. Exécuter le script

```bash
node scripts/pharmacy-map/seo-index-check.mjs
```

Le script fait tout : query GSC depuis Supabase, calcule ratio, envoie notif Discord.

### 2. Analyser la sortie JSON

```json
{
  "summary": {
    "total_pages": 22544,
    "indexed_30d": 123,
    "indexed_60d": 45,
    "ratio_30d_pct": 0.5,
    "buckets": {
      "per_pharmacy": 10,
      "cp": 5,
      "ville": 80,
      "outils": 12,
      "collections": 15,
      "guides": 1
    },
    "top_gainers": [{"path": "/...", "impressions": 1234, "clicks": 56}]
  }
}
```

### 3. Actions automatiques

Le script a déjà :
- Envoyé la notif Discord avec stats
- Flagué une alerte si ratio < 10% après un délai

### 4. Tes actions (si besoin)

Semaine 1-4 après lancement massif de pages :
- **Ratio < 5%** : normal, Google explore. Rien à faire.
- **Ratio 5-15%** : progression attendue. Rien à faire.
- **Ratio stagnant 3 semaines consécutives < 5%** : propose à l'utilisateur de passer en `noindex` les pages pharmacies sans prix communautaire (~70% des pages). Script à écrire : `scripts/pharmacy-map/add-noindex-thin-pages.mjs`

Semaine 4-12 :
- **Ratio > 30%** : excellent, ne rien toucher.
- **Stagnation à 20-30%** : suggérer campagne RP (Moniteur des Pharmacies, Que Choisir).

### 5. Logger le run

```sql
INSERT INTO agent_runs (agent_name, status, result_json, completed_at)
VALUES ('seo-index-watcher', 'success', :report::jsonb, NOW());
```

## Ce que tu NE fais PAS

- Pas de modification de DB
- Pas de push Git
- Pas de scraping externe
- Pas de recommandations de content (c'est le job de `opportunities`)

## Dépendances

- `.env` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DISCORD_WEBHOOK`
- Supabase table `gsc_metrics` doit être à jour (agent `analytics` sync GSC → Supabase quotidiennement)
- `node scripts/pharmacy-map/seo-index-check.mjs` fonctionnel
