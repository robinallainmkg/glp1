import { readFileSync, writeFileSync } from 'fs'
import { glob } from 'glob'

function cleanDuplicateContent(content) {
  let lines = content.split('\n')
  let cleanedLines = []
  let seenLines = new Set()
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Ignorer les lignes vides
    if (line === '') {
      cleanedLines.push(lines[i])
      continue
    }
    
    // Supprimer les doublons de résumé
    if (line.startsWith('**Résumé :**') && seenLines.has(line)) {
      continue
    }
    
    // Supprimer les doublons d'affiliate-box
    if (line === '[affiliate-box]' && seenLines.has(line)) {
      continue
    }
    
    // Supprimer les phrases de conclusion répétitives
    if (line.includes('Texte de conclusion et rappel de précautions') && seenLines.has(line)) {
      continue
    }
    
    seenLines.add(line)
    cleanedLines.push(lines[i])
  }
  
  // Nettoyer les lignes vides consécutives
  let finalContent = cleanedLines.join('\n')
  finalContent = finalContent.replace(/\n{3,}/g, '\n\n')
  
  return finalContent
}

async function main() {
  console.log('🧹 Suppression du contenu dupliqué...\n')
  
  const files = await glob('src/content/**/*.md')
  let totalCleaned = 0
  
  for (const file of files) {
    try {
      const originalContent = readFileSync(file, 'utf-8')
      const cleanedContent = cleanDuplicateContent(originalContent)
      
      if (originalContent !== cleanedContent) {
        writeFileSync(file, cleanedContent)
        console.log(`✅ ${file.split('/').pop()}`)
        totalCleaned++
      }
    } catch (error) {
      console.log(`❌ Erreur pour ${file}: ${error.message}`)
    }
  }
  
  console.log(`\n📊 Résultats:`)
  console.log(`✅ Fichiers nettoyés: ${totalCleaned}`)
}

main().catch(console.error)
