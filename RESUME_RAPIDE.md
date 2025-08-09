# ⚡ RÉSUMÉ RAPIDE - GLP1 France 2025

## 🚀 DÉMARRAGE IMMÉDIAT

```bash
# Développement local
npx astro dev --port 4321

# Build production  
npx astro build

# Actualiser base de données
node scripts/update-database.mjs
```

## � ACCÈS DIRECT

- **Site :** http://localhost:4321/
- **Admin :** http://localhost:4321/admin-dashboard/

## � STRUCTURE ESSENTIELLE

```
data/articles-database.json          # 74 articles, 9 collections
src/layouts/ArticleLayout.astro      # Template articles uniforme
src/pages/admin-dashboard.astro      # Dashboard complet
src/pages/[collection]/[slug].astro  # Pages dynamiques (×9)
```

## 🎨 COLLECTIONS ACTIVES

| Collection | Thème | Articles |
|------------|-------|----------|
| alternatives-glp1 | 🌱 cyan | 2 |
| effets-secondaires-glp1 | ⚠️ rouge | 8 |
| glp1-cout | 💰 jaune | 11 |
| glp1-diabete | 🩺 bleu | 8 |
| glp1-perte-de-poids | 🏃 vert | 13 |
| medicaments-glp1 | 💊 violet | 13 |
| medecins-glp1-france | 👨‍⚕️ indigo | 8 |
| recherche-glp1 | � rose | 2 |
| regime-glp1 | 🍎 orange | 9 |
glp1-diabete           → diabetes      (🩺 violet)
glp1-perte-de-poids    → weight-loss   (⚖️ vert)
medecins-glp1-france   → experts       (👨‍⚕️ teal)
medicaments-glp1       → medical       (💊 bleu)
recherche-glp1         → research      (🔬 indigo)
regime-glp1            → nutrition     (🥗 orange)
```

## 🔧 DÉPANNAGE EXPRESS

**❌ Article 404 :**
```bash
node scripts/update-database.mjs
npx astro dev --port 4321
```

**❌ Build échoue :**
```bash
node scripts/fix-dynamic-pages.mjs
npx astro build
```

**❌ Dashboard ne charge pas :**
- Vérifier Console navigateur (F12)
- Vérifier articles-database.json valide
- Redémarrer serveur dev

**❌ Onglets ne fonctionnent pas :**
- Vérifier JavaScript activé
- Vérifier pas d'erreurs Console
- Rafraîchir page (Ctrl+F5)

## 📊 STRUCTURE TECHNIQUE

### Page dynamique type
```astro
export async function getStaticPaths() {
  const category = 'COLLECTION_NAME';  // ← Seule variable à changer
  const databasePath = path.join(process.cwd(), 'data', 'articles-database.json');
  const articlesDatabase = JSON.parse(fs.readFileSync(databasePath, 'utf-8'));
  const categoryData = articlesDatabase.categories.find(cat => cat.name === category);
  
  return categoryData.articles.map(article => ({
    params: { slug: article.slug },
    props: { article, category: categoryData }
  }));
}
```

### Dashboard JavaScript robuste
```javascript
// Chargement sécurisé données
document.addEventListener('DOMContentLoaded', function() {
  try {
    articlesData = JSON.parse(document.getElementById('articles-data').textContent);
  } catch (e) {
    console.error('Erreur chargement:', e);
    articlesData = [];
  }
});

// Navigation onglets avec vérifications
function showTab(tabName) {
  const targetTab = document.getElementById(tabName + '-tab');
  if (targetTab) {
    targetTab.classList.add('active');
  } else {
    console.error('Tab non trouvé:', tabName);
  }
}
```

## 🏗️ POUR NOUVELLES FONCTIONNALITÉS

### Nouvelle collection
1. Créer dossier `src/content/nouvelle-collection/`
2. Ajouter articles `.md` dans le dossier
3. Créer `src/pages/nouvelle-collection/[slug].astro` (copier existant, changer nom)
4. Créer `src/pages/nouvelle-collection/index.astro` (page collection)
5. Ajouter thème dans `data/admin-config.json`
6. Ajouter mapping dans `getCollectionTheme()`
7. Régénérer : `node scripts/update-database.mjs`

### Nouveau thème visuel
1. **Config :** Ajouter dans `data/admin-config.json`
2. **CSS :** Ajouter classe dans `src/styles/global.css`
3. **Mapping :** Ajouter dans `getCollectionTheme()` de ArticleLayout
4. **Dashboard :** Mapping inclus automatiquement

### Backend API (préparé)
- Fonctions dashboard prêtes pour appels API
- Structure recommandée : REST API avec JWT
- Base de données suggérée : PostgreSQL
- Upload fichiers : Multer + cloud storage

## 📈 STATISTIQUES ACTUELLES

- **Articles :** 74 total
- **Collections :** 9 catégories
- **Pages générées :** 94 (build)
- **Thèmes visuels :** 9 différents
- **Fonctionnalités admin :** 100% frontend

---
*Mise à jour : 8 août 2025 - Base de code stable v2.0*
