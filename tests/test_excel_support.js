/**
 * Test Suite: Excel (.xls and .xlsx) Engine Integration
 * Verifies SheetJS reading, conversion, type inference, filtering and export
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const CsvEngine = require(path.join(ROOT, 'csv-engine.js'));
const XLSX = require(path.join(ROOT, 'assets/vendor/xlsx.full.min.js'));

console.log('=== TEST SUITE: EXCEL (.XLS & .XLSX) ENGINE INTEGRATION ===');

// 1. Verify Vendor Library
console.log('Test 1: Verifying standalone XLSX library asset...');
const xlsxPath = path.join(ROOT, 'assets/vendor/xlsx.full.min.js');
assert.ok(fs.existsSync(xlsxPath), 'xlsx.full.min.js must exist on disk');
assert.ok(typeof XLSX.read === 'function', 'XLSX.read must be a function');
assert.ok(typeof XLSX.write === 'function', 'XLSX.write must be a function');
console.log('✔ SheetJS standalone library verified');

// 2. Build multi-sheet test workbook in memory
console.log('Test 2: Creating mock multi-sheet Excel workbook (.xlsx)...');
const wb = XLSX.utils.book_new();

const sheet1Data = [
  ['ID', 'Produto', 'Preco', 'Data', 'Ativo'],
  [101, 'Teclado Mecânico RGB', 299.90, new Date('2026-03-01'), true],
  [102, 'Mouse Óptico Sem Fio', 120.00, new Date('2026-03-05'), false],
  [103, 'Monitor UltraWide 29', 1450.50, new Date('2026-03-10'), true]
];
const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
XLSX.utils.book_append_sheet(wb, ws1, 'Produtos');

const sheet2Data = [
  ['Vendedor', 'Regiao', 'Meta', 'Realizado'],
  ['Carlos Silva', 'Sudeste', 50000, 58200],
  ['Mariana Rocha', 'Sul', 60000, 64500]
];
const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
XLSX.utils.book_append_sheet(wb, ws2, 'Vendas');

// Write to .xlsx buffer
const xlsxBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
assert.ok(xlsxBuffer && xlsxBuffer.length > 0, 'XLSX buffer should not be empty');
console.log(`✔ Multi-sheet XLSX created (${xlsxBuffer.length} bytes)`);

// 3. Test Reading and Parsing XLSX
console.log('Test 3: Reading XLSX and converting sheet to CsvEngine format...');
const readWb = XLSX.read(xlsxBuffer, { type: 'buffer', cellDates: true });
assert.deepStrictEqual(readWb.SheetNames, ['Produtos', 'Vendas'], 'Should detect all sheets');

const sheet1Aoa = XLSX.utils.sheet_to_json(readWb.Sheets['Produtos'], { header: 1, defval: '' });
const parsedSheet1 = CsvEngine.fromAOA(sheet1Aoa);

assert.strictEqual(parsedSheet1.headers.length, 5, 'Sheet 1 must have 5 headers');
assert.strictEqual(parsedSheet1.data.length, 3, 'Sheet 1 must have 3 data rows');
assert.strictEqual(parsedSheet1.data[0].Produto, 'Teclado Mecânico RGB');
assert.strictEqual(parsedSheet1.data[0].Preco, '299.9');
assert.strictEqual(parsedSheet1.data[0].Ativo, 'true');
assert.strictEqual(parsedSheet1.data[0].Data, '2026-03-01');

// Type inference on parsed Excel sheet
const inferredTypes = CsvEngine.inferTypes(parsedSheet1.headers, parsedSheet1.data);
assert.strictEqual(inferredTypes.ID, 'number');
assert.strictEqual(inferredTypes.Produto, 'text');
assert.strictEqual(inferredTypes.Preco, 'number');
assert.strictEqual(inferredTypes.Data, 'date');
assert.strictEqual(inferredTypes.Ativo, 'boolean');
console.log('✔ XLSX read and CsvEngine.fromAOA conversion passed with proper types');

// 4. Test Filtering and Sorting on Excel data
console.log('Test 4: Filtering and sorting Excel dataset...');
const filtered = CsvEngine.filterData(parsedSheet1.data, parsedSheet1.headers, {
  globalSearch: 'Monitor'
});
assert.strictEqual(filtered.length, 1);
assert.strictEqual(filtered[0].Produto, 'Monitor UltraWide 29');

const sorted = CsvEngine.sortData(parsedSheet1.data, 'Preco', 'desc', 'number');
assert.strictEqual(sorted[0].Produto, 'Monitor UltraWide 29');
assert.strictEqual(sorted[2].Produto, 'Mouse Óptico Sem Fio');
console.log('✔ Filtering and sorting on Excel dataset passed');

// 5. Test Legacy Excel .xls (BIFF8) Format
console.log('Test 5: Testing legacy Excel 97-2004 (.xls BIFF8) format...');
const xlsBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'biff8' });
assert.ok(xlsBuffer && xlsBuffer.length > 0, 'XLS buffer should not be empty');

const readXlsWb = XLSX.read(xlsBuffer, { type: 'buffer', cellDates: true });
assert.deepStrictEqual(readXlsWb.SheetNames, ['Produtos', 'Vendas']);

const sheet2Aoa = XLSX.utils.sheet_to_json(readXlsWb.Sheets['Vendas'], { header: 1, defval: '' });
const parsedSheet2 = CsvEngine.fromAOA(sheet2Aoa);
assert.strictEqual(parsedSheet2.data.length, 2);
assert.strictEqual(parsedSheet2.data[0].Vendedor, 'Carlos Silva');
assert.strictEqual(parsedSheet2.data[0].Realizado, '58200');
console.log('✔ Legacy .xls (BIFF8) format read and parsed successfully');

// 6. Test CsvEngine.toExcel export
console.log('Test 6: Testing CsvEngine.toExcel export...');
const exportedExcelBuf = CsvEngine.toExcel(parsedSheet1.headers, parsedSheet1.data, {
  sheetName: 'Exportados',
  xlsx: XLSX
});
assert.ok(exportedExcelBuf && exportedExcelBuf.byteLength > 0, 'Exported Excel buffer should not be empty');

const reReadWb = XLSX.read(exportedExcelBuf, { type: 'array' });
assert.deepStrictEqual(reReadWb.SheetNames, ['Exportados']);
const reReadAoa = XLSX.utils.sheet_to_json(reReadWb.Sheets['Exportados'], { header: 1, defval: '' });
assert.strictEqual(reReadAoa.length, 4); // 1 header + 3 rows
assert.deepStrictEqual(reReadAoa[0], parsedSheet1.headers);
console.log('✔ CsvEngine.toExcel exported and verified');

// 7. Test Edge Cases (Blank rows, duplicate headers, empty cells)
console.log('Test 7: Testing Excel edge cases...');
const edgeAoa = [
  ['', 'Nome', 'Nome', ''],
  [],
  ['', '  ', '', ''], // empty row
  [1, 'Alice', 'Santos', 'Rua A'],
  [2, 'Bob', 'Lima', '']
];
const parsedEdge = CsvEngine.fromAOA(edgeAoa);
assert.strictEqual(parsedEdge.headers[0], 'Coluna_1', 'Blank header replaced with default');
assert.strictEqual(parsedEdge.headers[1], 'Nome', 'First header kept');
assert.strictEqual(parsedEdge.headers[2], 'Nome_2', 'Duplicate header incremented');
assert.strictEqual(parsedEdge.headers[3], 'Coluna_4', 'Fourth header created');
assert.strictEqual(parsedEdge.data.length, 2, 'Empty rows skipped');
assert.strictEqual(parsedEdge.data[1].Coluna_4, '', 'Missing cell defaulted to empty string');
console.log('✔ Edge cases (empty rows, duplicate headers, missing cells) handled cleanly');

console.log('=== ALL EXCEL TESTS PASSED! ===');
process.exit(0);
