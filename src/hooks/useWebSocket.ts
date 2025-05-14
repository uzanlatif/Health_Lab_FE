import { useState, useEffect, useRef, useCallback } from 'react';

interface WebSocketHookResult {
  data: Record<string, number[]>;
  lastUpdated: Date | null;
  reconnect: () => void;
  isConnected: boolean;
}

const useWebSocket = (url: string): WebSocketHookResult => {
  const [data, setData] = useState<Record<string, number[]>>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);
      
      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
      };
      
      socket.onmessage = (event) => {
        try {
          const receivedData = JSON.parse(event.data);
          setData(receivedData);
          setLastUpdated(new Date());
        } catch (error) {
          console.error('Error parsing WebSocket data:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 5 seconds
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('Attempting to reconnect...');
          connect();
        }, 5000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
      
      socketRef.current = socket;
      
      return () => {
        socket.close();
        if (reconnectTimeoutRef.current) {
          window.clearTimeout(reconnectTimeoutRef.current);
        }
      };
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      // Attempt to reconnect after 5 seconds
      reconnectTimeoutRef.current = window.setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect();
      }, 5000);
    }
  }, [url]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.close();
    }
    connect();
  }, [connect]);

  useEffect(() => {
    const cleanup = connect();
    
    return () => {
      if (cleanup) cleanup();
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        window.clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  // Use mock data if no real data is received within 2 seconds
  useEffect(() => {
    const mockDataTimeout = setTimeout(() => {
      if (Object.keys(data).length === 0) {
        // Create mock data for channels
        const mockData: Record<string, number[]> = {};
        
        // Mock ECG data
        mockData.ECG = Array.from({ length: 100 }, () => Math.random() * 50 + 100);
        
        // Mock EEG channels
        for (let i = 11; i <= 16; i++) {
          mockData[`EEG CH${i}`] = Array.from({ length: 100 }, () => Math.random() * 30 + 70);
        }
        
        // Mock other sensors
        mockData.TEMPERATURE = Array.from({ length: 100 }, () => Math.random() * 1 + 37);
        mockData.PPG = Array.from({ length: 100 }, () => Math.random() * 20 + 90);
        mockData.PCG = Array.from({ length: 100 }, () => Math.random() * 30 + 60);
        mockData.OXYGEN = Array.from({ length: 100 }, () => Math.random() * 5 + 95);
        
        setData(mockData);
        setLastUpdated(new Date());
      }
    }, 2000);
    
    return () => clearTimeout(mockDataTimeout);
  }, [data]);

  return { data, lastUpdated, reconnect, isConnected };
};

export default useWebSocket;