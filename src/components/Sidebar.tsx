import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart2, Cpu, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { label: 'MultiBioSignal', icon: BarChart2, path: '/' },
    { label: '12-Leads ECG', icon: Cpu, path: '/ecg' },
    { label: '16-Channels EEG', icon: Activity, path: '/eeg' },
  ];

  return (
    <div
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-gray-900 text-gray-100 shadow-md z-10 flex flex-col h-screen border-r border-gray-800 transition-all duration-300`}
    >
      {/* Header / Logo */}
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

      {/* Navigation */}
      <nav className="flex-1 pt-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={index}
              onClick={() => navigate(item.path)}
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

      {/* Footer - Status */}
      {/* <div className="p-4 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-500 bg-opacity-20 flex items-center justify-center mr-3">
            <span className="text-blue-400 font-bold">RP</span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <p className="font-medium text-sm text-gray-300">Raspberry Pi</p>
            </div>
          )}
        </div>
      </div> */}
    </div>
  );
};

export default Sidebar;
