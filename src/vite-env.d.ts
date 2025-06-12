/// <reference types="vite/client" />

interface Window {
  batteryAPI?: {
    getBatteryStatus: () => Promise<{ level: number; charging: boolean }>;
  };
}
