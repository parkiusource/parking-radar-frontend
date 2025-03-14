import { useEffect, useRef, useState, useCallback } from 'react';
import webSocketService from '@/services/WebSocketService';

const CONNECT_DELAY = 1000; // 1 second delay before connecting

export const useWebSocket = ({ onMessage, enabled = true }) => {
  // Refs para mantener referencias estables y evitar re-renders
  const connectTimeoutRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const enabledRef = useRef(enabled);
  const [isConnected, setIsConnected] = useState(false);

  // Actualizar las referencias cuando cambian los props
  useEffect(() => {
    onMessageRef.current = onMessage;
    enabledRef.current = enabled;
  }, [onMessage, enabled]);

  // Use callback to ensure stable reference
  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
  }, []);

  // Handle connection/disconnection
  useEffect(() => {
    console.log('Websocket hook useEffect running, enabled:', enabled);

    // Adaptador para mantener la referencia al callback actualizada
    const messageAdapter = (data) => {
      onMessageRef.current?.(data);
    };

    // Clear any previous connection attempt
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
    }

    // Only attempt to connect if enabled is true
    if (enabled) {
      console.log('Scheduling WebSocket connection...');
      connectTimeoutRef.current = setTimeout(() => {
        console.log('Connecting to WebSocket...');
        const baseURL = import.meta.env.VITE_API_BASE_URL;
        webSocketService.connect(baseURL, messageAdapter, handleConnectionChange);
      }, CONNECT_DELAY);
    } else {
      console.log('WebSocket disabled, closing connection');
      webSocketService.close();
    }

    // Cleanup function that runs when component unmounts
    return () => {
      console.log('WebSocket hook cleanup running');
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      }

      // Solo cerrar cuando el componente se desmonta completamente
      if (!enabledRef.current) {
        console.log('Closing WebSocket in cleanup');
        webSocketService.close();
      }
    };
  }, [enabled, handleConnectionChange]); // No incluir onMessage como dependencia

  return {
    isConnected
  };
};
