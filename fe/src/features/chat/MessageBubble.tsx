import React from 'react';
import { getAttachmentFullUrl } from '../../services/api';
import type { ChatMessage } from '../../types/chat';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
}

function isImageAttachment(url: string, name?: string | null): boolean {
  const u = (url || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(u) || /\.(jpe?g|png|gif|webp)$/i.test(n);
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const fullAttachmentUrl = message.attachment_url ? getAttachmentFullUrl(message.attachment_url) : '';

  return (
    <div className={`${styles.bubble} ${isOwn ? styles.own : ''}`}>
      {!isOwn && <div className={styles.senderName}>{message.sender}</div>}
      {message.attachment_url && (
        <div className={styles.attachment}>
          {isImageAttachment(message.attachment_url, message.attachment_name) ? (
            <a href={fullAttachmentUrl} target="_blank" rel="noopener noreferrer" className={styles.attachmentImage}>
              <img src={fullAttachmentUrl} alt={message.attachment_name || 'Ảnh'} />
            </a>
          ) : (
            <a
              href={fullAttachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.attachmentFile}
            >
              <span className={styles.fileIcon}>📎</span>
              <span>{message.attachment_name || 'Tệp đính kèm'}</span>
            </a>
          )}
        </div>
      )}
      {message.content && <div className={styles.content}>{message.content}</div>}
      <div className={styles.time}>{time}</div>
    </div>
  );
}
