const { contextBridge } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

function logError(message) {
  const logPath = path.join(__dirname, 'battery_error.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

console.log("✅ preload.js loaded");

contextBridge.exposeInMainWorld('batteryAPI', {
  getBatteryStatus: () =>
    new Promise((resolve, reject) => {
      console.log("🔋 Fetching battery info...");

      exec('acpi -b', (err, stdout) => {
        if (err) {
          const errMsg = `❌ ACPI error: ${err.message}`;
          console.error(errMsg);
          logError(errMsg);
          return reject(err);
        }

        if (!stdout) {
          const emptyMsg = "❌ Empty stdout from acpi command.";
          console.warn(emptyMsg);
          logError(emptyMsg);
          return reject(new Error(emptyMsg));
        }

        const match = stdout.match(/(\d+)%/);
        const charging = stdout.includes("Charging");
        const level = match ? parseInt(match[1], 10) : null;

        if (level === null) {
          const parseErr = `⚠️ Failed to parse battery level: ${stdout}`;
          console.warn(parseErr);
          logError(parseErr);
          return reject(new Error(parseErr));
        }

        return resolve({ level, charging });
      });
    }),
});
