import React from 'react';
import { getAttachmentFullUrl } from '../../services/api';
import type { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';

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
    <div
      className={cn(
        'max-w-[78%] rounded-lg px-3.5 py-2.5 text-sm break-words',
        isOwn ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card border border-border shadow-sm'
      )}
    >
      {!isOwn && (
        <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {message.sender}
        </div>
      )}
      {message.attachment_url && (
        <div className="mb-1.5">
          {isImageAttachment(message.attachment_url, message.attachment_name) ? (
            <a href={fullAttachmentUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
              <img
                src={fullAttachmentUrl}
                alt={message.attachment_name || 'Ảnh'}
                className="max-w-full max-h-[220px] rounded-md object-cover"
              />
            </a>
          ) : (
            <a
              href={fullAttachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border',
                isOwn ? 'bg-white/10 border-white/20 text-primary-foreground' : 'bg-muted border-border text-foreground'
              )}
            >
              <span>📎</span>
              <span>{message.attachment_name || 'Tệp đính kèm'}</span>
            </a>
          )}
        </div>
      )}
      {message.content && <div className="whitespace-pre-wrap leading-snug">{message.content}</div>}
      <div className={cn('text-[11px] mt-1.5 text-right', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
        {time}
      </div>
    </div>
  );
}
