# scripts/build_for_cpanel.ps1
# Automates frontend build and prepares deployment package for cPanel

Write-Host "==========================================" -ForegroundColor Magenta
Write-Host " Building RiTiVerse Salon for cPanel" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Magenta

# 1. Build React frontend
Set-Location "$PSScriptRoot\..\frontend"
Write-Host "Building React production assets with Vite..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check errors." -ForegroundColor Red
    exit 1
}

# 2. Create cpanel_deploy directory
$deployDir = "$PSScriptRoot\..\cpanel_deploy"
if (Test-Path $deployDir) {
    Remove-Item -Path $deployDir -Recurse -Force
}
New-Item -ItemType Directory -Path $deployDir | Out-Null

Write-Host "Copying distribution files into cpanel_deploy/..." -ForegroundColor Yellow

# Copy built frontend
Copy-Item -Path "$PSScriptRoot\..\frontend\dist\*" -Destination $deployDir -Recurse

# Copy api directory
Copy-Item -Path "$PSScriptRoot\..\api" -Destination $deployDir -Recurse

# Copy database schema and access rules
New-Item -ItemType Directory -Path "$deployDir\database" | Out-Null
Copy-Item -Path "$PSScriptRoot\..\database\schema.sql" -Destination "$deployDir\database\schema.sql"
Copy-Item -Path "$PSScriptRoot\..\database\.htaccess" -Destination "$deployDir\database\.htaccess"

# Copy root .htaccess and .env.example
Copy-Item -Path "$PSScriptRoot\..\.htaccess" -Destination "$deployDir\.htaccess"
Copy-Item -Path "$PSScriptRoot\..\.env.example" -Destination "$deployDir\.env.example"

Write-Host "cpanel_deploy directory is ready!" -ForegroundColor Green
Write-Host "Simply upload the contents of 'cpanel_deploy' directly to public_html/ on your cPanel server." -ForegroundColor Cyan
