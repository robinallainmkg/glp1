// Script de suivi des données utilisateurs et analytics
// À exécuter périodiquement pour analyser les données collectées

import fs from 'node:fs';
import path from 'node:path';

/**
 * Script de récupération et analyse des données utilisateurs
 * Ce script vous aide à récupérer et analyser les données collectées via les formulaires
 */

class UserDataAnalyzer {
  constructor() {
    this.dataDir = path.join(process.cwd(), 'user-data');
    this.ensureDataDirectory();
  }

  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Simulation de données collectées (à remplacer par l'API Netlify)
   */
  async fetchNetlifyFormData() {
    console.log('📊 Récupération des données des formulaires Netlify...');
    
    // Note: Pour récupérer les vraies données, vous devrez utiliser l'API Netlify
    // https://docs.netlify.com/api/get-started/
    // Voici comment vous pourriez le faire:
    
    /*
    const NETLIFY_ACCESS_TOKEN = process.env.NETLIFY_ACCESS_TOKEN;
    const SITE_ID = process.env.NETLIFY_SITE_ID;
    
    const response = await fetch(`https://api.netlify.com/api/v1/sites/${SITE_ID}/forms`, {
      headers: {
        'Authorization': `Bearer ${NETLIFY_ACCESS_TOKEN}`
      }
    });
    
    const forms = await response.json();
    */
    
    // Données simulées pour le développement
    return {
      contact: [
        {
          id: '1',
          submitted_at: '2025-08-15T10:30:00Z',
          data: {
            name: 'Marie Dubois',
            email: 'marie.dubois@email.com',
            subject: 'question-generale',
            message: 'Question sur Ozempic',
            newsletter: 'on'
          }
        },
        {
          id: '2', 
          submitted_at: '2025-08-15T14:20:00Z',
          data: {
            name: 'Pierre Martin',
            email: 'pierre.martin@email.com',
            subject: 'prix-achat',
            message: 'Où acheter Wegovy ?',
            newsletter: ''
          }
        }
      ],
      newsletter: [
        {
          id: '3',
          submitted_at: '2025-08-15T09:15:00Z',
          data: {
            email: 'sophie.laurent@email.com'
          }
        },
        {
          id: '4',
          submitted_at: '2025-08-15T16:45:00Z',
          data: {
            email: 'jean.michel@email.com'
          }
        }
      ],
      'beauty-guide': [
        {
          id: '5',
          submitted_at: '2025-08-15T11:20:00Z',
          data: {
            firstName: 'Sylvie',
            email: 'sylvie.martin@email.com',
            treatment: 'wegovy',
            concerns: ['peau-seche', 'elasticite-peau'],
            newsletter_consent: 'on'
          }
        },
        {
          id: '6',
          submitted_at: '2025-08-15T15:30:00Z',
          data: {
            firstName: 'Christine',
            email: 'christine.r@email.com',
            treatment: 'ozempic',
            concerns: ['fatigue-teint', 'perte-cheveux'],
            newsletter_consent: 'on'
          }
        }
      ]
    };
  }

  /**
   * Analyse les données collectées
   */
  analyzeData(formData) {
    console.log('📈 Analyse des données utilisateurs...\n');

    const analysis = {
      contact: {
        total: formData.contact.length,
        withNewsletter: formData.contact.filter(item => item.data.newsletter).length,
        subjects: {}
      },
      newsletter: {
        total: formData.newsletter.length,
        uniqueEmails: new Set()
      },
      'beauty-guide': {
        total: formData['beauty-guide']?.length || 0,
        treatments: {},
        concerns: {},
        withNewsletter: formData['beauty-guide']?.filter(item => item.data.newsletter_consent).length || 0
      },
      allEmails: new Set()
    };

    // Analyse des sujets de contact
    formData.contact.forEach(item => {
      const subject = item.data.subject;
      analysis.contact.subjects[subject] = (analysis.contact.subjects[subject] || 0) + 1;
      analysis.allEmails.add(item.data.email);
    });

    // Collecte des emails newsletter
    formData.newsletter.forEach(item => {
      analysis.newsletter.uniqueEmails.add(item.data.email);
      analysis.allEmails.add(item.data.email);
    });

    // Analyse du guide beauté
    if (formData['beauty-guide']) {
      formData['beauty-guide'].forEach(item => {
        analysis.allEmails.add(item.data.email);
        
        // Analyse des traitements d'intérêt
        if (item.data.treatment) {
          const treatment = item.data.treatment;
          analysis['beauty-guide'].treatments[treatment] = (analysis['beauty-guide'].treatments[treatment] || 0) + 1;
        }
        
        // Analyse des préoccupations beauté
        if (item.data.concerns) {
          const concerns = Array.isArray(item.data.concerns) ? item.data.concerns : [item.data.concerns];
          concerns.forEach(concern => {
            analysis['beauty-guide'].concerns[concern] = (analysis['beauty-guide'].concerns[concern] || 0) + 1;
          });
        }
      });
    }

    return analysis;
  }

  /**
   * Génère un rapport détaillé
   */
  generateReport(analysis) {
    const report = `
# 📊 Rapport d'Analyse - GLP-1 France
## Généré le ${new Date().toLocaleDateString('fr-FR')}

## 📧 Résumé des Emails Collectés
- **Total unique:** ${analysis.allEmails.size} adresses email
- **Via formulaire contact:** ${analysis.contact.total} (dont ${analysis.contact.withNewsletter} ont accepté la newsletter)
- **Via newsletter directe:** ${analysis.newsletter.uniqueEmails.size}
- **Via guide beauté:** ${analysis['beauty-guide'].total} (dont ${analysis['beauty-guide'].withNewsletter} ont accepté la newsletter)

## 📞 Formulaire de Contact
### Répartition par sujet:
${Object.entries(analysis.contact.subjects)
  .map(([subject, count]) => `- **${subject}:** ${count} message(s)`)
  .join('\n')}

## 📖 Guide Beauté - Analyse
### Traitements d'intérêt:
${Object.entries(analysis['beauty-guide'].treatments || {})
  .map(([treatment, count]) => `- **${treatment}:** ${count} téléchargement(s)`)
  .join('\n') || '- Aucune donnée'}

### Préoccupations beauté les plus courantes:
${Object.entries(analysis['beauty-guide'].concerns || {})
  .sort((a,b) => b[1] - a[1])
  .map(([concern, count]) => `- **${concern}:** ${count} mention(s)`)
  .join('\n') || '- Aucune donnée'}

## 📈 Recommandations
1. **Sujet le plus demandé:** ${Object.entries(analysis.contact.subjects).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
2. **Traitement le plus recherché:** ${Object.entries(analysis['beauty-guide'].treatments || {}).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
3. **Préoccupation beauté #1:** ${Object.entries(analysis['beauty-guide'].concerns || {}).sort((a,b) => b[1] - a[1])[0]?.[0] || 'N/A'}
4. **Taux de conversion newsletter (contact):** ${((analysis.contact.withNewsletter / analysis.contact.total) * 100).toFixed(1)}%
5. **Taux de conversion newsletter (guide):** ${analysis['beauty-guide'].total > 0 ? ((analysis['beauty-guide'].withNewsletter / analysis['beauty-guide'].total) * 100).toFixed(1) : 0}%

## 🎯 Actions suggérées:
- Créer du contenu sur les sujets les plus demandés
- Développer des guides spécifiques aux préoccupations beauté principales
- Optimiser les formulaires selon les traitements les plus recherchés
- Segmenter les emails par centres d'intérêt (beauté, prix, médical, etc.)

## 📋 Liste des Emails pour Export
${Array.from(analysis.allEmails).map(email => `- ${email}`).join('\n')}
`;

    return report;
  }

  /**
   * Sauvegarde les données et rapports
   */
  saveData(formData, analysis, report) {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Sauvegarde des données brutes
    fs.writeFileSync(
      path.join(this.dataDir, `raw-data-${timestamp}.json`),
      JSON.stringify(formData, null, 2)
    );

    // Sauvegarde de l'analyse
    fs.writeFileSync(
      path.join(this.dataDir, `analysis-${timestamp}.json`),
      JSON.stringify(analysis, null, 2)
    );

    // Sauvegarde du rapport
    fs.writeFileSync(
      path.join(this.dataDir, `report-${timestamp}.md`),
      report
    );

    // Export CSV des emails
    const emailList = Array.from(analysis.allEmails).join('\n');
    fs.writeFileSync(
      path.join(this.dataDir, `emails-${timestamp}.csv`),
      'email\n' + emailList
    );

    console.log(`💾 Données sauvegardées dans ${this.dataDir}/`);
  }

  /**
   * Génère une liste d'emails pour services tiers (Mailchimp, etc.)
   */
  generateEmailExports(analysis) {
    const exports = {
      // Format Mailchimp
      mailchimp: Array.from(analysis.allEmails).map(email => ({
        email_address: email,
        status: 'subscribed',
        tags: ['GLP1-France', 'Website-Signup']
      })),
      
      // Format ConvertKit
      convertkit: Array.from(analysis.allEmails).map(email => ({
        email: email,
        tags: ['glp1-france', 'website-signup']
      })),
      
      // Format simple CSV
      csv: 'Email,Source,Date\n' + Array.from(analysis.allEmails).map(email => 
        `${email},Website,${new Date().toISOString().split('T')[0]}`
      ).join('\n')
    };

    // Sauvegarder les exports
    Object.entries(exports).forEach(([format, data]) => {
      const fileName = `export-${format}-${new Date().toISOString().split('T')[0]}.json`;
      fs.writeFileSync(
        path.join(this.dataDir, fileName),
        typeof data === 'string' ? data : JSON.stringify(data, null, 2)
      );
    });

    console.log('📤 Exports générés pour: Mailchimp, ConvertKit, CSV');
    return exports;
  }

  /**
   * Fonction principale
   */
  async run() {
    try {
      console.log('🚀 Démarrage de l\'analyse des données utilisateurs\n');

      // 1. Récupérer les données
      const formData = await this.fetchNetlifyFormData();

      // 2. Analyser
      const analysis = this.analyzeData(formData);

      // 3. Générer le rapport
      const report = this.generateReport(analysis);

      // 4. Sauvegarder
      this.saveData(formData, analysis, report);

      // 5. Générer les exports
      this.generateEmailExports(analysis);

      // 6. Afficher le résumé
      console.log('\n📊 RÉSUMÉ:');
      console.log(`📧 Total emails collectés: ${analysis.allEmails.size}`);
      console.log(`📞 Messages de contact: ${analysis.contact.total}`);
      console.log(`📰 Inscriptions newsletter: ${analysis.newsletter.uniqueEmails.size}`);
      console.log(`\n📄 Rapport complet: user-data/report-${new Date().toISOString().split('T')[0]}.md`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse:', error);
    }
  }
}

// Instructions d'utilisation
console.log(`
📋 INSTRUCTIONS D'UTILISATION:

1. **Configuration Netlify API (optionnel pour données réelles):**
   - Aller dans Netlify Dashboard > User settings > Personal access tokens
   - Créer un token et l'ajouter dans .env: NETLIFY_ACCESS_TOKEN=your_token
   - Ajouter votre SITE_ID dans .env: NETLIFY_SITE_ID=your_site_id

2. **Récupération manuelle des données:**
   - Aller dans Netlify Dashboard > Site > Forms
   - Télécharger les CSV des soumissions
   - Les placer dans ./user-data/

3. **Exécution de ce script:**
   - npm run analyze-users  (à ajouter dans package.json)
   - ou: node scripts/user-data-analyzer.mjs

4. **Utilisation des exports:**
   - Importer les fichiers CSV dans Mailchimp/ConvertKit
   - Utiliser les JSON pour des intégrations API

💡 TIP: Exécutez ce script chaque semaine pour suivre l'évolution !
`);

// Exécution si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const analyzer = new UserDataAnalyzer();
  analyzer.run();
}

export { UserDataAnalyzer };
