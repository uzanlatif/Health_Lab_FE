import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div
      className="flex h-screen overflow-hidden bg-gray-950 text-gray-100"
      style={{ paddingTop: 'env(safe-area-inset-top)' }} // ✅ Tambahkan safe area top
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
