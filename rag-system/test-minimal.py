#!/usr/bin/env python3
"""
Test minimal et sécurisé du système RAG
"""

import os
import sys
from pathlib import Path

def test_minimal():
    """Test minimal qui ne peut pas faire planter le système"""
    print("=== TEST MINIMAL RAG ===")
    
    # Vérifier les dépendances
    print("\n1. Test des dépendances...")
    try:
        import openai
        print("  ✅ OpenAI OK")
    except ImportError:
        print("  ❌ OpenAI manquant")
        print("  Installez avec: pip install openai")
        return False
    
    try:
        import requests
        print("  ✅ Requests OK")
    except ImportError:
        print("  ❌ Requests manquant")
        return False
    
    try:
        import bs4
        print("  ✅ BeautifulSoup OK")
    except ImportError:
        print("  ❌ BeautifulSoup manquant")
        return False
    
    # Test de la clé API
    print("\n2. Test clé API...")
    api_key = "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"
    
    if api_key.startswith('sk-'):
        print("  ✅ Format clé API OK")
    else:
        print("  ❌ Format clé API invalide")
        return False
    
    # Test connexion OpenAI (très simple)
    print("\n3. Test connexion OpenAI...")
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Test minimal - juste un petit embedding
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input="test simple"
        )
        
        if response and response.data:
            print("  ✅ Connexion OpenAI OK")
            print(f"  Embedding size: {len(response.data[0].embedding)}")
        else:
            print("  ❌ Réponse vide")
            return False
            
    except Exception as e:
        print(f"  ❌ Erreur connexion: {e}")
        return False
    
    # Vérifier la structure des dossiers
    print("\n4. Test structure dossiers...")
    base_dir = Path(".")
    
    required_dirs = ["embeddings", "api"]
    for dirname in required_dirs:
        dir_path = base_dir / dirname
        if dir_path.exists():
            print(f"  ✅ {dirname}/")
        else:
            print(f"  ❌ {dirname}/ manquant")
            dir_path.mkdir(exist_ok=True)
            print(f"  ✅ {dirname}/ créé")
    
    # Vérifier les fichiers
    print("\n5. Test fichiers...")
    required_files = [
        "glp1-chat-widget.js",
        "demo.html",
        "api/search.php"
    ]
    
    for filename in required_files:
        file_path = base_dir / filename
        if file_path.exists():
            print(f"  ✅ {filename}")
        else:
            print(f"  ❌ {filename} manquant")
    
    print("\n✅ TESTS BASIQUES TERMINES")
    print("\nPour indexer en sécurité:")
    print("  python indexer-safe.py")
    
    return True

if __name__ == "__main__":
    success = test_minimal()
    if success:
        print("\n🎉 Système prêt pour l'indexation sécurisée!")
    else:
        print("\n❌ Problèmes détectés - corrigez avant de continuer")
    
    input("\nAppuyez sur Entrée pour continuer...")
