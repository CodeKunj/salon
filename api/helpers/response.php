<?php
// api/helpers/response.php

function jsonResponse(mixed $data = null, int $statusCode = 200, string $message = ''): void {
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }

    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'status' => $statusCode,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('c')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function errorResponse(string $message = 'An error occurred', int $statusCode = 400, array $errors = []): void {
    if (!headers_sent()) {
        http_response_code($statusCode);
        header('Content-Type: application/json; charset=utf-8');
        header('X-Content-Type-Options: nosniff');
    }

    $response = [
        'success' => false,
        'status' => $statusCode,
        'message' => $message,
        'errors' => $errors,
        'timestamp' => date('c')
    ];

    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getJsonInput(): array {
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return $_POST;
    }
    $decoded = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        errorResponse('Malformed JSON request payload.', 400);
    }
    return is_array($decoded) ? $decoded : [];
}
