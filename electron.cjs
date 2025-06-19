const { app, BrowserWindow, ipcMain, globalShortcut, dialog } = require('electron');
const path = require('path');
const i2c = require('i2c-bus');
const fs = require('fs');

// ========== 🔋 Battery Reader ==========
function readBattery() {
  const bus = i2c.openSync(1);
  const addr = 0x36;

  const readWord = (reg) => {
    const raw = bus.readWordSync(addr, reg);
    return ((raw << 8) & 0xff00) | ((raw >> 8) & 0x00ff);
  };

  const voltageRaw = readWord(0x02);
  const capacityRaw = readWord(0x04);

  const voltage = (voltageRaw * 1.25) / 1000 / 16;
  const capacity = capacityRaw / 256;
  let status = "Unknown";

  if (voltage >= 4.2) status = "Full";
  else if (voltage >= 3.7) status = "High";
  else if (voltage >= 3.55) status = "Medium";
  else if (voltage >= 3.4) status = "Low";
  else status = "Critical";

  return { voltage, capacity, status };
}

// ========== 💾 Save to USB ==========
ipcMain.on("save-to-usb", async (_event, csvString) => {
  try {
    // 📂 Cari USB mount point (misalnya /media/pi/ atau /media/usbname)
    const mediaPath = "/media"; // Bisa disesuaikan
    const devices = fs.readdirSync(mediaPath);
    const usbPath = devices.length > 0 ? path.join(mediaPath, devices[0]) : null;

    if (!usbPath || !fs.existsSync(usbPath)) {
      dialog.showErrorBox("USB Not Found", "No USB device is connected or mounted.");
      return;
    }

    // 📝 Simpan file
    const fileName = `biosignal-${Date.now()}.csv`;
    const targetPath = path.join(usbPath, fileName);
    fs.writeFileSync(targetPath, csvString);

    dialog.showMessageBox({
      type: "info",
      title: "Save Successful",
      message: `✅ File saved to USB:\n${targetPath}`,
    });
  } catch (error) {
    console.error("Error saving to USB:", error);
    dialog.showErrorBox("Save Failed", "❌ Failed to save data to USB device.");
  }
});

// ========== 🔋 Handle battery status ==========
ipcMain.handle("get-battery-status", async () => {
  try {
    return readBattery();
  } catch (e) {
    return { error: e.message };
  }
});

// ========== 🪟 Create window ==========
let win;
function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));

  // ❌ Jangan buka DevTools di produksi
  // win.webContents.openDevTools();

  globalShortcut.register('CommandOrControl+Q', () => app.quit());
}

app.whenReady().then(createWindow);
app.on('will-quit', () => globalShortcut.unregisterAll());
