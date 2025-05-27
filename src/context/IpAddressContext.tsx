// src/context/IpAddressContext.tsx
import React, { createContext, useContext, useState } from 'react';

interface IpAddressContextType {
  ipAddress: string;
  setIpAddress: (ip: string) => void;
}

const IpAddressContext = createContext<IpAddressContextType | undefined>(undefined);

export const IpAddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ipAddress, setIpAddress] = useState('');

  return (
    <IpAddressContext.Provider value={{ ipAddress, setIpAddress }}>
      {children}
    </IpAddressContext.Provider>
  );
};

export const useIpAddress = () => {
  const context = useContext(IpAddressContext);
  if (!context) {
    throw new Error('useIpAddress must be used within an IpAddressProvider');
  }
  return context;
};
