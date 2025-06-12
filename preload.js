const { contextBridge } = require("electron");
const { exec } = require("child_process");

contextBridge.exposeInMainWorld("batteryAPI", {
  getBatteryStatus: () =>
    new Promise((resolve, reject) => {
      exec("acpi -b", (err, stdout) => {
        if (err) return reject(err);
        const match = stdout.match(/(\d+)%/);
        const charging = stdout.includes("Charging");
        const level = match ? parseInt(match[1], 10) : null;
        resolve({ level, charging });
      });
    }),
});
