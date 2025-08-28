#!/bin/bash

# Script pour corriger l'incohérence entre les noms d'images attendus et générés
# Crée des liens symboliques pour faire correspondre les images aux références des articles

echo "🔧 Correction des noms d'images pour correspondre aux références des articles..."

CONTENT_DIR="/Users/mac/Projet/glp1/src/content"
IMAGES_DIR="/Users/mac/Projet/glp1/public/images/thumbnails"

# Fonction pour créer un lien symbolique si l'image générée existe
create_image_link() {
    local EXPECTED_NAME="$1"
    local GENERATED_PATTERN="$2"
    
    # Chercher l'image générée correspondante
    local GENERATED_IMAGE=$(find "$IMAGES_DIR" -name "*$GENERATED_PATTERN*" -type f | head -1)
    
    if [ -n "$GENERATED_IMAGE" ] && [ -f "$GENERATED_IMAGE" ]; then
        local TARGET_PATH="$IMAGES_DIR/$EXPECTED_NAME"
        
        # Supprimer le lien/fichier existant s'il y en a un
        if [ -e "$TARGET_PATH" ]; then
            rm -f "$TARGET_PATH"
        fi
        
        # Créer le lien symbolique
        ln -s "$(basename "$GENERATED_IMAGE")" "$TARGET_PATH"
        echo "✅ Créé: $EXPECTED_NAME → $(basename "$GENERATED_IMAGE")"
    else
        echo "❌ Image non trouvée pour: $EXPECTED_NAME (pattern: $GENERATED_PATTERN)"
    fi
}

# Mapping des noms attendus vers les patterns générés
echo "📋 Création des liens symboliques..."

# Traitements GLP-1
create_image_link "ozempic-medical-care.jpg" "guide-complet-ozempic-illus"
create_image_link "wegovy-medical-guide.jpg" "guide-complet-wegovy-illus"
create_image_link "saxenda-medical-guide.jpg" "guide-complet-saxenda-illus"
create_image_link "trulicity-medical-guide.jpg" "guide-complet-trulicity-illus"
create_image_link "victoza-medical-guide.jpg" "guide-complet-victoza-illus"
create_image_link "rybelsus-medical-guide.jpg" "guide-complet-rybelsus-illus"

# Prix et coûts
create_image_link "wegovy-prix.svg" "wegovy-prix-illus"
create_image_link "saxenda-prix-pharmacie.svg" "saxenda-prix-pharmacie-illus"
create_image_link "wegovy-remboursement-mutuelle.svg" "wegovy-remboursement-mutuelle-illus"
create_image_link "ozempic-prix.svg" "ozempic-prix-illus"
create_image_link "anneau-gastrique-prix-cmu.svg" "anneau-gastrique-prix-cmu-illus"
create_image_link "operation-pour-maigrir-prix.svg" "operation-pour-maigrir-prix-illus"

# Effets secondaires
create_image_link "ozempic-danger.svg" "ozempic-danger-illus"
create_image_link "wegovy-danger.svg" "wegovy-danger-illus"
create_image_link "wegovy-dosage.svg" "wegovy-dosage-illus"

# Médecins et cliniques
create_image_link "clinique-pour-obesite.svg" "clinique-pour-obesite-illus"
create_image_link "clinique-pour-obesite-new.svg" "clinique-pour-obesite-new-illus"
create_image_link "diabetologue-paris.svg" "diabetologue-paris-illus"
create_image_link "endocrinologue-pour-maigrir.svg" "endocrinologue-pour-maigrir-illus"
create_image_link "endocrinologue-pour-maigrir-new.svg" "endocrinologue-pour-maigrir-new-illus"

