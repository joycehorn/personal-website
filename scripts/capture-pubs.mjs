import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 1. Static file server
const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost:8089');
  let pathname = parsed.pathname;
  let filePath = path.join(__dirname, '..', 'dist', pathname);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  } else if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) {
    filePath += '.html';
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const mimes = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'application/javascript; charset=utf-8',
      '.svg': 'image/svg+xml',
      '.woff2': 'font/woff2'
    };
    res.writeHead(200, { 'Content-Type': mimes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(8089, async () => {
  console.log('HTTP server listening on 8089');

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  const outDir = path.join(__dirname, '..', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  // 2. Launch Chrome with remote debugging
  const chromeProcess = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank'
  ]);

  // Wait for remote debugging to be ready
  let versionData = null;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (res.ok) {
        versionData = await res.json();
        break;
      }
    } catch (e) {
      await new Promise((r) => setTimeout(r, 200));
    }
  }

  if (!versionData) {
    console.error('Could not connect to Chrome debugging port');
    chromeProcess.kill();
    server.close();
    process.exit(1);
  }

  // Create a new page target
  const newTargetRes = await fetch('http://127.0.0.1:9222/json/new', { method: 'PUT' });
  const pageTarget = await newTargetRes.json();
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);

  let id = 1;
  const pending = new Map();

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
  };

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await send('Page.enable');
  await send('DOM.enable');

  const tasks = [
    { name: 'pubs-en-desktop-light', url: 'http://localhost:8089/publications', width: 1280, height: 2600, mobile: false, theme: 'light' },
    { name: 'pubs-en-desktop-dark', url: 'http://localhost:8089/publications', width: 1280, height: 2600, mobile: false, theme: 'dark' },
    { name: 'pubs-en-mobile-light', url: 'http://localhost:8089/publications', width: 375, height: 3800, mobile: true, theme: 'light' },
    { name: 'pubs-en-mobile-dark', url: 'http://localhost:8089/publications', width: 375, height: 3800, mobile: true, theme: 'dark' },
    { name: 'pubs-pt-desktop-light', url: 'http://localhost:8089/pt/publicacoes', width: 1280, height: 2600, mobile: false, theme: 'light' },
    { name: 'pubs-pt-desktop-dark', url: 'http://localhost:8089/pt/publicacoes', width: 1280, height: 2600, mobile: false, theme: 'dark' },
    { name: 'pubs-pt-mobile-light', url: 'http://localhost:8089/pt/publicacoes', width: 375, height: 3800, mobile: true, theme: 'light' },
    { name: 'pubs-pt-mobile-dark', url: 'http://localhost:8089/pt/publicacoes', width: 375, height: 3800, mobile: true, theme: 'dark' },
  ];

  for (const t of tasks) {
    console.log(`Processing ${t.name}...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: t.width,
      height: t.height,
      deviceScaleFactor: 1,
      mobile: t.mobile,
    });

    await send('Emulation.setEmulatedMedia', {
      media: 'screen',
      features: [{ name: 'prefers-color-scheme', value: t.theme }]
    });

    await send('Page.navigate', { url: t.url });
    await new Promise((r) => setTimeout(r, 600));

    await send('Runtime.evaluate', {
      expression: `document.documentElement.setAttribute('data-theme', '${t.theme}')`
    });

    await new Promise((r) => setTimeout(r, 200));

    const screenshot = await send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true
    });

    const buffer = Buffer.from(screenshot.data, 'base64');
    const outFile = path.join(outDir, `${t.name}.png`);
    fs.writeFileSync(outFile, buffer);
    console.log(`Wrote ${outFile} (${buffer.length} bytes)`);
  }

  // Test interactive filtering
  console.log('Testing interactive filtering...');
  // Click 'conference' filter button
  await send('Runtime.evaluate', {
    expression: `
      const confBtn = document.querySelector('.pub-filter-btn[data-type="conference"]');
      if (confBtn) confBtn.click();
    `
  });
  await new Promise((r) => setTimeout(r, 200));

  const filterRes = await send('Runtime.evaluate', {
    expression: `
      ({
        count: document.getElementById('pub-count-display')?.textContent,
        underReviewVisible: document.querySelector('.pub-group-under-review')?.style.display,
      })
    `,
    returnByValue: true
  });
  console.log('Filter result for conference:', filterRes.result.value);

  // Test copy citation button
  console.log('Testing citation copy...');
  const copyRes = await send('Runtime.evaluate', {
    expression: `
      const copyBtn = document.querySelector('.btn-copy-citation');
      if (copyBtn) {
        copyBtn.click();
        ({ citation: copyBtn.getAttribute('data-citation'), text: copyBtn.querySelector('.btn-text')?.textContent });
      } else null;
    `,
    returnByValue: true
  });
  console.log('Copy citation test:', copyRes.result.value);

  ws.close();
  chromeProcess.kill();
  server.close();
  console.log('Done!');
  process.exit(0);
});
