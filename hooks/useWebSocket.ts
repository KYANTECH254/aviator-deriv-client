import { GetCookie } from '@/lib/Functions';
import { useState, useEffect, useRef, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseWebSocketProps {
  onMessage: (message: any) => void;
  onConnect: () => void;
  onDisconnect: () => void;
}

const useWebSocket = ({ onMessage, onConnect, onDisconnect }: UseWebSocketProps) => {
  const [wsconnected, setConnected] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  const token = GetCookie('token');

  const stableOnMessage = useCallback(onMessage, []);
  const stableOnConnect = useCallback(onConnect, []);
  const stableOnDisconnect = useCallback(onDisconnect, []);

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(`${process.env.NEXT_PUBLIC_API_URL}`, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('[WebSocket] Connected');
      setConnected(true);
      stableOnConnect();
    });

    socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setConnected(false);
      stableOnDisconnect();
    });

    socket.onAny((eventName, data) => {
      stableOnMessage({ eventName, data });
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token, stableOnConnect, stableOnDisconnect, stableOnMessage]);

  return {
    wsconnected,
    wssocket: socketRef.current,
  };
};

export default useWebSocket;
