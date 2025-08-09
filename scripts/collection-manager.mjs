import fs from 'node:fs';
import path from 'node:path';

/**
 * Gestionnaire de Collections pour GLP1 France
 * Fournit les fonctions CRUD pour les collections
 */
export class CollectionManager {
  constructor(collectionsPath = 'data/collections.json', databasePath = 'data/articles-database.json') {
    this.collectionsPath = collectionsPath;
    this.databasePath = databasePath;
  }

  /**
   * Charge les collections
   */
  loadCollections() {
    try {
      const rawData = fs.readFileSync(this.collectionsPath, 'utf-8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      return { collections: [] };
    }
  }

  /**
   * Sauvegarde les collections
   */
  saveCollections(collectionsData) {
    try {
      fs.writeFileSync(this.collectionsPath, JSON.stringify(collectionsData, null, 2));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des collections:', error);
      return false;
    }
  }

  /**
   * Crée une nouvelle collection
   */
  createCollection(collectionData) {
    const collections = this.loadCollections();
    
    // Validation
    if (!collectionData.id || !collectionData.name) {
      throw new Error('ID et nom de collection requis');
    }

    // Vérifier l'unicité de l'ID
    if (collections.collections.find(c => c.id === collectionData.id)) {
      throw new Error(`Collection avec l'ID "${collectionData.id}" existe déjà`);
    }

    // Données par défaut
    const newCollection = {
      id: collectionData.id,
      name: collectionData.name,
      description: collectionData.description || '',
      slug: collectionData.slug || this.generateSlug(collectionData.name),
      icon: collectionData.icon || '📁',
      color: collectionData.color || '#3B82F6',
      template: collectionData.template || 'CollectionLayout',
      keywords: collectionData.keywords || [],
      seo: {
        title: collectionData.seo?.title || `${collectionData.name} - GLP1 France`,
        description: collectionData.seo?.description || collectionData.description,
        keywords: collectionData.seo?.keywords || collectionData.keywords || []
      },
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0'
      }
    };

    collections.collections.push(newCollection);
    
    if (this.saveCollections(collections)) {
      return newCollection;
    } else {
      throw new Error('Erreur lors de la sauvegarde de la collection');
    }
  }

  /**
   * Met à jour une collection existante
   */
  updateCollection(collectionId, updateData) {
    const collections = this.loadCollections();
    const collectionIndex = collections.collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) {
      throw new Error(`Collection "${collectionId}" non trouvée`);
    }

    // Merge des données
    const updatedCollection = {
      ...collections.collections[collectionIndex],
      ...updateData,
      metadata: {
        ...collections.collections[collectionIndex].metadata,
        lastModified: new Date().toISOString()
      }
    };

    collections.collections[collectionIndex] = updatedCollection;
    
