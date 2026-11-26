<?php
// api/seo/gsc_verify.php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'gsc_file_content'");
    $content = $stmt->fetchColumn();

    if (!empty($content)) {
        echo $content;
        exit;
    }
} catch (Exception $e) {
    // Fallback
}

$requestedUri = $_SERVER['REQUEST_URI'] ?? '';
$filename = basename(parse_url($requestedUri, PHP_URL_PATH));
echo "google-site-verification: " . htmlspecialchars($filename);
