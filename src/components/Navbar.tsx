import React, { useState, useEffect } from 'react';
import { User, Network } from 'lucide-react';
import MetaLogo from '../assets/meta_logo-2-removebg-preview.png';
import { Capacitor } from '@capacitor/core';
import { useWebSocketConfig } from '../context/WebSocketConfigContext';

const Navbar: React.FC = () => {
  const { ip, setIp } = useWebSocketConfig();
  const [editing, setEditing] = useState(false);
  const [tempIp, setTempIp] = useState(ip);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [charging, setCharging] = useState<boolean>(false);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    setTempIp(ip);
  }, [ip]);

  // Fetch battery from Electron preload
  useEffect(() => {
    const fetchBattery = async () => {
      try {
        const result = await window.batteryAPI.getBatteryStatus();
        setBatteryLevel(result.level);
        setCharging(result.charging);
      } catch (error) {
        console.error("Battery fetch error:", error);
      }
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 10000); // refresh every 10 sec
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setIp(tempIp);
    setEditing(false);
  };

  return (
    <header
      className="bg-gray-900 shadow-sm border-b border-gray-800"
      style={{
        paddingTop: isNative ? '0px' : 'env(safe-area-inset-top, 0px)',
        minHeight: '56px',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img
            src={MetaLogo}
            alt="Logo"
            className="mr-3 max-h-10"
            style={{ height: 'auto', width: 'auto', padding: 8 }}
          />
        </div>

        {/* Right: IP + Battery + Profile */}
        <div className="flex items-center space-x-4">
          {editing ? (
            <>
              <input
                className="text-sm bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 w-40"
                value={tempIp}
                onChange={(e) => setTempIp(e.target.value)}
              />
              <button
                onClick={handleSave}
                className="text-sm text-blue-400 hover:underline"
              >
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-1 hover:text-white text-gray-300"
            >
              <Network className="h-5 w-5" />
              <span className="text-sm">{ip}</span>
            </button>
          )}

          {/* Battery Indicator */}
          {batteryLevel !== null && (
            <div className="flex items-center text-sm text-gray-300">
              <div className="relative w-6 h-3 border border-gray-400 rounded-sm mr-1 bg-gray-700">
                <div
                  className="h-full bg-green-400"
                  style={{ width: `${batteryLevel}%` }}
                />
                <div className="absolute top-0 right-[-4px] w-1 h-3 bg-gray-400 rounded-r-sm" />
              </div>
              <span>{batteryLevel}%</span>
              {charging && <span className="ml-1 text-green-400">⚡</span>}
            </div>
          )}

          {/* User Icon */}
          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <User className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
