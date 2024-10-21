let socket = null;
let pingInterval = null;

export const connectWebSocket = (url, onMessage) => {
  if (socket && socket.readyState !== WebSocket.CLOSED) {
    console.warn('WebSocket ya está conectado.');
    return;
  }

  socket = new WebSocket(url);

  socket.onopen = () => {
    console.log('Connected to WebSocket server');

    // Establecer intervalo de ping cada 30 segundos
    pingInterval = setInterval(() => {
      console.log('Sending ping');
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'ping' }));
      }
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
      pingInterval = null;
    }
    socket = null;
  };
};

export const closeWebSocket = () => {
  if (socket) {
    console.log('Cerrando conexión WebSocket...');
    socket.close();
  }

  if (pingInterval) {
    clearInterval(pingInterval);
    pingInterval = null;
  }
};
