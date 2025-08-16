<?php
/**
 * Gestionnaire d'utilisateurs - Version corrigée avec l'aide de l'IA
 * Fonctionne en local ET en production
 */

// Configuration flexible pour local/production
$json_file_path = '../data/users-unified.json'; // Chemin corrigé

// Fonction pour lire les données des utilisateurs
function getUsers() {
    global $json_file_path;
    
    // Vérifier si le fichier existe
    if (!file_exists($json_file_path)) {
        // Créer le fichier avec un tableau vide si il n'existe pas
        file_put_contents($json_file_path, json_encode([], JSON_PRETTY_PRINT));
        return [];
    }
    
    $json_data = file_get_contents($json_file_path);
    $users = json_decode($json_data, true);
    
    // Vérifier que le JSON est valide
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Erreur JSON dans users-unified.json: " . json_last_error_msg());
        return [];
    }
    
    return $users ?: [];
}

// Fonction pour sauvegarder les utilisateurs
function saveUsers($users) {
    global $json_file_path;
    
    // Créer le répertoire si nécessaire
    $directory = dirname($json_file_path);
    if (!is_dir($directory)) {
        mkdir($directory, 0755, true);
    }
    
    // Sauvegarder avec gestion d'erreur
    $result = file_put_contents($json_file_path, json_encode(array_values($users), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        error_log("Impossible d'écrire dans le fichier: " . $json_file_path);
        return false;
    }
    
    return true;
}

// Fonction pour supprimer un utilisateur
function deleteUser($email) {
    $users = getUsers();
    $found = false;
    
    foreach ($users as $key => $user) {
        if (isset($user['email']) && $user['email'] === $email) {
            unset($users[$key]);
            $found = true;
            break;
        }
    }
    
    if ($found) {
        return saveUsers($users);
    }
    
    return false; // Utilisateur non trouvé
}

// Fonction pour ajouter un utilisateur (bonus)
function addUser($userData) {
    $users = getUsers();
    
    // Vérifier si l'email existe déjà
    foreach ($users as $user) {
        if (isset($user['email']) && $user['email'] === $userData['email']) {
            return false; // Email déjà existant
        }
    }
    
    $users[] = $userData;
    return saveUsers($users);
}

// Fonction pour mettre à jour un utilisateur (bonus)
function updateUser($email, $newData) {
    $users = getUsers();
    
    foreach ($users as $key => $user) {
        if (isset($user['email']) && $user['email'] === $email) {
            $users[$key] = array_merge($user, $newData);
            return saveUsers($users);
        }
    }
    
    return false; // Utilisateur non trouvé
}

// API REST pour les opérations AJAX
if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
    header('Content-Type: application/json');
    
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'delete':
            $email = $input['email'] ?? '';
            if (empty($email)) {
                echo json_encode(['success' => false, 'error' => 'Email requis']);
                exit;
            }
            
            if (deleteUser($email)) {
                echo json_encode(['success' => true, 'message' => 'Utilisateur supprimé avec succès']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Utilisateur non trouvé']);
            }
            exit;
            
        case 'add':
            $userData = $input['userData'] ?? [];
            if (empty($userData['email'])) {
                echo json_encode(['success' => false, 'error' => 'Email requis']);
                exit;
            }
            
            if (addUser($userData)) {
                echo json_encode(['success' => true, 'message' => 'Utilisateur ajouté avec succès']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Email déjà existant']);
            }
            exit;
            
        case 'update':
            $email = $input['email'] ?? '';
            $newData = $input['newData'] ?? [];
            
            if (empty($email)) {
                echo json_encode(['success' => false, 'error' => 'Email requis']);
                exit;
            }
            
            if (updateUser($email, $newData)) {
                echo json_encode(['success' => true, 'message' => 'Utilisateur mis à jour avec succès']);
            } else {
                echo json_encode(['success' => false, 'error' => 'Utilisateur non trouvé']);
            }
            exit;
            
        case 'list':
            echo json_encode(['success' => true, 'users' => getUsers()]);
            exit;
            
        default:
            echo json_encode(['success' => false, 'error' => 'Action non reconnue']);
            exit;
    }
}

// Gérer les formulaires classiques (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = ['success' => false, 'message' => ''];
    
    if (isset($_POST['delete_email'])) {
        $email = trim($_POST['delete_email']);
        if (empty($email)) {
            $response['message'] = 'Email requis pour la suppression';
        } elseif (deleteUser($email)) {
            $response['success'] = true;
            $response['message'] = 'Utilisateur supprimé avec succès';
        } else {
            $response['message'] = 'Utilisateur avec l\'email ' . htmlspecialchars($email) . ' introuvable';
        }
    }
    
    if (isset($_POST['add_user'])) {
        $userData = [
            'email' => trim($_POST['email'] ?? ''),
            'name' => trim($_POST['name'] ?? ''),
            'phone' => trim($_POST['phone'] ?? ''),
            'created_at' => date('Y-m-d H:i:s')
        ];
        
        if (empty($userData['email'])) {
            $response['message'] = 'Email requis';
        } elseif (addUser($userData)) {
            $response['success'] = true;
            $response['message'] = 'Utilisateur ajouté avec succès';
        } else {
            $response['message'] = 'Email déjà existant';
        }
    }
    
    // Redirection pour éviter la resoumission
    if ($response['success']) {
        header("Location: " . $_SERVER['PHP_SELF'] . "?success=" . urlencode($response['message']));
        exit();
    } else {
        header("Location: " . $_SERVER['PHP_SELF'] . "?error=" . urlencode($response['message']));
        exit();
    }
}

