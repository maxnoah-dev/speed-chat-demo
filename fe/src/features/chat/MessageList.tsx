import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble } from './MessageBubble';
import { FileViewerModal } from './FileViewerModal';
import type { ChatMessage } from '../../types/chat';
import { ScrollArea } from '../../components/ui/scroll-area';

interface MessageListProps {
  messages: ChatMessage[];
  currentSender: string;
}

export function MessageList({ messages, currentSender }: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerName, setViewerName] = useState<string | null>(null);

  const onPreviewAttachment = useCallback((url: string, name: string | null) => {
    setViewerUrl(url);
    setViewerName(name || null);
    setViewerOpen(true);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      <ScrollArea className="flex-1 min-h-0 px-4 py-3">
        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">
              Chưa có tin nhắn. Gửi lời chào, sticker hoặc GIF nhé 👋
            </p>
          )}
          {messages.map((msg, idx) => (
            <MessageBubble
              key={msg.id ?? idx}
              message={msg}
              isOwn={msg.sender === currentSender}
              onPreviewAttachment={onPreviewAttachment}
            />
          ))}
          <div ref={endRef} />
        </div>
      </ScrollArea>
      <FileViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        url={viewerUrl}
        fileName={viewerName}
      />
    </>
  );
}
