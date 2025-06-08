// src/context/WebSocketConfigContext.tsx
import React, { createContext, useContext, useState } from "react";

interface WebSocketConfig {
  ip: string;
  setIp: (ip: string) => void;
}

const WebSocketConfigContext = createContext<WebSocketConfig | undefined>(undefined);

export const WebSocketConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ip, setIpState] = useState(() => localStorage.getItem("ip_address") || "192.168.1.100");

  const setIp = (newIp: string) => {
    localStorage.setItem("ip_address", newIp);
    setIpState(newIp);
  };

  return (
    <WebSocketConfigContext.Provider value={{ ip, setIp }}>
      {children}
    </WebSocketConfigContext.Provider>
  );
};

export const useWebSocketConfig = (): WebSocketConfig => {
  const context = useContext(WebSocketConfigContext);
  if (!context) {
    throw new Error("useWebSocketConfig must be used within a WebSocketConfigProvider");
  }
  return context;
};
