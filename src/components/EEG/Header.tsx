import React from "react";
import { Play, StopCircle } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  isRecording: boolean;
  statusCounts: { all: number };
  formattedTime: string;
  elapsedTime: string;
  reconnect: () => void;
  toggleRecording: () => void;
  onDownload: () => void;
  clearCache: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  isRecording,
  statusCounts,
  formattedTime,
  elapsedTime,
  reconnect,
  toggleRecording,
  onDownload,
  clearCache,
}) => {
  const saveToUSB = async () => {
    try {
      const raw = localStorage.getItem("recordedSensorData");
      if (!raw) {
        alert("❌ No recorded data found.");
        return;
      }

      const parsed: Record<string, { x: string | Date; y: number }[]> = JSON.parse(raw);
      let csv = "Sensor,Timestamp,Value\n";

      Object.entries(parsed).forEach(([sensor, values]) => {
        values.forEach(({ x, y }) => {
          const timeStr = new Date(x).toLocaleString("sv-SE", {
            timeZone: "Asia/Seoul", // KST
          });
          csv += `${sensor},${timeStr},${y}\n`;
        });
      });

      if (window.usbAPI?.saveToUSB) {
        window.usbAPI.saveToUSB(csv);
      } else {
        alert("❌ usbAPI is not available.");
      }
    } catch (error) {
      console.error("Error saving to USB:", error);
      alert("❌ Failed to export data.");
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      toggleRecording(); // Stop recording
      await saveToUSB(); // Auto download
      clearCache();      // Then clear cache
    } else {
      toggleRecording(); // Start recording
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3">
      <div>
        <h1 className="text-3xl font-bold text-white">EEG Monitor</h1>
        <p className="text-lg text-gray-300 mt-1">
          Monitoring {statusCounts.all} health sensors | Last updated: {formattedTime}
          <span
            className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
              isConnected ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </div>

      <div className="flex items-center mt-4 md:mt-0 space-x-3">
        <button
          onClick={handleToggleRecording}
          className={`px-5 py-2.5 rounded-lg flex items-center font-semibold shadow-md transition-all text-base
            ${
              isRecording
                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:to-yellow-700 text-white ring-1 ring-yellow-300"
                : "bg-gradient-to-r from-blue-500 to-blue-600 hover:to-blue-700 text-white ring-1 ring-blue-300"
            }
          `}
        >
          {isRecording ? (
            <>
              <StopCircle className="w-5 h-5 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Record Logs
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Header;
