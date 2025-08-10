import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { glob } from 'glob'

// Fonction pour capitaliser correctement les titres (premier mot seulement)
function capitalizeTitle(title) {
  // Enlever les guillemets s'ils existent
  let cleanTitle = title.replace(/^["']|["']$/g, '')
  
  // Capitaliser seulement la première lettre
  if (cleanTitle.length > 0) {
    cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1).toLowerCase()
  }
  
  return `"${cleanTitle}"`
}

async function fixTitles() {
  console.log('🔧 Correction des titres des articles...\n')
  
  // Trouver tous les fichiers markdown dans les collections
  const files = await glob('src/content/**/*.md')
  
  let totalFixed = 0
  
  for (const file of files) {
    try {
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n')
      
      let modified = false
      let titleLine = -1
      
      // Trouver la ligne du titre
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('title:')) {
          titleLine = i
          break
        }
      }
      
      if (titleLine !== -1) {
        const currentTitleLine = lines[titleLine]
        const titleMatch = currentTitleLine.match(/title:\s*(.+)/)
        
        if (titleMatch) {
          const currentTitle = titleMatch[1].trim()
          const newTitle = capitalizeTitle(currentTitle)
          
          if (currentTitle !== newTitle) {
            lines[titleLine] = `title: ${newTitle}`
            modified = true
            
            console.log(`📝 ${file}`)
            console.log(`   Avant : ${currentTitle}`)
            console.log(`   Après : ${newTitle}`)
            console.log('')
            
            totalFixed++
          }
        }
      }
      
      if (modified) {
        writeFileSync(file, lines.join('\n'), 'utf-8')
      }
      
    } catch (error) {
      console.error(`❌ Erreur avec ${file}:`, error.message)
    }
  }
  
  console.log(`\n✅ Correction terminée : ${totalFixed} titres corrigés`)
}

fixTitles().catch(console.error)
