import { useState, useRef } from "react";

type SensorSample = { x: string; y: number }; // x = ISO string
type SensorBuffer = Record<string, SensorSample[]>;

export const useRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const bufferRef = useRef<SensorBuffer>({});

  // Mulai merekam
  const start = () => {
    bufferRef.current = {};
    setIsRecording(true);
  };

  // Berhenti merekam dan simpan ke localStorage
  const stop = () => {
    setIsRecording(false);
    localStorage.setItem(
      "recordedSensorData",
      JSON.stringify(bufferRef.current)
    );
  };

  // Tambahkan data dari WebSocket atau sensor lainnya
  const addData = (incoming: Record<string, number>) => {
    if (!isRecording) return;

    const now = new Date().toLocaleString("sv-SE", {
      timeZone: "Asia/Seoul", // KST
    }); // format: YYYY-MM-DD HH:mm:ss

    const buf = bufferRef.current;

    Object.entries(incoming).forEach(([sensor, value]) => {
      if (!buf[sensor]) buf[sensor] = [];
      buf[sensor].push({ x: now, y: value });
    });
  };

  // Kosongkan buffer dan localStorage
  const clear = () => {
    bufferRef.current = {};
    localStorage.removeItem("recordedSensorData");
  };

  return {
    isRecording,
    start,
    stop,
    addData,
    clear,
    getBuffer: () => bufferRef.current,
  };
};
