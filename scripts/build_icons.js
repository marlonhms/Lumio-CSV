const fs = require('fs');
const path = require('path');
const http = require('http');
const os = require('os');
const { spawn } = require('child_process');

async function renderIcons() {
  const iconsDir = path.join(__dirname, '..', 'assets', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  const svgContent = fs.readFileSync(path.join(iconsDir, 'icon.svg'), 'utf8');

  // Find browser (Edge or Chrome)
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browserBin = fs.existsSync(edgePath) ? edgePath : chromePath;

  if (!fs.existsSync(browserBin)) {
    console.error('No supported browser found for icon generation.');
    process.exit(1);
  }

  let currentSize = 512;
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  </style>
</head>
<body>
  ${svgContent}
</body>
</html>`);
  });

  const port = 9876;
  await new Promise(r => server.listen(port, '127.0.0.1', r));

  const cdpPort = 9444;
  const tempProfile = path.join(os.tmpdir(), `edge-icon-gen-${Date.now()}`);

  const browser = spawn(browserBin, [
    '--headless=new',
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempProfile}`,
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `http://127.0.0.1:${port}`
  ]);

  // Wait for browser to open CDP port
  let pages = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${cdpPort}/json/list`);
      pages = await res.json();
      if (pages && pages.length > 0) break;
    } catch (e) {}
  }

  if (!pages || pages.length === 0) {
    console.error('Failed to connect to browser CDP.');
    browser.kill();
    server.close();
    process.exit(1);
  }

  const page = pages.find(p => p.type === 'page') || pages[0];
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();

  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg);
      callbacks.delete(msg.id);
    }
  };

  await new Promise(r => ws.onopen = r);

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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 512,
    height: 512,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 200));

  // 1. Capture 512x512
  const snap512 = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), Buffer.from(snap512.data, 'base64'));
  fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), Buffer.from(snap512.data, 'base64'));
  console.log('✔ Generated icon-512.png & icon-512-maskable.png');

  // 2. Capture 192x192
  await send('Emulation.setDeviceMetricsOverride', {
    width: 192,
    height: 192,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 200));
  const snap192 = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), Buffer.from(snap192.data, 'base64'));
  console.log('✔ Generated icon-192.png');

  // 3. Capture 64x64 for favicon / ICO
  await send('Emulation.setDeviceMetricsOverride', {
    width: 64,
    height: 64,
    deviceScaleFactor: 1,
    mobile: false
  });
  await new Promise(r => setTimeout(r, 200));
  const snap64 = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  fs.writeFileSync(path.join(iconsDir, 'icon-64.png'), Buffer.from(snap64.data, 'base64'));
  console.log('✔ Generated icon-64.png');

  ws.close();
  browser.kill();
  server.close();

  // Create real .ico file from PNG (Windows Vista+ supports PNG-compressed .ico format!)
  createIcoFromPngs(iconsDir);

  // Clean up temp user profile
  try {
    fs.rmSync(tempProfile, { recursive: true, force: true });
  } catch (e) {}

  console.log('All icons generated successfully!');
}

function createIcoFromPngs(iconsDir) {
  // A Windows .ico file can embed standard PNG data directly.
  // Format:
  // ICONDIR: [2 bytes reserved=0] [2 bytes type=1] [2 bytes count=N]
  // ICONDIRENTRY: [1 byte width] [1 byte height] [1 byte colors=0] [1 byte reserved=0]
  //               [2 bytes color planes=1] [2 bytes bpp=32] [4 bytes bytesInRes] [4 bytes imageOffset]
  const png64 = fs.readFileSync(path.join(iconsDir, 'icon-64.png'));
  const png192 = fs.readFileSync(path.join(iconsDir, 'icon-192.png'));

  const images = [
    { width: 64, height: 64, data: png64 },
    { width: 192, height: 192, data: png192 }
  ];

  const headerSize = 6 + (images.length * 16);
  let currentOffset = headerSize;

  const headerBuf = Buffer.alloc(6);
  headerBuf.writeUInt16LE(0, 0); // reserved
  headerBuf.writeUInt16LE(1, 2); // type: icon (1)
  headerBuf.writeUInt16LE(images.length, 4); // number of images

  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.width >= 256 ? 0 : img.width, 0);
    entry.writeUInt8(img.height >= 256 ? 0 : img.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(img.data.length, 8); // image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // offset
    entries.push(entry);
    currentOffset += img.data.length;
  }

  const icoBuffer = Buffer.concat([headerBuf, ...entries, ...images.map(i => i.data)]);
  fs.writeFileSync(path.join(iconsDir, 'lumio.ico'), icoBuffer);
  console.log('✔ Generated native lumio.ico');
}

renderIcons().catch(err => {
  console.error(err);
  process.exit(1);
});
