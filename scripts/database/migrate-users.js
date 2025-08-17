// ========================================
// SCRIPT MIGRATION USERS JSON → SUPABASE
// Migration complète des données utilisateurs
// ========================================

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { supabaseAdmin } from '../../src/lib/supabase.js'
import { validateUserData } from '../../src/lib/types/user.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Chemins des fichiers
const OLD_USERS_PATH = path.join(__dirname, '../data/users-unified.json')
const BACKUP_PATH = path.join(__dirname, '../backup/users-backup-' + Date.now() + '.json')

/**
 * Script principal de migration
 */
async function migrateUsers() {
  console.log('🚀 Début de la migration JSON → Supabase')
  console.log('=' .repeat(50))

  try {
    // ========================================
    // 1. VÉRIFICATIONS PRÉALABLES
    // ========================================
    
    console.log('📋 1. Vérifications préalables...')
    
    // Vérifier que Supabase est configuré
    if (!supabaseAdmin) {
      throw new Error('❌ Supabase non configuré. Vérifiez vos variables d\'environnement.')
    }

    // Vérifier que le fichier JSON existe
    if (!fs.existsSync(OLD_USERS_PATH)) {
      throw new Error(`❌ Fichier users.json non trouvé: ${OLD_USERS_PATH}`)
    }

    // Tester la connexion Supabase
    const { data: testData, error: testError } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact' })
      .limit(1)

    if (testError) {
      throw new Error(`❌ Impossible de se connecter à Supabase: ${testError.message}`)
    }

    console.log('✅ Connexion Supabase OK')
    console.log(`📊 Utilisateurs actuels dans Supabase: ${testData.length}`)

    // ========================================
    // 2. BACKUP DES DONNÉES EXISTANTES
    // ========================================
    
    console.log('\\n💾 2. Backup des données existantes...')
    
    // Créer le dossier backup s'il n'existe pas
    const backupDir = path.dirname(BACKUP_PATH)
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    // Backup du JSON existant
    const jsonData = fs.readFileSync(OLD_USERS_PATH, 'utf8')
    fs.writeFileSync(BACKUP_PATH, jsonData)
    console.log(`✅ Backup JSON créé: ${BACKUP_PATH}`)

    // Backup des données Supabase existantes si applicable
    if (testData.length > 0) {
      const { data: existingUsers, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('*')

      if (!fetchError) {
        const supabaseBackupPath = path.join(backupDir, `supabase-backup-${Date.now()}.json`)
        fs.writeFileSync(supabaseBackupPath, JSON.stringify(existingUsers, null, 2))
        console.log(`✅ Backup Supabase créé: ${supabaseBackupPath}`)
      }
    }

    // ========================================
    // 3. CHARGEMENT ET VALIDATION DES DONNÉES JSON
    // ========================================
    
    console.log('\\n📥 3. Chargement des données JSON...')
    
    const jsonParsed = JSON.parse(jsonData)
    // Vérifier si c'est un objet avec propriété users ou directement un tableau
    const usersJson = jsonParsed.users || jsonParsed
    console.log(`📊 ${usersJson.length} utilisateurs trouvés dans le JSON`)

    // Validation et transformation des données
    const validUsers = []
    const invalidUsers = []

    for (let i = 0; i < usersJson.length; i++) {
      const user = usersJson[i]
      
      // Transformer le format JSON vers le format Supabase
      const transformedUser = transformJsonUserToSupabase(user)
      
      // Valider les données
      const validation = validateUserData(transformedUser)
      
      if (validation.isValid) {
        validUsers.push({
          original: user,
          transformed: validation.sanitizedData,
          index: i
        })
      } else {
        invalidUsers.push({
          original: user,
          errors: validation.errors,
          index: i
        })
      }
    }

    console.log(`✅ ${validUsers.length} utilisateurs valides`)
    if (invalidUsers.length > 0) {
      console.log(`⚠️ ${invalidUsers.length} utilisateurs invalides:`)
      invalidUsers.slice(0, 5).forEach(invalid => {
        console.log(`   - Index ${invalid.index}: ${invalid.errors.join(', ')}`)
      })
      if (invalidUsers.length > 5) {
        console.log(`   ... et ${invalidUsers.length - 5} autres`)
      }
    }

    // ========================================
    // 4. INSERTION DANS SUPABASE
    // ========================================
    
    console.log('\\n📤 4. Insertion dans Supabase...')
    
    let insertedCount = 0
    let errorCount = 0
    const insertErrors = []

    // Insertion par batch de 100
    const BATCH_SIZE = 100
    const batches = []
    
    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      batches.push(validUsers.slice(i, i + BATCH_SIZE))
    }

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(`📦 Batch ${batchIndex + 1}/${batches.length} (${batch.length} utilisateurs)`)
      
      try {
        const batchData = batch.map(user => user.transformed)
        
        const { data, error } = await supabaseAdmin
          .from('users')
          .insert(batchData)
          .select()

        if (error) {
          console.error(`❌ Erreur batch ${batchIndex + 1}:`, error)
          errorCount += batch.length
          insertErrors.push({ batchIndex: batchIndex + 1, error: error.message })
        } else {
          insertedCount += data.length
          console.log(`✅ Batch ${batchIndex + 1} inséré: ${data.length} utilisateurs`)
        }

      } catch (error) {
        console.error(`❌ Erreur critique batch ${batchIndex + 1}:`, error)
        errorCount += batch.length
        insertErrors.push({ batchIndex: batchIndex + 1, error: error.message })
      }

      // Petite pause entre les batches
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // ========================================
    // 5. RAPPORT FINAL
    // ========================================
    
    console.log('\\n📊 5. Rapport de migration')
    console.log('=' .repeat(50))
    console.log(`📥 Utilisateurs dans JSON: ${usersJson.length}`)
    console.log(`✅ Utilisateurs valides: ${validUsers.length}`)
    console.log(`❌ Utilisateurs invalides: ${invalidUsers.length}`)
    console.log(`📤 Utilisateurs insérés: ${insertedCount}`)
    console.log(`⚠️ Erreurs d'insertion: ${errorCount}`)

    if (insertErrors.length > 0) {
      console.log('\\n🔍 Détail des erreurs:')
      insertErrors.forEach(error => {
        console.log(`   - Batch ${error.batchIndex}: ${error.error}`)
      })
    }

    // ========================================
    // 6. VÉRIFICATION POST-MIGRATION
    // ========================================
    
    console.log('\\n🔍 6. Vérification post-migration...')
    
    const { data: finalUsers, error: finalError } = await supabaseAdmin
      .from('users')
      .select('count', { count: 'exact' })

    if (finalError) {
      console.error('❌ Erreur lors de la vérification:', finalError)
    } else {
      console.log(`📊 Total utilisateurs dans Supabase: ${finalUsers.length}`)
    }

    // ========================================
    // 7. RECOMMANDATIONS POST-MIGRATION
    // ========================================
    
    console.log('\\n💡 7. Recommandations post-migration')
    console.log('=' .repeat(50))
    
    if (insertedCount === validUsers.length && errorCount === 0) {
      console.log('🎉 Migration réussie à 100% !')
      console.log('\\n📋 Prochaines étapes:')
      console.log('   1. Tester les nouvelles API Supabase')
      console.log('   2. Mettre à jour le dashboard admin')
      console.log('   3. Supprimer les références au JSON')
      console.log('   4. Deployer en production')
    } else {
      console.log('⚠️ Migration partiellement réussie')
      console.log('\\n📋 Actions recommandées:')
      console.log('   1. Examiner les erreurs ci-dessus')
      console.log('   2. Corriger les données invalides')
      console.log('   3. Relancer la migration si nécessaire')
    }

    console.log(`\\n💾 Backups disponibles:`)
    console.log(`   - JSON: ${BACKUP_PATH}`)

  } catch (error) {
    console.error('\\n💥 ERREUR CRITIQUE:', error.message)
    console.log('\\n🔄 La migration a été interrompue. Vos données sont intactes.')
    process.exit(1)
  }
}

