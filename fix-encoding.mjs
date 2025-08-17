// Script pour corriger l'encodage UTF-8 dans le guide
import fs from 'fs';

const filePath = 'src/pages/guides/quel-traitement-glp1-choisir.astro';

function fixEncoding() {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Dictionnaire des corrections d'encodage
  const fixes = {
    'diab�te': 'diabète',
    'Diab�te': 'Diabète', 
    'Ob�sit�': 'Obésité',
    'ob�sit�': 'obésité',
    'mod�r�e': 'modérée',
    's�v�re': 'sévère',
    'pond�rale': 'pondérale',
    'Exp�rience': 'Expérience',
    'exp�rience': 'expérience',
    'r�gimes': 'régimes',
    'd�j�': 'déjà',
    'essay�': 'essayé',
    'pr�f�rez': 'préférez',
    'g�n�ral': 'général',
    'pr�occupation': 'préoccupation',
    'co�t': 'coût',
    'crit�re': 'critère',
    'crit�res': 'critères',
    'm�dical': 'médical',
    'pr�sent': 'présent',
    'pr�sence': 'présence',
    'r�sultats': 'résultats',
    'th�rapie': 'thérapie',
    'efficacit�': 'efficacité',
    'tol�rance': 'tolérance',
    '??': '⚠️'
  };

  // Appliquer les corrections
  Object.entries(fixes).forEach(([bad, good]) => {
    content = content.replaceAll(bad, good);
  });

  // Sauvegarder
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log('✅ Encodage corrigé dans le guide');
}

fixEncoding();
