const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('batteryAPI', {
  getBatteryStatus: () => ipcRenderer.invoke('get-battery-status'),
});
