# Guide de génération d'images pour le site GLP-1

## 🚀 Démarrage rapide

### 1. Configuration de l'API
```bash
# Installez votre clé API Grok
export GROK_API_KEY="votre-cle-api-ici"

# Ou créez un fichier .env
echo "GROK_API_KEY=votre-cle-api-ici" > .env
```

### 2. Générer une image spécifique
```bash
# Image thumbnail pour Ozempic
./generate-image.sh thumbnail ozempic

# Image d'illustration pour Wegovy
./generate-image.sh illustration wegovy

# Icon pour Saxenda
./generate-image.sh icon saxenda
```

### 3. Générer toutes les images manquantes
```bash
./generate-all-images.sh
```

## 📋 Liste des images nécessaires

### Images manquantes actuellement:
- [ ] `prix-ozempic-france-illus.jpg`
- [ ] `prix-wegovy-france-illus.jpg`
- [ ] `prix-saxenda-france-illus.jpg`
- [ ] `prix-trulicity-france-illus.jpg`
- [ ] `prix-victoza-france-illus.jpg`
- [ ] `prix-rybelsus-france-illus.jpg`
- [ ] `effets-secondaires-ozempic-illus.jpg`
- [ ] `effets-secondaires-wegovy-illus.jpg`
- [ ] `effets-secondaires-saxenda-illus.jpg`
- [ ] `effets-secondaires-trulicity-illus.jpg`
- [ ] `effets-secondaires-victoza-illus.jpg`
- [ ] `effets-secondaires-rybelsus-illus.jpg`

## 🎨 Conseils pour des prompts efficaces

### Structure d'un bon prompt:
1. **Sujet principal** : L'élément central
2. **Contexte médical** : Setting professionnel
3. **Style visuel** : Illustration médicale, propre, professionnelle
4. **Format** : 16:9, haute qualité
5. **Couleurs** : Palette médicale (blanc, bleu médical)

### Exemples de prompts réussis:
```
"Professional medical illustration of Ozempic semaglutide pen injector held by healthcare professional, clean white background, pharmaceutical style, high quality, 16:9 aspect ratio"

"Medical illustration showing Wegovy injection pen for obesity treatment, healthcare professional demonstrating usage, professional clinic setting, clean design"
```

## 🔧 Dépannage

### Erreur "API key not configured"
```bash
export GROK_API_KEY="your-actual-api-key"
```

### Erreur "Image generation failed"
- Vérifiez votre quota API
- Simplifiez le prompt
- Réessayez dans quelques minutes

### Images trop petites
- Utilisez les tailles recommandées dans `image-prompts-config.txt`
- Format 16:9 pour les thumbnails

## 📊 Workflow recommandé

1. **Planification** : Listez toutes les images nécessaires
2. **Configuration** : Configurez votre API key
3. **Génération** : Lancez `./generate-all-images.sh`
4. **Vérification** : Vérifiez la qualité et la cohérence
5. **Optimisation** : Compressez si nécessaire (TinyPNG, ImageOptim)

## 🎯 Cohérence visuelle

### Palette de couleurs:
- **Primaire** : Bleu médical (#0066CC)
- **Secondaire** : Blanc (#FFFFFF)
- **Accent** : Gris médical (#E5E5E5)
- **Texte** : Noir (#000000)

### Style uniforme:
- Illustrations médicales professionnelles
- Fonds blancs ou très clairs
- Lignes nettes et précises
- Éclairage naturel et professionnel

## 📈 Optimisation pour le web

### Formats recommandés:
- **JPG** pour les photos et illustrations complexes
- **PNG** pour les éléments avec transparence
- **WebP** pour une meilleure compression

### Tailles optimales:
- **Thumbnails** : 1200x630px (16:9)
- **Articles** : 1792x1024px
- **Icons** : 256x256px

## 🔄 Maintenance

### Mise à jour régulière:
- Vérifiez les images manquantes chaque semaine
- Regénérez si la qualité n'est pas satisfaisante
- Archivez les anciennes versions

### Sauvegarde:
```bash
# Sauvegarder les images
tar -czf images-backup-$(date +%Y%m%d).tar.gz public/images/

# Restaurer si nécessaire
tar -xzf images-backup-20250828.tar.gz
```
