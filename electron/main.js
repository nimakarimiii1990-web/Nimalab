/**
 * Nima Desktop (Electron) — main process
 * ---------------------------------------------------------------
 * این فایل پنجره دسکتاپ Nima را باز می‌کند.
 * اگر سرور Nima روی همان سیستم روشن نباشد، خودش آن را روشن می‌کند.
 *
 * مسیر پوشه Nima را به یکی از این راه‌ها مشخص کنید:
 *   ۱) متغیر محیطی  NIMA_DIR  (مثلاً C:\Nima)
 *   ۲) فایل  nima-path.json  کنار فایل exe  →  {"nimaDir": "C:\\Nima"}
 *   ۳) حالت توسعه: پوشه‌ی electron داخل خود پروژه Nima است (پیش‌فرض ../..)
 *
 * اگر سرور از قبل روشن باشد (localhost:3000) مستقیم وصل می‌شود.
 */
const { app, BrowserWindow, dialog } = require('electron');
const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = process.env.NIMA_PORT || '3000';
const BASE = `http://localhost:${PORT}`;

function findNimaDir() {
  // 1) environment variable
  if (process.env.NIMA_DIR && fs.existsSync(process.env.NIMA_DIR)) return process.env.NIMA_DIR;

  // 2) nima-path.json next to the exe (packaged app)
  try {
    const exeDir = process.env.PORTABLE_EXECUTABLE_DIR || path.dirname(app.getPath('exe'));
    const cfgPath = path.join(exeDir, 'nima-path.json');
    if (fs.existsSync(cfgPath)) {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (cfg.nimaDir && fs.existsSync(cfg.nimaDir)) return cfg.nimaDir;
    }
  } catch (e) { /* ignore */ }

  // 3) dev mode: electron folder lives inside the Nima project
  const devDir = path.resolve(__dirname, '..', '..');
  if (fs.existsSync(path.join(devDir, 'package.json'))) return devDir;

  return null;
}

function findStandaloneServer(nimaDir) {
  const standalone = path.join(nimaDir, '.next', 'standalone');
  if (!fs.existsSync(standalone)) return null;
  const find = (dir, depth = 0) => {
    if (depth > 4) return null;
    if (fs.existsSync(path.join(dir, 'server.js'))) return dir;
    for (const entry of fs.readdirSync(dir)) {
      const p = path.join(dir, entry);
      try {
        if (fs.statSync(p).isDirectory()) {
          const found = find(p, depth + 1);
          if (found) return found;
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  };
  return find(standalone);
}

function ping() {
  return new Promise((resolve) => {
    const req = http.get(BASE, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1500, () => { req.destroy(); resolve(false); });
  });
}

function waitServer(tries = 60) {
  return new Promise(async (resolve) => {
    for (let i = 0; i < tries; i++) {
      if (await ping()) return resolve(true);
      await new Promise((r) => setTimeout(r, 500));
    }
    resolve(false);
  });
}

let serverProc = null;

function startServer(nimaDir) {
  const dir = findStandaloneServer(nimaDir);
  if (!dir) {
    throw new Error(
      'نسخه ساخت‌شده Nima پیدا نشد.\n\n' +
      'داخل پوشه Nima این دو دستور را اجرا کنید:\n' +
      '  npm install\n  npm run build\n\n' +
      'و مطمئن شوید مسیر درست است: ' + nimaDir
    );
  }
  // ELECTRON_RUN_AS_NODE makes the electron binary behave as plain Node.js
  serverProc = spawn(process.execPath, [path.join(dir, 'server.js')], {
    cwd: dir,
    env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', NODE_ENV: 'production', PORT: String(PORT) },
    stdio: 'ignore',
  });
  serverProc.on('error', (e) => console.error('[nima] server error:', e));
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 920,
    autoHideMenuBar: true,
    title: 'Nima — Laboratory Companion',
    backgroundColor: '#0b5fad',
    show: false,
  });
  win.once('ready-to-show', () => win.show());

  if (!(await ping())) {
    const nimaDir = findNimaDir();
    if (!nimaDir) {
      dialog.showErrorBox(
        'Nima',
        'پوشه Nima پیدا نشد.\n\nفایل nima-path.json را کنار برنامه بگذارید:\n{"nimaDir": "C:\\\\Nima"}'
      );
      app.quit();
      return;
    }
    try {
      startServer(nimaDir);
    } catch (e) {
      dialog.showErrorBox('Nima', e.message);
      app.quit();
      return;
    }
    const ok = await waitServer();
    if (!ok) {
      dialog.showErrorBox('Nima', 'سرور Nima روشن نشد. پورت 3000 را بررسی کنید.');
      app.quit();
      return;
    }
  }

  await win.loadURL(BASE);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverProc) { try { serverProc.kill(); } catch (e) { /* ignore */ } }
  app.quit();
});
