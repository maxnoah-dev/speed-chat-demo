import React, { useState, useRef, useCallback } from 'react';
import { uploadFile } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { EmojiStickerPicker } from '../../components/EmojiStickerPicker';
import { GifPicker } from '../../components/GifPicker';
import { VoiceRecordButton } from '../../components/VoiceRecordButton';
import { CameraCaptureModal } from '../../components/CameraCaptureModal';
import { cn } from '../../lib/utils';
import { Paperclip, X, Smile, ImageIcon, Camera } from 'lucide-react';

export interface PendingAttachment {
  file: File;
  name: string;
  url?: string;
  error?: string;
  uploading?: boolean;
}

interface MessageInputProps {
  onSend: (content: string, attachments?: { name: string; url: string }[]) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadOne = useCallback(async (file: File): Promise<{ name: string; url: string } | null> => {
    try {
      const res = await uploadFile(file);
      return { name: res.name, url: res.url };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const sendFileAsAttachment = useCallback(
    async (file: File) => {
      const result = await uploadOne(file);
      if (result) onSend('', [result]);
    },
    [uploadOne, onSend]
  );

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const list = Array.from(files).map((file) => ({ file, name: file.name, uploading: true }));
      setAttachments((prev) => [...prev, ...list]);

      // Upload song song tất cả file
      const uploadResults = await Promise.all(
        list.map(async (item) => {
          const result = await uploadOne(item.file);
          return { item, result };
        })
      );

      setAttachments((prev) => {
        let next = [...prev];
        uploadResults.forEach(({ item, result }) => {
          const idx = next.findIndex((a) => a.file === item.file);
          if (idx === -1) return;
          if (result) {
            next[idx] = { ...next[idx], url: result.url, name: result.name, uploading: false };
          } else {
            next[idx] = { ...next[idx], error: 'Tải lên thất bại', uploading: false };
          }
        });
        return next;
      });
    },
    [uploadOne]
  );

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    const hasContent = text.trim();
    const list = attachments.filter((a) => a.url).map((a) => ({ name: a.name, url: a.url! }));
    const hasAttachment = list.length > 0;
    if (!hasContent && !hasAttachment) return;

    onSend(text.trim(), list.length > 0 ? list : undefined);
    setText('');
    setAttachments([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleEmojiSelect = (emoji: string) => {
    setText((prev) => prev + emoji);
  };

  const handleGifSelect = (gifUrl: string) => {
    setShowGif(false);
    onSend('', [{ name: 'gif.gif', url: gifUrl }]);
  };

  return (
    <div
      className={cn(
        'border-t border-border bg-card/95 backdrop-blur-sm p-3 transition-smooth',
        dragOver && 'bg-muted/80 border-2 border-dashed border-primary/40'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {(showEmoji || showGif) && (
        <div className="mb-3 flex justify-start">
          {showEmoji && (
            <EmojiStickerPicker
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmoji(false)}
            />
          )}
          {showGif && (
            <GifPicker
              onSelect={handleGifSelect}
              onClose={() => setShowGif(false)}
            />
          )}
        </div>
      )}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {attachments.map((a, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-muted/80 border border-border text-muted-foreground text-xs transition-smooth"
            >
              <span className="max-w-[140px] truncate">
                {a.uploading ? 'Đang tải...' : a.error || a.name}
              </span>
              <button
                type="button"
                className="p-0.5 rounded-md hover:text-destructive hover:bg-destructive/10 transition-smooth"
                onClick={() => removeAttachment(i)}
                aria-label="Xóa"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <form className="flex items-center gap-2" onSubmit={handleSubmit}>
        <input
          type="file"
          ref={fileInputRef}
          className="sr-only"
          multiple
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => { setShowGif(false); setShowEmoji((e) => !e); }}
          disabled={disabled}
          title="Sticker / Emoji"
          aria-label="Sticker"
          className={cn('rounded-xl transition-smooth', showEmoji && 'bg-accent')}
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => { setShowEmoji(false); setShowGif((g) => !g); }}
          disabled={disabled}
          title="GIF"
          aria-label="GIF"
          className={cn('rounded-xl transition-smooth', showGif && 'bg-accent')}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <VoiceRecordButton onRecorded={sendFileAsAttachment} disabled={disabled} />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setShowCamera(true)}
          disabled={disabled}
          title="Chụp ảnh"
          aria-label="Chụp ảnh"
          className="rounded-xl transition-smooth"
        >
          <Camera className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Đính kèm tệp"
          aria-label="Đính kèm tệp"
          className="rounded-xl transition-smooth"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <CameraCaptureModal
          open={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={sendFileAsAttachment}
        />
        <Input
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0 rounded-xl border-border transition-smooth"
        />
        <Button type="submit" disabled={disabled} className="rounded-xl transition-smooth">Gửi</Button>
      </form>
    </div>
  );
}
