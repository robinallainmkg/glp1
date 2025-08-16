<?php
// Activer l'affichage des erreurs pour debug
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Uniquement GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

// Fonction de log sécurisée
function logMessage($message) {
    $logFile = __DIR__ . '/../../logs/users-api.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logEntry = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logEntry, FILE_APPEND | LOCK_EX);
}

try {
    logMessage("📊 Début chargement des utilisateurs - IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown'));
    
    // Détection de l'environnement
    $isLocal = (isset($_SERVER['HTTP_HOST']) && (
        strpos($_SERVER['HTTP_HOST'], 'localhost') !== false ||
        strpos($_SERVER['HTTP_HOST'], '127.0.0.1') !== false
    ));
    
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
    
    logMessage("🔍 Environnement: " . ($isLocal ? 'LOCAL' : 'PRODUCTION'));
    logMessage("📁 Chemin fichier: $dataFile");
    
    if (!file_exists($dataFile)) {
        throw new Exception('Fichier de données utilisateurs introuvable: ' . $dataFile);
    }
    
    // Lire les données
    $jsonContent = file_get_contents($dataFile);
    if ($jsonContent === false) {
        throw new Exception('Impossible de lire le fichier de données');
    }
    
    $allData = json_decode($jsonContent, true);
    if (!$allData) {
        throw new Exception('Données JSON invalides');
    }
    
    // Vérifier la structure
    if (!isset($allData['users']) || !is_array($allData['users'])) {
        throw new Exception('Structure de données invalide - clé "users" manquante');
    }
    
    $users = $allData['users'];
    logMessage("👥 Nombre d'utilisateurs trouvés: " . count($users));
    
    // Calculer les statistiques
    $now = new DateTime();
    $weekAgo = (clone $now)->sub(new DateInterval('P7D'));
    $monthAgo = (clone $now)->sub(new DateInterval('P30D'));
    
    $totalUsers = count($users);
    $newsletterSubscribers = 0;
    $recentUsers = 0;
    
    foreach ($users as $user) {
        // Compteur newsletter
        if (isset($user['isNewsletterSubscriber']) && $user['isNewsletterSubscriber']) {
            $newsletterSubscribers++;
        }
        
        // Utilisateurs récents (7 jours)
        if (isset($user['firstSeen'])) {
            try {
                $userDate = new DateTime($user['firstSeen']);
                if ($userDate >= $weekAgo) {
                    $recentUsers++;
                }
            } catch (Exception $e) {
                // Ignorer les dates invalides
            }
        }
    }
    
    $stats = [
        'totalUsers' => $totalUsers,
        'newsletterSubscribers' => $newsletterSubscribers,
        'recentUsers' => $recentUsers
    ];
    
    logMessage("📈 Statistiques calculées: " . json_encode($stats));
    
    // Trier les utilisateurs par date de première visite (plus récent en premier)
    usort($users, function($a, $b) {
        $dateA = isset($a['firstSeen']) ? $a['firstSeen'] : '1970-01-01';
        $dateB = isset($b['firstSeen']) ? $b['firstSeen'] : '1970-01-01';
        return strcmp($dateB, $dateA);
    });
    
    // Réponse de succès
    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'users' => $users,
        'environment' => $isLocal ? 'local' : 'production',
        'dataFile' => basename($dataFile),
        'timestamp' => $now->format('Y-m-d H:i:s')
    ]);
    
    logMessage("✅ Données utilisateurs envoyées avec succès");
    
} catch (Exception $e) {
    $errorMessage = $e->getMessage();
    logMessage("❌ Erreur: $errorMessage");
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'error' => $errorMessage,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
