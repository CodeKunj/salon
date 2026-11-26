<?php
// api/config/database.php

class Database {
    private static ?PDO $pdo = null;

    public static function getConnection(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        self::loadEnv();

        $driver = getenv('DB_DRIVER');
        $host = getenv('DB_HOST') ?: '127.0.0.1';
        $port = getenv('DB_PORT') ?: '3306';
        $dbName = getenv('DB_NAME') ?: '';
        $dbUser = getenv('DB_USER') ?: 'root';
        $dbPass = getenv('DB_PASS') !== false ? getenv('DB_PASS') : '';

        $sqlitePath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'salon.sqlite';
        $hasExplicitMysql = ($driver === 'mysql') || (!empty($dbName));

        // Use SQLite directly when explicitly configured or when no MySQL .env config exists and local SQLite DB is present
        if ($driver === 'sqlite' || (!$hasExplicitMysql && file_exists($sqlitePath) && filesize($sqlitePath) >= 1000)) {
            return self::getSqliteConnection();
        }

        if ($dbName === '') {
            $dbName = 'salon_db';
        }

        try {
            $dsn = "mysql:host={$host};port={$port};dbname={$dbName};charset=utf8mb4";
            $initCommand = defined('\Pdo\Mysql::ATTR_INIT_COMMAND') ? \Pdo\Mysql::ATTR_INIT_COMMAND : (defined('PDO::MYSQL_ATTR_INIT_COMMAND') ? PDO::MYSQL_ATTR_INIT_COMMAND : 1002);
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::ATTR_TIMEOUT => 1,
                $initCommand => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            self::$pdo = new PDO($dsn, $dbUser, $dbPass, $options);
            return self::$pdo;
        } catch (PDOException $e) {
            // In local development or standalone testing if MySQL is not running, fallback to SQLite
            if (getenv('APP_ENV') === 'development' || empty(getenv('DB_NAME'))) {
                return self::getSqliteConnection();
            }
            error_log("Database Connection Error: " . $e->getMessage());
            $msg = getenv('APP_ENV') === 'development' ? "Database connection failed: " . $e->getMessage() : "Database connection failed.";
            throw new Exception($msg);
        }
    }

    private static function getSqliteConnection(): PDO {
        $sqlitePath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'database' . DIRECTORY_SEPARATOR . 'salon.sqlite';
        $needsSeed = !file_exists($sqlitePath) || filesize($sqlitePath) < 1000;

        self::$pdo = new PDO("sqlite:" . $sqlitePath);
        self::$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        self::$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        self::$pdo->exec("PRAGMA busy_timeout = 3000;");
        self::$pdo->exec("PRAGMA journal_mode = WAL;");
        self::$pdo->exec("PRAGMA synchronous = NORMAL;");

        if ($needsSeed) {
            self::seedSqlite(self::$pdo);
        }

        return self::$pdo;
    }

    private static function seedSqlite(PDO $pdo): void {
        $seedScript = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'helpers' . DIRECTORY_SEPARATOR . 'sqlite_seeder.php';
        if (file_exists($seedScript)) {
            require_once $seedScript;
            seedSqliteDatabase($pdo);
        }
    }

    public static function loadEnv(): void {
        $envPaths = [
            dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . '.env',
            dirname(__DIR__) . DIRECTORY_SEPARATOR . '.env'
        ];

        foreach ($envPaths as $path) {
            if (file_exists($path)) {
                $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $line = trim($line);
                    if ($line === '' || str_starts_with($line, '#')) {
                        continue;
                    }
                    if (str_contains($line, '=')) {
                        [$name, $value] = explode('=', $line, 2);
                        $name = trim($name);
                        $value = trim($value, " \t\n\r\0\x0B\"'");
                        if (getenv($name) === false) {
                            putenv("{$name}={$value}");
                            $_ENV[$name] = $value;
                        }
                    }
                }
                break;
            }
        }
    }
}
