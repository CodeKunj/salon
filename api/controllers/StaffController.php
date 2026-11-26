<?php
// api/controllers/StaffController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class StaffController {
    public static function list(): void {
        $currentUser = Auth::requireAuth();
        $pdo = Database::getConnection();

        $stylists = $pdo->query("SELECT * FROM stylists ORDER BY sort_order ASC, id ASC")->fetchAll();
        $canViewCommission = in_array($currentUser['role'], ['super_admin', 'branch_manager'], true);

        // Fetch schedules
        $schedules = $pdo->query("SELECT * FROM stylist_schedules ORDER BY day_of_week ASC")->fetchAll();
        $grouped = [];
        foreach ($schedules as $s) {
            $grouped[$s['stylist_id']][] = $s;
        }

        foreach ($stylists as &$st) {
            $st['schedules'] = $grouped[$st['id']] ?? [];
            if (!$canViewCommission) {
                unset($st['commission_pct']);
            }
        }

        jsonResponse($stylists);
    }

    public static function save(): void {
        $user = Auth::requireAuth(['super_admin', 'branch_manager']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $name = trim($input['name'] ?? '');
        $roleTitle = trim($input['role_title'] ?? 'Senior Stylist');
        $bio = trim($input['bio'] ?? '');
        $avatarUrl = trim($input['avatar_url'] ?? '');
        $commissionPct = (float)($input['commission_pct'] ?? 15.00);
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
        $sortOrder = (int)($input['sort_order'] ?? 0);
        $schedules = (array)($input['schedules'] ?? []);

        if (empty($name)) {
            errorResponse('Stylist name is required.', 422);
        }
        if ($commissionPct < 0 || $commissionPct > 100) {
            errorResponse('Commission percentage must be between 0 and 100.', 422);
        }

        $pdo->beginTransaction();
        try {
            if ($id) {
                $exists = $pdo->prepare("SELECT id FROM stylists WHERE id = ? LIMIT 1");
                $exists->execute([$id]);
                if (!$exists->fetch()) {
                    $pdo->rollBack();
                    errorResponse('Stylist not found.', 404);
                }
                $stmt = $pdo->prepare("UPDATE stylists SET name = ?, role_title = ?, bio = ?, avatar_url = ?, commission_pct = ?, is_active = ?, sort_order = ? WHERE id = ?");
                $stmt->execute([$name, $roleTitle, $bio, $avatarUrl, $commissionPct, $isActive, $sortOrder, $id]);
                Auth::logAudit($user['id'], 'STYLIST_UPDATED', 'stylists', (string)$id, "Stylist {$name} updated");
            } else {
                $stmt = $pdo->prepare("INSERT INTO stylists (name, role_title, bio, avatar_url, commission_pct, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([$name, $roleTitle, $bio, $avatarUrl, $commissionPct, $isActive, $sortOrder]);
                $id = (int)$pdo->lastInsertId();

                // Default weekly schedule for new stylist (Mon-Sat 9-19)
                $schStmt = $pdo->prepare("INSERT INTO stylist_schedules (stylist_id, day_of_week, start_time, end_time, break_start, break_end, is_working) VALUES (?, ?, ?, ?, ?, ?, ?)");
                for ($d = 0; $d <= 6; $d++) {
                    $isWorking = ($d === 0) ? 0 : 1;
                    $schStmt->execute([$id, $d, '09:00:00', '19:00:00', '13:00:00', '14:00:00', $isWorking]);
                }

                Auth::logAudit($user['id'], 'STYLIST_CREATED', 'stylists', (string)$id, "Stylist {$name} created");
            }

            // If schedules provided, update them
            if (!empty($schedules)) {
                $upSch = $pdo->prepare("UPDATE stylist_schedules SET start_time = ?, end_time = ?, break_start = ?, break_end = ?, is_working = ? WHERE stylist_id = ? AND day_of_week = ?");
                foreach ($schedules as $s) {
                    $upSch->execute([
                        $s['start_time'] ?? '09:00:00',
                        $s['end_time'] ?? '19:00:00',
                        $s['break_start'] ?? '13:00:00',
                        $s['break_end'] ?? '14:00:00',
                        isset($s['is_working']) ? (int)$s['is_working'] : 1,
                        $id,
                        (int)$s['day_of_week']
                    ]);
                }
            }

            $pdo->commit();
        } catch (Throwable $e) {
            if ($pdo->inTransaction()) {
                $pdo->rollBack();
            }
            throw $e;
        }

        jsonResponse(['id' => $id, 'name' => $name], 200, 'Stylist saved');
    }

    public static function delete(int $id): void {
        $user = Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM stylists WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->rowCount() === 0) {
            errorResponse('Stylist not found.', 404);
        }
        Auth::logAudit($user['id'], 'STYLIST_DELETED', 'stylists', (string)$id, "Stylist #{$id} deleted");
        jsonResponse(null, 200, 'Stylist deleted');
    }
}
