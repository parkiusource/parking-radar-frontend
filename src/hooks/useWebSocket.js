import { useEffect, useRef } from 'react';
import webSocketService from '@/services/WebSocketService';

const CONNECT_DELAY = 1000; // 1 second delay before connecting
const DISCONNECT_DELAY = 500; // 0.5 second delay before disconnecting

export const useWebSocket = ({ onMessage, enabled = true }) => {
  const connectTimeoutRef = useRef(null);
  const disconnectTimeoutRef = useRef(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    const cleanup = () => {
      // Clear any pending timeouts
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }
      if (disconnectTimeoutRef.current) {
        clearTimeout(disconnectTimeoutRef.current);
        disconnectTimeoutRef.current = null;
      }

      // If connected, schedule disconnect
      if (isConnectedRef.current) {
        disconnectTimeoutRef.current = setTimeout(() => {
          webSocketService.close();
          isConnectedRef.current = false;
        }, DISCONNECT_DELAY);
      }
    };

    // Only connect if enabled
    if (enabled) {
      cleanup(); // Clean up any existing connection first

      // Schedule new connection
      connectTimeoutRef.current = setTimeout(() => {
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        webSocketService.connect(baseURL, onMessage);
        isConnectedRef.current = true;
      }, CONNECT_DELAY);
    } else {
      cleanup();
    }

    return cleanup;
  }, [onMessage, enabled]);

  return {
    isConnected: isConnectedRef.current
  };
};
