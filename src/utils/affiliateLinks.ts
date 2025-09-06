// Utilitaire pour générer les liens d'affiliation avec codes promo automatiques
export function generateAffiliateLink(product: any): string {
  const baseLink = product.external_link || product.externalLink;
  const brand = product.brand;
  
  if (!baseLink) return '#';
  
  // Configuration des codes promo par marque
  if (brand === 'Talika' && product.discount_percent) {
    // Format Talika: https://talika.fr/discount/GLP1?redirect=/products/time-control-7
    try {
      // Si le lien contient déjà la structure discount/GLP1, l'utiliser tel quel
      if (baseLink.includes('talika.fr/discount/GLP1')) {
        return baseLink;
      }
      const url = new URL(baseLink);
      const productPath = url.pathname;
      return `https://talika.fr/discount/GLP1?redirect=${productPath}`;
    } catch {
      return baseLink;
    }
  }
  
  if (brand === 'Nutrimuscle' && product.discount_percent) {
    // Format Nutrimuscle: https://www.nutrimuscle.com/NMA_GLP1?redirect=/products/musclewhey-mix-protein
    try {
      const url = new URL(baseLink);
      const productPath = url.pathname;
      const searchParams = url.searchParams;
      const redirectParam = searchParams.get('redirect');
      
      // Si le lien contient déjà la structure NMA_GLP1 ET le redirect est correct
      if (baseLink.includes('nutrimuscle.com/NMA_GLP1?redirect=') && 
          redirectParam && 
          redirectParam.startsWith('/products/')) {
        return baseLink;
      }
      
      // Si le pathname est juste '/NMA_GLP1' ou redirect mal formé, corriger
      if (productPath === '/NMA_GLP1' || 
          (redirectParam && redirectParam.includes('NMA_GLP1')) ||
          !redirectParam ||
          !redirectParam.startsWith('/products/')) {
        // Mapping basé sur le titre ou product_id pour corriger les liens
        const productMappings: Record<string, string> = {
          'Glutamine - Nutrimuscle': '/products/glutamine-l-glutamine-en-poudre',
          'Whey Native - Nutrimuscle': '/products/musclewhey-mix-protein',
          'Créatine - Nutrimuscle': '/products/creatine-monohydrate',
          'BCAA - Nutrimuscle': '/products/bcaa-8-1-1',
          'Spiruline - Nutrimuscle': '/products/spiruline-bio',
          'Omega 3 - Nutrimuscle': '/products/omega-3-epax',
          'Vitamine D3 - Nutrimuscle': '/products/vitamine-d3',
          'ZMB - Nutrimuscle': '/products/zmb-zinc-magnesium-b6'
        };
        
        const correctPath = productMappings[product.title as string] || productMappings[product.product_id as string];
        if (correctPath) {
          return `https://www.nutrimuscle.com/NMA_GLP1?redirect=${correctPath}`;
        }
      }
      
      return `https://www.nutrimuscle.com/NMA_GLP1?redirect=${productPath}`;
    } catch {
      return baseLink;
    }
  }
  
  // Pour les autres marques, utiliser le lien direct
  return baseLink;
}

// Fonction pour ajouter les paramètres UTM aux liens
export function addUTMParams(url: string, source: string = 'glp1-france', campaign: string = 'affiliate'): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'affiliate');
    urlObj.searchParams.set('utm_campaign', campaign);
    return urlObj.toString();
  } catch {
    return url;
  }
}
