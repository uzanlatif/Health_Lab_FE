import React, { useState } from "react";
import { Play, StopCircle } from "lucide-react";
import StatusCards from "../components/StatusCards";
import SensorCard from "../components/SensorCard";
import SensorChart from "../components/SensorChart";
import Header from "../components/Header";
import useWebSocket from "../hooks/useWebSocket";
import { processSensorData } from "../utils/dataProcessingMBS";

const MultiBiosignalView: React.FC = () => {
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h">("6h");
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  const {
    data: sensorData,
    lastUpdated,
    reconnect,
    isConnected,
  } = useWebSocket("ws://172.30.81.62:8765");

  const processedData = processSensorData(sensorData);

  const formattedTime = lastUpdated
    ? new Date(lastUpdated).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "12:14:24 PM";

  const statusCounts = {
    all: Object.keys(processedData).length,
    critical: Object.values(processedData).filter(
      (s) => s.status === "critical"
    ).length,
    warning: Object.values(processedData).filter((s) => s.status === "warning")
      .length,
    normal: Object.values(processedData).filter((s) => s.status === "normal")
      .length,
  };

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

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
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
      />

      {/* Status summary */}
      <StatusCards counts={statusCounts} />

      {/* Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sensor Cards - LEFT */}
        <div className="w-auto max-w-xs space-y-2">
          {Object.entries(sensorGroups).map(([category, sensors]) => (
            <div
              key={category}
              className="bg-gray-800 p-2 rounded-lg shadow-sm border border-gray-600"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-gray-100 capitalize">
                  {category} Signals
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                {sensors.map((sensorName) => {
                  const sensor = processedData[sensorName];
                  if (!sensor) return null;

                  return (
                    <SensorCard
                      key={sensorName}
                      name={sensor.displayName}
                      value={sensor.value}
                      unit={sensor.unit}
                      status={sensor.status}
                      change={sensor.change}
                      onClick={() => setSelectedSensor(sensorName)}
                      isSelected={selectedSensor === sensorName}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sensor Chart - RIGHT */}
        <div className="lg:w-full">
          {selectedSensor && processedData[selectedSensor] ? (
            <div className="bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-600">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100">
                  {processedData[selectedSensor].displayName} Logs
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
                    onClick={() => setSelectedSensor(null)}
                    className="text-sm text-gray-300 hover:text-gray-100"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Grafik */}
              <div className="h-auto">
                <SensorChart
                  data={processedData[selectedSensor].chartData}
                  timeRange={timeRange}
                  color="#EF4444"
                  simplified={false}
                />
              </div>
            </div>
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
