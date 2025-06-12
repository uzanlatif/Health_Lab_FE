const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');
const i2c = require('i2c-bus');

function readBattery() {
  const bus = i2c.openSync(1);
  const addr = 0x36;

  const readWord = (reg) => {
    const raw = bus.readWordSync(addr, reg);
    return ((raw << 8) & 0xff00) | ((raw >> 8) & 0x00ff);
  };

  const voltageRaw = readWord(0x02);
  const capacityRaw = readWord(0x04);

  const voltage = voltageRaw * 1.25 / 1000 / 16;
  const capacity = capacityRaw / 256;
  let status = "Unknown";

  if (voltage >= 4.2) status = "Full";
  else if (voltage >= 3.7) status = "High";
  else if (voltage >= 3.55) status = "Medium";
  else if (voltage >= 3.4) status = "Low";
  else status = "Critical";

  return { voltage, capacity, status };
}

ipcMain.handle('get-battery-status', async () => {
  try {
    return readBattery();
  } catch (e) {
    return { error: e.message };
  }
});

let win;
function createWindow() {
  win = new BrowserWindow({
    fullscreen: false,
    width: 1280,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.loadFile(path.join(__dirname, 'dist/index.html'));
  win.webContents.openDevTools();

  globalShortcut.register('CommandOrControl+Q', () => app.quit());
  globalShortcut.register('CommandOrControl+Shift+I', () =>
    win.webContents.openDevTools({ mode: 'detach' })
  );
}

app.whenReady().then(createWindow);
app.on('will-quit', () => globalShortcut.unregisterAll());
