const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.csv': 'text/csv'
};

const server = http.createServer((req, res) => {
  let filePath = path.join(__dirname, req.url.split('?')[0]);
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
  await new Promise(resolve => server.listen(8765, '127.0.0.1', resolve));

  const chromePath = 'C:\\Program Files\\Google%20Chrome\\Application\\chrome.exe'.replace('%20', ' ');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browserBin = fs.existsSync(chromePath) ? chromePath : edgePath;

  const browser = spawn(browserBin, [
    '--headless=new',
    '--remote-debugging-port=9333',
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1200,800',
    'http://127.0.0.1:8765/index.html'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const listRes = await fetch('http://127.0.0.1:9333/json/list');
  const pages = await listRes.json();
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

  // Evaluate metrics on actual files without any injected styles
  const testResults = await send('Runtime.evaluate', {
    expression: `
      (function() {
        const table = document.querySelector('.data-table');
        const thAdm = table.querySelector('th[data-header="administradora"]');
        const thNsu = table.querySelector('th[data-header="nsu"]');
        const thData = table.querySelector('th[data-header="dataMovimento"]');
        const thHora = table.querySelector('th[data-header="horaMovimento"]');

        const titleAdm = thAdm.querySelector('.th-title');
        const titleNsu = thNsu.querySelector('.th-title');
        const titleData = thData.querySelector('.th-title');
        const titleHora = thHora.querySelector('.th-title');

        const borderX = thAdm.getBoundingClientRect().right;
        const midY = thAdm.getBoundingClientRect().top + thAdm.getBoundingClientRect().height / 2;

        // Hit testing at border
        const hits = [-8, -5, -2, -1, 0, 1, 3].map(offset => {
          const el = document.elementFromPoint(borderX + offset, midY);
          return {
            offset,
            x: borderX + offset,
            tag: el ? el.tagName : null,
            className: el ? el.className : null,
            isResizer: el && el.classList.contains('col-resizer')
          };
        });

        // Test dragging to shrink administradora
        const startAdmWidth = thAdm.getBoundingClientRect().width;
        const startTableWidth = table.getBoundingClientRect().width;

        const resizer = thAdm.querySelector('.col-resizer');
        const rRect = resizer.getBoundingClientRect();

        const downEvt = new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: rRect.right - 2,
          clientY: midY,
          button: 0,
          pointerId: 1
        });
        resizer.dispatchEvent(downEvt);

        // Drag to shrink by 50px
        const moveEvt = new PointerEvent('pointermove', {
          bubbles: true,
          cancelable: true,
          clientX: rRect.right - 2 - 50,
          clientY: midY,
          pointerId: 1
        });
        window.dispatchEvent(moveEvt);

        const widthDuringDrag = thAdm.getBoundingClientRect().width;
        const tableWidthDuringDrag = table.getBoundingClientRect().width;

        const upEvt = new PointerEvent('pointerup', {
          bubbles: true,
          cancelable: true,
          clientX: rRect.right - 2 - 50,
          clientY: midY,
          pointerId: 1
        });
        window.dispatchEvent(upEvt);

        const finalAdmWidth = thAdm.getBoundingClientRect().width;
        const finalTableWidth = table.getBoundingClientRect().width;

        return {
          tableWidth: startTableWidth,
          adm: {
            width: startAdmWidth,
            titleWidth: titleAdm.getBoundingClientRect().width,
            titleText: titleAdm.textContent
          },
          nsu: {
            width: thNsu.getBoundingClientRect().width,
            titleWidth: titleNsu.getBoundingClientRect().width,
            titleText: titleNsu.textContent
          },
          dataMov: {
            width: thData.getBoundingClientRect().width,
            titleWidth: titleData.getBoundingClientRect().width,
            titleText: titleData.textContent
          },
          horaMov: {
            width: thHora.getBoundingClientRect().width,
            titleWidth: titleHora.getBoundingClientRect().width,
            titleText: titleHora.textContent
          },
          hits,
          dragShrinkTest: {
            startAdmWidth,
            startTableWidth,
            widthDuringDrag,
            tableWidthDuringDrag,
            finalAdmWidth,
            finalTableWidth
          }
        };
      })()
    `,
    returnByValue: true
  });

  console.log('Test results:', JSON.stringify(testResults.result.value, null, 2));

  // Reset to auto-fit and take screenshot
  await send('Runtime.evaluate', {
    expression: `
      (function() {
        const thAdm = document.querySelector('th[data-header="administradora"]');
        const resizer = thAdm.querySelector('.col-resizer');
        const dblClickEvt = new MouseEvent('dblclick', { bubbles: true, cancelable: true });
        resizer.dispatchEvent(dblClickEvt);
      })()
    `
  });

  await new Promise(r => setTimeout(r, 200));

  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync('final_verified_screenshot.png', Buffer.from(screenshot.data, 'base64'));
  console.log('Saved final_verified_screenshot.png');

  ws.close();
  browser.kill();
  server.close();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
