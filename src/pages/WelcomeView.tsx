import React from 'react';
import LogoImage from '../assets/wa.jpg';

const WelcomeView: React.FC = () => {
  return (
    <div className="w-full h-screen overflow-hidden bg-gray-900 text-white flex items-center justify-center px-4">
      <div className="bg-gray-800 rounded-lg shadow-md p-4 max-w-md w-full text-center">
        <div className="mb-3">
          <div className="w-10 h-10 rounded-md bg-blue-500 flex items-center justify-center mx-auto mb-2 overflow-hidden">
            <img src={LogoImage} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome to Biopulse 2.0</h1>
          <p className="text-gray-400 text-sm leading-snug">
            Real-time monitoring for ECG & EEG with integrated device control.
          </p>
        </div>
        <p className="text-xs text-gray-500">
          Use the menu on the left to start a signal module.
        </p>
      </div>
    </div>
  );
};

export default WelcomeView;
