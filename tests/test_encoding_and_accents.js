const assert = require('assert');
const fs = require('fs');
const path = require('path');
const CsvEngine = require(path.join(__dirname, '../csv-engine.js'));

console.log('=== RUNNING TESTS FOR ENCODING AUTO-DETECTION & CLEAN TEXTUALIZATION ===');

const projectRoot = path.join(__dirname, '..');
const configPistaPath = path.join(projectRoot, 'docs/CONFIGPISTA.csv');
const sampleDataPath = path.join(projectRoot, 'sample_data.csv');
const indexHtml = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');
const appJs = fs.readFileSync(path.join(projectRoot, 'app.js'), 'utf8');

// Test 1: Real-world Windows-1252 file (docs/CONFIGPISTA.csv)
console.log('Test 1: Testing auto-detection and decoding of Windows-1252 CONFIGPISTA.csv...');
assert.ok(fs.existsSync(configPistaPath), 'CONFIGPISTA.csv must exist in docs folder');

const configPistaBuf = fs.readFileSync(configPistaPath);
const decodedPista = CsvEngine.detectAndDecodeBuffer(configPistaBuf.buffer);

assert.strictEqual(decodedPista.encoding, 'windows-1252', 'Encoding for CONFIGPISTA.csv must be detected as windows-1252');
assert.ok(!decodedPista.text.includes('\ufffd'), 'Decoded text must NOT contain any replacement character (\\uFFFD)');
assert.ok(decodedPista.text.includes('CHARRUA_ATIVO;NÃO'), 'Must decode CHARRUA_ATIVO;NÃO with proper tilde');
assert.ok(decodedPista.text.includes('CLUB_PETRO_FIDELICASH;NÃO'), 'Must decode CLUB_PETRO_FIDELICASH;NÃO with proper tilde');

const parsedPista = CsvEngine.parse(decodedPista.text);
assert.strictEqual(parsedPista.headers[0], 'AME_CLIENT_ID', 'First header must be AME_CLIENT_ID');
assert.strictEqual(parsedPista.headers[1], 'Coluna_2', 'Second header must be Coluna_2');

const charruaRow = parsedPista.data.find(r => r.AME_CLIENT_ID === 'CHARRUA_ATIVO');
assert.ok(charruaRow, 'CHARRUA_ATIVO row must exist');
assert.strictEqual(charruaRow.Coluna_2, 'NÃO', 'CHARRUA_ATIVO value must be NÃO (not NO or replacement char)');

const clubPetroRow = parsedPista.data.find(r => r.AME_CLIENT_ID === 'CLUB_PETRO_FIDELICASH');
assert.ok(clubPetroRow, 'CLUB_PETRO_FIDELICASH row must exist');
assert.strictEqual(clubPetroRow.Coluna_2, 'NÃO', 'CLUB_PETRO_FIDELICASH value must be NÃO');

const totalNaoRows = parsedPista.data.filter(r => r.Coluna_2 === 'NÃO').length;
assert.ok(totalNaoRows > 250, `Expected over 250 NÃO rows in CONFIGPISTA.csv, got ${totalNaoRows}`);
console.log(`✔ Windows-1252 auto-detected with ${totalNaoRows} clean 'NÃO' cells and zero replacement characters`);

// Test 2: Standard UTF-8 file (sample_data.csv)
console.log('Test 2: Testing auto-detection of UTF-8 file (sample_data.csv)...');
const sampleBuf = fs.readFileSync(sampleDataPath);
const decodedSample = CsvEngine.detectAndDecodeBuffer(sampleBuf.buffer);

assert.strictEqual(decodedSample.encoding, 'utf-8', 'Encoding for sample_data.csv must be detected as utf-8');
assert.ok(!decodedSample.text.includes('\ufffd'), 'sample_data.csv must NOT have replacement characters');
assert.ok(decodedSample.text.includes('Eletrônicos'), 'UTF-8 accented characters like Eletrônicos must be preserved');
assert.ok(decodedSample.text.includes('Preço Unitário'), 'UTF-8 cedilla like Preço must be preserved');
assert.ok(decodedSample.text.includes('Concluído'), 'UTF-8 acute like Concluído must be preserved');
console.log('✔ UTF-8 files correctly recognized and accented characters preserved');

// Test 3: BOM Detection
console.log('Test 3: Testing Byte Order Mark (BOM) recognition...');
// UTF-8 BOM
const utf8BomBuf = Buffer.concat([Buffer.from([0xEF, 0xBB, 0xBF]), Buffer.from('nome;cidade\nJoão;São Paulo')]);
const resBom = CsvEngine.detectAndDecodeBuffer(utf8BomBuf);
assert.strictEqual(resBom.encoding, 'utf-8');
assert.ok(resBom.text.includes('João;São Paulo'));

// UTF-16 LE BOM
const utf16LeBuf = Buffer.concat([Buffer.from([0xFF, 0xFE]), Buffer.from('n\x00o\x00m\x00e\x00', 'binary')]);
const res16Le = CsvEngine.detectAndDecodeBuffer(utf16LeBuf);
assert.strictEqual(res16Le.encoding, 'utf-16le');
console.log('✔ BOM recognition for UTF-8 and UTF-16 verified');

// Test 4: Mojibake Repair (cleanText)
console.log('Test 4: Testing Mojibake repair for common Portuguese corrupted encodings...');
const mojibakeSample = 'Cliente: N\u00c3\u00a3o; Produto: Configura\u00c3\u00a7\u00c3\u00a3o de Pre\u00c3\u00a7o; Status: Conclu\u00c3\u00addo';
const repairedMojibake = CsvEngine.cleanText(mojibakeSample);
assert.strictEqual(repairedMojibake, 'Cliente: Não; Produto: Configuração de Preço; Status: Concluído');
console.log('✔ Mojibake strings successfully repaired to proper Portuguese accents');

// Test 5: Damaged Replacement Character Repair (\uFFFD / )
console.log('Test 5: Testing repair of replacement characters (\\uFFFD)...');
const damagedSample = 'ITEM;VALOR\nATIVO;N\ufffdO\nCANCELAR;n\ufffdo\nCONFIRMA;N\ufffdo\nCUSTO;PRE\ufffdO';
const repairedDamaged = CsvEngine.cleanText(damagedSample);
assert.ok(repairedDamaged.includes('ATIVO;NÃO'), 'N\ufffdO repaired to NÃO');
assert.ok(repairedDamaged.includes('CANCELAR;não'), 'n\ufffdo repaired to não');
assert.ok(repairedDamaged.includes('CONFIRMA;Não'), 'N\ufffdo repaired to Não');
assert.ok(repairedDamaged.includes('CUSTO;PREÇO'), 'PRE\ufffdO repaired to PREÇO');
console.log('✔ Damaged replacement characters successfully restored to valid words');

// Test 6: UI & App Integration
console.log('Test 6: Verifying index.html and app.js UI integration...');
assert.ok(indexHtml.includes('value="auto" selected>Auto (Detectar)</option>'), 'selectEncoding must have Auto (Detectar)');
assert.ok(indexHtml.includes('value="windows-1252"'), 'selectEncoding must have Windows-1252');
assert.ok(appJs.includes('detectAndDecodeBuffer'), 'app.js must call detectAndDecodeBuffer');
assert.ok(appJs.includes('currentEncoding: \'auto\''), 'app.js must default currentEncoding to auto');
console.log('✔ UI encoding controls and app.js integration verified');

console.log('=== ALL ENCODING & ACCENT TESTS PASSED SUCCESSFULLY! ===');
