#!/usr/bin/env python3
"""
Indexeur RAG SECURISE pour GLP1-France
Version légère qui ne risque pas de faire planter le système
"""

import os
import json
import requests
from pathlib import Path
from bs4 import BeautifulSoup
from openai import OpenAI
from typing import List, Dict, Optional
import time
import gc
from datetime import datetime

class SafeGLP1RAGIndexer:
    def __init__(self, openai_api_key: str):
        """Initialise l'indexeur avec la clé API OpenAI"""
        self.client = OpenAI(api_key=openai_api_key)
        self.base_url = "https://glp1-france.fr"
        self.embeddings_dir = Path("embeddings")
        self.embeddings_dir.mkdir(exist_ok=True)
        
        # Configuration SECURISEE - limites strictes
        self.max_pages = 10  # Limite à 10 pages pour éviter le crash
        self.max_chunk_size = 500  # Chunks plus petits
        self.delay_between_requests = 2  # 2 secondes entre chaque requête
        self.max_retries = 2  # Moins de tentatives
        
        print(f"Indexeur sécurisé initialisé")
        print(f"Limite: {self.max_pages} pages maximum")
        print(f"Délai: {self.delay_between_requests}s entre les requêtes")
    
    def get_sample_urls(self) -> List[str]:
        """Obtient une liste limitée d'URLs pour test sécurisé"""
        # URLs de test sécurisées - pages importantes seulement
        sample_urls = [
            f"{self.base_url}/",
            f"{self.base_url}/qu-est-ce-que-glp1/",
            f"{self.base_url}/ozempic/",
            f"{self.base_url}/wegovy/",
            f"{self.base_url}/saxenda/",
            f"{self.base_url}/effets-secondaires/",
            f"{self.base_url}/prix/",
            f"{self.base_url}/prescription/",
            f"{self.base_url}/alternatives/",
            f"{self.base_url}/faq/"
        ]
        
        print(f"URLs de test sélectionnées: {len(sample_urls)}")
        return sample_urls[:self.max_pages]
    
    def extract_content_safely(self, url: str) -> Dict:
        """Extrait le contenu d'une page de manière sécurisée"""
        try:
            print(f"Extraction: {url}")
            
            # Headers pour simuler un navigateur normal
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            # Timeout court pour éviter les blocages
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extraction basique et sécurisée
            title = soup.find('title')
            title_text = title.get_text().strip() if title else "Sans titre"
            
            # Contenu principal
            content_selectors = [
                'main', 'article', '.content', '.post-content', 
                '.entry-content', 'body'
            ]
            
            content_text = ""
            for selector in content_selectors:
                content_elem = soup.select_one(selector)
                if content_elem:
                    # Nettoyer le contenu
                    for script in content_elem(["script", "style", "nav", "header", "footer"]):
                        script.decompose()
                    
                    content_text = content_elem.get_text()
                    break
            
            # Nettoyer le texte
            content_text = ' '.join(content_text.split())
            
            # Limiter la taille pour éviter les problèmes
            if len(content_text) > 5000:
                content_text = content_text[:5000] + "..."
            
            return {
                'url': url,
                'title': title_text,
                'content': content_text,
                'length': len(content_text),
                'extracted_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"Erreur extraction {url}: {e}")
            return {
                'url': url,
                'title': 'Erreur',
                'content': '',
                'length': 0,
                'error': str(e)
            }
    
    def create_chunks_safely(self, content: str, title: str) -> List[str]:
        """Découpe le contenu en chunks de manière sécurisée"""
        if not content or len(content) < 50:
            return []
        
        # Chunks plus petits pour éviter les problèmes
        chunk_size = min(self.max_chunk_size, len(content) // 3)
        overlap = 50
        
        chunks = []
        start = 0
        
        while start < len(content) and len(chunks) < 5:  # Max 5 chunks par page
            end = start + chunk_size
            
            # Trouver une fin de phrase
            if end < len(content):
                while end > start + 100 and content[end] not in '.!?':
                    end -= 1
                end += 1
            
            chunk = content[start:end].strip()
            if len(chunk) > 100:  # Minimum viable
                chunks.append(f"{title}\n\n{chunk}")
            
            start = end - overlap
            
            # Sécurité: pause entre les chunks
            time.sleep(0.1)
        
        return chunks
    
    def create_embedding_safely(self, text: str) -> Optional[List[float]]:
        """Crée un embedding de manière sécurisée"""
        try:
            # Limiter la taille du texte
            if len(text) > 1000:
                text = text[:1000]
            
            response = self.client.embeddings.create(
                model="text-embedding-3-small",
                input=text
            )
            
            return response.data[0].embedding
            
        except Exception as e:
            print(f"Erreur embedding: {e}")
            return None
    
    def run_safe_indexing(self):
        """Lance une indexation sécurisée et limitée"""
        print("\n=== INDEXATION SECURISEE ===")
        print("Cette version est limitée pour éviter les crashes")
        
        # URLs de test
        urls = self.get_sample_urls()
        
        all_chunks = []
        processed = 0
        
        for i, url in enumerate(urls):
            print(f"\n[{i+1}/{len(urls)}] Traitement: {url}")
            
            # Extraire le contenu
            page_data = self.extract_content_safely(url)
            
            if not page_data.get('content'):
                print("  -> Contenu vide, ignoré")
                continue
            
            # Créer les chunks
            chunks = self.create_chunks_safely(
                page_data['content'], 
                page_data['title']
            )
            
            print(f"  -> {len(chunks)} chunks créés")
            
            # Traiter chaque chunk
            for j, chunk in enumerate(chunks):
                print(f"    Chunk {j+1}: embedding...")
                
                embedding = self.create_embedding_safely(chunk)
                
                if embedding:
                    chunk_data = {
                        'id': f"{processed}_{j}",
                        'url': url,
                        'title': page_data['title'],
                        'chunk': chunk,
                        'embedding': embedding,
                        'created_at': datetime.now().isoformat()
                    }
                    
                    all_chunks.append(chunk_data)
                    print(f"    -> OK ({len(embedding)} dimensions)")
                else:
                    print(f"    -> ERREUR embedding")
                
                # Pause sécurité entre les embeddings
                time.sleep(0.5)
            
            processed += 1
            
            # Libérer la mémoire
            gc.collect()
            
            # Pause entre les pages
            if i < len(urls) - 1:
                print(f"  Pause sécurité: {self.delay_between_requests}s...")
                time.sleep(self.delay_between_requests)
        
        # Sauvegarder les résultats
        print(f"\n=== SAUVEGARDE ===")
        print(f"Total chunks traités: {len(all_chunks)}")
        
        output_file = self.embeddings_dir / "glp1_embeddings.json"
        
        final_data = {
            'version': '1.0-safe',
            'created_at': datetime.now().isoformat(),
            'total_chunks': len(all_chunks),
            'source': 'glp1-france.fr',
            'chunks': all_chunks
        }
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(final_data, f, ensure_ascii=False, indent=2)
        
        print(f"Fichier sauvegardé: {output_file}")
        print(f"Taille: {output_file.stat().st_size / 1024:.1f} KB")
        
        return True

def main():
    """Fonction principale sécurisée"""
    print("=== INDEXEUR RAG SECURISE ===")
    
    # Clé API
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        api_key = input("Clé API OpenAI: ").strip()
    
    if not api_key or not api_key.startswith('sk-'):
        print("ERREUR: Clé API invalide")
        return False
    
    # Confirmation
    print("\nCette version sécurisée va:")
    print("- Traiter maximum 10 pages")
    print("- Créer des chunks de 500 caractères max")
    print("- Faire des pauses entre les requêtes")
    print("- Limiter la consommation mémoire")
    
    confirm = input("\nContinuer? (o/N): ").strip().lower()
    if confirm != 'o':
        print("Annulé")
        return False
    
    try:
        # Lancer l'indexation
        indexer = SafeGLP1RAGIndexer(api_key)
        success = indexer.run_safe_indexing()
        
        if success:
            print("\n✅ INDEXATION TERMINEE AVEC SUCCES")
            print("Vous pouvez maintenant tester avec demo.html")
        else:
            print("\n❌ ERREUR PENDANT L'INDEXATION")
        
        return success
        
    except Exception as e:
        print(f"\n❌ ERREUR FATALE: {e}")
        return False

if __name__ == "__main__":
    main()
