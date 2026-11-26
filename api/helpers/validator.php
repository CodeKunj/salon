<?php
// api/helpers/validator.php

class Validator {
    public static function sanitizeString(mixed $val): string {
        return htmlspecialchars(trim((string)$val), ENT_QUOTES, 'UTF-8');
    }

    public static function validateEmail(string $email): bool {
        return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
    }

    public static function validateDate(string $date, string $format = 'Y-m-d'): bool {
        $d = DateTime::createFromFormat($format, $date);
        return $d && $d->format($format) === $date;
    }

    public static function validateTime(string $time): bool {
        return (bool)preg_match('/^(?:2[0-3]|[01][0-9]):[0-5][0-9](?::[0-5][0-9])?$/', $time);
    }

    public static function sanitizeArray(array $data): array {
        $clean = [];
        foreach ($data as $key => $val) {
            if (is_array($val)) {
                $clean[$key] = self::sanitizeArray($val);
            } elseif (is_string($val)) {
                $clean[$key] = trim($val);
            } else {
                $clean[$key] = $val;
            }
        }
        return $clean;
    }
}
