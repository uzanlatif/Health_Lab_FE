import React, { useState } from 'react';

const ECGView: React.FC = () => {

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white-800">12-Lead ECG Monitor</h1>
          <p className="text-white-500">Monitoring cardiac activity | Last updated:</p>
        </div>
      </div>
     
    </div>
  );
};

export default ECGView;