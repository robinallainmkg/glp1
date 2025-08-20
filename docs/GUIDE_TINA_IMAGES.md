# Guide TinaCMS - Gestion des Images et Articles

## 🚀 Accès à l'administration

1. **Démarrer TinaCMS** :
   ```bash
   cd glp1-github
   npm run dev:tina
   ```

2. **Accéder à l'interface** :
   - Site : `http://localhost:4321/`
   - Admin TinaCMS : `http://localhost:4321/admin`

## 📸 Gestion des images

### Structure des images
```
public/images/
├── thumbnails/         # Images des articles (gérées automatiquement)
├── uploads/           # Images uploadées via TinaCMS
└── authors/           # Photos d'auteurs
```

### Dans TinaCMS

1. **Créer/Éditer un article** :
   - Sélectionner la collection appropriée
   - Remplir le champ "Image principale"
   - Ajouter le "Texte alternatif de l'image"

2. **L'image apparaîtra automatiquement** :
   - ✅ Dans l'article lui-même
   - ✅ Dans les listes de collections
   - ✅ Dans les cartes d'articles
   - ✅ Dans les métadonnées Open Graph
   - ✅ Dans l'interface TinaCMS

### Formats recommandés
- **Taille** : 1200x630px (ratio 16:9)
- **Format** : JPG, PNG, WebP
- **Poids** : < 500KB (compression automatique)

## 🎯 Workflow éditorial

### 1. Création d'article
```
TinaCMS Admin → Collection → New Article
├── Titre & Description (SEO)
├── Image principale + Alt text
├── Collection & Catégorie
├── Mots-clés & Tags
├── Contenu Markdown
└── Save = Publication automatique
```

### 2. Champs obligatoires
- **Titre** : H1 et meta title
- **Description** : Meta description SEO
- **Slug** : URL de l'article
- **Collection** : Où classer l'article
- **Catégorie** : Type de contenu
- **Image principale** : Thumbnail
- **Texte alternatif** : Accessibilité

### 3. Champs optionnels SEO
- Article en vedette
- Priorité d'affichage
- Titre SEO personnalisé
- URL canonique
- Exclusion moteurs (noindex)
- Type Schema.org

## 📊 Collections disponibles

1. **💊 Médicaments GLP1** (`medicaments_glp1`)
2. **⚖️ GLP1 Perte de Poids** (`glp1_perte_de_poids`)
3. **💰 Coût et Prix** (`glp1_cout`)
4. **🩺 GLP1 et Diabète** (`glp1_diabete`)
5. **⚠️ Effets Secondaires** (`effets_secondaires_glp1`)
6. **👨‍⚕️ Médecins France** (`medecins_glp1_france`)
7. **🔬 Recherche GLP1** (`recherche_glp1`)
8. **🥗 Régime GLP1** (`regime_glp1`)
9. **🔄 Alternatives GLP1** (`alternatives_glp1`)

## 🔄 Changement de collection

### Dans TinaCMS
1. Ouvrir l'article à modifier
2. Changer le champ "Collection"
3. Sauvegarder
4. L'article sera automatiquement déplacé

### Conséquences automatiques
- ✅ URL mise à jour
- ✅ Navigation ajustée  
- ✅ Liens internes corrigés
- ✅ Commit Git automatique

## 🛠️ Dépannage

### Images ne s'affichent pas
1. Vérifier le chemin dans le champ "Image principale"
2. S'assurer que l'image existe dans `/public/images/`
3. Vérifier le texte alternatif

### TinaCMS ne démarre pas
```bash
# Arrêter tous les processus Node
taskkill /f /im node.exe

# Nettoyer le cache
rm -rf tina/__generated__

# Relancer
npm run dev:tina
```

### Erreur de collection
- Vérifier que les noms utilisent des underscores (pas de tirets)
- Contrôler la configuration dans `tina/config.ts`

## 📈 SEO automatique

Avec les nouveaux champs, chaque article bénéficie automatiquement de :

- **Meta tags** complets
- **Open Graph** pour réseaux sociaux
- **Schema.org** pour données structurées
- **Images optimisées** avec alt text
- **URLs SEO-friendly**
- **Temps de lecture** calculé
- **Sitemap** automatique

## 💡 Bonnes pratiques

### Images
- Toujours ajouter un texte alternatif descriptif
- Optimiser le poids (< 500KB)
- Utiliser des noms de fichiers explicites
- Préférer le format WebP quand possible

### SEO
- Description entre 150-160 caractères
- Titre accrocheur et descriptif
- Mots-clés pertinents sans sur-optimisation
- Contenu de qualité et unique

### Organisation
- Classer dans la bonne collection
- Utiliser les catégories appropriées
- Marquer les articles importants comme "featured"
- Maintenir une priorité cohérente

---

**📞 Support** : En cas de problème, consulter la documentation complète dans `/docs/admin-documentation.md`
