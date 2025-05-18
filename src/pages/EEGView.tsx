import React, { useState } from 'react';

const EEGView: React.FC = () => {

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white-800">16-Lead EEG Monitor</h1>
          <p className="text-white-500">Monitoring cardiac activity | Last updated:</p>
        </div>
      </div>
     
    </div>
  );
};

export default EEGView;
