// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration(); // ⛔️ Nonaktifkan akselerasi GPU

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true, // security best practice
    },
  });

  // Load Vite-built frontend from `dist/index.html`
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);
