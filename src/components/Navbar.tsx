import React from 'react';
import { User } from 'lucide-react';
import MetaLogo from '../assets/meta_logo-2-removebg-preview.png';
import { Capacitor } from '@capacitor/core';

const Navbar: React.FC = () => {
  const ip = import.meta.env.VITE_IP_ADDRESS;
  const isNative = Capacitor.isNativePlatform(); // true jika di APK/iOS

  return (
    <header
      className="bg-gray-900 shadow-sm border-b border-gray-800"
      style={{
        paddingTop: isNative ? '0px' : 'env(safe-area-inset-top, 0px)',
        minHeight: '56px', // tetap jaga tinggi minimum
      }}
    >
      <div className="flex items-center justify-between px-4 py-3">
        {/* Kiri: Logo dan Judul */}
        <div className="flex items-center">
          <img
            src={MetaLogo}
            alt="Logo"
            className="mr-3 max-h-10"
            style={{ height: 'auto', width: 'auto', padding: 8 }}
          />
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
