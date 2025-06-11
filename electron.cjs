// electron.js
const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true, // Set jendela fullscreen
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.show();
  });

  // Daftar shortcut Ctrl+Q untuk keluar aplikasi
  globalShortcut.register('CommandOrControl+Q', () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

// Unregister semua shortcut saat app keluar
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
