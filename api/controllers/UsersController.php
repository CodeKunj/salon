<?php
// api/controllers/UsersController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class UsersController {
    public static function list(): void {
        Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();

        $users = $pdo->query("SELECT id, name, email, role, phone, avatar, is_active, two_factor_enabled, created_at, updated_at FROM users WHERE role != 'customer' ORDER BY id ASC")->fetchAll();
        jsonResponse($users);
    }

    public static function save(): void {
        $currentUser = Auth::requireAuth(['super_admin']);
        $input = getJsonInput();
        $pdo = Database::getConnection();

        $id = !empty($input['id']) ? (int)$input['id'] : null;
        $name = trim($input['name'] ?? '');
        $email = trim($input['email'] ?? '');
        $role = in_array($input['role'] ?? '', ['super_admin', 'branch_manager', 'receptionist', 'stylist']) ? $input['role'] : 'receptionist';
        $phone = trim($input['phone'] ?? '');
        $avatar = trim($input['avatar'] ?? '');
        $isActive = isset($input['is_active']) ? (int)$input['is_active'] : 1;
        $password = (string)($input['password'] ?? '');

        if (empty($name) || empty($email) || !Validator::validateEmail($email)) {
            errorResponse('Valid name and email are required.', 422);
        }

        if ($id) {
            if (!empty($password)) {
                $hash = password_hash($password, PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, phone = ?, avatar = ?, is_active = ?, password_hash = ? WHERE id = ?");
                $stmt->execute([$name, $email, $role, $phone, $avatar, $isActive, $hash, $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE users SET name = ?, email = ?, role = ?, phone = ?, avatar = ?, is_active = ? WHERE id = ?");
                $stmt->execute([$name, $email, $role, $phone, $avatar, $isActive, $id]);
            }
            Auth::logAudit($currentUser['id'], 'USER_UPDATED', 'users', (string)$id, "User {$name} updated");
        } else {
            if (empty($password)) {
                errorResponse('Password is required for new users.', 422);
            }
            $hash = password_hash($password, PASSWORD_BCRYPT);
            $stmt = $pdo->prepare("INSERT INTO users (name, email, password_hash, role, phone, avatar, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$name, $email, $hash, $role, $phone, $avatar, $isActive]);
            $id = (int)$pdo->lastInsertId();
            Auth::logAudit($currentUser['id'], 'USER_CREATED', 'users', (string)$id, "User {$name} created");
        }

        jsonResponse(['id' => $id, 'name' => $name], 200, 'User saved');
    }

    public static function delete(int $id): void {
        $currentUser = Auth::requireAuth(['super_admin']);
        if ($currentUser['id'] === $id) {
            errorResponse('Cannot delete your own active administrator account.', 400);
        }

        $pdo = Database::getConnection();
        $pdo->prepare("DELETE FROM users WHERE id = ?")->execute([$id]);
        Auth::logAudit($currentUser['id'], 'USER_DELETED', 'users', (string)$id, "User #{$id} deleted");
        jsonResponse(null, 200, 'User deleted');
    }

    public static function listAuditLogs(): void {
        Auth::requireAuth(['super_admin']);
        $pdo = Database::getConnection();

        $page = max(1, (int)($_GET['page'] ?? 1));
        $limit = min(100, max(1, (int)($_GET['limit'] ?? 50)));
        $offset = ($page - 1) * $limit;

        $search = trim($_GET['search'] ?? '');
        $where = ["1=1"];
        $params = [];

        if (!empty($search)) {
            $where[] = "(a.action LIKE ? OR a.entity LIKE ? OR a.details LIKE ? OR u.name LIKE ?)";
            $wild = "%{$search}%";
            $params = [$wild, $wild, $wild, $wild];
        }

        $whereClause = implode(" AND ", $where);

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM audit_logs a LEFT JOIN users u ON a.user_id = u.id WHERE {$whereClause}");
        $countStmt->execute($params);
        $total = (int)$countStmt->fetchColumn();

        $sql = "SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
                FROM audit_logs a
                LEFT JOIN users u ON a.user_id = u.id
                WHERE {$whereClause}
                ORDER BY a.id DESC
                LIMIT {$limit} OFFSET {$offset}";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $logs = $stmt->fetchAll();

        jsonResponse([
            'logs' => $logs,
            'pagination' => [
                'page' => $page,
                'limit' => $limit,
                'total' => $total,
                'pages' => ceil($total / $limit)
            ]
        ]);
    }
}
