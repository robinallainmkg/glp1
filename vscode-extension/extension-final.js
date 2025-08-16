const vscode = require('vscode');

// Base de connaissances GLP1 simple
const GLP1_RESPONSES = {
    'ozempic': 'OZEMPIC (semaglutide) coute environ 80-100 euros par mois en France. Rembourse a 65% par l\'Assurance maladie pour le diabete. Tres efficace pour perdre 10-15% du poids corporel.',
    'wegovy': 'WEGOVY (semaglutide haute dose) coute environ 300 euros par mois en France. Specifiquement autorise pour l\'obesite. Pas encore rembourse par la Securite sociale.',
    'glp1': 'GLP-1 (Glucagon-Like Peptide-1) est une hormone produite par l\'intestin grele. Elle regule la glycemie en stimulant la secretion d\'insuline. Les medicaments GLP-1 imitent cette hormone.',
    'prix': 'PRIX GLP1 en France : Ozempic 80-100 euros/mois (rembourse 65% diabete), Wegovy 300 euros/mois (non rembourse), Saxenda 200-250 euros/mois',
    'effets': 'EFFETS SECONDAIRES courants : nausees (tres frequent), vomissements, diarrhee, constipation, douleurs abdominales. Ces effets diminuent avec le temps.',
    'semaglutide': 'SEMAGLUTIDE est le principe actif d\'Ozempic et Wegovy. Medicament GLP-1 tres efficace pour le diabete et la perte de poids.',
    'remboursement': 'REMBOURSEMENT : Ozempic rembourse 65% pour diabete, Wegovy pas rembourse, Saxenda non rembourse pour perte de poids.',
    'diabete': 'Pour le DIABETE de type 2, Ozempic est rembourse a 65%. Tres efficace pour controler la glycemie et perdre du poids.',
    'obesite': 'Pour l\'OBESITE, Wegovy est autorise mais non rembourse. Ozempic parfois prescrit off-label.',
    'cout': 'COUT mensuel : Ozempic 80-100 euros, Wegovy 300 euros, Saxenda 200-250 euros. Seul Ozempic rembourse pour diabete.'
    };
    
    // ========== FONCTIONS DE GÉNÉRATION DE CODE ==========
    
    // Générateur de dashboard de gestion d'utilisateurs
    function generateUserDashboard(description) {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard Utilisateurs - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .container { 
            max-width: 1400px; 
            margin: 0 auto; 
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 2.5em; 
            font-weight: 300; 
        }
        .header p { 
            margin: 10px 0 0 0; 
            opacity: 0.9; 
            font-size: 1.1em; 
        }
        .stats-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); 
            gap: 20px; 
            margin-bottom: 30px; 
        }
        .stat-card { 
            background: white; 
            padding: 25px; 
            border-radius: 12px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            text-align: center; 
        }
        .stat-number { 
            font-size: 2.5em; 
            font-weight: bold; 
            color: #667eea; 
            margin-bottom: 10px; 
        }
        .stat-label { 
            color: #666; 
            font-size: 1.1em; 
        }
        .users-table {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .table-header {
            background: #667eea;
            color: white;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
            color: #333;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .delete-btn {
            background: #dc3545;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
        }
        .delete-btn:hover {
            background: #c82333;
        }
        .delete-btn:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        .loading { text-align: center; padding: 50px; }
        .error { color: #dc3545; text-align: center; padding: 50px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏥 Dashboard Utilisateurs - GLP1 France</h1>
            <p>Gestion complète des utilisateurs • Sécurisé • Temps réel</p>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number" id="total-users">-</div>
                <div class="stat-label">Utilisateurs Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="active-users">-</div>
                <div class="stat-label">Actifs cette semaine</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="new-users">-</div>
                <div class="stat-label">Nouveaux ce mois</div>
            </div>
        </div>

        <div class="users-table">
            <div class="table-header">
                <h3 style="margin: 0;">👥 Liste des Utilisateurs</h3>
            </div>
            
            <div id="loading" class="loading">
                <p>⏳ Chargement des utilisateurs...</p>
            </div>
            
            <div id="error" class="error" style="display: none;">
                <p>❌ Erreur de chargement</p>
                <button onclick="loadUsers()" style="background: #667eea; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Réessayer</button>
            </div>
            
            <div id="users-content" style="display: none;">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Nom</th>
                            <th>Date Inscription</th>
                            <th>Dernière Activité</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="users-tbody">
                        <!-- Données chargées dynamiquement -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
    // Chargement des utilisateurs
    async function loadUsers() {
        const loadingEl = document.getElementById('loading');
        const errorEl = document.getElementById('error');
        const contentEl = document.getElementById('users-content');
        const tbodyEl = document.getElementById('users-tbody');
        
        try {
            loadingEl.style.display = 'block';
            errorEl.style.display = 'none';
            contentEl.style.display = 'none';
            
            const response = await fetch('/api/user-management.ts?action=list');
            const data = await response.json();
            
            if (!response.ok) throw new Error(data.error || 'Erreur de chargement');
            
            const users = data.users || [];
            
            // Mettre à jour les statistiques
            document.getElementById('total-users').textContent = users.length;
            document.getElementById('active-users').textContent = users.filter(u => new Date(u.lastActivity) > new Date(Date.now() - 7*24*60*60*1000)).length;
            document.getElementById('new-users').textContent = users.filter(u => new Date(u.createdAt) > new Date(Date.now() - 30*24*60*60*1000)).length;
            
            // Remplir le tableau
            tbodyEl.innerHTML = users.map(user => \`
                <tr data-user-email="\${user.email}">
                    <td>\${user.id}</td>
                    <td><strong>\${user.email}</strong></td>
                    <td>\${user.name || '-'}</td>
                    <td>\${new Date(user.createdAt).toLocaleDateString('fr-FR')}</td>
                    <td>\${user.lastActivity ? new Date(user.lastActivity).toLocaleDateString('fr-FR') : '-'}</td>
                    <td>
                        <button class="delete-btn" onclick="deleteUser('\${user.email}')" title="Supprimer \${user.email}">
                            🗑️ Supprimer
                        </button>
                    </td>
                </tr>
            \`).join('');
            
            loadingEl.style.display = 'none';
            contentEl.style.display = 'block';
            
        } catch (error) {
            console.error('Erreur:', error);
            loadingEl.style.display = 'none';
            errorEl.style.display = 'block';
            errorEl.querySelector('p').textContent = \`❌ \${error.message}\`;
        }
    }
    
    // Suppression sécurisée d'un utilisateur
    async function deleteUser(email) {
        if (!email) return;
        
        const confirmMessage = \`⚠️ Confirmer la suppression ?\n\nEmail: \${email}\n\nCette action est irréversible.\`;
        if (!confirm(confirmMessage)) return;
        
        const deleteBtn = document.querySelector(\`button[onclick="deleteUser('\${email}')"]\`);
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '⏳';
        }
        
        try {
            const response = await fetch('/api/delete-user.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                alert(\`✅ Utilisateur \${email} supprimé avec succès\`);
                loadUsers(); // Recharger la liste
            } else {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur suppression:', error);
            alert(\`❌ Erreur: \${error.message}\`);
            
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = '🗑️ Supprimer';
            }
        }
    }
    
    // Chargement initial
    document.addEventListener('DOMContentLoaded', loadUsers);
    </script>
</body>
</html>`;
    }
    
    // Générateur de formulaire de contact
    function generateContactForm() {
        return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .contact-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: #333;
        }
        .header h1 {
            color: #667eea;
            margin-bottom: 10px;
        }
        .form-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group.full-width {
            grid-column: 1 / -1;
        }
        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #555;
        }
        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            box-sizing: border-box;
            transition: border-color 0.3s ease;
        }
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #667eea;
        }
        .form-group textarea {
            min-height: 120px;
            resize: vertical;
        }
        .submit-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 18px 40px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            transition: transform 0.2s ease;
        }
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        .submit-btn:disabled {
            background: #ccc;
            transform: none;
            cursor: not-allowed;
        }
        .success-message {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        .error-message {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            display: none;
        }
        @media (max-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="contact-container">
        <div class="header">
            <h1>🏥 Contactez-nous</h1>
            <p>Une question sur les traitements GLP1 ? Notre équipe vous répond rapidement.</p>
        </div>
        
        <div id="success-message" class="success-message">
            ✅ Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
        </div>
        
        <div id="error-message" class="error-message">
            ❌ Une erreur est survenue. Veuillez réessayer.
        </div>
        
        <form id="contact-form">
            <div class="form-grid">
                <div class="form-group">
                    <label for="firstname">Prénom *</label>
                    <input type="text" id="firstname" name="firstname" required>
                </div>
                
                <div class="form-group">
                    <label for="lastname">Nom *</label>
                    <input type="text" id="lastname" name="lastname" required>
                </div>
            </div>
            
            <div class="form-grid">
                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>
                
                <div class="form-group">
                    <label for="phone">Téléphone</label>
                    <input type="tel" id="phone" name="phone">
                </div>
            </div>
            
            <div class="form-group full-width">
                <label for="subject">Sujet *</label>
                <select id="subject" name="subject" required>
                    <option value="">Choisissez un sujet</option>
                    <option value="information-glp1">Informations sur les GLP1</option>
                    <option value="effets-secondaires">Effets secondaires</option>
                    <option value="prix-remboursement">Prix et remboursement</option>
                    <option value="medecin-specialiste">Trouver un médecin spécialisé</option>
                    <option value="temoignage">Témoignage / Expérience</option>
                    <option value="autre">Autre</option>
                </select>
            </div>
            
            <div class="form-group full-width">
                <label for="message">Message *</label>
                <textarea id="message" name="message" placeholder="Décrivez votre question ou demande..." required></textarea>
            </div>
            
            <button type="submit" class="submit-btn" id="submit-btn">
                📧 Envoyer le message
            </button>
        </form>
    </div>
    
    <script>
    document.getElementById('contact-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const successMsg = document.getElementById('success-message');
        const errorMsg = document.getElementById('error-message');
        
        // Cacher les messages précédents
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
        
        // Désactiver le bouton
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Envoi en cours...';
        
        try {
            const formData = new FormData(this);
            const data = Object.fromEntries(formData.entries());
            
            const response = await fetch('/api/contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                successMsg.style.display = 'block';
                this.reset(); // Vider le formulaire
                
                // Scroll vers le message de succès
                successMsg.scrollIntoView({ behavior: 'smooth' });
            } else {
                throw new Error(result.error || 'Erreur lors de l\\'envoi');
            }
            
        } catch (error) {
            console.error('Erreur:', error);
            errorMsg.style.display = 'block';
            errorMsg.textContent = \`❌ \${error.message}\`;
            
            // Scroll vers le message d'erreur
            errorMsg.scrollIntoView({ behavior: 'smooth' });
        } finally {
            // Réactiver le bouton
            submitBtn.disabled = false;
            submitBtn.textContent = '📧 Envoyer le message';
        }
    });
    </script>
</body>
</html>`;
    }
    
    // Générateur d'API de gestion d'utilisateurs
    function generateUserAPI(description) {
        return `<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

/**
 * API de Gestion d'Utilisateurs GLP1 France
 * ${description}
 * 
 * Endpoints:
 * GET    /api/users           - Liste tous les utilisateurs
 * POST   /api/users           - Créer un nouvel utilisateur
 * PUT    /api/users/{email}   - Mettre à jour un utilisateur
 * DELETE /api/users/{email}   - Supprimer un utilisateur
 */

// Configuration
define('DATA_FILE', __DIR__ . '/../../data/users-unified.json');
define('LOG_FILE', __DIR__ . '/../../logs/user-api.log');

// Classe de gestion des utilisateurs
class UserManager {
    
    public function getAllUsers() {
        try {
            if (!file_exists(DATA_FILE)) {
                return ['users' => []];
            }
            
            $jsonContent = file_get_contents(DATA_FILE);
            $data = json_decode($jsonContent, true);
            
            if (!$data || !isset($data['users'])) {
                return ['users' => []];
            }
            
            return $data;
        } catch (Exception $e) {
            $this->logError("Erreur lecture users: " . $e->getMessage());
            throw new Exception("Erreur de lecture des données");
        }
    }
    
    public function createUser($userData) {
        try {
            // Validation
            if (empty($userData['email']) || !filter_var($userData['email'], FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Email invalide");
            }
            
            $data = $this->getAllUsers();
            
            // Vérifier si l'email existe déjà
            foreach ($data['users'] as $user) {
                if ($user['email'] === $userData['email']) {
                    throw new Exception("Un utilisateur avec cet email existe déjà");
                }
            }
            
            // Créer le nouvel utilisateur
            $newUser = [
                'id' => uniqid('user_'),
                'email' => trim($userData['email']),
                'name' => trim($userData['name'] ?? ''),
                'phone' => trim($userData['phone'] ?? ''),
                'createdAt' => date('Y-m-d H:i:s'),
                'lastActivity' => null,
                'status' => 'active',
                'tags' => $userData['tags'] ?? []
            ];
            
            $data['users'][] = $newUser;
            
            if ($this->saveData($data)) {
                $this->logMessage("✅ Utilisateur créé: " . $newUser['email']);
                return $newUser;
            } else {
                throw new Exception("Erreur lors de la sauvegarde");
            }
            
        } catch (Exception $e) {
            $this->logError("Erreur création user: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function updateUser($email, $updateData) {
        try {
            $data = $this->getAllUsers();
            $userFound = false;
            
            foreach ($data['users'] as $key => $user) {
                if ($user['email'] === $email) {
                    // Mettre à jour les champs autorisés
                    $allowedFields = ['name', 'phone', 'status', 'tags'];
                    foreach ($allowedFields as $field) {
                        if (isset($updateData[$field])) {
                            $data['users'][$key][$field] = $updateData[$field];
                        }
                    }
                    
                    $data['users'][$key]['updatedAt'] = date('Y-m-d H:i:s');
                    $userFound = true;
                    break;
                }
            }
            
            if (!$userFound) {
                throw new Exception("Utilisateur introuvable");
            }
            
            if ($this->saveData($data)) {
                $this->logMessage("✅ Utilisateur mis à jour: $email");
                return $data['users'][$key];
            } else {
                throw new Exception("Erreur lors de la sauvegarde");
            }
            
        } catch (Exception $e) {
            $this->logError("Erreur update user: " . $e->getMessage());
            throw $e;
        }
    }
    
    public function deleteUser($email) {
        try {
            $data = $this->getAllUsers();
            $userFound = false;
            
            foreach ($data['users'] as $key => $user) {
                if ($user['email'] === $email) {
                    // Backup avant suppression
                    $this->createBackup($data);
                    
                    unset($data['users'][$key]);
                    $data['users'] = array_values($data['users']); // Réindexer
                    $userFound = true;
                    break;
                }
            }
            
            if (!$userFound) {
                throw new Exception("Utilisateur avec l'email $email introuvable");
            }
            
            if ($this->saveData($data)) {
                $this->logMessage("✅ Utilisateur supprimé: $email");
                return true;
            } else {
                throw new Exception("Erreur lors de la sauvegarde");
            }
            
        } catch (Exception $e) {
            $this->logError("Erreur suppression user: " . $e->getMessage());
            throw $e;
        }
    }
    
    private function saveData($data) {
        $directory = dirname(DATA_FILE);
        if (!is_dir($directory)) {
            mkdir($directory, 0755, true);
        }
        
        return file_put_contents(DATA_FILE, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) !== false;
    }
    
    private function createBackup($data) {
        $backupFile = DATA_FILE . '.backup.' . date('Y-m-d_H-i-s');
        file_put_contents($backupFile, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        $this->logMessage("💾 Backup créé: " . basename($backupFile));
    }
    
    private function logMessage($message) {
        $this->writeLog("INFO", $message);
    }
    
    private function logError($message) {
        $this->writeLog("ERROR", $message);
    }
    
    private function writeLog($level, $message) {
        $logDir = dirname(LOG_FILE);
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        $timestamp = date('Y-m-d H:i:s');
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $logEntry = "[$timestamp] [$level] [IP:$ip] $message" . PHP_EOL;
        file_put_contents(LOG_FILE, $logEntry, FILE_APPEND | LOCK_EX);
    }
}

// Traitement des requêtes
try {
    $userManager = new UserManager();
    $method = $_SERVER['REQUEST_METHOD'];
    $uri = $_SERVER['REQUEST_URI'];
    
    // Parser l'URI pour extraire l'email si présent
    $pathParts = explode('/', trim(parse_url($uri, PHP_URL_PATH), '/'));
    $email = isset($pathParts[2]) ? urldecode($pathParts[2]) : null;
    
    switch ($method) {
        case 'GET':
            // Liste tous les utilisateurs
            $data = $userManager->getAllUsers();
            echo json_encode([
                'success' => true,
                'data' => $data,
                'count' => count($data['users'])
            ]);
            break;
            
        case 'POST':
            // Créer un nouvel utilisateur
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception("Données JSON invalides");
            }
            
            $user = $userManager->createUser($input);
            echo json_encode([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'data' => $user
            ]);
            break;
            
        case 'PUT':
            // Mettre à jour un utilisateur
            if (!$email) {
                throw new Exception("Email requis dans l'URL");
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!$input) {
                throw new Exception("Données JSON invalides");
            }
            
            $user = $userManager->updateUser($email, $input);
            echo json_encode([
                'success' => true,
                'message' => 'Utilisateur mis à jour avec succès',
                'data' => $user
            ]);
            break;
            
        case 'DELETE':
            // Supprimer un utilisateur
            if (!$email) {
                // Essayer de récupérer l'email depuis le body JSON
                $input = json_decode(file_get_contents('php://input'), true);
                $email = $input['email'] ?? null;
            }
            
            if (!$email) {
                throw new Exception("Email requis");
            }
            
            $userManager->deleteUser($email);
            echo json_encode([
                'success' => true,
                'message' => "Utilisateur $email supprimé avec succès"
            ]);
            break;
            
        default:
            throw new Exception("Méthode HTTP non supportée");
    }
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>`;
    }
    
    // Générateur de template générique avec style GLP1
    function generateGenericTemplate(description) {
        return `<!-- Code généré pour: ${description} -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${description} - GLP1 France</title>
    <style>
        body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f8f9fa; 
        }
        .glp1-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            color: #666;
            margin: 15px 0 0 0;
            font-size: 1.1em;
        }
        .content-section {
            margin-bottom: 30px;
        }
        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .btn-primary:hover {
            transform: translateY(-2px);
        }
        .card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #667eea;
            margin-bottom: 20px;
        }
        .card h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        @media (max-width: 768px) {
            .glp1-container {
                padding: 20px;
            }
            .header h1 {
                font-size: 2em;
            }
        }
    </style>
</head>
<body>
    <div class="glp1-container">
        <div class="header">
            <h1>🏥 ${description}</h1>
            <p>Développé pour GLP1 France - Site de référence sur les traitements GLP1</p>
        </div>
        
        <div class="content-section">
            <div class="card">
                <h3>✨ Fonctionnalité en développement</h3>
                <p>Cette section sera complétée avec les fonctionnalités spécifiques à votre demande.</p>
            </div>
            
            <div class="card">
                <h3>🎯 Objectifs</h3>
                <ul>
                    <li>Interface utilisateur intuitive</li>
                    <li>Design cohérent avec l'identité GLP1 France</li>
                    <li>Optimisation mobile et desktop</li>
                    <li>Sécurité et performance</li>
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 40px;">
                <button class="btn-primary" onclick="alert('Fonctionnalité à implémenter')">
                    🚀 Action principale
                </button>
            </div>
        </div>
    </div>
    
    <script>
    // Code JavaScript personnalisé pour ${description}
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Page chargée: ${description}');
        
        // Ajoutez ici votre logique métier
    });
    </script>
</body>
</html>`;
    }
    
    // ========== FIN FONCTIONS DE GÉNÉRATION ==========function activate(context) {
    console.log('RAGLP Extension activée !');
    
    // Afficher un message de bienvenue
    vscode.window.showInformationMessage('RAGLP Assistant activé ! Tapez Ctrl+Shift+P puis "RAGLP"');
    
    // Commande simple de test
    let testCommand = vscode.commands.registerCommand('raglp.test', () => {
        vscode.window.showInformationMessage('Extension RAGLP fonctionne parfaitement !');
    });
    
    // Commande principale RAG
    let askCommand = vscode.commands.registerCommand('raglp.ask', async () => {
        const query = await vscode.window.showInputBox({
            prompt: 'Posez votre question sur GLP1, Ozempic, Wegovy...',
            placeHolder: 'Ex: Quel est le prix d\'Ozempic en France ?'
        });
        
        if (!query) return;
        
        // Recherche améliorée dans les réponses
        const queryLower = query.toLowerCase();
        let response = '';
        let foundKeyword = '';
        
        // Recherche de mots-clés (recherche plus permissive)
        for (const [keyword, answer] of Object.entries(GLP1_RESPONSES)) {
            if (queryLower.includes(keyword) || 
                queryLower.includes(keyword.replace('1', '')) || // glp sans 1
                (keyword === 'effets' && (queryLower.includes('secondaire') || queryLower.includes('effet'))) ||
                (keyword === 'prix' && (queryLower.includes('cout') || queryLower.includes('coute') || queryLower.includes('tarif'))) ||
                (keyword === 'remboursement' && (queryLower.includes('rembourse') || queryLower.includes('secu'))) ||
                (keyword === 'ozempic' && queryLower.includes('ozem')) ||
                (keyword === 'wegovy' && queryLower.includes('wego'))) {
                response = answer;
                foundKeyword = keyword;
                break;
            }
        }
        
        if (!response) {
            response = `Question recue : "${query}"\n\nDesolé, je n'ai pas trouve de reponse specifique. Essayez des mots-cles comme :\n- ozempic, wegovy, semaglutide\n- prix, cout, remboursement\n- effets, diabete, obesite`;
        } else {
            response = `[${foundKeyword.toUpperCase()}] ${response}`;
        }
        
        // Créer un nouveau document avec la réponse
        const doc = await vscode.workspace.openTextDocument({
            content: `# RAGLP Assistant

## Question
${query}

## Réponse
${response}

---
*Généré le ${new Date().toLocaleString()} par RAGLP Assistant*`,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    });
    
    // Commande génération de code
    let codeCommand = vscode.commands.registerCommand('raglp.generateCode', async () => {
        const description = await vscode.window.showInputBox({
            prompt: 'Décrivez le code à générer pour le site GLP1',
            placeHolder: 'Ex: dashboard admin users, calculateur IMC, formulaire contact'
        });
        
        if (!description) return;
        
        let code = '';
        
        // Analyser la description pour générer le bon code
        const desc = description.toLowerCase();
        
        if (desc.includes('dashboard') && (desc.includes('user') || desc.includes('utilisateur'))) {
            // Générer un dashboard de gestion d'utilisateurs
            code = generateUserDashboard(description);
        } else if (desc.includes('calculateur') || desc.includes('imc')) {
            // Générer calculateur IMC (code existant amélioré)
            code = `<!DOCTYPE html>
<html>
<head>
    <title>Calculateur IMC GLP1</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
        .form-group { margin: 15px 0; }
        input { padding: 10px; width: 200px; border: 1px solid #ddd; border-radius: 5px; }
        button { padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
        .result { margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>🏥 Calculateur IMC avec Recommandations GLP1</h1>
    
    <div class="form-group">
        <label>Poids (kg):</label><br>
        <input type="number" id="weight" placeholder="70">
    </div>
    
    <div class="form-group">
        <label>Taille (cm):</label><br>
        <input type="number" id="height" placeholder="170">
    </div>
    
    <button onclick="calculateIMC()">Calculer IMC</button>
    
    <div id="result" class="result" style="display:none;"></div>
    
    <script>
    function calculateIMC() {
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value) / 100;
        
        if (!weight || !height) {
            alert('Veuillez saisir votre poids et taille');
            return;
        }
        
        const imc = weight / (height * height);
        const result = document.getElementById('result');
        
        let category = '';
        let glp1Recommendation = '';
        
        if (imc < 18.5) {
            category = 'Insuffisance pondérale';
            glp1Recommendation = 'GLP1 non recommandé';
        } else if (imc < 25) {
            category = 'Poids normal';
            glp1Recommendation = 'GLP1 non nécessaire';
        } else if (imc < 30) {
            category = 'Surpoids';
            glp1Recommendation = 'Consultez votre médecin pour évaluer les options';
        } else {
            category = 'Obésité';
            glp1Recommendation = 'GLP1 peut être bénéfique - consultez un spécialiste';
        }
        
        result.innerHTML = \`
            <h3>Résultats</h3>
            <p><strong>IMC:</strong> \${imc.toFixed(1)}</p>
            <p><strong>Catégorie:</strong> \${category}</p>
            <p><strong>Recommandation GLP1:</strong> \${glp1Recommendation}</p>
        \`;
        result.style.display = 'block';
    }
    </script>
</body>
</html>`;
        } else if (desc.includes('formulaire') || desc.includes('contact')) {
            // Générer formulaire de contact
            code = generateContactForm();
        } else if (desc.includes('api') && (desc.includes('user') || desc.includes('utilisateur'))) {
            // Générer API de gestion d'utilisateurs
            code = generateUserAPI(description);
        } else {
            // Template générique avec style GLP1
            code = generateGenericTemplate(description);
        }
        
        // Créer un nouveau fichier avec le code
        const doc = await vscode.workspace.openTextDocument({
            content: code,
            language: 'html'
        });
        
        await vscode.window.showTextDocument(doc);
    });
    
    // Commande génération de prompts pour développement
    let promptCommand = vscode.commands.registerCommand('raglp.generatePrompt', async () => {
        const description = await vscode.window.showInputBox({
            prompt: 'Décrivez la fonctionnalité à développer pour le site GLP1',
            placeHolder: 'Ex: supprimer des users dans dashboard admin avec sécurité'
        });
        
        if (!description) return;
        
        // Analyser la demande et générer un prompt structuré
        const prompt = generateDevelopmentPrompt(description);
        
        // Créer un nouveau document avec le prompt optimisé
        const doc = await vscode.workspace.openTextDocument({
            content: prompt,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    });
    
    context.subscriptions.push(testCommand, askCommand, codeCommand, promptCommand);
}

// Fonction pour générer des prompts de développement optimisés
function generateDevelopmentPrompt(description) {
    const timestamp = new Date().toLocaleString();
    
    // Analyser les mots-clés de la demande
    const descLower = description.toLowerCase();
    let context = '';
    let priorites = '';
    let exemples = '';
    
    // Contexte spécifique selon le type de demande
    if (descLower.includes('user') || descLower.includes('utilisateur')) {
        context = `## 🏥 Contexte Site GLP1
- Site médical français spécialisé GLP1/Ozempic/Wegovy
- Gestion utilisateurs avec données sensibles
- Architecture : Frontend + Backend PHP + Base données
- Sécurité renforcée (données médicales)
- Différence environnement local/production`;
        
        priorites = `## 🎯 Priorités de Développement
1. **Sécurité** : Validation, authentification, autorisation
2. **Conformité RGPD** : Gestion données personnelles
3. **Audit Trail** : Logs des actions administrateur
4. **Interface Admin** : UX claire et sécurisée
5. **Tests** : Local + Production`;
        
        exemples = `## 💡 Exemples de Fonctionnalités Similaires
- Système de connexion existant
- Dashboard admin actuel
- Gestion des données utilisateurs
- Logs de sécurité`;
    } else if (descLower.includes('calculateur') || descLower.includes('outil')) {
        context = `## 🏥 Contexte Site GLP1
- Site médical éducatif sur GLP1
- Outils interactifs pour patients
- Design responsive et accessible
- SEO optimisé pour le domaine médical`;
        
        exemples = `## 💡 Références Existantes
- Calculateurs médicaux actuels
- Widgets interactifs du site
- Design system GLP1
- Standards UX/UI médicaux`;
    } else {
        context = `## 🏥 Contexte Site GLP1
- Site médical français GLP1/Ozempic/Wegovy
- Stack : HTML/CSS/JS + PHP + Base données
- Optimisation SEO et performance
- Conformité standards médicaux`;
    }
    
    return `# 🚀 Prompt de Développement RAGLP

**Généré le ${timestamp}**

## 📋 Demande Originale
${description}

${context}

${priorites}

## 🛠️ Instructions de Développement

**Tu es un expert développeur full-stack spécialisé en applications médicales.**

Développe cette fonctionnalité en tenant compte de :

### 🔒 Sécurité
- Validation stricte des entrées
- Protection contre injections SQL/XSS
- Gestion des sessions et permissions
- Chiffrement des données sensibles

### 📁 Architecture Fichiers
- **Local** : \`c:\\Users\\robin\\Documents\\glp1official\\glp1\`
- **Production** : Différente structure (data hors public_html)
- Chemins absolus vs relatifs selon environnement

### 🎨 Standards de Code
- PHP 8+ avec bonnes pratiques
- JavaScript moderne (ES6+)
- CSS responsive et accessible
- Commentaires explicatifs

### 🧪 Tests et Validation
- Tests en local d'abord
- Validation sécurité
- Tests utilisateur
- Déploiement progressif

${exemples}

## ✅ Livrables Attendus
1. **Code source** complet et documenté
2. **Instructions d'installation** local/production
3. **Tests de sécurité** et validation
4. **Documentation** utilisateur si besoin

## 🎯 Objectif Final
Fonctionnalité sécurisée, testée et prête pour production sur le site GLP1.

---
*Prompt généré par RAGLP Assistant pour optimiser le développement*`;
}

function deactivate() {}

module.exports = { activate, deactivate };
