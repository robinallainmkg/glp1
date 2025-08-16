<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion CORS pour préflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Uniquement POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

/**
 * API de Suppression d'Utilisateurs - Compatible Hostinger
 * Version production avec détection automatique de l'environnement
 */

// Fonction de détection de l'environnement
function detectEnvironment() {
    $currentDir = __DIR__;
    $serverName = $_SERVER['SERVER_NAME'] ?? '';
    
    // Si on est sur Hostinger (domaine public)
    if (strpos($serverName, 'glp1-france.com') !== false || 
        strpos($serverName, 'hostinger') !== false ||
        !strpos($serverName, 'localhost')) {
        
        return 'production';
    }
    
    // Environnement local
    return 'local';
}

// Configuration des chemins selon l'environnement
function getDataPaths() {
    $env = detectEnvironment();
    
    if ($env === 'production') {
        // Chemins Hostinger - ajustez selon votre structure
        return [
            'data_file' => __DIR__ . '/../../../data/users-unified.json',
            'backup_dir' => __DIR__ . '/../../../data/backups/',
            'log_file' => __DIR__ . '/../../../logs/user-deletions.log'
        ];
    } else {
        // Chemins locaux
        return [
            'data_file' => __DIR__ . '/../../data/users-unified.json',
            'backup_dir' => __DIR__ . '/../../data/backups/',
            'log_file' => __DIR__ . '/../../logs/user-deletions.log'
        ];
    }
}

// Fonction de log sécurisée
function logMessage($message, $logFile) {
    $logDir = dirname($logFile);
    
    // Créer le dossier de logs si nécessaire
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $userAgent = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 100);
    $env = detectEnvironment();
    
    $logEntry = "[$timestamp] [$env] [IP:$ip] $message [UA:$userAgent]" . PHP_EOL;
    
    // Écriture thread-safe
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

try {
    $paths = getDataPaths();
    $dataFile = $paths['data_file'];
    $backupDir = $paths['backup_dir'];
    $logFile = $paths['log_file'];
    
    logMessage("🗑️ Début suppression utilisateur - Env: " . detectEnvironment(), $logFile);
    
    // Lire les données JSON de la requête
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data || !isset($data['email'])) {
        throw new Exception('Email manquant dans la requête');
    }
    
    $emailToDelete = trim(strtolower($data['email']));
    
    if (empty($emailToDelete)) {
        throw new Exception('Email vide');
    }
    
    if (!filter_var($emailToDelete, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Format d\'email invalide');
    }
    
    logMessage("📧 Email à supprimer: $emailToDelete", $logFile);
    
    // Vérifier l'existence du fichier de données
    if (!file_exists($dataFile)) {
        logMessage("❌ Fichier de données introuvable: $dataFile", $logFile);
        throw new Exception('Fichier de données utilisateurs introuvable');
    }
    
    // Lire les données actuelles
    $jsonContent = file_get_contents($dataFile);
    if ($jsonContent === false) {
        throw new Exception('Impossible de lire le fichier de données');
    }
    
    $allData = json_decode($jsonContent, true);
    
    if (!$allData) {
        throw new Exception('Données JSON invalides ou fichier corrompu');
    }
    
    // Vérifier la structure des données
    if (!isset($allData['users']) || !is_array($allData['users'])) {
        throw new Exception('Structure de données invalide - clé "users" manquante');
    }
    
    // Chercher l'utilisateur à supprimer
    $userFound = false;
    $originalCount = count($allData['users']);
    $userData = null;
    
    foreach ($allData['users'] as $key => $user) {
        if (isset($user['email']) && strtolower(trim($user['email'])) === $emailToDelete) {
            $userData = $user;
            logMessage("👤 Utilisateur trouvé: " . ($user['name'] ?? 'Nom inconnu') . " - Index: $key", $logFile);
            
            // Supprimer l'utilisateur
            unset($allData['users'][$key]);
            $userFound = true;
            break;
        }
    }
    
    if (!$userFound) {
        logMessage("❌ Utilisateur non trouvé: $emailToDelete", $logFile);
        throw new Exception("Utilisateur avec l'email $emailToDelete introuvable");
    }
    
    // Réindexer le tableau des utilisateurs
    $allData['users'] = array_values($allData['users']);
    $newCount = count($allData['users']);
    
    // Créer un backup avant la sauvegarde
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    
    $backupFile = $backupDir . 'users-backup-' . date('Y-m-d_H-i-s') . '.json';
    $backupData = json_encode(json_decode($jsonContent, true), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($backupFile, $backupData) === false) {
        logMessage("⚠️ Échec création backup: $backupFile", $logFile);
        throw new Exception('Impossible de créer le backup de sécurité');
    }
    
    logMessage("💾 Backup créé: " . basename($backupFile), $logFile);
    
    // Sauvegarder les nouvelles données
    $newJsonData = json_encode($allData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    
    if (file_put_contents($dataFile, $newJsonData) === false) {
        logMessage("❌ Échec sauvegarde: $dataFile", $logFile);
        throw new Exception('Erreur lors de la sauvegarde des données');
    }
    
    logMessage("✅ Utilisateur supprimé avec succès. Utilisateurs: $originalCount → $newCount", $logFile);
    
    // Nettoyer les anciens backups (garder seulement les 10 derniers)
    $backupFiles = glob($backupDir . 'users-backup-*.json');
    if (count($backupFiles) > 10) {
        usort($backupFiles, function($a, $b) {
            return filemtime($a) - filemtime($b);
        });
        
        $filesToDelete = array_slice($backupFiles, 0, count($backupFiles) - 10);
        foreach ($filesToDelete as $oldBackup) {
            unlink($oldBackup);
        }
        logMessage("🧹 Nettoyage: " . count($filesToDelete) . " anciens backups supprimés", $logFile);
    }
    
    // Réponse de succès avec informations détaillées
    echo json_encode([
        'success' => true,
        'message' => "Utilisateur $emailToDelete supprimé avec succès",
        'data' => [
            'emailDeleted' => $emailToDelete,
            'userName' => $userData['name'] ?? 'Nom inconnu',
            'previousCount' => $originalCount,
            'newCount' => $newCount,
            'backupFile' => basename($backupFile),
            'environment' => detectEnvironment(),
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
    
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    
    if (isset($logFile)) {
        logMessage("❌ Erreur: $errorMessage", $logFile);
    }
    
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $errorMessage,
        'environment' => detectEnvironment(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
