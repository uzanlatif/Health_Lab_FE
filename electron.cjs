const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'), // ✅ tambahkan preload di sini
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
