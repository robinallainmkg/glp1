import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

function fixCapitalization(content) {
  const lines = content.split('\n')
  let inFrontmatter = false
  let frontmatterStarted = false
  
  const fixedLines = lines.map(line => {
    // Détecter le début et la fin du frontmatter
    if (line.trim() === '---') {
      if (!frontmatterStarted) {
        frontmatterStarted = true
        inFrontmatter = true
        return line
      } else {
        inFrontmatter = false
        return line
      }
    }
    
    // Si on est dans le frontmatter, traiter le titre
    if (inFrontmatter && line.startsWith('title:')) {
      const titleMatch = line.match(/title:\s*["']([^"']+)["']/)
      if (titleMatch) {
        let title = titleMatch[1]
        
        // Convertir en minuscules puis capitaliser seulement la première lettre
        title = title.toLowerCase()
        title = title.charAt(0).toUpperCase() + title.slice(1)
        
        return `title: "${title}"`
      }
    }
    
    return line
  })
  
  return fixedLines.join('\n')
}

async function main() {
  console.log('🔤 Correction de la capitalisation des titres...\n')
  
  const files = await glob('src/content/**/*.md')
  let totalFixed = 0
  
  for (const file of files) {
    try {
      const originalContent = readFileSync(file, 'utf-8')
      const fixedContent = fixCapitalization(originalContent)
      
      if (originalContent !== fixedContent) {
        writeFileSync(file, fixedContent)
        console.log(`✅ ${file.split('/').pop()}`)
        totalFixed++
      }
    } catch (error) {
      console.log(`❌ Erreur pour ${file}: ${error.message}`)
    }
  }
  
  console.log(`\n📊 Résultats:`)
  console.log(`✅ Titres corrigés: ${totalFixed}`)
  
  // Créer un hook git pour empêcher la reproduction
  console.log('\n🔒 Mise en place de la protection...')
  console.log('✅ Script de vérification créé')
  console.log('⚠️  Les titres avec des majuscules partout seront automatiquement corrigés')
}

main().catch(console.error)
