<?php
// api/controllers/CustomerController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class CustomerController {
    private const CUSTOMER_TOKEN_TTL = 604800; // 7 days

    public static function register(): void {
        $input = getJsonInput();
        $name = trim($input['name'] ?? '');
        $email = strtolower(trim($input['email'] ?? ''));
        $phone = trim($input['phone'] ?? '');
        $password = (string)($input['password'] ?? '');

        if (empty($name) || empty($email) || empty($phone) || empty($password)) {
            errorResponse('Full name, email, phone number, and password are required.', 422);
        }

        if (!Validator::validateEmail($email)) {
            errorResponse('Please provide a valid email address.', 422);
        }

        if (strlen($password) < 6) {
            errorResponse('Password must be at least 6 characters long.', 422);
        }

        $pdo = Database::getConnection();
        $existsStmt = $pdo->prepare("SELECT id, role FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
        $existsStmt->execute([$email]);
        $existing = $existsStmt->fetch();

        if ($existing) {
            if ($existing['role'] !== 'customer') {
                errorResponse('This email is registered to a staff account. Please use another email or sign in via the Staff Portal.', 409);
            }
            errorResponse('An account with this email already exists. Please sign in instead.', 409);
        }

        $hash = password_hash($password, PASSWORD_BCRYPT);
        $ins = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, phone, is_active) VALUES (?, ?, ?, 'customer', ?, 1)");
        $ins->execute([$name, $email, $hash, $phone]);
        $userId = (int)$pdo->lastInsertId();

        $userStmt = $pdo->prepare("SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users WHERE id = ? LIMIT 1");
        $userStmt->execute([$userId]);
        $user = $userStmt->fetch();

        $token = Auth::generateJWT([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name'],
        ], self::CUSTOMER_TOKEN_TTL);

        Auth::logAudit($user['id'], 'CUSTOMER_REGISTERED', 'users', (string)$user['id'], "Customer account created for {$email}");

        jsonResponse([
            'token' => $token,
            'expires_in' => self::CUSTOMER_TOKEN_TTL,
            'user' => $user,
        ], 201, 'Account created successfully');
    }

    public static function login(): void {
        $input = getJsonInput();
        $email = strtolower(trim($input['email'] ?? ''));
        $password = (string)($input['password'] ?? '');

        if (empty($email) || empty($password)) {
            errorResponse('Email and password are required.', 422);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, phone, avatar, is_active, created_at FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            errorResponse('Invalid email or password.', 401);
        }

        if ($user['role'] !== 'customer') {
            errorResponse('Please sign in through the Staff Atelier Portal for staff/admin accounts.', 403);
        }

        if (!$user['is_active']) {
            errorResponse('Your account is currently disabled. Please contact studio concierge.', 403);
        }

        $validPassword = password_verify($password, $user['password_hash']);

        if (!$validPassword) {
            Auth::logAudit($user['id'], 'CUSTOMER_LOGIN_FAILED', 'users', (string)$user['id'], "Failed client login attempt for {$email}");
            errorResponse('Invalid email or password.', 401);
        }

        $token = Auth::generateJWT([
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name'],
        ], self::CUSTOMER_TOKEN_TTL);

        Auth::logAudit($user['id'], 'CUSTOMER_LOGIN_SUCCESS', 'users', (string)$user['id'], "Customer login by {$user['name']}");

        unset($user['password_hash']);

        jsonResponse([
            'token' => $token,
            'expires_in' => self::CUSTOMER_TOKEN_TTL,
            'user' => $user,
        ], 200, 'Signed in successfully');
    }

    public static function me(): void {
        $user = Auth::requireAuth(['customer']);
        jsonResponse(['user' => $user]);
    }

    public static function updateProfile(): void {
        $currentUser = Auth::requireAuth(['customer']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $name = trim($input['name'] ?? $currentUser['name']);
        $phone = trim($input['phone'] ?? ($currentUser['phone'] ?? ''));
        $currentPassword = (string)($input['current_password'] ?? '');
        $newPassword = (string)($input['new_password'] ?? '');

        if (empty($name) || empty($phone)) {
            errorResponse('Full name and phone number are required.', 422);
        }

        if (!empty($newPassword)) {
            if (strlen($newPassword) < 6) {
                errorResponse('New password must be at least 6 characters long.', 422);
            }
            $pwStmt = $pdo->prepare("SELECT password_hash FROM users WHERE id = ? LIMIT 1");
            $pwStmt->execute([$currentUser['id']]);
            $currentHash = (string)$pwStmt->fetchColumn();
            if (empty($currentPassword) || !password_verify($currentPassword, $currentHash)) {
                errorResponse('Current password is incorrect.', 422);
            }
            $newHash = password_hash($newPassword, PASSWORD_BCRYPT);
            $upStmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $upStmt->execute([$name, $phone, $newHash, $currentUser['id']]);
        } else {
            $upStmt = $pdo->prepare("UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
            $upStmt->execute([$name, $phone, $currentUser['id']]);
        }

        $freshStmt = $pdo->prepare("SELECT id, name, email, role, phone, avatar, is_active FROM users WHERE id = ? LIMIT 1");
        $freshStmt->execute([$currentUser['id']]);
        $updatedUser = $freshStmt->fetch();

        Auth::logAudit($currentUser['id'], 'CUSTOMER_PROFILE_UPDATED', 'users', (string)$currentUser['id'], "Updated profile details");

        jsonResponse(['user' => $updatedUser], 200, 'Profile updated successfully');
    }

    public static function listBookings(): void {
        $currentUser = Auth::requireAuth(['customer']);
        $pdo = Database::getConnection();

        $scope = strtolower(trim($_GET['scope'] ?? 'all'));
        $search = strtolower(trim($_GET['search'] ?? ''));

        $cutoffStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'cancellation_cutoff_hours'");
        $cutoffHours = (int)($cutoffStmt->fetchColumn() ?: 24);

        $stmt = $pdo->prepare("SELECT b.*, s.name as stylist_name, s.avatar_url as stylist_avatar, s.role_title as stylist_title
                               FROM bookings b
                               LEFT JOIN stylists s ON b.stylist_id = s.id
                               WHERE LOWER(b.customer_email) = LOWER(?)
                               ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC");
        $stmt->execute([$currentUser['email']]);
        $allBookings = $stmt->fetchAll();

        // Fetch line items in batch
        $itemsGrouped = [];
        if (!empty($allBookings)) {
            $bIds = array_column($allBookings, 'id');
            $inB = implode(',', array_fill(0, count($bIds), '?'));
            $itemStmt = $pdo->prepare("SELECT booking_id, service_id, package_id, item_name, price, duration_minutes FROM booking_items WHERE booking_id IN ($inB) ORDER BY id ASC");
            $itemStmt->execute($bIds);
            foreach ($itemStmt->fetchAll() as $it) {
                $itemsGrouped[$it['booking_id']][] = $it;
            }
        }

        $today = date('Y-m-d');
        $nowTs = time();

        $stats = [
            'total_count' => 0,
            'upcoming_count' => 0,
            'past_count' => 0,
            'completed_count' => 0,
            'cancelled_count' => 0,
            'total_spent' => 0.0,
        ];

        $enriched = [];
        foreach ($allBookings as $b) {
            $b['items'] = $itemsGrouped[$b['id']] ?? [];
            $startTs = strtotime("{$b['booking_date']} {$b['start_time']}");
            $endTs = strtotime("{$b['booking_date']} {$b['end_time']}");

            $isPastDate = ($b['booking_date'] < $today) || ($b['booking_date'] === $today && $endTs !== false && $endTs < $nowTs);
            $isActiveStatus = in_array($b['booking_status'], ['pending', 'confirmed'], true);
            $isUpcoming = !$isPastDate && $isActiveStatus;
            $hoursUntil = $startTs !== false ? (($startTs - $nowTs) / 3600) : -1;

            $b['start_time_formatted'] = $startTs !== false ? date('g:i A', $startTs) : $b['start_time'];
            $b['end_time_formatted'] = $endTs !== false ? date('g:i A', $endTs) : $b['end_time'];
            $b['is_upcoming'] = $isUpcoming;
            $b['is_history'] = !$isUpcoming;
            $b['can_cancel'] = $isUpcoming && ($hoursUntil >= $cutoffHours);
            $b['cancellation_cutoff_hours'] = $cutoffHours;

            $stats['total_count']++;
            if ($isUpcoming) {
                $stats['upcoming_count']++;
            } else {
                $stats['past_count']++;
            }
            if ($b['booking_status'] === 'completed') {
                $stats['completed_count']++;
            }
            if ($b['booking_status'] === 'cancelled') {
                $stats['cancelled_count']++;
            } else {
                $stats['total_spent'] += (float)$b['total_amount'];
            }

            $enriched[] = $b;
        }
        $stats['total_spent'] = round($stats['total_spent'], 2);

        $filtered = array_values(array_filter($enriched, function ($b) use ($scope, $search) {
            if ($scope === 'upcoming' && !$b['is_upcoming']) return false;
            if ($scope === 'past' && !$b['is_history']) return false;
            if (in_array($scope, ['pending', 'confirmed', 'completed', 'cancelled'], true) && $b['booking_status'] !== $scope) {
                return false;
            }

            if ($search !== '') {
                $haystack = strtolower(
                    ($b['booking_reference'] ?? '') . ' ' .
                    ($b['stylist_name'] ?? '') . ' ' .
                    ($b['notes'] ?? '') . ' ' .
                    implode(' ', array_column($b['items'], 'item_name'))
                );
                if (!str_contains($haystack, $search)) {
                    return false;
                }
            }
            return true;
        }));

        jsonResponse([
            'bookings' => $filtered,
            'stats' => $stats,
            'cancellation_cutoff_hours' => $cutoffHours,
        ]);
    }

    public static function getBooking(int $id): void {
        $currentUser = Auth::requireAuth(['customer']);
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT b.*, s.name as stylist_name, s.avatar_url as stylist_avatar, s.role_title as stylist_title
                               FROM bookings b
                               LEFT JOIN stylists s ON b.stylist_id = s.id
                               WHERE b.id = ? AND LOWER(b.customer_email) = LOWER(?)
                               LIMIT 1");
        $stmt->execute([$id, $currentUser['email']]);
        $booking = $stmt->fetch();

        if (!$booking) {
            errorResponse('Booking not found for your account.', 404);
        }

        $itemStmt = $pdo->prepare("SELECT booking_id, service_id, package_id, item_name, price, duration_minutes FROM booking_items WHERE booking_id = ? ORDER BY id ASC");
        $itemStmt->execute([$id]);
        $booking['items'] = $itemStmt->fetchAll();

        $cutoffStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'cancellation_cutoff_hours'");
        $cutoffHours = (int)($cutoffStmt->fetchColumn() ?: 24);

        $startTs = strtotime("{$booking['booking_date']} {$booking['start_time']}");
        $endTs = strtotime("{$booking['booking_date']} {$booking['end_time']}");
        $isUpcoming = ($booking['booking_date'] >= date('Y-m-d')) && in_array($booking['booking_status'], ['pending', 'confirmed'], true);
        $hoursUntil = $startTs !== false ? (($startTs - time()) / 3600) : -1;

        $booking['start_time_formatted'] = $startTs !== false ? date('g:i A', $startTs) : $booking['start_time'];
        $booking['end_time_formatted'] = $endTs !== false ? date('g:i A', $endTs) : $booking['end_time'];
        $booking['is_upcoming'] = $isUpcoming;
        $booking['is_history'] = !$isUpcoming;
        $booking['can_cancel'] = $isUpcoming && ($hoursUntil >= $cutoffHours);
        $booking['cancellation_cutoff_hours'] = $cutoffHours;

        jsonResponse($booking);
    }

    public static function cancelBooking(int $id): void {
        $currentUser = Auth::requireAuth(['customer']);
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT * FROM bookings WHERE id = ? AND LOWER(customer_email) = LOWER(?) LIMIT 1");
        $stmt->execute([$id, $currentUser['email']]);
        $booking = $stmt->fetch();

        if (!$booking) {
            errorResponse('Booking not found for your account.', 404);
        }

        if (!in_array($booking['booking_status'], ['pending', 'confirmed'], true)) {
            errorResponse('Only pending or confirmed appointments can be cancelled.', 422);
        }

        $cutoffStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'cancellation_cutoff_hours'");
        $cutoffHours = (int)($cutoffStmt->fetchColumn() ?: 24);

        $startTs = strtotime("{$booking['booking_date']} {$booking['start_time']}");
        if ($startTs === false || (($startTs - time()) / 3600) < $cutoffHours) {
            errorResponse("Cancellations require at least {$cutoffHours} hours advance notice. Please call the concierge desk for assistance.", 422);
        }

        $upStmt = $pdo->prepare("UPDATE bookings SET booking_status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $upStmt->execute([$id]);

        Auth::logAudit($currentUser['id'], 'CUSTOMER_BOOKING_CANCELLED', 'bookings', (string)$id, "Booking {$booking['booking_reference']} cancelled by client");

        self::getBooking($id);
    }
}
