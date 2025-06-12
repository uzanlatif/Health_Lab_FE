const { contextBridge } = require('electron');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Log to file
const logPath = path.join(__dirname, 'battery_error.log');
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

console.log("🧠 preload.js loaded");
log("🔌 preload.js loaded");

contextBridge.exposeInMainWorld('batteryAPI', {
  getBatteryStatus: () =>
    new Promise((resolve, reject) => {
      log("📦 Running acpi -b");
      exec('acpi -b', (err, stdout) => {
        if (err) {
          log(`❌ ACPI error: ${err.message}`);
          return reject(err);
        }

        if (!stdout) {
          log("❌ Empty stdout from acpi");
          return reject(new Error("Empty acpi output"));
        }

        const match = stdout.match(/(\d+)%/);
        const charging = stdout.includes("Charging");
        const level = match ? parseInt(match[1], 10) : null;

        if (level === null) {
          log(`⚠️ Could not parse battery level: ${stdout}`);
          return reject(new Error("Parse error"));
        }

        log(`✅ Battery level: ${level}%, charging: ${charging}`);
        resolve({ level, charging });
      });
    }),
});
