import React from 'react';
import { Bell, Sun, User } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between p-4">
        <div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-md bg-blue-500 flex items-center justify-center mr-3">
              <span className="text-white font-bold">Pi</span>
            </div>
            <h1 className="text-xl font-bold hidden md:block">SensorView</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full hover:bg-gray-100">
            <Sun className="h-5 w-5 text-gray-600" />
          </button>
          
          <button className="p-2 rounded-full hover:bg-gray-100">
            <User className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;