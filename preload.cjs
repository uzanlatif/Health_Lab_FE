const { contextBridge } = require('electron');
const fs = require('fs');
const path = require('path');
const i2c = require('i2c-bus'); // Pastikan ini sudah di-install: npm install i2c-bus

// Logging ke file
const logPath = path.join('/tmp', 'battery_error.log');
function log(message) {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

log("🔌 preload.cjs started");

function readVoltage(bus, addr) {
  const raw = bus.readWordSync(addr, 0x02);
  const swapped = ((raw << 8) & 0xff00) | ((raw >> 8) & 0x00ff);
  const voltage = swapped * 1.25 / 1000 / 16;
  return voltage;
}

function readCapacity(bus, addr) {
  const raw = bus.readWordSync(addr, 0x04);
  const swapped = ((raw << 8) & 0xff00) | ((raw >> 8) & 0x00ff);
  const capacity = swapped / 256;
  return capacity;
}

function getBatteryStatus(voltage) {
  if (voltage >= 4.2) return "Full";
  if (voltage >= 3.7) return "High";
  if (voltage >= 3.55) return "Medium";
  if (voltage >= 3.4) return "Low";
  return "Critical";
}

contextBridge.exposeInMainWorld('batteryAPI', {
  getBatteryStatus: () =>
    new Promise((resolve, reject) => {
      try {
        const bus = i2c.openSync(1);
        const addr = 0x36;
        const voltage = readVoltage(bus, addr);
        const capacity = readCapacity(bus, addr);
        const status = getBatteryStatus(voltage);
        log(`✅ Voltage: ${voltage.toFixed(2)}V, Capacity: ${capacity.toFixed(2)}%, Status: ${status}`);
        resolve({ voltage, capacity, status });
      } catch (err) {
        log(`❌ Error reading battery: ${err.message}`);
        reject(err);
      }
    }),
});
