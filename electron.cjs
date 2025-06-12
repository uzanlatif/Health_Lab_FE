const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: false, // 👁️ non-fullscreen untuk debugging
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
  win.webContents.openDevTools(); // 🧪 buka DevTools untuk debug

  globalShortcut.register('CommandOrControl+Q', () => app.quit());
  globalShortcut.register('CommandOrControl+Shift+I', () =>
    win.webContents.openDevTools({ mode: 'detach' })
  );
}

app.whenReady().then(createWindow);
app.on('will-quit', () => globalShortcut.unregisterAll());
