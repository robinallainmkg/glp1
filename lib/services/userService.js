// ========================================
// SERVICE USERS - GLP-1 FRANCE
// Gestion complète des utilisateurs avec Supabase
// ========================================

import { supabase, supabaseAdmin } from '../supabase.js'

// ========================================
// FONCTIONS DE LECTURE
// ========================================

/**
 * Récupère tous les utilisateurs avec pagination
 * @param {number} page - Numéro de page (commence à 0)
 * @param {number} limit - Nombre d'éléments par page
 * @param {string} sortBy - Champ de tri (id, name, email, created_at)
 * @param {string} sortOrder - Ordre (asc, desc)
 * @returns {Promise<{data: Array, count: number, error: any}>}
 */
export async function getAllUsers(page = 0, limit = 20, sortBy = 'created_at', sortOrder = 'desc') {
  try {
    const start = page * limit
    const end = start + limit - 1

    const { data, error, count } = await supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(start, end)

    if (error) throw error

    console.log(`✅ [UserService] ${data?.length || 0} utilisateurs récupérés (page ${page + 1})`)
    return { data: data || [], count: count || 0, error: null }

  } catch (error) {
    console.error('❌ [UserService] Erreur getAllUsers:', error)
    return { data: [], count: 0, error }
  }
}

/**
 * Récupère un utilisateur par son ID
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function getUserById(id) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur ${id} récupéré:`, data?.email)
    return { data, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur getUserById(${id}):`, error)
    return { data: null, error }
  }
}

/**
 * Récupère un utilisateur par email
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur trouvé par email:`, email)
    return { data, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur getUserByEmail(${email}):`, error)
    return { data: null, error }
  }
}

/**
 * Récupère les utilisateurs par rôle
 * @param {string} role - Rôle (admin, user, moderator)
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function getUsersByRole(role) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`✅ [UserService] ${data?.length || 0} utilisateurs avec rôle ${role}`)
    return { data: data || [], error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur getUsersByRole(${role}):`, error)
    return { data: [], error }
  }
}

/**
 * Recherche d'utilisateurs par nom ou email
 * @param {string} query - Terme de recherche
 * @param {number} limit - Limite de résultats
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function searchUsers(query, limit = 10) {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit)
      .order('created_at', { ascending: false })

    if (error) throw error

    console.log(`✅ [UserService] ${data?.length || 0} utilisateurs trouvés pour "${query}"`)
    return { data: data || [], error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur searchUsers("${query}"):`, error)
    return { data: [], error }
  }
}

// ========================================
// FONCTIONS DE CRÉATION/MODIFICATION
// ========================================

/**
 * Crée un nouvel utilisateur
 * @param {Object} userData - Données de l'utilisateur
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function createUser(userData) {
  try {
    // Validation des données requises
    if (!userData.name || !userData.email) {
      throw new Error('Nom et email sont obligatoires')
    }

    // Données par défaut
    const newUser = {
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      role: userData.role || 'user',
      status: userData.status || 'active',
      subscription_type: userData.subscription_type || 'free',
      glp1_treatments: userData.glp1_treatments || [],
      medical_data: userData.medical_data || {},
      preferences: userData.preferences || {},
      permissions: userData.permissions || {},
      notes: userData.notes || '',
      profile_image: userData.profile_image || null
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([newUser])
      .select()
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur créé:`, data.email)
    
    // Log audit
    await logUserAction('create', data.id, null, data, userData.performed_by)
    
    return { data, error: null }

  } catch (error) {
    console.error('❌ [UserService] Erreur createUser:', error)
    return { data: null, error }
  }
}

/**
 * Met à jour un utilisateur
 * @param {number} id - ID de l'utilisateur
 * @param {Object} userData - Nouvelles données
 * @param {string} performedBy - Email de l'admin qui fait la modification
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function updateUser(id, userData, performedBy) {
  try {
    // Récupérer les données actuelles pour l'audit
    const { data: oldData } = await getUserById(id)
    if (!oldData) {
      throw new Error('Utilisateur non trouvé')
    }

    // Préparer les nouvelles données
    const updateData = {
      ...userData,
      updated_at: new Date().toISOString()
    }

    // Nettoyer les champs undefined
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur ${id} mis à jour par ${performedBy}`)
    
    // Log audit
    await logUserAction('update', id, oldData, data, performedBy)
    
    return { data, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur updateUser(${id}):`, error)
    return { data: null, error }
  }
}

// ========================================
// FONCTIONS DE SUPPRESSION/BAN
// ========================================

/**
 * Supprime définitivement un utilisateur
 * @param {number} id - ID de l'utilisateur
 * @param {string} performedBy - Email de l'admin qui fait la suppression
 * @returns {Promise<{success: boolean, error: any}>}
 */
