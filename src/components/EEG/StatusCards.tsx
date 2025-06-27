"use client";

import React from "react";

interface StatusCardsProps {
  counts: {
    all: number;
    critical: number;
    warning: number;
    normal: number;
  };
  compactView: boolean;
  toggleCompactView: () => void;
  elapsedTime: string;
  onRestartServer: () => void;
}

const cardStyle =
  "bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl shadow-md p-6 flex flex-col justify-between transition-transform hover:scale-[1.02]";

const labelStyle = "text-base text-gray-400 font-semibold"; // was text-sm
const valueStyle = "text-5xl font-bold text-white"; // was text-4xl

const StatusCards: React.FC<StatusCardsProps> = ({
  counts,
  compactView,
  toggleCompactView,
  elapsedTime,
  onRestartServer,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5 w-full">
      {/* Selected Sensors */}
      <div className={cardStyle}>
        <div>
          <p className={labelStyle}>Selected Sensors</p>
          <p className={valueStyle}>{counts.all}</p>
        </div>
      </div>

      {/* Recording Time */}
      <div className={cardStyle}>
        <div>
          <p className={labelStyle}>Recording Time</p>
          <p className="text-2xl text-white font-mono mt-1">
            {elapsedTime !== "00:00:00" ? elapsedTime : "--:--:--"}
          </p>
        </div>
      </div>

      {/* BPM */}
      <div className={cardStyle}>
        <div>
          <p className={labelStyle}>BPM</p>
          <p className="text-2xl text-gray-300 italic mt-1">--</p>
        </div>
      </div>

      {/* Compact / Expand View */}
      <div className={cardStyle}>
        <div className="flex flex-col h-full justify-between">
          <p className={labelStyle}>View Mode</p>
          <button
            className={`
              mt-4 text-base font-semibold px-5 py-2.5 rounded-lg
              bg-gray-700 text-white hover:bg-gray-600
              shadow-md hover:shadow-lg ring-1 ring-gray-500
              transition-all duration-300
            `}
            onClick={toggleCompactView}
          >
            {compactView ? "🔎 Expand View" : "📊 Compact View"}
          </button>
        </div>
      </div>

      {/* Restart Server */}
      <div className={cardStyle}>
        <div className="flex flex-col h-full justify-between">
          <p className={labelStyle}>Server</p>
          <button
            className={`
              mt-4 text-base font-semibold px-5 py-2.5 rounded-lg
              bg-blue-800 text-white hover:bg-blue-600
              shadow-md hover:shadow-lg ring-1 ring-blue-400
              transition-all duration-300
            `}
            onClick={onRestartServer}
          >
            🔁 Restart Server
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusCards;
