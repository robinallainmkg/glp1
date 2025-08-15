import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

// Types pour les règles de placement
interface PlacementRule {
  id: string;
  dealId: string;
  match: {
    products?: string[];
    collections?: string[];
    articleTags?: string[];
    paths?: string[];
  };
  placements: string[];
  weight: number;
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  id: string;
  partnerId: string;
  title: string;
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  trackingUrl: string;
  utm: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
  };
  validFrom: string;
  validTo: string;
  priority: number;
  status: 'draft' | 'active' | 'expired' | 'archived';
  assets: {
    image?: string;
    badgeText?: string;
  };
  complianceNotes?: string;
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const searchParams = new URLSearchParams(url.search);
    const targetPath = searchParams.get('path') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const collections = searchParams.get('collections')?.split(',') || [];
    const products = searchParams.get('products')?.split(',') || [];
    
    // Charger les données d'affiliation
    const dataPath = path.join(process.cwd(), 'data', 'affiliate-products.json');
    const data = await fs.readFile(dataPath, 'utf-8');
    const affiliateData = JSON.parse(data);
    
    // Récupérer les deals et règles (ou utiliser les données existantes comme fallback)
    const deals: Deal[] = affiliateData.deals || [];
    const rules: PlacementRule[] = affiliateData.rules || [];
    
    // Si pas de système de règles encore, utiliser la logique existante
    if (rules.length === 0) {
      // Utiliser la logique de matching existante basée sur les produits
      const relevantProducts = affiliateData.products.filter((product: any) => {
        if (!product.isActive) return false;
        
        // Vérifier la pertinence contextuelle
        const hasMatchingTags = tags.some(tag => 
          product.tags.includes(tag) || 
          product.targetCollections.includes(tag) ||
          product.contextualKeywords.some((keyword: string) => 
            keyword.toLowerCase().includes(tag.toLowerCase())
          )
        );
        
        const hasMatchingPath = product.targetCollections.some((collection: string) =>
          targetPath.includes(collection) || collection.includes(targetPath.split('/').pop() || '')
        );
        
        return hasMatchingTags || hasMatchingPath;
      });
      
      // Convertir en format de réponse uniforme
      const placements = ['banner', 'sidebar', 'inline', 'grid', 'footer', 'content'];
      const resolvedBlocks = placements.map(placement => ({
        placement,
        products: relevantProducts
          .filter((product: any) => product.placements?.[placement]?.enabled)
          .sort((a: any, b: any) => (a.placements?.[placement]?.priority || 999) - (b.placements?.[placement]?.priority || 999))
          .slice(0, 3) // Limite à 3 produits par placement
      })).filter(block => block.products.length > 0);
      
      return new Response(JSON.stringify({
        success: true,
        context: { path: targetPath, tags, collections, products },
        resolvedBlocks,
        conflicts: [], // Pas de conflits dans le système actuel
        debugInfo: {
          totalProducts: affiliateData.products.length,
          activeProducts: affiliateData.products.filter((p: any) => p.isActive).length,
          relevantProducts: relevantProducts.length,
          rulesApplied: 'legacy-product-matching'
        }
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Nouveau système de règles (pour le futur)
    const now = new Date();
    const activeDeals = deals.filter(deal => 
      deal.status === 'active' &&
      new Date(deal.validFrom) <= now &&
      new Date(deal.validTo) >= now
    );
    
    // Matching des règles
    const matchingRules = rules.filter(rule => {
      const deal = activeDeals.find(d => d.id === rule.dealId);
      if (!deal) return false;
      
      const { match } = rule;
      
      // Vérifier les critères de matching
      const pathMatch = !match.paths?.length || match.paths.some(p => targetPath.includes(p));
      const tagMatch = !match.articleTags?.length || match.articleTags.some(t => tags.includes(t));
      const collectionMatch = !match.collections?.length || match.collections.some(c => collections.includes(c));
      const productMatch = !match.products?.length || match.products.some(p => products.includes(p));
      
      return pathMatch && tagMatch && collectionMatch && productMatch;
    });
    
    // Résolution des conflits par placement
    const placements = ['banner', 'sidebar', 'inline', 'grid', 'footer', 'content'];
    const resolvedBlocks: any[] = [];
    const conflicts: any[] = [];
    
    placements.forEach(placement => {
      const rulesForPlacement = matchingRules.filter(rule => 
        rule.placements.includes(placement)
      );
      
      if (rulesForPlacement.length === 0) return;
      
      if (rulesForPlacement.length > 1) {
        // Conflit détecté
        conflicts.push({
          placement,
          conflictingRules: rulesForPlacement.map(r => ({
            ruleId: r.id,
            dealId: r.dealId,
            weight: r.weight,
            priority: activeDeals.find(d => d.id === r.dealId)?.priority || 0
          }))
        });
        
        // Résolution: priority > weight > date de création
        rulesForPlacement.sort((a, b) => {
          const dealA = activeDeals.find(d => d.id === a.dealId)!;
          const dealB = activeDeals.find(d => d.id === b.dealId)!;
          
          if (dealA.priority !== dealB.priority) {
            return dealB.priority - dealA.priority; // Plus haute priorité d'abord
          }
          
          if (a.weight !== b.weight) {
            return b.weight - a.weight; // Plus haut poids d'abord
          }
          
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Plus récent d'abord
        });
      }
      
      // Prendre la règle gagnante
      const winningRule = rulesForPlacement[0];
      const winningDeal = activeDeals.find(d => d.id === winningRule.dealId)!;
      
      resolvedBlocks.push({
        placement,
        rule: winningRule,
        deal: winningDeal,
        finalUrl: `${winningDeal.trackingUrl}?utm_source=${winningDeal.utm.source}&utm_medium=${winningDeal.utm.medium}&utm_campaign=${winningDeal.utm.campaign}&utm_content=${winningDeal.utm.content}`
      });
    });
    
    return new Response(JSON.stringify({
      success: true,
      context: { path: targetPath, tags, collections, products },
      resolvedBlocks,
      conflicts,
      debugInfo: {
        totalDeals: deals.length,
        activeDeals: activeDeals.length,
        totalRules: rules.length,
        matchingRules: matchingRules.length
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('Preview resolve error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to resolve preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
