import React, { useState, useEffect } from 'react';
import { User, Network } from 'lucide-react';
import MetaLogo from '../assets/meta_logo-2-removebg-preview.png';
import { Capacitor } from '@capacitor/core';
import { useWebSocketConfig } from '../context/WebSocketConfigContext';

const Navbar: React.FC = () => {
  const { ip, setIp } = useWebSocketConfig(); // ✅ gunakan context
  const [editing, setEditing] = useState(false);
  const [tempIp, setTempIp] = useState(ip);

  const isNative = Capacitor.isNativePlatform();

  const handleSave = () => {
    setIp(tempIp); // ✅ simpan ke context, otomatis trigger reconnect
    setEditing(false);
  };

  useEffect(() => {
    setTempIp(ip); // ✅ sync dengan context jika IP berubah
  }, [ip]);

  return (
    <header
      className="bg-gray-900 shadow-sm border-b border-gray-800"
      style={{
        paddingTop: isNative ? '0px' : 'env(safe-area-inset-top, 0px)',
        minHeight: '56px',
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Kiri: Logo */}
        <div className="flex items-center">
          <img
            src={MetaLogo}
            alt="Logo"
            className="mr-3 max-h-10"
            style={{ height: 'auto', width: 'auto', padding: 8 }}
          />
        </div>

        {/* Kanan: IP + Icon */}
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

          <button className="p-2 rounded-full hover:bg-gray-800 transition-colors">
            <User className="h-5 w-5 text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
