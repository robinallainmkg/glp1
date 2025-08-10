// 🚀 Test limité de l'analyse SEO
import fs from 'fs';
import path from 'path';

console.log('🚀 === TEST ANALYSE SEO LIMITÉE ===');

// Import des classes localement
class SimpleKeywordMapper {
  constructor() {
    this.contentDir = 'src/content';
    this.priorityKeywords = [
      'ozempic prix', 'wegovy prix', 'saxenda prix', 
      'glp-1 perte de poids', 'glp1 perte de poids', 'perte de poids',
      'medicament pour maigrir', 'glp-1', 'glp1',
      'ozempic', 'wegovy', 'saxenda', 'mounjaro',
      'glp-1 diabete', 'glp1 diabete', 'medecin glp-1'
    ];
    this.pageInventory = new Map();
  }

  extractFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\r?\n(.*?)\r?\n---/s);
    if (!frontmatterMatch) return {};
    
    try {
      const frontmatter = {};
      const lines = frontmatterMatch[1].split(/\r?\n/);
      
      for (const line of lines) {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          let value = match[2].trim();
          if ((value.startsWith('"') && value.endsWith('"')) || 
              (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
          }
          frontmatter[match[1]] = value;
        }
      }
      
      return frontmatter;
    } catch (error) {
      return {};
    }
  }

  extractBody(content) {
    const bodyMatch = content.match(/^---\r?\n.*?\r?\n---\r?\n(.*)$/s);
    return bodyMatch ? bodyMatch[1] : content;
  }

  detectKeywords(frontmatter, body) {
    const detected = [];
    const fullText = ((frontmatter.title || '') + ' ' + (frontmatter.description || '') + ' ' + body).toLowerCase();
    
    for (const keyword of this.priorityKeywords) {
      if (fullText.includes(keyword.toLowerCase())) {
        detected.push({
          keyword,
          inTitle: (frontmatter.title || '').toLowerCase().includes(keyword.toLowerCase()),
          inDescription: (frontmatter.description || '').toLowerCase().includes(keyword.toLowerCase()),
          mentions: (fullText.match(new RegExp(keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
        });
      }
    }
    
    return detected;
  }

  analyzeFile(filePath) {
    try {
      console.log(`   📄 Analyse: ${path.basename(filePath)}`);
      
      const content = fs.readFileSync(filePath, 'utf-8');
      const frontmatter = this.extractFrontmatter(content);
      const body = this.extractBody(content);
      
      const keywords = this.detectKeywords(frontmatter, body);
      
      const pageData = {
        filePath,
        title: frontmatter.title || 'Sans titre',
        description: frontmatter.description || '',
        keywords: keywords,
        wordCount: body.split(/\s+/).length
      };
      
      this.pageInventory.set(filePath, pageData);
      
      return pageData;
    } catch (error) {
      console.warn(`⚠️ Erreur ${filePath}:`, error.message);
      return null;
    }
  }

  scanLimited(maxFiles = 5) {
    console.log(`📍 Scan limité (max ${maxFiles} fichiers)...`);
    
    // Prendre juste quelques fichiers pour tester
    const contentFiles = [];
    const dirs = ['alternatives-glp1', 'glp1-perte-de-poids', 'glp1-cout'];
    
    for (const dir of dirs) {
      const fullDir = path.join(this.contentDir, dir);
      if (fs.existsSync(fullDir)) {
        const files = fs.readdirSync(fullDir)
          .filter(file => file.endsWith('.md'))
          .slice(0, 2) // Max 2 par dossier
          .map(file => path.join(fullDir, file));
        contentFiles.push(...files);
        
        if (contentFiles.length >= maxFiles) break;
      }
    }
    
    console.log(`📄 ${contentFiles.length} fichiers à analyser`);
    
    // Analyser chaque fichier
    const results = [];
    for (const file of contentFiles) {
      const result = this.analyzeFile(file);
      if (result) results.push(result);
    }
    
    return results;
  }

  generateReport(results) {
    console.log('\n📊 === RAPPORT ===');
    console.log(`📄 Pages analysées: ${results.length}`);
    
    // Compter les mots-clés détectés
    const allKeywords = new Set();
    results.forEach(page => {
      page.keywords.forEach(kw => allKeywords.add(kw.keyword));
    });
    
    console.log(`🔍 Mots-clés uniques détectés: ${allKeywords.size}`);
    
    // Afficher le top des pages
    console.log('\n🏆 TOP PAGES:');
    results
      .sort((a, b) => b.keywords.length - a.keywords.length)
      .slice(0, 3)
      .forEach(page => {
        console.log(`   📝 ${page.title}`);
        console.log(`      Mots-clés: ${page.keywords.length}`);
        console.log(`      Mots: ${page.wordCount}`);
        if (page.keywords.length > 0) {
          console.log(`      Top mot-clé: ${page.keywords[0].keyword}`);
        }
        console.log('');
      });
    
    // Afficher les mots-clés les plus fréquents
    const keywordCount = {};
    results.forEach(page => {
      page.keywords.forEach(kw => {
        keywordCount[kw.keyword] = (keywordCount[kw.keyword] || 0) + 1;
      });
    });
    
    console.log('🎯 MOTS-CLÉS LES PLUS FRÉQUENTS:');
    Object.entries(keywordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([keyword, count]) => {
        console.log(`   🔑 ${keyword}: ${count} pages`);
      });
  }
}

// Exécution du test
try {
  const mapper = new SimpleKeywordMapper();
  const results = mapper.scanLimited(10);
  mapper.generateReport(results);
  
  console.log('\n✅ Test terminé avec succès !');
  
} catch (error) {
  console.error('❌ Erreur:', error);
}
