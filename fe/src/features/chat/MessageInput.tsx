import React, { useState, useRef, useCallback } from 'react';
import { uploadFile } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';
import { Paperclip, X } from 'lucide-react';

export interface PendingAttachment {
  file: File;
  name: string;
  url?: string;
  error?: string;
  uploading?: boolean;
}

interface MessageInputProps {
  onSend: (content: string, attachmentName?: string, attachmentUrl?: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
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

  const addFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;
      const list = Array.from(files).map((file) => ({ file, name: file.name, uploading: true }));
      setAttachments((prev) => [...prev, ...list]);

      for (let i = 0; i < list.length; i++) {
        const result = await uploadOne(list[i].file);
        setAttachments((prev) => {
          const next = [...prev];
          const idx = next.findIndex((a) => a.file === list[i].file);
          if (idx === -1) return prev;
          if (result) {
            next[idx] = { ...next[idx], url: result.url, name: result.name, uploading: false };
          } else {
            next[idx] = { ...next[idx], error: 'Tải lên thất bại', uploading: false };
          }
          return next;
        });
      }
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
    const hasAttachment = attachments.some((a) => a.url);
    if (!hasContent && !hasAttachment) return;

    const firstOk = attachments.find((a) => a.url);
    onSend(text.trim(), firstOk?.name, firstOk?.url);
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

  return (
    <div
      className={cn(
        'border-t border-border bg-card p-3',
        dragOver && 'bg-muted outline outline-2 outline-dashed outline-border'
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          {attachments.map((a, i) => (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-muted border border-border text-muted-foreground text-xs"
            >
              <span className="max-w-[140px] truncate">
                {a.uploading ? 'Đang tải...' : a.error || a.name}
              </span>
              <button
                type="button"
                className="p-0.5 rounded hover:text-destructive hover:bg-destructive/10 transition-colors"
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
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Đính kèm tệp"
          aria-label="Đính kèm tệp"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          placeholder="Nhập tin nhắn..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          className="flex-1 min-w-0"
        />
        <Button type="submit" disabled={disabled}>Gửi</Button>
      </form>
    </div>
  );
}
