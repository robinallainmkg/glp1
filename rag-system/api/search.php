<?php
/**
 * 🔍 API de recherche RAG pour GLP1-France
 * Permet la recherche sémantique dans le contenu indexé
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

class GLP1RAGSearch {
    private $openai_api_key;
    private $embeddings_file;
    private $embedding_model = 'text-embedding-3-small';
    
    public function __construct($api_key) {
        $this->openai_api_key = $api_key;
        $this->embeddings_file = __DIR__ . '/../embeddings/glp1_embeddings.json';
    }
    
    /**
     * Crée un embedding pour une requête
     */
    private function createQueryEmbedding($query) {
        $data = [
            'input' => $query,
            'model' => $this->embedding_model
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/embeddings');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->openai_api_key
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erreur API OpenAI: ' . $response);
        }
        
        $result = json_decode($response, true);
        return $result['data'][0]['embedding'];
    }
    
    /**
     * Calcule la similarité cosinus entre deux vecteurs
     */
    private function cosineSimilarity($vec1, $vec2) {
        $dotProduct = 0;
        $norm1 = 0;
        $norm2 = 0;
        
        for ($i = 0; $i < count($vec1); $i++) {
            $dotProduct += $vec1[$i] * $vec2[$i];
            $norm1 += $vec1[$i] * $vec1[$i];
            $norm2 += $vec2[$i] * $vec2[$i];
        }
        
        if ($norm1 == 0 || $norm2 == 0) return 0;
        
        return $dotProduct / (sqrt($norm1) * sqrt($norm2));
    }
    
    /**
     * Recherche les chunks les plus similaires
     */
    public function search($query, $limit = 5, $threshold = 0.7) {
        // Charger les embeddings
        if (!file_exists($this->embeddings_file)) {
            throw new Exception('Fichier d\'embeddings introuvable. Lancez d\'abord l\'indexation.');
        }
        
        $embeddings = json_decode(file_get_contents($this->embeddings_file), true);
        if (!$embeddings) {
            throw new Exception('Impossible de charger les embeddings');
        }
        
        // Créer l'embedding de la requête
        $queryEmbedding = $this->createQueryEmbedding($query);
        
        // Calculer les similarités
        $results = [];
        foreach ($embeddings as $item) {
            $similarity = $this->cosineSimilarity($queryEmbedding, $item['embedding']);
            
            if ($similarity >= $threshold) {
                $results[] = [
                    'id' => $item['id'],
                    'url' => $item['url'],
                    'title' => $item['title'],
                    'h1' => $item['h1'],
                    'chunk' => $item['chunk'],
                    'similarity' => $similarity,
                    'metadata' => $item['metadata']
                ];
            }
        }
        
        // Trier par similarité décroissante
        usort($results, function($a, $b) {
            return $b['similarity'] <=> $a['similarity'];
        });
        
        // Limiter les résultats
        return array_slice($results, 0, $limit);
    }
    
    /**
     * Génère une réponse basée sur les chunks trouvés
     */
    public function generateAnswer($query, $context_chunks) {
        if (empty($context_chunks)) {
            return "Je n'ai pas trouvé d'informations pertinentes sur ce sujet dans ma base de connaissances GLP1.";
        }
        
        // Construire le contexte
        $context = "";
        foreach ($context_chunks as $chunk) {
            $context .= "Source: " . $chunk['title'] . "\n";
            $context .= $chunk['chunk'] . "\n\n";
        }
        
        // Prompt pour GPT
        $prompt = "Tu es un assistant expert en GLP1 et traitements du diabète. Réponds à la question suivante en te basant UNIQUEMENT sur le contexte fourni. Si l'information n'est pas dans le contexte, dis-le clairement.

Contexte:
$context

Question: $query

Réponse (en français, précise et basée sur le contexte):";
        
        $data = [
            'model' => 'gpt-4o-mini',
            'messages' => [
                [
                    'role' => 'system',
                    'content' => 'Tu es un assistant médical spécialisé en GLP1. Réponds toujours en français et de manière précise.'
                ],
                [
                    'role' => 'user',
                    'content' => $prompt
                ]
            ],
            'max_tokens' => 500,
            'temperature' => 0.3
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://api.openai.com/v1/chat/completions');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $this->openai_api_key
        ]);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode !== 200) {
            throw new Exception('Erreur génération réponse: ' . $response);
        }
        
        $result = json_decode($response, true);
        return $result['choices'][0]['message']['content'];
    }
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode POST requise');
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['query'])) {
        throw new Exception('Paramètre "query" requis');
    }
    
    $query = trim($input['query']);
    if (empty($query)) {
        throw new Exception('Requête vide');
    }
    
    // Configuration (à adapter selon votre setup)
    $openai_api_key = getenv('OPENAI_API_KEY') ?: $input['api_key'] ?? '';
    if (empty($openai_api_key)) {
        throw new Exception('Clé API OpenAI manquante');
    }
    
    $search = new GLP1RAGSearch($openai_api_key);
    
    // Paramètres de recherche
    $limit = $input['limit'] ?? 5;
    $threshold = $input['threshold'] ?? 0.7;
    $generate_answer = $input['generate_answer'] ?? true;
    
    // Effectuer la recherche
    $results = $search->search($query, $limit, $threshold);
    
    $response = [
        'success' => true,
        'query' => $query,
        'results_count' => count($results),
        'results' => $results
    ];
    
    // Générer une réponse si demandé
    if ($generate_answer && !empty($results)) {
        $answer = $search->generateAnswer($query, $results);
        $response['answer'] = $answer;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
