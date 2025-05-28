import React from 'react';
import { User } from 'lucide-react';

const Navbar: React.FC = () => {
  const ip = import.meta.env.VITE_IP_ADDRESS;

  return (
    <header
      className="bg-gray-900 shadow-sm border-b border-gray-800"
      style={{ paddingTop: 'env(safe-area-inset-top)' }} // ✅ Safe area padding for status bar
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Kiri: Logo dan Judul */}
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">Pi</span>
          </div>
          <h1 className="text-xl font-bold text-white hidden md:block">SensorView</h1>
        </div>

        {/* Kanan: IP Address + User Icon */}
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">{ip}</span>
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <User className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
