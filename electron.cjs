// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration();

function createWindow() {
  const win = new BrowserWindow({
    frame: false,
    show: false, // jangan tampilkan sebelum siap
    webPreferences: {
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  win.once('ready-to-show', () => {
    win.maximize();
    win.setFullScreen(true);
    win.show();
    console.log('Window bounds:', win.getBounds());
  });
}

app.whenReady().then(createWindow);
