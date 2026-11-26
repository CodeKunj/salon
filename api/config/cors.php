<?php
// api/config/cors.php

require_once __DIR__ . '/database.php';
Database::loadEnv();

// Handle cross-origin requests strictly in production
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$host = $_SERVER['HTTP_HOST'] ?? '';
$appEnv = Database::env('APP_ENV', 'production') ?: 'production';

$allowedOrigins = [];
$appUrl = Database::env('APP_URL', '') ?: '';
if (!empty($appUrl)) {
    $parsedApp = parse_url($appUrl);
    if (!empty($parsedApp['scheme']) && !empty($parsedApp['host'])) {
        $port = isset($parsedApp['port']) ? ':' . $parsedApp['port'] : '';
        $allowedOrigins[] = $parsedApp['scheme'] . '://' . $parsedApp['host'] . $port;
    }
}

$extraCors = Database::env('CORS_ALLOWED_ORIGINS', '') ?: '';
if (!empty($extraCors)) {
    foreach (explode(',', $extraCors) as $item) {
        $trimmed = rtrim(trim($item), '/');
        if ($trimmed !== '') {
            $allowedOrigins[] = $trimmed;
        }
    }
}

if (!empty($host)) {
    $allowedOrigins[] = 'https://' . $host;
    $allowedOrigins[] = 'http://' . $host;
}

$normalizedOrigin = rtrim($origin, '/');
$isLocalDevOrigin = $appEnv === 'development' && (bool)preg_match('#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#i', $normalizedOrigin);
$isExplicitlyAllowed = $normalizedOrigin !== '' && in_array($normalizedOrigin, $allowedOrigins, true);

header('Vary: Origin');
if ($isExplicitlyAllowed || $isLocalDevOrigin) {
    header("Access-Control-Allow-Origin: {$normalizedOrigin}");
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Auth-Token');

// Terminate preflight OPTIONS immediately
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(200);
    exit;
}
