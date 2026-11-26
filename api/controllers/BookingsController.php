<?php
// api/controllers/BookingsController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class BookingsController {
    public static function list(): void {
        $currentUser = Auth::requireAuth(); // Any authenticated staff/admin can view bookings
        $pdo = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 20)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');
        $date = trim($_GET['date'] ?? '');
        $stylistId = !empty($_GET['stylist_id']) ? (int)$_GET['stylist_id'] : null;

        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(b.customer_name LIKE ? OR b.customer_email LIKE ? OR b.customer_phone LIKE ? OR b.booking_reference LIKE ?)";
            $wildcard = "%{$search}%";
            $params[] = $wildcard;
            $params[] = $wildcard;
            $params[] = $wildcard;
            $params[] = $wildcard;
        }

        if (!empty($status) && in_array($status, ['pending', 'confirmed', 'completed', 'cancelled'])) {
            $where[] = "b.booking_status = ?";
            $params[] = $status;
        }

        if (!empty($date)) {
            $where[] = "b.booking_date = ?";
            $params[] = $date;
        }

        if ($stylistId) {
            $where[] = "b.stylist_id = ?";
            $params[] = $stylistId;
        }

        $whereClause = implode(" AND ", $where);

        // Count total
        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM bookings b WHERE {$whereClause}");
        $countStmt->execute($params);
        $totalRecords = (int)$countStmt->fetchColumn();

        // Query bookings
        $sql = "SELECT b.*, s.name as stylist_name, s.avatar_url as stylist_avatar
                FROM bookings b
                LEFT JOIN stylists s ON b.stylist_id = s.id
                WHERE {$whereClause}
                ORDER BY b.booking_date DESC, b.start_time DESC
                LIMIT {$limit} OFFSET {$offset}";

        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $bookings = $stmt->fetchAll();

        // Fetch items for each booking
        if (!empty($bookings)) {
            $bIds = array_column($bookings, 'id');
            $inB = implode(',', array_fill(0, count($bIds), '?'));
            $itemStmt = $pdo->prepare("SELECT booking_id, item_name, price, duration_minutes FROM booking_items WHERE booking_id IN ($inB)");
            $itemStmt->execute($bIds);
            $itemsGrouped = [];
            foreach ($itemStmt->fetchAll() as $item) {
                $itemsGrouped[$item['booking_id']][] = $item;
            }
            $canViewAmounts = in_array($currentUser['role'], ['super_admin', 'branch_manager', 'receptionist'], true);
            foreach ($bookings as &$b) {
                $items = $itemsGrouped[$b['id']] ?? [];
                if (!$canViewAmounts) {
                    foreach ($items as &$it) {
                        unset($it['price']);
                    }
                    unset($it);
                    unset($b['subtotal'], $b['discount_amount'], $b['tax_amount'], $b['total_amount'], $b['deposit_amount']);
                }
                $b['items'] = $items;
            }
            unset($b);
        }

        // Summary stats (using PHP-computed date for both MySQL & SQLite compatibility)
        $today = date('Y-m-d');
        $statsStmt = $pdo->prepare("SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN booking_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
            SUM(CASE WHEN booking_status = 'pending' THEN 1 ELSE 0 END) as pending_count,
            SUM(CASE WHEN booking_status = 'completed' THEN 1 ELSE 0 END) as completed_count,
            SUM(CASE WHEN booking_date = ? THEN 1 ELSE 0 END) as today_count,
            SUM(total_amount) as total_revenue
        FROM bookings WHERE booking_status != 'cancelled'");
        $statsStmt->execute([$today]);
        $stats = $statsStmt->fetch();

        if (!in_array($currentUser['role'], ['super_admin', 'branch_manager'], true)) {
            unset($stats['total_revenue']);
        }

        jsonResponse([
            'bookings' => $bookings,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $totalRecords,
                'pages' => ceil($totalRecords / $limit)
            ],
            'stats' => $stats
        ]);
    }

    public static function get(int $id): void {
        $currentUser = Auth::requireAuth();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT b.*, s.name as stylist_name, s.avatar_url as stylist_avatar, s.role_title as stylist_title
                               FROM bookings b
                               LEFT JOIN stylists s ON b.stylist_id = s.id
                               WHERE b.id = ? LIMIT 1");
        $stmt->execute([$id]);
        $booking = $stmt->fetch();

        if (!$booking) {
            errorResponse('Booking not found.', 404);
        }

        $itemStmt = $pdo->prepare("SELECT * FROM booking_items WHERE booking_id = ?");
        $itemStmt->execute([$id]);
        $items = $itemStmt->fetchAll();

        if (!in_array($currentUser['role'], ['super_admin', 'branch_manager', 'receptionist'], true)) {
            unset($booking['subtotal'], $booking['discount_amount'], $booking['tax_amount'], $booking['total_amount'], $booking['deposit_amount']);
            foreach ($items as &$it) {
                unset($it['price']);
            }
            unset($it);
        }

        $booking['items'] = $items;

        jsonResponse($booking);
    }

    public static function updateStatus(int $id): void {
        $currentUser = Auth::requireAuth(['super_admin', 'branch_manager', 'receptionist']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $bookingStatus = $input['booking_status'] ?? null;
        $paymentStatus = $input['payment_status'] ?? null;
        $stylistId = isset($input['stylist_id']) ? (int)$input['stylist_id'] : null;
        $notes = isset($input['notes']) ? trim($input['notes']) : null;

        $updates = [];
        $params = [];

        if ($bookingStatus && in_array($bookingStatus, ['pending', 'confirmed', 'completed', 'cancelled'])) {
            $updates[] = "booking_status = ?";
            $params[] = $bookingStatus;
        }

        if ($paymentStatus && in_array($paymentStatus, ['pending', 'paid', 'partially_paid', 'refunded'])) {
            $updates[] = "payment_status = ?";
            $params[] = $paymentStatus;
        }

        if ($stylistId !== null) {
            $updates[] = "stylist_id = ?";
            $params[] = $stylistId > 0 ? $stylistId : null;
        }

        if ($notes !== null) {
            $updates[] = "notes = ?";
            $params[] = $notes;
        }

        $existsStmt = $pdo->prepare("SELECT id FROM bookings WHERE id = ? LIMIT 1");
        $existsStmt->execute([$id]);
        if (!$existsStmt->fetch()) {
            errorResponse('Booking not found.', 404);
        }

        if ($stylistId !== null && $stylistId > 0) {
            $styCheck = $pdo->prepare("SELECT id FROM stylists WHERE id = ? LIMIT 1");
            $styCheck->execute([$stylistId]);
            if (!$styCheck->fetch()) {
                errorResponse('Selected stylist not found.', 422);
            }
        }

        if (empty($updates)) {
            errorResponse('No valid fields to update.', 422);
        }

        $params[] = $id;
        $sql = "UPDATE bookings SET " . implode(', ', $updates) . ", updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        Auth::logAudit($currentUser['id'], 'BOOKING_UPDATED', 'bookings', (string)$id, "Status/Payment updated for booking #{$id}");

        self::get($id);
    }

    public static function createWalkIn(): void {
        $currentUser = Auth::requireAuth(['super_admin', 'branch_manager', 'receptionist']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $name = trim($input['name'] ?? 'Walk-In Guest');
        $email = trim($input['email'] ?? 'walkin@ritiverse.com');
        $phone = trim($input['phone'] ?? '+1 (555) 000-0000');
        $stylistId = !empty($input['stylist_id']) ? (int)$input['stylist_id'] : null;
        $serviceIds = (array)($input['service_ids'] ?? []);
        $notes = trim($input['notes'] ?? 'Walk-In Appointment');

        $date = date('Y-m-d');
        $startTime = date('H:i:s');

        // Fetch services
        if (empty($serviceIds)) {
            errorResponse('Select at least one service.', 422);
        }

        $inClause = implode(',', array_fill(0, count($serviceIds), '?'));
        $srvStmt = $pdo->prepare("SELECT id, name, base_price, offer_price, duration_minutes FROM services WHERE id IN ($inClause)");
        $srvStmt->execute($serviceIds);
        $srvs = $srvStmt->fetchAll();

        if (empty($srvs)) {
            errorResponse('Selected services were not found.', 404);
        }

        $subtotal = 0.0;
        $totalDuration = 0;
        $bookingItems = [];

        foreach ($srvs as $s) {
            $p = $s['offer_price'] !== null ? (float)$s['offer_price'] : (float)$s['base_price'];
            $subtotal += $p;
            $totalDuration += (int)$s['duration_minutes'];
            $bookingItems[] = [
                'service_id' => $s['id'],
                'package_id' => null,
                'item_name' => $s['name'],
                'price' => $p,
                'duration_minutes' => (int)$s['duration_minutes']
            ];
        }

        $endTime = date('H:i:s', time() + ($totalDuration * 60));
        $reference = 'WALK-' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 6));

        $pdo->beginTransaction();
        try {
            $insStmt = $pdo->prepare("INSERT INTO bookings (
                booking_reference, customer_name, customer_email, customer_phone, stylist_id,
                booking_date, start_time, end_time, total_duration, subtotal, discount_amount,
                tax_amount, total_amount, deposit_amount, payment_mode, payment_status,
                booking_status, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, 0.00, ?, 0.00, 'pay_at_salon', 'pending', 'confirmed', ?)");

            $insStmt->execute([
                $reference, $name, $email, $phone, $stylistId,
                $date, $startTime, $endTime, $totalDuration, $subtotal, $subtotal, $notes
            ]);

            $bId = (int)$pdo->lastInsertId();

            $itemStmt = $pdo->prepare("INSERT INTO booking_items (booking_id, service_id, package_id, item_name, price, duration_minutes) VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($bookingItems as $bi) {
                $itemStmt->execute([$bId, $bi['service_id'], null, $bi['item_name'], $bi['price'], $bi['duration_minutes']]);
            }

            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        Auth::logAudit($currentUser['id'], 'WALKIN_CREATED', 'bookings', (string)$bId, "Walk-in appointment #{$reference} registered");

        jsonResponse(['id' => $bId, 'booking_reference' => $reference], 201, 'Walk-in booking created');
    }

    public static function delete(int $id): void {
        $currentUser = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("DELETE FROM bookings WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            errorResponse('Booking not found.', 404);
        }

        Auth::logAudit($currentUser['id'], 'BOOKING_DELETED', 'bookings', (string)$id, "Booking #{$id} deleted");

        jsonResponse(null, 200, 'Booking deleted');
    }
}
