import { useEffect, useRef, useCallback, useState } from 'react';
import socketIOClient from 'socket.io-client';
import type { ChatMessage, JoinRoomPayload, SendMessagePayload } from '../types/chat';

type SocketInstance = ReturnType<typeof socketIOClient>;

/** Cùng base với API; bỏ dấu ; và khoảng trắng thừa (dễ gõ nhầm trong .env) */
const getServerUrl = () =>
  (process.env.REACT_APP_API_URL || 'http://localhost:3002').replace(/[\s;]+$/, '').trim() || 'http://localhost:3002';

export interface RoomInfo {
  room_code: string;
  room_name: string;
}

export interface SocketCallbacks {
  onRoomHistory?: (messages: ChatMessage[]) => void;
  onNewMessage?: (msg: ChatMessage) => void;
  onUserJoined?: (data: { sender: string }) => void;
  onRoomInfo?: (data: RoomInfo) => void;
  onRoomError?: (data: { error: string }) => void;
  onSendMessageError?: (data: { error: string }) => void;
}

export function useSocket(
  joined: boolean,
  payload: JoinRoomPayload | null,
  callbacks: SocketCallbacks = {}
) {
  const socketRef = useRef<SocketInstance | null>(null);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;
  const [isConnected, setIsConnected] = useState(false);

  const {
    onRoomHistory,
    onNewMessage,
    onUserJoined,
    onRoomInfo,
    onRoomError,
    onSendMessageError,
  } = callbacks;

  useEffect(() => {
    if (!joined || !payload?.room_code?.trim() || !payload?.sender?.trim()) return;

    const socket = socketIOClient(getServerUrl(), {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    // 1. Đăng ký listener TRƯỚC khi join để không bỏ lỡ room_history / room_info
    if (onRoomHistory) socket.on('room_history', onRoomHistory);
    if (onNewMessage) socket.on('new_message', onNewMessage);
    if (onUserJoined) socket.on('user_joined', onUserJoined);
    if (onRoomInfo) socket.on('room_info', onRoomInfo);
    if (onRoomError) socket.on('room_error', onRoomError);
    if (onSendMessageError) socket.on('send_message_error', onSendMessageError);

    // 2. Join room khi connect (lần đầu và mỗi lần reconnect)
    const doJoin = () => {
      const p = payloadRef.current;
      if (p?.room_code?.trim() && p?.sender?.trim()) {
        socket.emit('join_room', p);
      }
    };
    socket.on('connect', () => {
      setIsConnected(true);
      doJoin();
    });
    socket.on('disconnect', () => setIsConnected(false));
    setIsConnected(socket.connected);

    return () => {
      socket.off('room_history').off('new_message').off('user_joined').off('room_info');
      socket.off('room_error').off('send_message_error').off('connect').off('disconnect');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [joined, payload?.room_code, payload?.room_name, payload?.sender, onRoomHistory, onNewMessage, onUserJoined, onRoomInfo, onRoomError, onSendMessageError]);

  const sendMessage = useCallback((data: SendMessagePayload) => {
    socketRef.current?.emit('send_message', data);
  }, []);

  return { socketRef, sendMessage, isConnected };
}
