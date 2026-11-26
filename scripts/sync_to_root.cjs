// scripts/sync_to_root.cjs
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'frontend', 'dist');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

if (fs.existsSync(distDir)) {
  console.log('Syncing built frontend files directly to root directory for cPanel...');
  const files = fs.readdirSync(distDir);
  for (const file of files) {
    copyRecursiveSync(path.join(distDir, file), path.join(rootDir, file));
  }
  console.log('Sync complete! Root index.html and assets/ are now up to date.');
} else {
  console.error('Error: frontend/dist does not exist. Run npm run build inside frontend first.');
}
