// Utilitaire pour générer dynamiquement les pages de collections avec images
export function generateCollectionHTML(articles, collectionName, colors, emoji) {
  return articles.map(article => `
    <article class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 overflow-hidden group">
      <!-- Image avec fallback automatique -->
      <div class="relative h-48 overflow-hidden">
        <img 
          src="/images/thumbnails/${article.slug}-illus.jpg"
          alt="${article.data.title}"
          class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onerror="this.onerror=null; this.src='/images/thumbnails/${article.slug}.svg'"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div class="absolute top-4 left-4">
          <span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold text-white bg-${colors}-600/90 backdrop-blur-sm border border-white/20">
            <div class="w-2 h-2 rounded-full bg-white mr-2"></div>
            ${collectionName.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-gradient-to-r from-${colors}-600 to-${colors}-700 flex items-center justify-center text-white text-xl">
            ${emoji}
          </div>
          <div class="flex-1">
            <span class="text-sm text-gray-500 font-medium">${collectionName.toUpperCase()}</span>
          </div>
        </div>
        
        <h2 class="text-xl font-bold text-gray-900 mb-3 leading-tight">
          <a href="/collections/${collectionName}/${article.slug}/" class="hover:text-blue-600 transition-colors">
            ${article.data.title}
          </a>
        </h2>
        
        <p class="text-gray-600 mb-4 text-sm leading-relaxed">
          ${article.data.description || article.data.metaDescription || 'Découvrez cet article complet sur les GLP-1.'}
        </p>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-100">
          <span class="text-sm text-gray-500">
            ${article.data.author || 'Expert GLP-1'}
          </span>
          <span class="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            5 min
          </span>
        </div>
      </div>
    </article>
  `).join('');
}
