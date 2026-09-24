/**
 * Script para gerar arquivos de teste em formato .xls (Excel 97-2004)
 */
const fs = require('fs');
const path = require('path');
const XLSX = require('../assets/vendor/xlsx.full.min.js');

const ROOT = path.join(__dirname, '..');

// =========================================================================
// 1. Arquivo Multi-Abas: teste_produtos.xls
// =========================================================================
const wbMulti = XLSX.utils.book_new();

// Aba 1: Catálogo de Produtos
const produtosData = [
  ['ID', 'Produto', 'Categoria', 'Preço Unitário (R$)', 'Estoque', 'Data Cadastro', 'Disponível'],
  [1001, 'Teclado Mecânico RGB', 'Periféricos', 289.90, 45, new Date('2026-01-15T12:00:00Z'), true],
  [1002, 'Mouse Gamer Sem Fio', 'Periféricos', 159.90, 80, new Date('2026-01-20T12:00:00Z'), true],
  [1003, 'Monitor UltraWide 29', 'Monitores', 1399.00, 12, new Date('2026-02-01T12:00:00Z'), true],
  [1004, 'Headset 7.1 Surround', 'Áudio', 349.50, 0, new Date('2026-02-10T12:00:00Z'), false],
  [1005, 'Webcam Full HD 60FPS', 'Acessórios', 219.00, 25, new Date('2026-02-18T12:00:00Z'), true],
  [1006, 'Cadeira Ergonômica Pro', 'Mobiliário', 899.90, 8, new Date('2026-03-02T12:00:00Z'), true],
  [1007, 'Hub USB-C 7 em 1', 'Acessórios', 129.90, 50, new Date('2026-03-05T12:00:00Z'), true],
  [1008, 'Microfone Condensador USB', 'Áudio', 450.00, 15, new Date('2026-03-12T12:00:00Z'), true]
];
const ws1 = XLSX.utils.aoa_to_sheet(produtosData);
XLSX.utils.book_append_sheet(wbMulti, ws1, 'Catálogo de Produtos');

// Aba 2: Vendas e Metas
const vendasData = [
  ['Mês', 'Vendedor', 'Região', 'Meta (R$)', 'Realizado (R$)', 'Meta Batida'],
  ['Janeiro/2026', 'Carlos Eduardo', 'Sudeste', 45000.00, 52300.00, true],
  ['Janeiro/2026', 'Mariana Rocha', 'Sul', 40000.00, 44100.00, true],
  ['Fevereiro/2026', 'Carlos Eduardo', 'Sudeste', 48000.00, 46500.00, false],
  ['Fevereiro/2026', 'Mariana Rocha', 'Sul', 42000.00, 49800.00, true],
  ['Março/2026', 'Felipe Castro', 'Centro-Oeste', 35000.00, 38900.00, true]
];
const ws2 = XLSX.utils.aoa_to_sheet(vendasData);
XLSX.utils.book_append_sheet(wbMulti, ws2, 'Vendas e Metas');

const fileMulti = path.join(ROOT, 'teste_produtos.xls');
fs.writeFileSync(fileMulti, XLSX.write(wbMulti, { type: 'buffer', bookType: 'biff8' }));

console.log('✔ Criado arquivo multi-abas:', fileMulti);

// =========================================================================
// 2. Arquivo Simples (1 Aba): teste_clientes.xls
// =========================================================================
const wbSimple = XLSX.utils.book_new();
const clientesData = [
  ['Código', 'Nome', 'Cidade', 'UF', 'Limite de Crédito (R$)', 'Status'],
  ['CLI-01', 'Luciana Ferraz', 'São Paulo', 'SP', 15000.00, 'Ativo'],
  ['CLI-02', 'Marcos Vinicius', 'Curitiba', 'PR', 8500.00, 'Ativo'],
  ['CLI-03', 'Renata Silveira', 'Belo Horizonte', 'MG', 22000.00, 'VIP'],
  ['CLI-04', 'Gabriel Medina', 'Florianópolis', 'SC', 5000.00, 'Inativo'],
  ['CLI-05', 'Tatiane Duarte', 'Porto Alegre', 'RS', 12000.00, 'Ativo']
];
const wsSimple = XLSX.utils.aoa_to_sheet(clientesData);
XLSX.utils.book_append_sheet(wbSimple, wsSimple, 'Clientes');

const fileSimple = path.join(ROOT, 'teste_clientes.xls');
fs.writeFileSync(fileSimple, XLSX.write(wbSimple, { type: 'buffer', bookType: 'biff8' }));

console.log('✔ Criado arquivo simples:', fileSimple);
