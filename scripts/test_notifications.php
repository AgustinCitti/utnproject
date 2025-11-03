<?php
require_once(__DIR__ . '/../config/database.php');

// Test data
$testNotification = [
    'title' => 'Notificación de prueba',
    'message' => 'Esta es una notificación de prueba enviada el ' . date('Y-m-d H:i:s'),
    'user_id' => 1, // Ajusta esto al ID del usuario que quieras probar
    'type' => 'INFO'
];

try {
    $pdo = new PDO("mysql:host={$db_config['host']};dbname={$db_config['database']}", $db_config['user'], $db_config['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "INSERT INTO Notificaciones (titulo, mensaje, id_usuario, tipo, fecha_creacion) 
            VALUES (:title, :message, :user_id, :type, NOW())";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':title' => $testNotification['title'],
        ':message' => $testNotification['message'],
        ':user_id' => $testNotification['user_id'],
        ':type' => $testNotification['type']
    ]);
    
    echo "Notificación de prueba creada exitosamente\n";
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>