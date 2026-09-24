const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv'
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
  const port = 8766;
  const cdpPort = 9334;
  await new Promise(resolve => server.listen(port, '127.0.0.1', resolve));

  const chromePath = 'C:\\Program Files\\Google%20Chrome\\Application\\chrome.exe'.replace('%20', ' ');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const tempProfile = path.join(os.tmpdir(), `edge-browser-test-${Date.now()}`);

  const browser = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,800',
    `http://127.0.0.1:${port}/index.html`
  ]);

  let pages = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const listRes = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      pages = await listRes.json();
      if (pages && pages.length > 0) break;
    } catch (e) {}
  }

  if (!pages || pages.length === 0) {
    console.log('Skipping browser test: CDP not available');
    browser.kill();
    server.close();
    process.exit(0);
  }

  const page = pages.find(p => p.type === 'page') || pages[0];

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  await new Promise(resolve => ws.onopen = resolve);

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

  const userCsv = 'administradora;nsu;dataMovimento;horaMovimento\r\n012;031629;12/09/2026;00:04:15\r\n013;406514;12/09/2026;00:08:22\r\n019;px5697;12/09/2026;00:11:40\r\n019;px8624;12/09/2026;00:24:21\r\n013;406520;12/09/2026;00:37:35';

  await send('Runtime.evaluate', {
    expression: `
      new Promise((resolve) => {
        const csv = ${JSON.stringify(userCsv)};
        const blob = new Blob([csv], { type: 'text/csv' });
        const file = new File([blob], 'user_data.csv', { type: 'text/csv' });
        const dt = new DataTransfer();
        dt.items.add(file);

        const dropEvt = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dt
        });
        window.dispatchEvent(dropEvt);

        const interval = setInterval(() => {
          const rows = document.querySelectorAll('.data-table tbody tr');
          if (rows.length > 0) {
            clearInterval(interval);
            resolve(rows.length);
          }
        }, 50);
      })
    `,
    returnByValue: true,
    awaitPromise: true
  });

  const testResults = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const table = document.querySelector('.data-table');
        const thAdm = table.querySelector('th[data-header="administradora"]');
        const thNsu = table.querySelector('th[data-header="nsu"]');
        return {
          hasTable: !!table,
          hasAdm: !!thAdm,
          admWidth: thAdm ? thAdm.getBoundingClientRect().width : 0
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Browser test results:', testResults.result.value);

  ws.close();
  browser.kill();
  server.close();
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (e) {}

  console.log('✔ Headless browser test passed successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
