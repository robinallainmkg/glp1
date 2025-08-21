# Guide d'utilisation du générateur de thumbnails

## Comment ça marche

Le script `generate-thumbnails.mjs` génère automatiquement des images SVG pour tous les articles de ton site. Voici ce qu'il fait :

### 🎯 Fonctionnalités principales

1. **Scan automatique** : Parcourt tous les dossiers dans `/src/content/`
2. **Styles par collection** : Applique des designs différents selon le type de contenu :
   - **medicaments-glp1** : Style médical (bleu/blanc)
   - **glp1-perte-de-poids** : Style transformation (vert dégradé)
   - **glp1-diabete** : Style santé (rouge médical)
   - **Autres collections** : Style par défaut (violet/bleu)

3. **Génération SVG** : Crée des images vectorielles de 400x200px
4. **Sauvegarde automatique** : Place les images dans `/public/images/thumbnails/`
5. **Mise à jour du frontmatter** : Ajoute automatiquement le lien vers l'image

### 🚀 Comment l'utiliser

```bash
# Générer toutes les thumbnails
node scripts/generate-thumbnails.mjs

# Ou avec PowerShell
.\scripts\generate-images.ps1
```

### 📊 Résultats actuels

✅ **${await countThumbnails()} thumbnails générées** dans `/public/images/thumbnails/`

### 🎨 Exemples de styles

- **Style médical** : Fond bleu gradient, texte blanc, icône stéthoscope
- **Style transformation** : Fond vert, texte blanc, icône balance
- **Style recherche** : Fond violet, texte blanc, icône loupe

### 🔧 Personnalisation

Pour modifier les styles, édite le fichier `scripts/generate-thumbnails.mjs` section `imageStyles`.

---

**Note** : Le script ne régénère pas les images existantes, il crée seulement celles manquantes.
