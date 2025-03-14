// Constants for WebSocket configuration
const WS_PING_INTERVAL = 30000; // 30 seconds
const RECONNECT_ATTEMPTS = 5;
const INITIAL_RECONNECT_DELAY = 1000; // 1 second
const MAX_RECONNECT_DELAY = 30000; // 30 seconds

// Environment detection
const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';

// WebSocket URL configuration
const getWebSocketURL = (baseURL) => {
  try {
    // In development, use Vite's WebSocket proxy
    if (isDevelopment) {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      return `${wsProtocol}//${window.location.host}/ws`;
    }

    // For production, convert the provided URL
    baseURL = baseURL.replace(/\/+$/, '').replace(/\/ws$/, '');
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
};

class WebSocketService {
  constructor() {
    this.socket = null;
    this.pingInterval = null;
    this.reconnectAttempts = 0;
    this.reconnectTimeout = null;
    this.isIntentionallyClosed = false;
    this.url = '';
    this.onMessageCallback = null;
    this.debug = isDevelopment;
  }

  connect(baseURL, onMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.debug && console.warn('WebSocket connection already exists');
      return;
    }

    try {
      this.url = getWebSocketURL(baseURL);
      this.onMessageCallback = onMessage;
      this.isIntentionallyClosed = false;
      this.debug && console.log('Attempting to connect to WebSocket at:', this.url);
      this.createWebSocket();
    } catch (error) {
      console.error('Error initializing WebSocket connection:', error);
    }
  }

  createWebSocket() {
    try {
      this.socket = new WebSocket(this.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.handleReconnect();
    }
  }

  setupEventListeners() {
    this.socket.onopen = () => {
      this.debug && console.log('WebSocket connected successfully to:', this.url);
      this.reconnectAttempts = 0;
      this.startPingInterval();
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type !== 'pong') { // Ignore pong messages in logs
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      if (this.debug) {
        console.log('Current WebSocket state:', {
          url: this.url,
          readyState: this.socket.readyState,
          reconnectAttempts: this.reconnectAttempts,
        });
      }
    };

    this.socket.onclose = (event) => {
      this.cleanup();

      if (!this.isIntentionallyClosed) {
        this.debug && console.warn(`WebSocket closed unexpectedly. Code: ${event.code}, Reason: ${event.reason}`);
        this.handleReconnect();
      } else {
        this.debug && console.log('WebSocket closed intentionally');
      }
    };
  }

  startPingInterval() {
    this.cleanup();
    this.pingInterval = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, WS_PING_INTERVAL);
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
      this.createWebSocket();
    }, delay);
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
      this.socket.close();
      this.socket = null;
    }
  }
}

// Export a singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
