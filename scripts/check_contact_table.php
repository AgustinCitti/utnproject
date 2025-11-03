<?php
// Comprueba si existen tablas relacionadas con 'contact' en la base de datos edusync
require_once __DIR__ . '/../config/database.php';

try {
    $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET, DB_USER, DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $stmt = $pdo->query("SHOW TABLES LIKE 'contact%'");
    $rows = $stmt->fetchAll(PDO::FETCH_COLUMN);

    if (empty($rows)) {
        echo "No se encontraron tablas que empiecen con 'contact' en la base '" . DB_NAME . "'.\n";
    } else {
        echo "Tablas encontradas:\n";
        foreach ($rows as $r) echo " - $r\n";
    }

} catch (PDOException $e) {
    echo "Error conectando a la base de datos: " . $e->getMessage() . "\n";
    exit(1);
}

?>