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

  const isValidWsUrl = (url: string) => /^(ws|wss):\/\/[a-zA-Z0-9.-]+:\d+$/.test(url);

  const cleanupSocket = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onclose = null;
      socketRef.current.onerror = null;
      socketRef.current.close();
      socketRef.current = null;
    }
    setIsConnected(false);
  };

  const connect = useCallback(() => {
    console.log("🌐 Connecting to:", url);
    cleanupSocket();

    if (!url || !isValidWsUrl(url)) {
      console.warn("⚠️ Invalid WebSocket URL:", url);
      return;
    }

    try {
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("🔌 WebSocket connected");
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const receivedData: WebSocketData = JSON.parse(event.data);
          if (typeof receivedData === 'object' && receivedData !== null) {
            setData(receivedData);
            setLastUpdated(new Date());
          }
        } catch (err) {
          console.error("❌ Error parsing message:", err);
        }
      };

      socket.onclose = () => {
        console.log("🔌 WebSocket disconnected");
        setIsConnected(false);
        reconnectTimeoutRef.current = window.setTimeout(connect, 5000);
      };

      socket.onerror = (err) => {
        console.error("⚠️ WebSocket error:", err);
        socket.close();
      };
    } catch (err) {
      console.error("🚨 Failed to create WebSocket:", err);
    }
  }, [url]); // ✅ url sebagai dependency

  const reconnect = useCallback(() => {
    console.log("🔁 Manual reconnect...");
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => {
      cleanupSocket();
    };
  }, [connect]); // ✅ ini akan rerun saat url berubah

  return { data, lastUpdated, reconnect, isConnected };
};

export default useWebSocket;