    if (this.saveCollections(collections)) {
      return updatedCollection;
    } else {
      throw new Error('Erreur lors de la mise à jour de la collection');
    }
  }

  /**
   * Supprime une collection
   */
  deleteCollection(collectionId) {
    const collections = this.loadCollections();
    const collectionIndex = collections.collections.findIndex(c => c.id === collectionId);
    
    if (collectionIndex === -1) {
      throw new Error(`Collection "${collectionId}" non trouvée`);
    }

    // Vérifier si des articles utilisent cette collection
    const articlesInCollection = this.getArticlesByCollection(collectionId);
    if (articlesInCollection.length > 0) {
      throw new Error(`Impossible de supprimer: ${articlesInCollection.length} article(s) utilisent cette collection`);
    }

    collections.collections.splice(collectionIndex, 1);
    
    if (this.saveCollections(collections)) {
      return true;
    } else {
      throw new Error('Erreur lors de la suppression de la collection');
    }
  }

  /**
   * Obtient une collection par ID
   */
  getCollection(collectionId) {
    const collections = this.loadCollections();
    return collections.collections.find(c => c.id === collectionId);
  }

  /**
   * Obtient toutes les collections
   */
  getAllCollections() {
    return this.loadCollections().collections;
  }

  /**
   * Obtient les articles d'une collection
   */
  getArticlesByCollection(collectionId) {
    try {
      const rawData = fs.readFileSync(this.databasePath, 'utf-8');
      const database = JSON.parse(rawData);
      
      return database.allArticles.filter(article => {
        // Support ancien format (category) et nouveau format (collections array)
        if (article.collections && Array.isArray(article.collections)) {
          return article.collections.includes(collectionId);
        }
        return article.category === collectionId;
      });
    } catch (error) {
      console.error('Erreur lors du chargement des articles:', error);
      return [];
    }
  }

  /**
   * Assigne un article à des collections
   */
  assignArticleToCollections(articleSlug, collectionIds) {
    try {
      const rawData = fs.readFileSync(this.databasePath, 'utf-8');
      const database = JSON.parse(rawData);
      
      const articleIndex = database.allArticles.findIndex(a => a.slug === articleSlug);
      if (articleIndex === -1) {
        throw new Error(`Article "${articleSlug}" non trouvé`);
      }

      // Mettre à jour les collections
      database.allArticles[articleIndex].collections = collectionIds;
      database.allArticles[articleIndex].lastModified = new Date().toISOString();

      // Sauvegarder
      fs.writeFileSync(this.databasePath, JSON.stringify(database, null, 2));
      return database.allArticles[articleIndex];
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      throw error;
    }
  }

  /**
   * Duplique une collection
   */
  duplicateCollection(collectionId, newName) {
    const originalCollection = this.getCollection(collectionId);
    if (!originalCollection) {
      throw new Error(`Collection "${collectionId}" non trouvée`);
    }

    const newId = this.generateId(newName);
    const duplicatedCollection = {
      ...originalCollection,
      id: newId,
      name: newName,
      slug: this.generateSlug(newName),
      seo: {
        ...originalCollection.seo,
        title: `${newName} - GLP1 France`
      },
      metadata: {
        created: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        version: '1.0.0',
        duplicatedFrom: collectionId
      }
    };

    return this.createCollection(duplicatedCollection);
  }

  /**
   * Réorganise l'ordre des collections
   */
  reorderCollections(newOrder) {
    const collections = this.loadCollections();
    
    // Vérifier que tous les IDs sont présents
    const currentIds = collections.collections.map(c => c.id).sort();
    const newIds = newOrder.sort();
    
    if (JSON.stringify(currentIds) !== JSON.stringify(newIds)) {
      throw new Error('Liste d\'IDs incomplète ou incorrecte');
    }

    // Réorganiser
    const reorderedCollections = newOrder.map(id => 
      collections.collections.find(c => c.id === id)
    );

    collections.collections = reorderedCollections;
    
    if (this.saveCollections(collections)) {
      return collections.collections;
    } else {
      throw new Error('Erreur lors de la réorganisation');
    }
  }

  /**
   * Génère les statistiques d'une collection
   */
  getCollectionStats(collectionId) {
    const articles = this.getArticlesByCollection(collectionId);
    
    return {
      totalArticles: articles.length,
      totalWords: articles.reduce((sum, a) => sum + (a.wordCount || 0), 0),
      averageWords: articles.length > 0 ? Math.round(articles.reduce((sum, a) => sum + (a.wordCount || 0), 0) / articles.length) : 0,
      authors: [...new Set(articles.map(a => a.author))],
      lastUpdate: articles.length > 0 ? Math.max(...articles.map(a => new Date(a.lastModified).getTime())) : null,
      seoScores: articles.map(a => this.calculateSEOScore(a))
    };
  }

  /**
   * Calcul basique du score SEO (réutilisé de l'analyzer)
   */
  calculateSEOScore(article) {
    let score = 0;
    
    if (article.wordCount >= 500) score += 30;
    else if (article.wordCount >= 300) score += 20;
    
    if (article.title && article.title.length > 30 && article.title.length < 70) score += 20;
    if (article.description && article.description.length > 140 && article.description.length < 160) score += 20;
    if (article.keywords && article.keywords.length > 0) score += 15;
    if (article.author) score += 10;
    
    const daysSinceUpdate = (Date.now() - new Date(article.lastModified).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 5;
    
    return Math.min(score, 100);
  }

  /**
   * Exporte les collections
   */
  exportCollections(format = 'json') {
    const collections = this.loadCollections();
    const timestamp = new Date().toISOString().split('T')[0];
    
    if (format === 'json') {
      const filename = `collections-export-${timestamp}.json`;
      fs.writeFileSync(filename, JSON.stringify(collections, null, 2));
      return filename;
    } else if (format === 'csv') {
      const filename = `collections-export-${timestamp}.csv`;
      const csvContent = this.collectionsToCSV(collections.collections);
      fs.writeFileSync(filename, csvContent);
      return filename;
    }
  }

  /**
   * Convertit les collections en CSV
   */
  collectionsToCSV(collections) {
    const headers = ['ID', 'Name', 'Description', 'Slug', 'Icon', 'Color', 'Template', 'Keywords', 'Created'];
    const rows = collections.map(c => [
      c.id,
      c.name,
      c.description,
      c.slug,
      c.icon,
      c.color,
      c.template,
      c.keywords.join(';'),
      c.metadata.created
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Génère un slug à partir d'un nom
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Génère un ID à partir d'un nom
   */
  generateId(name) {
    return this.generateSlug(name);
  }

  /**
   * Valide les données d'une collection
   */
  validateCollection(collectionData) {
    const errors = [];

    if (!collectionData.id) errors.push('ID requis');
    if (!collectionData.name) errors.push('Nom requis');
    if (collectionData.id && !/^[a-z0-9-]+$/.test(collectionData.id)) {
      errors.push('ID doit contenir seulement des lettres, chiffres et tirets');
    }
    if (collectionData.color && !/^#[0-9A-Fa-f]{6}$/.test(collectionData.color)) {
      errors.push('Couleur doit être au format hexadécimal (#RRGGBB)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default CollectionManager;
