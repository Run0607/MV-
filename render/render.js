#!/usr/bin/env node
// =============================================================
//  MV を mp4 に書き出す
//  使い方:
//    node render/render.js --audio 歌.wav --out mv.mp4
//    オプション: --offset 0.0 (音ズレ補正秒) --from 0 --to 218.7 --fps 24 --crf 18
//  必要: Node.js, ffmpeg, playwright (npm i playwright && npx playwright install chromium)
// =============================================================
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => (a.startsWith('--') ? acc.concat([[a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]]) : acc), [])
);
const FPS = +(args.fps || 24);
const FROM = +(args.from || 0);
const TO = +(args.to || 218.7);
const OUT = args.out || 'mv.mp4';
const AUDIO = args.audio && args.audio !== true ? args.audio : null;
const OFFSET = +(args.offset || 0);
const CRF = +(args.crf || 18);
const ROOT = path.resolve(__dirname, '..');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.png': 'image/png', '.jpg': 'image/jpeg' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});

(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  await page.goto(`http://localhost:${port}/index.html?render`);
  await page.waitForFunction(() => window.MV_READY === true, null, { timeout: 120000 });

  const ff = ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-'];
  if (AUDIO) {
    const ss = FROM + OFFSET;
    if (ss >= 0) ff.push('-ss', String(ss), '-i', AUDIO);
    else ff.push('-itsoffset', String(-ss), '-i', AUDIO);
    ff.push('-map', '0:v', '-map', '1:a', '-c:a', 'aac', '-b:a', '256k', '-shortest');
  }
  ff.push('-c:v', 'libx264', '-preset', 'medium', '-crf', String(CRF), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', OUT);
  const enc = spawn('ffmpeg', ff, { stdio: ['pipe', 'inherit', 'inherit'] });

  const total = Math.round((TO - FROM) * FPS);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const t = FROM + i / FPS;
    const b64 = await page.evaluate((t) => { renderFrame(t); return document.getElementById('cv').toDataURL('image/jpeg', 0.95).split(',')[1]; }, t);
    const buf = Buffer.from(b64, 'base64');
    if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once('drain', r));
    if (i % 48 === 0) {
      const el = (Date.now() - t0) / 1000, eta = (el / (i + 1)) * (total - i - 1);
      process.stdout.write(`\r${i}/${total} frames  ${t.toFixed(1)}s  ETA ${Math.round(eta)}s   `);
    }
  }
  enc.stdin.end();
  await new Promise((r) => enc.on('close', r));
  await browser.close();
  server.close();
  console.log(`\n完了: ${OUT}`);
})();
