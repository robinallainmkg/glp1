import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

// Sections répétitives à supprimer
const repetitiveSections = [
  '## À retenir',
  '## Prix, disponibilité et variations en France',
  '## Remboursement et prise en charge (France)', 
  '## Comparaison rapide (France vs autres pays)',
  '## Conseils pratiques',
  '## Produits cosmétiques recommandés',
  '## FAQ',
  '## Conclusion'
]

function cleanRepetitiveSections(content) {
  let cleanedContent = content
  
  // Supprimer chaque section répétitive
  for (const section of repetitiveSections) {
    const regex = new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'gm')
    cleanedContent = cleanedContent.replace(regex, '')
  }
  
  // Nettoyer les lignes vides consécutives (max 2)
  cleanedContent = cleanedContent.replace(/\n{3,}/g, '\n\n')
  
  return cleanedContent
}

async function main() {
  console.log('🧹 Nettoyage des sections répétitives...\n')
  
  // Cibler spécifiquement les collections problématiques
  const collections = [
    'src/content/medicaments-glp1/**/*.md',
    'src/content/alternatives-glp1/**/*.md',
    'src/content/effets-secondaires-glp1/**/*.md',
    'src/content/glp1-cout/**/*.md',
    'src/content/glp1-diabete/**/*.md',
    'src/content/glp1-perte-de-poids/**/*.md'
  ]
  
  let totalCleaned = 0
  
  for (const pattern of collections) {
    const files = await glob(pattern)
    
    for (const file of files) {
      try {
        const originalContent = readFileSync(file, 'utf-8')
        const cleanedContent = cleanRepetitiveSections(originalContent)
        
        // Vérifier si des changements ont été effectués
        if (originalContent !== cleanedContent) {
          writeFileSync(file, cleanedContent)
          console.log(`✅ ${file.split('/').pop()}`)
          totalCleaned++
        }
      } catch (error) {
        console.log(`❌ Erreur pour ${file}: ${error.message}`)
      }
    }
  }
  
  console.log(`\n📊 Résultats:`)
  console.log(`✅ Fichiers nettoyés: ${totalCleaned}`)
}

main().catch(console.error)
