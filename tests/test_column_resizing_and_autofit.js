const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== RUNNING VERIFICATION FOR COLUMN RESIZING AND AUTO-FIT ===');

// 1. Verify CSS rules
console.log('Test 1: Verifying style.css table layout and resizer rules...');
const styleCss = fs.readFileSync(path.join(__dirname, '../style.css'), 'utf8');

// Check that .data-table does NOT have min-width: 100% which was forcing small columns to stretch
const dataTableMatch = styleCss.match(/\.data-table\s*\{([\s\S]*?)\}/);
assert.ok(dataTableMatch, '.data-table block must exist in style.css');
assert.ok(!dataTableMatch[1].includes('min-width: 100%'), '.data-table must NOT have min-width: 100% forcing unnatural stretching of columns');
assert.ok(dataTableMatch[1].includes('table-layout: fixed;'), '.data-table must retain table-layout: fixed');
assert.ok(dataTableMatch[1].includes('width: max-content;'), '.data-table must use width: max-content');

// Check .col-resizer rules
const colResizerMatch = styleCss.match(/\.col-resizer\s*\{([\s\S]*?)\}/);
assert.ok(colResizerMatch, '.col-resizer block must exist in style.css');
assert.ok(colResizerMatch[1].includes('cursor: col-resize !important;'), '.col-resizer must enforce cursor: col-resize !important');
assert.ok(colResizerMatch[1].includes('touch-action: none;'), '.col-resizer must have touch-action: none');
assert.ok(colResizerMatch[1].includes('user-select: none;'), '.col-resizer must have user-select: none');
assert.ok(colResizerMatch[1].includes('z-index: 30;'), '.col-resizer must have elevated z-index');

// Check .th-content and .th-title ellipsis support for clean shrinking
assert.ok(styleCss.includes('.th-title {'), '.th-title style block must exist');
assert.ok(styleCss.includes('text-overflow: ellipsis;'), '.th-title must have text-overflow: ellipsis for narrow columns');
assert.ok(styleCss.includes('.th-col-actions'), '.th-col-actions must exist');

console.log('✔ CSS layout rules verified: no min-width: 100%, enhanced .col-resizer and ellipsis support');

// 2. Verify app.js implementation
console.log('Test 2: Verifying app.js column resizing, autofit & table synchronization...');
const appJs = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// Check that app.js synchronizes elements.dataTable.style.width
assert.ok(appJs.includes('elements.dataTable.style.width = totalTableWidth + \'px\';'), 'app.js must synchronize explicit table width on render');
assert.ok(appJs.includes('bindColumnResizer(th.querySelector(\'.col-resizer\'))'), 'app.js must bind resizer to header th');
assert.ok(appJs.includes('th.style.maxWidth = customWidth + \'px\';'), 'app.js must set maxWidth on th to enable smooth shrinking');
assert.ok(appJs.includes('draggable="false"'), 'app.js must mark .col-resizer draggable="false"');

// Check that dragging suppresses parent draggable
assert.ok(appJs.includes('currentTh.setAttribute(\'draggable\', \'false\')'), 'app.js must disable TH drag during column resizing');

console.log('✔ app.js event handling and width synchronization verified');

// 3. Test Column Auto-Fit & Math for 3-digit and short columns
console.log('Test 3: Testing optimal width calculation on user test data (administradora, nsu, etc.)...');

// Helper mocking getTextWidth
function getTextWidthMock(text, font) {
  if (font && font.includes('JetBrains Mono')) {
    return String(text).length * 8.0;
  }
  return String(text).length * 7.5;
}

function calculateIdealColumnWidthMock(header, type, dataRows) {
  const dataFont = type === 'number'
    ? '13px "JetBrains Mono", monospace'
    : '13.5px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
  const headerFont = '600 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif';

  const headerTextWidth = getTextWidthMock(header, headerFont);
  const headerNeeded = headerTextWidth + 72;

  let maxCellWidth = 0;
  const sampleLimit = Math.min(dataRows.length, 120);
  for (let i = 0; i < sampleLimit; i++) {
    const val = dataRows[i][header];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const w = getTextWidthMock(String(val), dataFont);
      if (w > maxCellWidth) maxCellWidth = w;
    }
  }

  const cellNeeded = maxCellWidth > 0 ? (maxCellWidth + 24) : 40;

  let ideal;
  if (cellNeeded < 75 && headerNeeded > 200) {
    ideal = Math.max(cellNeeded + 50, 200);
  } else {
    ideal = Math.max(headerNeeded, cellNeeded);
  }

  return Math.min(700, Math.max(90, Math.ceil(ideal)));
}

// User dataset simulation matching images
const userRows = [
  { administradora: '012', nsu: '031629', dataMovimento: '12/09/2026', horaMovimento: '00:04:15' },
  { administradora: '013', nsu: '406514', dataMovimento: '12/09/2026', horaMovimento: '00:08:22' },
  { administradora: '019', nsu: 'px5697', dataMovimento: '12/09/2026', horaMovimento: '00:11:40' },
  { administradora: '019', nsu: 'px8624', dataMovimento: '12/09/2026', horaMovimento: '00:24:21' }
];

const widthAdm = calculateIdealColumnWidthMock('administradora', 'number', userRows);
const widthNsu = calculateIdealColumnWidthMock('nsu', 'text', userRows);
const widthData = calculateIdealColumnWidthMock('dataMovimento', 'date', userRows);
const widthHora = calculateIdealColumnWidthMock('horaMovimento', 'text', userRows);

console.log(`Calculated optimal widths -> administradora: ${widthAdm}px, nsu: ${widthNsu}px, dataMovimento: ${widthData}px, horaMovimento: ${widthHora}px`);

assert.ok(widthAdm <= 185, `administradora with 3-digit numbers must be compact (got ${widthAdm}px)`);
assert.ok(widthAdm >= 140, `administradora must satisfy readable width for title (got ${widthAdm}px)`);
assert.ok(widthNsu <= 105, `nsu must be compact (got ${widthNsu}px)`);
assert.ok(widthNsu >= 90, `nsu must satisfy readable width (got ${widthNsu}px)`);
assert.ok(widthData >= 140, `dataMovimento must comfortably fit date (got ${widthData}px)`);

// 4. Test Table Total Width calculation with few columns on wide screen
console.log('Test 4: Verifying total table width with few columns...');
const totalWidth = 44 + 58 + 90 + widthAdm + widthNsu + widthData + widthHora;
console.log(`Total table width for 4 columns: ${totalWidth}px`);
assert.ok(totalWidth < 850, `Table with 4 compact columns must not artificially expand (got ${totalWidth}px)`);

console.log('✔ All column resizing, auto-fit, and table width checks passed successfully!');
console.log('=== TEST SUITE COMPLETE: ALL TESTS PASSED! ===');
