# Déploiement n8n en local (Docker)

Guide pas-à-pas pour lancer l'agent fact-check GLP1 en local avec Docker.

## Prérequis

- Docker Desktop installé ([docker.com/get-started](https://www.docker.com/get-started/))
- Les clés API : Supabase + Anthropic
- (Optionnel) Un serveur SMTP pour les alertes email

## 1. Configuration

```bash
# Depuis la racine du projet
cd n8n

# Créer le fichier .env à partir du template
cp .env.example .env
```

Éditer `n8n/.env` avec vos valeurs :

```env
# Accès n8n (interface web locale)
N8N_USER=admin
N8N_PASSWORD=admin123

# Clé de chiffrement (générer avec : openssl rand -hex 16)
N8N_ENCRYPTION_KEY=votre-cle-aleatoire-ici
```

## 2. Lancer n8n

```bash
cd n8n
docker compose up -d
```

Vérifier que ça tourne :

```bash
docker compose ps
docker compose logs -f n8n
```

Ouvrir **http://localhost:5678** dans votre navigateur.

## 3. Importer le workflow

1. Ouvrir http://localhost:5678
2. Se connecter avec les identifiants configurés dans `.env`
3. Aller dans **Workflows** → **Import from File**
4. Sélectionner `n8n/workflows/fact-check-workflow.json`

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
cd ..
node scripts/sync-articles-to-supabase.mjs
```

Puis dans n8n :
1. Cliquer sur **Execute Workflow** (trigger manuel)
2. Vérifier les résultats dans Supabase → table `fact_check_results`
3. Vérifier le dashboard : http://localhost:4321/admin/fact-check (si le site tourne en dev)

## 7. Commandes utiles

```bash
# Voir les logs en temps réel
docker compose logs -f n8n

# Arrêter n8n
docker compose down

# Redémarrer
docker compose restart

# Mettre à jour n8n
docker compose pull && docker compose up -d

# Supprimer tout (données incluses)
docker compose down -v
```

## Budget

| Service | Coût |
|---------|------|
| n8n local (Docker) | **0€** |
| API Anthropic (~80 articles/mois) | ~5-10€/mois |
| Supabase (free tier) | 0€ |
| **Total** | **~5-10€/mois** |
