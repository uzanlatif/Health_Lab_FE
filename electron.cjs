// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration(); // Nonaktifkan akselerasi GPU

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,   // Fullscreen true supaya layar penuh
    frame: false,       // Hapus frame (title bar dan border)
    webPreferences: {
      contextIsolation: true, // Security best practice
    },
  });

  // Load file index.html hasil build Vite
  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);
