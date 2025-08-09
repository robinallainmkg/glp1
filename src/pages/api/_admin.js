---
// import SEOAnalyzer from '../../../scripts/seo-analyzer.mjs';
// import CollectionManager from '../../../scripts/collection-manager.mjs';

// Configuration CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export async function GET({ request }) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    switch (action) {
      case 'seo-analysis':
        return await handleSEOAnalysis(url.searchParams);
      
      case 'collections':
        return await handleCollections(url.searchParams);
      
      case 'collection-stats':
        return await handleCollectionStats(url.searchParams);
      
      default:
        return new Response(JSON.stringify({ error: 'Action non reconnue' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Erreur API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function POST({ request }) {
  try {
    const data = await request.json();
    const action = data.action;

    switch (action) {
      case 'create-collection':
        return await handleCreateCollection(data);
      
      case 'update-collection':
        return await handleUpdateCollection(data);
      
      case 'assign-article-collections':
        return await handleAssignArticleCollections(data);
      
      default:
        return new Response(JSON.stringify({ error: 'Action POST non reconnue' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Erreur POST API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function DELETE({ request }) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    const collectionId = url.searchParams.get('id');

    if (action === 'delete-collection' && collectionId) {
      return await handleDeleteCollection(collectionId);
    }

    return new Response(JSON.stringify({ error: 'Action DELETE non reconnue' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Erreur DELETE API:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders
  });
}

// Handlers pour les différentes actions

async function handleSEOAnalysis(params) {
  const analyzer = new SEOAnalyzer();
  const articleSlug = params.get('article');

  if (articleSlug) {
    // Analyse d'un article spécifique
    // TODO: Charger l'article spécifique et l'analyser
    return new Response(JSON.stringify({ 
      message: 'Analyse article spécifique non implémentée',
      article: articleSlug 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } else {
    // Analyse complète
    const analysis = await analyzer.analyzeBulk();
    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleCollections(params) {
  const manager = new CollectionManager();
  const collectionId = params.get('id');

  if (collectionId) {
    // Collection spécifique
    const collection = manager.getCollection(collectionId);
    if (!collection) {
      return new Response(JSON.stringify({ error: 'Collection non trouvée' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify(collection), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } else {
    // Toutes les collections
    const collections = manager.getAllCollections();
    return new Response(JSON.stringify({ collections }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function handleCollectionStats(params) {
  const manager = new CollectionManager();
  const collectionId = params.get('id');

  if (!collectionId) {
    return new Response(JSON.stringify({ error: 'ID de collection requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const stats = manager.getCollectionStats(collectionId);
  return new Response(JSON.stringify(stats), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleCreateCollection(data) {
  const manager = new CollectionManager();
  
  // Validation
  const validation = manager.validateCollection(data.collection);
  if (!validation.isValid) {
    return new Response(JSON.stringify({ 
      error: 'Données invalides', 
      details: validation.errors 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const newCollection = manager.createCollection(data.collection);
  return new Response(JSON.stringify({ 
    success: true, 
    collection: newCollection 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleUpdateCollection(data) {
  const manager = new CollectionManager();
  
  if (!data.collectionId) {
    return new Response(JSON.stringify({ error: 'ID de collection requis' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const updatedCollection = manager.updateCollection(data.collectionId, data.updates);
  return new Response(JSON.stringify({ 
    success: true, 
    collection: updatedCollection 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDeleteCollection(collectionId) {
  const manager = new CollectionManager();
  
  const result = manager.deleteCollection(collectionId);
  return new Response(JSON.stringify({ 
    success: result 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleAssignArticleCollections(data) {
  const manager = new CollectionManager();
  
  if (!data.articleSlug || !data.collectionIds) {
    return new Response(JSON.stringify({ 
      error: 'Slug d\'article et IDs de collections requis' 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const updatedArticle = manager.assignArticleToCollections(data.articleSlug, data.collectionIds);
  return new Response(JSON.stringify({ 
    success: true, 
    article: updatedArticle 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
