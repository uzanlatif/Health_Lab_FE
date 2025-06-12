/// <reference types="vite/client" />

interface Window {
  batteryAPI?: {
    getBatteryStatus: () => Promise<{
      voltage: number;
      capacity: number;
      status: string;
      error?: string;
    }>;
  };
}
