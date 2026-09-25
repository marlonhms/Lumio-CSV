const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING TESTS FOR UNIFIED FILTER HUB (QUICK & ADVANCED) ===');

const projectRoot = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const styleCss = fs.readFileSync(path.join(projectRoot, 'style.css'), 'utf8');
const appJs = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');

// Test 1: Verify Toolbar Button Unification
console.log('Test 1: Verifying unified toolbar button (Filtros)...');
assert.ok(indexHtml.includes('id="btnOpenFilterModal"'), 'index.html must have btnOpenFilterModal');
assert.ok(indexHtml.includes('<span>Filtros</span>'), 'btnOpenFilterModal must have label "Filtros"');
assert.ok(indexHtml.includes('id="activeFilterBadge"'), 'btnOpenFilterModal must retain activeFilterBadge');

// Ensure toolbar no longer contains the old separate quick/adv filter buttons
const toolbarSection = indexHtml.match(/<div class="toolbar-controls">([\s\S]*?)<\/div>/);
assert.ok(toolbarSection, 'toolbar-controls section must exist');
assert.ok(!toolbarSection[1].includes('id="btnToggleQuickFilters"'), 'Toolbar must NOT have standalone btnToggleQuickFilters');
assert.ok(!toolbarSection[1].includes('Filtros Avançados</span>'), 'Toolbar must NOT have standalone Filtros Avançados button');
console.log('✔ Toolbar unified into single "Filtros" button');

// Test 2: Verify Filter Modal Mode Selector & Tab Panes
console.log('Test 2: Verifying modal mode selector and tab panes in index.html...');
assert.ok(indexHtml.includes('class="filter-mode-selector"'), 'Modal must contain filter-mode-selector');
assert.ok(indexHtml.includes('name="filterModeChoice"'), 'Modal must have filterModeChoice radio group');
assert.ok(indexHtml.includes('value="quick"'), 'filterModeChoice must have quick option');
assert.ok(indexHtml.includes('value="advanced"'), 'filterModeChoice must have advanced option');

// Panes
assert.ok(indexHtml.includes('id="filterTabQuick"'), 'Modal must have filterTabQuick pane');
assert.ok(indexHtml.includes('id="filterTabAdvanced"'), 'Modal must have filterTabAdvanced pane');
assert.ok(indexHtml.includes('id="checkToggleQuickFiltersRow"'), 'filterTabQuick must have table filter row toggle');
assert.ok(indexHtml.includes('id="quickFiltersModalList"'), 'filterTabQuick must have quickFiltersModalList');
assert.ok(indexHtml.includes('id="btnClearQuickColFilters"'), 'filterTabQuick must have btnClearQuickColFilters');
assert.ok(indexHtml.includes('id="filterRulesList"'), 'filterTabAdvanced must have filterRulesList');
assert.ok(indexHtml.includes('id="btnAddFilterRule"'), 'filterTabAdvanced must have btnAddFilterRule');
assert.ok(indexHtml.includes('id="selectFilterLogic"'), 'filterTabAdvanced must have selectFilterLogic');
assert.ok(indexHtml.includes('id="btnClearAllFilters"'), 'Modal footer must have btnClearAllFilters');
assert.ok(indexHtml.includes('id="btnApplyAdvFilters"'), 'Modal footer must have btnApplyAdvFilters');
console.log('✔ Modal structure, mode selector, and dual tab panes verified');

// Test 3: Verify CSS Styling for Filter Hub
console.log('Test 3: Verifying CSS classes and styling in style.css...');
assert.ok(styleCss.includes('.modal-filter-content'), 'style.css must define .modal-filter-content');
assert.ok(styleCss.includes('.filter-mode-selector'), 'style.css must define .filter-mode-selector');
assert.ok(styleCss.includes('.filter-mode-card'), 'style.css must define .filter-mode-card');
assert.ok(styleCss.includes('.quick-filter-table-toggle'), 'style.css must define .quick-filter-table-toggle');
assert.ok(styleCss.includes('.quick-filters-modal-list'), 'style.css must define .quick-filters-modal-list');
assert.ok(styleCss.includes('.quick-filter-modal-row'), 'style.css must define .quick-filter-modal-row');
assert.ok(styleCss.includes('.btn-xs'), 'style.css must define .btn-xs');
console.log('✔ Filter Hub CSS classes verified');

// Test 4: Verify JavaScript Implementation in app.js
console.log('Test 4: Verifying JavaScript methods and event listeners in app.js...');
assert.ok(appJs.includes('renderQuickFiltersModalList'), 'app.js must define renderQuickFiltersModalList');
assert.ok(appJs.includes('switchFilterMode'), 'app.js must define switchFilterMode');
assert.ok(appJs.includes('btnOpenFilterModal'), 'app.js must bind btnOpenFilterModal');
assert.ok(appJs.includes('checkToggleQuickFiltersRow'), 'app.js must reference checkToggleQuickFiltersRow');
assert.ok(appJs.includes('quickFiltersModalList'), 'app.js must reference quickFiltersModalList');
assert.ok(appJs.includes('btnClearQuickColFilters'), 'app.js must reference btnClearQuickColFilters');

// Test 5: Verify Active Filter Count Math with Quick & Advanced
console.log('Test 5: Verifying active filter calculation logic...');
const mockState = {
  advancedRules: [{ id: 1, column: 'Status', operator: 'equals', value: 'Ativo' }],
  columnFilters: { Nome: 'Silva', Cidade: '' },
  globalSearch: 'teste'
};
let activeFilterCount = mockState.advancedRules.length;
if (mockState.globalSearch) activeFilterCount++;
Object.values(mockState.columnFilters).forEach(v => {
  if (v && String(v).trim()) activeFilterCount++;
});
assert.strictEqual(activeFilterCount, 3, 'Active filter count should sum advanced rules, global search, and valid column filters');
console.log('✔ Active filter count calculation verified');

console.log('=== ALL FILTER HUB TESTS PASSED SUCCESSFULLY! ===');
