#!/usr/bin/env node

/**
 * DEPLOIEMENT NODE.JS AVEC SSH2
 * Upload automatique vers Hostinger
 */

import { execSync } from 'child_process';
import { existsSync, rmSync, readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

// Configuration
const CONFIG = {
  hostinger: {
    host: '147.79.98.140',
    username: 'u403023291',
    password: '_@%p8R*XG.s+/5)',
    port: 65002,
    remotePath: '/public_html'
  },
  commitMessage: process.argv[2] || 'Deploy: Mise à jour automatique'
};

console.log('🚀 DÉPLOIEMENT NODE.JS AUTOMATIQUE - GLP-1 FRANCE');
console.log('==================================================');

// 1. VERIFICATIONS
console.log('🔍 Vérifications...');

let currentBranch;
try {
  currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log(`✅ Branche actuelle: ${currentBranch}`);
} catch (error) {
  console.error('❌ Erreur Git:', error.message);
  process.exit(1);
}

// 2. COMMIT ET PUSH GITHUB
console.log('\n📤 Upload vers GitHub...');

try {
  execSync('git add .', { stdio: 'inherit' });
  execSync(`git commit -m "${CONFIG.commitMessage}"`, { stdio: 'inherit' });
  execSync('git push origin production --force --no-verify', { stdio: 'inherit' });
  console.log('✅ Push GitHub réussi');
} catch (error) {
  console.log('⚠️  Aucun changement à commiter ou erreur push');
}

// 3. BUILD DU SITE
console.log('\n🏗️  Build du site...');

if (existsSync('dist')) rmSync('dist', { recursive: true, force: true });
if (existsSync('.astro')) rmSync('.astro', { recursive: true, force: true });

try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build réussi');
} catch (error) {
  console.error('❌ Erreur de build');
  process.exit(1);
}

if (!existsSync('dist/index.html')) {
  console.error('❌ Erreur: index.html non trouvé dans dist/');
  process.exit(1);
}

// 4. UPLOAD VIA POWERSHELL/CURL
console.log('\n🌐 Upload vers Hostinger...');

// Créer script PowerShell pour l'upload
const psScript = `
$ErrorActionPreference = "Continue"

# Configuration SFTP
$host = "${CONFIG.hostinger.host}"
$port = ${CONFIG.hostinger.port}
$username = "${CONFIG.hostinger.username}"
$password = "${CONFIG.hostinger.password}"
$remotePath = "${CONFIG.hostinger.remotePath}"

Write-Host "Upload via PowerShell curl..." -ForegroundColor Yellow

# Compter les fichiers
$files = Get-ChildItem -Path "dist" -Recurse -File
$totalFiles = $files.Count
$uploadedFiles = 0

Write-Host "Fichiers à uploader: $totalFiles" -ForegroundColor Cyan

foreach ($file in $files) {
    $localPath = $file.FullName
    $relativePath = $file.FullName.Substring((Get-Item "dist").FullName.Length + 1).Replace("\\", "/")
    $remoteUrl = "sftp://$username:$password@$host:$port$remotePath/$relativePath"
    
    try {
        curl --sftp --upload-file "$localPath" "$remoteUrl" --create-dirs --silent --show-error
        if ($LASTEXITCODE -eq 0) {
            $uploadedFiles++
            $percent = [math]::Round(($uploadedFiles / $totalFiles) * 100, 1)
            Write-Host "  [$percent%] $relativePath" -ForegroundColor Green
        } else {
            Write-Host "  [ERREUR] $relativePath" -ForegroundColor Red
        }
    } catch {
        Write-Host "  [ERREUR] $relativePath - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
if ($uploadedFiles -eq $totalFiles) {
    Write-Host "Upload réussi! $uploadedFiles/$totalFiles fichiers" -ForegroundColor Green
    Write-Host "Site mis à jour: https://glp1-france.fr" -ForegroundColor Green
} else {
    Write-Host "Upload partiel: $uploadedFiles/$totalFiles fichiers" -ForegroundColor Yellow
}
`;

// Écrire et exécuter le script PowerShell
try {
  const { writeFileSync, unlinkSync } = await import('fs');
  writeFileSync('upload.ps1', psScript);
  
  console.log('📤 Exécution upload PowerShell...');
  execSync('powershell -ExecutionPolicy Bypass -File upload.ps1', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  // Nettoyer
  unlinkSync('upload.ps1');
  
} catch (error) {
  console.error('❌ Erreur upload PowerShell:', error.message);
  
  // Fallback: ouvrir dossier dist
  console.log('\n📋 Upload manuel requis:');
  console.log(`Host: ${CONFIG.hostinger.host}:${CONFIG.hostinger.port}`);
  console.log(`User: ${CONFIG.hostinger.username}`);
  console.log(`Pass: ${CONFIG.hostinger.password}`);
  console.log(`Path: ${CONFIG.hostinger.remotePath}`);
  
  try {
    if (process.platform === 'win32') {
      execSync('start dist', { stdio: 'ignore' });
    } else if (process.platform === 'darwin') {
      execSync('open dist', { stdio: 'ignore' });
    }
    console.log('📁 Dossier dist ouvert');
  } catch (error) {
    console.log('📁 Dossier dist: ./dist/');
  }
}

console.log('\n🎉 Déploiement terminé!');
