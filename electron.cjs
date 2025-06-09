// electron.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

app.disableHardwareAcceleration(); // ⛔️ Disable GPU acceleration

function createWindow() {
  const win = new BrowserWindow({
    fullscreen: true,             // ✅ Start in fullscreen mode
    frame: false,                 // 🖼️ Remove window frame (optional for kiosk)
    resizable: false,             // 🚫 Prevent resizing
    fullscreenable: false,        // 🚫 Prevent user from exiting fullscreen
    autoHideMenuBar: true,        // 🧼 Hide menu bar
    webPreferences: {
      contextIsolation: true,     // ✅ Security best practice
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
}

app.whenReady().then(createWindow);

// Exit on all windows closed (except macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
