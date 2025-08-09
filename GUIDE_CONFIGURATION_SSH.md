# 🔐 Guide de Configuration SSH pour Hostinger

## Vue d'ensemble

Ce guide vous accompagne dans la configuration sécurisée de l'accès SSH à votre hébergement Hostinger pour automatiser les déploiements de votre site GLP-1 France.

## 📋 Prérequis

- Compte Hostinger avec accès SSH activé
- Terminal/PowerShell avec OpenSSH installé
- Clés SSH générées (nous allons les créer)

## 🔑 Étape 1 : Génération des Clés SSH

### Sur Windows (PowerShell)
```powershell
# Générer une nouvelle paire de clés SSH
ssh-keygen -t ed25519 -C "glp1-deployment@votre-email.com" -f ~/.ssh/hostinger_glp1

# Ou avec RSA si ed25519 n'est pas supporté
ssh-keygen -t rsa -b 4096 -C "glp1-deployment@votre-email.com" -f ~/.ssh/hostinger_glp1
```

### Sur Linux/macOS
```bash
# Générer une nouvelle paire de clés SSH
ssh-keygen -t ed25519 -C "glp1-deployment@votre-email.com" -f ~/.ssh/hostinger_glp1

# Ou avec RSA si ed25519 n'est pas supporté
ssh-keygen -t rsa -b 4096 -C "glp1-deployment@votre-email.com" -f ~/.ssh/hostinger_glp1
```

### Options Recommandées
- **Mot de passe** : Laissez vide pour l'automatisation (ou utilisez un mot de passe fort)
- **Nom du fichier** : `hostinger_glp1` pour identifier facilement
- **Commentaire** : Votre email pour identification

## 🔧 Étape 2 : Configuration SSH Client

Créez ou modifiez le fichier `~/.ssh/config` :

### Sur Windows
```powershell
# Ouvrir le fichier de configuration SSH
notepad ~/.ssh/config
```

### Sur Linux/macOS
```bash
# Ouvrir le fichier de configuration SSH
nano ~/.ssh/config
```

### Contenu du fichier ~/.ssh/config
```
# Configuration pour Hostinger GLP-1
Host hostinger-glp1
    HostName 147.79.98.140
    Port 65002
    User u403023291
    IdentityFile ~/.ssh/hostinger_glp1
    IdentitiesOnly yes
    ServerAliveInterval 60
    ServerAliveCountMax 3
    StrictHostKeyChecking accept-new
    UserKnownHostsFile ~/.ssh/known_hosts

# Alias court pour faciliter l'usage
Host glp1
    HostName 147.79.98.140
    Port 65002
    User u403023291
    IdentityFile ~/.ssh/hostinger_glp1
    IdentitiesOnly yes
```

## 📤 Étape 3 : Installation de la Clé Publique sur Hostinger

### Méthode 1 : Via le Panel Hostinger (Recommandée)
1. Connectez-vous à votre panel Hostinger
2. Allez dans **Avancé** → **SSH Access**
3. Cliquez sur **Manage SSH Keys**
4. Cliquez sur **Add New SSH Key**
5. Copiez le contenu de votre clé publique :

```bash
# Afficher la clé publique (Windows PowerShell)
Get-Content ~/.ssh/hostinger_glp1.pub

# Afficher la clé publique (Linux/macOS)
cat ~/.ssh/hostinger_glp1.pub
```

6. Collez la clé dans le champ prévu
7. Donnez-lui un nom descriptif : "GLP1-Deployment"
8. Activez la clé

### Méthode 2 : Via SSH (si accès par mot de passe disponible)
```bash
# Copier la clé publique vers le serveur
ssh-copy-id -i ~/.ssh/hostinger_glp1.pub -p 65002 u403023291@147.79.98.140
```

### Méthode 3 : Manuelle
```bash
# Afficher la clé publique
cat ~/.ssh/hostinger_glp1.pub

# Se connecter au serveur et l'ajouter manuellement
ssh -p 65002 u403023291@147.79.98.140
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "VOTRE_CLE_PUBLIQUE_ICI" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

## ✅ Étape 4 : Test de la Connexion

### Test basique
```bash
# Test avec l'alias configuré
ssh glp1 "echo 'Connexion SSH réussie!'"

# Test avec la configuration complète
ssh -p 65002 u403023291@147.79.98.140 "echo 'Connexion SSH réussie!'"
```

### Test des permissions du répertoire web
```bash
# Vérifier l'accès au répertoire de destination
ssh glp1 "ls -la /home/u403023291/domains/glp1-france.fr/public_html/"
```

## 🛠️ Étape 5 : Configuration de l'Environnement de Déploiement

Créez le fichier `.env.production` dans votre projet :

```bash
# Copier l'exemple et l'adapter
cp .env.production.example .env.production
```

Éditez `.env.production` avec vos paramètres :
```env
SSH_USER=u403023291
SSH_HOST=147.79.98.140
SSH_PORT=65002
REMOTE_PATH=/home/u403023291/domains/glp1-france.fr/public_html
SITE_URL=https://glp1-france.fr
```

## 🔒 Sécurité Avancée

### Permissions des Fichiers SSH
```bash
# Windows (PowerShell en tant qu'administrateur)
icacls ~/.ssh/hostinger_glp1 /inheritance:r /grant:r "$env:USERNAME:F"

