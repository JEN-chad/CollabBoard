import { io } from 'socket.io-client';

// Use the VITE_SOCKET_URL env variable, or default to backend URL in development, or window origin in production
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.DEV ? 'http://localhost:5000' : window.location.origin);

console.log(`[Socket] Connecting to URL: ${SOCKET_URL}`);

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ['websocket', 'polling'],
});

export default socket;
