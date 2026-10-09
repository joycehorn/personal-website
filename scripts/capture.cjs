const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const server = http.createServer((req, res) => {
  const parsed = new URL(req.url, 'http://localhost:8089');
  let pathname = parsed.pathname;
  if (pathname.endsWith('/')) pathname += 'index.html';
  let filePath = path.join(__dirname, '..', 'dist', pathname);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) filePath += '.html';
  if (!fs.existsSync(filePath) && fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');

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

server.listen(8089, () => {
  console.log('Static server listening on 8089');
  const outDir = path.join(__dirname, '..', 'screenshots');
  fs.mkdirSync(outDir, { recursive: true });

  const tasks = [
    { name: 'en-desktop-light', url: 'http://localhost:8089/?theme=light', width: 1280, height: 2600 },
    { name: 'en-desktop-dark', url: 'http://localhost:8089/?theme=dark', width: 1280, height: 2600 },
    { name: 'en-mobile-light', url: 'http://localhost:8089/?theme=light', width: 375, height: 3600 },
    { name: 'en-mobile-dark', url: 'http://localhost:8089/?theme=dark', width: 375, height: 3600 },
    { name: 'pt-desktop-light', url: 'http://localhost:8089/pt/?theme=light', width: 1280, height: 2600 },
    { name: 'pt-desktop-dark', url: 'http://localhost:8089/pt/?theme=dark', width: 1280, height: 2600 },
    { name: 'pt-mobile-light', url: 'http://localhost:8089/pt/?theme=light', width: 375, height: 3600 },
    { name: 'pt-mobile-dark', url: 'http://localhost:8089/pt/?theme=dark', width: 375, height: 3600 },
  ];

  const chromePath = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  for (const t of tasks) {
    const out = path.join(outDir, t.name + '.png');
    console.log(`Capturing ${t.name}...`);
    try {
      execFileSync(chromePath, [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--window-size=${t.width},${t.height}`,
        `--screenshot=${out}`,
        t.url
      ], { stdio: 'inherit' });
      console.log(`Wrote ${out}`);
    } catch (err) {
      console.error(`Failed to capture ${t.name}:`, err.message);
    }
  }

  console.log('Capture finished');
  server.close();
  process.exit(0);
});
