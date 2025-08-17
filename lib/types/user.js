// ========================================
// TYPES ET VALIDATION USERS - GLP-1 FRANCE
// Schémas de validation et constantes
// ========================================

// ========================================
// CONSTANTES
// ========================================

export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator', 
  USER: 'user'
}

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
}

export const SUBSCRIPTION_TYPES = {
  FREE: 'free',
  PREMIUM: 'premium',
  PRO: 'pro'
}

export const GLP1_TREATMENTS = {
  OZEMPIC: 'ozempic',
  WEGOVY: 'wegovy', 
  SAXENDA: 'saxenda',
  TRULICITY: 'trulicity',
  MOUNJARO: 'mounjaro',
  RYBELSUS: 'rybelsus'
}

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  BAN: 'ban',
  UNBAN: 'unban',
  LOGIN: 'login',
  LOGOUT: 'logout'
}

// ========================================
// SCHÉMAS DE VALIDATION
// ========================================

/**
 * Valide les données d'un nouvel utilisateur
 * @param {Object} userData - Données à valider
 * @returns {Object} {isValid: boolean, errors: Array, sanitizedData: Object}
 */
export function validateUserData(userData) {
  const errors = []
  const sanitizedData = {}

  // Validation nom
  if (!userData.name || typeof userData.name !== 'string') {
    errors.push('Le nom est obligatoire')
  } else {
    const name = userData.name.trim()
    if (name.length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères')
    } else if (name.length > 100) {
      errors.push('Le nom ne peut pas dépasser 100 caractères')
    } else {
      sanitizedData.name = name
    }
  }

  // Validation email
  if (!userData.email || typeof userData.email !== 'string') {
    errors.push('L\'email est obligatoire')
  } else {
    const email = userData.email.toLowerCase().trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      errors.push('Format d\'email invalide')
    } else if (email.length > 255) {
      errors.push('L\'email ne peut pas dépasser 255 caractères')
    } else {
      sanitizedData.email = email
    }
  }

  // Validation rôle
  if (userData.role) {
    if (!Object.values(USER_ROLES).includes(userData.role)) {
      errors.push('Rôle invalide')
    } else {
      sanitizedData.role = userData.role
    }
  }

  // Validation statut
  if (userData.status) {
    if (!Object.values(USER_STATUS).includes(userData.status)) {
      errors.push('Statut invalide')
    } else {
      sanitizedData.status = userData.status
    }
  }

  // Validation type d'abonnement
  if (userData.subscription_type) {
    if (!Object.values(SUBSCRIPTION_TYPES).includes(userData.subscription_type)) {
      errors.push('Type d\'abonnement invalide')
    } else {
      sanitizedData.subscription_type = userData.subscription_type
    }
  }

  // Validation traitements GLP-1
  if (userData.glp1_treatments) {
    if (Array.isArray(userData.glp1_treatments)) {
      const validTreatments = userData.glp1_treatments.filter(treatment => 
        Object.values(GLP1_TREATMENTS).includes(treatment)
      )
      sanitizedData.glp1_treatments = validTreatments
    } else {
      errors.push('Les traitements GLP-1 doivent être un tableau')
    }
  }

  // Validation données médicales
  if (userData.medical_data) {
    if (typeof userData.medical_data === 'object' && userData.medical_data !== null) {
      sanitizedData.medical_data = sanitizeMedicalData(userData.medical_data)
    } else {
      errors.push('Les données médicales doivent être un objet')
    }
  }

  // Validation préférences
  if (userData.preferences) {
    if (typeof userData.preferences === 'object' && userData.preferences !== null) {
      sanitizedData.preferences = sanitizePreferences(userData.preferences)
    } else {
      errors.push('Les préférences doivent être un objet')
    }
  }

  // Validation permissions
  if (userData.permissions) {
    if (typeof userData.permissions === 'object' && userData.permissions !== null) {
      sanitizedData.permissions = sanitizePermissions(userData.permissions)
    } else {
      errors.push('Les permissions doivent être un objet')
    }
  }

  // Validation notes
  if (userData.notes) {
    if (typeof userData.notes === 'string') {
      const notes = userData.notes.trim()
      if (notes.length > 1000) {
        errors.push('Les notes ne peuvent pas dépasser 1000 caractères')
      } else {
        sanitizedData.notes = notes
      }
    } else {
      errors.push('Les notes doivent être du texte')
    }
  }

  // Validation URL d'image de profil
  if (userData.profile_image) {
    if (typeof userData.profile_image === 'string') {
      const urlRegex = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i
      if (!urlRegex.test(userData.profile_image)) {
        errors.push('URL d\'image de profil invalide')
      } else {
        sanitizedData.profile_image = userData.profile_image
      }
    } else {
      errors.push('L\'image de profil doit être une URL')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  }
}

