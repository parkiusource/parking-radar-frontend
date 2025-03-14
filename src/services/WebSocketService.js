// Constants for WebSocket configuration
const WS_PING_INTERVAL = 30000; // 30 seconds
const RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

// Environment detection
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.pingInterval = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.isIntentionallyClosed = false;
    this.url = null;
    this.onMessageCallback = null;
    this.onConnectionChange = null;
    this.debug = import.meta.env.DEV;
    this.connecting = false;
  }

  getWebSocketURL(baseURL) {
    try {
      // In development, use Vite's WebSocket proxy
      if (isDevelopment) {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${wsProtocol}//${window.location.host}/ws`;
      }

      // For production, convert the provided URL
      // Remove trailing slashes safely without regex backtracking
      while (baseURL.endsWith('/')) {
        baseURL = baseURL.slice(0, -1);
      }
      // Remove '/ws' suffix if present
      if (baseURL.endsWith('/ws')) {
        baseURL = baseURL.slice(0, -3);
      }
      return baseURL.replace(/^http/, 'ws') + '/ws';
    } catch (error) {
      console.error('Error constructing WebSocket URL:', error);
      // Fallback to direct connection in development
      if (isDevelopment) {
        return 'ws://localhost:8000/ws';
      }
      // Fallback to production URL
      return 'wss://parking-radar.onrender.com/ws';
    }
  }

  connect(baseURL, onMessage, onConnectionChange) {
    // If we're already in the process of connecting, don't start a new connection
    if (this.connecting) {
      this.debug && console.log('Already attempting to connect, ignoring duplicate request');
      return;
    }

    // If already connected and open, just update callbacks
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.debug && console.log('WebSocket already connected, updating callbacks');
      this.onMessageCallback = onMessage;
      this.onConnectionChange = onConnectionChange;
      onConnectionChange?.(true);
      return;
    }

    // Reset flags for a new connection attempt
    this.isIntentionallyClosed = false;
    this.connecting = true;
    this.onMessageCallback = onMessage;
    this.onConnectionChange = onConnectionChange;

    try {
      // Close any existing socket before creating a new one
      if (this.socket) {
        this.socket.onclose = null; // Remove any existing close handler
        this.socket.onerror = null; // Remove any existing error handler
        this.socket.close();
        this.socket = null;
      }

      const wsUrl = this.getWebSocketURL(baseURL);
      this.url = wsUrl;
      this.socket = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      this.connecting = false;
      this.debug && console.error('Error connecting to WebSocket:', error);
      this.onConnectionChange?.(false);
      // Don't auto-reconnect here, let the hook handle reconnections
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      this.connecting = false;
      this.debug && console.log('WebSocket connected successfully to:', this.url);
      this.reconnectAttempts = 0;
      this.onConnectionChange?.(true);
      this.startPingInterval();
    };

    this.socket.onclose = (event) => {
      this.connecting = false;
      this.debug && console.log('WebSocket connection closed:', event.code);
      this.cleanup();
      this.onConnectionChange?.(false);

      // Don't automatically reconnect - let the hook handle reconnections
    };

    this.socket.onerror = (error) => {
      this.connecting = false;
      this.debug && console.error('WebSocket error:', error);
      this.onConnectionChange?.(false);
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'pong') {
          this.debug && console.log('Received pong from server');
          return;
        }
        this.onMessageCallback?.(data);
      } catch (error) {
        this.debug && console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  handleReconnect() {
    if (this.isIntentionallyClosed || this.reconnectAttempts >= RECONNECT_ATTEMPTS) {
      this.debug && console.warn('Max reconnection attempts reached or connection intentionally closed');
      return;
    }

    const delay = Math.min(
      INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts),
      MAX_RECONNECT_DELAY
    );

    this.debug && console.log(`Attempting to reconnect in ${delay}ms (Attempt ${this.reconnectAttempts + 1}/${RECONNECT_ATTEMPTS})`);

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      const baseURL = import.meta.env.VITE_API_BASE_URL;
      this.connect(baseURL, this.onMessageCallback, this.onConnectionChange);
    }, delay);
  }

  startPingInterval() {
    this.cleanup();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
        this.debug && console.log('Sent ping to server');
      }
    }, WS_PING_INTERVAL);
  }

  cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  close() {
    this.isIntentionallyClosed = true;
    this.cleanup();

    if (this.socket) {
      // Remove event handlers to prevent unwanted callbacks
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
      this.socket.onopen = null;

      this.socket.close();
      this.socket = null;
      this.onConnectionChange?.(false);
    }

    // Reset state
    this.connecting = false;
  }
}

// Export a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
