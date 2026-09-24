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

// Verify that all icons declared in manifest exist on disk
for (const icon of manifest.icons) {
  const iconPath = path.join(ROOT, icon.src);
  assert.ok(fs.existsSync(iconPath), `Manifest icon "${icon.src}" must exist on disk`);
}
console.log('✔ manifest.webmanifest is valid with standalone display, file handlers and all icon assets verified');

// 2. Verify Service Worker
console.log('Test 2: Verifying sw.js...');
const swPath = path.join(ROOT, 'sw.js');
assert.ok(fs.existsSync(swPath), 'sw.js must exist');
const swCode = fs.readFileSync(swPath, 'utf8');
assert.ok(swCode.includes("addEventListener('install'"), 'SW must have install event');
assert.ok(swCode.includes("addEventListener('activate'"), 'SW must have activate event');
assert.ok(swCode.includes("addEventListener('fetch'"), 'SW must have fetch event');
assert.ok(swCode.includes('STATIC_ASSETS'), 'SW must define STATIC_ASSETS');

// Parse STATIC_ASSETS array and verify every asset exists on disk
const matchAssets = swCode.match(/const STATIC_ASSETS = \[([\s\S]*?)\];/);
assert.ok(matchAssets, 'STATIC_ASSETS array must be extractable');
const assetList = eval(`[${matchAssets[1]}]`);
assert.ok(assetList.length >= 8, 'STATIC_ASSETS must contain at least core application files');

for (const asset of assetList) {
  if (asset === './') continue; // directory index
  const cleanPath = asset.replace(/^\.\//, '');
  const assetFilePath = path.join(ROOT, cleanPath);
  assert.ok(fs.existsSync(assetFilePath), `SW STATIC_ASSET "${asset}" must exist on disk (${assetFilePath})`);
}
console.log(`✔ sw.js verified with full offline lifecycle and all ${assetList.length} static assets verified on disk`);

// 3. Verify Assets and Icons
console.log('Test 3: Verifying assets/icons and root favicon...');
const iconsDir = path.join(ROOT, 'assets', 'icons');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon.svg')), 'icon.svg must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-192.png')), 'icon-192.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-512.png')), 'icon-512.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-512-maskable.png')), 'icon-512-maskable.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'icon-64.png')), 'icon-64.png must exist');
assert.ok(fs.existsSync(path.join(iconsDir, 'lumio.ico')), 'lumio.ico must exist');
assert.ok(fs.existsSync(path.join(ROOT, 'favicon.ico')), 'favicon.ico must exist at root');
console.log('✔ All high-resolution icon assets and root favicon exist');

// 4. Verify Modern Scripts & Launchers
console.log('Test 4: Verifying scripts folder and launchers...');
const scriptsDir = path.join(ROOT, 'scripts');
assert.ok(fs.existsSync(path.join(scriptsDir, 'criar_atalho_desktop.ps1')), 'criar_atalho_desktop.ps1 must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'criar_atalho_desktop.bat')), 'criar_atalho_desktop.bat must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'criar_atalho_desktop.vbs')), 'criar_atalho_desktop.vbs must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'iniciar_servidor_local.bat')), 'iniciar_servidor_local.bat must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'serve.js')), 'serve.js must exist');
assert.ok(fs.existsSync(path.join(scriptsDir, 'build_icons.js')), 'build_icons.js must exist');
assert.ok(fs.existsSync(path.join(ROOT, 'Lumio CSV.vbs')), 'Lumio CSV.vbs must exist at root');
assert.ok(fs.existsSync(path.join(ROOT, 'abrir_visualizador.bat')), 'abrir_visualizador.bat must exist at root');
console.log('✔ Modern installers (PowerShell, VBScript, Batch), silent launcher and dev server exist');

// 5. Verify package.json
console.log('Test 5: Verifying package.json...');
const pkgPath = path.join(ROOT, 'package.json');
assert.ok(fs.existsSync(pkgPath), 'package.json must exist');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
assert.ok(pkg.scripts && pkg.scripts.start, 'package.json must have start script');
assert.ok(pkg.scripts && pkg.scripts.test, 'package.json must have test script');
assert.ok(pkg.scripts && pkg.scripts.shortcut, 'package.json must have shortcut script');
console.log('✔ package.json configuration verified');

console.log('=== PWA & ARCHITECTURE VERIFICATION PASSED! ===');
