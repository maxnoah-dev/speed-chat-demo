import { useRef, useCallback, useState, useEffect } from 'react';
import socketIOClient from 'socket.io-client';
import type { MatchSeekPayload, MatchFoundPayload } from '../types/match';

type SocketInstance = ReturnType<typeof socketIOClient>;

const getServerUrl = () =>
  (process.env.REACT_APP_API_URL || 'http://localhost:3002').replace(/[\s;]+$/, '').trim() || 'http://localhost:3002';

export interface UseMatchSocketOptions {
  onMatchFound?: (payload: MatchFoundPayload) => void;
  onMatchError?: (error: string) => void;
}

export function useMatchSocket(options: UseMatchSocketOptions = {}) {
  const { onMatchFound, onMatchError } = options;
  const socketRef = useRef<SocketInstance | null>(null);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    if (socketRef.current?.connected) return socketRef.current;
    const socket = socketIOClient(getServerUrl(), {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 3,
    });
    socketRef.current = socket;
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('match_found', (p: MatchFoundPayload) => {
      setIsWaiting(false);
      onMatchFound?.(p);
    });
    socket.on('match_waiting', () => setIsWaiting(true));
    socket.on('match_error', (data: { error?: string }) => {
      setIsWaiting(false);
      onMatchError?.(data?.error ?? 'Lỗi');
    });
    socket.on('match_cancel_ack', () => setIsWaiting(false));
    return socket;
  }, [onMatchFound, onMatchError]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setIsWaiting(false);
      setIsConnected(false);
    };
  }, []);

  const seek = useCallback(
    (payload: MatchSeekPayload) => {
      const socket = connect();
      setIsWaiting(true);
      socket.emit('match_seek', payload);
    },
    [connect]
  );

  const cancel = useCallback(() => {
    socketRef.current?.emit('match_cancel');
  }, []);

  return { seek, cancel, isWaiting, isConnected };
}
