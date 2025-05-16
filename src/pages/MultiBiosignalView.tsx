import React, { useState, useRef, useEffect, useMemo } from "react";
import StatusCards from "../components/StatusCards";
import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import Header from "../components/Header";
import useWebSocket from "../hooks/useWebSocket";
import { processSensorData } from "../utils/dataProcessingMBS";

// ── Define static Y-axis limits for each sensor ────────────────────────────────
const sensorYAxisLimits: Record<string, { min: number; max: number }> = {
  ECG: { min: -2.0, max: 2.0 }, // mV, sinyal jantung tipikal antara -1.5 sampai +1.5 mV
  PCG: { min: -0.5, max: 0.5 }, // mV, suara jantung umumnya kecil
  PPG: { min: 0.0, max: 1.5 }, // V, tergantung sensor & gain, biasanya dalam volt kecil
  NIBP: { min: 40.0, max: 180.0 }, // mmHg, tekanan darah non-invasif (diastolic-systolic)
  EMG1: { min: -5.0, max: 5.0 }, // mV, sinyal otot bisa bervariasi tergantung aktivitas
  EMG2: { min: -5.0, max: 5.0 }, // mV
  MYOMETER: { min: -200000, max: 200000 }, // N atau AU (arbitrary units), tergantung alat, disesuaikan
  SPIRO: { min: 0.0, max: 8.0 }, // L/s, laju aliran udara dalam pernapasan
  OXYGEN: { min: 80.0, max: 100.0 }, // %, saturasi oksigen
  TEMPERATURE: { min: 35.0, max: 42.0 }, // °C, suhu tubuh manusia normal
  "EEG CH11": { min: -100, max: 100 }, // µV, sinyal EEG
  "EEG CH12": { min: -100, max: 100 },
  "EEG CH13": { min: -100, max: 100 },
  "EEG CH14": { min: -100, max: 100 },
  "EEG CH15": { min: -100, max: 100 },
  "EEG CH16": { min: -100, max: 100 },
};

const MultiBiosignalView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const {
    data: sensorData,
    lastUpdated,
    reconnect,
    isConnected,
  } = useWebSocket("ws://192.168.45.249:8765");

  const dataBufferRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const recordedLogsRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const MAX_BUFFER_SIZE = { "1h": 3600, "6h": 3600 * 6, "24h": 3600 * 24 };

  // ── Collect incoming data into per-sensor buffers ────────────────────────────
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

      dataBufferRef.current[sensorName] = [
        ...currentBuffer,
        ...newBuffer,
      ].slice(-MAX_BUFFER_SIZE[timeRange]);
    }
  }, [sensorData, selectedSensors, timeRange]);

  // ── Toggle recording on/off and capture final logs ───────────────────────────
  const toggleRecording = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (next) {
        recordedLogsRef.current = {};
      } else {
        for (const name of selectedSensors) {
          recordedLogsRef.current[name] = dataBufferRef.current[name] || [];
        }
        console.log("📁 Recorded logs:", recordedLogsRef.current);
      }
      return next;
    });
  };

  // ── Download recorded logs as CSV ────────────────────────────────────────────
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
    link.setAttribute("download", "recorded_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Process raw buffers into chart-ready and status data ─────────────────────
  const processedData = useMemo(() => {
    const selectedBuffer: Record<string, { x: Date; y: number }[]> = {};
    for (const name of selectedSensors) {
      if (dataBufferRef.current[name]) {
        selectedBuffer[name] = dataBufferRef.current[name];
      }
    }
    return processSensorData(selectedBuffer);
  }, [sensorData, selectedSensors, timeRange]);

  // ── Format last-updated timestamp display ────────────────────────────────────
  const formattedTime = useMemo(
    () =>
      lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString("en-US", { hour12: false })
        : "--:--:--",
    [lastUpdated]
  );

  // ── Count statuses for status cards ──────────────────────────────────────────
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

  // ── Sensor group definitions ────────────────────────────────────────────────
  const sensorGroups = {
    Sensor: [
      "ECG",
      "PCG",
      "PPG",
      "NIBP",
      "EMG1",
      "EMG2",
      "MYOMETER",
      "SPIRO",
      "OXYGEN",
      "TEMPERATURE",
      "EEG CH11",
      "EEG CH12",
      "EEG CH13",
      "EEG CH14",
      "EEG CH15",
      "EEG CH16",
    ],
  };

  // ── Toggle sensor selection in sidebar ──────────────────────────────────────
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
        {/* Sidebar: Sensor list */}
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

        {/* Main: Charts */}
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
                    <div className="flex items-center space-x-4">
                      <select
                        value={timeRange}
                        onChange={(e) =>
                          setTimeRange(e.target.value as "1h" | "6h" | "24h")
                        }
                        className="rounded-md border border-gray-500 bg-gray-700 text-sm py-1 px-2 text-gray-200"
                      >
                        <option value="1h">Last 1h</option>
                        <option value="6h">Last 6h</option>
                        <option value="24h">Last 24h</option>
                      </select>
                      <button
                        onClick={() =>
                          setSelectedSensors((prev) =>
                            prev.filter((name) => name !== sensorName)
                          )
                        }
                        className="text-sm text-gray-300 hover:text-gray-100"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    <SensorChart
                      data={sensor.chartData}
                      timeRange={timeRange}
                      color="#EF4444"
                      simplified={false}
                      yAxisLimits={sensorYAxisLimits[sensorName]}
                    />
                  </div>
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

export default MultiBiosignalView;
