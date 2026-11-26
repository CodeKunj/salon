# Deploying RiTiVerse Salon Website & Admin to cPanel Shared Hosting

This guide outlines the exact, step-by-step process for deploying the RiTiVerse Salon website and Admin Panel to any standard cPanel shared hosting environment running PHP 8.0+ and MySQL / MariaDB — **without requiring Node.js or React to run on cPanel**.

---

## Why No Node.js is Required on cPanel

cPanel shared hosting servers cannot and do not need to run Node.js or `npm run dev`. 

Instead:
1. The React frontend is pre-compiled into static production assets (`index.html`, bundled JavaScript and CSS).
2. The `index.html` file is placed **directly in the root directory** (`public_html/index.html`).
3. Apache handles static routing via `.htaccess`, while PHP 8+ processes all backend API calls (`/api/*`), sitemaps (`/sitemap.xml`), and robots rules (`/robots.txt`).

---

## Root Folder Structure as Required by cPanel

When you upload to `public_html/`, your directory structure will be:

```
public_html/
├── index.html            # [MANDATORY] React Production Homepage directly on root
├── assets/               # Production JS and CSS bundles, fonts & logos
│   ├── index-DLVaoNEc.js
│   ├── index-CBpVfpLa.css
│   └── logo-aura.svg
├── api/                  # PHP 8+ REST API
│   ├── .htaccess
│   ├── index.php         # Central API Dispatcher
│   ├── config/
│   │   ├── database.php  # Reads cPanel MySQL credentials
│   │   └── cors.php
│   ├── controllers/      # Public, Auth, Bookings, Services, Staff, Settings, CMS, Users
│   ├── helpers/          # Slot Calculator, JWT Auth, Validator, Response
│   └── seo/              # Sitemap.xml, robots.txt, Google Search Console verify
├── database/
│   ├── .htaccess         # Blocks direct HTTP access to SQL/SQLite files
│   └── schema.sql        # MySQL table schema & initial seed data
├── .htaccess             # Apache rules for SPA routing, security headers & API dispatching
├── .env                  # Your cPanel MySQL credentials & JWT secret (create on server)
└── .env.example
```

---

## Step 1: Create MySQL Database in cPanel

1. Log into your **cPanel Dashboard**.
2. Under the **Databases** section, click **MySQL® Databases** (or **MySQL Database Wizard**).
3. **Create New Database**: e.g., `yourusername_salondb`.
4. **Create New User**: e.g., `yourusername_salonusr` with a strong password.
5. **Add User to Database**: Assign the user to the database and select **ALL PRIVILEGES**.
6. Note down the full database name, username, and password.

---

## Step 2: Import Database Schema & Seed Data

1. In cPanel, navigate to **phpMyAdmin**.
2. Select your newly created database (`yourusername_salondb`) from the left sidebar.
3. Click on the **Import** tab in the top navigation.
4. Click **Choose File** and select `database/schema.sql`.
5. Ensure the character set is set to **utf-8** and click **Import** (or **Go**).
6. Verify that all 19 tables are created.

> **Default Super Admin Login:**
> - **URL:** `https://yourdomain.com/admin` (or `https://yourdomain.com/#admin`)
> - **Email:** `admin@salon.com`
> - **Password:** `Admin@123`
> *(Change password immediately upon first login under Users & Security module)*

---

## Step 3: Generating / Updating the Build (On your local machine)

Whenever you edit the React frontend, simply run from the project root:

```bash
npm run build
```

This automatically:
1. Builds the minified production bundle with relative asset paths (`base: './'`).
2. Syncs `index.html` and the `assets/` folder **directly to the root directory**, ready for cPanel.

Alternatively, you can run the 1-click packaging script:
- On Windows: `powershell -ExecutionPolicy Bypass -File scripts/build_for_cpanel.ps1`
- On Linux/macOS: `./scripts/build_for_cpanel.sh`

This generates a ready-to-upload `cpanel_deploy/` folder.

---

## Step 4: Deploy to cPanel (Git™ Version Control or Manual Upload)

### Option A: Automated Deployment via cPanel Git™ Version Control (Recommended)

This repository includes a production `.cpanel.yml` file at the root plus pre-built production assets (`index.html` and `assets/`), so cPanel does **not** need Node.js:

1. In cPanel, open **Git™ Version Control** and clone `https://github.com/CodeKunj/salon.git` into a directory **outside** `public_html` (for example `/home/yourusername/repositories/salon`).
2. Click **Manage** -> **Pull or Deploy** -> **Update from Remote**, then click **Deploy HEAD Commit**.
3. `.cpanel.yml` automatically copies `index.html`, `assets/`, `api/`, `database/schema.sql`, `database/.htaccess`, `.htaccess`, and `.env.example` into `$HOME/public_html/` while preserving your live `.env` file.
4. *(For an addon domain or subdomain, edit `DEPLOYPATH` in `.cpanel.yml` before deploying.)*

### Option B: Manual File Manager Upload

1. In cPanel, open **File Manager** and enter the `public_html` directory (or your addon domain directory).
2. Upload the built files:
   - `index.html`
   - `assets/` folder
   - `api/` folder
   - `database/` folder (`schema.sql` and `.htaccess` — never upload local `.sqlite` files)
   - `.htaccess`
   - `.env.example`
   *(Tip: You can zip these files locally, upload the `.zip` to `public_html`, and click **Extract** in cPanel File Manager)*
3. In cPanel File Manager, make sure **Show Hidden Files (dotfiles)** is enabled in Settings so you can see `.htaccess`.
4. Copy `.env.example` to `.env` in `public_html/` and set file permissions to `600` (or `640`).

---

## Step 5: Configure `.env` on cPanel

Edit `.env` in your `public_html/` root with your actual cPanel MySQL credentials and a newly generated secret (for example via `openssl rand -hex 32`):

```ini
APP_ENV=production
APP_URL=https://yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com

DB_DRIVER=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=yourusername_salondb
DB_USER=yourusername_salonusr
DB_PASS=CHANGE_ME_STRONG_DB_PASSWORD

JWT_SECRET=CHANGE_ME_GENERATE_64_CHAR_RANDOM_HEX_SECRET
```

---

## Step 6: Verify cPanel PHP Version

1. In cPanel, navigate to **Select PHP Version** or **MultiPHP Manager**.
2. Ensure your domain is set to **PHP 8.0, 8.1, 8.2, 8.3, or 8.4+**.
3. Under PHP Extensions, ensure `pdo`, `pdo_mysql`, and `mbstring` are enabled.

---

## Step 7: Live Verification

1. **Homepage:** Open `https://yourdomain.com/` — Loads the salon website immediately from `index.html` on the root.
2. **API Check:** Open `https://yourdomain.com/api/public/bootstrap` — Returns JSON with code 200.
3. **Dynamic XML Sitemap:** Open `https://yourdomain.com/sitemap.xml` — Returns live XML sitemap.
4. **Dynamic Robots:** Open `https://yourdomain.com/robots.txt` — Returns live robots directives.
5. **Admin Portal:** Open `https://yourdomain.com/admin` — Loads the login page for staff and administrators.
