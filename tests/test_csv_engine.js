/**
 * Automated test suite for csv-engine.js
 */
const assert = require('assert');
const path = require('path');
const CsvEngine = require(path.join(__dirname, '../csv-engine.js'));

console.log('--- RUNNING CSV ENGINE TESTS ---');

// Test 1: Delimiter Sniffing
const commaCsv = 'nome,idade,cidade\nAna,28,São Paulo\nBruno,34,Rio de Janeiro\nCarla,22,Belo Horizonte';
assert.strictEqual(CsvEngine.sniffDelimiter(commaCsv), ',', 'Should sniff comma delimiter');

const semiCsv = 'produto;preco;estoque\nMouse;59,90;120\nTeclado;199,00;45\nMonitor;899,99;12';
assert.strictEqual(CsvEngine.sniffDelimiter(semiCsv), ';', 'Should sniff semicolon delimiter');

const tabCsv = 'id\tcode\tstatus\n1\tA101\tOK\n2\tB202\tPENDING';
assert.strictEqual(CsvEngine.sniffDelimiter(tabCsv), '\t', 'Should sniff tab delimiter');

const pipeCsv = 'id|nome|cargo\n1|Carlos|Dev\n2|Mariana|Designer';
assert.strictEqual(CsvEngine.sniffDelimiter(pipeCsv), '|', 'Should sniff pipe delimiter');
console.log('✔ Delimiter sniffing passed');

// Test 2: RFC 4180 Escaped Quotes and Newlines
const rfcCsv = 'id,descricao,valor\n1,"Item com, virgula e ""aspas""",100.50\n2,"Linha 1\nLinha 2",250.00\n3,Normal,50';
const parsedRfc = CsvEngine.parse(rfcCsv);
assert.strictEqual(parsedRfc.data.length, 3, 'Should parse 3 rows');
assert.strictEqual(parsedRfc.data[0].descricao, 'Item com, virgula e "aspas"', 'Escaped quotes and commas inside quotes handled');
assert.strictEqual(parsedRfc.data[1].descricao, 'Linha 1\nLinha 2', 'Newlines inside quotes handled');
console.log('✔ RFC 4180 quotes and newlines passed');

// Test 3: Number Parsing (Brazilian & Standard)
assert.strictEqual(CsvEngine.parseNumber('1.234,56'), 1234.56);
assert.strictEqual(CsvEngine.parseNumber('1234.56'), 1234.56);
assert.strictEqual(CsvEngine.parseNumber('R$ 950,50'), 950.50);
assert.strictEqual(CsvEngine.parseNumber(' -45,20 '), -45.20);
assert.strictEqual(CsvEngine.parseNumber('abc'), null);
console.log('✔ Number parsing (including BR format) passed');

// Test 4: Type Inference
const sampleRows = [
  { id: '1', nome: 'Alpha', preco: 'R$ 150,00', ativo: 'true', data: '2026-05-10' },
  { id: '2', nome: 'Beta', preco: 'R$ 250,50', ativo: 'false', data: '2026-06-12' },
  { id: '3', nome: 'Gamma', preco: 'R$ 80,00', ativo: 'true', data: '2026-07-20' }
];
const inferred = CsvEngine.inferTypes(['id', 'nome', 'preco', 'ativo', 'data'], sampleRows);
assert.strictEqual(inferred.id, 'number');
assert.strictEqual(inferred.nome, 'text');
assert.strictEqual(inferred.preco, 'number');
assert.strictEqual(inferred.ativo, 'boolean');
assert.strictEqual(inferred.data, 'date');
console.log('✔ Type inference passed');

// Test 5: Profiling
const profilePreco = CsvEngine.profileColumn('preco', sampleRows, 'number');
assert.strictEqual(profilePreco.numeric.min, 80);
assert.strictEqual(profilePreco.numeric.max, 250.5);
assert.strictEqual(profilePreco.numeric.sum, 480.5);
console.log('✔ Data profiling passed');

// Test 6: Global and Advanced Filtering
const filterRes1 = CsvEngine.filterData(sampleRows, ['id', 'nome', 'preco'], {
  globalSearch: 'beta'
});
assert.strictEqual(filterRes1.length, 1);
assert.strictEqual(filterRes1[0].nome, 'Beta');

const filterRes2 = CsvEngine.filterData(sampleRows, ['id', 'nome', 'preco'], {
  advancedRules: [
    { column: 'preco', operator: 'greater_than', value: '100' }
  ]
});
assert.strictEqual(filterRes2.length, 2);

const filterRes3 = CsvEngine.filterData(sampleRows, ['id', 'nome', 'preco'], {
  advancedRules: [
    { column: 'preco', operator: 'between', value: '100', value2: '200' }
  ]
});
assert.strictEqual(filterRes3.length, 1);
assert.strictEqual(filterRes3[0].nome, 'Alpha');
console.log('✔ Filtering passed');

// Test 7: Sorting
const sortedDesc = CsvEngine.sortData(sampleRows, 'preco', 'desc', 'number');
assert.strictEqual(sortedDesc[0].nome, 'Beta');
assert.strictEqual(sortedDesc[2].nome, 'Gamma');
console.log('✔ Sorting passed');

// Test 8: Export
const csvOutput = CsvEngine.toCSV(['id', 'nome'], sampleRows);
assert.ok(csvOutput.includes('id,nome'));
assert.ok(csvOutput.includes('1,Alpha'));

const jsonOutput = CsvEngine.toJSON(['id', 'nome'], sampleRows);
const parsedJson = JSON.parse(jsonOutput);
assert.strictEqual(parsedJson.length, 3);
assert.strictEqual(parsedJson[0].nome, 'Alpha');
console.log('✔ Export passed');

console.log('--- ALL TESTS PASSED SUCCESSFULLY! ---');
