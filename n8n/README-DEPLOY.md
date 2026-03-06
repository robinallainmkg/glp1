# Déploiement n8n sur VPS Hetzner

Guide pas-à-pas pour déployer l'agent fact-check GLP1 sur un VPS Hetzner.

## Prérequis

- VPS Hetzner (CX22 minimum — 2 vCPU, 4 Go RAM, ~4€/mois)
- Nom de domaine configuré (ex: `n8n.glp1-france.fr`)
- Accès SSH root

## 1. Installation Docker

```bash
# Connexion au VPS
ssh root@VOTRE_IP_HETZNER

# Installer Docker
curl -fsSL https://get.docker.com | sh

# Installer Docker Compose
apt install -y docker-compose-plugin

# Vérifier
docker --version
docker compose version
```

## 2. Préparation du serveur

```bash
# Créer le répertoire de travail
mkdir -p /opt/glp1-n8n
cd /opt/glp1-n8n

# Copier les fichiers depuis le dépôt
# Option A : git clone
git clone https://github.com/VOTRE_REPO/glp1.git --sparse --filter=blob:none
cd glp1 && git sparse-checkout set n8n && cd ..
cp -r glp1/n8n/* .

# Option B : copier manuellement
scp -r n8n/* root@VOTRE_IP:/opt/glp1-n8n/
```

## 3. Configuration

```bash
# Créer le fichier .env
cat > .env << 'EOF'
N8N_USER=admin
N8N_PASSWORD=VotreMotDePasseFort123!
N8N_ENCRYPTION_KEY=$(openssl rand -hex 16)
N8N_HOST=n8n.glp1-france.fr
EOF

# Générer la clé de chiffrement
sed -i "s/\$(openssl rand -hex 16)/$(openssl rand -hex 16)/" .env
```

## 4. Reverse Proxy Nginx + SSL

```bash
# Installer Nginx et Certbot
apt install -y nginx certbot python3-certbot-nginx

# Créer la config Nginx
cat > /etc/nginx/sites-available/n8n << 'EOF'
server {
    listen 80;
    server_name n8n.glp1-france.fr;

    location / {
        proxy_pass http://localhost:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
    }
}
EOF

# Activer le site
ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Obtenir le certificat SSL
certbot --nginx -d n8n.glp1-france.fr --non-interactive --agree-tos -m admin@glp1-france.fr
```

## 5. Lancer n8n

```bash
cd /opt/glp1-n8n
docker compose up -d

# Vérifier que ça tourne
docker compose ps
docker compose logs -f n8n
```

Accéder à `https://n8n.glp1-france.fr` avec les identifiants configurés.

## 6. Importer le workflow

1. Ouvrir n8n dans le navigateur
2. Aller dans **Workflows** → **Import from File**
3. Sélectionner `workflows/fact-check-workflow.json`
4. Configurer les **Credentials** :

### Variables d'environnement n8n à configurer

Dans n8n → **Settings** → **Variables** :

| Variable | Valeur |
|----------|--------|
| `SUPABASE_URL` | `https://ywekaivgjzsmdocchvum.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Votre clé service_role Supabase |
| `ANTHROPIC_API_KEY` | Votre clé API Anthropic (`sk-ant-...`) |
| `SMTP_FROM` | `noreply@glp1-france.fr` |
| `NOTIFICATION_EMAIL` | `admin@glp1-france.fr` |

### Credential SMTP

Dans n8n → **Credentials** → **New** → **SMTP** :
- Host : votre serveur SMTP
- Port : 587
- User : votre email
- Password : votre mot de passe
- SSL/TLS : STARTTLS

5. **Activer** le workflow (toggle en haut à droite)

## 7. Test initial

1. Synchroniser d'abord les articles : `node scripts/sync-articles-to-supabase.mjs`
2. Dans n8n, cliquer sur **Execute Workflow** (trigger manuel)
3. Vérifier les résultats dans Supabase → table `fact_check_results`
4. Vérifier le dashboard : `https://glp1-france.fr/admin/fact-check`

## 8. Maintenance

```bash
# Voir les logs
docker compose logs -f n8n

# Mettre à jour n8n
docker compose pull
docker compose up -d

# Backup des données
docker compose exec n8n tar czf /tmp/n8n-backup.tar.gz /home/node/.n8n
docker cp glp1-n8n:/tmp/n8n-backup.tar.gz ./backups/

# Redémarrer
docker compose restart
```

## Budget estimé

| Service | Coût mensuel |
|---------|-------------|
| VPS Hetzner CX22 | ~4€ |
| API Anthropic (~80 articles/mois, ~2K tokens/article) | ~5-10€ |
| Domaine (annuel proratisé) | ~1€ |
| **Total** | **~10-15€/mois** |

Bien dans le budget cible de < 50€/mois.
