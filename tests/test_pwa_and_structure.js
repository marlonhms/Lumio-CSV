const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING PWA & MODERN ARCHITECTURE VERIFICATION ===');

const ROOT = path.join(__dirname, '..');

// 1. Verify Manifest
console.log('Test 1: Verifying manifest.webmanifest...');
const manifestPath = path.join(ROOT, 'manifest.webmanifest');
assert.ok(fs.existsSync(manifestPath), 'manifest.webmanifest must exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.strictEqual(manifest.short_name, 'Lumio CSV');
assert.strictEqual(manifest.display, 'standalone');
assert.ok(manifest.icons && manifest.icons.length >= 3, 'Must have at least 3 icons');
assert.ok(manifest.file_handlers && manifest.file_handlers.length > 0, 'Must have file_handlers for CSV/TSV/TXT');
console.log('✔ manifest.webmanifest is valid with standalone display and file handlers');

// 2. Verify Service Worker
console.log('Test 2: Verifying sw.js...');
const swPath = path.join(ROOT, 'sw.js');
assert.ok(fs.existsSync(swPath), 'sw.js must exist');
const swCode = fs.readFileSync(swPath, 'utf8');
assert.ok(swCode.includes("addEventListener('install'"), 'SW must have install event');
assert.ok(swCode.includes("addEventListener('activate'"), 'SW must have activate event');
assert.ok(swCode.includes("addEventListener('fetch'"), 'SW must have fetch event');
assert.ok(swCode.includes('STATIC_ASSETS'), 'SW must define STATIC_ASSETS');
console.log('✔ sw.js is implemented with full offline lifecycle');

// 3. Verify Assets and Icons
console.log('Test 3: Verifying assets/icons...');
const iconsDir = path.join(ROOT, 'assets', 'icons');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon.svg')), 'icon.svg must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-192.png')), 'icon-192.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-512.png')), 'icon-512.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'lumio.ico')), 'lumio.ico must exist');
console.log('✔ All high-resolution icon assets exist');

// 4. Verify Modern Scripts
console.log('Test 4: Verifying scripts folder and launchers...');
const scriptsDir = path.join(ROOT, 'scripts');
assert.ok(fs.existsSync(path.join(scriptsDir, 'criar_atalho_desktop.ps1')), 'criar_atalho_desktop.ps1 must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'criar_atalho_desktop.bat')), 'criar_atalho_desktop.bat must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'serve.js')), 'serve.js must exist');
assert.ok(fs.existsSync(path.join(ROOT, 'Lumio CSV.vbs')), 'Lumio CSV.vbs must exist');
assert.ok(fs.existsSync(path.join(ROOT, 'abrir_visualizador.bat')), 'abrir_visualizador.bat must exist');
console.log('✔ Modern installers, silent launcher and dev server exist');

// 5. Verify package.json
console.log('Test 5: Verifying package.json...');
const pkgPath = path.join(ROOT, 'package.json');
assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert.ok(pkg.scripts && pkg.scripts.start, 'package.json must have start script');
assert.ok(pkg.scripts && pkg.scripts.test, 'package.json must have test script');
console.log('✔ package.json configuration verified');

console.log('=== PWA & ARCHITECTURE VERIFICATION PASSED! ===');
