<?php
// api/controllers/ServicesController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class ServicesController {
    // CATEGORIES
    public static function listCategories(): void {
        Auth::requireAuth();
        $pdo = Database::getConnection();
        $cats = $pdo->query("SELECT * FROM categories ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse($cats);
    }

    public static function saveCategory(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $name = trim($input['name'] ?? '');
        $slug = trim($input['slug'] ?? '') ?: strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
        $description = trim($input['description'] ?? '');
        $imageUrl = trim($input['image_url'] ?? '');
        $icon = trim($input['icon'] ?? 'Scissors');
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($name)) {
            errorResponse('Category name is required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE categories SET name = ?, slug = ?, description = ?, image_url = ?, icon = ?, sort_order = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$name, $slug, $description, $imageUrl, $icon, $sortOrder, $isActive, $id]);
            Auth::logAudit($user['id'], 'CATEGORY_UPDATED', 'categories', (string)$id, "Category {$name} updated");
        } else {
            $stmt = $pdo->prepare("INSERT INTO categories (name, slug, description, image_url, icon, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $slug, $description, $imageUrl, $icon, $sortOrder, $isActive]);
            $id = (int)$pdo->lastInsertId();
            Auth::logAudit($user['id'], 'CATEGORY_CREATED', 'categories', (string)$id, "Category {$name} created");
        }

        jsonResponse(['id' => $id, 'name' => $name, 'slug' => $slug], 200, 'Category saved');
    }

    public static function deleteCategory(int $id): void {
        $user = Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM categories WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            errorResponse('Category not found.', 404);
        }
        Auth::logAudit($user['id'], 'CATEGORY_DELETED', 'categories', (string)$id, "Category #{$id} deleted");
        jsonResponse(null, 200, 'Category deleted');
    }

    // SERVICES
    public static function listServices(): void {
        Auth::requireAuth();
        $pdo = Database::getConnection();
        $sql = "SELECT s.*, c.name as category_name 
                FROM services s 
                LEFT JOIN categories c ON s.category_id = c.id 
                ORDER BY s.sort_order ASC, s.id ASC";
        $services = $pdo->query($sql)->fetchAll();
        jsonResponse($services);
    }

    public static function saveService(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $categoryId = (int)($input['category_id'] ?? 1);
        $name = trim($input['name'] ?? '');
        $slug = trim($input['slug'] ?? '') ?: strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
        $description = trim($input['description'] ?? '');
        $duration = (int)($input['duration_minutes'] ?? 45);
        $basePrice = (float)($input['base_price'] ?? 0);
        $offerPrice = !empty($input['offer_price']) ? (float)$input['offer_price'] : null;
        $imageUrl = trim($input['image_url'] ?? '');
        $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 0;
        $isTaxable = isset($input['is_taxable']) ? (int)$input['is_taxable'] : 1;
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
        $sortOrder = (int)($input['sort_order'] ?? 0);

        if (empty($name) || $basePrice <= 0) {
            errorResponse('Service name and valid base price are required.', 422);
        }
        if ($duration <= 0) {
            errorResponse('Service duration must be greater than 0 minutes.', 422);
        }
        if ($offerPrice !== null && $offerPrice >= $basePrice) {
            errorResponse('Offer price must be lower than base price.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE services SET category_id = ?, name = ?, slug = ?, description = ?, duration_minutes = ?, base_price = ?, offer_price = ?, image_url = ?, is_featured = ?, is_taxable = ?, is_active = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([$categoryId, $name, $slug, $description, $duration, $basePrice, $offerPrice, $imageUrl, $isFeatured, $isTaxable, $isActive, $sortOrder, $id]);
            Auth::logAudit($user['id'], 'SERVICE_UPDATED', 'services', (string)$id, "Service {$name} updated");
        } else {
            $stmt = $pdo->prepare("INSERT INTO services (category_id, name, slug, description, duration_minutes, base_price, offer_price, image_url, is_featured, is_taxable, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$categoryId, $name, $slug, $description, $duration, $basePrice, $offerPrice, $imageUrl, $isFeatured, $isTaxable, $isActive, $sortOrder]);
            $id = (int)$pdo->lastInsertId();
            Auth::logAudit($user['id'], 'SERVICE_CREATED', 'services', (string)$id, "Service {$name} created");
        }

        jsonResponse(['id' => $id, 'name' => $name], 200, 'Service saved');
    }

    public static function deleteService(int $id): void {
        $user = Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            errorResponse('Service not found.', 404);
        }
        Auth::logAudit($user['id'], 'SERVICE_DELETED', 'services', (string)$id, "Service #{$id} deleted");
        jsonResponse(null, 200, 'Service deleted');
    }

    // PACKAGES
    public static function listPackages(): void {
        Auth::requireAuth();
        $pdo = Database::getConnection();
        $packages = $pdo->query("SELECT * FROM packages ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse($packages);
    }

    public static function savePackage(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $name = trim($input['name'] ?? '');
        $slug = trim($input['slug'] ?? '') ?: strtolower(preg_replace('/[^a-z0-9]+/i', '-', $name));
        $tagline = trim($input['tagline'] ?? '');
        $description = trim($input['description'] ?? '');
        $price = (float)($input['price'] ?? 0);
        $originalPrice = !empty($input['original_price']) ? (float)$input['original_price'] : null;
        $duration = (int)($input['duration_minutes'] ?? 120);
        $imageUrl = trim($input['image_url'] ?? '');
        $isFeatured = isset($input['is_featured']) ? (int)$input['is_featured'] : 1;
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
        $sortOrder = (int)($input['sort_order'] ?? 0);

        if (empty($name) || $price <= 0) {
            errorResponse('Package name and price are required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE packages SET name = ?, slug = ?, tagline = ?, description = ?, price = ?, original_price = ?, duration_minutes = ?, image_url = ?, is_featured = ?, is_active = ?, sort_order = ? WHERE id = ?");
            $stmt->execute([$name, $slug, $tagline, $description, $price, $originalPrice, $duration, $imageUrl, $isFeatured, $isActive, $sortOrder, $id]);
            Auth::logAudit($user['id'], 'PACKAGE_UPDATED', 'packages', (string)$id, "Package {$name} updated");
        } else {
            $stmt = $pdo->prepare("INSERT INTO packages (name, slug, tagline, description, price, original_price, duration_minutes, image_url, is_featured, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $slug, $tagline, $description, $price, $originalPrice, $duration, $imageUrl, $isFeatured, $isActive, $sortOrder]);
            $id = (int)$pdo->lastInsertId();
            Auth::logAudit($user['id'], 'PACKAGE_CREATED', 'packages', (string)$id, "Package {$name} created");
        }

        jsonResponse(['id' => $id, 'name' => $name], 200, 'Package saved');
    }

    public static function deletePackage(int $id): void {
        $user = Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM packages WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            errorResponse('Package not found.', 404);
        }
        Auth::logAudit($user['id'], 'PACKAGE_DELETED', 'packages', (string)$id, "Package #{$id} deleted");
        jsonResponse(null, 200, 'Package deleted');
    }
}
