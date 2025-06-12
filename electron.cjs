const { app, BrowserWindow, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

console.log("🟢 Electron starting...");
console.log("🛠 Preload path:", path.join(__dirname, 'preload.js'));

app.disableHardwareAcceleration();

let win;

function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
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
}

app.whenReady().then(createWindow);

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
