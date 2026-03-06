#!/usr/bin/env bash
# =============================================================================
# GLP1 France — Script d'installation VPS Hostinger
# =============================================================================
# Usage : ssh root@VOTRE_IP "bash -s" < scripts/deployment/setup-vps-hostinger.sh
# Ou     : scp ce fichier sur le VPS puis : chmod +x setup-vps-hostinger.sh && ./setup-vps-hostinger.sh
#
# Ce script installe et configure :
#   1. Node.js 20 LTS
#   2. n8n (npm global, sans Docker)
#   3. Nginx reverse proxy
#   4. SSL Let's Encrypt
#   5. Service systemd pour n8n
# =============================================================================

set -euo pipefail

# --- Variables (à personnaliser si besoin) ---
N8N_DOMAIN="n8n.glp1-france.fr"
N8N_DIR="/opt/glp1-n8n"
ADMIN_EMAIL="admin@glp1-france.fr"

echo "============================================="
echo " GLP1 France — Installation VPS Hostinger"
echo "============================================="
echo ""

# --- 0. Prérequis ---
echo "[0/6] Vérification des prérequis..."
if [ "$(id -u)" -ne 0 ]; then
  echo "❌ Ce script doit être exécuté en tant que root."
  exit 1
fi

# --- 1. Mise à jour système + Node.js ---
echo "[1/6] Installation de Node.js 20 LTS..."
apt-get update -qq
apt-get install -y -qq curl gnupg2 ca-certificates

# NodeSource Node.js 20
if ! command -v node &> /dev/null || ! node --version | grep -q "v20"; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

echo "   Node.js : $(node --version)"
echo "   npm     : $(npm --version)"

# --- 2. Installation n8n ---
echo "[2/6] Installation de n8n via npm..."
npm install -g n8n
echo "   n8n     : $(n8n --version 2>/dev/null || echo 'installé')"

# --- 3. Configuration n8n ---
echo "[3/6] Configuration de n8n..."
mkdir -p "$N8N_DIR"

if [ ! -f "$N8N_DIR/.env" ]; then
  ENCRYPTION_KEY=$(openssl rand -hex 16)
  cat > "$N8N_DIR/.env" << EOF
# n8n — Variables d'environnement
# Généré automatiquement le $(date +%Y-%m-%d)

# Authentification n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=CHANGEZ_MOI_MAINTENANT

# Sécurité
N8N_ENCRYPTION_KEY=${ENCRYPTION_KEY}

# Host
N8N_HOST=${N8N_DOMAIN}
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://${N8N_DOMAIN}/

# Supabase (à remplir)
SUPABASE_URL=https://ywekaivgjzsmdocchvum.supabase.co
SUPABASE_SERVICE_ROLE_KEY=VOTRE_CLE_SERVICE_ROLE

# Anthropic (à remplir)
ANTHROPIC_API_KEY=VOTRE_CLE_ANTHROPIC

# SMTP (à remplir)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
SMTP_FROM=noreply@glp1-france.fr
NOTIFICATION_EMAIL=admin@glp1-france.fr
EOF

  chmod 600 "$N8N_DIR/.env"
  echo "   ⚠️  Fichier .env créé dans $N8N_DIR/.env"
  echo "   ⚠️  IMPORTANT : Éditez ce fichier avec vos vraies clés API !"
  echo "   ⚠️  nano $N8N_DIR/.env"
else
  echo "   Fichier .env existant conservé."
fi

# --- 4. Service systemd ---
echo "[4/6] Configuration du service systemd..."
cat > /etc/systemd/system/n8n.service << 'EOF'
[Unit]
Description=n8n - Workflow Automation (GLP1 Fact-Check)
After=network.target

[Service]
Type=simple
User=root
Environment=N8N_PORT=5678
Environment=N8N_PROTOCOL=https
Environment=GENERIC_TIMEZONE=Europe/Paris
Environment=TZ=Europe/Paris
Environment=EXECUTIONS_DATA_PRUNE=true
Environment=EXECUTIONS_DATA_MAX_AGE=168
Environment=N8N_DIAGNOSTICS_ENABLED=false
EnvironmentFile=/opt/glp1-n8n/.env
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=n8n
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable n8n
systemctl start n8n

echo "   Service n8n démarré et activé au boot."
echo "   Vérification : $(systemctl is-active n8n)"

# --- 5. Nginx reverse proxy ---
echo "[5/6] Configuration de Nginx..."
apt-get install -y -qq nginx certbot python3-certbot-nginx

cat > /etc/nginx/sites-available/n8n << NGINX
upstream n8n_backend {
    server 127.0.0.1:5678;
    keepalive 64;
}

server {
    listen 80;
    server_name ${N8N_DOMAIN};

    client_max_body_size 50M;

    location / {
        proxy_pass http://n8n_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;
        proxy_read_timeout 300s;
        proxy_connect_timeout 10s;
        proxy_send_timeout 300s;
    }

    location /healthz {
        proxy_pass http://n8n_backend/healthz;
        access_log off;
    }
}
NGINX

ln -sf /etc/nginx/sites-available/n8n /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
nginx -t && systemctl reload nginx

echo "   Nginx configuré pour ${N8N_DOMAIN}"

# --- 6. SSL Let's Encrypt ---
echo "[6/6] Obtention du certificat SSL..."
echo "   ⚠️  Assurez-vous que le DNS de ${N8N_DOMAIN} pointe vers ce serveur."
echo ""

read -p "   Le DNS est-il configuré ? Lancer Certbot ? (o/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
  certbot --nginx -d "${N8N_DOMAIN}" --non-interactive --agree-tos -m "${ADMIN_EMAIL}"
  echo "   ✅ SSL activé pour ${N8N_DOMAIN}"
else
  echo "   ⏭️  SSL ignoré. Lancez plus tard :"
  echo "   certbot --nginx -d ${N8N_DOMAIN} --non-interactive --agree-tos -m ${ADMIN_EMAIL}"
fi

# --- Résumé ---
echo ""
echo "============================================="
echo " ✅ Installation terminée !"
echo "============================================="
echo ""
echo " n8n         : http://localhost:5678"
echo " URL publique: https://${N8N_DOMAIN}"
echo " Service     : systemctl status n8n"
echo " Logs        : journalctl -u n8n -f"
echo ""
echo " Prochaines étapes :"
echo " 1. Éditez les clés API : nano ${N8N_DIR}/.env"
echo " 2. Redémarrez n8n     : systemctl restart n8n"
echo " 3. Importez le workflow fact-check dans l'UI n8n"
echo " 4. Configurez les credentials dans n8n"
echo " 5. Lancez un test manuel"
echo ""