export async function deleteUser(id, performedBy) {
  try {
    // Récupérer les données pour l'audit
    const { data: userData } = await getUserById(id)
    if (!userData) {
      throw new Error('Utilisateur non trouvé')
    }

    // Vérification de sécurité : ne pas supprimer un admin
    if (userData.role === 'admin') {
      throw new Error('Impossible de supprimer un administrateur')
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur ${id} (${userData.email}) supprimé par ${performedBy}`)
    
    // Log audit
    await logUserAction('delete', id, userData, null, performedBy)
    
    return { success: true, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur deleteUser(${id}):`, error)
    return { success: false, error }
  }
}

/**
 * Bannit temporairement un utilisateur
 * @param {number} id - ID de l'utilisateur
 * @param {string} reason - Raison du ban
 * @param {string} performedBy - Email de l'admin qui fait le ban
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function banUser(id, reason, performedBy) {
  try {
    const banData = {
      status: 'banned',
      banned_reason: reason,
      banned_at: new Date().toISOString(),
      banned_by: performedBy,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(banData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur ${id} banni par ${performedBy}: ${reason}`)
    
    // Log audit
    await logUserAction('ban', id, null, data, performedBy, { reason })
    
    return { data, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur banUser(${id}):`, error)
    return { data: null, error }
  }
}

/**
 * Réactive un utilisateur banni
 * @param {number} id - ID de l'utilisateur
 * @param {string} performedBy - Email de l'admin qui fait la réactivation
 * @returns {Promise<{data: Object|null, error: any}>}
 */
export async function unbanUser(id, performedBy) {
  try {
    const unbanData = {
      status: 'active',
      banned_reason: null,
      banned_at: null,
      banned_by: null,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(unbanData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    console.log(`✅ [UserService] Utilisateur ${id} réactivé par ${performedBy}`)
    
    // Log audit
    await logUserAction('unban', id, null, data, performedBy)
    
    return { data, error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur unbanUser(${id}):`, error)
    return { data: null, error }
  }
}

// ========================================
// FONCTIONS D'AUDIT
// ========================================

/**
 * Enregistre une action dans l'audit log
 * @param {string} action - Type d'action
 * @param {number} userId - ID de l'utilisateur concerné
 * @param {Object} oldData - Anciennes données
 * @param {Object} newData - Nouvelles données
 * @param {string} performedBy - Qui a fait l'action
 * @param {Object} metadata - Métadonnées supplémentaires
 */
async function logUserAction(action, userId, oldData, newData, performedBy, metadata = {}) {
  try {
    const auditData = {
      user_id: userId,
      action,
      performed_by: performedBy || 'system',
      old_data: oldData,
      new_data: newData,
      metadata,
      created_at: new Date().toISOString()
    }

    await supabaseAdmin
      .from('user_audit_log')
      .insert([auditData])

    console.log(`📝 [Audit] Action ${action} loggée pour user ${userId}`)

  } catch (error) {
    console.error('❌ [Audit] Erreur log action:', error)
    // Ne pas faire échouer l'opération principale si l'audit échoue
  }
}

/**
 * Récupère l'historique d'audit d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 * @param {number} limit - Nombre d'entrées à récupérer
 * @returns {Promise<{data: Array, error: any}>}
 */
export async function getUserAuditLog(userId, limit = 50) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_audit_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return { data: data || [], error: null }

  } catch (error) {
    console.error(`❌ [UserService] Erreur getUserAuditLog(${userId}):`, error)
    return { data: [], error }
  }
}

// ========================================
// STATISTIQUES ET RAPPORTS
// ========================================

/**
 * Récupère les statistiques des utilisateurs
 * @returns {Promise<{data: Object, error: any}>}
 */
export async function getUserStats() {
  try {
    // Compter par statut
    const { data: statusData, error: statusError } = await supabaseAdmin
      .from('users')
      .select('status')
      
    if (statusError) throw statusError

    // Compter par rôle  
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('users')
      .select('role')
      
    if (roleError) throw roleError

    // Calculer les statistiques
    const stats = {
      total: statusData.length,
      byStatus: {},
      byRole: {},
      recent: 0 // Utilisateurs créés dans les 7 derniers jours
    }

    // Compter par statut
    statusData.forEach(user => {
      stats.byStatus[user.status] = (stats.byStatus[user.status] || 0) + 1
    })

    // Compter par rôle
    roleData.forEach(user => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1
    })

    // Utilisateurs récents (7 derniers jours)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    
    const { count: recentCount, error: recentError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', weekAgo.toISOString())

    if (!recentError) {
      stats.recent = recentCount || 0
    }

    console.log('✅ [UserService] Statistiques générées:', stats)
    return { data: stats, error: null }

  } catch (error) {
    console.error('❌ [UserService] Erreur getUserStats:', error)
    return { data: null, error }
  }
}
