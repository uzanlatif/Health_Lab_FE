import React, { useState } from 'react';
import { User } from 'lucide-react';
import { useIpAddress } from '../context/IpAddressContext';

const Navbar: React.FC = () => {
  const [showIpInput, setShowIpInput] = useState(false);
  const [localIpAddress, setLocalIpAddress] = useState('');
  
  // Ambil setter dari context
  const { setIpAddress } = useIpAddress();

  const handleProfileClick = () => {
    setShowIpInput((prev) => !prev);
  };

  const handleSaveIp = () => {
    setIpAddress(localIpAddress);  // update IP di context
    setShowIpInput(false);
    console.log("IP Address saved:", localIpAddress);
  };

  return (
    <header className="bg-gray-900 shadow-sm border-b border-gray-800">
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold">Pi</span>
            </div>
            <h1 className="text-xl font-bold text-white hidden md:block">SensorView</h1>
          </div>
        </div>

        <div className="relative flex items-center space-x-4">
          <button
            onClick={handleProfileClick}
            className="p-2 rounded-full hover:bg-gray-800 transition-colors"
          >
            <User className="h-5 w-5 text-gray-300" />
          </button>

          {showIpInput && (
            <div className="absolute right-0 top-12 bg-gray-800 p-4 rounded shadow-md w-64 z-10">
              <label className="block text-sm text-white mb-2">IP Address</label>
              <input
                type="text"
                value={localIpAddress}
                onChange={(e) => setLocalIpAddress(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none"
                placeholder="e.g. 192.168.1.1"
              />
              <button
                onClick={handleSaveIp}
                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
