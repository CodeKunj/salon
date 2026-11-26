#!/usr/bin/env bash
# scripts/build_for_cpanel.sh
# Automates frontend build and prepares deployment package for cPanel

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
ROOT_DIR="$(dirname "$DIR")"

echo "Building React production assets..."
cd "$ROOT_DIR/frontend"
npm run build

echo "Packaging into cpanel_deploy/..."
DEPLOY_DIR="$ROOT_DIR/cpanel_deploy"
rm -rf "$DEPLOY_DIR"
mkdir -p "$DEPLOY_DIR"

cp -r "$ROOT_DIR/frontend/dist/"* "$DEPLOY_DIR/"
cp -r "$ROOT_DIR/api" "$DEPLOY_DIR/"
mkdir -p "$DEPLOY_DIR/database"
cp "$ROOT_DIR/database/schema.sql" "$DEPLOY_DIR/database/"
cp "$ROOT_DIR/database/.htaccess" "$DEPLOY_DIR/database/"
cp "$ROOT_DIR/.htaccess" "$DEPLOY_DIR/"
cp "$ROOT_DIR/.env.example" "$DEPLOY_DIR/"

echo "SUCCESS: cpanel_deploy directory is ready to upload to public_html/!"
