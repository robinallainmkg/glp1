import fs from 'fs'
import path from 'path'

// Liste des pages critiques avec leurs H1 appropriés
const pagesWithH1 = [
  {
    file: 'src/content/alternatives-glp1/semaglutide-naturel.md',
    h1: '# Sémaglutide Naturel : Alternatives Naturelles aux Médicaments GLP-1'
  },
  {
    file: 'src/content/effets-secondaires-glp1/insulevel-effet-indesirable.md',
    h1: '# Insulevel Effet Indésirable des Médicaments GLP-1 : Guide Complet'
  },
  {
    file: 'src/content/glp1-cout/anneau-gastrique-prix-cmu.md',
    h1: '# Anneau Gastrique Prix CMU : Prix et Remboursement en France 2025'
  },
  {
    file: 'src/content/glp1-diabete/traitement-insulinique.md',
    h1: '# Traitement Insulinique avec les Médicaments GLP-1'
  },
  {
    file: 'src/content/glp1-perte-de-poids/chirurgie-bariatrique.md',
    h1: '# Chirurgie Bariatrique avec les Médicaments GLP-1'
  },
  {
    file: 'src/content/glp1-perte-de-poids/diabete-amaigrissement-rapide.md',
    h1: '# Diabète Amaigrissement Rapide avec les Médicaments GLP-1'
  },
  {
    file: 'src/content/glp1-perte-de-poids/personne-obese.md',
    h1: '# Personne Obèse avec les Médicaments GLP-1'
  },
  {
    file: 'src/content/glp1-perte-de-poids/pilule-qui-fait-maigrir.md',
    h1: '# Pilule qui Fait Maigrir : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/ado-medicament.md',
    h1: '# ADO Médicament : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/ballon-gastrique-rembourse.md',
    h1: '# Ballon Gastrique Remboursé : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/dipeptidyl-peptidase-4.md',
    h1: '# Dipeptidyl Peptidase 4 : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/dosage-trulicity.md',
    h1: '# Dosage Trulicity : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/dulaglutide-nom-commercial.md',
    h1: '# Dulaglutide Nom Commercial : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/januvia-autre-nom.md',
    h1: '# Januvia Autre Nom : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/mecanisme-d-action.md',
    h1: '# Mécanisme d\'Action : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/medicament-prise-de-poid.md',
    h1: '# Médicament Prise de Poids : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/metformine-autre-nom.md',
    h1: '# Metformine Autre Nom : Guide Complet des Médicaments GLP-1'
  },
  {
    file: 'src/content/medicaments-glp1/metformine-diarrhee-solution.md',
    h1: '# Metformine Diarrhée Solution : Guide Complet des Médicaments GLP-1'
  }
]

function addH1ToFile(filePath, h1) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    
    // Vérifier s'il y a déjà un H1
    if (content.includes('# ') && !content.includes('## ')) {
      console.log(`⏩ ${path.basename(filePath)} - H1 déjà présent`)
      return true
    }
    
    // Trouver la fin du frontmatter
    const frontmatterEnd = content.indexOf('---', 3) + 3
    const beforeContent = content.substring(0, frontmatterEnd)
    const afterContent = content.substring(frontmatterEnd)
    
    // Ajouter le H1
    const newContent = beforeContent + '\n\n' + h1 + '\n' + afterContent
    
    fs.writeFileSync(filePath, newContent)
    console.log(`✅ ${path.basename(filePath)} - H1 ajouté`)
    return true
  } catch (error) {
    console.log(`❌ ${path.basename(filePath)} - Erreur: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🔧 Ajout des H1 aux pages critiques...\n')
  
  let added = 0
  let skipped = 0
  let failed = 0
  
  for (const page of pagesWithH1) {
    const result = addH1ToFile(page.file, page.h1)
    if (result === true) {
      if (fs.readFileSync(page.file, 'utf-8').includes(page.h1)) {
        added++
      } else {
        skipped++
      }
    } else {
      failed++
    }
  }
  
  console.log(`\n📊 Résultats:`)
  console.log(`✅ H1 ajoutés: ${added}`)
  console.log(`⏩ Déjà présents: ${skipped}`)
  console.log(`❌ Échecs: ${failed}`)
  console.log(`📄 Total: ${added + skipped + failed}/${pagesWithH1.length}`)
}

main().catch(console.error)
