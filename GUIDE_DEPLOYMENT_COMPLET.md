# 🚀 Guide de Déploiement Complet - GLP-1 France

## Vue d'ensemble

Ce guide documente le système de déploiement automatisé pour l'application GLP-1 France vers Hostinger via SSH. Le système est conçu pour fonctionner sur Windows, Mac et Linux.

## 📋 Prérequis

### Généraux
- **Node.js** 18+ installé
- **Git** installé 
- **Accès SSH** au serveur Hostinger
- **Clé SSH ED25519** configurée

### Par Plateforme

#### Windows 10/11
- **Git Bash** (inclus avec Git)
- **PowerShell 5.1+** (intégré)
- **Terminal Windows** recommandé

#### macOS
- **Terminal** (intégré)
- **Homebrew** recommandé pour les outils
- **SSH client** (intégré)

#### Linux (Ubuntu/Debian)
- **Bash shell** (intégré)
- **OpenSSH client** (généralement intégré)
- **Build tools** : `sudo apt install build-essential`

## 🔐 Configuration SSH

### 1. Génération de la clé SSH (toutes plateformes)

```bash
# Générer une clé ED25519
ssh-keygen -t ed25519 -f ~/.ssh/glp1_ed25519 -C "glp1-france@hostinger"

# Afficher la clé publique
cat ~/.ssh/glp1_ed25519.pub
```

### 2. Configuration sur Hostinger

1. **Connexion au panel Hostinger**
2. **Aller dans "SSH Access"**
3. **Coller la clé publique** dans le champ "Public Keys"
4. **Sauvegarder**

### 3. Test de connexion

```bash
# Test de connexion SSH
ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140
```

## 🛠️ Configuration du Projet

### 1. Installation des dépendances

```bash
cd glp1-main
npm install
```

### 2. Variables d'environnement

Créer un fichier `.env.local` :

```env
# Hostinger SSH Config
SSH_HOST=147.79.98.140
SSH_PORT=65002
SSH_USER=u403023291
SSH_KEY_PATH=~/.ssh/glp1_ed25519
DEPLOY_PATH=/home/u403023291/domains/glp1-france.fr/public_html
```

### 3. Scripts de déploiement configurés

Le projet inclut des scripts NPM cross-platform :

```json
{
  "scripts": {
    "build": "astro build",
    "deploy": "deploy.bat",
    "deploy:dry": "deploy-dry.bat", 
    "deploy:show-key": "powershell -ExecutionPolicy Bypass -File show-key.ps1"
  }
}
```

## 🚀 Processus de Déploiement

### Windows

#### 1. Déploiement de test (dry-run)
```powershell
npm run deploy:dry
```

#### 2. Déploiement réel
```powershell
npm run deploy
```

#### 3. Affichage de la clé SSH
```powershell
npm run deploy:show-key
```

### macOS/Linux

#### 1. Créer les scripts de déploiement Unix

Créer `deploy.sh` :
```bash
#!/bin/bash
echo "🚀 Déploiement GLP-1 France"
echo "========================"

# Test de connexion
echo "Test de connexion SSH..."
if ssh -i ~/.ssh/glp1_ed25519 -p 65002 -o ConnectTimeout=10 u403023291@147.79.98.140 exit; then
    echo "✅ Connexion SSH réussie"
else
    echo "❌ Erreur de connexion SSH"
    exit 1
fi

# Build du projet
echo "Build en cours..."
npm run build

# Déploiement via SCP
echo "Déploiement en cours..."
cd dist
scp -P 65002 -i ~/.ssh/glp1_ed25519 -r * u403023291@147.79.98.140:/home/u403023291/domains/glp1-france.fr/public_html/

echo "✅ DÉPLOIEMENT TERMINÉ AVEC SUCCÈS"
echo "Site: https://glp1-france.fr"
```

Créer `deploy-dry.sh` :
```bash
#!/bin/bash
echo "🧪 Test de déploiement GLP-1 France" 
echo "========================"

# Test de connexion SSH uniquement
echo "Test de connexion SSH..."
if ssh -i ~/.ssh/glp1_ed25519 -p 65002 -o ConnectTimeout=10 u403023291@147.79.98.140 exit; then
    echo "✅ Connexion SSH réussie"
    
    # Compter les fichiers à déployer
    npm run build
    cd dist
    file_count=$(find . -type f | wc -l)
    total_size=$(du -sh . | cut -f1)
    
    echo "📁 Fichiers à déployer: $file_count"
    echo "📦 Taille totale: $total_size"
    echo "🎯 Destination: /home/u403023291/domains/glp1-france.fr/public_html/"
else
    echo "❌ Erreur de connexion SSH"
    exit 1
fi
```

#### 2. Rendre les scripts exécutables
```bash
chmod +x deploy.sh deploy-dry.sh
```

