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
      {attachmentsList.length > 0 && (
        <div className="mb-1.5 space-y-2">
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
                  className="inline-block cursor-pointer"
                >
                  <img
                    src={fullUrl}
                    alt={att.name || 'Ảnh'}
                    className="max-w-full max-h-[220px] rounded-md object-cover"
                  />
                </a>
              );
            }
            if (isVideo) {
              return (
                <div key={i} className="rounded-md overflow-hidden max-w-full">
                  <video
                    src={fullUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="max-w-full max-h-[280px] rounded-md"
                  />
                </div>
              );
            }
            if (isAudio) {
              return (
                <div key={i} className="rounded-md">
                  <audio src={fullUrl} controls className="max-w-full" />
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
                  'inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm border cursor-pointer',
                  isOwn ? 'bg-white/10 border-white/20 text-primary-foreground' : 'bg-muted border-border text-foreground'
                )}
              >
                <span>📎</span>
                <span>{att.name || 'Tệp đính kèm'}</span>
              </a>
            );
          })}
        </div>
      )}
      {message.content && <div className="whitespace-pre-wrap leading-snug">{message.content}</div>}
      <div className={cn('text-[11px] mt-1.5 text-right', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
        {time}
      </div>
    </div>
  );
}
