# Guide de Déploiement Manuel - Hostinger

## Problème Résolu ✅
Les connexions SSH/SFTP depuis GitHub Actions sont bloquées par Hostinger, mais le build fonctionne parfaitement.

## Solution : Déploiement Manuel

### 1. Préparer les fichiers
```bash
# Dans le dossier du projet
npm run astro:build
```

### 2. Utiliser FileZilla (Recommandé)

**Configuration FileZilla :**
- **Hôte** : `glp1-france.fr`
- **Nom d'utilisateur** : `u403023291`
- **Mot de passe** : `12031990Robin!`
- **Port** : `21` (FTP)

**Étapes :**
1. Connectez-vous à FileZilla
2. Dans le panneau distant, naviguez vers `/public_html`
3. Dans le panneau local, naviguez vers le dossier `dist` de votre projet
4. Sélectionnez tous les fichiers et dossiers dans `dist`
5. Glissez-déposez vers le serveur (dans `/public_html`)

### 3. Vérification

Après le déploiement, votre page partenaires sera accessible à :
**https://glp1-france.fr/partenaires**

### 4. Automatisation Future

**Options pour automatiser :**
1. **Script PowerShell** : `scripts/deploy-manual.ps1` (déjà créé)
2. **GitHub Actions + Artifacts** : Le build est fait automatiquement, téléchargez l'artifact
3. **Webhook Hostinger** : Si disponible dans votre panel Hostinger

### 5. Fichiers Clés Déployés

- `/partenaires/index.html` - Page partenaires avec 7 liens
- `/_astro/` - Assets CSS/JS
- `/images/` - Images du site
- `.htaccess` - Configuration Apache pour URLs propres

## Contenu de la Page Partenaires

✅ **7 liens partenaires inclus :**
1. Secous
2. TopLien  
3. Infobel
4. FaitesVousConnaitre
5. WebWiki
6. Le-Bottin
7. MeilleurDuWeb

✅ **Intégration footer** : Lien "Partenaires" dans la section Ressources
✅ **SEO optimisé** : Meta descriptions, structured data
✅ **Design responsive** : Compatible mobile et desktop

## Note Technique

Le build Astro génère 168 pages statiques en 11.13s, incluant la page partenaires. Le problème est uniquement lié aux restrictions réseau de Hostinger, pas au code.
