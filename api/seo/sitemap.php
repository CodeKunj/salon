<?php
// api/seo/sitemap.php

require_once __DIR__ . '/../config/database.php';

header('Content-Type: application/xml; charset=utf-8');

$pdo = Database::getConnection();

// Fetch canonical or dynamic host base URL
$scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'ritiverse.com';
$baseUrlStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'seo_canonical_url'");
$dbCanonical = trim((string)$baseUrlStmt->fetchColumn());
$baseUrl = rtrim(($dbCanonical !== '' && !str_contains($dbCanonical, 'aurasalon.com')) ? $dbCanonical : "{$scheme}://{$host}", '/');

// Fetch services
$services = $pdo->query("SELECT slug FROM services WHERE is_active = 1")->fetchAll();

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/#services</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/#gallery</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/#team</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/#book</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>daily</changefreq>
    <priority>0.95</priority>
  </url>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/card</loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
<?php foreach ($services as $srv): ?>
  <url>
    <loc><?= htmlspecialchars($baseUrl) ?>/#service-<?= htmlspecialchars($srv['slug']) ?></loc>
    <lastmod><?= date('Y-m-d') ?></lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>
<?php endforeach; ?>
</urlset>
