<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Fonction de log sécurisée
function logMessage($message) {
    $logFile = __DIR__ . '/../../logs/delete-user.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

try {
    logMessage("🗑️ Début suppression utilisateur - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    
    // Lire les données JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['email'])) {
        throw new Exception('Email manquant dans la requête');
    }
    
    $emailToDelete = trim($data['email']);
    
    if (empty($emailToDelete)) {
        throw new Exception('Email vide');
    }
    
    if (!filter_var($emailToDelete, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Format d\'email invalide');
    }
    
    logMessage("📧 Email à supprimer: $emailToDelete");
    
    // Chemin du fichier de données unifié
    // Essayer plusieurs chemins possibles sur Hostinger
    $possiblePaths = [
        __DIR__ . '/../../data/users-unified.json',
        __DIR__ . '/../../../data/users-unified.json',
        '/home/u403023291/domains/glp1-france.fr/public_html/data/users-unified.json',
        '/home/u403023291/domains/glp1-france.fr/data/users-unified.json'
    ];
    
    $dataFile = null;
    foreach ($possiblePaths as $path) {
        if (file_exists($path)) {
            $dataFile = $path;
            logMessage("📁 Fichier trouvé: $path");
            break;
        } else {
            logMessage("❌ Fichier non trouvé: $path");
        }
    }
    
    if (!$dataFile) {
        // Utiliser le chemin par défaut si aucun n'est trouvé
        $dataFile = __DIR__ . '/../../data/users-unified.json';
        logMessage("⚠️ Utilisation du chemin par défaut: $dataFile");
    }
    
    if (!file_exists($dataFile)) {
        throw new Exception('Fichier de données introuvable');
    }
    
    // Lire les données actuelles
    $jsonContent = file_get_contents($dataFile);
    $allData = json_decode($jsonContent, true);
    
    if (!$allData) {
        throw new Exception('Impossible de lire les données existantes');
    }
    
    // Vérifier que la structure contient la clé 'users'
    if (!isset($allData['users']) || !is_array($allData['users'])) {
        throw new Exception('Structure de données invalide - clé "users" manquante');
    }
    
    // Debug: afficher la structure des données
    logMessage("📊 Structure des données: " . json_encode(array_keys($allData)));
    logMessage("👥 Nombre d'utilisateurs dans le fichier: " . count($allData['users']));
    
    // Debug: lister tous les emails présents
    $emailsInFile = array_map(function($user) {
        return $user['email'] ?? 'NO_EMAIL';
    }, $allData['users']);
    logMessage("📧 Emails présents: " . implode(', ', $emailsInFile));
    
    // Chercher et supprimer l'utilisateur
    $userFound = false;
    $originalCount = count($allData['users']);
    
    foreach ($allData['users'] as $key => $userData) {
        $userEmail = isset($userData['email']) ? trim(strtolower($userData['email'])) : '';
        $searchEmail = trim(strtolower($emailToDelete));
        
        logMessage("🔍 Comparaison: '$userEmail' vs '$searchEmail'");
        
        if ($userEmail === $searchEmail) {
            logMessage("👤 Utilisateur trouvé: " . ($userData['name'] ?? 'Nom inconnu') . " - Index: $key");
            unset($allData['users'][$key]);
            $userFound = true;
            break;
        }
    }
    
    if (!$userFound) {
        throw new Exception("Utilisateur avec l'email $emailToDelete introuvable");
    }
    
    // Réindexer le tableau des utilisateurs
    $allData['users'] = array_values($allData['users']);
    $newCount = count($allData['users']);
    
    // Sauvegarde avec backup
    $backupFile = $dataFile . '.backup.' . date('Y-m-d_H-i-s');
    copy($dataFile, $backupFile);
    logMessage("💾 Backup créé: $backupFile");
    
    // Sauvegarder les nouvelles données
    if (file_put_contents($dataFile, json_encode($allData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) === false) {
        throw new Exception('Erreur lors de la sauvegarde');
    }
    
    logMessage("✅ Utilisateur supprimé avec succès. Nombre d'utilisateurs: $originalCount → $newCount");
    
    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => "Utilisateur $emailToDelete supprimé avec succès",
        'data' => [
            'emailDeleted' => $emailToDelete,
            'previousCount' => $originalCount,
            'newCount' => $newCount,
            'backupFile' => basename($backupFile)
        ]
    ]);
    
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    logMessage("❌ Erreur: $errorMessage");
    
    http_response_code(400);
    echo json_encode([
        'success' => false, 
        'error' => $errorMessage
    ]);
}
?>
