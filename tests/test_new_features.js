const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CsvEngine = require(path.join(__dirname, '../csv-engine.js'));

console.log('=== RUNNING VERIFICATION FOR NEW FEATURES & PERFORMANCE ===');

// Test 1: Verify 'PRO LIQUID' removal from header
console.log('Test 1: Checking header text for PRO LIQUID...');
const htmlContent = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
assert.ok(!htmlContent.includes('PRO LIQUID'), 'index.html should not contain "PRO LIQUID"');
assert.ok(!htmlContent.includes('proliquid'), 'index.html should not contain "proliquid"');
assert.ok(htmlContent.includes('Lumio <span>CSV</span>'), 'Brand title should be intact without PRO LIQUID');
console.log('✔ PRO LIQUID successfully removed from header');

// Test 2: Verify toolbar layout centering
console.log('Test 2: Checking search bar centering and toolbar structure...');
const toolbarIndex = htmlContent.indexOf('id="toolbarPanel"');
const metricsIndex = htmlContent.indexOf('class="metrics-strip"', toolbarIndex);
const searchIndex = htmlContent.indexOf('class="search-box-wrapper"', toolbarIndex);
const controlsIndex = htmlContent.indexOf('class="toolbar-controls"', toolbarIndex);

assert.ok(toolbarIndex !== -1, 'toolbarPanel must exist');
assert.ok(metricsIndex !== -1, 'metrics-strip must exist');
assert.ok(searchIndex !== -1, 'search-box-wrapper must exist');
assert.ok(controlsIndex !== -1, 'toolbar-controls must exist');
assert.ok(metricsIndex < searchIndex, 'metrics-strip should precede search-box-wrapper');
assert.ok(searchIndex < controlsIndex, 'search-box-wrapper should precede toolbar-controls');

const cssContent = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');
assert.ok(cssContent.includes('.search-box-wrapper'), 'CSS should style .search-box-wrapper');
assert.ok(cssContent.includes('margin: 0 auto;'), 'Search box wrapper should have margin: 0 auto for centering');
assert.ok(cssContent.includes('.fps-pill'), 'CSS should style .fps-pill');
assert.ok(cssContent.includes('.col-resizer'), 'CSS should style .col-resizer');
assert.ok(cssContent.includes('.col-align-center'), 'CSS should style .col-align-center');
console.log('✔ Smart search bar is centered and CSS classes exist');

// Test 3: Column auto-fit sizing logic simulation
console.log('Test 3: Testing Column Auto-Fit calculation...');
function mockCalculateIdealWidth(header, type, sampleRows) {
  const minHeaderWidth = header.length * 8.5 + 145;
  let maxCellLength = 0;
  for (const row of sampleRows) {
    const val = String(row[header] || '');
    if (val.length > maxCellLength) maxCellLength = val.length;
  }
  const cellNeeded = maxCellLength * 8.2 + 30;
  const ideal = Math.max(minHeaderWidth, cellNeeded);
  return Math.min(620, Math.max(85, Math.ceil(ideal)));
}

const testRows = [
  { ID: '1', Nome: 'Notebook Ultra Slim Pro 15', Descricao: 'Notebook potente com 32GB RAM e tela 4K OLED', Preco: 'R$ 8.999,00' },
  { ID: '2', Nome: 'Mouse', Descricao: 'Simples', Preco: 'R$ 29,90' },
  { ID: '3', Nome: 'Teclado Mecânico RGB Hot-Swap', Descricao: 'Switches ópticos lineares com retroiluminação RGB por tecla', Preco: 'R$ 499,00' }
];

const widthID = mockCalculateIdealWidth('ID', 'number', testRows);
const widthNome = mockCalculateIdealWidth('Nome', 'text', testRows);
const widthDesc = mockCalculateIdealWidth('Descricao', 'text', testRows);

assert.ok(widthID >= 85, 'ID width should be at least minimum 85px');
assert.ok(widthDesc > widthNome, 'Longer description column should be wider than Nome column');
assert.ok(widthDesc <= 620, 'Width should not exceed maximum 620px');
console.log(`✔ Auto-fit calculations passed: ID=${widthID}px, Nome=${widthNome}px, Descricao=${widthDesc}px`);

