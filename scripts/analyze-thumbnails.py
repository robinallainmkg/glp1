# 🖼️ SCRIPT - Nettoyage Images Thumbnails
# Analyse et nettoyage des images 404

import os
import re
import json
from pathlib import Path

# Chemins
CONTENT_DIR = "src/content"
PAGES_DIR = "src/pages"
THUMBNAILS_DIR = "public/images/thumbnails"

def scan_referenced_images():
    """Scanne tous les fichiers pour trouver les images référencées"""
    referenced_images = set()
    
    # Patterns à chercher
    patterns = [
        r'thumbnail:\s*["\']?/?images/thumbnails/([^"\'>\s]+)',
        r'src=["\']/?images/thumbnails/([^"\'>\s]+)',
        r'\/images\/thumbnails\/([^"\'>\s)]+)'
    ]
    
    # Scanner tous les fichiers .md et .astro
    for root, dirs, files in os.walk("."):
        if "node_modules" in root or ".git" in root or "dist" in root:
            continue
            
        for file in files:
            if file.endswith(('.md', '.astro')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    for pattern in patterns:
                        matches = re.findall(pattern, content)
                        for match in matches:
                            # Nettoyer le nom du fichier
                            clean_name = match.strip().split('?')[0].split('#')[0]
                            referenced_images.add(clean_name)
                            
                except Exception as e:
                    print(f"Erreur lecture {file_path}: {e}")
    
    return referenced_images

def scan_existing_images():
    """Liste toutes les images existantes dans thumbnails"""
    existing_images = set()
    thumbnails_path = Path(THUMBNAILS_DIR)
    
    if thumbnails_path.exists():
        for img_file in thumbnails_path.glob("*"):
            if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png', '.svg', '.webp']:
                existing_images.add(img_file.name)
    
    return existing_images

def generate_report():
    """Génère un rapport des images manquantes et orphelines"""
    referenced = scan_referenced_images()
    existing = scan_existing_images()
    
    missing = referenced - existing
    orphaned = existing - referenced
    
    report = {
        "total_referenced": len(referenced),
        "total_existing": len(existing),
        "missing_images": sorted(list(missing)),
        "orphaned_images": sorted(list(orphaned)),
        "missing_count": len(missing),
        "orphaned_count": len(orphaned)
    }
    
    return report

if __name__ == "__main__":
    print("🔍 Analyse des images thumbnails...")
    report = generate_report()
    
    print(f"\n📊 RAPPORT:")
    print(f"Images référencées: {report['total_referenced']}")
    print(f"Images existantes: {report['total_existing']}")
    print(f"Images manquantes: {report['missing_count']}")
    print(f"Images orphelines: {report['orphaned_count']}")
    
    if report['missing_images']:
        print(f"\n❌ Images manquantes (404):")
        for img in report['missing_images'][:10]:  # Top 10
            print(f"  - {img}")
        if len(report['missing_images']) > 10:
            print(f"  ... et {len(report['missing_images']) - 10} autres")
    
    if report['orphaned_images']:
        print(f"\n🗑️ Images orphelines (non utilisées):")
        for img in report['orphaned_images'][:10]:  # Top 10  
            print(f"  - {img}")
        if len(report['orphaned_images']) > 10:
            print(f"  ... et {len(report['orphaned_images']) - 10} autres")
    
    # Sauvegarder rapport complet
    with open("rapport_images_thumbnails.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Rapport complet sauvé: rapport_images_thumbnails.json")
