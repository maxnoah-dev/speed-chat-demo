import React, { useState, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import { playMessageNotificationSound } from '../../utils/notificationSound';
import type { ChatMessage } from '../../types/chat';
import type { JoinFormValues } from './JoinForm';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

/** Chuẩn hóa mã phòng giống backend: trim + uppercase */
function normalizeRoomCode(code: string): string {
  return (code ?? '').trim().toUpperCase();
}

interface ChatRoomProps {
  joinValues: JoinFormValues;
  onLeave: () => void;
}

export function ChatRoom({ joinValues, onLeave }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [info, setInfo] = useState('');
  /** Tên phòng từ server (đồng bộ cho mọi user trong phòng) */
  const [serverRoomName, setServerRoomName] = useState<string | null>(null);

  const roomCode = normalizeRoomCode(String(joinValues.room_code ?? ''));
  const payload = {
    room_code: roomCode,
    room_name: joinValues.room_name,
    sender: joinValues.sender,
  };

  const onNewMessageCb = useCallback(
    (msg: ChatMessage) => {
      const isFromOthers = msg.sender !== joinValues.sender;
      if (isFromOthers) {
        playMessageNotificationSound();
      }
      setMessages((prev) => {
        const optimisticIdx = prev.findIndex(
          (m) => (m as ChatMessage & { _opt?: boolean })._opt && m.sender === msg.sender && m.content === msg.content
        );
        if (optimisticIdx >= 0) {
          const next = [...prev];
          next[optimisticIdx] = msg;
          return next;
        }
        return [...prev, msg];
      });
    },
    [joinValues.sender]
  );

  const { sendMessage, isConnected } = useSocket(
    !!(roomCode && joinValues.sender),
    payload,
    {
      onRoomHistory: useCallback((msgs: ChatMessage[]) => setMessages(msgs), []),
      onNewMessage: onNewMessageCb,
      onUserJoined: useCallback(({ sender }: { sender: string }) => {
        setInfo(`${sender} đã tham gia phòng`);
        setTimeout(() => setInfo(''), 2500);
      }, []),
      onRoomInfo: useCallback(({ room_name }: { room_code: string; room_name: string }) => {
        setServerRoomName(room_name);
      }, []),
      onRoomError: useCallback(({ error }: { error: string }) => {
        setInfo(`Lỗi phòng: ${error}`);
        setTimeout(() => setInfo(''), 10000);
      }, []),
      onSendMessageError: useCallback(({ error }: { error: string }) => {
        setInfo(`Gửi tin nhắn thất bại: ${error}`);
        setTimeout(() => setInfo(''), 10000);
      }, []),
    }
  );

  const handleSend = useCallback(
    (content: string, attachments?: { name: string; url: string }[]) => {
      const optMsg: ChatMessage & { _opt?: boolean } = {
        sender: joinValues.sender,
        content,
        attachments: attachments ?? undefined,
        created_at: new Date().toISOString(),
        _opt: true,
      };
      setMessages((prev) => [...prev, optMsg]);
      sendMessage({
        room_code: roomCode,
        sender: joinValues.sender,
        content,
        attachments,
      });
    },
    [sendMessage, roomCode, joinValues.sender]
  );

  return (
    <Card className="flex flex-col w-full max-w-[520px] mx-auto overflow-hidden h-[calc(100vh-4rem)] min-h-[480px] rounded-2xl border-border shadow-xl shadow-black/5 transition-smooth">
      <header className="flex items-center justify-between gap-3 p-4 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-foreground truncate text-lg">
            {serverRoomName ?? (joinValues.room_name || roomCode)}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Mã phòng: <strong className="text-foreground">{roomCode}</strong>
            {' · '}
            Bạn: <strong className="text-foreground">{joinValues.sender}</strong>
            {typeof isConnected === 'boolean' && (
              <>
                {' · '}
                <span className={isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
                  {isConnected ? 'Đã kết nối' : 'Đang kết nối...'}
                </span>
              </>
            )}
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onLeave} className="shrink-0 rounded-xl transition-smooth">
          Thoát phòng
        </Button>
      </header>

      {info && (
        <div className="px-4 py-2 text-center text-sm bg-accent/50 text-muted-foreground border-b border-border transition-smooth">
          {info}
        </div>
      )}

      <div className="flex flex-1 flex-col min-h-0 bg-muted/20">
        <MessageList messages={messages} currentSender={joinValues.sender} />
        <MessageInput onSend={handleSend} />
      </div>
    </Card>
  );
}