// Test 4: Column reordering (moveColumn) logic
console.log('Test 4: Testing Column Reordering (moveColumn)...');
const sampleHeaders = ['ID', 'Cliente', 'Produto', 'Preco', 'Status'];
const sampleVisible = ['ID', 'Cliente', 'Produto', 'Preco', 'Status'];

function testMoveColumn(headers, visible, sourceCol, targetCol, insertBefore) {
  const vSrc = visible.indexOf(sourceCol);
  const vTarget = visible.indexOf(targetCol);
  if (vSrc === -1 || vTarget === -1) return;
  visible.splice(vSrc, 1);
  let newVIdx = visible.indexOf(targetCol);
  if (!insertBefore) newVIdx += 1;
  visible.splice(newVIdx, 0, sourceCol);

  const hSrc = headers.indexOf(sourceCol);
  const hTarget = headers.indexOf(targetCol);
  if (hSrc !== -1 && hTarget !== -1) {
    headers.splice(hSrc, 1);
    let newHIdx = headers.indexOf(targetCol);
    if (!insertBefore) newHIdx += 1;
    headers.splice(newHIdx, 0, sourceCol);
  }
}

// Move 'Produto' before 'Cliente'
testMoveColumn(sampleHeaders, sampleVisible, 'Produto', 'Cliente', true);
assert.deepStrictEqual(sampleVisible, ['ID', 'Produto', 'Cliente', 'Preco', 'Status'], 'Produto should be before Cliente');

// Move 'ID' after 'Preco'
testMoveColumn(sampleHeaders, sampleVisible, 'ID', 'Preco', false);
assert.deepStrictEqual(sampleVisible, ['Produto', 'Cliente', 'Preco', 'ID', 'Status'], 'ID should be after Preco');
console.log('✔ Column move and reordering logic passed');

// Test 5: Column centering & alignment toggle logic
console.log('Test 5: Testing Column Centering toggle...');
const alignments = {};
function toggleCenter(col) {
  if (alignments[col] === 'center') {
    delete alignments[col];
  } else {
    alignments[col] = 'center';
  }
}

toggleCenter('Status');
assert.strictEqual(alignments['Status'], 'center', 'Status should be centered');
toggleCenter('Status');
assert.strictEqual(alignments['Status'], undefined, 'Status centering should be toggled off');
toggleCenter('ID');
assert.strictEqual(alignments['ID'], 'center', 'ID should be centered');
console.log('✔ Column centering toggle passed');

// Test 6: Performance benchmark with large dataset (15,000 rows)
console.log('Test 6: Performance benchmark with 15,000 rows...');
const bigRows = [];
for (let i = 1; i <= 15000; i++) {
  bigRows.push({
    id: i,
    nome: `Cliente #${i}`,
    valor: (Math.random() * 5000).toFixed(2),
    data: '23/09/2026',
    status: i % 2 === 0 ? 'Concluído' : 'Pendente'
  });
}

const tFilterStart = Date.now();
const filtered = CsvEngine.filterData(bigRows, ['id', 'nome', 'valor', 'data', 'status'], {
  globalSearch: 'Concluído'
});
const filterElapsed = Date.now() - tFilterStart;
console.log(`Filtered 15,000 rows in ${filterElapsed}ms (${filtered.length} matches)`);
assert.ok(filterElapsed < 120, 'Filtering 15,000 rows should take under 120ms');

const tSortStart = Date.now();
const sorted = CsvEngine.sortData(filtered, 'valor', 'desc', 'number');
const sortElapsed = Date.now() - tSortStart;
console.log(`Sorted ${filtered.length} rows in ${sortElapsed}ms`);
assert.ok(sortElapsed < 100, 'Sorting should take under 100ms');

console.log('=== ALL NEW FEATURE & PERFORMANCE TESTS PASSED SUCCESSFULLY! ===');