# Perte de poids
create_image_link "glp1-perte-de-poids.svg" "glp1-perte-de-poids-illus"
create_image_link "chirurgie-bariatrique.svg" "chirurgie-bariatrique-illus"
create_image_link "combien-de-dose-dans-un-stylo-ozempic.svg" "combien-de-dose-dans-un-stylo-ozempic-illus"
create_image_link "diabete-amaigrissement-rapide.svg" "diabete-amaigrissement-rapide-illus"
create_image_link "medicament-americain-pour-maigrir.svg" "medicament-americain-pour-maigrir-illus"
create_image_link "medicament-pour-maigrir-tres-puissant-en-pharmacie.svg" "medicament-pour-maigrir-tres-puissant-en-pharmacie-illus"
create_image_link "medicament-pour-maigrir-tres-puissant.svg" "medicament-pour-maigrir-tres-puissant-illus"
create_image_link "medicament-pour-perdre-du-ventre-en-1-semaine.svg" "medicament-pour-perdre-du-ventre-en-1-semaine-illus"
create_image_link "obesite-severe-prise-en-charge.svg" "obesite-severe-prise-en-charge-illus"
create_image_link "ou-trouver-ozempic.svg" "ou-trouver-ozempic-illus"
create_image_link "ozempic-effets-secondaires-forum.svg" "ozempic-effets-secondaires-forum-illus"
create_image_link "ozempic-regime.svg" "ozempic-regime-illus"
create_image_link "personne-obese.svg" "personne-obese-illus"
create_image_link "pilule-qui-fait-maigrir.svg" "pilule-qui-fait-maigrir-illus"

# Régimes et nutrition
create_image_link "glp1-calories-journalieres.svg" "glp1-calories-journalieres-illus"
create_image_link "glp1-index-glycemique.svg" "glp1-index-glycemique-illus"
create_image_link "glp1-micronutriments.svg" "glp1-micronutriments-illus"
create_image_link "glp1-portion-alimentaire.svg" "glp1-portion-alimentaire-illus"
create_image_link "glp1-proteines.svg" "glp1-proteines-illus"
create_image_link "isglt2-liste.svg" "isglt2-liste-illus"
create_image_link "jeune-intermittent-glp1.svg" "jeune-intermittent-glp1-illus"
create_image_link "regime-cetogene-glp1.svg" "regime-cetogene-glp1-illus"
create_image_link "regime-chrono-nutrition-glp1.svg" "regime-chrono-nutrition-glp1-illus"
create_image_link "regime-dash-glp1.svg" "regime-dash-glp1-illus"
create_image_link "regime-detox-glp1.svg" "regime-detox-glp1-illus"
create_image_link "regime-mediterraneen-glp1.svg" "regime-mediterraneen-glp1-illus"
create_image_link "regime-paleo-glp1.svg" "regime-paleo-glp1-illus"
create_image_link "regime-sans-sucre-glp1.svg" "regime-sans-sucre-glp1-illus"

# Recherche et autres
create_image_link "glp-inhibitors.svg" "glp-inhibitors-illus"
create_image_link "recherche-clinique-glp1.svg" "recherche-clinique-glp1-illus"
create_image_link "avant-apres-glp1.svg" "avant-apres-glp1-illus"

# Alternatives
create_image_link "acupuncture-glp1.svg" "acupuncture-glp1-illus"
create_image_link "berberine-glp1.svg" "berberine-glp1-illus"
create_image_link "cannelle-glp1.svg" "cannelle-glp1-illus"
create_image_link "chrome-diabete.svg" "chrome-diabete-illus"
create_image_link "homeopathie-diabete.svg" "homeopathie-diabete-illus"
create_image_link "meditation-glp1.svg" "meditation-glp1-illus"
create_image_link "peut-on-guerir-du-diabete.svg" "peut-on-guerir-du-diabete-illus"
create_image_link "plantes-diabete.svg" "plantes-diabete-illus"
create_image_link "semaglutide-naturel.svg" "semaglutide-naturel-illus"
create_image_link "supplements-glp1.svg" "supplements-glp1-illus"
create_image_link "vinaigre-cidre-glp1.svg" "vinaigre-cidre-glp1-illus"
create_image_link "yoga-diabete.svg" "yoga-diabete-illus"

# Pages générales
create_image_link "homepage.svg" "homepage-illus"
create_image_link "partenaires.svg" "partenaires-illus"
create_image_link "quel-traitement-glp1-choisir.svg" "quel-traitement-glp1-choisir-illus"

echo "🎉 Correction terminée!"
echo "Vérifiez maintenant les pages de collections - les images devraient s'afficher correctement."

# Afficher un résumé
echo ""
echo "📊 Résumé:"
echo "- Liens symboliques créés: $(ls -la "$IMAGES_DIR"/*.jpg 2>/dev/null | grep "\->" | wc -l) fichiers JPG"
echo "- Liens symboliques créés: $(ls -la "$IMAGES_DIR"/*.svg 2>/dev/null | grep "\->" | wc -l) fichiers SVG"
