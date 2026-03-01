import React, { useEffect, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button } from './ui/button';
import { Mic, Square } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceRecordButtonProps {
  onRecorded: (file: File) => void;
  disabled?: boolean;
  className?: string;
}

/** Dùng react-media-recorder: ghi âm → dừng → lấy blob → gọi onRecorded(file). Parent upload + gửi. */
export function VoiceRecordButton({ onRecorded, disabled, className }: VoiceRecordButtonProps) {
  const { status, startRecording, stopRecording, mediaBlobUrl } = useReactMediaRecorder({ audio: true });
  const sentRef = useRef<string | null>(null);

  useEffect(() => {
    if (status !== 'stopped' || !mediaBlobUrl || sentRef.current === mediaBlobUrl) return;
    sentRef.current = mediaBlobUrl;
    fetch(mediaBlobUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
        onRecorded(file);
      })
      .catch(console.error);
  }, [status, mediaBlobUrl, onRecorded]);

  useEffect(() => {
    if (status === 'recording') sentRef.current = null;
  }, [status]);

  const isRecording = status === 'recording';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={disabled}
      title={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
      aria-label={isRecording ? 'Dừng ghi âm' : 'Ghi âm'}
      className={cn('rounded-xl transition-smooth', isRecording && 'bg-destructive/10 text-destructive', className)}
    >
      {isRecording ? <Square className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
