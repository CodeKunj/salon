<?php
// api/index.php - Main API Router

// Main API Error Guard (prevent raw HTML warnings/fatals from breaking JSON API)
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/auth.php';
require_once __DIR__ . '/helpers/validator.php';

set_error_handler(function (int $severity, string $message, string $file, int $line): bool {
    if (!(error_reporting() & $severity)) {
        return false;
    }
    error_log("API PHP Warning/Error [{$severity}]: {$message} in {$file}:{$line}");
    return true;
});

register_shutdown_function(function (): void {
    $lastError = error_get_last();
    if ($lastError && in_array($lastError['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) {
        error_log("API Fatal Error: {$lastError['message']} in {$lastError['file']}:{$lastError['line']}");
        $msg = getenv('APP_ENV') === 'development' ? $lastError['message'] : 'A critical server error occurred.';
        errorResponse($msg, 500);
    }
});

// Load controllers
require_once __DIR__ . '/controllers/PublicController.php';
require_once __DIR__ . '/controllers/AuthController.php';
require_once __DIR__ . '/controllers/BookingsController.php';
require_once __DIR__ . '/controllers/ServicesController.php';
require_once __DIR__ . '/controllers/StaffController.php';
require_once __DIR__ . '/controllers/SettingsController.php';
require_once __DIR__ . '/controllers/CMSController.php';
require_once __DIR__ . '/controllers/UsersController.php';
require_once __DIR__ . '/controllers/CustomerController.php';
require_once __DIR__ . '/controllers/CustomersAdminController.php';

// Parse URI
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Normalize path: remove leading /api or /Salon/api or subdirectories
$path = preg_replace('#^.*?/api/?#i', '', $uri);
$path = trim($path, '/');
$segments = explode('/', $path);

$resource = $segments[0] ?? '';
$action = $segments[1] ?? '';
$subId = $segments[2] ?? '';

try {
    // ----------------------------------------------------
    // PUBLIC ROUTES (No Auth Required)
    // ----------------------------------------------------
    if ($resource === 'public') {
        if ($action === 'bootstrap' && $method === 'GET') {
            PublicController::getBootstrap();
        } elseif (($action === 'slots' || $action === 'available-slots') && $method === 'GET') {
            PublicController::getSlots();
        } elseif ($action === 'validate-promo' && $method === 'POST') {
            PublicController::validatePromo();
        } elseif (($action === 'book' || $action === 'book-appointment') && $method === 'POST') {
            PublicController::bookAppointment();
        } elseif ($action === 'track-event' && $method === 'POST') {
            PublicController::trackEvent();
        }
    }

    // ----------------------------------------------------
    // STAFF AUTH ROUTES
    // ----------------------------------------------------
    if ($resource === 'auth') {
        if ($action === 'login' && $method === 'POST') {
            AuthController::login();
        } elseif ($action === 'me' && $method === 'GET') {
            AuthController::me();
        } elseif ($action === 'logout' && $method === 'POST') {
            AuthController::logout();
        } elseif ($action === 'refresh' && $method === 'POST') {
            AuthController::refresh();
        }
    }

    // ----------------------------------------------------
    // CUSTOMER AUTH & BOOKING PORTAL ROUTES
    // ----------------------------------------------------
    if ($resource === 'customer') {
        if ($action === 'register' && $method === 'POST') {
            CustomerController::register();
        } elseif ($action === 'login' && $method === 'POST') {
            CustomerController::login();
        } elseif ($action === 'me' && $method === 'GET') {
            CustomerController::me();
        } elseif ($action === 'profile' && ($method === 'POST' || $method === 'PUT' || $method === 'PATCH')) {
            CustomerController::updateProfile();
        } elseif ($action === 'bookings') {
            if (empty($subId) && $method === 'GET') {
                CustomerController::listBookings();
            } elseif (is_numeric($subId)) {
                $bookingId = (int)$subId;
                $fourth = $segments[3] ?? '';
                if ($method === 'GET' && empty($fourth)) {
                    CustomerController::getBooking($bookingId);
                } elseif (($method === 'POST' || $method === 'PUT' || $method === 'PATCH') && $fourth === 'cancel') {
                    CustomerController::cancelBooking($bookingId);
                }
            }
        }
    }

    // ----------------------------------------------------
    // BOOKINGS
    // ----------------------------------------------------
    if ($resource === 'bookings') {
        if (empty($action)) {
            if ($method === 'GET') BookingsController::list();
        } elseif ($action === 'walkin' && $method === 'POST') {
            BookingsController::createWalkIn();
        } elseif (is_numeric($action)) {
            $id = (int)$action;
            if ($method === 'GET') BookingsController::get($id);
            elseif (($method === 'PUT' || $method === 'PATCH' || $method === 'POST') && $subId === 'status') BookingsController::updateStatus($id);
            elseif ($method === 'DELETE') BookingsController::delete($id);
        }
    }

    // ----------------------------------------------------
    // SERVICES & CATEGORIES & PACKAGES
    // ----------------------------------------------------
    if ($resource === 'services') {
        if (empty($action)) {
            if ($method === 'GET') ServicesController::listServices();
            elseif ($method === 'POST') ServicesController::saveService();
        } elseif ($action === 'categories') {
            if (empty($subId)) {
                if ($method === 'GET') ServicesController::listCategories();
                elseif ($method === 'POST') ServicesController::saveCategory();
            } elseif (is_numeric($subId) && $method === 'DELETE') {
                ServicesController::deleteCategory((int)$subId);
            }
        } elseif ($action === 'packages') {
            if (empty($subId)) {
                if ($method === 'GET') ServicesController::listPackages();
                elseif ($method === 'POST') ServicesController::savePackage();
            } elseif (is_numeric($subId) && $method === 'DELETE') {
                ServicesController::deletePackage((int)$subId);
            }
        } elseif (is_numeric($action) && $method === 'DELETE') {
            ServicesController::deleteService((int)$action);
        }
    }

    // ----------------------------------------------------
    // STAFF / STYLISTS
    // ----------------------------------------------------
    if ($resource === 'staff') {
        if (empty($action)) {
            if ($method === 'GET') StaffController::list();
            elseif ($method === 'POST') StaffController::save();
        } elseif (is_numeric($action) && $method === 'DELETE') {
            StaffController::delete((int)$action);
        }
    }

    // ----------------------------------------------------
    // SETTINGS (9 MODULES)
    // ----------------------------------------------------
    if ($resource === 'settings') {
        if (empty($action) && $method === 'GET') {
            SettingsController::getAll();
        } elseif ($action === 'bootstrap' && $method === 'GET') {
            SettingsController::bootstrap();
        } elseif ($action === 'hours') {
            if ($method === 'GET') SettingsController::getHours();
            elseif ($method === 'POST') SettingsController::updateHours();
        } elseif ($action === 'closures') {
            if ($method === 'GET') SettingsController::listClosures();
            elseif ($method === 'POST') SettingsController::saveClosure();
            elseif (is_numeric($subId) && $method === 'DELETE') SettingsController::deleteClosure((int)$subId);
        } elseif ($action === 'promos') {
            if ($method === 'GET') SettingsController::listPromoCodes();
            elseif ($method === 'POST') SettingsController::savePromoCode();
            elseif (is_numeric($subId) && $method === 'DELETE') SettingsController::deletePromoCode((int)$subId);
        } elseif ($action === 'seo' && $subId === 'og-image' && $method === 'POST') {
            SettingsController::uploadOgImage();
        } elseif (!empty($action) && ($method === 'POST' || $method === 'PUT')) {
            // Update settings group (e.g. general, hours, booking_rules, pricing_rules, staff_rules, payments, notifications, seo_analytics, security)
            SettingsController::updateGroup($action);
        }
    }

    // ----------------------------------------------------
    // CMS (HERO, GALLERY, TESTIMONIALS, FAQS)
    // ----------------------------------------------------
    if ($resource === 'cms') {
        if ($action === 'hero') {
            if ($method === 'GET') CMSController::getHero();
            elseif ($method === 'POST') CMSController::updateHero();
        } elseif ($action === 'gallery') {
            if (empty($subId)) {
                if ($method === 'GET') CMSController::listGallery();
                elseif ($method === 'POST') CMSController::saveGallery();
            } elseif (is_numeric($subId) && $method === 'DELETE') {
                CMSController::deleteGallery((int)$subId);
            }
        } elseif ($action === 'testimonials') {
            if (empty($subId)) {
                if ($method === 'GET') CMSController::listTestimonials();
                elseif ($method === 'POST') CMSController::saveTestimonial();
            } elseif (is_numeric($subId) && $method === 'DELETE') {
                CMSController::deleteTestimonial((int)$subId);
            }
        } elseif ($action === 'faqs') {
            if (empty($subId)) {
                if ($method === 'GET') CMSController::listFAQs();
                elseif ($method === 'POST') CMSController::saveFAQ();
            } elseif (is_numeric($subId) && $method === 'DELETE') {
                CMSController::deleteFAQ((int)$subId);
            }
        }
    }

    // ----------------------------------------------------
    // USERS & AUDIT LOGS
    // ----------------------------------------------------
    if ($resource === 'users') {
        if (empty($action)) {
            if ($method === 'GET') UsersController::list();
            elseif ($method === 'POST') UsersController::save();
        } elseif ($action === 'audit-logs' && $method === 'GET') {
            UsersController::listAuditLogs();
        } elseif (is_numeric($action) && $method === 'DELETE') {
            UsersController::delete((int)$action);
        }
    }

    // ----------------------------------------------------
    // ADMIN CUSTOMER CRM DIRECTORY
    // ----------------------------------------------------
    if ($resource === 'customers') {
        if (empty($action) && $method === 'GET') {
            CustomersAdminController::list();
        } elseif ($action === 'detail' && $method === 'GET') {
            CustomersAdminController::detail();
        } elseif (is_numeric($action) && $subId === 'status' && in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
            CustomersAdminController::toggleStatus((int)$action);
        }
    }

    // Fallback 404
    errorResponse("Endpoint not found: {$method} /api/{$path}", 404);

} catch (Throwable $e) {
    if ($e instanceof PDOException) {
        $sqlState = (string)($e->errorInfo[0] ?? $e->getCode());
        if ($sqlState === '23000' || str_contains($e->getMessage(), 'UNIQUE constraint failed') || str_contains($e->getMessage(), 'Duplicate entry')) {
            errorResponse('A record with this value already exists or cannot be deleted because it is referenced by existing records.', 409);
        }
        error_log("API DB Error [{$sqlState}]: " . $e->getMessage());
        $msg = getenv('APP_ENV') === 'development' ? $e->getMessage() : 'A database error occurred. Please try again.';
        errorResponse($msg, 500);
    }

    error_log("API Throwable: " . get_class($e) . ': ' . $e->getMessage());
    $msg = getenv('APP_ENV') === 'development' ? $e->getMessage() : 'Internal server error.';
    errorResponse($msg, 500);
}
