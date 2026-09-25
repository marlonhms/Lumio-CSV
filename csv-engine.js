/**
 * Lumio CSV Engine
 * High-performance RFC-4180 compliant CSV Parser, Delimiter Sniffer,
 * Smart Filter Engine, Data Profiler, and Exporter.
 * Works seamlessly in Browser and Node.js environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CsvEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Available delimiters for auto-sniffing
  const CANDIDATE_DELIMITERS = [',', ';', '\t', '|'];

  /**
   * Intelligently repair Mojibake (e.g. UTF-8 misinterpreted as Latin1)
   * and broken replacement characters (\uFFFD / ) for clean textualization
   */
  function cleanText(text) {
    if (!text || typeof text !== 'string') return text;

    let cleaned = text;

    // 1. Repair Mojibake (UTF-8 bytes misread as Latin1 / Windows-1252)
    if (/[\u00c2\u00c3]/.test(cleaned)) {
      try {
        const bytes = new Uint8Array([...cleaned].map(c => c.charCodeAt(0) & 0xff));
        const attempt = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
        if (!/[\u00c2\u00c3]/.test(attempt) || attempt.length < cleaned.length) {
          cleaned = attempt;
        }
      } catch (e) {
        // Safe Portuguese specific substitution fallback if binary decode failed on mixed text
        cleaned = cleaned
          .replace(/Ã£/g, 'ã').replace(/Ã§/g, 'ç').replace(/Ã¡/g, 'á')
          .replace(/Ã©/g, 'é').replace(/Ã­/g, 'í').replace(/Ã³/g, 'ó')
          .replace(/Ãº/g, 'ú').replace(/Ã¢/g, 'â').replace(/Ãª/g, 'ê')
          .replace(/Ã´/g, 'ô').replace(/Ãµ/g, 'õ').replace(/Ã /g, 'à')
          .replace(/Ãƒ/g, 'Ã').replace(/Ã‡/g, 'Ç').replace(/Ã/g, 'Á')
          .replace(/Ã‰/g, 'É').replace(/Ã/g, 'Í').replace(/Ã“/g, 'Ó')
          .replace(/Ãš/g, 'Ú').replace(/Ã‚/g, 'Â').replace(/ÃŠ/g, 'Ê')
          .replace(/Ã”/g, 'Ô').replace(/Ã•/g, 'Õ').replace(/Ã€/g, 'À')
          .replace(/Âº/g, 'º').replace(/Âª/g, 'ª').replace(/Â°/g, '°');
      }
    }

    // 2. Repair damaged replacement characters (\uFFFD) for common Brazilian Portuguese patterns
    if (cleaned.includes('\ufffd')) {
      cleaned = cleaned
        .replace(/(^|[;,\t\r\n"'\s])N\ufffdO([;,\t\r\n"'\s]|$)/g, '$1NÃO$2')
        .replace(/(^|[;,\t\r\n"'\s])n\ufffdo([;,\t\r\n"'\s]|$)/g, '$1não$2')
        .replace(/(^|[;,\t\r\n"'\s])N\ufffdo([;,\t\r\n"'\s]|$)/g, '$1Não$2')
        .replace(/(^|[;,\t\r\n"'\s])N\ufffd([;,\t\r\n"'\s]|$)/g, '$1NÃO$2')
        .replace(/(^|[;,\t\r\n"'\s])n\ufffd([;,\t\r\n"'\s]|$)/g, '$1não$2')
        .replace(/\bN\ufffdO\b/g, 'NÃO')
        .replace(/\bn\ufffdo\b/g, 'não')
        .replace(/\bN\ufffdo\b/g, 'Não')
        .replace(/\bPRE\ufffdO\b/g, 'PREÇO')
        .replace(/\bPre\ufffdo\b/g, 'Preço')
        .replace(/\bpre\ufffdo\b/g, 'preço')
        .replace(/\bSITUA\ufffd\ufffdO\b/gi, (m) => m === m.toUpperCase() ? 'SITUAÇÃO' : 'Situação')
        .replace(/\bDESCRI\ufffd\ufffdO\b/gi, (m) => m === m.toUpperCase() ? 'DESCRIÇÃO' : 'Descrição')
        .replace(/\bINFORMA\ufffd\ufffdO\b/gi, (m) => m === m.toUpperCase() ? 'INFORMAÇÃO' : 'Informação')
        .replace(/\bATEN\ufffd\ufffdO\b/gi, (m) => m === m.toUpperCase() ? 'ATENÇÃO' : 'Atenção')
        .replace(/\bCONCLU\ufffdDO\b/gi, (m) => m === m.toUpperCase() ? 'CONCLUÍDO' : 'Concluído')
        .replace(/\bP\ufffdGINA\b/gi, (m) => m === m.toUpperCase() ? 'PÁGINA' : 'Página')
        .replace(/\bM\ufffdS\b/gi, (m) => m === m.toUpperCase() ? 'MÊS' : 'Mês');
    }

    return cleaned;
  }

  /**
   * Automatically detect encoding from buffer and decode into clean string
   */
  function detectAndDecodeBuffer(inputBuffer, preferredEncoding = 'auto') {
    if (!inputBuffer) return { text: '', encoding: 'utf-8' };

    let bytes;
    if (inputBuffer instanceof Uint8Array || (inputBuffer.buffer && inputBuffer.byteOffset !== undefined)) {
      bytes = new Uint8Array(inputBuffer.buffer, inputBuffer.byteOffset, inputBuffer.byteLength);
    } else {
      bytes = new Uint8Array(inputBuffer);
    }

    // 1. Check Byte Order Marks (BOM)
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      const decoder = new TextDecoder('utf-8');
      return { text: cleanText(decoder.decode(bytes)), encoding: 'utf-8' };
    }
    if (bytes.length >= 2 && bytes[0] === 0xFF && bytes[1] === 0xFE) {
      const decoder = new TextDecoder('utf-16le');
      return { text: cleanText(decoder.decode(bytes)), encoding: 'utf-16le' };
    }
    if (bytes.length >= 2 && bytes[0] === 0xFE && bytes[1] === 0xFF) {
      const decoder = new TextDecoder('utf-16be');
      return { text: cleanText(decoder.decode(bytes)), encoding: 'utf-16be' };
    }

    // 2. User explicitly requested a specific encoding (not 'auto')
    if (preferredEncoding && preferredEncoding !== 'auto') {
      try {
        const decoder = new TextDecoder(preferredEncoding);
        return { text: cleanText(decoder.decode(bytes)), encoding: preferredEncoding };
      } catch (e) {
        // Fallback to auto
      }
    }

    // 3. Strict UTF-8 trial
    try {
      const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
      const decodedUtf8 = utf8Decoder.decode(bytes);
      return { text: cleanText(decodedUtf8), encoding: 'utf-8' };
    } catch (errUtf8) {
      // Strict UTF-8 failed: invalid byte sequences for UTF-8 (e.g. 0xC3 followed by 0x4F as in NÃO)
      // Decode with Windows-1252 (covers standard Windows ANSI, ISO-8859-1, Latin-1)
      try {
        const winDecoder = new TextDecoder('windows-1252');
        const decodedWin = winDecoder.decode(bytes);
        return { text: cleanText(decodedWin), encoding: 'windows-1252' };
      } catch (errWin) {
        const fallbackDecoder = new TextDecoder('utf-8');
        return { text: cleanText(fallbackDecoder.decode(bytes)), encoding: 'utf-8' };
      }
    }
  }

  /**
   * Sniff the most likely delimiter from CSV text
   * Uses frequency consistency across lines outside quotes
   */
  function sniffDelimiter(text, candidateDelimiters = CANDIDATE_DELIMITERS) {
    if (!text || typeof text !== 'string') return ',';

    // Remove BOM if present
    const noBomText = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const sample = noBomText.slice(0, 32768); // sample first 32KB

    const counts = {};
    candidateDelimiters.forEach(d => { counts[d] = []; });

    let inQuotes = false;
    let fieldStarted = false;
    let currentRowCounts = {};
    candidateDelimiters.forEach(d => { currentRowCounts[d] = 0; });

    let lineCount = 0;
    const maxLines = 25;
    const len = sample.length;

    for (let i = 0; i < len; i++) {
      const char = sample[i];

      // Quote handling: only start quote if at field boundary
      if (!fieldStarted) {
        if (char === ' ' || char === '\t') {
          if (sample[i + 1] === '"') continue;
        }
        fieldStarted = true;
        if (char === '"') {
          inQuotes = true;
          continue;
        }
      }

      if (inQuotes) {
        if (char === '"') {
          if (sample[i + 1] === '"') {
            i++; // escaped quote
          } else {
            inQuotes = false;
          }
        }
        continue;
      }

      // Outside quotes: check newlines
      if (char === '\n' || char === '\r') {
        if (char === '\r' && sample[i + 1] === '\n') {
          i++;
        }
        candidateDelimiters.forEach(d => {
          counts[d].push(currentRowCounts[d]);
          currentRowCounts[d] = 0;
        });
        fieldStarted = false;
        lineCount++;
        if (lineCount >= maxLines) break;
        continue;
      }

      // Check if delimiter
      if (counts[char] !== undefined) {
        currentRowCounts[char]++;
        fieldStarted = false; // Next char begins new field
      }
    }

    // Push last row if text ended without newline
    if (lineCount < maxLines) {
      candidateDelimiters.forEach(d => {
        counts[d].push(currentRowCounts[d]);
      });
    }

    // Score candidates based on:
    // 1. Must appear at least once (> 0)
    // 2. Consistency across rows (low variance in count per line)
    // 3. Higher frequency
    let bestDelimiter = ',';
    let bestScore = -1;

    candidateDelimiters.forEach(d => {
      const rowCounts = counts[d].filter(c => c > 0);
      if (rowCounts.length === 0) return;

      const total = rowCounts.reduce((acc, val) => acc + val, 0);
      const avg = total / rowCounts.length;

      // Calculate variance
      let variance = 0;
      for (const val of rowCounts) {
        variance += Math.pow(val - avg, 2);
      }
      variance /= rowCounts.length;

      const rowsWithPositive = rowCounts.length;
      // Consistency score prioritizing low variance, high row coverage and realistic count
      const consistencyScore = (1 / (1 + variance)) * Math.pow(rowsWithPositive, 1.2) * avg;

      if (consistencyScore > bestScore) {
        bestScore = consistencyScore;
        bestDelimiter = d;
      }
    });

    return bestDelimiter;
  }

  /**
   * Parse RFC 4180 CSV text into structured records
   * Resilient to real-world CSV quirks (unquoted quotes in middle of field, etc.)
   */
  function parse(text, options = {}) {
    const opts = {
      delimiter: options.delimiter || null,
      hasHeader: options.hasHeader !== false,
      trimFields: options.trimFields !== false,
      skipEmptyLines: options.skipEmptyLines !== false,
      dynamicTyping: options.dynamicTyping === true,
      cleanText: options.cleanText !== false,
      ...options
    };

    if (!text || typeof text !== 'string') {
      return {
        headers: [],
        data: [],
        meta: {
          delimiter: ',',
          rowCount: 0,
          columnCount: 0,
          parsedAt: new Date().toISOString()
        }
      };
    }

    // Remove BOM and clean text if requested
    const rawNoBom = text.charCodeAt(0) === 0xFEFF ? text.slice(1) : text;
    const content = opts.cleanText !== false ? cleanText(rawNoBom) : rawNoBom;

    // Auto-detect delimiter if not specified
    const delimiter = opts.delimiter || sniffDelimiter(content);
    const delimChar = delimiter;

    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;
    let fieldStarted = false;
    const len = content.length;

    for (let i = 0; i < len; i++) {
      const char = content[i];

      // Check if entering a quoted field at the start of a field
      if (!fieldStarted) {
        if ((char === ' ' || char === '\t') && opts.trimFields) {
          if (content[i + 1] === '"') continue; // Skip space before opening quote
        }
        fieldStarted = true;
        if (char === '"') {
          inQuotes = true;
          continue;
        }
      }

      if (inQuotes) {
        if (char === '"') {
          if (content[i + 1] === '"') {
            currentField += '"';
            i++; // skip escaped quote
          } else {
            // Closing quote for this field
            inQuotes = false;
          }
        } else {
          currentField += char;
        }
        continue;
      }

      // Outside of quotes
      if (char === delimChar) {
        const val = opts.trimFields ? currentField.trim() : currentField;
        currentRow.push(opts.dynamicTyping ? castValue(val) : val);
        currentField = '';
        fieldStarted = false;
        continue;
      }

      if (char === '\n' || char === '\r') {
        if (char === '\r' && content[i + 1] === '\n') {
          i++; // Skip \r\n
        }
        const val = opts.trimFields ? currentField.trim() : currentField;
        currentRow.push(opts.dynamicTyping ? castValue(val) : val);
        currentField = '';
        fieldStarted = false;

        if (!opts.skipEmptyLines || currentRow.some(c => c !== '' && c !== null)) {
          rows.push(currentRow);
        }
        currentRow = [];
        continue;
      }

      currentField += char;
    }

    // Push the remaining field and row
    if (currentField.length > 0 || inQuotes || currentRow.length > 0) {
      const val = opts.trimFields ? currentField.trim() : currentField;
      currentRow.push(opts.dynamicTyping ? castValue(val) : val);
      if (!opts.skipEmptyLines || currentRow.some(c => c !== '' && c !== null)) {
        rows.push(currentRow);
      }
    }

    if (rows.length === 0) {
      return {
        headers: [],
        data: [],
        meta: { delimiter, rowCount: 0, columnCount: 0, parsedAt: new Date().toISOString() }
      };
    }

    let headers = [];
    let dataRows = [];

    if (opts.hasHeader) {
      // Clean headers, handling duplicates and empties
      const seenHeaders = {};
      headers = rows[0].map((h, idx) => {
        let name = h !== null && h !== undefined && String(h).trim() ? String(h).trim() : `Coluna_${idx + 1}`;
        if (seenHeaders[name]) {
          seenHeaders[name]++;
          name = `${name}_${seenHeaders[name]}`;
        } else {
          seenHeaders[name] = 1;
        }
        return name;
      });
      dataRows = rows.slice(1);
    } else {
      const colCount = Math.max(...rows.map(r => r.length));
      headers = Array.from({ length: colCount }, (_, idx) => `Coluna_${idx + 1}`);
      dataRows = rows;
    }

    // Normalize rows to match header length
    const colCount = headers.length;
    const normalizedData = dataRows.map((row, rowIdx) => {
      const record = { __rowId: rowIdx + 1 };
      for (let c = 0; c < colCount; c++) {
        const header = headers[c];
        const rawVal = row[c] !== undefined ? row[c] : '';
        record[header] = rawVal;
      }
      return record;
    });

    return {
      headers,
      data: normalizedData,
      meta: {
        delimiter,
        rowCount: normalizedData.length,
        columnCount: headers.length,
        hasHeader: opts.hasHeader,
        parsedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Helper to parse Brazilian or international numbers
   * Robust against currency, percentage, negative accounting format (123.45),
   * integer thousand separators ("1.000", "1.000.000", "1,000,000"), and comma decimals.
   */
  function parseNumber(value) {
    if (typeof value === 'number') return isNaN(value) ? null : value;
    if (value === null || value === undefined) return null;
    if (typeof value !== 'string') return null;

    let clean = value.trim();
    if (!clean) return null;

    // Handle accounting negative format: (123.45)
    let isNegative = false;
    if (/^\(.*\)$/.test(clean)) {
      isNegative = true;
      clean = clean.slice(1, -1).trim();
    }

    // Remove currency symbols & %
    clean = clean.replace(/^(R\$|\$|€|£|¥)\s*/i, '').replace(/\s*%\s*$/, '').trim();

    if (clean.startsWith('-')) {
      isNegative = !isNegative;
      clean = clean.slice(1).trim();
    } else if (clean.startsWith('+')) {
      clean = clean.slice(1).trim();
    }

    if (!clean) return null;

    const hasComma = clean.includes(',');
    const hasDot = clean.includes('.');

    if (hasComma && hasDot) {
      const lastComma = clean.lastIndexOf(',');
      const lastDot = clean.lastIndexOf('.');
      if (lastComma > lastDot) {
        // Brazilian format: "1.234.567,89" -> dots are thousand, comma is decimal
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: "1,234,567.89" -> commas are thousand, dot is decimal
        clean = clean.replace(/,/g, '');
      }
    } else if (hasComma) {
      const commas = clean.split(',');
      if (commas.length > 2) {
        // Multiple commas: "1,000,000" -> US thousand separators
        clean = clean.replace(/,/g, '');
      } else {
        // Single comma: e.g. "12,5" or "1000,00" or "1,000"
        clean = clean.replace(',', '.');
      }
    } else if (hasDot) {
      const dots = clean.split('.');
      if (dots.length > 2) {
        // Multiple dots: "1.000.000" -> Brazilian thousand separators
        clean = clean.replace(/\./g, '');
      } else if (/^[1-9]\d{0,2}\.\d{3}$/.test(clean)) {
        // Single dot with exactly 3 digits e.g. "1.000", "10.000", "100.000"
        clean = clean.replace(/\./g, '');
      }
    }

    const num = Number(clean);
    if (isNaN(num)) return null;
    return isNegative ? -num : num;
  }

  /**
   * Helper to parse dates supporting Brazilian DD/MM/YYYY, ISO YYYY-MM-DD, and US MM/DD/YYYY
   */
  function parseDate(value) {
    if (value === null || value === undefined) return null;
    const str = String(value).trim();
    if (!str) return null;

    // ISO format: YYYY-MM-DD or YYYY/MM/DD with optional time
    let match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
      const [_, y, m, d, hh = 0, mm = 0, ss = 0] = match;
      const date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm), Number(ss));
      return isNaN(date.getTime()) ? null : date.getTime();
    }

    // Brazilian / European format: DD/MM/YYYY or DD-MM-YYYY with optional time
    match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[T\s](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
    if (match) {
      let [_, d, m, y, hh = 0, mm = 0, ss = 0] = match;
      let day = Number(d);
      let month = Number(m);
      // Disambiguate US MM/DD/YYYY when month > 12 and day <= 12
      if (month > 12 && day <= 12) {
        const tmp = day; day = month; month = tmp;
      }
      const date = new Date(Number(y), month - 1, day, Number(hh), Number(mm), Number(ss));
      return isNaN(date.getTime()) ? null : date.getTime();
    }

    const parsed = Date.parse(str);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Dynamic typing value caster
   */
  function castValue(val) {
    if (val === null || val === undefined || val === '') return '';
    const str = String(val).trim().toLowerCase();
    if (str === 'true' || str === 'sim' || str === 'yes') return true;
    if (str === 'false' || str === 'nao' || str === 'não' || str === 'no') return false;
    const num = parseNumber(val);
    if (num !== null) return num;
    return val;
  }

  /**
   * Infer column data types from a dataset
   */
  function inferTypes(headers, data, sampleLimit = 500) {
    const types = {};
    const sample = data.slice(0, sampleLimit);

    headers.forEach(header => {
      let numCount = 0;
      let dateCount = 0;
      let boolCount = 0;
      let populatedCount = 0;

      sample.forEach(row => {
        const val = row[header];
        if (val === undefined || val === null || String(val).trim() === '') return;

        populatedCount++;
        const strVal = String(val).trim().toLowerCase();

        // Check Boolean
        if (['true', 'false', 'sim', 'nao', 'não', 'yes', 'no'].includes(strVal)) {
          boolCount++;
          return;
        }

        // Check Date BEFORE pure number (to prevent '2026-01-15' being mistyped)
        if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(strVal) || /^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(strVal)) {
          const dateTs = parseDate(strVal);
          if (dateTs !== null) {
            dateCount++;
            return;
          }
        }

        // Check Number
        const num = parseNumber(val);
        if (num !== null) {
          numCount++;
          return;
        }
      });

      if (populatedCount === 0) {
        types[header] = 'text';
      } else if (numCount / populatedCount > 0.65) {
        types[header] = 'number';
      } else if (dateCount / populatedCount > 0.65) {
        types[header] = 'date';
      } else if (boolCount / populatedCount > 0.65) {
        types[header] = 'boolean';
      } else {
        types[header] = 'text';
      }
    });

    return types;
  }

  /**
   * Compute comprehensive column profile and stats
   */
  function profileColumn(header, data, inferredType) {
    const values = data.map(r => r[header]);
    const total = values.length;
    let emptyCount = 0;
    const frequency = {};
    const numericValues = [];

    values.forEach(v => {
      if (v === undefined || v === null || String(v).trim() === '') {
        emptyCount++;
        return;
      }
      const str = String(v).trim();
      frequency[str] = (frequency[str] || 0) + 1;

      if (inferredType === 'number') {
        const n = parseNumber(v);
        if (n !== null) numericValues.push(n);
      }
    });

    const populatedCount = total - emptyCount;
    const uniqueCount = Object.keys(frequency).length;

    // Top 5 most frequent values
    const topValues = Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([value, count]) => ({
        value,
        count,
        percentage: total ? ((count / total) * 100).toFixed(1) : 0
      }));

    let stats = {
      header,
      type: inferredType,
      total,
      populatedCount,
      emptyCount,
      emptyPercentage: total ? ((emptyCount / total) * 100).toFixed(1) : 0,
      uniqueCount,
      topValues
    };

    if (inferredType === 'number' && numericValues.length > 0) {
      numericValues.sort((a, b) => a - b);
      const min = numericValues[0];
      const max = numericValues[numericValues.length - 1];
      const sum = numericValues.reduce((acc, val) => acc + val, 0);
      const avg = sum / numericValues.length;

      // Median
      const mid = Math.floor(numericValues.length / 2);
      const median = numericValues.length % 2 !== 0
        ? numericValues[mid]
        : (numericValues[mid - 1] + numericValues[mid]) / 2;

      // Standard Deviation
      let varianceSum = 0;
      for (const val of numericValues) {
        varianceSum += Math.pow(val - avg, 2);
      }
      const stdDev = Math.sqrt(varianceSum / numericValues.length);

      stats.numeric = {
        min,
        max,
        sum: Number(sum.toFixed(4)),
        avg: Number(avg.toFixed(4)),
        median: Number(median.toFixed(4)),
        stdDev: Number(stdDev.toFixed(4)),
        validNumberCount: numericValues.length
      };
    }

    return stats;
  }

  /**
   * Smart Filter Engine
   * Supports global query (regex or plain), column quick-filters, and complex rules
   */
  function filterData(data, headers, options = {}) {
    const {
      globalSearch = '',
      isRegex = false,
      isCaseSensitive = false,
      invertMatch = false,
      columnFilters = {}, // { [colName]: "search text" }
      advancedRules = [], // [ { column, operator, value, value2 } ]
      ruleLogic = 'AND'   // 'AND' or 'OR'
    } = options;

    if (!data || data.length === 0) return [];

    let regexObj = null;
    const query = isCaseSensitive ? globalSearch : globalSearch.toLowerCase();

    if (globalSearch && isRegex) {
      try {
        regexObj = new RegExp(globalSearch, isCaseSensitive ? '' : 'i');
      } catch (err) {
        regexObj = null;
      }
    }

    // Pre-process column filters
    const activeColumnFilters = Object.entries(columnFilters).filter(
      ([_, filterVal]) => filterVal !== undefined && filterVal !== null && String(filterVal).trim() !== ''
    );

    return data.filter(row => {
      // 1. Global Search
      let matchesGlobal = true;
      if (globalSearch) {
        let foundInRow = false;
        for (let i = 0; i < headers.length; i++) {
          const val = row[headers[i]];
          if (val === undefined || val === null) continue;
          const strVal = String(val);

          if (regexObj) {
            if (regexObj.test(strVal)) {
              foundInRow = true;
              break;
            }
          } else {
            const checkVal = isCaseSensitive ? strVal : strVal.toLowerCase();
            if (checkVal.includes(query)) {
              foundInRow = true;
              break;
            }
          }
        }

        matchesGlobal = invertMatch ? !foundInRow : foundInRow;
      }

      if (!matchesGlobal) return false;

      // 2. Column Quick-Filters
      for (const [col, colFilterText] of activeColumnFilters) {
        const val = row[col];
        const strVal = (val !== undefined && val !== null ? String(val) : '').toLowerCase();
        const target = String(colFilterText).toLowerCase().trim();
        if (!strVal.includes(target)) {
          return false;
        }
      }

      // 3. Advanced Rules (Multi-Condition)
      if (advancedRules.length > 0) {
        const ruleResults = advancedRules.map(rule => {
          const { column, operator, value, value2 } = rule;
          const rawCell = row[column];
          const cellStr = (rawCell !== undefined && rawCell !== null ? String(rawCell) : '').trim();
          const targetStr = (value !== undefined && value !== null ? String(value) : '').trim();

          switch (operator) {
            case 'contains':
              return cellStr.toLowerCase().includes(targetStr.toLowerCase());

            case 'not_contains':
              return !cellStr.toLowerCase().includes(targetStr.toLowerCase());

            case 'equals':
              return cellStr.toLowerCase() === targetStr.toLowerCase();

            case 'not_equals':
              return cellStr.toLowerCase() !== targetStr.toLowerCase();

            case 'starts_with':
              return cellStr.toLowerCase().startsWith(targetStr.toLowerCase());

            case 'ends_with':
              return cellStr.toLowerCase().endsWith(targetStr.toLowerCase());

            case 'is_empty':
              return cellStr === '';

            case 'is_not_empty':
              return cellStr !== '';

            case 'greater_than': {
              const numCell = parseNumber(rawCell);
              const numTarget = parseNumber(targetStr);
              if (numCell !== null && numTarget !== null) return numCell > numTarget;

              const dateCell = parseDate(rawCell);
              const dateTarget = parseDate(targetStr);
              if (dateCell !== null && dateTarget !== null) return dateCell > dateTarget;

              return cellStr > targetStr;
            }

            case 'less_than': {
              const numCell = parseNumber(rawCell);
              const numTarget = parseNumber(targetStr);
              if (numCell !== null && numTarget !== null) return numCell < numTarget;

              const dateCell = parseDate(rawCell);
              const dateTarget = parseDate(targetStr);
              if (dateCell !== null && dateTarget !== null) return dateCell < dateTarget;

              return cellStr < targetStr;
            }

            case 'between': {
              const numCell = parseNumber(rawCell);
              const numMin = parseNumber(targetStr);
              const numMax = parseNumber(value2);
              if (numCell !== null && numMin !== null && numMax !== null) {
                return numCell >= numMin && numCell <= numMax;
              }

              const dateCell = parseDate(rawCell);
              const dateMin = parseDate(targetStr);
              const dateMax = parseDate(value2);
              if (dateCell !== null && dateMin !== null && dateMax !== null) {
                return dateCell >= dateMin && dateCell <= dateMax;
              }

              return cellStr >= targetStr && cellStr <= (value2 || '');
            }

            case 'regex': {
              try {
                const rx = new RegExp(targetStr, 'i');
                return rx.test(cellStr);
              } catch (e) {
                return false;
              }
            }

            default:
              return true;
          }
        });

        if (ruleLogic === 'OR') {
          if (!ruleResults.some(Boolean)) return false;
        } else {
          // AND logic
          if (!ruleResults.every(Boolean)) return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort dataset by column with natural, numeric, and date awareness
   */
  function sortData(data, column, direction = 'asc', type = 'text') {
    if (!data || data.length === 0 || !column) return [...data];

    const isAsc = direction.toLowerCase() === 'asc';
    const factor = isAsc ? 1 : -1;
    const len = data.length;

    // Fast path: Decorate-Sort-Undecorate (Schwartzian transform)
    // Precomputes the comparison key once per row in O(N) instead of O(N log N)
    const decorated = new Array(len);

    if (type === 'number') {
      for (let i = 0; i < len; i++) {
        const row = data[i];
        const val = row[column];
        const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
        const num = isEmpty ? null : (typeof val === 'number' ? val : parseNumber(val));
        decorated[i] = { row, key: num, empty: isEmpty || num === null };
      }

      decorated.sort((a, b) => {
        if (a.empty && b.empty) return 0;
        if (a.empty) return 1;
        if (b.empty) return -1;
        return (a.key - b.key) * factor;
      });
    } else if (type === 'date') {
      for (let i = 0; i < len; i++) {
        const row = data[i];
        const val = row[column];
        const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
        const dt = isEmpty ? null : parseDate(val);
        decorated[i] = { row, key: dt, empty: isEmpty || dt === null };
      }

      decorated.sort((a, b) => {
        if (a.empty && b.empty) return 0;
        if (a.empty) return 1;
        if (b.empty) return -1;
        return (a.key - b.key) * factor;
      });
    } else {
      // Natural text sorting with single cached Intl.Collator
      const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
      for (let i = 0; i < len; i++) {
        const row = data[i];
        const val = row[column];
        const isEmpty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '');
        decorated[i] = { row, key: isEmpty ? '' : String(val), empty: isEmpty };
      }

      decorated.sort((a, b) => {
        if (a.empty && b.empty) return 0;
        if (a.empty) return 1;
        if (b.empty) return -1;
        return collator.compare(a.key, b.key) * factor;
      });
    }

    const result = new Array(len);
    for (let i = 0; i < len; i++) {
      result[i] = decorated[i].row;
    }
    return result;
  }

  /**
   * Export dataset to RFC-4180 CSV formatted string
   */
  function toCSV(headers, data, options = {}) {
    const delimiter = options.delimiter || ',';
    const visibleHeaders = options.visibleHeaders || headers;

    const escapeCell = (val) => {
      if (val === undefined || val === null) return '';
      const str = String(val);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headerLine = visibleHeaders.map(escapeCell).join(delimiter);
    const dataLines = data.map(row => {
      return visibleHeaders.map(h => escapeCell(row[h])).join(delimiter);
    });

    return [headerLine, ...dataLines].join('\r\n');
  }

  /**
   * Export dataset to JSON string
   */
  function toJSON(headers, data, options = {}) {
    const visibleHeaders = options.visibleHeaders || headers;
    const cleanList = data.map(row => {
      const obj = {};
      visibleHeaders.forEach(h => {
        obj[h] = row[h];
      });
      return obj;
    });

    return JSON.stringify(cleanList, null, options.pretty ? 2 : 0);
  }

  /**
   * Export dataset to Markdown table string
   */
  function toMarkdown(headers, data, options = {}) {
    const visibleHeaders = options.visibleHeaders || headers;
    const maxRows = options.maxRows || 500;

    const sample = data.slice(0, maxRows);
    const headerRow = `| ${visibleHeaders.join(' | ')} |`;
    const separatorRow = `| ${visibleHeaders.map(() => '---').join(' | ')} |`;

    const rowStrings = sample.map(row => {
      const cells = visibleHeaders.map(h => {
        const val = row[h] !== undefined && row[h] !== null ? String(row[h]) : '';
        return val.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
      });
      return `| ${cells.join(' | ')} |`;
    });

    return [headerRow, separatorRow, ...rowStrings].join('\n');
  }

  /**
   * Parse an Array-of-Arrays (AOA) as returned by SheetJS or custom table extractors
   * into structured records { headers, data, meta }
   */
  function fromAOA(rows, options = {}) {
    const opts = {
      hasHeader: options.hasHeader !== false,
      trimFields: options.trimFields !== false,
      ...options
    };

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return {
        headers: [],
        data: [],
        meta: { delimiter: 'Excel', rowCount: 0, columnCount: 0, parsedAt: new Date().toISOString() }
      };
    }

    // Filter out completely blank rows
    const cleanRows = rows.filter(r => Array.isArray(r) && r.some(cell => cell !== '' && cell !== null && cell !== undefined && String(cell).trim() !== ''));
    if (cleanRows.length === 0) {
      return {
        headers: [],
        data: [],
        meta: { delimiter: 'Excel', rowCount: 0, columnCount: 0, parsedAt: new Date().toISOString() }
      };
    }

    let headers = [];
    let dataRows = [];

    if (opts.hasHeader) {
      const rawHeaders = cleanRows[0];
      const seenHeaders = {};
      headers = rawHeaders.map((h, idx) => {
        let name = h !== null && h !== undefined && String(h).trim() ? String(h).trim() : `Coluna_${idx + 1}`;
        if (seenHeaders[name]) {
          seenHeaders[name]++;
          name = `${name}_${seenHeaders[name]}`;
        } else {
          seenHeaders[name] = 1;
        }
        return name;
      });
      dataRows = cleanRows.slice(1);
    } else {
      const colCount = Math.max(...cleanRows.map(r => r.length));
      headers = Array.from({ length: colCount }, (_, idx) => `Coluna_${idx + 1}`);
      dataRows = cleanRows;
    }

    const data = new Array(dataRows.length);
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        let val = row[j];
        if (val instanceof Date) {
          const roundedDate = new Date(Math.round(val.getTime() / 1000) * 1000);
          const y = roundedDate.getUTCFullYear();
          const m = String(roundedDate.getUTCMonth() + 1).padStart(2, '0');
          const d = String(roundedDate.getUTCDate()).padStart(2, '0');
          val = `${y}-${m}-${d}`;
        } else if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'number') {
          val = String(val);
        } else if (typeof val === 'boolean') {
          val = String(val);
        } else if (typeof val === 'string') {
          val = opts.trimFields ? val.trim() : val;
        }
        record[headers[j]] = val;
      }
      data[i] = record;
    }

    return {
      headers,
      data,
      meta: {
        delimiter: 'Excel',
        rowCount: data.length,
        columnCount: headers.length,
        parsedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Export dataset to Excel workbook ArrayBuffer using SheetJS (XLSX) if available
   */
  function toExcel(headers, data, options = {}) {
    const xlsxLib = options.xlsx || (typeof XLSX !== 'undefined' ? XLSX : null);
    if (!xlsxLib) {
      throw new Error('XLSX library is not loaded');
    }

    const visibleHeaders = options.visibleHeaders || headers;
    const sheetName = (options.sheetName || 'Dados').slice(0, 31);

    const aoa = [visibleHeaders];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const line = visibleHeaders.map(h => row[h] !== undefined && row[h] !== null ? row[h] : '');
      aoa.push(line);
    }

    const wb = xlsxLib.utils.book_new();
    const ws = xlsxLib.utils.aoa_to_sheet(aoa);
    xlsxLib.utils.book_append_sheet(wb, ws, sheetName);

    return xlsxLib.write(wb, { type: 'array', bookType: 'xlsx' });
  }

  return {
    sniffDelimiter,
    parse,
    fromAOA,
    toExcel,
    parseNumber,
    parseDate,
    castValue,
    inferTypes,
    profileColumn,
    filterData,
    sortData,
    toCSV,
    toJSON,
    toMarkdown,
    cleanText,
    detectAndDecodeBuffer
  };
}));
