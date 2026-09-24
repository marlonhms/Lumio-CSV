const assert = require('assert');
const path = require('path');
const CsvEngine = require(path.join(__dirname, '../csv-engine.js'));

console.log('--- TESTING EDGE CASES & PERFORMANCE ---');

// Edge Case 1: BOM character handling
const bomCsv = '\uFEFFcol1,col2\nval1,val2';
const parsedBom = CsvEngine.parse(bomCsv);
assert.strictEqual(parsedBom.headers[0], 'col1');
assert.strictEqual(parsedBom.data[0].col1, 'val1');

// Edge Case 2: Empty CSV or single line
const emptyRes = CsvEngine.parse('');
assert.strictEqual(emptyRes.data.length, 0);

const singleHeader = CsvEngine.parse('colA');
assert.strictEqual(singleHeader.headers.length, 1);
assert.strictEqual(singleHeader.data.length, 0);

// Edge Case 3: Incomplete row (fewer columns than header)
const raggedCsv = 'a,b,c\n1,2\n3,4,5,6';
const parsedRagged = CsvEngine.parse(raggedCsv);
assert.strictEqual(parsedRagged.data[0].c, '');
assert.strictEqual(parsedRagged.data[1].a, '3');

// Edge Case 4: Brazilian semicolon with comma decimal and quotes
const brCsv = 'ID;Produto;Preço;Status\n1;"Cabo HDMI 2.1";"129,90";Entregue\n2;"Monitor Gamer 144Hz";"1.450,00";Pendente';
const snifferDelim = CsvEngine.sniffDelimiter(brCsv);
assert.strictEqual(snifferDelim, ';');
const parsedBr = CsvEngine.parse(brCsv);
assert.strictEqual(parsedBr.data.length, 2);
assert.strictEqual(CsvEngine.parseNumber(parsedBr.data[0]['Preço']), 129.90);
assert.strictEqual(CsvEngine.parseNumber(parsedBr.data[1]['Preço']), 1450.00);

// Edge Case 5: Unquoted quotes (dimensions/inches) shouldn't break subsequent lines
const inchesCsv = 'ID,Produto,Qtd\n1,Monitor 24",5\n2,Monitor 27",3\n3,TV 55",1';
const parsedInches = CsvEngine.parse(inchesCsv);
assert.strictEqual(parsedInches.data.length, 3, 'Should parse all 3 rows despite unquoted double quotes');
assert.strictEqual(parsedInches.data[0].Produto, 'Monitor 24"');
assert.strictEqual(parsedInches.data[1].Produto, 'Monitor 27"');
assert.strictEqual(parsedInches.data[2].Produto, 'TV 55"');

// Edge Case 6: Number parsing with thousands and negative accounting format
assert.strictEqual(CsvEngine.parseNumber('1.000'), 1000, 'BR 1.000 should be 1000');
assert.strictEqual(CsvEngine.parseNumber('1.000.000'), 1000000, 'BR 1.000.000 should be 1000000');
assert.strictEqual(CsvEngine.parseNumber('1,000,000'), 1000000, 'US 1,000,000 should be 1000000');
assert.strictEqual(CsvEngine.parseNumber('R$ 10.000'), 10000, 'R$ 10.000 should be 10000');
assert.strictEqual(CsvEngine.parseNumber('(50,00)'), -50.00, '(50,00) should be -50');

// Edge Case 7: Brazilian DD/MM/YYYY date parsing and sorting
const dateRows = [
  { d: '15/01/2026' },
  { d: '02/01/2026' },
  { d: '01/02/2026' },
  { d: '31/12/2025' }
];
const sortedDatesAsc = CsvEngine.sortData(dateRows, 'd', 'asc', 'date');
assert.strictEqual(sortedDatesAsc[0].d, '31/12/2025');
assert.strictEqual(sortedDatesAsc[1].d, '02/01/2026');
assert.strictEqual(sortedDatesAsc[2].d, '15/01/2026');
assert.strictEqual(sortedDatesAsc[3].d, '01/02/2026');

// Edge Case 8: Extended profiling (Median and Standard Deviation)
const statsSample = [
  { val: '10' },
  { val: '20' },
  { val: '30' },
  { val: '40' },
  { val: '50' }
];
const profileRes = CsvEngine.profileColumn('val', statsSample, 'number');
assert.strictEqual(profileRes.numeric.median, 30);
assert.strictEqual(profileRes.numeric.avg, 30);
assert.ok(profileRes.numeric.stdDev > 14 && profileRes.numeric.stdDev < 15);

// Edge Case 9: Performance with 10,000 rows
console.log('Generating 10,000 rows for benchmark...');
const lines = ['id,nome,valor,categoria,ativo'];
for (let i = 1; i <= 10000; i++) {
  lines.push(`${i},"Produto ${i}",${(Math.random() * 1000).toFixed(2)},${i % 2 === 0 ? 'Eletrônicos' : 'Acessórios'},${i % 3 === 0}`);
}
const bigCsv = lines.join('\n');

const t0 = Date.now();
const parsedBig = CsvEngine.parse(bigCsv);
const parseTime = Date.now() - t0;
console.log(`Parsed 10,000 rows in ${parseTime}ms`);
assert.strictEqual(parsedBig.data.length, 10000);
assert.ok(parseTime < 500, 'Parsing 10,000 rows should take under 500ms');

// Test filtering on 10,000 rows
const tFilter = Date.now();
const filteredBig = CsvEngine.filterData(parsedBig.data, parsedBig.headers, {
  globalSearch: 'Eletrônicos',
  advancedRules: [{ column: 'valor', operator: 'greater_than', value: '500' }]
});
const filterTime = Date.now() - tFilter;
console.log(`Filtered 10,000 rows in ${filterTime}ms (found ${filteredBig.length} matches)`);
assert.ok(filterTime < 100, 'Filtering 10,000 rows should take under 100ms');

// Test sorting on 10,000 rows
const tSort = Date.now();
const sortedBig = CsvEngine.sortData(parsedBig.data, 'valor', 'desc', 'number');
const sortTime = Date.now() - tSort;
console.log(`Sorted 10,000 rows in ${sortTime}ms`);
assert.ok(sortTime < 150, 'Sorting 10,000 rows should take under 150ms');

console.log('✔ All edge cases and benchmarks passed!');
