let socket;

export const connectWebSocket = (url, onMessage) => {
  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
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
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }
};
