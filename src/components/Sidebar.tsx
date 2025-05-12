import React, { useEffect } from 'react';
import { X, LayoutDashboard, Activity, Settings, FileText, BarChart3 } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && (event.target as HTMLElement).closest('#sidebar') === null) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen, setSidebarOpen]);

  // Close sidebar when pressing escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"></div>
      )}

      {/* Sidebar */}
      <div
        id="sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-xs font-bold">Pi</span>
              </div>
              <span className="text-lg font-bold text-gray-800 dark:text-white">SensorView</span>
            </div>
            <button
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Sidebar navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 group"
            >
              <LayoutDashboard className="mr-3 h-5 w-5" />
              Dashboard
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <Activity className="mr-3 h-5 w-5" />
              Sensor Status
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <BarChart3 className="mr-3 h-5 w-5" />
              Analytics
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <FileText className="mr-3 h-5 w-5" />
              Reports
            </a>
            <a
              href="#"
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 group"
            >
              <Settings className="mr-3 h-5 w-5" />
              Settings
            </a>
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                RP
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-800 dark:text-white">Raspberry Pi</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;