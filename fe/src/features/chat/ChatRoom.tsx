import React, { useState, useCallback } from 'react';
import { useSocket } from '../../hooks/useSocket';
import type { ChatMessage } from '../../types/chat';
import type { JoinFormValues } from './JoinForm';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import styles from './ChatRoom.module.css';

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

  const { sendMessage } = useSocket(joinValues.room_code && joinValues.sender ? true : false, payload, {
    onRoomHistory: useCallback((msgs: ChatMessage[]) => setMessages(msgs), []),
    onNewMessage: useCallback((msg: ChatMessage) => setMessages((prev) => [...prev, msg]), []),
    onUserJoined: useCallback(({ sender }: { sender: string }) => {
      setInfo(`${sender} đã tham gia phòng`);
      setTimeout(() => setInfo(''), 2500);
    }, []),
  });

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
    <div className={styles.room}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.roomTitle}>{joinValues.room_name || joinValues.room_code}</h1>
          <p className={styles.roomMeta}>
            Mã phòng: <strong>{joinValues.room_code}</strong> · Bạn: <strong>{joinValues.sender}</strong>
          </p>
        </div>
        <button type="button" className={styles.leaveBtn} onClick={onLeave}>
          Thoát phòng
        </button>
      </header>

      {info && <div className={styles.infoBar}>{info}</div>}

      <div className={styles.chatArea}>
        <MessageList messages={messages} currentSender={joinValues.sender} />
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
