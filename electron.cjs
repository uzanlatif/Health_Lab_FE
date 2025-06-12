const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

console.log("🟢 Electron starting...");
console.log("🛠 Preload path:", path.join(__dirname, 'preload.js'));

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false, // ✅ penting agar preload bisa pakai child_process
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  console.log("🪟 BrowserWindow created");

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    win.webContents.openDevTools({ mode: 'detach' });
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
