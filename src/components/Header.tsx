import React from "react";
import { Play, StopCircle } from "lucide-react";

interface HeaderProps {
  isConnected: boolean;
  isRecording: boolean;
  statusCounts: { all: number };
  formattedTime: string;
  reconnect: () => void;
  toggleRecording: () => void;
}

const Header: React.FC<HeaderProps> = ({
  isConnected,
  isRecording,
  statusCounts,
  formattedTime,
  reconnect,
  toggleRecording,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      {/* Title & Status */}
      <div>
        <h1 className="text-2xl font-bold text-white">Multi-Biosignals Monitor</h1>
        <p className="text-gray-300">
          Monitoring {statusCounts.all} health sensors | Last updated: {formattedTime}
          <span
            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected
                ? "bg-green-900 text-green-200"
                : "bg-red-900 text-red-200"
            }`}
          >
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </p>
      </div>

      {/* Buttons */}
      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        <button
          onClick={reconnect}
          className="ml-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center"
        >
          <Play className="w-4 h-4 mr-2" />
          Start
        </button>

        <button
          onClick={reconnect}
          className="ml-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center"
        >
          <StopCircle className="w-4 h-4 mr-2" />
          Stop
        </button>

        <button
          onClick={toggleRecording}
          className={`ml-2 px-4 py-2 ${
            isRecording
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-blue-500 hover:bg-blue-600"
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
      </div>
    </div>
  );
};

export default Header;
