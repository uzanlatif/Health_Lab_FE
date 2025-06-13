import React, { useState, useRef, useEffect, useMemo } from "react";
import StatusCards from "../components/ECG/StatusCards";
import SensorCard from "../components/ECG/SensorCard";
import SensorChart from "../components/ECG/SensorChart";
import Header from "../components/ECG/Header";
import useWebSocket from "../hooks/useWebSocket";
import { processSensorData } from "../utils/dataProcessingECG";
import { useWebSocketConfig } from "../context/WebSocketConfigContext";

const ECGView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [notchEnabledSensors, setNotchEnabledSensors] = useState<Record<string, boolean>>({});
  const [compactView, setCompactView] = useState(true);

  const { ip } = useWebSocketConfig();
  const port = import.meta.env.VITE_PORT_ECG;
  const websocketUrl = useMemo(() => `ws://${ip}:${port}`, [ip, port]);

  const {
    data: sensorData,
    lastUpdated,
    reconnect,
    isConnected,
  } = useWebSocket(websocketUrl);

  const dataBufferRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const recordedLogsRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const MAX_BUFFER_SIZE = { "1h": 3600, "6h": 3600 * 6, "24h": 3600 * 24 };

  useEffect(() => {
    if (!sensorData) return;

    for (const sensorName of selectedSensors) {
      const newValues = sensorData[sensorName];
      if (!Array.isArray(newValues)) continue;

      const currentBuffer = dataBufferRef.current[sensorName] || [];
      const newBuffer = newValues
        .filter(
          (v) =>
            typeof v.y === "number" &&
            !isNaN(v.y) &&
            typeof v.__timestamp__ === "number"
        )
        .map((v) => ({
          x: new Date(v.__timestamp__ * 1000),
          y: v.y,
        }));

      const merged = [...currentBuffer, ...newBuffer].slice(-MAX_BUFFER_SIZE[timeRange]);
      dataBufferRef.current[sensorName] = merged;

      if (isRecording) {
        if (!recordedLogsRef.current[sensorName]) {
          recordedLogsRef.current[sensorName] = [];
        }
        recordedLogsRef.current[sensorName].push(...newBuffer);
      }
    }
  }, [sensorData, selectedSensors, timeRange, isRecording]);

  const toggleRecording = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (next) {
        recordedLogsRef.current = {};
      } else {
        const exportData: Record<string, { x: string; y: number }[]> = {};
        for (const [key, records] of Object.entries(recordedLogsRef.current)) {
          exportData[key] = records.map(({ x, y }) => ({
            x: new Date(x).toISOString(),
            y,
          }));
        }
        localStorage.setItem("recordedSensorData", JSON.stringify(exportData));
        console.log("✅ Recorded logs saved to localStorage.");
      }
      return next;
    });
  };

  const toggleSensorSelection = (sensorName: string) => {
    setSelectedSensors((prev) => {
      if (prev.includes(sensorName)) {
        delete dataBufferRef.current[sensorName];
        return prev.filter((name) => name !== sensorName);
      } else {
        return [...prev, sensorName];
      }
    });
  };

  const toggleNotchFilter = (sensorName: string) => {
    setNotchEnabledSensors((prev) => ({
      ...prev,
      [sensorName]: !prev[sensorName],
    }));
  };

  const processedData = useMemo(() => {
    const selectedBuffer: Record<string, { x: Date; y: number }[]> = {};
    for (const name of selectedSensors) {
      if (dataBufferRef.current[name]) {
        selectedBuffer[name] = dataBufferRef.current[name];
      }
    }
    return processSensorData(selectedBuffer);
  }, [sensorData, selectedSensors, timeRange]);

  const formattedTime = useMemo(
    () =>
      lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString("en-US", { hour12: false })
        : "--:--:--",
    [lastUpdated]
  );

  const statusCounts = useMemo(
    () => ({
      all: Object.keys(processedData).length,
      critical: Object.values(processedData).filter((s) => s.status === "critical").length,
      warning: Object.values(processedData).filter((s) => s.status === "warning").length,
      normal: Object.values(processedData).filter((s) => s.status === "normal").length,
    }),
    [processedData]
  );

  const sensorGroups = {
    Sensor: [
      "LEAD_I", "LEAD_II", "LEAD_III", "AVR", "AVL", "AVF",
      "V1", "V2", "V3", "V4", "V5", "V6",
    ],
  };

  return (
    <div className="space-y-6 text-gray-100">
      <Header
        isConnected={isConnected}
        isRecording={isRecording}
        statusCounts={statusCounts}
        formattedTime={formattedTime}
        elapsedTime="--:--" // Atur jika Anda ingin menampilkan jam rekaman aktif
        reconnect={reconnect}
        toggleRecording={toggleRecording}
        onDownload={() => {}}
      />

      <div className="flex justify-end">
        <button
          className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
          onClick={() => setCompactView((prev) => !prev)}
        >
          {compactView ? "🔎 Expand View" : "📊 Compact View"}
        </button>
      </div>

      <StatusCards counts={statusCounts} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-auto max-w-xs space-y-2">
          {Object.entries(sensorGroups).map(([category, sensors]) => (
            <div
              key={category}
              className="bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-600"
            >
              <h2 className="text-lg font-semibold text-gray-100 capitalize mb-3">
                {category} Signals
              </h2>
              <div className="flex flex-col gap-2">
                {sensors.map((sensorName) => {
                  const sensor = processedData[sensorName];
                  return (
                    <SensorCard
                      key={sensorName}
                      name={sensorName}
                      status={sensor?.status || "normal"}
                      change={sensor?.change || 0}
                      onClick={() => toggleSensorSelection(sensorName)}
                      isSelected={selectedSensors.includes(sensorName)}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:w-full">
          {selectedSensors.length > 0 ? (
            <div className={compactView ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" : "flex flex-col gap-4"}>
              {selectedSensors.map((sensorName) => {
                const sensor = processedData[sensorName];
                if (!sensor || !Array.isArray(sensor.chartData)) return null;

                return (
                  <div
                    key={sensorName}
                    className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-600"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-lg font-semibold text-gray-100 truncate">
                        {sensor.displayName || sensorName} Logs
                      </h2>
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!notchEnabledSensors[sensorName]}
                          onChange={() => toggleNotchFilter(sensorName)}
                        />
                        60Hz Notch Filter
                      </label>
                    </div>
                    <SensorChart
                      data={sensor.chartData}
                      timeRange={timeRange}
                      color="#EF4444"
                      simplified={compactView}
                      notch60Hz={!!notchEnabledSensors[sensorName]}
                      compactView={compactView}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-600 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium mb-2">No Sensor Selected</p>
                <p className="text-sm">Click on a sensor to view detailed logs</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ECGView;
