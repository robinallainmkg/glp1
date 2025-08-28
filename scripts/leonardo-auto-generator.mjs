#!/usr/bin/env node

/**
 * Générateur automatique d'images via API Leonardo.AI
 * Traite tous les articles SVG et génère les images automatiquement
 */

import fs from 'fs/promises';
import path from 'path';
import https from 'https';

// Configuration API Leonardo.AI
const LEONARDO_API_KEY = process.env.LEONARDO_API_KEY || '';
const LEONARDO_API_BASE = 'https://cloud.leonardo.ai/api/rest/v1';

// Modèles Leonardo recommandés
const LEONARDO_MODELS = {
  'medicaments-glp1': 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Phoenix
  'glp1-perte-de-poids': 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Diffusion XL
  : 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Phoenix
  'regime-glp1': 'b24e16ff-06e3-43eb-8d33-4416c2d75876', // Leonardo Diffusion XL
  'glp1-cout': 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Phoenix
  'medecins-glp1-france': 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Phoenix
  'recherche-glp1': 'aa77f04e-3eec-4034-9c07-d0f619684628' // Leonardo Phoenix
};

const progressFile = 'scripts/leonardo-api-progress.json';
const logFile = 'scripts/leonardo-api.log';

class LeonardoGenerator {
  constructor() {
    this.apiKey = LEONARDO_API_KEY;
    this.baseUrl = LEONARDO_API_BASE;
    this.requestDelay = 2000; // 2 secondes entre les requêtes
    this.maxRetries = 3;
  }