# Linux/macOS
chmod 600 ~/.ssh/hostinger_glp1
chmod 644 ~/.ssh/hostinger_glp1.pub
chmod 600 ~/.ssh/config
```

### Configuration SSH Durcie
Ajoutez ces options à votre `~/.ssh/config` pour une sécurité renforcée :

```
Host hostinger-glp1
    # ... configuration précédente ...
    
    # Sécurité renforcée
    PasswordAuthentication no
    PubkeyAuthentication yes
    AuthenticationMethods publickey
    Protocol 2
    Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
    MACs hmac-sha2-256-etm@openssh.com,hmac-sha2-512-etm@openssh.com
    KexAlgorithms curve25519-sha256@libssh.org,diffie-hellman-group16-sha512
```

## 🧪 Tests et Validation

### Script de Test Automatique
Créez un script `test-ssh.sh` :
```bash
#!/bin/bash

echo "🔧 Test de configuration SSH pour Hostinger..."

# Test de connexion
if ssh glp1 "echo 'SSH OK'" 2>/dev/null; then
    echo "✅ Connexion SSH réussie"
else
    echo "❌ Échec de connexion SSH"
    exit 1
fi

# Test des permissions
if ssh glp1 "test -w /home/u403023291/domains/glp1-france.fr/public_html/"; then
    echo "✅ Permissions d'écriture OK"
else
    echo "❌ Permissions d'écriture manquantes"
    exit 1
fi

# Test rsync
if rsync --dry-run -avz -e "ssh -p 65002" ./README.md u403023291@147.79.98.140:/tmp/ 2>/dev/null; then
    echo "✅ rsync fonctionnel"
else
    echo "❌ Problème avec rsync"
    exit 1
fi

echo "🎉 Configuration SSH validée!"
```

## 🚀 Premier Déploiement

Une fois la configuration terminée :

```bash
# Test dry-run pour vérifier
npm run deploy:dry

# Premier déploiement réel
npm run deploy

# Vérification post-déploiement
npm run deploy:check
```

## 🔧 Dépannage

### Problèmes Courants

#### 1. "Permission denied (publickey)"
```bash
# Vérifier les permissions
ls -la ~/.ssh/
ssh-add ~/.ssh/hostinger_glp1

# Tester la connexion en verbose
ssh -v glp1
```

#### 2. "Host key verification failed"
```bash
# Supprimer l'ancienne empreinte
ssh-keygen -R [147.79.98.140]:65002

# Ou accepter la nouvelle
ssh -o StrictHostKeyChecking=no glp1
```

#### 3. "Connection timed out"
```bash
# Vérifier le port et l'IP
telnet 147.79.98.140 65002

# Vérifier la configuration réseau/firewall
```

#### 4. "Too many authentication failures"
```bash
# Utiliser seulement la bonne clé
ssh -o IdentitiesOnly=yes -i ~/.ssh/hostinger_glp1 -p 65002 u403023291@147.79.98.140
```

### Diagnostic Avancé
```bash
# Mode debug SSH
ssh -vvv glp1

# Test de connexion avec timeout
timeout 10 ssh glp1 "echo test"

# Vérifier la configuration SSH
ssh -F ~/.ssh/config -T glp1
```

## 📞 Support

### Logs et Débogage
- **Logs SSH client** : `ssh -v` pour mode verbose
- **Logs déploiement** : Fichiers `deploy_*.log` générés
- **Panel Hostinger** : Section SSH Access pour les logs serveur

### Contacts Utiles
- **Support Hostinger** : Pour les problèmes côté serveur
- **Documentation SSH** : `man ssh_config` pour les options
- **Communauté** : Forums Hostinger pour l'aide

## ✅ Checklist de Validation

- [ ] Clés SSH générées et sécurisées
- [ ] Configuration `~/.ssh/config` créée
- [ ] Clé publique installée sur Hostinger
- [ ] Test de connexion SSH réussi
- [ ] Permissions du répertoire web vérifiées
- [ ] Fichier `.env.production` configuré
- [ ] Test dry-run de déploiement réussi
- [ ] Premier déploiement effectué
- [ ] Vérification post-déploiement OK

---

**🎉 Félicitations !** Votre configuration SSH est maintenant prête pour des déploiements automatisés sécurisés.
