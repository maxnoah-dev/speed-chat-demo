import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../../types/chat';
import styles from './MessageList.module.css';

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
    <div className={styles.list}>
      {messages.length === 0 && (
        <div className={styles.empty}>Chưa có tin nhắn. Hãy gửi lời chào!</div>
      )}
      {messages.map((msg, idx) => (
        <MessageBubble
          key={msg.id ?? idx}
          message={msg}
          isOwn={msg.sender === currentSender}
        />
      ))}
      <div ref={endRef} />
    </div>
  );
}
