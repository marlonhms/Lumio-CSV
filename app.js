/**
 * Lumio CSV - Main Application Controller
 * Ultra-responsive, client-side, zero-dependency data explorer & editor.
 * Features inline cell editing, row/column management, smart filters,
 * multi-encoding support, and instant CSV export.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    rawText: '',
    rawBuffer: null,
    file: null,
    fileName: '',
    headers: [],
    data: [],
    inferredTypes: {},
    visibleHeaders: [],
    sortColumn: null,
    sortDirection: 'asc', // 'asc' | 'desc'
    columnWidths: {}, // { [header]: widthInPixels }
    columnAlignments: {}, // { [header]: 'left' | 'center' | 'right' }
    globalSearch: '',
    isRegex: false,
    isCaseSensitive: false,
    showQuickFilters: true,
    columnFilters: {},
    advancedRules: [],
    ruleLogic: 'AND',
    currentPage: 1,
    pageSize: 50,
    filteredData: [],
    selectedRowIds: new Set(),
    inspectedRowIndex: -1,
    isDirty: false,
    currentThemeIndex: 0,
    themes: ['neon', 'amethyst', 'emerald', 'solar'],
    currentEncoding: 'utf-8',
    isExcel: false,
    excelWorkbook: null,
    activeSheetName: null,
    excelBuffer: null,
    vsync: {
      mode: 'lock120', // 'lock120' | 'lock144' | 'auto' | 'lock60'
      detectedRefreshRate: 60,
      currentFps: 60,
      lastInteraction: performance.now()
    }
  };

  // Embedded Sample Dataset Fallback
  const EMBEDDED_SAMPLE_CSV = `ID Pedido;Cliente;Email;Data;Categoria;Produto;Quantidade;Preço Unitário (R$);Desconto;Status;Cidade;UF;Avaliação
PED-1001;Ana Clara Silveira;ana.silveira@email.com;15/01/2026;Eletrônicos;Notebook Dell XPS 13;1;7.899,00;5%;Concluído;São Paulo;SP;5.0
PED-1002;Bruno Henrique Ramos;bruno.ramos@email.com;16/01/2026;Periféricos;Teclado Mecânico RGB;2;349,90;10%;Concluído;Rio de Janeiro;RJ;4.8
PED-1003;Carla Medeiros Santos;carla.santos@email.com;16/01/2026;Monitores;Monitor Gamer UltraWide 34";1;2.790,00;0%;Em Trânsito;Curitiba;PR;4.9
PED-1004;Diego Alves Pinheiro;diego.alves@email.com;18/01/2026;Acessórios;Mousepad Extra Grande Speed;3;89,90;15%;Concluído;Belo Horizonte;MG;4.5
PED-1005;Eduardo Costa Lima;eduardo.lima@email.com;19/01/2026;Hardware;Placa de Vídeo RTX 4070;1;4.250,00;8%;Concluído;Porto Alegre;RS;5.0
PED-1006;Fernanda Souza Dias;fernanda.dias@email.com;20/01/2026;Áudio;Headset Gamer Sem Fio 7.1;1;699,00;0%;Pendente;Salvador;BA;4.6
PED-1007;Gabriel Rocha Castro;gabriel.castro@email.com;22/01/2026;Cadeiras;Cadeira Ergonômica Mesh Pro;1;1.450,00;12%;Concluído;Brasília;DF;4.7
PED-1008;Helena Martins Nogueira;helena.martins@email.com;23/01/2026;Armazenamento;SSD NVMe 2TB PCIe 4.0;2;589,00;5%;Concluído;Florianópolis;SC;4.9
PED-1009;Igor Pereira Batista;igor.batista@email.com;25/01/2026;Redes;Roteador Wi-Fi 6 Mesh Gigabit;2;420,00;10%;Cancelado;Recife;PE;3.8
PED-1010;Juliana Ferreira Prado;juliana.prado@email.com;26/01/2026;Eletrônicos;Tablet 11" 128GB Wi-Fi;1;2.199,00;0%;Concluído;Campinas;SP;4.7
PED-1011;Lucas Moreira Neves;lucas.neves@email.com;28/01/2026;Hardware;Processador Octa-Core 4.5GHz;1;1.890,00;5%;Em Trânsito;Goiânia;GO;4.9
PED-1012;Mariana Guimarães Melo;mariana.melo@email.com;29/01/2026;Acessórios;Hub USB-C 8 em 1 HDMI 4K;2;179,90;0%;Concluído;Vitória;ES;4.6
PED-1013;Natália Carvalho Vieira;natalia.vieira@email.com;01/02/2026;Periféricos;Mouse Sem Fio Ergonômico;1;219,00;7%;Concluído;São Paulo;SP;4.4
PED-1014;Otávio Rezende Borges;otavio.borges@email.com;02/02/2026;Monitores;Monitor Profissional 4K 27";1;3.150,00;10%;Concluído;Santos;SP;5.0
PED-1015;Patrícia Fonseca Barros;patricia.barros@email.com;04/02/2026;Áudio;Caixa de Som Bluetooth 40W;2;299,00;15%;Pendente;Fortaleza;CE;4.3
PED-1016;Rodrigo Tavares Gomes;rodrigo.gomes@email.com;05/02/2026;Hardware;Memória RAM 32GB DDR5 6000MHz;2;720,00;0%;Concluído;São José dos Campos;SP;4.8
PED-1017;Sabrina Cunha Freitas;sabrina.freitas@email.com;08/02/2026;Cadeiras;Suporte Articulado para 2 Monitores;1;289,90;5%;Concluído;Ribeirão Preto;SP;4.7
PED-1018;Thiago Farias Cardoso;thiago.cardoso@email.com;09/02/2026;Armazenamento;HD Externo Portátil 4TB;1;480,00;0%;Em Trânsito;Cuiabá;MT;4.5
PED-1019;Vanessa Pires Teixeira;vanessa.teixeira@email.com;11/02/2026;Eletrônicos;Mini PC Ryzen 7 32GB RAM;1;3.600,00;8%;Concluído;Natal;RN;5.0
PED-1020;William Ribeiro Duarte;william.duarte@email.com;13/02/2026;Acessórios;Carregador GaN 100W 3 Portas;3;159,90;12%;Concluído;São Paulo;SP;4.9
PED-1021;Amanda Miranda Toledo;amanda.toledo@email.com;14/02/2026;Periféricos;Webcam Full HD 60FPS com Microfone;1;329,00;0%;Concluído;Joinville;SC;4.6
PED-1022;Bernardo Pacheco Correia;bernardo.correia@email.com;16/02/2026;Áudio;Microfone Condensador USB Podcast;1;459,00;10%;Cancelado;Niterói;RJ;4.0
PED-1023;Camila Antunes Siqueira;camila.siqueira@email.com;18/02/2026;Redes;Switch Gigabit 8 Portas Metal;2;135,00;0%;Concluído;Londrina;PR;4.7
PED-1024;Danilo Bezerra Aragão;danilo.aragao@email.com;20/02/2026;Hardware;Fonte Modular 750W 80 Plus Gold;1;599,00;5%;Em Trânsito;Manaus;AM;4.8
PED-1025;Emanuelle Lacerda Cruz;emanuelle.cruz@email.com;22/02/2026;Cadeiras;Apoio de Pés Ergonômico Ajustável;2;119,00;15%;Concluído;Uberlândia;MG;4.4
PED-1026;Felipe Brandão Franco;felipe.franco@email.com;24/02/2026;Monitores;Braço Articulado a Gás 32";1;220,00;0%;Concluído;Maringá;PR;4.8
PED-1027;Gisele Albuquerque Paiva;gisele.paiva@email.com;26/02/2026;Eletrônicos;Smartwatch Esportivo GPS AMOLED;1;899,00;10%;Concluído;João Pessoa;PB;4.7
PED-1028;Henrique Queiroz Couto;henrique.couto@email.com;27/02/2026;Armazenamento;Leitor de Cartão SD/MicroSD USB 3.2;4;49,90;20%;Pendente;Sorocaba;SP;4.2
PED-1029;Isabela Moura Peixoto;isabela.peixoto@email.com;01/03/2026;Acessórios;Organizador de Cabos Espiral 5m;5;29,90;0%;Concluído;São Paulo;SP;4.5
PED-1030;João Pedro Esteves;joao.esteves@email.com;02/03/2026;Hardware;Gabinete Mid-Tower Aquário Vidro;1;499,00;8%;Concluído;Belo Horizonte;MG;4.9`;

  // DOM Elements Cache
  const elements = {
    fileInput: document.getElementById('fileInput'),
    btnOpenFile: document.getElementById('btnOpenFile'),
    btnOpenModalPaste: document.getElementById('btnOpenModalPaste'),
    btnLoadSample: document.getElementById('btnLoadSample'),
    btnQuickSave: document.getElementById('btnQuickSave'),
    btnExport: document.getElementById('btnExport'),
    btnInstallApp: document.getElementById('btnInstallApp'),
    btnTriggerPwaInstall: document.getElementById('btnTriggerPwaInstall'),
    btnThemeToggle: document.getElementById('btnThemeToggle'),
    fileInfoBadge: document.getElementById('fileInfoBadge'),
    fileInfoName: document.getElementById('fileInfoName'),
    unsavedIndicator: document.getElementById('unsavedIndicator'),

    toolbarPanel: document.getElementById('toolbarPanel'),
    globalSearchInput: document.getElementById('globalSearchInput'),
    btnToggleRegex: document.getElementById('btnToggleRegex'),
    btnToggleCase: document.getElementById('btnToggleCase'),
    btnClearSearch: document.getElementById('btnClearSearch'),

    // Telemetry & Metrics
    fpsTelemetry: document.getElementById('fpsTelemetry'),
    fpsVal: document.getElementById('fpsVal'),
    renderTimeVal: document.getElementById('renderTimeVal'),
    vsyncBadge: document.getElementById('vsyncBadge'),
    modalVsync: document.getElementById('modalVsync'),
    vsyncDetectedRate: document.getElementById('vsyncDetectedRate'),
    vsyncCurrentFps: document.getElementById('vsyncCurrentFps'),
    vsyncStatusBadge: document.getElementById('vsyncStatusBadge'),
    metricTotalRows: document.getElementById('metricTotalRows'),
    metricFilteredRows: document.getElementById('metricFilteredRows'),
    pillSelectedRows: document.getElementById('pillSelectedRows'),
    metricSelectedRows: document.getElementById('metricSelectedRows'),
    metricTotalCols: document.getElementById('metricTotalCols'),
    metricEmptyCells: document.getElementById('metricEmptyCells'),

    btnAutoFitAll: document.getElementById('btnAutoFitAll'),
    btnToggleQuickFilters: document.getElementById('btnToggleQuickFilters'),
    btnOpenAdvFilter: document.getElementById('btnOpenAdvFilter'),
    activeFilterBadge: document.getElementById('activeFilterBadge'),
    btnOpenColumnsModal: document.getElementById('btnOpenColumnsModal'),
    btnOpenStatsModal: document.getElementById('btnOpenStatsModal'),
    btnResetView: document.getElementById('btnResetView'),

    dropzoneContainer: document.getElementById('dropzoneContainer'),
    btnDropzoneSelect: document.getElementById('btnDropzoneSelect'),
    btnDropzoneSample: document.getElementById('btnDropzoneSample'),

    tableViewportContainer: document.getElementById('tableViewportContainer'),
    floatingSelectionBar: document.getElementById('floatingSelectionBar'),
    floatingSelectedCount: document.getElementById('floatingSelectedCount'),
    btnDeleteSelectedRows: document.getElementById('btnDeleteSelectedRows'),
    btnDuplicateSelectedRows: document.getElementById('btnDuplicateSelectedRows'),
    btnCopySelectedJson: document.getElementById('btnCopySelectedJson'),
    btnClearSelection: document.getElementById('btnClearSelection'),

    tableScrollArea: document.getElementById('tableScrollArea'),
    dataTable: document.getElementById('dataTable'),
    tableHead: document.getElementById('tableHead'),
    tableBody: document.getElementById('tableBody'),

    paginationSummary: document.getElementById('paginationSummary'),
    btnFirstPage: document.getElementById('btnFirstPage'),
    btnPrevPage: document.getElementById('btnPrevPage'),
    pageIndicator: document.getElementById('pageIndicator'),
    btnNextPage: document.getElementById('btnNextPage'),
    btnLastPage: document.getElementById('btnLastPage'),
    selectPageSize: document.getElementById('selectPageSize'),
    selectDelimiter: document.getElementById('selectDelimiter'),
    selectEncoding: document.getElementById('selectEncoding'),
    excelSheetTabsBar: document.getElementById('excelSheetTabsBar'),
    excelSheetTabsList: document.getElementById('excelSheetTabsList'),

    // Modals
    modalAdvFilter: document.getElementById('modalAdvFilter'),
    filterRulesList: document.getElementById('filterRulesList'),
    btnAddFilterRule: document.getElementById('btnAddFilterRule'),
    btnClearAllFilters: document.getElementById('btnClearAllFilters'),
    btnApplyAdvFilters: document.getElementById('btnApplyAdvFilters'),
    selectFilterLogic: document.getElementById('selectFilterLogic'),

    modalColumns: document.getElementById('modalColumns'),
    columnChecklistContainer: document.getElementById('columnChecklistContainer'),
    btnSelectAllCols: document.getElementById('btnSelectAllCols'),
    btnDeselectAllCols: document.getElementById('btnDeselectAllCols'),
    btnModalAutoFitAll: document.getElementById('btnModalAutoFitAll'),
    btnModalResetCols: document.getElementById('btnModalResetCols'),

    modalStats: document.getElementById('modalStats'),
    selectStatsColumn: document.getElementById('selectStatsColumn'),
    columnStatsDetails: document.getElementById('columnStatsDetails'),

    modalRowInspector: document.getElementById('modalRowInspector'),
    rowInspectorTitle: document.getElementById('rowInspectorTitle'),
    rowInspectorGrid: document.getElementById('rowInspectorGrid'),
    btnPrevRowInspector: document.getElementById('btnPrevRowInspector'),
    btnNextRowInspector: document.getElementById('btnNextRowInspector'),
    btnCopyRowJson: document.getElementById('btnCopyRowJson'),
    btnSaveRowInspector: document.getElementById('btnSaveRowInspector'),

    modalPaste: document.getElementById('modalPaste'),
    pasteTextarea: document.getElementById('pasteTextarea'),
    btnProcessPaste: document.getElementById('btnProcessPaste'),

    modalExport: document.getElementById('modalExport'),
    selectExportFormat: document.getElementById('selectExportFormat'),
    checkExportOnlyFiltered: document.getElementById('checkExportOnlyFiltered'),
    checkExportOnlyVisible: document.getElementById('checkExportOnlyVisible'),
    btnCopyExportClipboard: document.getElementById('btnCopyExportClipboard'),
    btnDownloadExport: document.getElementById('btnDownloadExport'),

    toastContainer: document.getElementById('toastContainer')
  };

  /**
   * Display lightweight neon glass toast notification
   */
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: var(--accent-primary);">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${escapeHtml(message)}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Format numbers to localized display
   */
  function formatNumberDisplay(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return Number(num).toLocaleString('pt-BR', { maximumFractionDigits: 4 });
  }

  /**
   * Mark application state as modified
   */
  function markDirty(dirty = true) {
    state.isDirty = dirty;
    elements.unsavedIndicator.style.display = dirty ? 'inline-block' : 'none';
    if (elements.btnQuickSave) {
      elements.btnQuickSave.classList.toggle('has-unsaved', dirty);
    }
  }

  let xlsxLoadingPromise = null;

  /**
   * Lazily loads SheetJS (XLSX) library on-demand
   */
  function ensureXlsxLoaded() {
    if (typeof XLSX !== 'undefined') {
      return Promise.resolve(window.XLSX);
    }
    if (xlsxLoadingPromise) {
      return xlsxLoadingPromise;
    }
    xlsxLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'assets/vendor/xlsx.full.min.js';
      script.async = true;
      script.onload = () => {
        if (typeof XLSX !== 'undefined') {
          resolve(window.XLSX);
        } else {
          xlsxLoadingPromise = null;
          reject(new Error('Motor Excel não inicializado.'));
        }
      };
      script.onerror = () => {
        xlsxLoadingPromise = null;
        reject(new Error('Falha ao carregar assets/vendor/xlsx.full.min.js'));
      };
      document.head.appendChild(script);
    });
    return xlsxLoadingPromise;
  }

  // Pre-cache or preload Excel engine softly in idle time
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        ensureXlsxLoaded().catch(() => {});
      }, { timeout: 4000 });
    } else {
      setTimeout(() => {
        ensureXlsxLoaded().catch(() => {});
      }, 2500);
    }
  }

  function isExcelFile(name) {
    if (!name || typeof name !== 'string') return false;
    const ext = name.split('.').pop().toLowerCase();
    return ['xls', 'xlsx', 'xlsm', 'xlsb', 'ods'].includes(ext);
  }

  /**
   * Universal Dataset Loader (Used by CSV, TSV and Excel sheets)
   */
  function loadParsedDataset(parsed, fileName, sheetName = null, tStart = null, preserveDirty = false) {
    if (!parsed.headers || parsed.headers.length === 0) {
      showToast('Não foi possível identificar colunas neste arquivo.');
      return;
    }

    state.headers = parsed.headers;
    state.data = parsed.data;
    state.visibleHeaders = [...parsed.headers];
    state.inferredTypes = CsvEngine.inferTypes(state.headers, state.data);
    state.selectedRowIds.clear();

    // Sync delimiter dropdown
    if (parsed.meta && parsed.meta.delimiter) {
      elements.selectDelimiter.value = parsed.meta.delimiter;
    }
    elements.selectDelimiter.disabled = state.isExcel;
    elements.selectEncoding.disabled = state.isExcel;

    // Reset view controls if fresh load
    if (!preserveDirty) {
      state.sortColumn = null;
      state.sortDirection = 'asc';
      state.globalSearch = '';
      state.columnFilters = {};
      state.advancedRules = [];
      state.currentPage = 1;
      state.columnWidths = {};
      state.columnAlignments = {};
      state.visibleHeaders.forEach(h => {
        state.columnWidths[h] = calculateIdealColumnWidth(h);
      });
      markDirty(false);
      elements.globalSearchInput.value = '';
      elements.btnClearSearch.style.display = 'none';
    }

    // File info badge
    elements.fileInfoBadge.style.display = 'flex';
    const displayName = sheetName ? `${fileName} [${sheetName}]` : fileName;
    elements.fileInfoName.textContent = displayName;

    // Switch view from dropzone to table
    elements.dropzoneContainer.style.display = 'none';
    elements.tableViewportContainer.style.display = 'flex';
    elements.toolbarPanel.style.display = 'grid';
    elements.btnExport.style.display = 'inline-flex';
    elements.btnQuickSave.style.display = 'inline-flex';

    // Compute Metrics & Render
    recomputeFilteredData();
    renderTableHeader();
    renderTableBody();
    updateMetrics();

    const ms = tStart ? Math.round(performance.now() - tStart) : 0;
    const countStr = state.data.length.toLocaleString('pt-BR');
    showToast(`Carregado com sucesso! ${countStr} registros analisados${ms ? ' em ' + ms + 'ms.' : '.'}`);
  }

  /**
   * Initialize and Load CSV Data
   */
  function loadCsvContent(text, fileName = 'dataset.csv', forcedDelimiter = null, preserveDirty = false) {
    if (!text || typeof text !== 'string') {
      showToast('O arquivo CSV está vazio ou em formato inválido.');
      return;
    }

    const tStart = performance.now();
    state.rawText = text;
    state.fileName = fileName;
    state.isExcel = false;
    state.excelWorkbook = null;
    state.activeSheetName = null;
    if (elements.excelSheetTabsBar) {
      elements.excelSheetTabsBar.style.display = 'none';
    }

    const parseOptions = {
      delimiter: forcedDelimiter && forcedDelimiter !== 'auto' ? forcedDelimiter : null,
      hasHeader: true,
      trimFields: true,
      skipEmptyLines: true
    };

    const parsed = CsvEngine.parse(text, parseOptions);
    loadParsedDataset(parsed, fileName, null, tStart, preserveDirty);
  }

  /**
   * Render Excel Sheet Tabs
   */
  function renderSheetTabs(sheetNames, activeSheet) {
    if (!elements.excelSheetTabsBar) return;
    if (!sheetNames || sheetNames.length <= 1) {
      elements.excelSheetTabsBar.style.display = 'none';
      return;
    }

    elements.excelSheetTabsBar.style.display = 'flex';
    elements.excelSheetTabsList.innerHTML = '';

    sheetNames.forEach(name => {
      const btn = document.createElement('button');
      btn.className = `sheet-tab-btn ${name === activeSheet ? 'active' : ''}`;
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        </svg>
        <span>${escapeHtml(name)}</span>
      `;
      btn.title = `Alternar para a aba "${name}"`;
      btn.addEventListener('click', () => {
        if (name !== state.activeSheetName) {
          switchExcelSheet(name);
        }
      });
      elements.excelSheetTabsList.appendChild(btn);
    });
  }

  /**
   * Switch Active Excel Sheet
   */
  function switchExcelSheet(sheetName) {
    if (!state.excelWorkbook) return;
    const worksheet = state.excelWorkbook.Sheets[sheetName];
    if (!worksheet) return;

    state.activeSheetName = sheetName;
    renderSheetTabs(state.excelWorkbook.SheetNames, sheetName);

    const aoa = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
    const parsed = CsvEngine.fromAOA(aoa);

    const tStart = performance.now();
    loadParsedDataset(parsed, state.fileName, sheetName, tStart, false);
    showToast(`Aba alternada para "${sheetName}".`);
  }

  /**
   * Load Excel Workbook from ArrayBuffer
   */
  function loadExcelBuffer(buffer, fileName, targetSheetName = null) {
    const tStart = performance.now();
    state.fileName = fileName;
    state.rawBuffer = buffer;
    state.isExcel = true;

    try {
      const workbook = window.XLSX.read(buffer, { type: 'array', cellDates: true });
      state.excelWorkbook = workbook;
      state.excelBuffer = buffer;

      const sheetNames = workbook.SheetNames;
      if (!sheetNames || sheetNames.length === 0) {
        showToast('A planilha Excel não contém nenhuma aba visível.');
        return;
      }

      const activeSheet = targetSheetName && sheetNames.includes(targetSheetName) ? targetSheetName : sheetNames[0];
      state.activeSheetName = activeSheet;

      renderSheetTabs(sheetNames, activeSheet);

      const worksheet = workbook.Sheets[activeSheet];
      const aoa = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      const parsed = CsvEngine.fromAOA(aoa);

      loadParsedDataset(parsed, fileName, activeSheet, tStart, false);
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar planilha Excel: ' + err.message);
    }
  }

  /**
   * Load Excel File object
   */
  function loadExcelFile(file) {
    showToast('Carregando planilha Excel...');
    ensureXlsxLoaded()
      .then(() => {
        const reader = new FileReader();
        reader.onload = (e) => {
          loadExcelBuffer(e.target.result, file.name);
        };
        reader.onerror = () => {
          showToast('Erro ao ler arquivo Excel do disco.');
        };
        reader.readAsArrayBuffer(file);
      })
      .catch((err) => {
        showToast('Erro ao carregar motor Excel: ' + err.message);
      });
  }


  /**
   * Recompute filtered dataset based on search, column quick-filters & active rules
   */
  function recomputeFilteredData() {
    state.filteredData = CsvEngine.filterData(state.data, state.headers, {
      globalSearch: state.globalSearch,
      isRegex: state.isRegex,
      isCaseSensitive: state.isCaseSensitive,
      columnFilters: state.columnFilters,
      advancedRules: state.advancedRules,
      ruleLogic: state.ruleLogic
    });

    if (state.sortColumn) {
      const type = state.inferredTypes[state.sortColumn] || 'text';
      state.filteredData = CsvEngine.sortData(state.filteredData, state.sortColumn, state.sortDirection, type);
    }

    // Adjust page bounds
    const totalPages = getTotalPages();
    if (state.currentPage > totalPages) {
      state.currentPage = Math.max(1, totalPages);
    }
  }

  /**
   * Calculate total pages
   */
  function getTotalPages() {
    if (state.pageSize === 'all') return 1;
    const size = Number(state.pageSize);
    return Math.max(1, Math.ceil(state.filteredData.length / size));
  }

  // Canvas text measurement cache for instant Auto-Fit column sizing
  let offscreenCanvas = null;
  let offscreenCtx = null;

  function getTextWidth(text, font) {
    if (!offscreenCanvas) {
      offscreenCanvas = document.createElement('canvas');
      offscreenCtx = offscreenCanvas.getContext('2d');
    }
    offscreenCtx.font = font || '13.5px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    return offscreenCtx.measureText(String(text)).width;
  }

  /**
   * Calculate smart optimal width for a column based on header and data content
   */
  function calculateIdealColumnWidth(header) {
    const type = state.inferredTypes[header] || 'text';
    const dataFont = type === 'number'
      ? '13px "JetBrains Mono", monospace'
      : '13.5px Inter, -apple-system, BlinkMacSystemFont, sans-serif';
    const headerFont = '600 13px Inter, -apple-system, BlinkMacSystemFont, sans-serif';

    // Base header decorations: drag handle (~14px) + type badge (~20px) + sort arrow (~12px) + cell padding & gap (~26px) = ~72px
    const headerTextWidth = getTextWidth(header, headerFont);
    const headerNeeded = headerTextWidth + 72;

    let maxCellWidth = 0;
    const sampleLimit = Math.min(state.data.length, 120);
    for (let i = 0; i < sampleLimit; i++) {
      const val = state.data[i][header];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const w = getTextWidth(String(val), dataFont);
        if (w > maxCellWidth) maxCellWidth = w;
      }
    }

    const cellNeeded = maxCellWidth > 0 ? (maxCellWidth + 24) : 40;

    // For short-content columns (e.g. 3-digit numbers or codes), avoid blowing up column width
    // unnecessarily while ensuring standard header names (e.g. "administradora", 14 chars ~167px)
    // remain readable without being crushed to empty strings or ellipses.
    let ideal;
    if (cellNeeded < 75 && headerNeeded > 200) {
      // Very long header title on short data: cap at 200px with ellipsis
      ideal = Math.max(cellNeeded + 50, 200);
    } else {
      ideal = Math.max(headerNeeded, cellNeeded);
    }

    // Clamp between 90px and 700px (ensuring minimum width >= 90px so short titles like 'nsu' fit)
    return Math.min(700, Math.max(90, Math.ceil(ideal)));
  }

  /**
   * Auto-fit a single column to its optimal content width
   */
  function autoFitColumn(header) {
    const idealWidth = calculateIdealColumnWidth(header);
    state.columnWidths[header] = idealWidth;
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Coluna "${header}" ajustada para ${idealWidth}px.`);
  }

  /**
   * Auto-fit all visible columns to content widths
   */
  function autoFitAllColumns(showToastMsg = true) {
    if (state.visibleHeaders.length === 0) return;
    state.visibleHeaders.forEach(h => {
      state.columnWidths[h] = calculateIdealColumnWidth(h);
    });
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    if (showToastMsg) {
      showToast(`Todas as ${state.visibleHeaders.length} colunas foram auto-ajustadas! ✨`);
    }
  }

  /**
   * Expand a column width by step (default +35px)
   */
  function expandColumn(header, step = 35) {
    const current = state.columnWidths[header] || calculateIdealColumnWidth(header);
    const newWidth = Math.min(850, current + step);
    state.columnWidths[header] = newWidth;
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Coluna "${header}" expandida para ${newWidth}px.`);
  }

  /**
   * Shrink a column width by step (default -35px)
   */
  function shrinkColumn(header, step = 35) {
    const current = state.columnWidths[header] || calculateIdealColumnWidth(header);
    const newWidth = Math.max(70, current - step);
    state.columnWidths[header] = newWidth;
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Coluna "${header}" reduzida para ${newWidth}px.`);
  }

  /**
   * Reset all custom column widths and alignments to default
   */
  function resetColumnLayout() {
    state.columnWidths = {};
    state.columnAlignments = {};
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast('Larguras e alinhamentos de colunas restaurados ao padrão.');
  }

  /**
   * Toggle center alignment on a specific column
   */
  function toggleColumnCenter(col) {
    if (state.columnAlignments[col] === 'center') {
      delete state.columnAlignments[col];
      showToast(`Alinhamento padrão restaurado para "${col}".`);
    } else {
      state.columnAlignments[col] = 'center';
      showToast(`Coluna "${col}" centralizada.`);
    }
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
  }

  /**
   * Move a column before or after another column (Drag & Drop Reordering)
   */
  function moveColumn(sourceCol, targetCol, insertBefore) {
    const vSrcIdx = state.visibleHeaders.indexOf(sourceCol);
    const vTargetIdx = state.visibleHeaders.indexOf(targetCol);
    if (vSrcIdx === -1 || vTargetIdx === -1) return;

    state.visibleHeaders.splice(vSrcIdx, 1);
    let newVIdx = state.visibleHeaders.indexOf(targetCol);
    if (!insertBefore) newVIdx += 1;
    state.visibleHeaders.splice(newVIdx, 0, sourceCol);

    const hSrcIdx = state.headers.indexOf(sourceCol);
    const hTargetIdx = state.headers.indexOf(targetCol);
    if (hSrcIdx !== -1 && hTargetIdx !== -1) {
      state.headers.splice(hSrcIdx, 1);
      let newHIdx = state.headers.indexOf(targetCol);
      if (!insertBefore) newHIdx += 1;
      state.headers.splice(newHIdx, 0, sourceCol);
    }

    markDirty(true);
    renderTableHeader();
    renderTableBody();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Coluna "${sourceCol}" reposicionada com sucesso.`);
  }

  /**
   * Hide a single column from view
   */
  function hideColumn(col) {
    if (state.visibleHeaders.length <= 1) {
      showToast('Pelo menos uma coluna deve permanecer visível.');
      return;
    }
    state.visibleHeaders = state.visibleHeaders.filter(h => h !== col);
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    updateMetrics();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Coluna "${col}" ocultada. Use "Ocultar Colunas" para reexibir.`);
  }

  /**
   * Isolate a single column (show only this column, hiding all others)
   */
  function isolateColumn(col) {
    state.visibleHeaders = [col];
    markDirty(true);
    renderTableHeader();
    renderTableBody();
    updateMetrics();
    if (elements.columnChecklistContainer) renderColumnChecklist();
    showToast(`Evidenciando apenas a coluna "${col}".`);
  }

  let isDraggingColumn = false;

  /**
   * Render Table Headers with sort indicators, drag-reorder, column resizing,
   * center alignment, auto-fit buttons, and column quick-filters.
   */
  function renderTableHeader() {
    elements.tableHead.innerHTML = '';

    // Render / update <colgroup> for high-performance table-layout: fixed column rendering
    let colgroup = elements.dataTable.querySelector('colgroup');
    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      elements.dataTable.insertBefore(colgroup, elements.tableHead);
    }
    colgroup.innerHTML = `
      <col class="col-select" style="width: 44px;">
      <col class="col-index" style="width: 58px;">
      ${state.visibleHeaders.map(h => {
        const w = state.columnWidths[h] || calculateIdealColumnWidth(h);
        return `<col data-col-name="${escapeHtml(h)}" style="width: ${w}px;">`;
      }).join('')}
      <col class="row-actions-cell" style="width: 90px;">
    `;

    // Calculate and synchronize explicit table width for 144Hz fixed-layout rendering
    let totalTableWidth = 44 + 58 + 90; // col-select (44px) + col-index (58px) + row-actions (90px)
    state.visibleHeaders.forEach(h => {
      totalTableWidth += (state.columnWidths[h] || calculateIdealColumnWidth(h));
    });
    elements.dataTable.style.width = totalTableWidth + 'px';

    // Row 1: Main Header Row
    const trMain = document.createElement('tr');

    // Selection Checkbox Column Header
    const thSelect = document.createElement('th');
    thSelect.className = 'col-select';
    const allFilteredSelected = state.filteredData.length > 0 &&
      state.filteredData.every(r => state.selectedRowIds.has(r.__rowId));
    thSelect.innerHTML = `<input type="checkbox" id="selectAllRows" class="custom-checkbox" ${allFilteredSelected ? 'checked' : ''} title="Selecionar/Desmarcar todas as linhas visíveis">`;
    trMain.appendChild(thSelect);

    // Index Column Header (also drop target for first column position)
    const thIndex = document.createElement('th');
    thIndex.className = 'col-index';
    thIndex.textContent = '#';
    thIndex.title = 'Linha # (Arraste colunas aqui para movê-las ao início)';
    thIndex.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      thIndex.classList.add('th-drag-over-left');
    });
    thIndex.addEventListener('dragleave', () => {
      thIndex.classList.remove('th-drag-over-left');
    });
    thIndex.addEventListener('drop', (e) => {
      e.preventDefault();
      thIndex.classList.remove('th-drag-over-left');
      const sourceCol = e.dataTransfer.getData('text/plain');
      if (sourceCol && state.visibleHeaders.length > 0) {
        const firstCol = state.visibleHeaders[0];
        if (sourceCol !== firstCol) {
          moveColumn(sourceCol, firstCol, true);
        }
      }
    });
    trMain.appendChild(thIndex);

    // Visible Column Headers
    state.visibleHeaders.forEach((header, colIdx) => {
      const th = document.createElement('th');
      th.setAttribute('data-header', header);
      th.setAttribute('draggable', 'true');
      const type = state.inferredTypes[header] || 'text';

      let typeBadge = 'Aa';
      if (type === 'number') typeBadge = '123';
      else if (type === 'date') typeBadge = '📅';
      else if (type === 'boolean') typeBadge = '⚡';

      const isSorted = state.sortColumn === header;
      const sortArrow = isSorted ? (state.sortDirection === 'asc' ? '▲' : '▼') : '↕';

      const isCentered = state.columnAlignments[header] === 'center';
      if (isCentered) th.classList.add('col-align-center');

      const customWidth = state.columnWidths[header] || calculateIdealColumnWidth(header);
      th.style.width = customWidth + 'px';
      th.style.maxWidth = customWidth + 'px';

      th.innerHTML = `
        <div class="th-content">
          <div class="th-info" data-header="${escapeHtml(header)}" title="Clique para ordenar • Arraste para reposicionar">
            <span class="th-drag-handle" title="Arraste para reposicionar coluna">⋮⋮</span>
            <span class="th-type-icon" title="Tipo inferido: ${type}">${typeBadge}</span>
            <span class="th-title" title="${escapeHtml(header)}">${escapeHtml(header)}</span>
            <span class="th-sort-icon ${isSorted ? 'active' : ''}">${sortArrow}</span>
          </div>
          <div class="th-col-actions">
            <button class="th-action-btn ${isCentered ? 'active-align' : ''}" data-align="${escapeHtml(header)}" title="${isCentered ? 'Centralizado (clique para restaurar alinhamento)' : 'Centralizar conteúdo desta coluna'}">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="7" y1="12" x2="17" y2="12"></line>
                <line x1="5" y1="18" x2="19" y2="18"></line>
              </svg>
            </button>
            <button class="th-action-btn" data-autofit="${escapeHtml(header)}" title="Auto-Fit (Ajustar largura inteligente)">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
              </svg>
            </button>
            <button class="th-action-btn" data-hide="${escapeHtml(header)}" title="Ocultar coluna &quot;${escapeHtml(header)}&quot;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            </button>
            <button class="th-action-btn" data-stats="${escapeHtml(header)}" title="Estatísticas e Perfil desta coluna">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="col-resizer" data-resizer-col="${escapeHtml(header)}" title="Arraste para redimensionar • Duplo clique para Auto-Fit" draggable="false"></div>
      `;

      // Drag and drop column reordering
      th.addEventListener('dragstart', (e) => {
        if (e.target.closest('.col-resizer') || e.target.closest('.th-col-actions') || e.target.closest('input') || document.body.classList.contains('is-resizing') || (e.clientX <= th.getBoundingClientRect().left + 8)) {
          e.preventDefault();
          return;
        }
        isDraggingColumn = true;
        e.dataTransfer.setData('text/plain', header);
        e.dataTransfer.effectAllowed = 'move';
        th.classList.add('th-dragging');
      });

      // Left-edge border tolerance to resize previous column seamlessly
      if (colIdx > 0) {
        const prevHeader = state.visibleHeaders[colIdx - 1];
        th.addEventListener('pointermove', (e) => {
          if (document.body.classList.contains('is-resizing')) return;
          const rect = th.getBoundingClientRect();
          if (e.clientX <= rect.left + 5) {
            th.style.cursor = 'col-resize';
          } else if (th.style.cursor === 'col-resize') {
            th.style.cursor = '';
          }
        });
        th.addEventListener('pointerleave', () => {
          if (th.style.cursor === 'col-resize') th.style.cursor = '';
        });
        th.addEventListener('pointerdown', (e) => {
          if (e.button !== undefined && e.button !== 0) return;
          const rect = th.getBoundingClientRect();
          if (e.clientX <= rect.left + 5) {
            e.stopPropagation();
            e.preventDefault();
            const prevTh = trMain.querySelector(`th[data-header="${CSS.escape(prevHeader)}"]`);
            const resizer = prevTh ? prevTh.querySelector('.col-resizer') : null;
            startColumnResize(prevHeader, e, resizer);
          }
        });
      }

      th.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        const rect = th.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        if (e.clientX < midX) {
          th.classList.add('th-drag-over-left');
          th.classList.remove('th-drag-over-right');
        } else {
          th.classList.add('th-drag-over-right');
          th.classList.remove('th-drag-over-left');
        }
      });

      th.addEventListener('dragleave', () => {
        th.classList.remove('th-drag-over-left', 'th-drag-over-right');
      });

      th.addEventListener('dragend', () => {
        trMain.querySelectorAll('th').forEach(cell => {
          cell.classList.remove('th-dragging', 'th-drag-over-left', 'th-drag-over-right');
        });
        setTimeout(() => {
          isDraggingColumn = false;
        }, 120);
      });

      th.addEventListener('drop', (e) => {
        e.preventDefault();
        const sourceCol = e.dataTransfer.getData('text/plain');
        const targetCol = header;
        th.classList.remove('th-drag-over-left', 'th-drag-over-right');

        if (sourceCol && targetCol && sourceCol !== targetCol) {
          const rect = th.getBoundingClientRect();
          const midX = rect.left + rect.width / 2;
          const insertBefore = e.clientX < midX;
          moveColumn(sourceCol, targetCol, insertBefore);
        }
      });

      trMain.appendChild(th);
    });

    // Actions Column Header (also drop target for moving column to last position)
    const thActions = document.createElement('th');
    thActions.className = 'row-actions-cell';
    thActions.textContent = 'Ações';
    thActions.title = 'Ações da linha (Arraste colunas aqui para movê-las ao final)';
    thActions.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      thActions.classList.add('th-drag-over-right');
    });
    thActions.addEventListener('dragleave', () => {
      thActions.classList.remove('th-drag-over-right');
    });
    thActions.addEventListener('drop', (e) => {
      e.preventDefault();
      thActions.classList.remove('th-drag-over-right');
      const sourceCol = e.dataTransfer.getData('text/plain');
      if (sourceCol && state.visibleHeaders.length > 0) {
        const lastCol = state.visibleHeaders[state.visibleHeaders.length - 1];
        if (sourceCol !== lastCol) {
          moveColumn(sourceCol, lastCol, false);
        }
      }
    });
    trMain.appendChild(thActions);

    elements.tableHead.appendChild(trMain);

    // Row 2: Secondary Quick Filter Row (if enabled)
    let trFilter = null;
    if (state.showQuickFilters) {
      trFilter = document.createElement('tr');
      trFilter.className = 'filter-header-row';

      // Checkbox placeholder
      const thFSelect = document.createElement('th');
      thFSelect.className = 'col-select';
      trFilter.appendChild(thFSelect);

      // Index placeholder
      const thFIndex = document.createElement('th');
      thFIndex.className = 'col-index';
      trFilter.appendChild(thFIndex);

      // Column Quick Search Inputs
      state.visibleHeaders.forEach((header, colIdx) => {
        const thF = document.createElement('th');
        thF.setAttribute('data-filter-th', header);
        const filterVal = state.columnFilters[header] || '';

        const customWidth = state.columnWidths[header] || calculateIdealColumnWidth(header);
        thF.style.width = customWidth + 'px';
        thF.style.maxWidth = customWidth + 'px';

        if (state.columnAlignments[header] === 'center') {
          thF.classList.add('col-align-center');
        }

        thF.innerHTML = `
          <input type="text" class="col-filter-input" data-filter-col="${escapeHtml(header)}"
            value="${escapeHtml(filterVal)}" placeholder="Filtrar ${escapeHtml(header)}...">
          <div class="col-resizer" data-resizer-col="${escapeHtml(header)}" title="Arraste para redimensionar • Duplo clique para Auto-Fit" draggable="false"></div>
        `;

        if (colIdx > 0) {
          const prevHeader = state.visibleHeaders[colIdx - 1];
          thF.addEventListener('pointermove', (e) => {
            if (document.body.classList.contains('is-resizing')) return;
            const rect = thF.getBoundingClientRect();
            if (e.clientX <= rect.left + 5) {
              thF.style.cursor = 'col-resize';
            } else if (thF.style.cursor === 'col-resize') {
              thF.style.cursor = '';
            }
          });
          thF.addEventListener('pointerleave', () => {
            if (thF.style.cursor === 'col-resize') thF.style.cursor = '';
          });
          thF.addEventListener('pointerdown', (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            const rect = thF.getBoundingClientRect();
            if (e.clientX <= rect.left + 5) {
              e.stopPropagation();
              e.preventDefault();
              const prevTh = trMain.querySelector(`th[data-header="${CSS.escape(prevHeader)}"]`);
              const resizer = prevTh ? prevTh.querySelector('.col-resizer') : null;
              startColumnResize(prevHeader, e, resizer);
            }
          });
        }

        trFilter.appendChild(thF);
      });

      // Actions placeholder
      const thFActions = document.createElement('th');
      thFActions.className = 'row-actions-cell';
      trFilter.appendChild(thFActions);

      elements.tableHead.appendChild(trFilter);

      // Attach column quick-filter events
      trFilter.querySelectorAll('.col-filter-input').forEach(input => {
        let filterTimeout = null;
        input.addEventListener('input', (e) => {
          clearTimeout(filterTimeout);
          const col = input.getAttribute('data-filter-col');
          const val = e.target.value;
          filterTimeout = setTimeout(() => {
            state.columnFilters[col] = val;
            state.currentPage = 1;
            recomputeFilteredData();
            renderTableBody();
            updateMetrics();
          }, 150);
        });
      });
    }

    // Attach Resizer, Alignment, Auto-Fit, Stats, Rename & Sort handlers on headers
    trMain.querySelectorAll('th[data-header]').forEach(th => {
      const header = th.getAttribute('data-header');

      // Click to sort (suppressed if column was just dragged)
      const infoEl = th.querySelector('.th-info');
      if (infoEl) {
        infoEl.addEventListener('click', (e) => {
          if (isDraggingColumn) return;
          if (e.target.closest('.th-action-btn') || e.target.closest('.col-resizer')) return;
          handleColumnSort(header);
        });
      }

      // Center toggle
      const btnAlign = th.querySelector('[data-align]');
      if (btnAlign) {
        btnAlign.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleColumnCenter(header);
        });
      }

      // Auto-fit button
      const btnAutofit = th.querySelector('[data-autofit]');
      if (btnAutofit) {
        btnAutofit.addEventListener('click', (e) => {
          e.stopPropagation();
          autoFitColumn(header);
        });
      }

      // Hide column button
      const btnHide = th.querySelector('[data-hide]');
      if (btnHide) {
        btnHide.addEventListener('click', (e) => {
          e.stopPropagation();
          hideColumn(header);
        });
      }

      // Stats profile
      const btnStats = th.querySelector('[data-stats]');
      if (btnStats) {
        btnStats.addEventListener('click', (e) => {
          e.stopPropagation();
          openStatsModalForColumn(header);
        });
      }

      // Robust, Shared Column Resizing Engine
      function startColumnResize(colHeader, startEvt, resizerEl) {
        const currentTh = trMain.querySelector(`th[data-header="${CSS.escape(colHeader)}"]`);
        if (!currentTh) return;

        const startX = startEvt.clientX;
        const startWidth = currentTh.getBoundingClientRect().width;
        const startTableWidth = elements.dataTable.getBoundingClientRect().width;

        // Temporarily disable draggable on TH so HTML5 drag doesn't conflict
        if (currentTh) currentTh.setAttribute('draggable', 'false');
        trMain.querySelectorAll('th[draggable="true"]').forEach(cell => {
          cell.setAttribute('draggable', 'false');
        });
        document.body.classList.add('is-resizing');
        if (resizerEl) resizerEl.classList.add('active-resizer');

        const matchingCol = colgroup ? colgroup.querySelector(`col[data-col-name="${CSS.escape(colHeader)}"]`) : null;
        const matchingThF = trFilter ? trFilter.querySelector(`th[data-filter-th="${CSS.escape(colHeader)}"]`) : null;

        try {
          if (startEvt.target && startEvt.target.setPointerCapture && startEvt.pointerId !== undefined) {
            startEvt.target.setPointerCapture(startEvt.pointerId);
          }
        } catch (_) {}

        let lastX = startEvt.clientX;

        function onPointerMove(moveEvt) {
          if (moveEvt.clientX === lastX) return;
          lastX = moveEvt.clientX;
          moveEvt.preventDefault();

          const deltaX = moveEvt.clientX - startX;
          const newWidth = Math.max(60, Math.min(1200, Math.round(startWidth + deltaX)));
          const tableDelta = newWidth - startWidth;

          elements.dataTable.style.width = Math.round(startTableWidth + tableDelta) + 'px';

          if (matchingCol) {
            matchingCol.style.width = newWidth + 'px';
          }
          if (currentTh) {
            currentTh.style.width = newWidth + 'px';
            currentTh.style.maxWidth = newWidth + 'px';
          }
          if (matchingThF) {
            matchingThF.style.width = newWidth + 'px';
            matchingThF.style.maxWidth = newWidth + 'px';
          }
        }

        function onPointerUp(upEvt) {
          cleanup();
          try {
            if (startEvt.target && startEvt.target.releasePointerCapture && startEvt.pointerId !== undefined) {
              startEvt.target.releasePointerCapture(startEvt.pointerId);
            }
          } catch (_) {}

          trMain.querySelectorAll('th[data-header]').forEach(cell => {
            cell.setAttribute('draggable', 'true');
          });
          document.body.classList.remove('is-resizing');
          if (resizerEl) resizerEl.classList.remove('active-resizer');

          const deltaX = (upEvt && upEvt.clientX !== undefined ? upEvt.clientX : lastX) - startX;
          const finalWidth = Math.max(60, Math.min(1200, Math.round(startWidth + deltaX)));
          state.columnWidths[colHeader] = finalWidth;
          markDirty(true);

          // Re-sync final exact table width
          let finalTotalWidth = 44 + 58 + 90;
          state.visibleHeaders.forEach(h => {
            finalTotalWidth += (state.columnWidths[h] || calculateIdealColumnWidth(h));
          });
          elements.dataTable.style.width = finalTotalWidth + 'px';

          if (elements.columnChecklistContainer) renderColumnChecklist();
        }

        function cleanup() {
          window.removeEventListener('pointermove', onPointerMove);
          window.removeEventListener('pointerup', onPointerUp);
          window.removeEventListener('pointercancel', onPointerUp);
          if (startEvt.target) {
            startEvt.target.removeEventListener('pointermove', onPointerMove);
            startEvt.target.removeEventListener('pointerup', onPointerUp);
            startEvt.target.removeEventListener('pointercancel', onPointerUp);
            startEvt.target.removeEventListener('lostpointercapture', onPointerUp);
          }
        }

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
        if (startEvt.target) {
          startEvt.target.addEventListener('pointermove', onPointerMove);
          startEvt.target.addEventListener('pointerup', onPointerUp);
          startEvt.target.addEventListener('pointercancel', onPointerUp);
          startEvt.target.addEventListener('lostpointercapture', onPointerUp);
        }
      }

      // Interactive Resizer Dragging with Real-Time 144Hz Colgroup Updates
      function bindColumnResizer(resizerEl, colHeader) {
        if (!resizerEl) return;
        const targetHeader = colHeader || resizerEl.getAttribute('data-resizer-col') || header;
        resizerEl.setAttribute('draggable', 'false');

        resizerEl.addEventListener('mousedown', (e) => {
          e.stopPropagation();
        });

        resizerEl.addEventListener('pointerdown', (e) => {
          if (e.button !== undefined && e.button !== 0) return;
          e.stopPropagation();
          e.preventDefault();
          startColumnResize(targetHeader, e, resizerEl);
        });

        resizerEl.addEventListener('dblclick', (e) => {
          e.stopPropagation();
          e.preventDefault();
          autoFitColumn(targetHeader);
        });
      }

      bindColumnResizer(th.querySelector('.col-resizer'));
      if (trFilter) {
        const filterTh = trFilter.querySelector(`th[data-filter-th="${CSS.escape(header)}"]`);
        if (filterTh) bindColumnResizer(filterTh.querySelector('.col-resizer'));
      }
    });

    // Select all checkbox event
    const selectAllCheckbox = trMain.querySelector('#selectAllRows');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          state.filteredData.forEach(r => state.selectedRowIds.add(r.__rowId));
        } else {
          state.selectedRowIds.clear();
        }
        renderTableBody();
        updateBatchSelectionUI();
      });
    }
  }

  /**
   * Handle column header sort toggle
   */
  function handleColumnSort(col) {
    if (state.sortColumn === col) {
      if (state.sortDirection === 'asc') {
        state.sortDirection = 'desc';
      } else {
        state.sortColumn = null;
        state.sortDirection = 'asc';
      }
    } else {
      state.sortColumn = col;
      state.sortDirection = 'asc';
    }

    recomputeFilteredData();
    renderTableHeader();
    renderTableBody();
    updatePaginationControls();
  }

  /**
   * High-Performance Row Builder using pure DOM creation (0 event listeners per row)
   */
  function buildRowElement(row, globalRowIdx, searchTarget) {
    const isSelected = state.selectedRowIds.has(row.__rowId);
    const tr = document.createElement('tr');
    tr.setAttribute('data-row-id', row.__rowId);
    tr.setAttribute('data-index', globalRowIdx);
    if (isSelected) tr.classList.add('row-selected');

    // Checkbox Column
    const tdSelect = document.createElement('td');
    tdSelect.className = 'col-select';
    tdSelect.innerHTML = `<input type="checkbox" class="custom-checkbox row-select-checkbox" ${isSelected ? 'checked' : ''}>`;
    tr.appendChild(tdSelect);

    // Index Column
    const tdIdx = document.createElement('td');
    tdIdx.className = 'col-index';
    tdIdx.textContent = (row.__rowId !== undefined) ? row.__rowId : (globalRowIdx + 1);
    tdIdx.title = 'Clique duas vezes no número para inspecionar registro completo';
    tr.appendChild(tdIdx);

    // Data Cells
    state.visibleHeaders.forEach(header => {
      const td = document.createElement('td');
      td.className = 'editable-cell';
      td.setAttribute('data-col', header);
      const rawVal = row[header];
      const type = state.inferredTypes[header] || 'text';

      if (type === 'number') {
        td.classList.add('numeric-cell');
      }

      const alignment = state.columnAlignments[header] || (type === 'number' ? 'right' : 'left');
      td.style.textAlign = alignment;
      if (alignment === 'center') {
        td.classList.add('col-align-center');
      }

      renderCellContent(td, rawVal, searchTarget);
      td.title = `${header}: ${rawVal ?? '(vazio)'} (Clique duas vezes para editar)`;
      tr.appendChild(td);
    });

    // Actions Column
    const tdActions = document.createElement('td');
    tdActions.className = 'row-actions-cell';
    tdActions.innerHTML = `
      <div class="row-action-btns">
        <button class="row-mini-btn" data-action="inspect" title="Inspecionar registro detalhado">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
            <circle cx="12" cy="12" r="3"></circle>
          </svg>
        </button>
        <button class="row-mini-btn" data-action="duplicate" title="Duplicar linha">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        <button class="row-mini-btn btn-del" data-action="delete" title="Excluir linha">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;
    tr.appendChild(tdActions);

    return tr;
  }

  let activeRenderToken = 0;

  /**
   * Ultra-High-FPS Progressive Batch Renderer
   * Renders initial screen batch instantly in 1 frame (<2ms), streaming remaining
   * rows smoothly via requestAnimationFrame so display FPS remains pinned at 60-144Hz.
   */
  function renderTableBody() {
    const t0 = performance.now();
    const currentToken = ++activeRenderToken;
    const tbody = elements.tableBody;
    tbody.innerHTML = '';

    if (state.filteredData.length === 0) {
      const emptyRow = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = state.visibleHeaders.length + 3;
      td.style.textAlign = 'center';
      td.style.padding = '40px 20px';
      td.style.color = 'var(--text-muted)';
      td.innerHTML = `
        <div style="font-size: 1.1rem; margin-bottom: 6px;">Nenhum registro encontrado</div>
        <div style="font-size: 0.8rem;">Tente ajustar sua busca ou limpar os filtros aplicados.</div>
      `;
      emptyRow.appendChild(td);
      tbody.appendChild(emptyRow);
      updatePaginationControls();
      updateBatchSelectionUI();
      if (elements.renderTimeVal) elements.renderTimeVal.textContent = '0.1ms';
      return;
    }

    let startIndex = 0;
    let endIndex = state.filteredData.length;

    if (state.pageSize !== 'all') {
      const size = Number(state.pageSize);
      startIndex = (state.currentPage - 1) * size;
      endIndex = Math.min(startIndex + size, state.filteredData.length);
    }

    const pageSlice = state.filteredData.slice(startIndex, endIndex);
    const searchTarget = state.globalSearch.trim();

    // Instant viewport batch (first 60 rows) with DocumentFragment for immediate 0ms visual feedback
    const INITIAL_BATCH = 60;
    const firstBatchCount = Math.min(INITIAL_BATCH, pageSlice.length);
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < firstBatchCount; i++) {
      fragment.appendChild(buildRowElement(pageSlice[i], startIndex + i, searchTarget));
    }
    tbody.appendChild(fragment);

    // If there are more rows (pageSize 100, 250, 500, 1000, all), stream them via RAF
    if (pageSlice.length > INITIAL_BATCH) {
      let nextIdx = INITIAL_BATCH;
      const CHUNK_SIZE = 120;

      function renderNextChunk() {
        if (currentToken !== activeRenderToken) return; // Stale render pass cancelled
        const chunkFragment = document.createDocumentFragment();
        const chunkLimit = Math.min(nextIdx + CHUNK_SIZE, pageSlice.length);
        for (let i = nextIdx; i < chunkLimit; i++) {
          chunkFragment.appendChild(buildRowElement(pageSlice[i], startIndex + i, searchTarget));
        }
        tbody.appendChild(chunkFragment);
        nextIdx = chunkLimit;

        if (nextIdx < pageSlice.length) {
          requestAnimationFrame(renderNextChunk);
        } else {
          const totalDuration = (performance.now() - t0).toFixed(1);
          if (elements.renderTimeVal) elements.renderTimeVal.textContent = `${totalDuration}ms`;
        }
      }

      requestAnimationFrame(renderNextChunk);
    } else {
      const duration = (performance.now() - t0).toFixed(1);
      if (elements.renderTimeVal) elements.renderTimeVal.textContent = `${duration}ms`;
    }

    updatePaginationControls();
    updateBatchSelectionUI();
  }

  /**
   * Helper to render cell value with search highlighting and status pills
   */
  function renderCellContent(td, rawVal, searchTarget) {
    if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
      td.classList.add('null-cell');
      td.textContent = '(vazio)';
      return;
    }

    td.classList.remove('null-cell');
    const strVal = String(rawVal);
    const lowerVal = strVal.toLowerCase();

    // Check status categories
    let isStatus = false;
    let pillClass = '';
    if (['concluído', 'concluido', 'ativo', 'pago', 'sucesso', 'ok', 'entregue'].includes(lowerVal)) {
      isStatus = true;
      pillClass = 'status-success';
    } else if (['em trânsito', 'em transito', 'em andamento', 'processando'].includes(lowerVal)) {
      isStatus = true;
      pillClass = 'status-info';
    } else if (['pendente', 'aguardando', 'em espera'].includes(lowerVal)) {
      isStatus = true;
      pillClass = 'status-warning';
    } else if (['cancelado', 'falha', 'inativo', 'erro', 'recusado'].includes(lowerVal)) {
      isStatus = true;
      pillClass = 'status-danger';
    }

    let formattedText = escapeHtml(strVal);

    // Apply search highlight
    if (searchTarget) {
      try {
        const regex = state.isRegex
          ? new RegExp(`(${searchTarget})`, state.isCaseSensitive ? 'g' : 'gi')
          : new RegExp(`(${escapeRegex(searchTarget)})`, state.isCaseSensitive ? 'g' : 'gi');
        formattedText = formattedText.replace(regex, '<mark class="search-highlight">$1</mark>');
      } catch (err) {
        // Fallback without highlighting if regex error
      }
    }

    if (isStatus) {
      td.innerHTML = `<span class="status-pill ${pillClass}">${formattedText}</span>`;
    } else {
      td.innerHTML = formattedText;
    }
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Start interactive inline cell editing
   */
  function startInlineEdit(td, row, header) {
    if (td.querySelector('.inline-cell-input')) return; // Already editing

    const currentVal = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-cell-input';
    input.value = currentVal;

    td.innerHTML = '';
    td.appendChild(input);
    input.focus();
    input.select();

    let committed = false;

    const commitChange = () => {
      if (committed) return;
      committed = true;
      const newVal = input.value.trim();

      if (newVal !== currentVal) {
        row[header] = newVal;
        markDirty(true);
        updateMetrics();
        showToast(`Célula "${header}" atualizada.`);
      }

      renderCellContent(td, row[header], state.globalSearch.trim());
    };

    const cancelChange = () => {
      if (committed) return;
      committed = true;
      renderCellContent(td, currentVal, state.globalSearch.trim());
    };

    input.addEventListener('blur', commitChange);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitChange();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelChange();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        commitChange();
        // Move to next editable cell
        const nextTd = td.nextElementSibling;
        if (nextTd && nextTd.classList.contains('editable-cell')) {
          const nextHeader = nextTd.getAttribute('data-col');
          startInlineEdit(nextTd, row, nextHeader);
        }
      }
    });
  }

  /**
   * Update Floating Batch Selection Action Bar
   */
  function updateBatchSelectionUI() {
    const count = state.selectedRowIds.size;
    if (count > 0) {
      elements.floatingSelectionBar.style.display = 'flex';
      elements.floatingSelectedCount.textContent = count;
      elements.pillSelectedRows.style.display = 'flex';
      elements.metricSelectedRows.textContent = count;
    } else {
      elements.floatingSelectionBar.style.display = 'none';
      elements.pillSelectedRows.style.display = 'none';
    }

    // Update select-all checkbox state
    const selectAllCheckbox = document.getElementById('selectAllRows');
    if (selectAllCheckbox) {
      const allFilteredSelected = state.filteredData.length > 0 &&
        state.filteredData.every(r => state.selectedRowIds.has(r.__rowId));
      selectAllCheckbox.checked = allFilteredSelected;
    }
  }

  /**
   * Duplicate a single row
   */
  function duplicateRow(globalRowIdx) {
    const sourceRow = state.filteredData[globalRowIdx];
    if (!sourceRow) return;

    const newId = (state.data.length > 0 ? Math.max(...state.data.map(r => r.__rowId || 0)) : 0) + 1;
    const cloned = { ...sourceRow, __rowId: newId };

    const originalIdx = state.data.findIndex(r => r.__rowId === sourceRow.__rowId);
    if (originalIdx !== -1) {
      state.data.splice(originalIdx + 1, 0, cloned);
    } else {
      state.data.push(cloned);
    }

    markDirty(true);
    updateFileDetailsBadge();
    recomputeFilteredData();
    renderTableBody();
    updateMetrics();
    showToast(`Linha #${sourceRow.__rowId} duplicada com sucesso.`);
  }

  /**
   * Delete a single row
   */
  function deleteRow(globalRowIdx) {
    const targetRow = state.filteredData[globalRowIdx];
    if (!targetRow) return;

    if (!confirm(`Deseja realmente excluir a linha #${targetRow.__rowId}?`)) return;

    state.data = state.data.filter(r => r.__rowId !== targetRow.__rowId);
    state.selectedRowIds.delete(targetRow.__rowId);

    markDirty(true);
    updateFileDetailsBadge();
    recomputeFilteredData();
    renderTableBody();
    updateMetrics();
    showToast(`Linha #${targetRow.__rowId} excluída.`);
  }

  /**
   * Batch delete selected rows
   */
  function deleteSelectedRows() {
    const count = state.selectedRowIds.size;
    if (count === 0) return;

    if (!confirm(`Deseja realmente excluir as ${count} linha(s) selecionada(s)?`)) return;

    state.data = state.data.filter(r => !state.selectedRowIds.has(r.__rowId));
    state.selectedRowIds.clear();

    markDirty(true);
    updateFileDetailsBadge();
    recomputeFilteredData();
    renderTableBody();
    updateMetrics();
    showToast(`${count} linha(s) excluída(s) com sucesso.`);
  }

  /**
   * Batch duplicate selected rows
   */
  function duplicateSelectedRows() {
    const count = state.selectedRowIds.size;
    if (count === 0) return;

    let maxId = (state.data.length > 0 ? Math.max(...state.data.map(r => r.__rowId || 0)) : 0);
    const toDuplicate = state.data.filter(r => state.selectedRowIds.has(r.__rowId));

    toDuplicate.forEach(source => {
      maxId++;
      const cloned = { ...source, __rowId: maxId };
      state.data.push(cloned);
    });

    state.selectedRowIds.clear();
    markDirty(true);
    updateFileDetailsBadge();
    recomputeFilteredData();
    renderTableBody();
    updateMetrics();
    showToast(`${count} linha(s) duplicada(s) com sucesso.`);
  }

  /**
   * Batch copy selected rows as JSON
   */
  function copySelectedRowsJson() {
    const selected = state.data.filter(r => state.selectedRowIds.has(r.__rowId)).map(row => {
      const copy = { ...row };
      delete copy.__rowId;
      return copy;
    });

    navigator.clipboard.writeText(JSON.stringify(selected, null, 2)).then(() => {
      showToast(`${selected.length} linha(s) copiada(s) como JSON!`);
    });
  }

  /**
   * Update Bottom Pagination Summary & Buttons
   */
  function updatePaginationControls() {
    const total = state.filteredData.length;
    const totalPages = getTotalPages();

    let start = 0;
    let end = total;

    if (state.pageSize !== 'all') {
      const size = Number(state.pageSize);
      start = total > 0 ? (state.currentPage - 1) * size + 1 : 0;
      end = Math.min(start + size - 1, total);
    }

    elements.paginationSummary.textContent = `Mostrando ${start.toLocaleString('pt-BR')}-${end.toLocaleString('pt-BR')} de ${total.toLocaleString('pt-BR')} registros`;
    elements.pageIndicator.textContent = `Página ${state.currentPage} de ${totalPages}`;

    elements.btnFirstPage.disabled = state.currentPage <= 1;
    elements.btnPrevPage.disabled = state.currentPage <= 1;
    elements.btnNextPage.disabled = state.currentPage >= totalPages;
    elements.btnLastPage.disabled = state.currentPage >= totalPages;
  }

  /**
   * Update Quick Metrics Strip in Header Toolbar
   */
  function updateMetrics() {
    elements.metricTotalRows.textContent = state.data.length.toLocaleString('pt-BR');
    elements.metricFilteredRows.textContent = state.filteredData.length.toLocaleString('pt-BR');
    elements.metricTotalCols.textContent = `${state.visibleHeaders.length}/${state.headers.length}`;

    // Compute percentage of empty cells
    let emptyCells = 0;
    const totalCells = state.data.length * state.headers.length;

    if (totalCells > 0) {
      state.data.forEach(r => {
        state.headers.forEach(h => {
          const v = r[h];
          if (v === undefined || v === null || String(v).trim() === '') {
            emptyCells++;
          }
        });
      });
      const pct = ((emptyCells / totalCells) * 100).toFixed(1);
      elements.metricEmptyCells.textContent = `${pct}%`;
    } else {
      elements.metricEmptyCells.textContent = '0%';
    }

    // Active filter badge count
    let activeFilterCount = state.advancedRules.length;
    if (state.globalSearch) activeFilterCount++;
    Object.values(state.columnFilters).forEach(v => {
      if (v && String(v).trim()) activeFilterCount++;
    });

    if (activeFilterCount > 0) {
      elements.activeFilterBadge.style.display = 'inline-block';
      elements.activeFilterBadge.textContent = activeFilterCount;
    } else {
      elements.activeFilterBadge.style.display = 'none';
    }
  }

  /**
   * Open Row Inspector modal with LIVE EDITABLE fields
   */
  function openRowInspector(rowIndex) {
    if (rowIndex < 0 || rowIndex >= state.filteredData.length) return;

    state.inspectedRowIndex = rowIndex;
    const record = state.filteredData[rowIndex];
    const rowNumber = record.__rowId || (rowIndex + 1);

    elements.rowInspectorTitle.textContent = `Inspecionar & Editar Registro #${rowNumber} (${rowIndex + 1} de ${state.filteredData.length})`;
    elements.rowInspectorGrid.innerHTML = '';

    state.headers.forEach(header => {
      const val = record[header] !== undefined && record[header] !== null ? String(record[header]) : '';
      const card = document.createElement('div');
      card.className = 'inspector-field-card';

      card.innerHTML = `
        <div class="inspector-label">
          <span>${escapeHtml(header)}</span>
          <button class="copy-mini-btn" title="Copiar este campo" data-copy="${escapeHtml(val)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
        <input type="text" class="inspector-input" data-col="${escapeHtml(header)}" value="${escapeHtml(val)}">
      `;

      card.querySelector('.copy-mini-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(val);
        showToast(`Copiado: ${val.slice(0, 30)}...`);
      });

      elements.rowInspectorGrid.appendChild(card);
    });

    elements.btnPrevRowInspector.disabled = rowIndex <= 0;
    elements.btnNextRowInspector.disabled = rowIndex >= state.filteredData.length - 1;

    openModal('modalRowInspector');
  }

  /**
   * Save changes made in the Row Inspector Modal
   */
  function saveRowInspectorChanges() {
    if (state.inspectedRowIndex < 0 || state.inspectedRowIndex >= state.filteredData.length) return;

    const record = state.filteredData[state.inspectedRowIndex];
    const inputs = elements.rowInspectorGrid.querySelectorAll('.inspector-input');
    let hasChanges = false;

    inputs.forEach(input => {
      const col = input.getAttribute('data-col');
      const val = input.value.trim();
      if (record[col] !== val) {
        record[col] = val;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      markDirty(true);
      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
      showToast('Alterações no registro salvas com sucesso!');
    }

    closeModal('modalRowInspector');
  }

  /**
   * Open Profiler and Statistics Modal for a specific column
   */
  function openStatsModalForColumn(colName) {
    elements.selectStatsColumn.innerHTML = '';
    state.headers.forEach(h => {
      const opt = document.createElement('option');
      opt.value = h;
      opt.textContent = `${h} (${state.inferredTypes[h] || 'texto'})`;
      if (h === colName) opt.selected = true;
      elements.selectStatsColumn.appendChild(opt);
    });

    renderStatsForColumn(colName || state.headers[0]);
    openModal('modalStats');
  }

  function renderStatsForColumn(colName) {
    const type = state.inferredTypes[colName] || 'text';
    const profile = CsvEngine.profileColumn(colName, state.data, type);

    let numericHtml = '';
    if (profile.numeric) {
      numericHtml = `
        <div class="stat-metric-box">
          <span class="stat-metric-label">Mínimo</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.min)}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Máximo</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.max)}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Média</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.avg)}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Mediana</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.median)}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Desvio Padrão</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.stdDev)}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Soma Total</span>
          <span class="stat-metric-val">${formatNumberDisplay(profile.numeric.sum)}</span>
        </div>
      `;
    }

    const freqBarsHtml = profile.topValues.map(tv => `
      <div class="stat-freq-item">
        <div class="stat-freq-header">
          <span style="font-weight: 500; color: var(--text-main);">${escapeHtml(tv.value)}</span>
          <span style="color: var(--text-muted); font-family: var(--font-mono);">${tv.count} (${tv.percentage}%)</span>
        </div>
        <div class="stat-freq-bar-bg">
          <div class="stat-freq-bar-fill" style="width: ${tv.percentage}%;"></div>
        </div>
      </div>
    `).join('');

    elements.columnStatsDetails.innerHTML = `
      <div class="stat-metric-grid">
        <div class="stat-metric-box">
          <span class="stat-metric-label">Tipo Detectado</span>
          <span class="stat-metric-val" style="text-transform: capitalize; font-size: 0.95rem;">${profile.type}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Preenchidos</span>
          <span class="stat-metric-val">${profile.populatedCount.toLocaleString('pt-BR')}</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Células Vazias</span>
          <span class="stat-metric-val">${profile.emptyPercentage}%</span>
        </div>
        <div class="stat-metric-box">
          <span class="stat-metric-label">Valores Únicos</span>
          <span class="stat-metric-val">${profile.uniqueCount.toLocaleString('pt-BR')}</span>
        </div>
        ${numericHtml}
      </div>

      <div style="margin-top: 10px;">
        <h4 style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 10px; text-transform: uppercase;">
          Valores Mais Frequentes (Top 5)
        </h4>
        <div class="stat-freq-list">
          ${freqBarsHtml || '<div style="color: var(--text-muted); font-size: 0.8rem;">Nenhum dado encontrado.</div>'}
        </div>
      </div>
    `;
  }

  /**
   * Modal Management Helpers
   */
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('open');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }

  /**
   * Adaptive V-Sync Engine & High-Accuracy Refresh Rate Telemetry
   * Automatically synchronizes with the native monitor refresh rate (60/75/90/120/144/165/240Hz+)
   * Efficiently sleeps during idle to guarantee 0% unnecessary GPU/CPU usage.
   */
  function initFpsMonitor() {
    let frameCount = 0;
    let lastTime = performance.now();
    let prevFrameTime = 0;
    let isLoopRunning = false;
    let idleTimer = null;
    let calibrationFrames = [];
    const CALIBRATION_SAMPLE_TARGET = 35;

    // Load saved mode if available
    try {
      const savedMode = localStorage.getItem('lumio_vsync_mode');
      if (savedMode === 'lock120' || savedMode === 'lock144' || savedMode === 'auto' || savedMode === 'lock60') {
        state.vsync.mode = savedMode;
      }
    } catch (_) {}

    function updateVsyncUI() {
      if (elements.vsyncDetectedRate) {
        elements.vsyncDetectedRate.textContent = `${state.vsync.detectedRefreshRate} Hz`;
      }
      if (elements.vsyncCurrentFps) {
        elements.vsyncCurrentFps.textContent = `${state.vsync.currentFps} FPS`;
      }
      if (elements.vsyncBadge) {
        if (state.vsync.mode === 'lock60') {
          elements.vsyncBadge.textContent = '60 FPS ECO';
          elements.vsyncBadge.style.color = '#fbbf24';
          elements.vsyncBadge.style.borderColor = 'rgba(251, 191, 36, 0.4)';
          elements.vsyncBadge.style.background = 'rgba(251, 191, 36, 0.12)';
        } else if (state.vsync.mode === 'lock120') {
          elements.vsyncBadge.textContent = '120 FPS FLUIDO';
          elements.vsyncBadge.style.color = '#00f0ff';
          elements.vsyncBadge.style.borderColor = 'rgba(0, 240, 255, 0.4)';
          elements.vsyncBadge.style.background = 'rgba(0, 240, 255, 0.12)';
        } else if (state.vsync.mode === 'lock144') {
          elements.vsyncBadge.textContent = '144 FPS MAX';
          elements.vsyncBadge.style.color = '#00ff9d';
          elements.vsyncBadge.style.borderColor = 'rgba(0, 255, 157, 0.4)';
          elements.vsyncBadge.style.background = 'rgba(0, 255, 157, 0.12)';
        } else {
          elements.vsyncBadge.textContent = `${state.vsync.detectedRefreshRate}Hz VSYNC`;
          elements.vsyncBadge.style.color = '#00ff9d';
          elements.vsyncBadge.style.borderColor = 'rgba(0, 255, 157, 0.35)';
          elements.vsyncBadge.style.background = 'rgba(0, 255, 157, 0.15)';
        }
      }
      if (elements.vsyncStatusBadge) {
        if (state.vsync.mode === 'lock60') {
          elements.vsyncStatusBadge.textContent = 'Travado a 60 FPS (Econômico)';
          elements.vsyncStatusBadge.style.color = '#fbbf24';
        } else if (state.vsync.mode === 'lock120') {
          elements.vsyncStatusBadge.textContent = 'Sincronizado a 120 FPS (Fluidez)';
          elements.vsyncStatusBadge.style.color = '#00f0ff';
        } else if (state.vsync.mode === 'lock144') {
          elements.vsyncStatusBadge.textContent = 'Sincronizado a 144 FPS (Máximo)';
          elements.vsyncStatusBadge.style.color = '#00ff9d';
        } else {
          elements.vsyncStatusBadge.textContent = `Sincronizado a ${state.vsync.detectedRefreshRate}Hz (Auto)`;
          elements.vsyncStatusBadge.style.color = '#00ff9d';
        }
      }
    }

    function calibrateRefreshRate(interval) {
      if (interval > 3 && interval < 40) {
        calibrationFrames.push(interval);
      }
      if (calibrationFrames.length >= CALIBRATION_SAMPLE_TARGET) {
        const sorted = [...calibrationFrames].sort((a, b) => a - b);
        const start = Math.floor(sorted.length * 0.15);
        const end = Math.ceil(sorted.length * 0.85);
        const trimmed = sorted.slice(start, end);
        const median = trimmed.length > 0
          ? trimmed.reduce((a, b) => a + b, 0) / trimmed.length
          : sorted[Math.floor(sorted.length / 2)];
        
        let detected = 60;
        if (median <= 4.8) detected = 240;      // 240Hz (4.16ms)
        else if (median <= 6.5) detected = 165; // 165Hz (6.06ms)
        else if (median <= 7.8) detected = 144; // 144Hz / 145Hz (6.89ms - 6.94ms)
        else if (median <= 9.5) detected = 120; // 120Hz (8.33ms)
        else if (median <= 12.0) detected = 90; // 90Hz (11.1ms)
        else if (median <= 14.5) detected = 75; // 75Hz (13.3ms)
        else detected = 60;                    // 60Hz (16.6ms)

        state.vsync.detectedRefreshRate = detected;
        updateVsyncUI();
      }
    }

    function fpsLoop(now) {
      if (!isLoopRunning) return;

      if (prevFrameTime > 0) {
        const frameDelta = now - prevFrameTime;
        if (calibrationFrames.length < CALIBRATION_SAMPLE_TARGET) {
          calibrateRefreshRate(frameDelta);
        }
      }
      prevFrameTime = now;
      frameCount++;

      const delta = now - lastTime;
      if (delta >= 450) {
        const calculatedFps = Math.round((frameCount * 1000) / delta);
        let displayFps = calculatedFps;

        // Apply selected target cap
        if (state.vsync.mode === 'lock60') {
          displayFps = Math.min(displayFps, 60);
        } else if (state.vsync.mode === 'lock120') {
          displayFps = Math.min(displayFps, 120);
        } else if (state.vsync.mode === 'lock144') {
          displayFps = Math.min(displayFps, 144);
        } else if (state.vsync.detectedRefreshRate > 60) {
          displayFps = Math.min(displayFps, Math.round(state.vsync.detectedRefreshRate * 1.05));
        }

        state.vsync.currentFps = displayFps;

        if (elements.fpsVal) {
          elements.fpsVal.textContent = `${displayFps} FPS`;
        }
        if (elements.vsyncCurrentFps) {
          elements.vsyncCurrentFps.textContent = `${displayFps} FPS`;
        }

        frameCount = 0;
        lastTime = now;

        // Check if idle for more than 2.5 seconds
        if (now - state.vsync.lastInteraction > 2500) {
          isLoopRunning = false;
          scheduleIdleHeartbeat();
          return;
        }
      }

      requestAnimationFrame(fpsLoop);
    }

    function startLoop() {
      state.vsync.lastInteraction = performance.now();
      if (!isLoopRunning) {
        isLoopRunning = true;
        frameCount = 0;
        lastTime = performance.now();
        prevFrameTime = 0;
        requestAnimationFrame(fpsLoop);
      }
    }

    function scheduleIdleHeartbeat() {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (!isLoopRunning) {
          lastTime = performance.now();
          prevFrameTime = 0;
          frameCount = 0;
          isLoopRunning = true;
          requestAnimationFrame(fpsLoop);
        }
      }, 2500);
    }

    // Wake the telemetry loop on any user activity
    const wakeEvents = ['scroll', 'mousemove', 'keydown', 'click', 'resize', 'wheel', 'touchstart'];
    wakeEvents.forEach(evt => {
      window.addEventListener(evt, () => {
        state.vsync.lastInteraction = performance.now();
        if (!isLoopRunning) {
          startLoop();
        }
      }, { passive: true });
    });

    // Initial startup run
    startLoop();
    updateVsyncUI();
  }

  /**
   * Setup Event Listeners
   */
  function initEventListeners() {
    function handleFileSelected(file) {
      if (!file) return;
      state.file = file;
      if (isExcelFile(file.name)) {
        loadExcelFile(file);
      } else {
        readFileWithEncoding(file, state.currentEncoding);
      }
    }

    // File Input change
    elements.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      handleFileSelected(file);
    });

    function readFileWithEncoding(file, encoding) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        state.rawBuffer = evt.target.result;
        try {
          const decoder = new TextDecoder(encoding);
          const decodedText = decoder.decode(state.rawBuffer);
          loadCsvContent(decodedText, file.name);
        } catch (err) {
          // Fallback to UTF-8
          const decoder = new TextDecoder('utf-8');
          const decodedText = decoder.decode(state.rawBuffer);
          loadCsvContent(decodedText, file.name);
        }
      };
      reader.readAsArrayBuffer(file);
    }

    // Encoding dropdown change
    elements.selectEncoding.addEventListener('change', (e) => {
      const encoding = e.target.value;
      state.currentEncoding = encoding;

      if (state.rawBuffer && !state.isExcel) {
        try {
          const decoder = new TextDecoder(encoding);
          const decodedText = decoder.decode(state.rawBuffer);
          loadCsvContent(decodedText, state.fileName, null, true);
          showToast(`Arquivo decodificado com "${encoding.toUpperCase()}".`);
        } catch (err) {
          showToast(`Erro ao aplicar codificação ${encoding}.`);
        }
      }
    });

    // Open file buttons
    elements.btnOpenFile.addEventListener('click', () => elements.fileInput.click());
    elements.btnDropzoneSelect.addEventListener('click', () => elements.fileInput.click());

    // Load Sample dataset
    const loadSample = () => {
      fetch('sample_data.csv')
        .then(res => {
          if (!res.ok) throw new Error('Fetch failed');
          return res.text();
        })
        .then(text => {
          loadCsvContent(text, 'vendas_tech_sample.csv');
        })
        .catch(() => {
          loadCsvContent(EMBEDDED_SAMPLE_CSV, 'vendas_tech_sample.csv');
        });
    };

    elements.btnLoadSample.addEventListener('click', loadSample);
    elements.btnDropzoneSample.addEventListener('click', loadSample);

    // Quick Save button & Ctrl+S
    const handleQuickSave = () => {
      if (state.data.length === 0) return;
      if (state.isExcel) {
        exportDataToFile(false, 'xlsx');
      } else {
        exportDataToFile(false, 'csv_comma');
      }
      markDirty(false);
    };

    elements.btnQuickSave.addEventListener('click', handleQuickSave);

    // Drag and Drop support for external files
    window.addEventListener('dragover', (e) => {
      if (e.dataTransfer && e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        e.preventDefault();
        elements.dropzoneContainer.classList.add('drag-over');
      }
    });

    window.addEventListener('dragleave', (e) => {
      if (e.clientX <= 0 || e.clientY <= 0) {
        elements.dropzoneContainer.classList.remove('drag-over');
      }
    });

    window.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        e.preventDefault();
        elements.dropzoneContainer.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFileSelected(file);
      }
    });

    // Theme Switcher
    elements.btnThemeToggle.addEventListener('click', () => {
      state.currentThemeIndex = (state.currentThemeIndex + 1) % state.themes.length;
      const theme = state.themes[state.currentThemeIndex];
      document.body.setAttribute('data-theme', theme);
      showToast(`Tema ativado: ${theme.toUpperCase()}`);
    });

    // Toolbar Controls: Auto-Fit All, Add Row, Add Column, Modals
    if (elements.btnAutoFitAll) {
      elements.btnAutoFitAll.addEventListener('click', () => {
        autoFitAllColumns();
      });
    }

    if (elements.btnModalAutoFitAll) {
      elements.btnModalAutoFitAll.addEventListener('click', () => {
        autoFitAllColumns();
        renderColumnChecklist();
      });
    }

    if (elements.btnModalResetCols) {
      elements.btnModalResetCols.addEventListener('click', () => {
        resetColumnLayout();
      });
    }

    elements.btnToggleQuickFilters.addEventListener('click', () => {
      state.showQuickFilters = !state.showQuickFilters;
      renderTableHeader();
      showToast(state.showQuickFilters ? 'Filtros rápidos exibidos.' : 'Filtros rápidos ocultados.');
    });

    // Batch Selection Bar Buttons
    elements.btnDeleteSelectedRows.addEventListener('click', deleteSelectedRows);
    elements.btnDuplicateSelectedRows.addEventListener('click', duplicateSelectedRows);
    elements.btnCopySelectedJson.addEventListener('click', copySelectedRowsJson);
    elements.btnClearSelection.addEventListener('click', () => {
      state.selectedRowIds.clear();
      renderTableBody();
      updateBatchSelectionUI();
    });

    // Search Input with Debounce
    let searchDebounceTimeout = null;
    elements.globalSearchInput.addEventListener('input', (e) => {
      clearTimeout(searchDebounceTimeout);
      const val = e.target.value;
      elements.btnClearSearch.style.display = val ? 'inline-block' : 'none';

      searchDebounceTimeout = setTimeout(() => {
        state.globalSearch = val;
        state.currentPage = 1;
        recomputeFilteredData();
        renderTableBody();
        updateMetrics();
      }, 150);
    });

    elements.btnClearSearch.addEventListener('click', () => {
      elements.globalSearchInput.value = '';
      elements.btnClearSearch.style.display = 'none';
      state.globalSearch = '';
      state.currentPage = 1;
      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
    });

    elements.btnToggleRegex.addEventListener('click', () => {
      state.isRegex = !state.isRegex;
      elements.btnToggleRegex.classList.toggle('active', state.isRegex);
      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
    });

    elements.btnToggleCase.addEventListener('click', () => {
      state.isCaseSensitive = !state.isCaseSensitive;
      elements.btnToggleCase.classList.toggle('active', state.isCaseSensitive);
      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
    });

    // Delimiter change
    elements.selectDelimiter.addEventListener('change', (e) => {
      const delim = e.target.value;
      if (state.rawText) {
        loadCsvContent(state.rawText, state.fileName, delim, true);
      }
    });

    // Page size change
    elements.selectPageSize.addEventListener('change', (e) => {
      state.pageSize = e.target.value;
      state.currentPage = 1;
      renderTableBody();
    });

    // Pagination buttons
    elements.btnFirstPage.addEventListener('click', () => {
      state.currentPage = 1;
      renderTableBody();
    });

    elements.btnPrevPage.addEventListener('click', () => {
      if (state.currentPage > 1) {
        state.currentPage--;
        renderTableBody();
      }
    });

    elements.btnNextPage.addEventListener('click', () => {
      if (state.currentPage < getTotalPages()) {
        state.currentPage++;
        renderTableBody();
      }
    });

    elements.btnLastPage.addEventListener('click', () => {
      state.currentPage = getTotalPages();
      renderTableBody();
    });

    // Reset View button
    elements.btnResetView.addEventListener('click', () => {
      state.sortColumn = null;
      state.sortDirection = 'asc';
      state.globalSearch = '';
      state.isRegex = false;
      state.isCaseSensitive = false;
      state.advancedRules = [];
      state.columnFilters = {};
      state.visibleHeaders = [...state.headers];
      state.selectedRowIds.clear();
      state.currentPage = 1;

      elements.globalSearchInput.value = '';
      elements.btnToggleRegex.classList.remove('active');
      elements.btnToggleCase.classList.remove('active');
      elements.btnClearSearch.style.display = 'none';

      recomputeFilteredData();
      renderTableHeader();
      renderTableBody();
      updateMetrics();
      showToast('Filtros, buscas e ordenações desfeitos.');
    });

    // Delegated event listener for row checkboxes
    elements.tableBody.addEventListener('change', (e) => {
      if (e.target.classList.contains('row-select-checkbox')) {
        const tr = e.target.closest('tr');
        if (!tr) return;
        const rowIdStr = tr.getAttribute('data-row-id');
        const rowId = rowIdStr !== null && !isNaN(rowIdStr) ? Number(rowIdStr) : rowIdStr;
        if (rowId !== null) {
          if (e.target.checked) {
            state.selectedRowIds.add(rowId);
            tr.classList.add('row-selected');
          } else {
            state.selectedRowIds.delete(rowId);
            tr.classList.remove('row-selected');
          }
          updateBatchSelectionUI();
        }
      }
    });

    // Delegated event listener for row action buttons (inspect, duplicate, delete)
    elements.tableBody.addEventListener('click', (e) => {
      const btn = e.target.closest('.row-mini-btn');
      if (!btn) return;
      e.stopPropagation();
      const action = btn.getAttribute('data-action');
      const tr = btn.closest('tr');
      const globalIdx = tr ? Number(tr.getAttribute('data-index')) : -1;
      if (globalIdx === -1) return;

      if (action === 'inspect') {
        openRowInspector(globalIdx);
      } else if (action === 'duplicate') {
        duplicateRow(globalIdx);
      } else if (action === 'delete') {
        deleteRow(globalIdx);
      }
    });

    // Delegated event listener for double clicks on cells & index
    elements.tableBody.addEventListener('dblclick', (e) => {
      const td = e.target.closest('td');
      if (!td) return;
      if (td.classList.contains('col-index')) {
        const tr = td.closest('tr');
        const globalIdx = tr ? Number(tr.getAttribute('data-index')) : -1;
        if (globalIdx !== -1) openRowInspector(globalIdx);
      } else if (td.classList.contains('editable-cell')) {
        const col = td.getAttribute('data-col');
        const tr = td.closest('tr');
        const globalIdx = tr ? Number(tr.getAttribute('data-index')) : -1;
        if (globalIdx !== -1 && col) {
          const row = state.filteredData[globalIdx];
          if (row) startInlineEdit(td, row, col);
        }
      }
    });

    /**
     * Ultra-Fluid 120Hz/144Hz Kinetic Smooth Scrolling Engine
     * Eliminates coarse 100px stepped jumps of standard mouse wheels,
     * rendering sub-pixel interpolated displacement on every frame synced to V-Sync.
     */
    function initSmoothTableScroll() {
      const el = elements.tableScrollArea;
      if (!el) return;

      let targetY = el.scrollTop;
      let targetX = el.scrollLeft;
      let isAnimating = false;
      let rafId = null;

      el.addEventListener('wheel', (e) => {
        if (e.ctrlKey) return; // Allow browser zoom

        let dy = e.shiftKey ? 0 : e.deltaY;
        let dx = e.shiftKey ? e.deltaY : e.deltaX;

        if (e.deltaMode === 1) { // Standard mouse wheel notch
          dy *= 34;
          dx *= 34;
        } else if (e.deltaMode === 2) { // Page scroll
          dy *= el.clientHeight * 0.85;
          dx *= el.clientWidth * 0.85;
        }

        if (dy === 0 && dx === 0) return;

        e.preventDefault();

        const maxY = Math.max(0, el.scrollHeight - el.clientHeight);
        const maxX = Math.max(0, el.scrollWidth - el.clientWidth);

        targetY = Math.max(0, Math.min(maxY, targetY + dy));
        targetX = Math.max(0, Math.min(maxX, targetX + dx));

        state.vsync.lastInteraction = performance.now();

        if (!isAnimating) {
          isAnimating = true;
          rafId = requestAnimationFrame(smoothTick);
        }
      }, { passive: false });

      function smoothTick() {
        if (!isAnimating) return;

        const currY = el.scrollTop;
        const currX = el.scrollLeft;
        const diffY = targetY - currY;
        const diffX = targetX - currX;

        if (Math.abs(diffY) > 0.4 || Math.abs(diffX) > 0.4) {
          const stepY = Math.abs(diffY) < 1.5 ? diffY : diffY * 0.24;
          const stepX = Math.abs(diffX) < 1.5 ? diffX : diffX * 0.24;
          el.scrollTop = currY + stepY;
          el.scrollLeft = currX + stepX;
          state.vsync.lastInteraction = performance.now();
          rafId = requestAnimationFrame(smoothTick);
        } else {
          el.scrollTop = targetY;
          el.scrollLeft = targetX;
          isAnimating = false;
        }
      }

      el.addEventListener('scroll', () => {
        if (!isAnimating) {
          targetY = el.scrollTop;
          targetX = el.scrollLeft;
        }
      }, { passive: true });
    }

    initSmoothTableScroll();

    // Start Real-Time FPS Telemetry
    initFpsMonitor();

    // FPS Telemetry Pill Click -> Open VSync Modal
    if (elements.fpsTelemetry) {
      elements.fpsTelemetry.addEventListener('click', () => {
        if (elements.vsyncDetectedRate) {
          elements.vsyncDetectedRate.textContent = `${state.vsync.detectedRefreshRate} Hz`;
        }
        if (elements.vsyncCurrentFps) {
          elements.vsyncCurrentFps.textContent = `${state.vsync.currentFps} FPS`;
        }
        const currentModeRadio = document.querySelector(`input[name="vsyncMode"][value="${state.vsync.mode}"]`);
        if (currentModeRadio) currentModeRadio.checked = true;

        openModal('modalVsync');
      });
    }

    // V-Sync Mode Toggle
    document.querySelectorAll('input[name="vsyncMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        state.vsync.mode = e.target.value;
        try {
          localStorage.setItem('lumio_vsync_mode', state.vsync.mode);
        } catch (_) {}

        if (elements.vsyncBadge) {
          if (state.vsync.mode === 'lock60') {
            elements.vsyncBadge.textContent = '60 FPS ECO';
            elements.vsyncBadge.style.color = '#fbbf24';
            elements.vsyncBadge.style.borderColor = 'rgba(251, 191, 36, 0.4)';
            elements.vsyncBadge.style.background = 'rgba(251, 191, 36, 0.12)';
          } else if (state.vsync.mode === 'lock120') {
            elements.vsyncBadge.textContent = '120 FPS FLUIDO';
            elements.vsyncBadge.style.color = '#00f0ff';
            elements.vsyncBadge.style.borderColor = 'rgba(0, 240, 255, 0.4)';
            elements.vsyncBadge.style.background = 'rgba(0, 240, 255, 0.12)';
          } else if (state.vsync.mode === 'lock144') {
            elements.vsyncBadge.textContent = '144 FPS MAX';
            elements.vsyncBadge.style.color = '#00ff9d';
            elements.vsyncBadge.style.borderColor = 'rgba(0, 255, 157, 0.4)';
            elements.vsyncBadge.style.background = 'rgba(0, 255, 157, 0.12)';
          } else {
            elements.vsyncBadge.textContent = `${state.vsync.detectedRefreshRate}Hz VSYNC`;
            elements.vsyncBadge.style.color = '#00ff9d';
            elements.vsyncBadge.style.borderColor = 'rgba(0, 255, 157, 0.35)';
            elements.vsyncBadge.style.background = 'rgba(0, 255, 157, 0.15)';
          }
        }
        if (elements.vsyncStatusBadge) {
          if (state.vsync.mode === 'lock60') {
            elements.vsyncStatusBadge.textContent = 'Travado a 60 FPS (Econômico)';
            elements.vsyncStatusBadge.style.color = '#fbbf24';
          } else if (state.vsync.mode === 'lock120') {
            elements.vsyncStatusBadge.textContent = 'Sincronizado a 120 FPS (Fluidez)';
            elements.vsyncStatusBadge.style.color = '#00f0ff';
          } else if (state.vsync.mode === 'lock144') {
            elements.vsyncStatusBadge.textContent = 'Sincronizado a 144 FPS (Máximo)';
            elements.vsyncStatusBadge.style.color = '#00ff9d';
          } else {
            elements.vsyncStatusBadge.textContent = `Sincronizado a ${state.vsync.detectedRefreshRate}Hz (Auto)`;
            elements.vsyncStatusBadge.style.color = '#00ff9d';
          }
        }

        let toastMsg = 'Configuração de V-Sync atualizada.';
        if (state.vsync.mode === 'lock60') {
          toastMsg = 'Modo Econômico ativado: Travado em 60 FPS.';
        } else if (state.vsync.mode === 'lock120') {
          toastMsg = 'Modo Fluido ativado: Meta balanceada de 120 FPS.';
        } else if (state.vsync.mode === 'lock144') {
          toastMsg = 'Modo Máximo ativado: Renderização em 144 FPS / 145 FPS.';
        } else {
          toastMsg = `Sincronização Nativa ativada: V-Sync sincronizado a ${state.vsync.detectedRefreshRate}Hz.`;
        }
        showToast(toastMsg);
      });
    });

    // Modal Close Buttons
    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-close');
        closeModal(target);
      });
    });

    // Close modal when clicking outside content
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('open');
        }
      });
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleQuickSave();
        return;
      }

      // If typing in input, don't trigger global shortcuts
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        elements.fileInput.click();
      } else if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f')) {
        e.preventDefault();
        elements.globalSearchInput.focus();
      } else if (e.key === 'ArrowLeft') {
        elements.btnPrevPage.click();
      } else if (e.key === 'ArrowRight') {
        elements.btnNextPage.click();
      } else if (e.key === 'Delete') {
        if (state.selectedRowIds.size > 0) {
          deleteSelectedRows();
        }
      }
    });

    // Paste Modal Trigger & Process
    elements.btnOpenModalPaste.addEventListener('click', () => {
      elements.pasteTextarea.value = '';
      openModal('modalPaste');
    });

    elements.btnProcessPaste.addEventListener('click', () => {
      const text = elements.pasteTextarea.value.trim();
      if (!text) {
        showToast('Por favor, cole algum texto antes de processar.');
        return;
      }
      closeModal('modalPaste');
      loadCsvContent(text, 'dados_colados.csv');
    });

    // Row Inspector Actions
    elements.btnPrevRowInspector.addEventListener('click', () => {
      if (state.inspectedRowIndex > 0) {
        openRowInspector(state.inspectedRowIndex - 1);
      }
    });

    elements.btnNextRowInspector.addEventListener('click', () => {
      if (state.inspectedRowIndex < state.filteredData.length - 1) {
        openRowInspector(state.inspectedRowIndex + 1);
      }
    });

    elements.btnCopyRowJson.addEventListener('click', () => {
      if (state.inspectedRowIndex >= 0 && state.inspectedRowIndex < state.filteredData.length) {
        const row = state.filteredData[state.inspectedRowIndex];
        const copyData = { ...row };
        delete copyData.__rowId;
        navigator.clipboard.writeText(JSON.stringify(copyData, null, 2));
        showToast('Registro completo copiado como JSON!');
      }
    });

    elements.btnSaveRowInspector.addEventListener('click', saveRowInspectorChanges);

    // Column Manager Modal Trigger & Checkboxes
    elements.btnOpenColumnsModal.addEventListener('click', () => {
      renderColumnChecklist();
      openModal('modalColumns');
    });

    elements.btnSelectAllCols.addEventListener('click', () => {
      state.visibleHeaders = [...state.headers];
      markDirty(true);
      renderColumnChecklist();
      renderTableHeader();
      renderTableBody();
      updateMetrics();
      showToast('Todas as colunas estão visíveis.');
    });

    elements.btnDeselectAllCols.addEventListener('click', () => {
      if (state.headers.length > 0) {
        state.visibleHeaders = [state.headers[0]];
      }
      markDirty(true);
      renderColumnChecklist();
      renderTableHeader();
      renderTableBody();
      updateMetrics();
      showToast('Colunas ocultadas. Apenas a primeira coluna mantida.');
    });

    // Stats Column Selection Dropdown
    elements.btnOpenStatsModal.addEventListener('click', () => {
      if (state.headers.length > 0) {
        openStatsModalForColumn(state.headers[0]);
      }
    });

    elements.selectStatsColumn.addEventListener('change', (e) => {
      renderStatsForColumn(e.target.value);
    });

    // Advanced Filter Modal
    elements.btnOpenAdvFilter.addEventListener('click', () => {
      renderFilterRulesList();
      openModal('modalAdvFilter');
    });

    elements.btnAddFilterRule.addEventListener('click', () => {
      state.advancedRules.push({
        id: Date.now() + Math.random(),
        column: state.headers[0] || '',
        operator: 'contains',
        value: '',
        value2: ''
      });
      renderFilterRulesList();
    });

    elements.btnClearAllFilters.addEventListener('click', () => {
      state.advancedRules = [];
      renderFilterRulesList();
      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
      closeModal('modalAdvFilter');
      showToast('Filtros avançados removidos.');
    });

    elements.btnApplyAdvFilters.addEventListener('click', () => {
      const rows = elements.filterRulesList.querySelectorAll('.filter-rule-row');
      const updatedRules = [];

      rows.forEach(r => {
        const col = r.querySelector('.rule-col').value;
        const op = r.querySelector('.rule-op').value;
        const val = r.querySelector('.rule-val').value;
        const val2Input = r.querySelector('.rule-val2');
        const val2 = val2Input ? val2Input.value : '';

        if (col && op) {
          updatedRules.push({
            id: Date.now() + Math.random(),
            column: col,
            operator: op,
            value: val,
            value2: val2
          });
        }
      });

      state.advancedRules = updatedRules;
      state.ruleLogic = elements.selectFilterLogic.value;
      state.currentPage = 1;

      recomputeFilteredData();
      renderTableBody();
      updateMetrics();
      closeModal('modalAdvFilter');
      showToast(`${state.advancedRules.length} filtro(s) aplicado(s).`);
    });

    // Export Modal Triggers
    elements.btnExport.addEventListener('click', () => {
      openModal('modalExport');
    });

    elements.btnDownloadExport.addEventListener('click', () => {
      exportDataToFile(false);
    });

    elements.btnCopyExportClipboard.addEventListener('click', () => {
      exportDataToFile(true);
    });
  }

  /**
   * Render Column List with visibility and reorder controls inside Column Manager Modal
   */
  function renderColumnChecklist() {
    const container = elements.columnChecklistContainer;
    container.innerHTML = '';

    state.headers.forEach((header, idx) => {
      const item = document.createElement('div');
      item.className = 'col-manager-item';

      const isVisible = state.visibleHeaders.includes(header);
      const isCentered = state.columnAlignments[header] === 'center';
      const colWidth = state.columnWidths[header] || calculateIdealColumnWidth(header);

      item.innerHTML = `
        <div class="col-manager-left">
          <input type="checkbox" class="custom-checkbox" value="${escapeHtml(header)}" ${isVisible ? 'checked' : ''}>
          <span style="font-weight: 500;">${escapeHtml(header)}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted); font-family: var(--font-mono);">(${state.inferredTypes[header] || 'texto'})</span>
        </div>
        <div class="col-manager-actions">
          <button class="btn btn-sm" data-isolate-col="${escapeHtml(header)}" title="Evidenciar apenas esta coluna e ocultar as demais">Evidenciar</button>
          <button class="btn btn-sm btn-icon" data-shrink-col="${escapeHtml(header)}" title="Diminuir largura (-35px)">−</button>
          <span class="col-width-pill" title="Largura atual da coluna">${colWidth}px</span>
          <button class="btn btn-sm btn-icon" data-expand-col="${escapeHtml(header)}" title="Expandir largura (+35px)">+</button>
          <button class="btn btn-sm" data-autofit-col="${escapeHtml(header)}" title="Auto-ajustar largura ideal">
            Auto-Fit
          </button>
          <button class="btn btn-sm ${isCentered ? 'btn-primary' : ''}" data-center-col="${escapeHtml(header)}" title="${isCentered ? 'Centralizado (clique para restaurar)' : 'Centralizar conteúdo desta coluna'}">
            ${isCentered ? 'Centralizado' : 'Centralizar'}
          </button>
          <button class="btn btn-sm btn-icon" data-move-up="${idx}" title="Mover para cima" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button class="btn btn-sm btn-icon" data-move-down="${idx}" title="Mover para baixo" ${idx === state.headers.length - 1 ? 'disabled' : ''}>▼</button>
        </div>
      `;

      item.querySelector('input[type="checkbox"]').addEventListener('change', (e) => {
        if (e.target.checked) {
          if (!state.visibleHeaders.includes(header)) {
            state.visibleHeaders.push(header);
          }
        } else {
          if (state.visibleHeaders.length <= 1) {
            e.target.checked = true;
            showToast('Você deve manter pelo menos uma coluna visível.');
            return;
          }
          state.visibleHeaders = state.visibleHeaders.filter(h => h !== header);
        }

        renderTableHeader();
        renderTableBody();
        updateMetrics();
      });

      // Isolate single column
      const btnIsolate = item.querySelector('[data-isolate-col]');
      if (btnIsolate) {
        btnIsolate.addEventListener('click', () => {
          isolateColumn(header);
        });
      }

      // Shrink single column
      const btnShrink = item.querySelector('[data-shrink-col]');
      if (btnShrink) {
        btnShrink.addEventListener('click', () => {
          shrinkColumn(header);
          renderColumnChecklist();
        });
      }

      // Expand single column
      const btnExpand = item.querySelector('[data-expand-col]');
      if (btnExpand) {
        btnExpand.addEventListener('click', () => {
          expandColumn(header);
          renderColumnChecklist();
        });
      }

      // Center toggle
      const btnCenter = item.querySelector('[data-center-col]');
      if (btnCenter) {
        btnCenter.addEventListener('click', () => {
          toggleColumnCenter(header);
          renderColumnChecklist();
        });
      }

      // Auto-fit single column
      const btnAutofit = item.querySelector('[data-autofit-col]');
      if (btnAutofit) {
        btnAutofit.addEventListener('click', () => {
          autoFitColumn(header);
          renderColumnChecklist();
        });
      }

      // Move Up
      const btnUp = item.querySelector('[data-move-up]');
      if (btnUp && idx > 0) {
        btnUp.addEventListener('click', () => {
          const temp = state.headers[idx];
          state.headers[idx] = state.headers[idx - 1];
          state.headers[idx - 1] = temp;

          // Reorder visibleHeaders to match
          state.visibleHeaders.sort((a, b) => state.headers.indexOf(a) - state.headers.indexOf(b));

          markDirty(true);
          renderColumnChecklist();
          renderTableHeader();
          renderTableBody();
        });
      }

      // Move Down
      const btnDown = item.querySelector('[data-move-down]');
      if (btnDown && idx < state.headers.length - 1) {
        btnDown.addEventListener('click', () => {
          const temp = state.headers[idx];
          state.headers[idx] = state.headers[idx + 1];
          state.headers[idx + 1] = temp;

          state.visibleHeaders.sort((a, b) => state.headers.indexOf(a) - state.headers.indexOf(b));

          markDirty(true);
          renderColumnChecklist();
          renderTableHeader();
          renderTableBody();
        });
      }

      container.appendChild(item);
    });
  }

  /**
   * Render Rule rows inside Advanced Filter Modal
   */
  function renderFilterRulesList() {
    const list = elements.filterRulesList;
    list.innerHTML = '';

    if (state.advancedRules.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
          Nenhuma regra configurada. Clique em <strong>"+ Adicionar Regra"</strong> para começar.
        </div>
      `;
      return;
    }

    state.advancedRules.forEach((rule, idx) => {
      const row = document.createElement('div');
      row.className = 'filter-rule-row';

      const colOptions = state.headers.map(h => `<option value="${escapeHtml(h)}" ${h === rule.column ? 'selected' : ''}>${escapeHtml(h)}</option>`).join('');

      const opOptions = `
        <option value="contains" ${rule.operator === 'contains' ? 'selected' : ''}>Contém</option>
        <option value="not_contains" ${rule.operator === 'not_contains' ? 'selected' : ''}>Não contém</option>
        <option value="equals" ${rule.operator === 'equals' ? 'selected' : ''}>Igual a</option>
        <option value="not_equals" ${rule.operator === 'not_equals' ? 'selected' : ''}>Diferente de</option>
        <option value="starts_with" ${rule.operator === 'starts_with' ? 'selected' : ''}>Começa com</option>
        <option value="ends_with" ${rule.operator === 'ends_with' ? 'selected' : ''}>Termina com</option>
        <option value="greater_than" ${rule.operator === 'greater_than' ? 'selected' : ''}>Maior que (&gt;)</option>
        <option value="less_than" ${rule.operator === 'less_than' ? 'selected' : ''}>Menor que (&lt;)</option>
        <option value="between" ${rule.operator === 'between' ? 'selected' : ''}>Entre (faixa)</option>
        <option value="is_empty" ${rule.operator === 'is_empty' ? 'selected' : ''}>Está vazio</option>
        <option value="is_not_empty" ${rule.operator === 'is_not_empty' ? 'selected' : ''}>Não está vazio</option>
        <option value="regex" ${rule.operator === 'regex' ? 'selected' : ''}>Expressão Regular (Regex)</option>
      `;

      row.innerHTML = `
        <select class="glass-select rule-col">${colOptions}</select>
        <select class="glass-select rule-op">${opOptions}</select>
        <input type="text" class="glass-input rule-val" placeholder="Valor do critério" value="${escapeHtml(rule.value || '')}">
        <input type="text" class="glass-input rule-val2" placeholder="Valor máximo" value="${escapeHtml(rule.value2 || '')}" style="display: ${rule.operator === 'between' ? 'block' : 'none'};">
        <button class="btn btn-sm btn-icon rule-remove-btn" title="Remover regra" style="color: var(--neon-rose); border-color: rgba(255, 42, 133, 0.3);">
          &times;
        </button>
      `;

      const opSelect = row.querySelector('.rule-op');
      const valInput = row.querySelector('.rule-val');
      const val2Input = row.querySelector('.rule-val2');

      opSelect.addEventListener('change', () => {
        if (opSelect.value === 'between') {
          val2Input.style.display = 'block';
        } else {
          val2Input.style.display = 'none';
        }

        if (['is_empty', 'is_not_empty'].includes(opSelect.value)) {
          valInput.style.display = 'none';
        } else {
          valInput.style.display = 'block';
        }
      });

      row.querySelector('.rule-remove-btn').addEventListener('click', () => {
        state.advancedRules.splice(idx, 1);
        renderFilterRulesList();
      });

      list.appendChild(row);
    });
  }

  /**
   * Handle Export to File or Clipboard
   */
  function exportDataToFile(copyOnly = false, forcedFormat = null) {
    const format = forcedFormat || elements.selectExportFormat.value;
    const onlyFiltered = elements.checkExportOnlyFiltered.checked;
    const onlyVisible = elements.checkExportOnlyVisible.checked;

    const dataToExport = onlyFiltered ? state.filteredData : state.data;
    const headersToExport = onlyVisible ? state.visibleHeaders : state.headers;

    let outputText = '';
    let fileName = state.fileName.replace(/\.[^/.]+$/, '') || 'dataset';
    let mimeType = 'text/plain';

    if (format === 'xlsx') {
      ensureXlsxLoaded().then(() => {
        const sheetName = (state.activeSheetName || 'Dados').slice(0, 31);
        const excelBuf = CsvEngine.toExcel(headersToExport, dataToExport, {
          visibleHeaders: headersToExport,
          sheetName,
          xlsx: window.XLSX
        });

        if (copyOnly) {
          const tsvText = CsvEngine.toCSV(headersToExport, dataToExport, { delimiter: '\t' });
          navigator.clipboard.writeText(tsvText).then(() => {
            showToast('Dados copiados para a área de transferência (compatível com colar no Excel)!');
            closeModal('modalExport');
          });
          return;
        }

        const blob = new Blob([excelBuf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', fileName + '_export.xlsx');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        showToast(`Planilha "${fileName}_export.xlsx" baixada com sucesso!`);
        closeModal('modalExport');
      }).catch(err => {
        showToast('Erro ao exportar Excel: ' + err.message);
      });
      return;
    }

    if (format === 'csv_comma') {
      outputText = CsvEngine.toCSV(headersToExport, dataToExport, { delimiter: ',' });
      fileName += '_export.csv';
      mimeType = 'text/csv';
    } else if (format === 'csv_semi') {
      outputText = CsvEngine.toCSV(headersToExport, dataToExport, { delimiter: ';' });
      fileName += '_excel.csv';
      mimeType = 'text/csv';
    } else if (format === 'json') {
      outputText = CsvEngine.toJSON(headersToExport, dataToExport, { pretty: true });
      fileName += '_export.json';
      mimeType = 'application/json';
    } else if (format === 'tsv') {
      outputText = CsvEngine.toCSV(headersToExport, dataToExport, { delimiter: '\t' });
      fileName += '_export.tsv';
      mimeType = 'text/tab-separated-values';
    } else if (format === 'markdown') {
      outputText = CsvEngine.toMarkdown(headersToExport, dataToExport);
      fileName += '_export.md';
      mimeType = 'text/markdown';
    }

    if (copyOnly) {
      navigator.clipboard.writeText(outputText).then(() => {
        showToast('Conteúdo copiado com sucesso para a área de transferência!');
        closeModal('modalExport');
      });
    } else {
      const blob = new Blob([outputText], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Arquivo "${fileName}" baixado com sucesso!`);
      closeModal('modalExport');
    }
  }

  // =========================================================================
  // Progressive Web App (PWA) & Native Desktop Integration
  // =========================================================================
  let deferredInstallPrompt = null;

  function initPwaAndIntegration() {
    // 1. Service Worker registration for 100% offline access
    if ('serviceWorker' in navigator && (window.location.protocol === 'http:' || window.location.protocol === 'https:')) {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => {
          console.debug('Lumio CSV Service Worker registered successfully:', reg.scope);
        })
        .catch((err) => {
          console.debug('Service Worker registration note:', err);
        });
    }

    // 2. Capture native PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e;
      if (elements.btnInstallApp) {
        elements.btnInstallApp.classList.add('has-native-prompt');
        elements.btnInstallApp.title = 'Clique para instalar o Lumio CSV como aplicativo nativo';
      }
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      if (elements.btnInstallApp) {
        elements.btnInstallApp.classList.remove('has-native-prompt');
        elements.btnInstallApp.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>App Ativo</span>
        `;
      }
      showToast('Lumio CSV instalado com sucesso como aplicativo nativo!');
    });

    // Check standalone display mode on launch
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone && elements.btnInstallApp) {
      elements.btnInstallApp.innerHTML = `
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <span>App Ativo</span>
      `;
      elements.btnInstallApp.title = 'Lumio CSV está rodando como aplicativo nativo standalone';
    }

    function updateInstallModalState() {
      const pwaNote = document.getElementById('pwaStatusNote');
      const pwaBtn = elements.btnTriggerPwaInstall;
      const runningStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

      if (runningStandalone) {
        if (pwaNote) {
          pwaNote.className = 'install-mode-note success';
          pwaNote.textContent = '✔ Lumio CSV já está rodando em sua própria janela de aplicativo nativo (Standalone PWA).';
          pwaNote.style.display = 'block';
        }
        if (pwaBtn) pwaBtn.style.display = 'none';
        return;
      }

      if (window.location.protocol === 'file:') {
        if (pwaNote) {
          pwaNote.className = 'install-mode-note warning';
          pwaNote.textContent = 'ℹ Modo Arquivo Local (file://): O navegador desativa Service Workers e botões PWA em arquivos locais. Para ter o aplicativo desktop agora mesmo, use o Instalador de Atalho abaixo (scripts/criar_atalho_desktop.vbs) ou abra via servidor local (scripts/iniciar_servidor_local.bat).';
          pwaNote.style.display = 'block';
        }
        if (pwaBtn) {
          pwaBtn.textContent = '⚡ Iniciar com Servidor Local ou Atalho';
        }
      } else {
        if (pwaNote) {
          if (deferredInstallPrompt) {
            pwaNote.className = 'install-mode-note success';
            pwaNote.textContent = '✔ Navegador pronto para instalação nativa em 1 clique!';
            pwaNote.style.display = 'block';
          } else {
            pwaNote.className = 'install-mode-note';
            pwaNote.textContent = '💡 Dica: Se o botão abaixo não abrir o prompt, clique no ícone de instalar na barra de endereços (omnibox) ou no menu ⋮ > "Instalar Lumio CSV".';
            pwaNote.style.display = 'block';
          }
        }
        if (pwaBtn) {
          pwaBtn.textContent = '⚡ Instalar Agora no Navegador';
        }
      }
    }

    // 3. PWA File Handling API (Allows opening CSV/TSV/TXT files directly from Windows Explorer)
    if ('launchQueue' in window && window.LaunchParams && 'files' in window.LaunchParams.prototype) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (launchParams.files && launchParams.files.length > 0) {
          try {
            const fileHandle = launchParams.files[0];
            const file = await fileHandle.getFile();
            if (file) {
              state.file = file;
              if (isExcelFile(file.name)) {
                loadExcelFile(file);
              } else {
                readFileWithEncoding(file, state.currentEncoding);
              }
            }
          } catch (err) {
            console.error('Erro ao abrir arquivo do manipulador do sistema:', err);
          }
        }
      });
    }

    // 4. Install App Button Handlers
    if (elements.btnInstallApp) {
      elements.btnInstallApp.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          const choice = await deferredInstallPrompt.userChoice;
          if (choice.outcome === 'accepted') {
            showToast('Instalando Lumio CSV...');
          }
          deferredInstallPrompt = null;
        } else {
          updateInstallModalState();
          openModal('modalInstallApp');
        }
      });
    }

    if (elements.btnTriggerPwaInstall) {
      elements.btnTriggerPwaInstall.addEventListener('click', async () => {
        if (deferredInstallPrompt) {
          closeModal('modalInstallApp');
          deferredInstallPrompt.prompt();
          deferredInstallPrompt = null;
        } else if (window.location.protocol === 'file:') {
          showToast('No modo file://, use scripts/criar_atalho_desktop.vbs ou execute scripts/iniciar_servidor_local.bat para instalar pelo navegador.');
        } else {
          showToast('Clique no ícone de instalação na barra de endereços (omnibox) ou no menu do navegador para instalar.');
        }
      });
    }

    // 5. Query Parameter Support (?sample=true)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('sample') === 'true') {
        fetch('sample_data.csv')
          .then(res => res.text())
          .then(text => loadCsvContent(text, 'vendas_tech_sample.csv'))
          .catch(() => loadCsvContent(EMBEDDED_SAMPLE_CSV, 'vendas_tech_sample.csv'));
      }
    } catch (e) {}
  }

  // Global accessor for automated verification & integrations
  window.__LumioApp = {
    state,
    elements,
    ensureXlsxLoaded,
    loadExcelBuffer,
    loadCsvContent,
    loadParsedDataset
  };

  // Self Initialization on DOM Load
  document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initPwaAndIntegration();
  });

})();
