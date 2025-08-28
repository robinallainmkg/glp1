#!/usr/bin/env node

/**
 * Test de l'API Leonardo.AI
 * Vérifie la configuration et génère une image de test
 */

import fs from 'fs/promises';
import https from 'https';

class LeonardoAPITest {
  constructor() {
    this.apiKey = process.env.LEONARDO_API_KEY || '';
    this.baseUrl = 'https://cloud.leonardo.ai/api/rest/v1';
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
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, data: responseData });
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

  async testConfiguration() {
    console.log('🧪 TEST API LEONARDO.AI\n');
    
    // 1. Vérifier la clé API
    if (!this.apiKey) {
      console.log('❌ CLÉ API MANQUANTE');
      console.log('   Lancez: node scripts/setup-leonardo-api.mjs\n');
      return false;
    }
    
    console.log(`🔑 Clé API: ${this.apiKey.substring(0, 10)}...`);
    
    // 2. Tester l'authentification
    try {
      console.log('🔐 Test authentification...');
      const authTest = await this.apiRequest('/me');
      
      if (authTest.status === 200) {
        console.log('✅ Authentification réussie !');
        console.log(`👤 Utilisateur: ${authTest.data.user?.username || 'Anonyme'}`);
        console.log(`💳 Crédits disponibles: ${authTest.data.user?.tokenRenewalDate ? 'Visible sur leonardo.ai' : 'À vérifier'}`);
      } else {
        console.log(`❌ Échec authentification (${authTest.status})`);
        console.log('   Vérifiez votre clé API sur leonardo.ai\n');
        return false;
      }
    } catch (error) {
      console.log(`❌ Erreur connexion: ${error.message}`);
      return false;
    }
    
    // 3. Tester la génération d'une image simple
    console.log('\n🎨 Test génération d\'image...');
    try {
      const testPrompt = {
        height: 576,
        width: 1024,
        modelId: 'aa77f04e-3eec-4034-9c07-d0f619684628', // Leonardo Phoenix
        prompt: 'Professional medical illustration, blue and white medical syringe, clean pharmaceutical design, no text, no people',
        negative_prompt: 'cartoon, anime, low quality, blurry, text, watermark, people, faces',
        num_images: 1,
        guidance_scale: 7,
        public: false,
        promptMagic: true
      };
      
      const generation = await this.apiRequest('/generations', 'POST', testPrompt);
      
      if (generation.status === 200) {
        console.log('✅ Génération lancée avec succès !');
        console.log(`🆔 ID: ${generation.data.sdGenerationJob?.generationId}`);
        console.log('⏳ La génération prend ~30-60 secondes...');
        
        // Optionnel: attendre et vérifier le résultat
        if (generation.data.sdGenerationJob?.generationId) {
          await this.waitForGeneration(generation.data.sdGenerationJob.generationId);
        }
        
      } else {
        console.log(`❌ Échec génération (${generation.status})`);
        console.log(`   Réponse: ${JSON.stringify(generation.data, null, 2)}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ Erreur génération: ${error.message}`);
      return false;
    }
    
    return true;
  }

  async waitForGeneration(generationId) {
    console.log('\n⏳ Attente du résultat...');
    
    for (let i = 0; i < 12; i++) { // 2 minutes max
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10 secondes
      
      try {
        const status = await this.apiRequest(`/generations/${generationId}`);
        
        if (status.data.generations_by_pk?.status === 'COMPLETE') {
          console.log('✅ Image générée avec succès !');
          const imageUrl = status.data.generations_by_pk.generated_images?.[0]?.url;
          if (imageUrl) {
            console.log(`🖼️  URL: ${imageUrl.substring(0, 50)}...`);
            console.log('📥 Vous pouvez télécharger cette image de test');
          }
          return;
        } else if (status.data.generations_by_pk?.status === 'FAILED') {
          console.log('❌ Génération échouée');
          return;
        } else {
          console.log(`⏳ En cours... (${i + 1}/12)`);
        }
      } catch (error) {
        console.log(`⚠️  Erreur vérification: ${error.message}`);
      }
    }
    
    console.log('⏰ Timeout - vérifiez manuellement sur leonardo.ai');
  }

  async run() {
    const success = await this.testConfiguration();
    
    if (success) {
      console.log('\n🎉 CONFIGURATION PARFAITE !');
      console.log('🚀 Vous pouvez maintenant lancer:');
      console.log('   node scripts/leonardo-auto-generator.mjs');
      console.log('\n📊 Cela générera automatiquement vos 96 images !');
    } else {
      console.log('\n❌ CONFIGURATION INCOMPLÈTE');
      console.log('📋 Lancez d\'abord:');
      console.log('   node scripts/setup-leonardo-api.mjs');
    }
  }
}

// Exécution
const tester = new LeonardoAPITest();
tester.run().catch(console.error);
