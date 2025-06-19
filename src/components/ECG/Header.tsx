import React from "react";
import { Play, StopCircle, Download, Trash2 } from "lucide-react";

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
          }); // Format konsisten untuk Excel
          csv += `${sensor},${timeStr},${y}\n`;
        });
      });

      // ✅ Kirim CSV ke main process Electron (simpan ke USB)
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

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">ECG Monitor</h1>
        <p className="text-gray-300">
          Monitoring {statusCounts.all} health sensors | Last updated: {formattedTime}
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isConnected ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
              }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </div>

      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        {/* Clear Cache Button */}
        <button
          onClick={clearCache}
          className="px-4 py-2 rounded-lg flex items-center font-medium
          bg-gray-700 hover:bg-gray-600 text-white
          ring-1 ring-gray-500 shadow-md hover:shadow-lg transition-all"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Cache
        </button>

        {/* Record Logs Button */}
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 rounded-lg flex items-center font-medium shadow-md transition-all
            ${isRecording
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:to-yellow-700 text-white ring-1 ring-yellow-300"
              : "bg-gradient-to-r from-blue-500 to-blue-600 hover:to-blue-700 text-white ring-1 ring-blue-300"
            }
          `}
        >
          {isRecording ? (
            <>
              <StopCircle className="w-4 h-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Record Logs
            </>
          )}
        </button>

        {/* Save to USB Button */}
        <button
          onClick={saveToUSB}
          className="px-4 py-2 rounded-lg flex items-center font-medium
          bg-gradient-to-r from-green-500 to-green-600 hover:to-green-700 text-white
          ring-1 ring-green-300 shadow-md hover:shadow-lg transition-all"
        >
          <Download className="w-4 h-4 mr-2" />
          Save to USB
        </button>
      </div>
    </div>
  );
};

export default Header;
