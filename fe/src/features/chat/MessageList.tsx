import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../../types/chat';
import { ScrollArea } from '../../components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessage[];
  currentSender: string;
}

export function MessageList({ messages, currentSender }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <ScrollArea className="flex-1 min-h-0 px-4 py-3">
      <div className="flex flex-col gap-2.5">
        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Chưa có tin nhắn. Hãy gửi lời chào!
          </p>
        )}
        {messages.map((msg, idx) => (
          <MessageBubble key={msg.id ?? idx} message={msg} isOwn={msg.sender === currentSender} />
        ))}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
