import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  BarChart2,
  Cpu,
  Activity,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import axios from "axios";
import LogoImage from "../assets/wa.jpg";
import { useWebSocketConfig } from "../context/WebSocketConfigContext";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [loadingItem, setLoadingItem] = useState<string | null>(null);
  const [disableNav, setDisableNav] = useState(false); // ⛔ Blokir klik

  const { ip } = useWebSocketConfig();
  const port = import.meta.env.VITE_PORT_CONTROL;

  const API_URL = useMemo(() => {
    if (!ip || !port) {
      console.warn("Missing IP or port for API");
      return "";
    }
    return `http://${ip}:${port}`;
  }, [ip, port]);

  const navItems = [
    { label: "MultiBioSignal", icon: BarChart2, path: "/mbs", script: "server_mbs.py" },
    { label: "12-Leads ECG", icon: Cpu, path: "/ecg", script: "server_ecg.py" },
    { label: "16-Channels EEG", icon: Activity, path: "/eeg", script: "server_eeg.py" },
  ];

  const runAndNavigate = async (item: (typeof navItems)[0]) => {
    if (!API_URL || disableNav) return; // Blokir klik saat loading

    setLoadingItem(item.script);
    setDisableNav(true);
    navigate(item.path); // ⏩ Navigasi instan

    try {
      await axios.post(`${API_URL}/run`, { script_name: item.script });
      setSelectedServer(item.script);
    } catch (err) {
      alert("❌ Failed to start server");
      console.error(err);
    }

    // ⏱️ Tunggu 5 detik sebelum izinkan navigasi lagi
    setTimeout(() => {
      setDisableNav(false);
      setLoadingItem(null);
    }, 5000);
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-gray-900 text-gray-100 shadow-md z-10 flex flex-col h-screen border-r border-gray-800 transition-all duration-300`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center">
          <img
            src={LogoImage}
            alt="Logo"
            className="mr-3 max-h-10 rounded"
            style={{ width: isCollapsed ? "2rem" : "2.5rem", height: "auto" }}
          />
          {!isCollapsed && <h1 className="text-xl font-bold text-white">Biopulse</h1>}
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
          const isLoading = loadingItem === item.script;

          return (
            <div
              key={index}
              onClick={() => runAndNavigate(item)}
              className={`flex items-center justify-between px-4 py-3 text-sm font-medium cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              } ${disableNav ? "opacity-60 pointer-events-none" : ""}`}
            >
              <div className="flex items-center">
                <item.icon
                  className={`mr-3 h-5 w-5 ${
                    isActive ? "text-white" : "text-gray-400"
                  }`}
                />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && isLoading && (
                <Loader2 className="animate-spin w-4 h-4 text-white" />
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
