# Déploiement n8n sur VPS Hostinger

Guide pas-à-pas pour déployer l'agent fact-check GLP1 sur le VPS Hostinger Cloud Startup.

## Prérequis

- VPS Hostinger Cloud Startup (accès SSH root)
- Nom de domaine `n8n.glp1-france.fr` avec DNS pointant vers le VPS
- Clés API : Supabase (service_role), Anthropic, SMTP

## Étape 1 — Migration Supabase

Avant d'installer n8n, appliquer la migration pour créer les tables.

### Option A : Via le SQL Editor Supabase (recommandé)

1. Ouvrir le **SQL Editor** dans le dashboard Supabase
2. Copier-coller le contenu de `supabase/migrations/003_factcheck_system.sql`
3. Cliquer sur **Run**

### Option B : Script de vérification

```bash
# Vérifier si les tables existent déjà
node scripts/deployment/apply-supabase-migration.mjs

# Mode dry-run (affiche le SQL sans l'appliquer)
node scripts/deployment/apply-supabase-migration.mjs --dry-run
```

### Vérification

Tables attendues :
- `articles` — copie indexable des articles markdown
- `fact_check_results` — résultats des vérifications
- `agent_logs` — journal d'exécution des agents
- Vue `latest_fact_checks` — derniers résultats par article

## Étape 2 — Installer n8n sur le VPS Hostinger

### Installation automatique (recommandé)

```bash
# Depuis votre machine locale, envoyer et exécuter le script
scp scripts/deployment/setup-vps-hostinger.sh root@VOTRE_IP:/tmp/
ssh root@VOTRE_IP "chmod +x /tmp/setup-vps-hostinger.sh && /tmp/setup-vps-hostinger.sh"
```

Le script installe automatiquement :
- Node.js 20 LTS
- n8n via npm (sans Docker)
- Service systemd (redémarrage automatique)
- Nginx reverse proxy
- SSL Let's Encrypt

### Installation manuelle

```bash
ssh root@VOTRE_IP

# Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# n8n
npm install -g n8n

# Vérifier
n8n --version
```

## Étape 3 — Configurer les variables d'environnement

Le script d'installation crée `/opt/glp1-n8n/.env`. Éditez-le :

```bash
ssh root@VOTRE_IP
nano /opt/glp1-n8n/.env
```

Variables à renseigner :

| Variable | Description |
|----------|-------------|
| `N8N_BASIC_AUTH_PASSWORD` | Mot de passe fort pour l'UI n8n |
| `SUPABASE_URL` | URL de votre projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role Supabase |
| `ANTHROPIC_API_KEY` | Clé API Anthropic (`sk-ant-...`) |
| `SMTP_HOST` | Serveur SMTP pour les alertes |
| `SMTP_PORT` | Port SMTP (587 pour STARTTLS) |
| `SMTP_USER` | Utilisateur SMTP |
| `SMTP_PASSWORD` | Mot de passe SMTP |

Puis redémarrer n8n :

```bash
systemctl restart n8n
```

## Étape 4 — Synchroniser les articles

Depuis le répertoire du projet (sur le VPS ou en local avec .env configuré) :

```bash
# Dry-run d'abord pour vérifier
npm run sync:articles:dry

# Synchronisation réelle
npm run sync:articles
```

Résultat attendu : ~82 articles synchronisés dans la table `articles`.

Vérifier dans Supabase → Table Editor → `articles`.

## Étape 5 — Importer et tester le workflow n8n

1. Ouvrir `https://n8n.glp1-france.fr`
2. Se connecter avec les identifiants configurés
3. **Workflows** → **Import from File** → sélectionner `n8n/workflows/fact-check-workflow.json`

### Configurer les credentials dans n8n

Dans n8n → **Settings** → **Variables** :

| Variable | Valeur |
|----------|--------|
| `SUPABASE_URL` | Votre URL Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service_role |
| `ANTHROPIC_API_KEY` | Votre clé API Anthropic |
| `SMTP_FROM` | `noreply@glp1-france.fr` |
| `NOTIFICATION_EMAIL` | `admin@glp1-france.fr` |

Dans n8n → **Credentials** → **New** → **SMTP** :
- Host : votre serveur SMTP
- Port : 587
- User / Password : vos identifiants SMTP
- SSL/TLS : STARTTLS

### Test manuel

1. **Activer** le workflow (toggle en haut à droite)
2. Cliquer sur **Execute Workflow** (trigger manuel)
3. Vérifier qu'un résultat apparaît dans Supabase → `fact_check_results`
4. Vérifier le dashboard : `https://glp1-france.fr/admin/fact-check`

## Étape 6 — Validation finale

Checklist de validation :

- [ ] Tables Supabase créées (`articles`, `fact_check_results`, `agent_logs`)
- [ ] Vue `latest_fact_checks` fonctionnelle
- [ ] n8n tourne sur le VPS (`systemctl status n8n`)
- [ ] `https://n8n.glp1-france.fr` accessible avec SSL
- [ ] Articles synchronisés (~82 dans la table `articles`)
- [ ] Workflow importé et activé dans n8n
- [ ] Test manuel : 1 article vérifié avec succès
- [ ] Dashboard `/admin/fact-check` affiche les résultats
- [ ] Alertes email fonctionnelles (statut Urgent)
- [ ] Cron hebdomadaire configuré (lundi 8h UTC)

## Gestion du service n8n

```bash
# Statut
systemctl status n8n

# Logs en temps réel
journalctl -u n8n -f

# Redémarrer
systemctl restart n8n

# Arrêter
systemctl stop n8n

# Mettre à jour n8n
npm update -g n8n
systemctl restart n8n
```

## Backup

```bash
# Sauvegarder les données n8n
tar czf /opt/glp1-n8n/backup-$(date +%Y%m%d).tar.gz /root/.n8n

# Restaurer
tar xzf /opt/glp1-n8n/backup-YYYYMMDD.tar.gz -C /
```

## Budget estimé

| Service | Coût mensuel |
|---------|-------------|
| VPS Hostinger Cloud Startup | Inclus dans l'hébergement |
| API Anthropic (~80 articles/mois, ~2K tokens/article) | ~5-10€ |
| **Total additionnel** | **~5-10€/mois** |
