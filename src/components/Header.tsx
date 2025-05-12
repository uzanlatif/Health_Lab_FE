import React from 'react';
import { Menu, Bell, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors duration-300">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 lg:hidden focus:outline-none"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-4 lg:ml-0">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <span className="h-6 w-6 bg-blue-500 rounded-md inline-flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Pi</span>
                </span>
                SensorView
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
              onClick={toggleTheme}
            >
              <span className="sr-only">Toggle theme</span>
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none relative"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                RP
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;