<?php
// api/controllers/CustomersAdminController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

class CustomersAdminController {
    private static function makeClientKey(?string $email, ?string $phone, ?string $name): string {
        $normEmail = strtolower(trim((string)$email));
        if ($normEmail !== '' && $normEmail !== 'walkin@ritiverse.com') {
            return 'email:' . $normEmail;
        }
        $normPhone = preg_replace('/\s+/', '', strtolower(trim((string)$phone)));
        if ($normPhone !== '' && $normPhone !== '+1(555)000-0000') {
            return 'phone:' . $normPhone;
        }
        return 'guest:' . strtolower(trim((string)($name ?: 'unknown')));
    }

    public static function list(): void {
        $currentUser = Auth::requireAuth(['super_admin', 'branch_manager', 'receptionist']);
        $pdo = Database::getConnection();

        $search = strtolower(trim($_GET['search'] ?? ''));
        $type = strtolower(trim($_GET['type'] ?? 'all'));
        $today = date('Y-m-d');

        $canViewAmount = in_array($currentUser['role'], ['super_admin', 'branch_manager', 'receptionist'], true);
        $canViewGlobalSpend = in_array($currentUser['role'], ['super_admin', 'branch_manager'], true);

        // 1. Registered customer accounts
        $userStmt = $pdo->query(
            "SELECT id, name, email, phone, avatar, is_active, created_at
             FROM users
             WHERE role = 'customer'
             ORDER BY created_at DESC, id DESC"
        );
        $registeredUsers = $userStmt->fetchAll();

        $clients = [];
        foreach ($registeredUsers as $u) {
            $key = self::makeClientKey($u['email'], $u['phone'], $u['name']);
            $clients[$key] = [
                'client_key' => $key,
                'user_id' => (int)$u['id'],
                'has_account' => true,
                'name' => $u['name'],
                'email' => $u['email'],
                'phone' => $u['phone'] ?: '',
                'avatar' => $u['avatar'] ?: null,
                'is_active' => (int)$u['is_active'],
                'joined_at' => $u['created_at'],
                'total_bookings' => 0,
                'upcoming_count' => 0,
                'completed_count' => 0,
                'cancelled_count' => 0,
                'total_spent' => 0.0,
                'last_visit_date' => null,
                'next_visit_date' => null,
                'last_booking_reference' => null,
                'last_booking_status' => null,
            ];
        }

        // 2. Aggregate booking history (includes both registered clients & guest/walk-in bookers)
        $bookStmt = $pdo->query(
            "SELECT id, booking_reference, customer_name, customer_email, customer_phone,
                    booking_date, start_time, total_amount, booking_status, created_at
             FROM bookings
             ORDER BY booking_date DESC, start_time DESC, id DESC"
        );
        $bookings = $bookStmt->fetchAll();

        foreach ($bookings as $b) {
            $key = self::makeClientKey($b['customer_email'], $b['customer_phone'], $b['customer_name']);
            if (!isset($clients[$key])) {
                $clients[$key] = [
                    'client_key' => $key,
                    'user_id' => null,
                    'has_account' => false,
                    'name' => $b['customer_name'],
                    'email' => $b['customer_email'],
                    'phone' => $b['customer_phone'],
                    'avatar' => null,
                    'is_active' => 1,
                    'joined_at' => $b['created_at'] ?: $b['booking_date'],
                    'total_bookings' => 0,
                    'upcoming_count' => 0,
                    'completed_count' => 0,
                    'cancelled_count' => 0,
                    'total_spent' => 0.0,
                    'last_visit_date' => null,
                    'next_visit_date' => null,
                    'last_booking_reference' => null,
                    'last_booking_status' => null,
                ];
            }

            $c = &$clients[$key];
            if (empty($c['phone']) && !empty($b['customer_phone'])) {
                $c['phone'] = $b['customer_phone'];
            }
            if (empty($c['email']) && !empty($b['customer_email'])) {
                $c['email'] = $b['customer_email'];
            }

            $c['total_bookings']++;
            $status = $b['booking_status'];

            if ($status === 'completed') {
                $c['completed_count']++;
            } elseif ($status === 'cancelled') {
                $c['cancelled_count']++;
            }

            if (in_array($status, ['pending', 'confirmed'], true) && $b['booking_date'] >= $today) {
                $c['upcoming_count']++;
                if ($c['next_visit_date'] === null || $b['booking_date'] < $c['next_visit_date']) {
                    $c['next_visit_date'] = $b['booking_date'];
                }
            }

            if ($status !== 'cancelled') {
                $c['total_spent'] += (float)$b['total_amount'];
            }

            if ($c['last_visit_date'] === null) {
                $c['last_visit_date'] = $b['booking_date'];
                $c['last_booking_reference'] = $b['booking_reference'];
                $c['last_booking_status'] = $status;
            }
            unset($c);
        }

        // Compute aggregate directory KPIs before filtering
        $stats = [
            'total_customers' => count($clients),
            'registered_count' => 0,
            'guest_count' => 0,
            'repeat_count' => 0,
            'total_lifetime_spend' => 0.0,
        ];

        $allList = array_values($clients);
        foreach ($allList as &$client) {
            $client['total_spent'] = round((float)$client['total_spent'], 2);
            if ($client['has_account']) {
                $stats['registered_count']++;
            } else {
                $stats['guest_count']++;
            }
            if ($client['total_bookings'] >= 2) {
                $stats['repeat_count']++;
            }
            $stats['total_lifetime_spend'] += $client['total_spent'];

            if (!$canViewAmount) {
                unset($client['total_spent']);
            }
        }
        unset($client);

        $stats['total_lifetime_spend'] = round($stats['total_lifetime_spend'], 2);
        if (!$canViewGlobalSpend) {
            unset($stats['total_lifetime_spend']);
        }

        // Sort by most recent booking / registration activity descending
        usort($allList, static function (array $a, array $b): int {
            $aActivity = substr((string)($a['last_visit_date'] ?: $a['joined_at'] ?: ''), 0, 10);
            $bActivity = substr((string)($b['last_visit_date'] ?: $b['joined_at'] ?: ''), 0, 10);
            if ($aActivity !== $bActivity) {
                return strcmp($bActivity, $aActivity);
            }
            return $b['total_bookings'] <=> $a['total_bookings'];
        });

        // Apply type & search filters
        $filtered = array_values(array_filter($allList, static function (array $c) use ($search, $type): bool {
            if ($type === 'registered' && !$c['has_account']) return false;
            if ($type === 'guest' && $c['has_account']) return false;
            if ($type === 'repeat' && $c['total_bookings'] < 2) return false;

            if ($search !== '') {
                $haystack = strtolower(
                    ($c['name'] ?? '') . ' ' .
                    ($c['email'] ?? '') . ' ' .
                    ($c['phone'] ?? '')
                );
                if (!str_contains($haystack, $search)) {
                    return false;
                }
            }
            return true;
        }));

        jsonResponse([
            'customers' => $filtered,
            'stats' => $stats,
        ]);
    }

