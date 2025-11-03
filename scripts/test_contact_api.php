<?php
// Script de prueba para el endpoint api/contact.php
// Uso: php scripts/test_contact_api.php

$url = 'http://localhost/utnproject/api/contact.php';

$payload = [
    'firstName' => 'Prueba',
    'lastName' => 'Usuario',
    'email' => 'prueba+api@example.com',
    'phone' => '+541112345678',
    'message' => 'Mensaje de prueba desde el script automatizado',
    // 'subject' => 'general', // opcional
];

// preferimos usar cURL si está disponible
if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);

    $resp = curl_exec($ch);
    $err = curl_error($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($resp === false) {
        echo "cURL error: $err\n";
        exit(1);
    }

    echo "HTTP code: $httpCode\n";
    echo "Response:\n" . $resp . "\n";
    exit(0);
}

// fallback a file_get_contents con stream_context
$options = [
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\r\n",
        'content' => json_encode($payload),
        'timeout' => 10
    ]
];

$context  = stream_context_create($options);
$result = @file_get_contents($url, false, $context);
if ($result === false) {
    echo "Request failed. Verifica que Apache esté corriendo y que la ruta $url sea accesible desde este host.\n";
    // mostrar errores del contexto si existen
    if (isset($http_response_header)) {
        echo implode("\n", $http_response_header) . "\n";
    }
    exit(1);
}

echo "Response:\n" . $result . "\n";

?>