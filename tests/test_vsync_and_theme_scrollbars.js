const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING TESTS FOR VSYNC & THEME-ADAPTIVE SCROLLBARS ===');

const projectRoot = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(projectRoot, 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');
const lumioVbs = fs.readFileSync(path.join(projectRoot, 'Lumio CSV.vbs'), 'utf8');
const shortcutVbs = fs.readFileSync(path.join(projectRoot, 'scripts/criar_atalho_desktop.vbs'), 'utf8');
const shortcutPs1 = fs.readFileSync(path.join(projectRoot, 'scripts/criar_atalho_desktop.ps1'), 'utf8');

// Test 1: Button 'Desfazer' instead of 'Resetar'
console.log('Test 1: Verifying button text changed from Resetar to Desfazer...');
assert.ok(indexHtml.includes('id="btnResetView"'), 'btnResetView must exist');
assert.ok(indexHtml.includes('<span>Desfazer</span>'), 'btnResetView must have text Desfazer');
assert.ok(!indexHtml.includes('<span>Resetar</span>'), 'btnResetView must NOT have text Resetar');
assert.ok(indexHtml.includes('title="Desfazer todos os filtros, ordenação e buscas"'), 'btnResetView must have updated tooltip');
console.log('✔ Button Desfazer verified');

// Test 2: Theme-adaptive scrollbar variables
console.log('Test 2: Verifying theme-adaptive scrollbar CSS variables across all 4 themes...');
const themes = ['amethyst', 'emerald', 'solar'];
assert.ok(styleCss.includes('--sb-color-thumb: #38bdf8;'), 'Default (Neon) scrollbar color must be defined in :root');
assert.ok(styleCss.includes('--sb-glow: rgba(0, 240, 255, 0.65);'), 'Default Neon scrollbar glow must be defined in :root');

themes.forEach(theme => {
  assert.ok(styleCss.includes(`body[data-theme="${theme}"]`), `Theme ${theme} must exist in CSS`);
  assert.ok(styleCss.includes(`body[data-theme="${theme}"] {\n  --accent-primary:`) || 
            styleCss.includes(`body[data-theme="${theme}"]`), `Theme ${theme} must define variables`);
});
assert.ok(styleCss.includes('--sb-color-thumb: #c084fc;'), 'Amethyst scrollbar color must be purple');
assert.ok(styleCss.includes('--sb-color-thumb: #34d399;'), 'Emerald scrollbar color must be emerald');
assert.ok(styleCss.includes('--sb-color-thumb: #fbbf24;'), 'Solar scrollbar color must be amber');
assert.ok(styleCss.includes('scrollbar-color: var(--sb-color-thumb) rgba(6, 10, 18, 0.85);'), 'Scrollbar must use dynamic theme variable');
assert.ok(styleCss.includes('.table-scroll-area.is-scrolling tbody tr'), 'is-scrolling must isolate pointer events for high-FPS scrolling');
console.log('✔ Theme-adaptive scrollbars and high-FPS scroll CSS verified');

// Test 3: V-Sync modal & UI elements
console.log('Test 3: Verifying V-Sync telemetry badge and configuration modal in index.html...');
assert.ok(indexHtml.includes('id="vsyncBadge"'), 'index.html must have vsyncBadge');
assert.ok(indexHtml.includes('id="modalVsync"'), 'index.html must have modalVsync');
assert.ok(indexHtml.includes('id="vsyncDetectedRate"'), 'modalVsync must display vsyncDetectedRate');
assert.ok(indexHtml.includes('id="vsyncCurrentFps"'), 'modalVsync must display vsyncCurrentFps');
assert.ok(indexHtml.includes('name="vsyncMode"'), 'modalVsync must contain vsyncMode radio options');
console.log('✔ V-Sync UI elements verified');

// Test 4: V-Sync engine & idle power-saving in app.js
console.log('Test 4: Verifying V-Sync calibration and power-saving logic in app.js...');
assert.ok(appJs.includes('calibrateRefreshRate('), 'app.js must implement refresh rate calibration');
assert.ok(appJs.includes('scheduleIdleHeartbeat('), 'app.js must implement idle heartbeat for zero CPU/GPU at rest');
assert.ok(appJs.includes('vsyncMode'), 'app.js must handle vsyncMode selection');
assert.ok(appJs.includes('modalVsync'), 'app.js must handle modalVsync opening');
console.log('✔ V-Sync engine and idle power-saving logic verified');

// Test 5: Launcher scripts GPU unlock arguments
console.log('Test 5: Verifying V-Sync unlock flags in Windows launch scripts...');
assert.ok(lumioVbs.includes('--enable-gpu-rasterization'), 'Lumio CSV.vbs must include GPU rasterization');
assert.ok(lumioVbs.includes('--enable-zero-copy'), 'Lumio CSV.vbs must include zero-copy');
assert.ok(lumioVbs.includes('--disable-features=UseEcoQoSForBackgroundProcess'), 'Lumio CSV.vbs must disable EcoQoS throttle');
assert.ok(!lumioVbs.includes('--disable-frame-rate-limit'), 'Lumio CSV.vbs must NOT disable frame rate limit (must respect V-Sync)');

assert.ok(shortcutVbs.includes('--enable-gpu-rasterization'), 'criar_atalho_desktop.vbs must include GPU rasterization');
assert.ok(!shortcutVbs.includes('--disable-frame-rate-limit'), 'criar_atalho_desktop.vbs must respect V-Sync');

assert.ok(shortcutPs1.includes('--enable-gpu-rasterization'), 'criar_atalho_desktop.ps1 must include GPU rasterization');
assert.ok(!shortcutPs1.includes('--disable-frame-rate-limit'), 'criar_atalho_desktop.ps1 must respect V-Sync');
console.log('✔ Launcher scripts GPU & V-Sync arguments verified');

console.log('=== ALL VSYNC & THEME SCROLLBAR TESTS PASSED! ===');
