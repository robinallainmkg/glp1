# Déploiement n8n en local (npm)

Guide pas-à-pas pour lancer l'agent fact-check GLP1 en local via n8n installé avec npm.

## Prérequis

- Node.js 18+ installé
- Les clés API : Supabase + Anthropic
- (Optionnel) Un serveur SMTP pour les alertes email

## 1. Installer n8n

```bash
npm install -g n8n
```

Vérifier :

```bash
n8n --version
```

## 2. Lancer n8n

```bash
n8n start
```

Ouvrir **http://localhost:5678** dans votre navigateur.

Au premier lancement, n8n vous demandera de créer un compte admin.

> **Astuce** : pour lancer en arrière-plan, utilisez `n8n start &` ou un outil comme `pm2` :
> ```bash
> npm install -g pm2
> pm2 start n8n -- start
> pm2 save
> ```

## 3. Importer le workflow

1. Ouvrir http://localhost:5678
2. Aller dans **Workflows** → **Import from File**
3. Sélectionner `n8n/workflows/fact-check-workflow.json`

## 4. Configurer les variables n8n

Dans n8n → **Settings** → **Variables** :

| Variable | Valeur | Où la trouver |
|----------|--------|---------------|
| `SUPABASE_URL` | `https://ywekaivgjzsmdocchvum.supabase.co` | Dashboard Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` | Dashboard Supabase → Settings → API → service_role |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | console.anthropic.com → API Keys |
| `SMTP_FROM` | `noreply@glp1-france.fr` | Votre config email |
| `NOTIFICATION_EMAIL` | `admin@glp1-france.fr` | Votre email admin |

### Credential SMTP (optionnel — pour les alertes)

Dans n8n → **Credentials** → **New** → **SMTP** :
- Host : votre serveur SMTP (ex: `smtp.gmail.com`)
- Port : 587
- User : votre email
- Password : votre mot de passe d'application
- SSL/TLS : STARTTLS

> **Sans SMTP** : le workflow fonctionnera quand même, seules les alertes email urgentes ne partiront pas.

## 5. Activer le workflow

1. Ouvrir le workflow importé
2. Cliquer sur le **toggle** en haut à droite pour l'activer
3. Le cron est configuré pour exécuter le fact-check tous les lundis à 8h

## 6. Test initial

```bash
# D'abord, synchroniser les articles vers Supabase
node scripts/sync-articles-to-supabase.mjs
```

Puis dans n8n :
1. Cliquer sur **Execute Workflow** (trigger manuel)
2. Vérifier les résultats dans Supabase → table `fact_check_results`
3. Vérifier le dashboard : http://localhost:4321/admin/fact-check (si le site tourne en dev)

## 7. Commandes utiles

```bash
# Lancer n8n
n8n start

# Lancer en arrière-plan avec pm2
pm2 start n8n -- start

# Voir les logs pm2
pm2 logs n8n

# Arrêter
pm2 stop n8n

# Exporter un workflow (backup)
n8n export:workflow --id=1 --output=backup.json

# Mettre à jour n8n
npm update -g n8n
```

## Budget

| Service | Coût |
|---------|------|
| n8n local (npm) | **0€** |
| API Anthropic (~80 articles/mois) | ~5-10€/mois |
| Supabase (free tier) | 0€ |
| **Total** | **~5-10€/mois** |
