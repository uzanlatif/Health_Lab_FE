const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("batteryAPI", {
  getBatteryStatus: () => ipcRenderer.invoke("get-battery-status"),
});

contextBridge.exposeInMainWorld("usbAPI", {
  saveToUSB: (csvString) => ipcRenderer.send("save-to-usb", csvString),
});
