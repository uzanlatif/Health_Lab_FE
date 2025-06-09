// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    frame: true, // tampilkan title bar agar bisa drag / kontrol
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.maximize(); // hanya maximize, bukan fullscreen
    win.show();
  });
}

app.whenReady().then(createWindow);
