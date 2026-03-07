# Agent Fact-Check — GitHub Actions

## Architecture

```
GitHub Actions (cron lundi 7h UTC)
  ├── npm run sync:articles     → Sync markdown → Supabase (table articles)
  ├── fact-check-runner.mjs     → Claude API + web search sur chaque article
  │   ├── Écriture résultats    → Supabase (table fact_check_results)
  │   ├── Logs d'exécution      → Supabase (table agent_logs)
  │   └── Alerte email          → SMTP si articles urgents
  └── Dashboard Astro           → /admin/fact-check (lecture Supabase)
```

## Fichiers clés

| Fichier | Rôle |
|---------|------|
| `.github/workflows/fact-check.yml` | Workflow GitHub Actions (cron + manuel) |
| `scripts/fact-check-runner.mjs` | Logique fact-check : Claude API → Supabase |
| `scripts/sync-articles-to-supabase.mjs` | Sync des articles markdown vers Supabase |
| `n8n/prompts/fact-check-system-prompt.md` | System prompt pour Claude |
| `src/pages/admin/fact-check.astro` | Dashboard de visualisation |
| `supabase/migrations/003_factcheck_system.sql` | Schéma des tables |

## Secrets GitHub requis

Configurer dans **Settings → Secrets and variables → Actions** :

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role Supabase |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (Claude) |
| `SMTP_HOST` | Serveur SMTP (optionnel, pour alertes) |
| `SMTP_PORT` | Port SMTP — 587 ou 465 (optionnel) |
| `SMTP_USER` | Utilisateur SMTP (optionnel) |
| `SMTP_PASS` | Mot de passe SMTP (optionnel) |
| `ALERT_EMAIL_TO` | Email destinataire des alertes (optionnel) |

## Utilisation

### Exécution automatique
Le workflow tourne chaque **lundi à 8h** (heure de Paris).

### Exécution manuelle
1. Aller sur **Actions** → **Agent Fact-Check GLP1**
2. Cliquer **Run workflow**
3. Options :
   - `limit` : nombre max d'articles (0 = tous)
   - `article_id` : UUID d'un article spécifique

### En local (développement)
```bash
# Toutes les variables doivent être dans .env
node scripts/fact-check-runner.mjs --limit 3
node scripts/fact-check-runner.mjs --article-id <UUID>
```

## Coût estimé

- Claude claude-sonnet-4-20250514 : ~$3/1M input tokens, ~$15/1M output tokens
- 82 articles × ~2000 tokens input + web search ≈ **< $5/mois** pour un run hebdomadaire
- GitHub Actions : **gratuit** (repos publics) ou 2000 min/mois (repos privés)

## Flux de données

1. `sync:articles` lit les fichiers `src/content/**/*.md` et les upsert dans `articles`
2. `fact-check-runner.mjs` lit les articles depuis Supabase (priorité : jamais vérifiés en premier)
3. Pour chaque article, appel Claude API avec web search activé
4. Claude retourne un JSON : `{ score_fiabilite, statut, points[] }`
5. Résultat inséré dans `fact_check_results`, log dans `agent_logs`
6. Si articles urgents détectés → email d'alerte
7. Le dashboard `/admin/fact-check` lit `fact_check_results` et affiche les 3 vues
