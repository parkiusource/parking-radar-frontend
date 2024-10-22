let socket = null;
let pingInterval = null;

export const connectWebSocket = (url, onMessage) => {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.warn('WebSocket ya está conectado.');
    return;
  }

  socket = new WebSocket(url);

  socket.onopen = () => {
    pingInterval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parking WebSocket message:', error);
    }
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onclose = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    socket = null;
  };
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
  }

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};
