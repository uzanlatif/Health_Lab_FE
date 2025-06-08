import React, { useState, useRef, useEffect, useMemo } from "react";
import StatusCards from "../components/EEG/StatusCards";
import SensorCard from "../components/EEG/SensorCard";
import SensorChart from "../components/EEG/SensorChart";
import Header from "../components/EEG/Header";
import useWebSocket from "../hooks/useWebSocket";
import { processSensorData } from "../utils/dataProcessingEEG";
import { useWebSocketConfig } from "../context/WebSocketConfigContext";

const EEGView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const { ip } = useWebSocketConfig();
  const port = import.meta.env.VITE_PORT_EEG;

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

      const merged = [...currentBuffer, ...newBuffer].slice(
        -MAX_BUFFER_SIZE[timeRange]
      );
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
        console.log("✅ EEG logs saved to localStorage.");
      }
      return next;
    });
  };

  const downloadLogs = () => {
    const lines = ["Sensor,Timestamp,Value"];
    for (const [sensor, records] of Object.entries(recordedLogsRef.current)) {
      for (const point of records) {
        lines.push(`${sensor},${point.x.toISOString()},${point.y}`);
      }
    }
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "recorded_eeg_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      critical: Object.values(processedData).filter(
        (s) => s.status === "critical"
      ).length,
      warning: Object.values(processedData).filter(
        (s) => s.status === "warning"
      ).length,
      normal: Object.values(processedData).filter((s) => s.status === "normal")
        .length,
    }),
    [processedData]
  );

  const sensorGroups = {
    Sensor: Array.from({ length: 16 }, (_, i) => `EEG_${i + 1}`),
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

  return (
    <div className="space-y-6 text-gray-100">
      <Header
        isConnected={isConnected}
        isRecording={isRecording}
        statusCounts={statusCounts}
        formattedTime={formattedTime}
        reconnect={reconnect}
        toggleRecording={toggleRecording}
        onDownload={downloadLogs}
      />

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
                      value={sensor?.value || 0}
                      unit={sensor?.unit || ""}
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
            selectedSensors.map((sensorName) => {
              const sensor = processedData[sensorName];
              if (!sensor || !Array.isArray(sensor.chartData)) return null;

              return (
                <div
                  key={sensorName}
                  className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-600 mb-4"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-100">
                      {sensor.displayName} Logs
                    </h2>
                  </div>
                  <SensorChart
                    data={sensor.chartData}
                    timeRange={timeRange}
                    color="#EF4444"
                    simplified={false}
                  />
                </div>
              );
            })
          ) : (
            <div className="bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-600 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg font-medium mb-2">No Sensor Selected</p>
                <p className="text-sm">
                  Click on a sensor to view detailed logs
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EEGView;
