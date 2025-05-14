import React, { useState, useRef, useEffect, useMemo } from "react";
import StatusCards from "../components/StatusCards";
import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import Header from "../components/Header";
import useWebSocket from "../hooks/useWebSocket";
import { processSensorData } from "../utils/dataProcessingMBS";

const MultiBiosignalView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSensors, setSelectedSensors] = useState<string[]>([]);

  const { data: sensorData, lastUpdated, reconnect, isConnected } = useWebSocket("ws://172.30.81.62:8765");

  const dataBufferRef = useRef<Record<string, { x: Date; y: number }[]>>({});
  const MAX_BUFFER_SIZE = { "1h": 3600, "6h": 3600 * 6, "24h": 3600 * 24 };

  // ✅ FIXED TIMESTAMP BUFFERING
  useEffect(() => {
    if (!sensorData) return;

    for (const sensorName of selectedSensors) {
      const newValues = sensorData[sensorName];

      if (!Array.isArray(newValues)) {
        console.warn("Invalid sensor data for:", sensorName, newValues);
        continue;
      }

      const currentBuffer = dataBufferRef.current[sensorName] || [];

      // Dapatkan waktu start berdasarkan waktu terakhir
      let startTime: Date;
      if (currentBuffer.length > 0) {
        const lastTime = currentBuffer[currentBuffer.length - 1].x.getTime();
        startTime = new Date(lastTime + 1000); // tambahkan 1 detik
      } else {
        startTime = new Date(); // mulai dari sekarang
      }

      const newBuffer = newValues.map((v, i) => ({
        x: new Date(startTime.getTime() + i * 1000),
        y: typeof v === "number" && !isNaN(v) ? v : 0,
      }));

      const updatedBuffer = [...currentBuffer, ...newBuffer].slice(-MAX_BUFFER_SIZE[timeRange]);
      dataBufferRef.current[sensorName] = updatedBuffer;
    }
  }, [sensorData, selectedSensors, timeRange]);

  const processedData = useMemo(() => {
    const selectedBuffer: Record<string, { x: Date; y: number }[]> = {};
    for (const name of selectedSensors) {
      if (dataBufferRef.current[name]) {
        selectedBuffer[name] = dataBufferRef.current[name];
      }
    }
    return processSensorData(selectedBuffer);
  }, [sensorData, selectedSensors, timeRange]);

  const formattedTime = useMemo(() =>
    lastUpdated
      ? new Date(lastUpdated).toLocaleTimeString("en-US", { hour12: false })
      : "--:--:--", [lastUpdated]);

  const statusCounts = useMemo(() => ({
    all: Object.keys(processedData).length,
    critical: Object.values(processedData).filter((s) => s.status === "critical").length,
    warning: Object.values(processedData).filter((s) => s.status === "warning").length,
    normal: Object.values(processedData).filter((s) => s.status === "normal").length,
  }), [processedData]);

  const sensorGroups = {
    Sensor: [
      "ECG", "PCG", "PPG", "NIBP", "EMG1", "EMG2", "MYOMETER",
      "SPIRO", "OXYGEN", "TEMPERATURE",
      "EEG CH11", "EEG CH12", "EEG CH13", "EEG CH14", "EEG CH15", "EEG CH16",
    ],
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
        toggleRecording={() => setIsRecording(!isRecording)}
      />

      <StatusCards counts={statusCounts} />

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-auto max-w-xs space-y-2">
          {Object.entries(sensorGroups).map(([category, sensors]) => (
            <div key={category} className="bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-600">
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
              if (!sensor || !sensor.chartData || !Array.isArray(sensor.chartData)) return null;

              return (
                <div key={sensorName} className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-600 mb-4">
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
                    />
                  </div>
                </div>
              );
            })
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
