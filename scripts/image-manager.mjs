import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Statistiques des images
function getImageStats() {
  const thumbnailsDir = path.join(__dirname, '..', 'public', 'images', 'thumbnails');
  const files = fs.readdirSync(thumbnailsDir);
  
  const svgFiles = files.filter(file => file.endsWith('.svg'));
  const aiFiles = files.filter(file => file.endsWith('-illus.jpg'));
  
  console.log('📊 Statistiques des images:');
  console.log(`   📁 Total fichiers: ${files.length}`);
  console.log(`   🎨 Images SVG: ${svgFiles.length}`);
  console.log(`   🤖 Images AI: ${aiFiles.length}`);
  console.log(`   📈 Couverture AI: ${Math.round((aiFiles.length / svgFiles.length) * 100)}%`);
  
  return { total: files.length, svg: svgFiles.length, ai: aiFiles.length };
}

// Tester la disponibilité des images pour un article
function testImageAvailability(articleSlug) {
  const thumbnailsDir = path.join(__dirname, '..', 'public', 'images', 'thumbnails');
  
  const svgPath = path.join(thumbnailsDir, `${articleSlug}.svg`);
  const aiPath = path.join(thumbnailsDir, `${articleSlug}-illus.jpg`);
  
  const svgExists = fs.existsSync(svgPath);
  const aiExists = fs.existsSync(aiPath);
  
  console.log(`🔍 Test pour l'article: ${articleSlug}`);
  console.log(`   🎨 SVG: ${svgExists ? '✅ Disponible' : '❌ Manquant'}`);
  console.log(`   🤖 AI: ${aiExists ? '✅ Disponible' : '❌ Manquant'}`);
  
  if (svgExists && aiExists) {
    console.log(`   🎯 Recommandation: Utilise l'image AI par défaut avec fallback SVG`);
  } else if (svgExists) {
    console.log(`   💡 Recommandation: Génère une image AI pour cet article`);
  } else {
    console.log(`   ⚠️  Problème: Aucune image disponible !`);
  }
  
  return { svg: svgExists, ai: aiExists };
}

// Lister les articles avec et sans images AI
function listImageStatus() {
  const thumbnailsDir = path.join(__dirname, '..', 'public', 'images', 'thumbnails');
  const files = fs.readdirSync(thumbnailsDir);
  
  const svgFiles = files.filter(file => file.endsWith('.svg')).map(f => f.replace('.svg', ''));
  const aiFiles = files.filter(file => file.endsWith('-illus.jpg')).map(f => f.replace('-illus.jpg', ''));
  
  const withAI = svgFiles.filter(article => aiFiles.includes(article));
  const withoutAI = svgFiles.filter(article => !aiFiles.includes(article));
  
  console.log('\n✅ Articles avec images AI (prêts):');
  withAI.slice(0, 10).forEach((article, i) => {
    console.log(`   ${i + 1}. ${article}`);
  });
  if (withAI.length > 10) {
    console.log(`   ... et ${withAI.length - 10} autres`);
  }
  
  console.log('\n⏳ Articles sans images AI (à générer):');
  withoutAI.slice(0, 15).forEach((article, i) => {
    console.log(`   ${i + 1}. ${article}`);
  });
  if (withoutAI.length > 15) {
    console.log(`   ... et ${withoutAI.length - 15} autres`);
  }
  
  return { withAI, withoutAI };
}

// Créer un rapport HTML pour visualiser
function generateImageReport() {
  const stats = getImageStats();
  const status = listImageStatus();
  
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport Images GLP-1</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-number { font-size: 2em; font-weight: bold; }
        .image-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .image-card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background: white; }
        .image-card img { width: 100%; height: 150px; object-fit: cover; }
        .image-info { padding: 15px; }
        .status-ai { color: #10b981; font-weight: bold; }
        .status-svg { color: #f59e0b; font-weight: bold; }
        .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; margin: 20px 0; }
        .progress-fill { background: linear-gradient(90deg, #10b981, #059669); height: 100%; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Rapport Images GLP-1</h1>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div>Fichiers Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.ai}</div>
                <div>Images AI</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${stats.svg}</div>
                <div>Images SVG</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round((stats.ai / stats.svg) * 100)}%</div>
                <div>Couverture AI</div>
            </div>
        </div>
        
        <h2>📈 Progression</h2>
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${(stats.ai / stats.svg) * 100}%"></div>
        </div>
        <p>${stats.ai} sur ${stats.svg} articles ont des images AI</p>
        
        <h2>✅ Articles avec Images AI</h2>
        <div class="image-grid">
            ${status.withAI.slice(0, 12).map(article => `
                <div class="image-card">
                    <img src="/images/thumbnails/${article}-illus.jpg" alt="${article}" onerror="this.src='/images/thumbnails/${article}.svg'">
                    <div class="image-info">
                        <h3>${article}</h3>
                        <span class="status-ai">🤖 Image AI</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <h2>⏳ Prochains Articles à Traiter</h2>
        <ul>
            ${status.withoutAI.slice(0, 20).map(article => `
                <li>${article} <span class="status-svg">📄 SVG seulement</span></li>
            `).join('')}
        </ul>
        
        <p><em>Rapport généré le ${new Date().toLocaleString('fr-FR')}</em></p>
    </div>
</body>
</html>`;
  
  const reportPath = path.join(__dirname, '..', 'public', 'image-report.html');
  fs.writeFileSync(reportPath, html, 'utf8');
  
  console.log(`\n📄 Rapport HTML généré: /image-report.html`);
  console.log(`   Accès: http://localhost:4323/image-report.html`);
}

// Menu principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('🎯 Gestionnaire d\'images GLP-1\n');
    getImageStats();
    listImageStatus();
    generateImageReport();
  } else if (args[0] === 'test') {
    if (args[1]) {
      testImageAvailability(args[1]);
    } else {
      console.log('Usage: node scripts/image-manager.mjs test [nom-article]');
    }
  } else if (args[0] === 'report') {
    generateImageReport();
  } else {
    console.log('Commandes disponibles:');
    console.log('  node scripts/image-manager.mjs           # Rapport complet');
    console.log('  node scripts/image-manager.mjs test [article]  # Tester un article');
    console.log('  node scripts/image-manager.mjs report    # Générer rapport HTML');
  }
}

main();