#### 3. Modifier package.json pour Unix
```json
{
  "scripts": {
    "deploy": "./deploy.sh",
    "deploy:dry": "./deploy-dry.sh",
    "deploy:show-key": "cat ~/.ssh/glp1_ed25519.pub"
  }
}
```

## 🔄 Workflow Git Recommandé

### 1. Développement local
```bash
# Créer une branche feature
git checkout -b feature/nouvelle-fonctionnalite

# Développer et tester
npm run dev

# Commit des changements
git add .
git commit -m "feat: nouvelle fonctionnalité"
```

### 2. Intégration
```bash
# Merge vers main
git checkout main
git merge feature/nouvelle-fonctionnalite

# Test de build
npm run build

# Test de déploiement
npm run deploy:dry
```

### 3. Déploiement en production
```bash
# Déploiement réel
npm run deploy

# Tag de version
git tag v1.0.1
git push origin v1.0.1
```

## 🐛 Troubleshooting

### Problèmes SSH Courants

#### 1. Permission denied (publickey)
**Solution :**
```bash
# Vérifier les permissions de la clé
chmod 600 ~/.ssh/glp1_ed25519
chmod 644 ~/.ssh/glp1_ed25519.pub

# Vérifier la configuration SSH
ssh -i ~/.ssh/glp1_ed25519 -p 65002 -v u403023291@147.79.98.140
```

#### 2. Host key verification failed
**Solution :**
```bash
# Ajouter l'host aux known_hosts
ssh-keyscan -p 65002 147.79.98.140 >> ~/.ssh/known_hosts
```

#### 3. Connection timeout
**Solutions :**
- Vérifier la connexion internet
- Tester avec un autre réseau
- Contacter le support Hostinger

### Problèmes de Build

#### 1. Out of memory
**Solution :**
```bash
# Augmenter la mémoire Node.js
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

#### 2. Permissions Windows
**Solution :**
```powershell
# Exécuter en tant qu'administrateur
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Problèmes de Déploiement

#### 1. Fichiers non transférés
**Vérifications :**
- Espace disque sur Hostinger
- Permissions du répertoire de destination
- Limite de fichiers

#### 2. Site non accessible après déploiement
**Solutions :**
- Vérifier le DNS (peut prendre 24h)
- Vider le cache du navigateur
- Tester avec différents navigateurs

## 📊 Monitoring et Maintenance

### 1. Vérification automatique
```bash
# Script de vérification de santé
curl -s -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s" https://glp1-france.fr
```

### 2. Logs de déploiement
```bash
# Consulter les logs Hostinger
ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140 "tail -f /home/u403023291/logs/access.log"
```

### 3. Backup automatique
```bash
# Script de sauvegarde avant déploiement
ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140 "tar -czf backup-$(date +%Y%m%d).tar.gz /home/u403023291/domains/glp1-france.fr/public_html/"
```

## 🔒 Sécurité

### 1. Gestion des clés SSH
- **Ne jamais commiter** les clés privées
- **Rotation régulière** des clés (tous les 6 mois)
- **Utilisation de passphrases** pour les clés

### 2. Variables d'environnement
- **Utiliser .env.local** pour les secrets
- **Ajouter .env.local** au .gitignore
- **Chiffrer les secrets** en production

### 3. Permissions
- **Principe du moindre privilège**
- **Accès SSH limité** au minimum nécessaire
- **Monitoring des connexions**

## 📈 Optimisations

### 1. Déploiement incrémental
```bash
# Utiliser rsync pour les déploiements incrémentaux
rsync -avz --delete -e "ssh -i ~/.ssh/glp1_ed25519 -p 65002" dist/ u403023291@147.79.98.140:/home/u403023291/domains/glp1-france.fr/public_html/
```

### 2. Compression
```bash
# Compresser avant transfert
tar -czf dist.tar.gz dist/
scp -P 65002 -i ~/.ssh/glp1_ed25519 dist.tar.gz u403023291@147.79.98.140:/tmp/
ssh -i ~/.ssh/glp1_ed25519 -p 65002 u403023291@147.79.98.140 "cd /home/u403023291/domains/glp1-france.fr/public_html/ && tar -xzf /tmp/dist.tar.gz --strip-components=1"
```

### 3. Cache busting
- **Noms de fichiers avec hash** (géré par Astro)
- **Headers de cache** appropriés
- **CDN** pour les assets statiques

## 🆘 Support

### Contacts d'urgence
- **Hostinger Support** : [support.hostinger.com](https://support.hostinger.com)
- **Documentation Astro** : [docs.astro.build](https://docs.astro.build)

### Ressources
- **SSH Debugging** : `ssh -vvv`
- **Hostinger Docs** : Documentation SSH et déploiement
- **Community** : Stack Overflow, Discord Astro

---

**✅ SYSTÈME OPÉRATIONNEL ET DOCUMENTÉ**

Ce guide assure un déploiement fiable et reproductible sur toutes les plateformes.
