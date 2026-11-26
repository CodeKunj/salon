<?php
// api/controllers/AuthController.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';
require_once __DIR__ . '/../helpers/validator.php';

class AuthController {
    public static function login(): void {
        $input = getJsonInput();
        $email = trim($input['email'] ?? '');
        $password = (string)($input['password'] ?? '');

        if (empty($email) || empty($password)) {
            errorResponse('Email and password are required.', 422);
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT id, name, email, password_hash, role, phone, avatar, is_active FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            errorResponse('Invalid credentials.', 401);
        }

        if (!$user['is_active']) {
            errorResponse('Account is deactivated. Please contact the administrator.', 403);
        }

        $validPassword = password_verify($password, $user['password_hash']);

        if (!$validPassword) {
            Auth::logAudit($user['id'], 'LOGIN_FAILED', 'users', (string)$user['id'], "Failed login attempt for {$email}");
            errorResponse('Invalid credentials.', 401);
        }

        $tokenPayload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ];

        // Read session timeout from settings (default 120 mins)
        $timeoutStmt = $pdo->query("SELECT setting_value FROM settings WHERE setting_key = 'session_timeout_minutes'");
        $timeoutMins = (int)($timeoutStmt->fetchColumn() ?: 120);
        $ttl = $timeoutMins * 60;

        $token = Auth::generateJWT($tokenPayload, $ttl);

        Auth::logAudit($user['id'], 'LOGIN_SUCCESS', 'users', (string)$user['id'], "Successful login by {$user['name']}");

        unset($user['password_hash']);

        jsonResponse([
            'token' => $token,
            'expires_in' => $ttl,
            'user' => $user
        ], 200, 'Login successful');
    }

    public static function me(): void {
        $user = Auth::requireAuth();
        jsonResponse(['user' => $user]);
    }

    public static function logout(): void {
        $user = Auth::getCurrentUser();
        if ($user) {
            Auth::logAudit($user['id'], 'LOGOUT', 'users', (string)$user['id'], "User logged out");
        }
        jsonResponse(null, 200, 'Logged out successfully');
    }

    public static function refresh(): void {
        $user = Auth::requireAuth();
        $tokenPayload = [
            'user_id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name']
        ];
        $token = Auth::generateJWT($tokenPayload, 7200);
        jsonResponse(['token' => $token, 'user' => $user]);
    }
}