  async log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;
    console.log(message);
    await fs.appendFile(logFile, logMessage);
  }

  async apiRequest(endpoint, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.baseUrl);
      const options = {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      };

      const req = https.request(url, options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });
        
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsed);
            } else {
              reject(new Error(`API Error ${res.statusCode}: ${parsed.error || responseData}`));
            }
          } catch (e) {
            reject(new Error(`Parse Error: ${responseData}`));
          }
        });
      });

      req.on('error', reject);
      
      if (data) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async generateImage(prompt, collection, filename) {
    try {
      await this.log(`🎨 Génération: ${filename}`);
      
      const modelId = LEONARDO_MODELS[collection] || LEONARDO_MODELS['medicaments-glp1'];
      
      const payload = {
        height: 576,
        width: 1024,
        modelId: modelId,
        prompt: prompt,
        negative_prompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces, logos, branding',
        num_images: 1,
        guidance_scale: 7,
        seed: Math.floor(Math.random() * 1000000),
        presetStyle: 'DYNAMIC',
        scheduler: 'DPM_SOLVER',
        public: false,
        promptMagic: true
      };

      // Créer la génération
      const generation = await this.apiRequest('/generations', 'POST', payload);
      const generationId = generation.sdGenerationJob.generationId;
      
      await this.log(`⏳ Génération créée: ${generationId}`);
      
      // Attendre que la génération soit terminée
      let attempts = 0;
      let completed = false;
      let imageUrl = null;

      while (!completed && attempts < 30) { // 30 tentatives max (5 minutes)
        await new Promise(resolve => setTimeout(resolve, 10000)); // Attendre 10 secondes
        
        try {
          const status = await this.apiRequest(`/generations/${generationId}`);
          
          if (status.generations_by_pk?.status === 'COMPLETE') {
            completed = true;
            imageUrl = status.generations_by_pk.generated_images[0]?.url;
            await this.log(`✅ Génération terminée: ${filename}`);
          } else if (status.generations_by_pk?.status === 'FAILED') {
            throw new Error(`Génération échouée pour ${filename}`);
          } else {
            await this.log(`⏳ En cours... ${filename} (${attempts + 1}/30)`);
          }
        } catch (error) {
          await this.log(`⚠️  Erreur status: ${error.message}`);
        }
        
        attempts++;
      }

      if (!completed || !imageUrl) {
        throw new Error(`Timeout ou échec pour ${filename}`);
      }

      // Télécharger l'image
      await this.downloadImage(imageUrl, filename);
      await this.log(`💾 Image sauvegardée: ${filename}`);
      
      return true;

    } catch (error) {
      await this.log(`❌ Erreur génération ${filename}: ${error.message}`);
      return false;
    }
  }

  async downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
      const filePath = path.join('public/images/thumbnails', filename);
      const file = require('fs').createWriteStream(filePath);
      
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (error) => {
        require('fs').unlink(filePath, () => {}); // Supprimer le fichier partiel
        reject(error);
      });
    });
  }

  async loadArticles() {
    try {
      const content = await fs.readFile('scripts/grok-prompts-articles-svg.txt', 'utf-8');
      const lines = content.split('\n');
      
      const articles = [];
      let currentCollection = '';
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('## 📁 Collection:')) {
          currentCollection = line.split(':')[1].trim();
        }
        
        if (line.startsWith('PROMPT GROK POUR:')) {
          const title = line.replace('PROMPT GROK POUR:', '').trim();
          const filename = title.toLowerCase().replace(/[^a-z0-9]/g, '-') + '.jpg';
          
          // Trouver le prompt détaillé
          let prompt = '';
          for (let j = i + 1; j < lines.length && j < i + 15; j++) {
            if (lines[j].trim().startsWith('Créer une image')) {
              prompt = `Professional medical illustration about ${title}, ${lines[j].trim().replace(/Créer une image /i, '').replace(/représentant /i, '')}, ultra-high quality, photorealistic, medical grade, clean composition, no text, no people, medical professional style`;
              break;
            }
          }
          
          if (prompt) {
            articles.push({
              title,
              collection: currentCollection,
              filename,
              prompt: prompt.substring(0, 1000) // Limiter la taille
            });
          }
        }
      }
      
      return articles;
    } catch (error) {
      await this.log(`❌ Erreur chargement articles: ${error.message}`);
      return [];
    }
  }

  async loadProgress() {
    try {
      const content = await fs.readFile(progressFile, 'utf-8');
      return JSON.parse(content);
    } catch {
      return {
        startTime: new Date().toISOString(),
        completed: [],
        failed: [],
        remaining: 0,
        totalCreditsUsed: 0
      };
    }
  }

  async saveProgress(progress) {
    await fs.writeFile(progressFile, JSON.stringify(progress, null, 2));
  }

  async run() {
    if (!this.apiKey) {
      await this.log('❌ LEONARDO_API_KEY manquante !');
      await this.log('📋 Pour obtenir votre clé API:');
      await this.log('   1. Aller sur leonardo.ai');
      await this.log('   2. Se connecter à votre compte');
      await this.log('   3. Aller dans Settings > API Access');
      await this.log('   4. Générer une nouvelle clé API');
      await this.log('   5. Exporter: export LEONARDO_API_KEY="votre-cle-ici"');
      return;
    }

    await this.log('🚀 Début génération automatique Leonardo.AI');
    
    const articles = await this.loadArticles();
    let progress = await this.loadProgress();
    
    await this.log(`📊 Total articles: ${articles.length}`);
    await this.log(`✅ Déjà terminés: ${progress.completed.length}`);
    
    // Filtrer les articles non terminés
    const remaining = articles.filter(article => 
      !progress.completed.includes(article.filename) &&
      !progress.failed.includes(article.filename)
    );
    
    // Trier par priorité (médicaments en premier)
    const priorityOrder = ['medicaments-glp1', 'glp1-perte-de-poids', 'regime-glp1', 'glp1-cout', 'medecins-glp1-france', 'recherche-glp1'];
    remaining.sort((a, b) => {
      const priorityA = priorityOrder.indexOf(a.collection);
      const priorityB = priorityOrder.indexOf(b.collection);
      return priorityA - priorityB;
    });
    
    await this.log(`⏳ À traiter: ${remaining.length}`);
    
    for (let i = 0; i < remaining.length; i++) {
      const article = remaining[i];
      
      await this.log(`\n📊 Progression: ${i + 1}/${remaining.length}`);
      await this.log(`🎯 Collection: ${article.collection}`);
      
      const success = await this.generateImage(article.prompt, article.collection, article.filename);
      
      if (success) {
        progress.completed.push(article.filename);
        progress.totalCreditsUsed += 1;
      } else {
        progress.failed.push(article.filename);
      }
      
      await this.saveProgress(progress);
      
      // Pause entre les générations
      if (i < remaining.length - 1) {
        await this.log(`⏸️  Pause ${this.requestDelay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, this.requestDelay));
      }
    }
    
    await this.log('\n🎉 GÉNÉRATION TERMINÉE !');
    await this.log(`✅ Succès: ${progress.completed.length}`);
    await this.log(`❌ Échecs: ${progress.failed.length}`);
    await this.log(`💳 Crédits utilisés: ${progress.totalCreditsUsed}`);
  }
}

// Exécution
const generator = new LeonardoGenerator();
generator.run().catch(console.error);
