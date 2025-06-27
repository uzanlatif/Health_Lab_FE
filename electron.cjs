const {
  app,
  BrowserWindow,
  ipcMain,
  globalShortcut,
  dialog,
} = require("electron");
const path = require("path");
const i2c = require("i2c-bus");
const fs = require("fs");

// ========== 🔋 Battery Reader ==========
// Reads voltage and estimates capacity based on voltage
function readBattery() {
  const bus = i2c.openSync(1);
  const addr = 0x36;

  const readWord = (reg) => {
    const raw = bus.readWordSync(addr, reg);
    return ((raw << 8) & 0xff00) | ((raw >> 8) & 0x00ff); // Swap byte order
  };

  const voltageRaw = readWord(0x02);
  const voltage = (voltageRaw * 1.25) / 1000 / 16; // Convert to volts

  // Estimate capacity percentage based on voltage range (3.3V = 0%, 4.2V = 100%)
  const minVoltage = 3.3;
  const maxVoltage = 4.2;
  let capacity = ((voltage - minVoltage) / (maxVoltage - minVoltage)) * 100;
  capacity = Math.min(100, Math.max(0, capacity)); // Clamp between 0–100
  capacity = Math.round(capacity); // Optional: round to nearest integer

  // Determine battery status
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
    const mediaRoot = "/media";
    const users = fs.readdirSync(mediaRoot); // e.g., ['biopulse2']
    let usbPath = null;

    for (const user of users) {
      const userPath = path.join(mediaRoot, user);
      const devices = fs.readdirSync(userPath); // e.g., ['E83A-6FF2']
      if (devices.length > 0) {
        usbPath = path.join(userPath, devices[0]); // ✅ Example: /media/biopulse2/E83A-6FF2
        break;
      }
    }

    if (!usbPath || !fs.existsSync(usbPath)) {
      dialog.showErrorBox(
        "USB Not Found",
        "No USB device is connected or mounted."
      );
      return;
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate()
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds()
    )}`;
    const fileName = `biosignal-${timestamp}.csv`;

    const targetPath = path.join(usbPath, fileName);
    fs.writeFileSync(targetPath, csvString);

    dialog.showMessageBox(win, {
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

// ========== 🪟 Create Electron Window ==========
let win;
function createWindow() {
  win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.loadFile(path.join(__dirname, "dist/index.html"));

  // Optional: Disable DevTools in production
  // win.webContents.openDevTools();

  globalShortcut.register("CommandOrControl+Q", () => app.quit());
}

app.whenReady().then(createWindow);
app.on("will-quit", () => globalShortcut.unregisterAll());
