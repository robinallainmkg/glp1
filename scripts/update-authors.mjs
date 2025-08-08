import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Nouveaux auteurs avec leurs spécialités
const authors = {
  nutrition: {
    name: "Dr. Claire Morel",
    bio: "Médecin spécialisée en nutrition clinique et médecine préventive, le Dr. Claire Morel accompagne ses patients dans la gestion du poids et la prévention des maladies métaboliques. Elle apporte une vision scientifique et factuelle sur l'impact des traitements GLP-1 et leurs effets sur la santé globale.",
    specialties: ["nutrition", "diabete", "medicament", "traitement", "ozempic", "wegovy", "saxenda", "glp-1", "insuline"]
  },
  journaliste: {
    name: "Julien Armand",
    bio: "Journaliste indépendant depuis plus de 10 ans, Julien Armand couvre les sujets liés à la santé, au bien-être et à la forme physique. Son approche pédagogique permet de rendre accessibles les données médicales et scientifiques au grand public.",
    specialties: ["prix", "cout", "remboursement", "pharmacie", "achat", "operation", "chirurgie", "clinique"]
  },
  cosmetique: {
    name: "Élodie Carpentier",
    bio: "Passionnée par la cosmétique et diplômée en formulation de soins dermo-cosmétiques, Élodie Carpentier décrypte les produits et ingrédients pour aider chacun à choisir les solutions adaptées à sa peau, notamment après une perte de poids rapide.",
    specialties: ["beaute", "peau", "soin", "cosmetique", "avant-apres", "effet", "secondaire"]
  },
  sport: {
    name: "Marc Delattre",
    bio: "Ancien coach sportif, Marc Delattre partage ses connaissances sur l'activité physique, la récupération et l'hygiène de vie. Ses articles allient conseils pratiques et suivi des dernières tendances fitness.",
    specialties: ["sport", "exercice", "regime", "perte", "poids", "maigrir", "obesite", "personne"]
  }
};

// Fonction pour déterminer l'auteur approprié selon le contenu
function getAuthorForArticle(article) {
  const title = article.title.toLowerCase();
  const description = article.description.toLowerCase();
  const keywords = article.keywords.toLowerCase();
  const category = article.category.toLowerCase();
  
  const content = `${title} ${description} ${keywords} ${category}`;
  
  // Scores pour chaque auteur
  const scores = {};
  
  Object.entries(authors).forEach(([key, author]) => {
    scores[key] = 0;
    author.specialties.forEach(specialty => {
      if (content.includes(specialty)) {
        scores[key]++;
      }
    });
  });
  
  // Trouver l'auteur avec le meilleur score
  const bestAuthor = Object.entries(scores).reduce((best, current) => {
    return current[1] > best[1] ? current : best;
  });
  
  // Si aucune correspondance, assigner selon la catégorie
  if (bestAuthor[1] === 0) {
    if (category.includes('cout') || category.includes('prix')) return authors.journaliste.name;
    if (category.includes('diabete') || category.includes('medicament')) return authors.nutrition.name;
    if (category.includes('perte-de-poids') || category.includes('regime')) return authors.sport.name;
    if (category.includes('effet') || category.includes('secondaire')) return authors.cosmetique.name;
    return authors.nutrition.name; // Par défaut
  }
  
  return authors[bestAuthor[0]].name;
}

// Charger la base de données
console.log('🔄 Réattribution des auteurs selon leurs spécialités...');

const dbPath = path.resolve(__dirname, '../data/articles-database.json');
const database = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

let updatedCount = 0;

// Mettre à jour chaque article
database.categories.forEach(category => {
  category.articles.forEach(article => {
    const newAuthor = getAuthorForArticle(article);
    
    if (article.author !== newAuthor) {
      updatedCount++;
      
      // Mettre à jour dans les deux structures
      article.author = newAuthor;
      if (article.editable) {
        article.editable.author = newAuthor;
      }
      
      console.log(`📝 ${article.title} → ${newAuthor}`);
    }
  });
});

// Mettre à jour allArticles si elle existe
if (database.allArticles) {
  database.allArticles.forEach(article => {
    const newAuthor = getAuthorForArticle(article);
    article.author = newAuthor;
    if (article.editable) {
      article.editable.author = newAuthor;
    }
  });
}

// Mettre à jour les métadonnées
if (!database.metadata) {
  database.metadata = {};
}
database.metadata.lastUpdated = new Date().toISOString();
database.metadata.authorsUpdated = true;

// Sauvegarder
fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

console.log(`✅ ${updatedCount} articles mis à jour avec les nouveaux auteurs !`);
console.log(`👥 Auteurs disponibles :`);
Object.values(authors).forEach(author => {
  console.log(`   - ${author.name}`);
});
