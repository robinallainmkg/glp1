import fs from 'fs';
import path from 'path';

/**
 * Générateur d'images SVG pour les articles GLP-1
 */
class ImageGenerator {
  constructor() {
    this.outputDir = './public/images/articles';
    this.illustrationsDir = './public/images/illustrations';
    
    // Créer les dossiers s'ils n'existent pas
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    if (!fs.existsSync(this.illustrationsDir)) {
      fs.mkdirSync(this.illustrationsDir, { recursive: true });
    }
  }

  /**
   * Créer une image d'article avec titre
   */
  createArticleImage(title, filename, category = 'general') {
    const colors = {
      'medicaments': '#059669', // Vert médical
      'cout': '#dc2626', // Rouge prix
      'effets': '#ea580c', // Orange attention
      'perte-poids': '#7c3aed', // Violet transformation
      'diabete': '#2563eb', // Bleu médical
      'general': '#1f2937' // Gris foncé
    };

    const color = colors[category] || colors.general;
    
    const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <!-- Dégradé de fond -->
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#f8fafc;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#e2e8f0;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}aa;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fond -->
  <rect width="1200" height="630" fill="url(#bgGrad)"/>
  
  <!-- Bande décorative -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accentGrad)"/>
  
  <!-- Logo dans le coin -->
  <circle cx="100" cy="100" r="40" fill="${color}" opacity="0.1"/>
  <circle cx="100" cy="100" r="25" fill="${color}"/>
  <rect x="88" y="75" width="24" height="8" fill="#ffffff" rx="2"/>
  <rect x="96" y="67" width="8" height="24" fill="#ffffff" rx="2"/>
  
  <!-- Titre principal -->
  <text x="600" y="280" font-family="Inter, Arial, sans-serif" font-size="48" font-weight="700" 
        fill="#1f2937" text-anchor="middle" dominant-baseline="middle">
    ${this.wrapText(title, 40)}
  </text>
  
  <!-- Sous-titre -->
  <text x="600" y="380" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="500" 
        fill="#6b7280" text-anchor="middle">
    GLP-1 France • Guide Expert
  </text>
  
  <!-- Éléments décoratifs -->
  <circle cx="1050" cy="150" r="80" fill="${color}" opacity="0.05"/>
  <circle cx="150" cy="500" r="60" fill="${color}" opacity="0.08"/>
</svg>`;

    const filepath = path.join(this.outputDir, `${filename}.svg`);
    fs.writeFileSync(filepath, svg.trim());
    console.log(`✅ Image créée: ${filepath}`);
    
    return filepath;
  }

  /**
   * Créer une illustration médicale simple
   */
  createMedicalIllustration(type, filename) {
    const illustrations = {
      'injection': this.createInjectionSVG(),
      'pilule': this.createPillSVG(),
      'docteur': this.createDoctorSVG(),
      'graphique': this.createChartSVG()
    };

    const svg = illustrations[type] || illustrations['pilule'];
    const filepath = path.join(this.illustrationsDir, `${filename}.svg`);
    fs.writeFileSync(filepath, svg);
    console.log(`✅ Illustration créée: ${filepath}`);
    
    return filepath;
  }

  createInjectionSVG() {
    return `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="injectionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1d4ed8;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Corps de la seringue -->
  <rect x="60" y="80" width="80" height="40" fill="url(#injectionGrad)" rx="5"/>
  
  <!-- Aiguille -->
  <rect x="140" y="95" width="30" height="10" fill="#6b7280" rx="2"/>
  
  <!-- Piston -->
  <rect x="40" y="85" width="25" height="30" fill="#374151" rx="3"/>
  
  <!-- Graduations -->
  <line x1="70" y1="85" x2="70" y2="90" stroke="#ffffff" stroke-width="1"/>
  <line x1="80" y1="85" x2="80" y2="90" stroke="#ffffff" stroke-width="1"/>
  <line x1="90" y1="85" x2="90" y2="90" stroke="#ffffff" stroke-width="1"/>
  
  <!-- Texte -->
  <text x="100" y="150" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600" 
        fill="#374151" text-anchor="middle">Injection GLP-1</text>
</svg>`;
  }

  createPillSVG() {
    return `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pillGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#059669;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#ffffff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0891b2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Capsule -->
  <ellipse cx="100" cy="100" rx="60" ry="30" fill="url(#pillGrad)" stroke="#e5e7eb" stroke-width="2"/>
  
  <!-- Ligne de séparation -->
  <line x1="100" y1="70" x2="100" y2="130" stroke="#d1d5db" stroke-width="1"/>
  
  <!-- Texte -->
  <text x="100" y="160" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="600" 
        fill="#374151" text-anchor="middle">Médicament GLP-1</text>
</svg>`;
  }

  /**
   * Fonction utilitaire pour découper le texte
   */
  wrapText(text, maxLength) {
    if (text.length <= maxLength) return text;
    
    const words = text.split(' ');
    let lines = [];
    let currentLine = '';
    
    words.forEach(word => {
      if ((currentLine + word).length <= maxLength) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    
    // Convertir en éléments tspan pour SVG
    return lines.map((line, index) => 
      `<tspan x="600" dy="${index === 0 ? 0 : 60}">${line}</tspan>`
    ).join('');
  }

  /**
   * Génération en lot pour tous les articles
   */
  generateBatch() {
    console.log('🎨 Génération des images d\'articles...');
    
    // Exemples d'images d'articles
    this.createArticleImage('Wegovy Prix en Pharmacie 2024', 'wegovy-prix', 'cout');
    this.createArticleImage('Ozempic Effets Secondaires', 'ozempic-effets', 'effets');
    this.createArticleImage('GLP-1 Perte de Poids Efficace', 'glp1-perte-poids', 'perte-poids');
    this.createArticleImage('Traitement Diabète Type 2', 'diabete-traitement', 'diabete');
    this.createArticleImage('Médicaments GLP-1 Guide', 'medicaments-guide', 'medicaments');
    
    // Illustrations
    this.createMedicalIllustration('injection', 'injection-glp1');
    this.createMedicalIllustration('pilule', 'medicament-oral');
    
    console.log('✅ Génération terminée !');
  }
}

// Utilisation
const generator = new ImageGenerator();

// Génération en lot si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generator.generateBatch();
}

export default ImageGenerator;
