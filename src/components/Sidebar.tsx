import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  BarChart2,
  Cpu,
  Activity,
  ChevronLeft,
  ChevronRight,
  Power,
} from 'lucide-react';
import axios from 'axios';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const API_URL = 'https://10.42.0.1:8000'; // Ganti dengan IP Raspberry Pi

  // Setiap item punya path dan script server yang ingin dijalankan
  const navItems = [
    { label: 'MultiBioSignal', icon: BarChart2, path: '/mbs', script: 'server_mbs_ssl.py' },
    { label: '12-Leads ECG', icon: Cpu, path: '/ecg', script: 'server_ecg_ssl.py' },
    { label: '16-Channels EEG', icon: Activity, path: '/eeg', script: 'server_eeg_ssl.py' },
  ];

  const runAndNavigate = async (item: (typeof navItems)[0]) => {
    try {
      await axios.post(`${API_URL}/run`, { script_name: item.script });
      setSelectedServer(item.script);
      navigate(item.path);
    } catch (err) {
      alert('❌ Failed to start server');
      console.error(err);
    }
  };

  // const stopServer = async () => {
  //   try {
  //     await axios.post(`${API_URL}/stop`);
  //     setSelectedServer(null);
  //   } catch (err) {
  //     alert('❌ Failed to stop server');
  //     console.error(err);
  //   }
  // };

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-gray-100 shadow-md z-10 flex flex-col h-screen border-r border-gray-800 transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mr-3">
            <span className="text-white font-bold">BP</span>
          </div>
          {!isCollapsed && <h1 className="text-xl font-bold text-white">Biopulse 2.0</h1>}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-gray-400 hover:text-white"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation (combined with server selection) */}
      <nav className="flex-1 pt-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={index}
              onClick={() => runAndNavigate(item)}
              className={`flex items-center px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </div>
          );
        })}
      </nav>

    </div>
  );
};

export default Sidebar;
