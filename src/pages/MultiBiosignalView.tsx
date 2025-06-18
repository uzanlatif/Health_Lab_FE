"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Header from "../components/MBS/Header";
import StatusCards from "../components/MBS/StatusCards";
import SensorCard from "../components/MBS/SensorCard";
import SensorChart from "../components/MBS/SensorChart";
import useWebSocket from "../hooks/useWebSocket";
import { useWebSocketConfig } from "../context/WebSocketConfigContext";
import { processSensorData } from "../utils/dataProcessingMBS";
import { useRecorder } from "../hooks/useRecording";

const MultiBiosignalView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [notchEnabledSensors, setNotchEnabledSensors] = useState<Record<string, boolean>>({});
  const [compactView, setCompactView] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  const { ip } = useWebSocketConfig();
  const port = import.meta.env.VITE_PORT_MBS;
  const websocketUrl = useMemo(() => `ws://${ip}:${port}`, [ip, port]);

  const { data: sensorData, lastUpdated, reconnect, isConnected } = useWebSocket(websocketUrl);

  const {
    isRecording,
    start,
    stop,
    clear: clearCache,
    addData,
  } = useRecorder();

  const dataBufferRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const MAX_BUFFER_SIZE = { "1h": 3600, "6h": 3600 * 6, "24h": 3600 * 24 };

  useEffect(() => {
    if (!sensorData) return;

    const now = new Date();
    addData(
      Object.fromEntries(
        Object.entries(sensorData).map(([key, val]) => [key, val[val.length - 1]?.y ?? 0])
      )
    );

    for (const sensorName of selectedSensors) {
      const values = sensorData[sensorName];
      if (!Array.isArray(values)) continue;

      const current = dataBufferRef.current[sensorName] || [];
      const newBuffer = values
        .filter((v) => typeof v.y === "number" && !isNaN(v.y) && typeof v.__timestamp__ === "number")
        .map((v) => ({ x: new Date(v.__timestamp__ * 1000), y: v.y }));

      dataBufferRef.current[sensorName] = [...current, ...newBuffer].slice(
        -MAX_BUFFER_SIZE[timeRange]
      );
    }
  }, [sensorData, selectedSensors, timeRange, isRecording]);

  useEffect(() => {
    if (!isRecording) {
      clearInterval(timerRef.current!);
      setElapsedTime("00:00:00");
      return;
    }

    startTimeRef.current = new Date();
    timerRef.current = setInterval(() => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTimeRef.current!.getTime()) / 1000);
      const hh = String(Math.floor(elapsed / 3600)).padStart(2, "0");
      const mm = String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0");
      const ss = String(elapsed % 60).padStart(2, "0");
      setElapsedTime(`${hh}:${mm}:${ss}`);
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [isRecording]);

  const processedData = useMemo(() => {
    const selected: Record<string, { x: Date; y: number }[]> = {};
    for (const name of selectedSensors) {
      if (dataBufferRef.current[name]) {
        selected[name] = dataBufferRef.current[name];
      }
    }
    return processSensorData(selected);
  }, [sensorData, selectedSensors, timeRange]);

  const statusCounts = useMemo(() => ({
    all: Object.keys(processedData).length,
    critical: 0,
    warning: 0,
    normal: 0,
  }), [processedData]);

  const formattedTime = useMemo(
    () =>
      lastUpdated
        ? new Date(lastUpdated).toLocaleTimeString("en-US", { hour12: false })
        : "--:--:--",
    [lastUpdated]
  );

  const sensorGroups = {
    Sensor: [
      "ECG", "PPG", "PCG", "EMG1", "EMG2", "MYOMETER",
      "SPIRO", "TEMPERATURE", "NIBP", "OXYGEN",
      "EEG CH11", "EEG CH12", "EEG CH13", "EEG CH14", "EEG CH15", "EEG CH16",
    ],
  };

  const sensorColors: Record<string, string> = {
    ECG: "#10B981",
    PPG: "#3B82F6",
    PCG: "#EF4444",
    EMG1: "#8B5CF6",
    EMG2: "#A855F7",
    MYOMETER: "#6B7280",
    SPIRO: "#06B6D4",
    TEMPERATURE: "#F97316",
    NIBP: "#FACC15",
    OXYGEN: "#60A5FA",
    "EEG CH11": "#C084FC",
    "EEG CH12": "#D946EF",
    "EEG CH13": "#A78BFA",
    "EEG CH14": "#F472B6",
    "EEG CH15": "#FB7185",
    "EEG CH16": "#F87171",
  };
  
  const runServerMBS = async () => {
    try {
      const res = await fetch(`http://${ip}:8000/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_name: "server_mbs.py" }),
      });
      const data = await res.json();
    } catch (err) {
      alert("Failed to start server.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 text-gray-100">
      <Header
        isConnected={isConnected}
        isRecording={isRecording}
        statusCounts={statusCounts}
        formattedTime={formattedTime}
        elapsedTime={elapsedTime}
        reconnect={reconnect}
        toggleRecording={isRecording ? stop : start}
        onDownload={() => {}}
        clearCache={clearCache}
      />

      <StatusCards
        counts={statusCounts}
        compactView={compactView}
        toggleCompactView={() => setCompactView((prev) => !prev)}
        elapsedTime={elapsedTime}
        onRestartServer={runServerMBS}
      />

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
                {sensors.map((sensorName) => (
                  <SensorCard
                    key={sensorName}
                    name={sensorName}
                    onClick={() => {
                      setSelectedSensors((prev) =>
                        prev.includes(sensorName)
                          ? prev.filter((name) => name !== sensorName)
                          : [...prev, sensorName]
                      );
                    }}
                    isSelected={selectedSensors.includes(sensorName)}
                  />
                ))}
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
                        {sensor.displayName} Logs
                      </h2>
                      <label className="text-sm text-gray-300 flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!!notchEnabledSensors[sensorName]}
                          onChange={() =>
                            setNotchEnabledSensors((prev) => ({
                              ...prev,
                              [sensorName]: !prev[sensorName],
                            }))
                          }
                        />
                        60Hz Notch Filter
                      </label>
                    </div>
                    <SensorChart
                      data={sensor.chartData}
                      timeRange={timeRange}
                      color={sensorColors[sensorName] || "#10B981"}
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

export default MultiBiosignalView;