    public static function detail(): void {
        $currentUser = Auth::requireAuth(['super_admin', 'branch_manager', 'receptionist']);
        $pdo = Database::getConnection();

        $userId = !empty($_GET['user_id']) ? (int)$_GET['user_id'] : null;
        $email = strtolower(trim($_GET['email'] ?? ''));
        $phone = trim($_GET['phone'] ?? '');

        if (!$userId && $email === '' && $phone === '') {
            errorResponse('Customer identifier (user_id, email, or phone) is required.', 422);
        }

        $canViewAmount = in_array($currentUser['role'], ['super_admin', 'branch_manager', 'receptionist'], true);

        $account = null;
        if ($userId) {
            $uStmt = $pdo->prepare(
                "SELECT id, name, email, phone, avatar, is_active, created_at
                 FROM users
                 WHERE id = ? AND role = 'customer'
                 LIMIT 1"
            );
            $uStmt->execute([$userId]);
            $account = $uStmt->fetch() ?: null;
            if ($account && $email === '') {
                $email = strtolower(trim($account['email']));
            }
        } elseif ($email !== '' && $email !== 'walkin@ritiverse.com') {
            $uStmt = $pdo->prepare(
                "SELECT id, name, email, phone, avatar, is_active, created_at
                 FROM users
                 WHERE LOWER(email) = LOWER(?) AND role = 'customer'
                 LIMIT 1"
            );
            $uStmt->execute([$email]);
            $account = $uStmt->fetch() ?: null;
        }

        // Fetch bookings matching customer email (or phone fallback for walk-ins)
        if ($email !== '' && $email !== 'walkin@ritiverse.com') {
            $bStmt = $pdo->prepare(
                "SELECT b.*, s.name as stylist_name, s.role_title as stylist_title, s.avatar_url as stylist_avatar
                 FROM bookings b
                 LEFT JOIN stylists s ON b.stylist_id = s.id
                 WHERE LOWER(b.customer_email) = LOWER(?)
                 ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC"
            );
            $bStmt->execute([$email]);
        } else {
            $bStmt = $pdo->prepare(
                "SELECT b.*, s.name as stylist_name, s.role_title as stylist_title, s.avatar_url as stylist_avatar
                 FROM bookings b
                 LEFT JOIN stylists s ON b.stylist_id = s.id
                 WHERE REPLACE(LOWER(b.customer_phone), ' ', '') = REPLACE(LOWER(?), ' ', '')
                 ORDER BY b.booking_date DESC, b.start_time DESC, b.id DESC"
            );
            $bStmt->execute([$phone]);
        }
        $bookings = $bStmt->fetchAll();

        if (!empty($bookings)) {
            $bIds = array_column($bookings, 'id');
            $inB = implode(',', array_fill(0, count($bIds), '?'));
            $itemStmt = $pdo->prepare(
                "SELECT booking_id, service_id, package_id, item_name, price, duration_minutes
                 FROM booking_items
                 WHERE booking_id IN ($inB)
                 ORDER BY id ASC"
            );
            $itemStmt->execute($bIds);
            $grouped = [];
            foreach ($itemStmt->fetchAll() as $it) {
                if (!$canViewAmount) {
                    unset($it['price']);
                }
                $grouped[$it['booking_id']][] = $it;
            }
            foreach ($bookings as &$b) {
                $b['items'] = $grouped[$b['id']] ?? [];
                if (!$canViewAmount) {
                    unset($b['subtotal'], $b['discount_amount'], $b['tax_amount'], $b['total_amount'], $b['deposit_amount']);
                }
            }
            unset($b);
        }

        if (!$account && empty($bookings)) {
            errorResponse('Customer record not found.', 404);
        }

        $today = date('Y-m-d');
        $totalSpent = 0.0;
        $completedCount = 0;
        $upcomingCount = 0;
        $cancelledCount = 0;

        foreach ($bookings as $b) {
            if ($b['booking_status'] === 'completed') $completedCount++;
            if ($b['booking_status'] === 'cancelled') {
                $cancelledCount++;
            } else {
                $totalSpent += (float)($b['total_amount'] ?? 0);
            }
            if (in_array($b['booking_status'], ['pending', 'confirmed'], true) && $b['booking_date'] >= $today) {
                $upcomingCount++;
            }
        }

        $firstBooking = $bookings[0] ?? null;
        $profile = [
            'user_id' => $account ? (int)$account['id'] : null,
            'has_account' => (bool)$account,
            'name' => $account['name'] ?? ($firstBooking['customer_name'] ?? 'Guest Client'),
            'email' => $account['email'] ?? ($firstBooking['customer_email'] ?? $email),
            'phone' => $account['phone'] ?? ($firstBooking['customer_phone'] ?? $phone),
            'avatar' => $account['avatar'] ?? null,
            'is_active' => $account ? (int)$account['is_active'] : 1,
            'joined_at' => $account['created_at'] ?? ($firstBooking['created_at'] ?? null),
            'total_bookings' => count($bookings),
            'completed_count' => $completedCount,
            'upcoming_count' => $upcomingCount,
            'cancelled_count' => $cancelledCount,
            'total_spent' => round($totalSpent, 2),
        ];

        if (!$canViewAmount) {
            unset($profile['total_spent']);
        }

        jsonResponse([
            'customer' => $profile,
            'bookings' => $bookings,
        ]);
    }

    public static function toggleStatus(int $id): void {
        $currentUser = Auth::requireAuth(['super_admin']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT id, name, email, role, is_active FROM users WHERE id = ? AND role = 'customer' LIMIT 1");
        $stmt->execute([$id]);
        $customer = $stmt->fetch();

        if (!$customer) {
            errorResponse('Registered customer account not found.', 404);
        }

        $newStatus = isset($input['is_active'])
            ? ((int)$input['is_active'] ? 1 : 0)
            : ((int)$customer['is_active'] ? 0 : 1);

        $upStmt = $pdo->prepare("UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?");
        $upStmt->execute([$newStatus, $id]);

        Auth::logAudit(
            $currentUser['id'],
            'CUSTOMER_STATUS_UPDATED',
            'users',
            (string)$id,
            "Customer {$customer['name']} ({$customer['email']}) set is_active={$newStatus}"
        );

        jsonResponse([
            'id' => $id,
            'is_active' => $newStatus,
        ], 200, $newStatus ? 'Customer account activated.' : 'Customer account disabled.');
    }
}
