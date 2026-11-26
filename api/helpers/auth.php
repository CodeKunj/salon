<?php
// api/helpers/auth.php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/response.php';

class Auth {
    private static ?string $resolvedSecret = null;
    private const STAFF_ROLES = ['super_admin', 'branch_manager', 'receptionist', 'stylist'];

    public static function getSecret(): string {
        if (self::$resolvedSecret !== null) {
            return self::$resolvedSecret;
        }

        $envSecret = getenv('JWT_SECRET') ?: ($_ENV['JWT_SECRET'] ?? '');
        if (is_string($envSecret) && strlen(trim($envSecret)) >= 32) {
            self::$resolvedSecret = trim($envSecret);
            return self::$resolvedSecret;
        }

        $secretFile = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'config' . DIRECTORY_SEPARATOR . '.jwt_secret';
        if (file_exists($secretFile)) {
            $stored = trim((string)@file_get_contents($secretFile));
            if (strlen($stored) >= 32) {
                self::$resolvedSecret = $stored;
                return self::$resolvedSecret;
            }
        }

        $generated = bin2hex(random_bytes(32));
        @file_put_contents($secretFile, $generated);
        @chmod($secretFile, 0600);
        self::$resolvedSecret = $generated;
        return self::$resolvedSecret;
    }

    public static function generateJWT(array $payload, int $ttl = 86400): string {
        $header = ['typ' => 'JWT', 'alg' => 'HS256'];
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $ttl;

        $base64Header = self::base64UrlEncode(json_encode($header));
        $base64Payload = self::base64UrlEncode(json_encode($payload));

        $signature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", self::getSecret(), true);
        $base64Signature = self::base64UrlEncode($signature);

        return "{$base64Header}.{$base64Payload}.{$base64Signature}";
    }

    public static function verifyJWT(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$base64Header, $base64Payload, $base64Signature] = $parts;

        $signature = self::base64UrlDecode($base64Signature);
        if ($signature === '') {
            return null;
        }
        $expectedSignature = hash_hmac('sha256', "{$base64Header}.{$base64Payload}", self::getSecret(), true);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($base64Payload), true);
        if (!is_array($payload) || !isset($payload['exp'], $payload['user_id']) || (int)$payload['exp'] < time()) {
            return null;
        }

        return $payload;
    }

    public static function getBearerToken(): ?string {
        $headers = '';
        if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            if (!empty($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            } elseif (!empty($requestHeaders['authorization'])) {
                $headers = trim($requestHeaders['authorization']);
            } elseif (!empty($requestHeaders['X-Auth-Token'])) {
                return trim($requestHeaders['X-Auth-Token']);
            } elseif (!empty($requestHeaders['x-auth-token'])) {
                return trim($requestHeaders['x-auth-token']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }

        if (!empty($_SERVER['HTTP_X_AUTH_TOKEN'])) {
            return trim($_SERVER['HTTP_X_AUTH_TOKEN']);
        }

        return null;
    }

    public static function getCurrentUser(): ?array {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }

        $payload = self::verifyJWT($token);
        if (!$payload || !isset($payload['user_id'])) {
            return null;
        }

        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("SELECT id, name, email, role, phone, avatar, is_active FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([$payload['user_id']]);
            $user = $stmt->fetch();
            if ($user && $user['is_active']) {
                return $user;
            }
        } catch (Exception $e) {
            return null;
        }

        return null;
    }

    public static function requireAuth(array $allowedRoles = []): array {
        $user = self::getCurrentUser();
        if (!$user) {
            errorResponse('Unauthorized. Valid token required.', 401);
        }

        // Default requireAuth() strictly permits staff/admin roles and blocks customer tokens
        $effectiveRoles = !empty($allowedRoles) ? $allowedRoles : self::STAFF_ROLES;
        if (!in_array($user['role'], $effectiveRoles, true)) {
            errorResponse('Forbidden. Insufficient permissions.', 403);
        }

        return $user;
    }

    public static function logAudit(?int $userId, string $action, ?string $entity = null, ?string $entityId = null, ?string $details = null): void {
        try {
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address, user_agent, details) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
            $ua = substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 255);
            $stmt->execute([$userId, $action, $entity, $entityId, $ip, $ua, $details]);
        } catch (Exception $e) {
            // Silently continue if audit log fails
        }
    }

    private static function base64UrlEncode(string $data): string {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string {
        return base64_decode(strtr($data, '-_', '+/'));
    }
}