/**
 * Valide les données de mise à jour d'un utilisateur
 * @param {Object} userData - Données à valider
 * @returns {Object} {isValid: boolean, errors: Array, sanitizedData: Object}
 */
export function validateUserUpdateData(userData) {
  const errors = []
  const sanitizedData = {}

  // Pour les mises à jour, tous les champs sont optionnels
  // mais s'ils sont présents, ils doivent être valides

  if (userData.name !== undefined) {
    if (typeof userData.name !== 'string') {
      errors.push('Le nom doit être du texte')
    } else {
      const name = userData.name.trim()
      if (name.length < 2) {
        errors.push('Le nom doit contenir au moins 2 caractères')
      } else if (name.length > 100) {
        errors.push('Le nom ne peut pas dépasser 100 caractères')
      } else {
        sanitizedData.name = name
      }
    }
  }

  if (userData.email !== undefined) {
    if (typeof userData.email !== 'string') {
      errors.push('L\'email doit être du texte')
    } else {
      const email = userData.email.toLowerCase().trim()
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        errors.push('Format d\'email invalide')
      } else if (email.length > 255) {
        errors.push('L\'email ne peut pas dépasser 255 caractères')
      } else {
        sanitizedData.email = email
      }
    }
  }

  if (userData.role !== undefined) {
    if (!Object.values(USER_ROLES).includes(userData.role)) {
      errors.push('Rôle invalide')
    } else {
      sanitizedData.role = userData.role
    }
  }

  if (userData.status !== undefined) {
    if (!Object.values(USER_STATUS).includes(userData.status)) {
      errors.push('Statut invalide')
    } else {
      sanitizedData.status = userData.status
    }
  }

  // Continuer les autres validations comme dans validateUserData...

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData
  }
}

// ========================================
// FONCTIONS DE SANITISATION
// ========================================

/**
 * Nettoie et valide les données médicales
 * @param {Object} medicalData - Données médicales
 * @returns {Object} Données médicales nettoyées
 */
function sanitizeMedicalData(medicalData) {
  const sanitized = {}

  // Poids (en kg)
  if (medicalData.weight && typeof medicalData.weight === 'number') {
    if (medicalData.weight >= 30 && medicalData.weight <= 300) {
      sanitized.weight = Math.round(medicalData.weight * 10) / 10 // 1 décimale
    }
  }

  // Taille (en cm)
  if (medicalData.height && typeof medicalData.height === 'number') {
    if (medicalData.height >= 100 && medicalData.height <= 250) {
      sanitized.height = Math.round(medicalData.height)
    }
  }

  // Objectif de poids
  if (medicalData.target_weight && typeof medicalData.target_weight === 'number') {
    if (medicalData.target_weight >= 30 && medicalData.target_weight <= 300) {
      sanitized.target_weight = Math.round(medicalData.target_weight * 10) / 10
    }
  }

  // HbA1c
  if (medicalData.hba1c && typeof medicalData.hba1c === 'number') {
    if (medicalData.hba1c >= 4 && medicalData.hba1c <= 15) {
      sanitized.hba1c = Math.round(medicalData.hba1c * 10) / 10
    }
  }

  // Date de début de traitement
  if (medicalData.treatment_start_date) {
    const date = new Date(medicalData.treatment_start_date)
    if (!isNaN(date.getTime())) {
      sanitized.treatment_start_date = date.toISOString().split('T')[0] // Format YYYY-MM-DD
    }
  }

  return sanitized
}

/**
 * Nettoie et valide les préférences utilisateur
 * @param {Object} preferences - Préférences
 * @returns {Object} Préférences nettoyées
 */
