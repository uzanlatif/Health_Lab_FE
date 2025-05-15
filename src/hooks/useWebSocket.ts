import { useState, useEffect, useRef, useCallback } from 'react';

interface SensorSample {
  y: number;
  __timestamp__: number;
}

interface WebSocketData {
  [sensor: string]: SensorSample[];
}

interface WebSocketHookResult {
  data: WebSocketData;
  lastUpdated: Date | null;
  reconnect: () => void;
  isConnected: boolean;
}

const useWebSocket = (url: string): WebSocketHookResult => {
  const [data, setData] = useState<WebSocketData>({});
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const receivedData: WebSocketData = JSON.parse(event.data);

          // Validate structure
          if (typeof receivedData === 'object' && receivedData !== null) {
            for (const sensor in receivedData) {
              const samples = receivedData[sensor];
              if (!Array.isArray(samples)) {
                throw new TypeError(`Invalid data format for ${sensor}`);
              }
            }

            setData(receivedData);
            setLastUpdated(new Date());
            console.log("📥 Received sensorData", receivedData);
          }
        } catch (error) {
          console.error('❌ Error parsing data:', error);
        }
      };

      socket.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = window.setTimeout(() => {
          console.log('🔁 Reconnecting...');
          connect();
        }, 5000);
      };

      socket.onerror = (error) => {
        console.error('⚠️ WebSocket error:', error);
        socket.close();
      };

      socketRef.current = socket;

      return () => {
        socket.close();
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
    } catch (error) {
      console.error('⚠️ Connection error:', error);
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
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  return { data, lastUpdated, reconnect, isConnected };
};

export default useWebSocket;
