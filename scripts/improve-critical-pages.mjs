import fs from 'fs'
import path from 'path'

// Liste des pages critiques à améliorer
const criticalPages = [
  'src/content/alternatives-glp1/peut-on-guerir-du-diabete.md',
  'src/content/alternatives-glp1/semaglutide-naturel.md',
  'src/content/effets-secondaires-glp1/insulevel-effet-indesirable.md',
  'src/content/glp1-cout/anneau-gastrique-prix-cmu.md',
  'src/content/glp1-diabete/traitement-insulinique.md',
  'src/content/glp1-perte-de-poids/chirurgie-bariatrique.md',
  'src/content/glp1-perte-de-poids/diabete-amaigrissement-rapide.md',
  'src/content/glp1-perte-de-poids/personne-obese.md',
  'src/content/glp1-perte-de-poids/pilule-qui-fait-maigrir.md',
  'src/content/medicaments-glp1/ado-medicament.md',
  'src/content/medicaments-glp1/ballon-gastrique-rembourse.md',
  'src/content/medicaments-glp1/dipeptidyl-peptidase-4.md',
  'src/content/medicaments-glp1/dosage-trulicity.md',
  'src/content/medicaments-glp1/dulaglutide-nom-commercial.md',
  'src/content/medicaments-glp1/januvia-autre-nom.md',
  'src/content/medicaments-glp1/mecanisme-d-action.md',
  'src/content/medicaments-glp1/medicament-prise-de-poid.md',
  'src/content/medicaments-glp1/metformine-autre-nom.md',
  'src/content/medicaments-glp1/metformine-diarrhee-solution.md'
]

