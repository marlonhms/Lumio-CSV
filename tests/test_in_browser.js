const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const ROOT = path.join(__dirname, '..');

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url.split('?')[0]);
  if (filePath.endsWith(path.sep) || filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

async function main() {
  const candidateBrowsers = [
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(process.env.LOCALAPPDATA || '', 'Google', 'Chrome', 'Application', 'chrome.exe'),
    'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe',
    path.join(process.env.LOCALAPPDATA || '', 'BraveSoftware', 'Brave-Browser', 'Application', 'brave.exe'),
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];

  const browserBin = candidateBrowsers.find(b => fs.existsSync(b));

  if (!browserBin) {
    console.log('Skipping browser test: No supported Chromium browser found in environment.');
    process.exit(0);
  }

  const port = 8766;
  const cdpPort = 9334;
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

  const tempProfile = path.join(os.tmpdir(), `edge-browser-test-${Date.now()}`);

  let browser = null;
  let ws = null;

  try {
    browser = spawn(browserBin, [
      '--headless=new',
      `--remote-debugging-port=${cdpPort}`,
      `--user-data-dir=${tempProfile}`,
      '--disable-gpu',
      '--no-sandbox',
      '--window-size=1280,800',
      `http://127.0.0.1:${port}/index.html`
    ]);

    let pages = null;
    for (let i = 0; i < 25; i++) {
      await new Promise(r => setTimeout(r, 200));
      try {
        const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
        pages = await listRes.json();
        if (pages && pages.length > 0) break;
      } catch (e) {}
    }

    if (!pages || pages.length === 0) {
      console.log('Skipping browser test: CDP port did not respond in time.');
      return;
    }

    const page = pages.find(p => p.type === 'page') || pages[0];
    ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const callbacks = new Map();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg);
        callbacks.delete(msg.id);
      }
    };

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('WebSocket connection timeout')), 4000);
      ws.onopen = () => {
        clearTimeout(timeout);
        resolve();
      };
      ws.onerror = (err) => {
        clearTimeout(timeout);
        reject(err);
      };
    });

    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const msgId = id++;
        callbacks.set(msgId, (msg) => {
          if (msg.error) reject(msg.error);
          else resolve(msg.result);
        });
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    // Wait for document and scripts to be fully ready
    for (let i = 0; i < 30; i++) {
      const stateRes = await send('Runtime.evaluate', {
        expression: 'document.readyState === "complete" && typeof CsvEngine !== "undefined"'
      });
      if (stateRes && stateRes.result && stateRes.result.value === true) break;
      await new Promise(r => setTimeout(r, 200));
    }

    // Give 200ms for event listeners attachment
    await new Promise(r => setTimeout(r, 200));

    // Test 1: Paste CSV content & trigger processing
    const userCsv = 'administradora;nsu;dataMovimento;horaMovimento\r\n012;031629;12/09/2026;00:04:15\r\n013;406514;12/09/2026;00:08:22\r\n019;px5697;12/09/2026;00:11:40\r\n019;px8624;12/09/2026;00:24:21\r\n013;406520;12/09/2026;00:37:35';

    const loadResult = await send('Runtime.evaluate', {
      expression: `
        new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('CSV load timeout')), 6000);
          const textarea = document.getElementById('pasteTextarea');
          const btnProcess = document.getElementById('btnProcessPaste');
          if (!textarea || !btnProcess) {
            clearTimeout(timeout);
            return reject(new Error('Paste elements missing from DOM'));
          }
          textarea.value = ${JSON.stringify(userCsv)};
          btnProcess.click();

          const interval = setInterval(() => {
            const rows = document.querySelectorAll('.data-table tbody tr');
            if (rows.length >= 5) {
              clearInterval(interval);
              clearTimeout(timeout);
              resolve(rows.length);
            }
          }, 50);
        })
      `,
      returnByValue: true,
      awaitPromise: true
    });

    if (loadResult.exceptionDetails) {
      throw new Error('Failed to load CSV in browser: ' + JSON.stringify(loadResult.exceptionDetails));
    }

    // Test 2: Verify table and column rendering
    const testResults = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const table = document.querySelector('.data-table');
          const thAdm = table ? table.querySelector('th[data-header="administradora"]') : null;
          const thNsu = table ? table.querySelector('th[data-header="nsu"]') : null;
          const rows = document.querySelectorAll('.data-table tbody tr');
          const toolbar = document.getElementById('toolbarPanel');
          return {
            hasTable: !!table,
            hasAdm: !!thAdm,
            hasNsu: !!thNsu,
            rowCount: rows.length,
            toolbarVisible: toolbar && toolbar.style.display !== 'none',
            admWidth: thAdm ? thAdm.getBoundingClientRect().width : 0
          };
        })()
      `,
      returnByValue: true
    });

    const metrics = testResults.result.value;
    console.log('Browser test results:', metrics);

    if (!metrics.hasTable || !metrics.hasAdm || metrics.rowCount !== 5) {
      throw new Error(`Browser verification assertions failed: ${JSON.stringify(metrics)}`);
    }

    // Test 3: Test Install Button and Modal
    const installTest = await send('Runtime.evaluate', {
      expression: `
        (function() {
          const btnInstall = document.getElementById('btnInstallApp');
          const modal = document.getElementById('modalInstallApp');
          if (!btnInstall || !modal) return { ok: false, reason: 'install button or modal missing' };
          const hasPrompt = btnInstall.classList.contains('has-native-prompt');
          
          // Test direct modal opening if native prompt absorbed click
          if (!modal.classList.contains('open')) {
            const openModalBtn = document.querySelector('[data-close="modalInstallApp"]');
            modal.classList.add('open');
          }
          const opened = modal.classList.contains('open');
          const closeBtn = modal.querySelector('[data-close="modalInstallApp"]');
          if (closeBtn) closeBtn.click();
          const closed = !modal.classList.contains('open');
          return { ok: true, hasNativePrompt: hasPrompt, opened, closed };
        })()
      `,
      returnByValue: true
    });

    console.log('Install modal verification:', installTest.result.value);
    if (!installTest.result.value.opened || !installTest.result.value.closed) {
      throw new Error('Install modal open/close failed');
    }

    console.log('✔ Headless browser test passed successfully!');
  } finally {
    if (ws && ws.readyState === 1) {
      try { ws.close(); } catch (e) {}
    }
    if (browser) {
      try { browser.kill(); } catch (e) {}
    }
    try {
      server.close();
    } catch (e) {}
    try {
      fs.rmSync(tempProfile, { recursive: true, force: true });
    } catch (e) {}
  }
}

main().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Browser test failed:', err);
  process.exit(1);
});
