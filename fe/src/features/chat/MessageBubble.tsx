import React from 'react';
import { getAttachmentFullUrl } from '../../services/api';
import type { ChatMessage } from '../../types/chat';
import { cn } from '../../lib/utils';

interface MessageBubbleProps {
  message: ChatMessage;
  isOwn: boolean;
  onPreviewAttachment?: (url: string, name: string | null) => void;
}

function isImageAttachment(url: string, name?: string | null): boolean {
  const u = (url || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return /\.(jpe?g|png|gif|webp)$/i.test(u) || /\.(jpe?g|png|gif|webp)$/i.test(n);
}

function isVideoAttachment(url: string, name?: string | null): boolean {
  const u = (url || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(u) || /\.(mp4|webm|mov|avi|mkv)$/i.test(n);
}

function isAudioAttachment(url: string, name?: string | null): boolean {
  const u = (url || '').toLowerCase();
  const n = (name || '').toLowerCase();
  return /\.(mp3|ogg|wav|webm|m4a|aac)(\?|$)/i.test(u) || /\.(mp3|ogg|wav|webm|m4a|aac)$/i.test(n);
}

function getAttachmentsList(message: ChatMessage): { name: string; url: string }[] {
  if (Array.isArray(message.attachments) && message.attachments.length > 0) {
    return message.attachments;
  }
  if (message.attachment_url) {
    return [{ name: message.attachment_name ?? 'Tệp', url: message.attachment_url }];
  }
  return [];
}

export function MessageBubble({ message, isOwn, onPreviewAttachment }: MessageBubbleProps) {
  const time = message.created_at
    ? new Date(message.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    : '';
  const attachmentsList = getAttachmentsList(message);

  const handleAttachmentClick = (e: React.MouseEvent, url: string, name: string | null) => {
    if (onPreviewAttachment) {
      e.preventDefault();
      onPreviewAttachment(url, name);
    }
  };

  const hasMediaOnly = attachmentsList.length > 0 && !message.content;
  const hasImageOrVideo = attachmentsList.some(
    (a) => isImageAttachment(a.url, a.name) || isVideoAttachment(a.url, a.name)
  );

  return (
    <div
      className={cn(
        'max-w-[78%] rounded-2xl text-sm break-words transition-smooth overflow-hidden',
        isOwn ? 'ml-auto bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border shadow-sm rounded-tl-md',
        hasMediaOnly && hasImageOrVideo ? 'p-0' : 'px-4 py-2.5'
      )}
    >
      {!isOwn && (
        <div className={cn('font-medium text-muted-foreground uppercase tracking-wider mb-1 text-[11px]', hasMediaOnly && hasImageOrVideo ? 'px-4 pt-2' : '')}>
          {message.sender}
        </div>
      )}
      {attachmentsList.length > 0 && (
        <div className={cn('space-y-1', !(hasMediaOnly && hasImageOrVideo) && 'mb-1.5', hasMediaOnly && hasImageOrVideo ? 'px-0' : '')}>
          {attachmentsList.map((att, i) => {
            const fullUrl = getAttachmentFullUrl(att.url);
            const isImage = isImageAttachment(att.url, att.name);
            const isVideo = isVideoAttachment(att.url, att.name);
            const isAudio = isAudioAttachment(att.url, att.name);
            if (isImage) {
              return (
                <a
                  key={i}
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => handleAttachmentClick(e, att.url, att.name)}
                  className="block w-full cursor-pointer"
                >
                  <img
                    src={fullUrl}
                    alt={att.name || 'Ảnh'}
                    className="w-full max-h-[280px] object-contain bg-transparent"
                  />
                </a>
              );
            }
            if (isVideo) {
              return (
                <div key={i} className="w-full overflow-hidden bg-transparent">
                  <video
                    src={fullUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full max-h-[280px] object-contain"
                  />
                </div>
              );
            }
            if (isAudio) {
              return (
                <div key={i} className={cn('w-full', !(hasMediaOnly && hasImageOrVideo) && 'rounded-lg')}>
                  <audio src={fullUrl} controls className="w-full max-w-full" />
                </div>
              );
            }
            return (
              <a
                key={i}
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => handleAttachmentClick(e, att.url, att.name)}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer max-w-full',
                  isOwn ? 'bg-white/10 border border-white/20 text-primary-foreground' : 'bg-muted border border-border text-foreground'
                )}
              >
                <span>📎</span>
                <span className="truncate">{att.name || 'Tệp đính kèm'}</span>
              </a>
            );
          })}
        </div>
      )}
      {message.content && <div className={cn('whitespace-pre-wrap leading-snug', (hasMediaOnly && hasImageOrVideo) ? 'px-4 pb-2' : '')}>{message.content}</div>}
      <div className={cn('text-[11px] mt-1.5 text-right', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground', (hasMediaOnly && hasImageOrVideo) ? 'px-4 pb-2' : '')}>
        {time}
      </div>
    </div>
  );
}