function sanitizePreferences(preferences) {
  const sanitized = {}

  // Langue
  const validLanguages = ['fr', 'en', 'es', 'de']
  if (preferences.language && validLanguages.includes(preferences.language)) {
    sanitized.language = preferences.language
  }

  // Notifications
  if (typeof preferences.notifications === 'object') {
    sanitized.notifications = {
      email: Boolean(preferences.notifications.email),
      push: Boolean(preferences.notifications.push),
      weekly_report: Boolean(preferences.notifications.weekly_report)
    }
  }

  // Thème
  const validThemes = ['light', 'dark', 'auto']
  if (preferences.theme && validThemes.includes(preferences.theme)) {
    sanitized.theme = preferences.theme
  }

  // Unités de mesure
  const validUnits = ['metric', 'imperial']
  if (preferences.units && validUnits.includes(preferences.units)) {
    sanitized.units = preferences.units
  }

  return sanitized
}

/**
 * Nettoie et valide les permissions
 * @param {Object} permissions - Permissions
 * @returns {Object} Permissions nettoyées
 */
function sanitizePermissions(permissions) {
  const sanitized = {}
  
  // Liste des permissions valides
  const validPermissions = [
    'view_users', 'create_user', 'edit_user', 'delete_user',
    'view_articles', 'create_article', 'edit_article', 'delete_article',
    'moderate_comments', 'view_analytics', 'manage_settings',
    'export_data', 'import_data', 'view_audit_logs'
  ]

  // Ne garder que les permissions valides avec des valeurs booléennes
  Object.keys(permissions).forEach(key => {
    if (validPermissions.includes(key)) {
      sanitized[key] = Boolean(permissions[key])
    }
  })

  return sanitized
}

// ========================================
// FONCTIONS D'AIDE
// ========================================

/**
 * Vérifie si un utilisateur a une permission spécifique
 * @param {Object} user - Objet utilisateur
 * @param {string} permission - Permission à vérifier
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.permissions) return false
  
  // Les admins ont toutes les permissions
  if (user.role === USER_ROLES.ADMIN) return true
  
  // Vérifier la permission spécifique
  return Boolean(user.permissions[permission])
}

/**
 * Génère un objet utilisateur par défaut
 * @returns {Object}
 */
export function getDefaultUserData() {
  return {
    name: '',
    email: '',
    role: USER_ROLES.USER,
    status: USER_STATUS.ACTIVE,
    subscription_type: SUBSCRIPTION_TYPES.FREE,
    glp1_treatments: [],
    medical_data: {},
    preferences: {
      language: 'fr',
      notifications: {
        email: true,
        push: false,
        weekly_report: false
      },
      theme: 'light',
      units: 'metric'
    },
    permissions: {},
    notes: '',
    profile_image: null
  }
}

/**
 * Formate un utilisateur pour l'affichage
 * @param {Object} user - Objet utilisateur
 * @returns {Object} Utilisateur formaté
 */
export function formatUserForDisplay(user) {
  if (!user) return null

  return {
    ...user,
    created_at_formatted: new Date(user.created_at).toLocaleDateString('fr-FR'),
    updated_at_formatted: new Date(user.updated_at).toLocaleDateString('fr-FR'),
    last_login_formatted: user.last_login ? 
      new Date(user.last_login).toLocaleDateString('fr-FR') : 'Jamais',
    role_label: getRoleLabel(user.role),
    status_label: getStatusLabel(user.status),
    subscription_label: getSubscriptionLabel(user.subscription_type)
  }
}

function getRoleLabel(role) {
  const labels = {
    [USER_ROLES.ADMIN]: 'Administrateur',
    [USER_ROLES.MODERATOR]: 'Modérateur',
    [USER_ROLES.USER]: 'Utilisateur'
  }
  return labels[role] || role
}

function getStatusLabel(status) {
  const labels = {
    [USER_STATUS.ACTIVE]: 'Actif',
    [USER_STATUS.SUSPENDED]: 'Suspendu',
    [USER_STATUS.BANNED]: 'Banni'
  }
  return labels[status] || status
}

function getSubscriptionLabel(subscription) {
  const labels = {
    [SUBSCRIPTION_TYPES.FREE]: 'Gratuit',
    [SUBSCRIPTION_TYPES.PREMIUM]: 'Premium',
    [SUBSCRIPTION_TYPES.PRO]: 'Professionnel'
  }
  return labels[subscription] || subscription
}
