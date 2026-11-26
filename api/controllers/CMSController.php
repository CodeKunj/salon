<?php
// api/controllers/CMSController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class CMSController {
    // HERO
    public static function getHero(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $hero = $pdo->query("SELECT * FROM cms_hero ORDER BY id DESC LIMIT 1")->fetch();
        jsonResponse($hero);
    }

    public static function updateHero(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $headline = trim($input['headline'] ?? '');
        $subheadline = trim($input['subheadline'] ?? '');
        $badgeText = trim($input['badge_text'] ?? 'HAUTE COIFFURE & LUXURY AESTHETICS');
        $ctaText = trim($input['cta_text'] ?? 'Book Your Experience');
        $ctaLink = trim($input['cta_link'] ?? '#book');
        $p1Title = trim($input['preview_card_1_title'] ?? '');
        $p1Sub = trim($input['preview_card_1_sub'] ?? '');
        $p1Img = trim($input['preview_card_1_image'] ?? '');
        $p2Title = trim($input['preview_card_2_title'] ?? '');
        $p2Sub = trim($input['preview_card_2_sub'] ?? '');
        $p2Img = trim($input['preview_card_2_image'] ?? '');

        $count = $pdo->query("SELECT COUNT(*) FROM cms_hero")->fetchColumn();
        if ($count > 0) {
            $stmt = $pdo->prepare("UPDATE cms_hero SET headline = ?, subheadline = ?, badge_text = ?, cta_text = ?, cta_link = ?, preview_card_1_title = ?, preview_card_1_sub = ?, preview_card_1_image = ?, preview_card_2_title = ?, preview_card_2_sub = ?, preview_card_2_image = ? WHERE id = (SELECT id FROM (SELECT MAX(id) as id FROM cms_hero) as x)");
            $stmt->execute([$headline, $subheadline, $badgeText, $ctaText, $ctaLink, $p1Title, $p1Sub, $p1Img, $p2Title, $p2Sub, $p2Img]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO cms_hero (headline, subheadline, badge_text, cta_text, cta_link, preview_card_1_title, preview_card_1_sub, preview_card_1_image, preview_card_2_title, preview_card_2_sub, preview_card_2_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$headline, $subheadline, $badgeText, $ctaText, $ctaLink, $p1Title, $p1Sub, $p1Img, $p2Title, $p2Sub, $p2Img]);
        }

        Auth::logAudit($user['id'], 'HERO_UPDATED', 'cms_hero', '1', "Homepage hero banner updated");
        jsonResponse(null, 200, 'Hero banner updated');
    }

    // GALLERY
    public static function listGallery(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $items = $pdo->query("SELECT * FROM cms_gallery ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse($items);
    }

    public static function saveGallery(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $title = trim($input['title'] ?? '');
        $category = trim($input['category'] ?? 'Hair Styling');
        $imageUrl = trim($input['image_url'] ?? '');
        $tag = trim($input['tag'] ?? 'Lookbook');
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($title) || empty($imageUrl)) {
            errorResponse('Title and image URL are required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE cms_gallery SET title = ?, category = ?, image_url = ?, tag = ?, sort_order = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$title, $category, $imageUrl, $tag, $sortOrder, $isActive, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO cms_gallery (title, category, image_url, tag, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $category, $imageUrl, $tag, $sortOrder, $isActive]);
            $id = (int)$pdo->lastInsertId();
        }

        Auth::logAudit($user['id'], 'GALLERY_SAVED', 'cms_gallery', (string)$id, "Gallery item {$title}");
        jsonResponse(['id' => $id], 200, 'Gallery item saved');
    }

    public static function deleteGallery(int $id): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM cms_gallery WHERE id = ?")->execute([$id]);
        Auth::logAudit($user['id'], 'GALLERY_DELETED', 'cms_gallery', (string)$id, "Gallery item #{$id} deleted");
        jsonResponse(null, 200, 'Gallery item deleted');
    }

    // TESTIMONIALS
    public static function listTestimonials(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $reviews = $pdo->query("SELECT * FROM cms_testimonials ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse($reviews);
    }

    public static function saveTestimonial(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $name = trim($input['client_name'] ?? '');
        $serviceTag = trim($input['service_tag'] ?? 'Salon Experience');
        $review = trim($input['review_text'] ?? '');
        $rating = max(1, min(5, (int)($input['rating'] ?? 5)));
        $avatar = trim($input['avatar_url'] ?? '');
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($name) || empty($review)) {
            errorResponse('Client name and review text are required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE cms_testimonials SET client_name = ?, service_tag = ?, review_text = ?, rating = ?, avatar_url = ?, sort_order = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$name, $serviceTag, $review, $rating, $avatar, $sortOrder, $isActive, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO cms_testimonials (client_name, service_tag, review_text, rating, avatar_url, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $serviceTag, $review, $rating, $avatar, $sortOrder, $isActive]);
            $id = (int)$pdo->lastInsertId();
        }

        Auth::logAudit($user['id'], 'TESTIMONIAL_SAVED', 'cms_testimonials', (string)$id, "Testimonial by {$name}");
        jsonResponse(['id' => $id], 200, 'Testimonial saved');
    }

    public static function deleteTestimonial(int $id): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM cms_testimonials WHERE id = ?")->execute([$id]);
        Auth::logAudit($user['id'], 'TESTIMONIAL_DELETED', 'cms_testimonials', (string)$id, "Testimonial #{$id} deleted");
        jsonResponse(null, 200, 'Testimonial deleted');
    }

    // FAQS
    public static function listFAQs(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $faqs = $pdo->query("SELECT * FROM cms_faqs ORDER BY sort_order ASC, id ASC")->fetchAll();
        jsonResponse($faqs);
    }

    public static function saveFAQ(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $question = trim($input['question'] ?? '');
        $answer = trim($input['answer'] ?? '');
        $category = trim($input['category'] ?? 'General');
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($question) || empty($answer)) {
            errorResponse('Question and answer are required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE cms_faqs SET question = ?, answer = ?, category = ?, sort_order = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$question, $answer, $category, $sortOrder, $isActive, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO cms_faqs (question, answer, category, sort_order, is_active) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$question, $answer, $category, $sortOrder, $isActive]);
            $id = (int)$pdo->lastInsertId();
        }

        Auth::logAudit($user['id'], 'FAQ_SAVED', 'cms_faqs', (string)$id, "FAQ {$question}");
        jsonResponse(['id' => $id], 200, 'FAQ saved');
    }

    public static function deleteFAQ(int $id): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM cms_faqs WHERE id = ?")->execute([$id]);
        Auth::logAudit($user['id'], 'FAQ_DELETED', 'cms_faqs', (string)$id, "FAQ #{$id} deleted");
        jsonResponse(null, 200, 'FAQ deleted');
    }
}
