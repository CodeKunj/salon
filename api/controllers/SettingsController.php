<?php
// api/controllers/SettingsController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class SettingsController {
    private const SUPER_ADMIN_GROUPS = ['payments', 'notifications', 'seo_analytics', 'security'];
    private const MANAGER_GROUPS = ['general', 'booking_rules', 'pricing_rules', 'staff_rules'];

    private static function buildSettingsMap(PDO $pdo, array $user): array {
        $rows = $pdo->query("SELECT setting_group, setting_key, setting_value, is_secret FROM settings ORDER BY id ASC")->fetchAll();
        $settings = [];
        $isSuperAdmin = ($user['role'] === 'super_admin');

        foreach ($rows as $r) {
            $group = $r['setting_group'];
            if (!$isSuperAdmin && !in_array($group, self::MANAGER_GROUPS, true)) {
                continue;
            }
            $key = $r['setting_key'];
            $val = $r['setting_value'];

            // Mask secrets for UI display
            if ((int)$r['is_secret'] === 1 && !empty($val)) {
                $val = '••••••••••••••••';
            }

            $settings[$group][$key] = $val;
        }

        return $settings;
    }

    public static function getAll(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        jsonResponse(self::buildSettingsMap($pdo, $user));
    }

    public static function bootstrap(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();

        $payload = [
            'settings' => self::buildSettingsMap($pdo, $user),
            'hours' => $pdo->query("SELECT * FROM business_hours ORDER BY day_of_week ASC")->fetchAll(),
            'closures' => $pdo->query("SELECT * FROM special_closures ORDER BY closure_date DESC")->fetchAll(),
            'promos' => $pdo->query("SELECT * FROM promo_codes ORDER BY id DESC")->fetchAll(),
            'users' => [],
            'audit_logs' => [],
        ];

        if ($user['role'] === 'super_admin') {
            $payload['users'] = $pdo->query("SELECT id, name, email, role, phone, avatar, is_active, two_factor_enabled, created_at, updated_at FROM users WHERE role != 'customer' ORDER BY id ASC")->fetchAll();
            $payload['audit_logs'] = $pdo->query("SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id ORDER BY a.id DESC LIMIT 25")->fetchAll();
        }

        jsonResponse($payload);
    }

    public static function updateGroup(string $group): void {
        if (in_array($group, self::SUPER_ADMIN_GROUPS, true)) {
            $user = Auth::requireAuth(['super_admin']);
        } elseif (in_array($group, self::MANAGER_GROUPS, true)) {
            $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        } else {
            errorResponse("Unknown settings module: {$group}", 422);
        }
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $stmt = $pdo->prepare("SELECT setting_key, setting_value, is_secret FROM settings WHERE setting_group = ?");
        $stmt->execute([$group]);
        $existing = [];
        foreach ($stmt->fetchAll() as $row) {
            $existing[$row['setting_key']] = $row;
        }

        $isSqlite = $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'sqlite';
        if ($isSqlite) {
            $upStmt = $pdo->prepare("INSERT INTO settings (setting_group, setting_key, setting_value, is_secret) VALUES (?, ?, ?, ?) ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value, updated_at = CURRENT_TIMESTAMP");
        } else {
            $upStmt = $pdo->prepare("INSERT INTO settings (setting_group, setting_key, setting_value, is_secret) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_at = CURRENT_TIMESTAMP");
        }

        foreach ($input as $key => $val) {
            if (is_array($val) || is_object($val)) {
                $val = json_encode($val);
            } else {
                $val = (string)$val;
            }

            // If it's a secret and contains masked dots, do not overwrite existing value
            if (isset($existing[$key]) && (int)$existing[$key]['is_secret'] === 1) {
                if (str_contains($val, '••••') || empty($val)) {
                    continue; // Keep existing secret
                }
            }

            $isSecret = isset($existing[$key]) ? (int)$existing[$key]['is_secret'] : 0;
            $upStmt->execute([$group, $key, $val, $isSecret]);
        }

        Auth::logAudit($user['id'], 'SETTINGS_UPDATED', 'settings', $group, "Settings module [{$group}] updated");

        jsonResponse(['group' => $group], 200, "Settings for {$group} updated successfully");
    }

    // BUSINESS HOURS
    public static function getHours(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $hours = $pdo->query("SELECT * FROM business_hours ORDER BY day_of_week ASC")->fetchAll();
        jsonResponse($hours);
    }

    public static function updateHours(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $days = (array)($input['days'] ?? []);
        $upStmt = $pdo->prepare("UPDATE business_hours SET open_time = ?, close_time = ?, break_start = ?, break_end = ?, is_closed = ? WHERE day_of_week = ?");

        foreach ($days as $d) {
            $upStmt->execute([
                $d['open_time'] ?? '09:00:00',
                $d['close_time'] ?? '20:00:00',
                !empty($d['break_start']) ? $d['break_start'] : null,
                !empty($d['break_end']) ? $d['break_end'] : null,
                isset($d['is_closed']) ? (int)$d['is_closed'] : 0,
                (int)$d['day_of_week']
            ]);
        }

        Auth::logAudit($user['id'], 'HOURS_UPDATED', 'business_hours', null, "Weekly business hours updated");
        jsonResponse(null, 200, 'Business hours saved');
    }

    // SPECIAL CLOSURES
    public static function listClosures(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $closures = $pdo->query("SELECT * FROM special_closures ORDER BY closure_date DESC")->fetchAll();
        jsonResponse($closures);
    }

    public static function saveClosure(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $title = trim($input['title'] ?? 'Holiday Closure');
        $date = trim($input['closure_date'] ?? date('Y-m-d'));
        $isFullDay = isset($input['is_full_day']) ? (int)$input['is_full_day'] : 1;
        $startTime = !empty($input['start_time']) ? $input['start_time'] : null;
        $endTime = !empty($input['end_time']) ? $input['end_time'] : null;
        $reason = trim($input['reason'] ?? '');

        if ($id) {
            $stmt = $pdo->prepare("UPDATE special_closures SET title = ?, closure_date = ?, is_full_day = ?, start_time = ?, end_time = ?, reason = ? WHERE id = ?");
            $stmt->execute([$title, $date, $isFullDay, $startTime, $endTime, $reason, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO special_closures (title, closure_date, is_full_day, start_time, end_time, reason) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$title, $date, $isFullDay, $startTime, $endTime, $reason]);
            $id = (int)$pdo->lastInsertId();
        }

        Auth::logAudit($user['id'], 'CLOSURE_SAVED', 'special_closures', (string)$id, "Closure [{$title}] on {$date}");
        jsonResponse(['id' => $id], 200, 'Closure saved');
    }

    public static function deleteClosure(int $id): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM special_closures WHERE id = ?")->execute([$id]);
        Auth::logAudit($user['id'], 'CLOSURE_DELETED', 'special_closures', (string)$id, "Closure #{$id} deleted");
        jsonResponse(null, 200, 'Closure deleted');
    }

    // PROMO CODES
    public static function listPromoCodes(): void {
        Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $promos = $pdo->query("SELECT * FROM promo_codes ORDER BY id DESC")->fetchAll();
        jsonResponse($promos);
    }

    public static function savePromoCode(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $code = strtoupper(trim($input['code'] ?? ''));
        $discountType = in_array($input['discount_type'] ?? '', ['percentage', 'fixed']) ? $input['discount_type'] : 'percentage';
        $discountValue = (float)($input['discount_value'] ?? 10);
        $minOrder = (float)($input['min_order_value'] ?? 0);
        $maxDiscount = !empty($input['max_discount']) ? (float)$input['max_discount'] : null;
        $startDate = !empty($input['start_date']) ? $input['start_date'] : null;
        $endDate = !empty($input['end_date']) ? $input['end_date'] : null;
        $usageLimit = (int)($input['usage_limit'] ?? 500);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;

        if (empty($code) || $discountValue <= 0) {
            errorResponse('Code and positive discount value are required.', 422);
        }

        if ($id) {
            $stmt = $pdo->prepare("UPDATE promo_codes SET code = ?, discount_type = ?, discount_value = ?, min_order_value = ?, max_discount = ?, start_date = ?, end_date = ?, usage_limit = ?, is_active = ? WHERE id = ?");
            $stmt->execute([$code, $discountType, $discountValue, $minOrder, $maxDiscount, $startDate, $endDate, $usageLimit, $isActive, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO promo_codes (code, discount_type, discount_value, min_order_value, max_discount, start_date, end_date, usage_limit, times_used, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)");
            $stmt->execute([$code, $discountType, $discountValue, $minOrder, $maxDiscount, $startDate, $endDate, $usageLimit, $isActive]);
            $id = (int)$pdo->lastInsertId();
        }

        Auth::logAudit($user['id'], 'PROMO_SAVED', 'promo_codes', (string)$id, "Promo code {$code} saved");
        jsonResponse(['id' => $id, 'code' => $code], 200, 'Promo code saved');
    }

    public static function deletePromoCode(int $id): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM promo_codes WHERE id = ?")->execute([$id]);
        Auth::logAudit($user['id'], 'PROMO_DELETED', 'promo_codes', (string)$id, "Promo code #{$id} deleted");
        jsonResponse(null, 200, 'Promo code deleted');
    }
}
