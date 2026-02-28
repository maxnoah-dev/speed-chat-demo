import { useEffect, useRef, useCallback } from 'react';
import socketIOClient from 'socket.io-client';
import type { ChatMessage, JoinRoomPayload, SendMessagePayload } from '../types/chat';

type SocketInstance = ReturnType<typeof socketIOClient>;

const getWsUrl = () => {
  const api = process.env.REACT_APP_API_URL || 'http://localhost:3002';
  return api.replace(/^http/, 'ws');
};

export interface SocketCallbacks {
  onRoomHistory?: (messages: ChatMessage[]) => void;
  onNewMessage?: (msg: ChatMessage) => void;
  onUserJoined?: (data: { sender: string }) => void;
}

export function useSocket(
  joined: boolean,
  payload: JoinRoomPayload | null,
  callbacks: SocketCallbacks = {}
) {
  const socketRef = useRef<SocketInstance | null>(null);
  const { onRoomHistory, onNewMessage, onUserJoined } = callbacks;

  useEffect(() => {
    if (!joined || !payload?.room_code?.trim() || !payload?.sender?.trim()) return;

    const socket = socketIOClient(getWsUrl(), { transports: ['websocket'] });
    socketRef.current = socket;

    socket.emit('join_room', payload);

    if (onRoomHistory) socket.on('room_history', onRoomHistory);
    if (onNewMessage) socket.on('new_message', onNewMessage);
    if (onUserJoined) socket.on('user_joined', onUserJoined);

    return () => {
      socket.off('room_history').off('new_message').off('user_joined');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joined, payload?.room_code, payload?.room_name, payload?.sender, onRoomHistory, onNewMessage, onUserJoined]);

  const sendMessage = useCallback((data: SendMessagePayload) => {
    socketRef.current?.emit('send_message', data);
  }, []);

  return { socketRef, sendMessage };
}