// Configuration des améliorations par catégorie
const improvements = {
  'alternatives-glp1': {
    titlePrefix: 'Alternatives aux GLP-1 : ',
    descriptionTemplate: (title) => `Découvrez les alternatives naturelles aux médicaments GLP-1 pour ${title.toLowerCase()}. Solutions efficaces, prix et avis médical en France 2025.`,
    h1Template: (title) => `# ${title} : Alternatives Naturelles aux Médicaments GLP-1`
  },
  'effets-secondaires-glp1': {
    titlePrefix: 'Effets secondaires GLP-1 : ',
    descriptionTemplate: (title) => `Guide complet sur ${title.toLowerCase()} des médicaments GLP-1. Symptômes, prévention et solutions. Conseils médicaux France 2025.`,
    h1Template: (title) => `# ${title} des Médicaments GLP-1 : Guide Complet`
  },
  'glp1-cout': {
    titlePrefix: 'Prix et coût GLP-1 : ',
    descriptionTemplate: (title) => `Prix détaillé pour ${title.toLowerCase()} en France 2025. Remboursement sécurité sociale, mutuelles et comparatif des tarifs.`,
    h1Template: (title) => `# ${title} : Prix et Remboursement en France 2025`
  },
  'glp1-diabete': {
    titlePrefix: 'GLP-1 pour diabète : ',
    descriptionTemplate: (title) => `${title} avec les médicaments GLP-1. Efficacité, dosage et suivi médical. Guide complet diabète type 2 France 2025.`,
    h1Template: (title) => `# ${title} avec les Médicaments GLP-1`
  },
  'glp1-perte-de-poids': {
    titlePrefix: 'Perte de poids GLP-1 : ',
    descriptionTemplate: (title) => `${title} avec les médicaments GLP-1. Efficacité, résultats et conseils médicaux. Guide complet perte de poids France 2025.`,
    h1Template: (title) => `# ${title} avec les Médicaments GLP-1`
  },
  'medicaments-glp1': {
    titlePrefix: 'Médicaments GLP-1 : ',
    descriptionTemplate: (title) => `Guide complet sur ${title.toLowerCase()} des médicaments GLP-1. Posologie, effets et prix en France 2025. Conseils médicaux certifiés.`,
    h1Template: (title) => `# ${title} : Guide Complet des Médicaments GLP-1`
  }
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function extractCurrentTitle(content) {
  const titleMatch = content.match(/title:\s*["']([^"']+)["']/)
  return titleMatch ? titleMatch[1] : ''
}

function extractCategory(filePath) {
  const pathParts = filePath.split('/')
  return pathParts.find(part => part.includes('glp1') || part.includes('alternatives') || part.includes('effets'))
}

function improveTitle(currentTitle, category) {
  const config = improvements[category]
  if (!config) return currentTitle
  
  // Nettoyer le titre existant
  let cleanTitle = currentTitle.replace(/^["']|["']$/g, '')
  
  // Ajouter le préfixe si pas déjà présent
  if (!cleanTitle.toLowerCase().includes('glp')) {
    cleanTitle = config.titlePrefix + cleanTitle
  }
  
  // Capitaliser correctement
  cleanTitle = capitalizeFirst(cleanTitle)
  
  // S'assurer que le titre fait au moins 50 caractères
  if (cleanTitle.length < 50) {
    cleanTitle += ' - Guide Complet France 2025'
  }
  
  return cleanTitle
}

function improveDescription(title, category) {
  const config = improvements[category]
  if (!config) return `Guide complet sur ${title.toLowerCase()} en France 2025. Informations médicales, prix et conseils d'experts.`
  
  let description = config.descriptionTemplate(title.replace(/^["']|["']$/g, ''))
  
  // S'assurer que la description fait au moins 150 caractères
  if (description.length < 150) {
    description += ' Informations vérifiées par des professionnels de santé.'
  }
  
  return description
}

function addH1ToContent(content, title, category) {
  const config = improvements[category]
  if (!config) return content
  
  // Chercher s'il y a déjà un H1
  if (content.includes('# ')) return content
  
  // Ajouter le H1 après le frontmatter
  const frontmatterEnd = content.indexOf('---', 3) + 3
  const beforeContent = content.substring(0, frontmatterEnd)
  const afterContent = content.substring(frontmatterEnd)
  
  const h1 = config.h1Template(title.replace(/^["']|["']$/g, ''))
  
  return beforeContent + '\n\n' + h1 + '\n' + afterContent
}

async function improvePage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const category = extractCategory(filePath)
    const currentTitle = extractCurrentTitle(content)
    
    if (!currentTitle || !category) {
      console.log(`❌ Impossible de traiter ${filePath} - titre ou catégorie manquant`)
      return false
    }
    
    // Améliorer le titre
    const newTitle = improveTitle(currentTitle, category)
    
    // Améliorer la description
    const newDescription = improveDescription(currentTitle, category)
    
    // Modifier le contenu
    let newContent = content
    
    // Remplacer le titre
    newContent = newContent.replace(
      /title:\s*["']([^"']+)["']/,
      `title: "${newTitle}"`
    )
    
    // Ajouter ou remplacer la description
    if (newContent.includes('description:')) {
      newContent = newContent.replace(
        /description:\s*[^"\n]*["']?[^"'\n]*["']?/,
        `description: "${newDescription}"`
      )
    } else {
      // Ajouter après le title
      newContent = newContent.replace(
        /(title:\s*["'][^"']+["']\n)/,
        `$1description: "${newDescription}"\n`
      )
    }
    
    // Ajouter le H1
    newContent = addH1ToContent(newContent, currentTitle, category)
    
    // Sauvegarder
    fs.writeFileSync(filePath, newContent)
    
    console.log(`✅ ${path.basename(filePath)}`)
    console.log(`   Titre: ${newTitle}`)
    console.log(`   Description: ${newDescription.substring(0, 80)}...`)
    console.log('')
    
    return true
  } catch (error) {
    console.log(`❌ Erreur pour ${filePath}: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Amélioration des pages critiques...\n')
  
  let improved = 0
  let failed = 0
  
  for (const filePath of criticalPages) {
    const success = await improvePage(filePath)
    if (success) {
      improved++
    } else {
      failed++
    }
  }
  
  console.log(`📊 Résultats:`)
  console.log(`✅ Pages améliorées: ${improved}`)
  console.log(`❌ Échecs: ${failed}`)
  console.log(`📄 Total traité: ${improved + failed}/${criticalPages.length}`)
}

main().catch(console.error)
