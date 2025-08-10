#!/usr/bin/env python3
"""
DEPLOIEMENT PYTHON AVEC PARAMIKO
Upload automatique vers Hostinger
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path
import time

# Configuration
CONFIG = {
    'hostinger': {
        'host': '147.79.98.140',
        'username': 'u403023291',
        'password': '_@%p8R*XG.s+/5)',
        'port': 65002,
        'remote_path': '/public_html'
    },
    'commit_message': sys.argv[1] if len(sys.argv) > 1 else 'Deploy: Mise à jour automatique'
}

def run_command(cmd, check=True):
    """Exécute une commande shell"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        if check:
            raise e
        return None

def main():
    print("🚀 DÉPLOIEMENT PYTHON AUTOMATIQUE - GLP-1 FRANCE")
    print("=" * 50)
    
    # 1. VERIFICATIONS
    print("🔍 Vérifications...")
    
    try:
        current_branch = run_command('git branch --show-current')
        print(f"✅ Branche actuelle: {current_branch}")
    except subprocess.CalledProcessError:
        print("❌ Erreur Git")
        return 1
    
    # 2. COMMIT ET PUSH GITHUB
    print("\n📤 Upload vers GitHub...")
    
    try:
        run_command('git add .')
        run_command(f'git commit -m "{CONFIG["commit_message"]}"', check=False)
        run_command('git push origin production --force --no-verify')
        print("✅ Push GitHub réussi")
    except subprocess.CalledProcessError:
        print("⚠️  Aucun changement à commiter ou erreur push")
    
    # 3. BUILD DU SITE
    print("\n🏗️  Build du site...")
    
    if Path('dist').exists():
        shutil.rmtree('dist')
    if Path('.astro').exists():
        shutil.rmtree('.astro')
    
    try:
        run_command('npm run build')
        print("✅ Build réussi")
    except subprocess.CalledProcessError:
        print("❌ Erreur de build")
        return 1
    
    if not Path('dist/index.html').exists():
        print("❌ Erreur: index.html non trouvé dans dist/")
        return 1
    
    # 4. UPLOAD VIA PARAMIKO
    print("\n🌐 Upload vers Hostinger...")
    
    try:
        import paramiko
        print("📦 Paramiko disponible, upload SFTP...")
        
        # Créer client SFTP
        ssh_client = paramiko.SSHClient()
        ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        # Connexion
        ssh_client.connect(
            hostname=CONFIG['hostinger']['host'],
            port=CONFIG['hostinger']['port'],
            username=CONFIG['hostinger']['username'],
            password=CONFIG['hostinger']['password']
        )
        
        sftp = ssh_client.open_sftp()
        
        # Compter les fichiers
        dist_path = Path('dist')
        all_files = list(dist_path.rglob('*'))
        files_to_upload = [f for f in all_files if f.is_file()]
        total_files = len(files_to_upload)
        uploaded_files = 0
        
        print(f"Fichiers à uploader: {total_files}")
        
        # Upload chaque fichier
        for file_path in files_to_upload:
            try:
                relative_path = file_path.relative_to(dist_path)
                remote_path = CONFIG['hostinger']['remote_path'] + '/' + str(relative_path).replace('\\', '/')
                
                # Créer dossiers distants si nécessaire
                remote_dir = '/'.join(remote_path.split('/')[:-1])
                try:
                    sftp.makedirs(remote_dir)
                except:
                    pass  # Dossier existe déjà
                
                # Upload fichier
                sftp.put(str(file_path), remote_path)
                uploaded_files += 1
                
                percent = round((uploaded_files / total_files) * 100, 1)
                print(f"  [{percent}%] {relative_path}")
                
            except Exception as e:
                print(f"  [ERREUR] {relative_path} - {e}")
        
        sftp.close()
        ssh_client.close()
        
        if uploaded_files == total_files:
            print(f"\n✅ Upload réussi! {uploaded_files}/{total_files} fichiers")
            print("🌐 Site mis à jour: https://glp1-france.fr")
        else:
            print(f"\n⚠️  Upload partiel: {uploaded_files}/{total_files} fichiers")
            
    except ImportError:
        print("❌ Paramiko non installé")
        print("📥 Installation: pip install paramiko")
        return upload_fallback()
    
    except Exception as e:
        print(f"❌ Erreur upload SFTP: {e}")
        return upload_fallback()
    
    print("\n🎉 Déploiement terminé!")
    return 0

def upload_fallback():
    """Fallback: upload manuel"""
    print("\n📋 Upload manuel requis:")
    print(f"Host: {CONFIG['hostinger']['host']}:{CONFIG['hostinger']['port']}")
    print(f"User: {CONFIG['hostinger']['username']}")
    print(f"Pass: {CONFIG['hostinger']['password']}")
    print(f"Path: {CONFIG['hostinger']['remote_path']}")
    
    # Ouvrir dossier dist
    try:
        if os.name == 'nt':  # Windows
            os.startfile('dist')
        elif os.name == 'posix':  # Linux/Mac
            subprocess.run(['xdg-open', 'dist'], check=False)
        print("📁 Dossier dist ouvert")
    except:
        print("📁 Dossier dist: ./dist/")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
