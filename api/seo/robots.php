<?php
// api/seo/robots.php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'seo_robots_txt'");
    $customRobots = $stmt->fetchColumn();

    if (!empty($customRobots)) {
        echo $customRobots;
        exit;
    }
} catch (Exception $e) {
    // Fallback
}

$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'ritiverse.com';
echo "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\nSitemap: {$scheme}://{$host}/sitemap.xml\n";
