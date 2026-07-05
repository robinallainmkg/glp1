#!/usr/bin/env node

/**
 * Script pour ajouter Schema.org MedicalWebPage + FAQPage
 * aux pages de prix qui n'en ont pas encore
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const files = [
  {
    path: 'src/content/glp1-cout/prix-saxenda-france.md',
    drug: 'Saxenda',
    ingredient: 'Liraglutide',
    price: '70-80€',
    reimbursement: '65%'
  },
  {
    path: 'src/content/glp1-cout/prix-victoza-france.md',
    drug: 'Victoza',
    ingredient: 'Liraglutide',
    price: '75-85€',
    reimbursement: '65%'
  },
  {
    path: 'src/content/glp1-cout/prix-trulicity-france.md',
    drug: 'Trulicity',
    ingredient: 'Dulaglutide',
    price: '85€',
    reimbursement: '65%'
  },
  {
    path: 'src/content/glp1-cout/prix-rybelsus-france.md',
    drug: 'Rybelsus',
    ingredient: 'Semaglutide oral',
    price: '80-100€',
    reimbursement: '65%'
  }
];

function generateSchema(drug, ingredient, price, reimbursement) {
  const today = new Date().toISOString().split('T')[0];
  
  return `
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Prix ${drug} 2025 : Coût par Dosage et Remboursement Mutuelle",
  "description": "Prix ${drug} en pharmacie : ${price} par mois. Coût réel après remboursement ${reimbursement}.",
  "url": "https://glp1-france.fr/collections/glp1-cout/prix-${drug.toLowerCase()}-france",
  "datePublished": "${today}",
  "dateModified": "${today}",
  "author": {
    "@type": "Person",
    "name": "Dr. Marie Dubois"
  },
  "publisher": {
    "@type": "Organization",
    "name": "GLP-1 France",
    "url": "https://glp1-france.fr"
  },
  "specialty": "Endocrinology",
  "about": {
    "@type": "Drug",
    "name": "${drug}",
    "activeIngredient": "${ingredient}",
    "manufacturer": {
      "@type": "Organization",
      "name": "Novo Nordisk"
    }
  },
  "mainEntity": {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Quel est le prix de ${drug} en pharmacie en France ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Le prix officiel de ${drug} en pharmacie est de ${price} par mois. Après remboursement (${reimbursement} Sécurité Sociale + mutuelle), le coût réel patient varie selon votre couverture."
        }
      },
      {
        "@type": "Question",
        "name": "${drug} est-il remboursé en 2025 ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${drug} est remboursé à ${reimbursement} par l'Assurance Maladie sous conditions : prescription médicale, IMC ≥ 30 ou diabète type 2 confirmé."
        }
      }
    ]
  }
}
</script>`;
}

async function main() {
  console.log('🎯 Ajout Schema.org aux pages de prix\n');

  for (const file of files) {
    const filePath = path.join(__dirname, '..', file.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Fichier non trouvé: ${file.path}`);
      continue;
    }

    let content = fs.readFileSync(filePath, 'utf-8');

    // Vérifier si Schema.org existe déjà
    if (content.includes('@type": "MedicalWebPage')) {
      console.log(`⏭️  ${file.drug}: Schema.org déjà présent`);
      continue;
    }

    // Générer Schema.org
    const schema = generateSchema(file.drug, file.ingredient, file.price, file.reimbursement);

    // Insérer après le frontmatter
    const frontmatterEnd = content.indexOf('---', 3);
    if (frontmatterEnd === -1) {
      console.log(`❌ ${file.drug}: Frontmatter invalide`);
      continue;
    }

    const beforeSchema = content.substring(0, frontmatterEnd + 3);
    const afterSchema = content.substring(frontmatterEnd + 3);

    const newContent = beforeSchema + schema + afterSchema;

    // Écrire
    fs.writeFileSync(filePath, newContent, 'utf-8');
    console.log(`✅ ${file.drug}: Schema.org ajouté`);
  }

  console.log('\n✨ Terminé! Schema.org ajouté aux pages de prix.');
  console.log('\n💡 Impact SEO:');
  console.log('  - Rich snippets dans Google');
  console.log('  - FAQ en position 0');
  console.log('  - Meilleur taux de clic');
}

main().catch(console.error);
