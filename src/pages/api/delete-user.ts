import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const POST: APIRoute = async ({ request }) => {
  try {
    console.log('🗑️ API delete-user.ts - Début suppression utilisateur');
    
    // Lire les données JSON de la requête
    const data = await request.json();
    
    if (!data || !data.email) {
      throw new Error('Email manquant dans la requête');
    }
    
    const emailToDelete = data.email.trim().toLowerCase();
    
    if (!emailToDelete) {
      throw new Error('Email vide');
    }
    
    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToDelete)) {
      throw new Error('Format d\'email invalide');
    }
    
    console.log(`📧 Email à supprimer: ${emailToDelete}`);
    
    // Détection de l'environnement
    const url = new URL(request.url);
    const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    
    // Chemin du fichier de données unifié
    let dataFile: string;
    let backupDir: string;
    
    if (isLocal) {
      dataFile = path.join(process.cwd(), 'data', 'users-unified.json');
      backupDir = path.join(process.cwd(), 'data', 'backups');
    } else {
      // Environnement Hostinger
      dataFile = '/home/u574849695/domains/glp1-france.com/public_html/data/users-unified.json';
      backupDir = '/home/u574849695/domains/glp1-france.com/public_html/data/backups';
      
      // Fallback si le chemin absolu n'existe pas
      if (!fs.existsSync(dataFile)) {
        dataFile = path.join(process.cwd(), 'data', 'users-unified.json');
        backupDir = path.join(process.cwd(), 'data', 'backups');
      }
    }
    
    console.log(`🔍 Environnement: ${isLocal ? 'LOCAL' : 'PRODUCTION'}`);
    console.log(`📁 Fichier données: ${dataFile}`);
    
    if (!fs.existsSync(dataFile)) {
      throw new Error('Fichier de données utilisateurs introuvable');
    }
    
    // Lire les données actuelles
    const jsonContent = fs.readFileSync(dataFile, 'utf-8');
    const allData = JSON.parse(jsonContent);
    
    // Vérifier la structure des données
    if (!allData.users || !Array.isArray(allData.users)) {
      throw new Error('Structure de données invalide - clé "users" manquante');
    }
    
    // Chercher l'utilisateur à supprimer
    let userFound = false;
    let userData: any = null;
    const originalCount = allData.users.length;
    
    for (let i = 0; i < allData.users.length; i++) {
      const user = allData.users[i];
      if (user.email && user.email.trim().toLowerCase() === emailToDelete) {
        userData = user;
        console.log(`👤 Utilisateur trouvé: ${user.name || 'Nom inconnu'} - Index: ${i}`);
        
        // Supprimer l'utilisateur
        allData.users.splice(i, 1);
        userFound = true;
        break;
      }
    }
    
    if (!userFound) {
      throw new Error(`Utilisateur avec l'email ${emailToDelete} introuvable`);
    }
    
    const newCount = allData.users.length;
    
    // Créer un backup avant la sauvegarde
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `users-backup-${timestamp}.json`);
    
    // Sauvegarder l'ancien contenu
    fs.writeFileSync(backupFile, jsonContent, 'utf-8');
    console.log(`💾 Backup créé: ${path.basename(backupFile)}`);
    
    // Sauvegarder les nouvelles données
    const newJsonData = JSON.stringify(allData, null, 2);
    fs.writeFileSync(dataFile, newJsonData, 'utf-8');
    
    console.log(`✅ Utilisateur supprimé avec succès. Utilisateurs: ${originalCount} → ${newCount}`);
    
    // Nettoyer les anciens backups (garder seulement les 10 derniers)
    try {
      const backupFiles = fs.readdirSync(backupDir)
        .filter(file => file.startsWith('users-backup-') && file.endsWith('.json'))
        .map(file => ({
          name: file,
          path: path.join(backupDir, file),
          mtime: fs.statSync(path.join(backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      if (backupFiles.length > 10) {
        const filesToDelete = backupFiles.slice(10);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
        });
        console.log(`🧹 Nettoyage: ${filesToDelete.length} anciens backups supprimés`);
      }
    } catch (cleanupError) {
      console.warn('⚠️ Erreur lors du nettoyage des backups:', cleanupError.message);
    }
    
    // Réponse de succès
    return new Response(JSON.stringify({
      success: true,
      message: `Utilisateur ${emailToDelete} supprimé avec succès`,
      data: {
        emailDeleted: emailToDelete,
        userName: userData?.name || 'Nom inconnu',
        previousCount: originalCount,
        newCount: newCount,
        backupFile: path.basename(backupFile),
        environment: isLocal ? 'local' : 'production',
        timestamp: new Date().toISOString()
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur suppression utilisateur:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
