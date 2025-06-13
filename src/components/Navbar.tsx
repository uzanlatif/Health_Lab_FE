import React, { useEffect, useState } from 'react';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryWarning,
  Network,
} from 'lucide-react';
import MetaLogo from '../assets/meta_logo-2-removebg-preview.png';
import { Capacitor } from '@capacitor/core';
import { useWebSocketConfig } from '../context/WebSocketConfigContext';

const Navbar: React.FC = () => {
  const { ip, setIp } = useWebSocketConfig();
  const [editing, setEditing] = useState(false);
  const [tempIp, setTempIp] = useState(ip);

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryVoltage, setBatteryVoltage] = useState<number | null>(null);
  const [batteryStatus, setBatteryStatus] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    setTempIp(ip);
  }, [ip]);

  useEffect(() => {
    const fetchBattery = async () => {
      if (!window.batteryAPI?.getBatteryStatus) return;
      try {
        const { voltage, capacity, status, error } = await window.batteryAPI.getBatteryStatus();
        if (error) return console.error("Battery error:", error);
        setBatteryLevel(capacity);
        setBatteryVoltage(voltage);
        setBatteryStatus(status);
      } catch (err) {
        console.error("Battery fetch error:", err);
      }
    };

    fetchBattery();
    const interval = setInterval(fetchBattery, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setIp(tempIp);
    setEditing(false);
  };

  const getBatteryIcon = () => {
    switch ((batteryStatus || "").toLowerCase()) {
      case "full": return <BatteryFull className="h-5 w-5 text-green-500" />;
      case "high": return <BatteryCharging className="h-5 w-5 text-blue-500" />;
      case "medium": return <BatteryCharging className="h-5 w-5 text-yellow-400" />;
      case "low": return <BatteryLow className="h-5 w-5 text-orange-400" />;
      case "critical": return <BatteryWarning className="h-5 w-5 text-red-500" />;
      default: return <BatteryWarning className="h-5 w-5 text-gray-500" />;
    }
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
        <div className="flex items-center">
          <img
            src={MetaLogo}
            alt="Logo"
            className="mr-3 max-h-10"
            style={{ height: 'auto', width: 'auto', padding: 8 }}
          />
        </div>

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

          {/* Battery Info */}
          {batteryLevel !== null && batteryVoltage !== null && (
            <div className="flex items-center text-sm text-gray-300 space-x-1">
              {getBatteryIcon()}
              <span>{batteryLevel.toFixed(0)}%</span>
              <span className="text-xs text-gray-400">({batteryVoltage.toFixed(2)}V)</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
