<?php
// Script de prueba para api/notifications.php
$base = 'http://localhost/utnproject/api/notifications.php';

function do_request($method, $url, $data = null) {
    $opts = [
        'http' => [
            'method' => $method,
            'header' => "Content-Type: application/json\r\n",
            'timeout' => 10
        ]
    ];
    if ($data !== null) $opts['http']['content'] = json_encode($data);
    $context = stream_context_create($opts);
    $resp = @file_get_contents($url, false, $context);
    $info = $http_response_header[0] ?? '';
    return [$info, $resp];
}

echo "1) Crear notificación...\n";
list($h, $r) = do_request('POST', $base, [
    'title' => 'Prueba API',
    'message' => 'Mensaje de prueba desde script',
    'type' => 'INFO',
    'destinatario_tipo' => 'TODOS'
]);
echo "Response header: $h\n";
echo "Body: $r\n";

echo "\n2) Listar notificaciones...\n";
list($h, $r) = do_request('GET', $base);
echo "Response header: $h\n";
echo "Body: $r\n";

$data = json_decode($r, true);
$id = null;
if (isset($data['notifications']) && is_array($data['notifications']) && count($data['notifications'])>0) {
    $id = $data['notifications'][0]['ID_notificacion'] ?? null;
}

if ($id) {
    echo "\n3) Marcar notificación $id como leída...\n";
    list($h, $r) = do_request('PATCH', $base, ['id' => $id, 'action' => 'mark_read']);
    echo "Header: $h\nBody: $r\n";

    echo "\n4) Eliminar notificación $id...\n";
    list($h, $r) = do_request('DELETE', $base, ['id' => $id]);
    echo "Header: $h\nBody: $r\n";
} else {
    echo "No se obtuvo id de notificación para pruebas posteriores.\n";
}

?>