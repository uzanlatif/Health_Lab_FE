import React from 'react';

interface StatusCardsProps {
  counts: {
    all: number;
    critical: number;
    warning: number;
    normal: number;
  };
  // autoRefresh: boolean;
}

const StatusCards: React.FC<StatusCardsProps> = ({ counts }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium mb-2">All Sensors</h3>
        <p className="text-3xl font-bold text-gray-800">{counts.all}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Critical</h3>
        <p className="text-3xl font-bold text-red-500">{counts.critical}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Warning</h3>
        <p className="text-3xl font-bold text-yellow-500">{counts.warning}</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <h3 className="text-gray-500 text-sm font-medium mb-2">Normal</h3>
        <p className="text-3xl font-bold text-green-500">{counts.normal}</p>
      </div>
    </div>
  );
};

export default StatusCards;
