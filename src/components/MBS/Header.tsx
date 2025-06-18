import React from "react";
import { Play, StopCircle, Download } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  isRecording: boolean;
  statusCounts: { all: number };
  formattedTime: string;
  elapsedTime: string; // tetap disediakan jika dibutuhkan oleh parent
  reconnect: () => void;
  toggleRecording: () => void;
  onDownload: () => void;
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
}) => {
  const saveLogToFile = async () => {
    try {
      const raw = localStorage.getItem("recordedSensorData");
      if (!raw) {
        alert("No recorded data found.");
        return;
      }

      const parsed: Record<string, { x: string | Date; y: number }[]> = JSON.parse(raw);

      let csv = "Sensor,Timestamp,Value\n";
      Object.entries(parsed).forEach(([sensor, values]) => {
        values.forEach(({ x, y }) => {
          const timeStr = new Date(x).toISOString();
          csv += `${sensor},${timeStr},${y}\n`;
        });
      });

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      const fileName = `biosignal-${Date.now()}.csv`;
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert(`✅ CSV file downloaded as: ${fileName}`);
    } catch (error) {
      console.error("Error saving CSV:", error);
      alert("❌ Failed to download CSV file.");
    }

    onDownload();
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">MultiBioSignal Monitor</h1>
        <p className="text-gray-300">
          Monitoring {statusCounts.all} health sensors | Last updated: {formattedTime}
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? "bg-green-900 text-green-200" : "bg-red-900 text-red-200"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </div>

      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        <button
          onClick={toggleRecording}
          className={`px-4 py-2 ${
            isRecording ? "bg-yellow-500 hover:bg-yellow-600" : "bg-blue-500 hover:bg-blue-600"
          } text-white rounded-lg flex items-center`}
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

        <button
          onClick={saveLogToFile}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Logs
        </button>
      </div>
    </div>
  );
};

export default Header;
