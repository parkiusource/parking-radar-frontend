let socket;
let pingInterval;

export const connectWebSocket = (url, onMessage) => {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');

    pingInterval = setInterval(() => {
      console.log('Sending ping');
      socket.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('Message from server:', data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    console.log('WebSocket connection closed');

    if (pingInterval) {
      clearInterval(pingInterval);
    }
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }

  if (pingInterval) {
    clearInterval(pingInterval);
  }
};
