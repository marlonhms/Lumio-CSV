const { spawnSync } = require('child_process');
const path = require('path');

const testSuites = [
  'test_csv_engine.js',
  'test_edge_cases.js',
  'test_new_features.js',
  'test_column_resizing_and_autofit.js',
  'test_app_deep_verification.js',
  'test_pwa_and_structure.js',
  'test_excel_support.js',
  'test_vsync_and_theme_scrollbars.js',
  'test_in_browser.js'
];

console.log('\n=============================================================');
console.log('  ⚡ LUMIO CSV - SUÍTE COMPLETA DE TESTES AUTOMATIZADOS');
console.log('=============================================================\n');

let allPassed = true;
const results = [];

const startTime = Date.now();

for (const suite of testSuites) {
  const fullPath = path.join(__dirname, suite);
  const suiteStart = Date.now();
  process.stdout.write(`• Executando ${suite.padEnd(38)} `);

  const res = spawnSync(process.execPath, [fullPath], {
    cwd: __dirname,
    encoding: 'utf8'
  });

  const duration = Date.now() - suiteStart;

  if (res.status === 0) {
    console.log(`\x1b[32m✔ PASSOU\x1b[0m (${duration}ms)`);
    results.push({ suite, passed: true, duration });
  } else {
    console.log(`\x1b[31m✖ FALHOU\x1b[0m (${duration}ms)`);
    console.error('\n--- SAÍDA DE ERRO ---');
    console.error(res.stdout);
    console.error(res.stderr);
    console.error('---------------------\n');
    results.push({ suite, passed: false, duration });
    allPassed = false;
  }
}

const totalDuration = Date.now() - startTime;
console.log('\n=============================================================');
console.log(`  RESUMO: ${results.filter(r => r.passed).length}/${testSuites.length} suítes aprovadas em ${totalDuration}ms`);
console.log('=============================================================\n');

if (!allPassed) {
  process.exit(1);
} else {
  console.log('\x1b[32m✔ Todos os testes foram concluídos com sucesso!\x1b[0m\n');
  process.exit(0);
}
