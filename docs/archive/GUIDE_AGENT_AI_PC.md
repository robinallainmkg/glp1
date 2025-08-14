# Guide pour Agent AI sur PC - Récupération Projet GLP-1 France

## Instructions pour l'Agent AI

Voici les étapes exactes à suivre pour récupérer et configurer le projet GLP-1 France avec toute sa documentation :

### 1. Cloner le Repository Github

```bash
# Cloner le projet depuis Github
git clone https://github.com/[VOTRE-USERNAME]/glp1-france.git

# Aller dans le dossier du projet
cd glp1-france
```

**Note**: Remplacez `[VOTRE-USERNAME]` par le nom d'utilisateur Github réel du projet.

### 2. Vérifier que tout est bien récupéré

```bash
# Lister les fichiers principaux
ls -la

# Vérifier la présence de la documentation
ls -la *.md

# Vérifier les dossiers importants
ls -la src/ data/ public/images/products/
```

**Vous devriez voir ces fichiers de documentation :**
- `README.md` - Documentation générale du projet
- `SHOPIFY_COLLABS_GUIDE.md` - Guide technique affiliation Shopify Collabs
- `DEMARRAGE_MANUEL.md` - Guide de démarrage et test local
- `GUIDE_AGENT_AI_PC.md` - Ce guide (pour vous)

### 3. Installer les dépendances

```bash
# Installer Node.js si pas déjà fait (version 18+ recommandée)
# Puis installer les dépendances du projet
npm install
```

### 4. Lancer le projet en local pour test

```bash
# Démarrer le serveur de développement
npm run dev

# Le site sera accessible sur http://localhost:4321
```

### 5. Fichiers critiques à connaître

**Configuration Affiliation :**
- `data/affiliate-products.json` - Base de données des produits (Talika uniquement)
- `src/utils/affiliate-manager.ts` - Gestionnaire d'affiliation
- `src/components/AffiliateProduct.astro` - Composant d'affichage du produit

**Image du produit :**
- `public/images/products/talika-bust-phytoserum.jpg` - Image du produit Talika

**Pages de test :**
- `src/pages/test-nouveau-placement.astro` - Test du placement intelligent
- `src/pages/test-shopify-collabs.astro` - Test des variantes de design

**Dashboard admin :**
- `src/pages/admin-dashboard.astro` - Interface d'administration

### 6. Tests à effectuer

1. **Test de fonctionnement :**
   - Aller sur http://localhost:4321/test-nouveau-placement
   - Vérifier que le bloc d'affiliation apparaît après 2 paragraphes
   - Vérifier que l'image du produit s'affiche correctement

2. **Test du design :**
   - Aller sur http://localhost:4321/test-shopify-collabs
   - Vérifier les différentes variantes de design

3. **Test du dashboard :**
   - Aller sur http://localhost:4321/admin-dashboard
   - Vérifier l'onglet "Affiliation"

### 7. Documentation complète disponible

**Lisez ces fichiers dans l'ordre :**

1. `README.md` - Vue d'ensemble du projet
2. `SHOPIFY_COLLABS_GUIDE.md` - Guide technique détaillé
3. `DEMARRAGE_MANUEL.md` - Procédures de test et démarrage

### 8. Structure du projet

```
glp1-france/
├── README.md                    # Doc générale
├── SHOPIFY_COLLABS_GUIDE.md    # Guide affiliation
├── DEMARRAGE_MANUEL.md         # Guide démarrage
├── data/
│   └── affiliate-products.json # Produits affiliation
├── src/
│   ├── components/
│   │   └── AffiliateProduct.astro
│   ├── utils/
│   │   └── affiliate-manager.ts
│   ├── layouts/
│   │   └── ArticleLayout.astro
│   └── pages/
│       ├── admin-dashboard.astro
│       ├── test-nouveau-placement.astro
│       └── test-shopify-collabs.astro
└── public/
    └── images/
        └── products/
            └── talika-bust-phytoserum.jpg
```

### 9. Commandes utiles

```bash
# Build de production
npm run build

# Preview du build
npm run preview

# Voir les logs
npm run dev --verbose

# Nettoyer le cache
rm -rf node_modules/.astro
npm run dev
```

### 10. Troubleshooting

**Si l'image ne s'affiche pas :**
- Vérifier que le fichier existe : `ls -la public/images/products/`
- Le chemin dans le code doit être : `/images/products/talika-bust-phytoserum.jpg`

**Si le bloc d'affiliation ne s'affiche pas :**
- Vérifier le contenu de `data/affiliate-products.json`
- Vérifier que l'ID du produit est bien "talika-bust-phytoserum"

**Si le build échoue :**
- Supprimer `node_modules` et `.astro` : `rm -rf node_modules .astro`
- Réinstaller : `npm install`

---

## Résumé pour l'Agent AI

**Commande simple pour tout récupérer :**

```bash
git clone https://github.com/[USERNAME]/glp1-france.git && cd glp1-france && npm install && npm run dev
```

**Documentation à lire :** `README.md`, `SHOPIFY_COLLABS_GUIDE.md`, `DEMARRAGE_MANUEL.md`

**Test rapide :** http://localhost:4321/test-nouveau-placement

Tout le code, la documentation, les images et les guides sont dans le repository Github. Une fois cloné, vous avez accès à tout.