/**
 * Transforme un utilisateur du format JSON vers le format Supabase
 * @param {Object} jsonUser - Utilisateur au format JSON
 * @returns {Object} Utilisateur au format Supabase
 */
function transformJsonUserToSupabase(jsonUser) {
  // Extraire le nom de l'email si pas de nom
  const emailParts = jsonUser.email ? jsonUser.email.split('@') : ['Utilisateur', 'example.com']
  const defaultName = emailParts[0].charAt(0).toUpperCase() + emailParts[0].slice(1)
  
  return {
    // Champs obligatoires
    name: jsonUser.name || jsonUser.nom || defaultName,
    email: jsonUser.email || '',
    
    // Champs avec valeurs par défaut
    role: jsonUser.role || jsonUser.type || 'user',
    status: jsonUser.status || jsonUser.statut || 'active',
    
    // Dates - utiliser firstSeen de votre structure
    created_at: jsonUser.firstSeen || jsonUser.created_at || jsonUser.dateCreation || new Date().toISOString(),
    last_login: jsonUser.lastSeen || jsonUser.last_login || jsonUser.derniereConnexion || null,
    
    // Données spécifiques GLP-1
    subscription_type: jsonUser.subscription || jsonUser.abonnement || (jsonUser.isNewsletterSubscriber ? 'free' : 'free'),
    glp1_treatments: jsonUser.treatments || jsonUser.traitements || [],
    
    // Données médicales (si présentes)
    medical_data: {
      weight: jsonUser.poids || jsonUser.weight,
      height: jsonUser.taille || jsonUser.height,
      target_weight: jsonUser.objectif_poids || jsonUser.target_weight,
      hba1c: jsonUser.hba1c,
      treatment_start_date: jsonUser.date_debut_traitement || jsonUser.treatment_start_date
    },
    
    // Préférences - utiliser les analytics de votre structure
    preferences: {
      language: jsonUser.langue || jsonUser.language || 'fr',
      notifications: { 
        email: jsonUser.isNewsletterSubscriber || false, 
        push: false 
      },
      theme: jsonUser.theme || 'light',
      units: jsonUser.unites || jsonUser.units || 'metric'
    },
    
    // Métadonnées
    permissions: jsonUser.permissions || {},
    notes: jsonUser.notes || jsonUser.commentaires || '',
    profile_image: jsonUser.avatar || jsonUser.profile_image || null
  }
}

// ========================================
// EXÉCUTION DU SCRIPT
// ========================================

// Vérifier si le script est exécuté directement
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUsers().catch(error => {
    console.error('💥 Erreur lors de l\'exécution:', error)
    process.exit(1)
  })
}

export { migrateUsers }
