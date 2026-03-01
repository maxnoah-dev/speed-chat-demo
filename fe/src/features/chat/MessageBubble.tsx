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
  /** Tin nhắn chỉ có ảnh/GIF/video: hiển thị như Messenger, không nền/border màu bọc quanh */
  const isBareMedia = hasMediaOnly && hasImageOrVideo;
  /** Tin nhắn chỉ có file (Excel, PDF...): không nền màu, chỉ link gọn */
  const isBareFileOnly = hasMediaOnly && !hasImageOrVideo;

  return (
    <div
      className={cn(
        'max-w-[78%] text-sm break-words transition-smooth',
        isOwn && 'ml-auto',
        // Không dùng bubble màu khi chỉ gửi ảnh/video/file
        isBareMedia && 'rounded-2xl overflow-hidden shadow-sm',
        isBareFileOnly && 'rounded-xl',
        !isBareMedia && !isBareFileOnly && 'rounded-2xl overflow-hidden',
        !isBareMedia && !isBareFileOnly && (isOwn ? 'bg-primary text-primary-foreground shadow-md' : 'bg-card border border-border shadow-sm rounded-tl-md'),
        isBareMedia && 'p-0',
        isBareFileOnly && 'py-1',
        !isBareMedia && !isBareFileOnly && 'px-4 py-2.5'
      )}
    >
      {!isOwn && (
        <div className={cn('font-medium text-muted-foreground uppercase tracking-wider text-[11px]', isBareMedia ? 'px-1 pb-0.5' : isBareFileOnly ? 'mb-1' : 'mb-1')}>
          {message.sender}
        </div>
      )}
      {attachmentsList.length > 0 && (
        <div className={cn('space-y-1', !isBareMedia && !isBareFileOnly && 'mb-1.5')}>
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
                  className="block w-full cursor-pointer rounded-2xl overflow-hidden"
                >
                  <img
                    src={fullUrl}
                    alt={att.name || 'Ảnh'}
                    className="w-full max-h-[280px] object-contain block"
                  />
                </a>
              );
            }
            if (isVideo) {
              return (
                <div key={i} className="w-full rounded-2xl overflow-hidden">
                  <video
                    src={fullUrl}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full max-h-[280px] object-contain block"
                  />
                </div>
              );
            }
            if (isAudio) {
              return (
                <div key={i} className="w-full rounded-lg">
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
                  'inline-flex items-center gap-2 text-sm cursor-pointer max-w-full',
                  isBareFileOnly && 'text-primary hover:underline py-0.5',
                  !isBareFileOnly && 'px-3 py-2 rounded-xl border',
                  !isBareFileOnly && (isOwn ? 'bg-white/10 border-white/20 text-primary-foreground' : 'bg-muted border-border text-foreground')
                )}
              >
                <span>📎</span>
                <span className="truncate">{att.name || 'Tệp đính kèm'}</span>
              </a>
            );
          })}
        </div>
      )}
      {message.content && <div className={cn('whitespace-pre-wrap leading-snug', isBareMedia ? 'px-4 pb-2' : '')}>{message.content}</div>}
      <div
        className={cn(
          'text-[11px] mt-1 text-right',
          isBareMedia && 'text-muted-foreground',
          isBareFileOnly && 'text-muted-foreground',
          !isBareMedia && !isBareFileOnly && (isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'),
          isBareMedia && 'px-1',
          !isBareMedia && !isBareFileOnly && 'mt-1.5'
        )}
      >
        {time}
      </div>
    </div>
  );
}
