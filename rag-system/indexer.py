#!/usr/bin/env python3
"""
🤖 Indexeur RAG pour GLP1-France
Extrait le contenu des articles et crée les embeddings pour la recherche sémantique
"""

import os
import json
import requests
from pathlib import Path
from bs4 import BeautifulSoup
from openai import OpenAI
from typing import List, Dict
import time
from datetime import datetime

class GLP1RAGIndexer:
    def __init__(self, openai_api_key: str):
        """Initialise l'indexeur avec la clé API OpenAI"""
        self.client = OpenAI(api_key=openai_api_key)
        self.base_url = "https://glp1-france.fr"
        self.docs_dir = Path("docs")
        self.embeddings_dir = Path("embeddings")
        
        # Créer les dossiers
        self.docs_dir.mkdir(exist_ok=True)
        self.embeddings_dir.mkdir(exist_ok=True)
        
        # Configuration
        self.chunk_size = 1000
        self.chunk_overlap = 200
        self.embedding_model = "text-embedding-3-small"
        
    def extract_content_from_url(self, url: str) -> Dict:
        """Extrait le contenu d'une page web"""
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extraire le titre
            title = soup.find('title')
            title = title.get_text().strip() if title else ""
            
            # Extraire le H1
            h1 = soup.find('h1')
            h1_text = h1.get_text().strip() if h1 else ""
            
            # Extraire le contenu principal
            content_selectors = [
                'main', 'article', '.content', '#content', 
                '.post-content', '.article-content'
            ]
            
            content = ""
            for selector in content_selectors:
                main_content = soup.select_one(selector)
                if main_content:
                    # Supprimer les scripts et styles
                    for script in main_content(["script", "style", "nav", "footer", "header"]):
                        script.decompose()
                    content = main_content.get_text()
                    break
            
            # Si pas de contenu principal trouvé, prendre le body
            if not content:
                body = soup.find('body')
                if body:
                    for script in body(["script", "style", "nav", "footer", "header"]):
                        script.decompose()
                    content = body.get_text()
            
            # Nettoyer le contenu
            content = ' '.join(content.split())
            
            return {
                'url': url,
                'title': title,
                'h1': h1_text,
                'content': content,
                'length': len(content)
            }
            
        except Exception as e:
            print(f"❌ Erreur extraction {url}: {e}")
            return None
    
    def chunk_text(self, text: str) -> List[str]:
        """Découpe le texte en chunks avec overlap"""
        if len(text) <= self.chunk_size:
            return [text]
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            
            # Essayer de couper à la fin d'une phrase
            if end < len(text):
                # Chercher le dernier point dans la zone d'overlap
                last_period = text.rfind('.', start, end - self.chunk_overlap)
                if last_period > start:
                    end = last_period + 1
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            start = end - self.chunk_overlap
            
        return chunks
    
    def create_embedding(self, text: str) -> List[float]:
        """Crée un embedding pour un texte"""
        try:
            response = self.client.embeddings.create(
                input=text,
                model=self.embedding_model
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Erreur embedding: {e}")
            return None
    
    def index_glp1_content(self):
        """Index tout le contenu du site GLP1"""
        print("🚀 Démarrage de l'indexation GLP1...")
        
        # URLs principales à indexer
        urls_to_index = [
            f"{self.base_url}/",
            f"{self.base_url}/qu-est-ce-que-glp1/",
            f"{self.base_url}/quel-traitement-glp1-choisir/",
            f"{self.base_url}/nouveaux-medicaments-perdre-poids/",
            f"{self.base_url}/avant-apres-glp1/",
            f"{self.base_url}/medicaments-glp1/",
            f"{self.base_url}/effets-secondaires-glp1/",
            f"{self.base_url}/alternatives-glp1/",
            f"{self.base_url}/regime-glp1/",
            f"{self.base_url}/glp1-perte-de-poids/",
            f"{self.base_url}/glp1-diabete/",
            f"{self.base_url}/glp1-cout/",
            f"{self.base_url}/medecins-glp1-france/",
        ]
        
        # Ajouter les articles spécifiques
        specific_articles = [
            "ozempic-prix", "wegovy-avis", "saxenda-prix", "mounjaro-prix-france",
            "semaglutide-achat", "liraglutide-perte-de-poids-avis", "tirzepatide-avis",
            "ozempic-danger", "wegovy-danger", "effets-secondaires-glp1",
            "alternatives-naturelles-ozempic", "berberine-glp1", "cannelle-glp1"
        ]
        
        for article in specific_articles:
            urls_to_index.append(f"{self.base_url}/medicaments-glp1/{article}/")
        
        all_embeddings = []
        processed_count = 0
        
        for url in urls_to_index:
            print(f"📄 Traitement: {url}")
            
            # Extraire le contenu
            content_data = self.extract_content_from_url(url)
            if not content_data or not content_data['content']:
                continue
            
            # Sauvegarder le contenu brut
            filename = url.replace(self.base_url, "").replace("/", "_") or "home"
            if filename.startswith("_"):
                filename = filename[1:]
            if filename.endswith("_"):
                filename = filename[:-1]
            
            doc_file = self.docs_dir / f"{filename}.json"
            with open(doc_file, 'w', encoding='utf-8') as f:
                json.dump(content_data, f, ensure_ascii=False, indent=2)
            
            # Découper en chunks
            chunks = self.chunk_text(content_data['content'])
            print(f"  📝 {len(chunks)} chunks créés")
            
            # Créer les embeddings pour chaque chunk
            for i, chunk in enumerate(chunks):
                if len(chunk.strip()) < 50:  # Ignorer les chunks trop courts
                    continue
                
                print(f"  🔄 Embedding chunk {i+1}/{len(chunks)}")
                embedding = self.create_embedding(chunk)
                
                if embedding:
                    all_embeddings.append({
                        'id': f"{filename}_chunk_{i}",
                        'url': url,
                        'title': content_data['title'],
                        'h1': content_data['h1'],
                        'chunk': chunk,
                        'chunk_index': i,
                        'embedding': embedding,
                        'metadata': {
                            'source': 'glp1-france.fr',
                            'indexed_at': datetime.now().isoformat(),
                            'chunk_size': len(chunk)
                        }
                    })
                
                # Pause pour éviter les limites de taux
                time.sleep(0.1)
            
            processed_count += 1
            print(f"  ✅ Terminé ({processed_count}/{len(urls_to_index)})")
        
        # Sauvegarder tous les embeddings
        embeddings_file = self.embeddings_dir / "glp1_embeddings.json"
        with open(embeddings_file, 'w', encoding='utf-8') as f:
            json.dump(all_embeddings, f, ensure_ascii=False, indent=2)
        
        print(f"Indexation terminee!")
        print(f"Total: {len(all_embeddings)} embeddings crees")
        print(f"Sauvegarde dans: {embeddings_file}")

def main():
    """Point d'entrée principal"""
    print("Indexeur RAG GLP1-France")
    print("=" * 50)
    
    # Vérifier la clé API
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        # Demander la clé API
        api_key = input("Entrez votre cle API OpenAI: ").strip()
        if not api_key:
            print("Cle API requise!")
            return
    
    # Créer l'indexeur
    indexer = GLP1RAGIndexer(api_key)
    
    # Lancer l'indexation
    try:
        indexer.index_glp1_content()
    except KeyboardInterrupt:
        print("\nIndexation interrompue par l'utilisateur")
    except Exception as e:
        print(f"Erreur détaillée: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
