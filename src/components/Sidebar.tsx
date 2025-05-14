import React, { useState } from 'react';
import { BarChart2, Cpu, Activity } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState<string>('MultiBioSignal');

  const navItems = [
    { label: 'MultiBioSignal', icon: BarChart2 },
    { label: '12-Leads ECG', icon: Cpu },
    { label: '16-Channels EEG', icon: Activity },
  ];

  return (
    <div className="w-64 bg-white shadow-md z-10 flex flex-col h-screen border-r border-gray-200">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mr-3">
          <span className="text-white font-bold">Pi</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800">Health Labs</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pt-4 space-y-1">
        {navItems.map((item, index) => {
          const isActive = activeItem === item.label;
          return (
            <div
              key={index}
              onClick={() => setActiveItem(item.label)}
              className={`flex items-center px-4 py-3 text-sm font-medium cursor-pointer transition-colors 
                ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              <item.icon className={`mr-3 h-5 w-5 ${isActive ? 'text-white' : ''}`} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      {/* Footer - Status */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <span className="text-blue-500 font-bold">RP</span>
          </div>
          <div className="flex flex-col">
            <p className="font-medium text-sm text-gray-800">Raspberry Pi</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
