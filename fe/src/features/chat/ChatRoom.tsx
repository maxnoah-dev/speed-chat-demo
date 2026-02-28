import React, { useState, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import type { ChatMessage } from '../../types/chat';
import type { JoinFormValues } from './JoinForm';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Button } from '../../components/ui/button';
import { Card } from '../../components/ui/card';

interface ChatRoomProps {
  joinValues: JoinFormValues;
  onLeave: () => void;
}

export function ChatRoom({ joinValues, onLeave }: ChatRoomProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [info, setInfo] = useState('');

  const payload = {
    room_code: joinValues.room_code,
    room_name: joinValues.room_name,
    sender: joinValues.sender,
  };

  const { sendMessage } = useSocket(
    !!(joinValues.room_code && joinValues.sender),
    payload,
    {
      onRoomHistory: useCallback((msgs: ChatMessage[]) => setMessages(msgs), []),
      onNewMessage: useCallback((msg: ChatMessage) => setMessages((prev) => [...prev, msg]), []),
      onUserJoined: useCallback(({ sender }: { sender: string }) => {
        setInfo(`${sender} đã tham gia phòng`);
        setTimeout(() => setInfo(''), 2500);
      }, []),
    }
  );

  const handleSend = useCallback(
    (content: string, attachmentName?: string, attachmentUrl?: string) => {
      sendMessage({
        room_code: joinValues.room_code,
        sender: joinValues.sender,
        content,
        attachment_name: attachmentName,
        attachment_url: attachmentUrl,
      });
    },
    [sendMessage, joinValues.room_code, joinValues.sender]
  );

  return (
    <Card className="flex flex-col w-full max-w-[520px] mx-auto overflow-hidden h-[calc(100vh-4rem)] min-h-[480px] border-border">
      <header className="flex items-center justify-between gap-3 p-4 border-b border-border bg-card">
        <div className="min-w-0 flex-1">
          <h1 className="font-semibold text-foreground truncate">
            {joinValues.room_name || joinValues.room_code}
          </h1>
          <p className="text-xs text-muted-foreground">
            Mã phòng: <strong className="text-foreground">{joinValues.room_code}</strong>
            {' · '}
            Bạn: <strong className="text-foreground">{joinValues.sender}</strong>
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onLeave} className="shrink-0">
          Thoát phòng
        </Button>
      </header>

      {info && (
        <div className="px-4 py-2 text-center text-sm bg-muted text-muted-foreground border-b border-border">
          {info}
        </div>
      )}

      <div className="flex flex-1 flex-col min-h-0 bg-muted/30">
        <MessageList messages={messages} currentSender={joinValues.sender} />
        <MessageInput onSend={handleSend} />
      </div>
    </Card>
  );
}