// Lire les utilisateurs pour l'affichage
$users = getUsers();
$message = '';
$messageType = '';

if (isset($_GET['success'])) {
    $message = $_GET['success'];
    $messageType = 'success';
} elseif (isset($_GET['error'])) {
    $message = $_GET['error'];
    $messageType = 'error';
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎯 Gestionnaire d'Utilisateurs - Version IA</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        .header h1 {
            color: #667eea;
            margin: 0;
        }
        .header p {
            color: #666;
            margin: 10px 0 0 0;
        }
        .actions {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .action-card {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #28a745;
        }
        .action-card h3 {
            margin: 0 0 15px 0;
            color: #333;
        }
        .form-group {
            margin-bottom: 15px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: #555;
        }
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
            outline: none;
            box-sizing: border-box;
        }
        .form-group input:focus {
            border-color: #667eea;
        }
        .btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .btn:hover {
            background: #218838;
            transform: translateY(-2px);
        }
        .btn-danger {
            background: #dc3545;
        }
        .btn-danger:hover {
            background: #c82333;
        }
        .users-table {
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .table {
            width: 100%;
            border-collapse: collapse;
        }
        .table th, .table td {
            padding: 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        .table th {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
        .table tr:hover {
            background: #f8f9fa;
        }
        .alert {
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: 500;
        }
        .alert-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            border-left: 4px solid #667eea;
        }
        .stat-number {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
        }
        .debug-info {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-family: monospace;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Gestionnaire d'Utilisateurs GLP1</h1>
            <p>Version améliorée avec l'IA - Compatible local/production</p>
        </div>
        
        <?php if ($message): ?>
            <div class="alert alert-<?php echo $messageType; ?>">
                <?php echo htmlspecialchars($message); ?>
            </div>
        <?php endif; ?>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number"><?php echo count($users); ?></div>
                <div>Utilisateurs Total</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo file_exists($json_file_path) ? '✅' : '❌'; ?></div>
                <div>Fichier JSON</div>
            </div>
            <div class="stat-card">
                <div class="stat-number"><?php echo is_writable(dirname($json_file_path)) ? '✅' : '❌'; ?></div>
                <div>Dossier Accessible</div>
            </div>
        </div>
        
        <div class="actions">
            <div class="action-card">
                <h3>➕ Ajouter un Utilisateur</h3>
                <form method="POST">
                    <div class="form-group">
                        <label>Email :</label>
                        <input type="email" name="email" required>
                    </div>
                    <div class="form-group">
                        <label>Nom :</label>
                        <input type="text" name="name" required>
                    </div>
                    <div class="form-group">
                        <label>Téléphone :</label>
                        <input type="tel" name="phone">
                    </div>
                    <button type="submit" name="add_user" class="btn">Ajouter</button>
                </form>
            </div>
            
            <div class="action-card">
                <h3>🗑️ Supprimer un Utilisateur</h3>
                <form method="POST">
                    <div class="form-group">
                        <label>Email à supprimer :</label>
                        <input type="email" name="delete_email" required placeholder="user@example.com">
                    </div>
                    <button type="submit" class="btn btn-danger" onclick="return confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')">Supprimer</button>
                </form>
            </div>
        </div>
        
        <div class="users-table">
            <h3 style="padding: 20px; margin: 0; background: #f8f9fa; border-bottom: 1px solid #eee;">📋 Liste des Utilisateurs</h3>
            
            <?php if (empty($users)): ?>
                <div style="padding: 40px; text-align: center; color: #666;">
                    <p>Aucun utilisateur trouvé.</p>
                    <small>Ajoutez votre premier utilisateur ci-dessus !</small>
                </div>
            <?php else: ?>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Nom</th>
                            <th>Téléphone</th>
                            <th>Date Création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $user): ?>
                            <tr>
                                <td><?php echo htmlspecialchars($user['email'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($user['name'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($user['phone'] ?? ''); ?></td>
                                <td><?php echo htmlspecialchars($user['created_at'] ?? ''); ?></td>
                                <td>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Supprimer <?php echo htmlspecialchars($user['email']); ?> ?')">
                                        <input type="hidden" name="delete_email" value="<?php echo htmlspecialchars($user['email']); ?>">
                                        <button type="submit" class="btn btn-danger" style="padding: 5px 10px; font-size: 12px;">Supprimer</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        
        <div class="debug-info">
            <strong>🔧 Informations Debug :</strong><br>
            Chemin fichier : <?php echo $json_file_path; ?><br>
            Fichier existe : <?php echo file_exists($json_file_path) ? 'OUI' : 'NON'; ?><br>
            Dossier writable : <?php echo is_writable(dirname($json_file_path)) ? 'OUI' : 'NON'; ?><br>
            Nombre d'utilisateurs : <?php echo count($users); ?>
        </div>
    </div>
</body>
</html>
