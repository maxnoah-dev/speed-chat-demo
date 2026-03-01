import React, { useCallback, useRef } from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import { Button } from './ui/button';
import { Mic, Square } from 'lucide-react';
import { cn } from '../lib/utils';

interface VoiceRecordButtonProps {
  onRecorded: (file: File) => void;
  onError?: (message: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Dùng react-media-recorder: ghi âm → dừng → onStop(blobUrl) → fetch blob → onRecorded(file). */
export function VoiceRecordButton({ onRecorded, onError, disabled, className }: VoiceRecordButtonProps) {
  const onRecordedRef = useRef(onRecorded);
  onRecordedRef.current = onRecorded;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const handleStop = useCallback((_blobUrl: string, blob: Blob) => {
    try {
      const ext = blob.type === 'audio/wav' ? 'wav' : blob.type?.split('/')[1] || 'webm';
      const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: blob.type || 'audio/wav' });
      onRecordedRef.current(file);
    } catch (err) {
      console.error('Voice to file error:', err);
      onErrorRef.current?.('Không thể xử lý bản ghi âm.');
    }
  }, []);

  const { status, startRecording, stopRecording, error } = useReactMediaRecorder({
    audio: true,
    onStop: handleStop,
  });

  const isRecording = status === 'recording';

  React.useEffect(() => {
    if (!error || error === 'NONE' || error === '') return;
    const messages: Record<string, string> = {
      permission_denied: 'Cần cho phép truy cập micro để ghi âm.',
      media_aborted: 'Đã hủy ghi âm.',
      no_specified_media_found: 'Không tìm thấy micro.',
      media_in_use: 'Micro đang được dùng bởi ứng dụng khác.',
      invalid_media_constraints: 'Cấu hình micro không hợp lệ.',
      no_constraints: 'Thiếu cấu hình micro.',
      recorder_error: 'Lỗi ghi âm.',
    };
    const msg = messages[error] || `Lỗi: ${error}`;
    if (onErrorRef.current) onErrorRef.current(msg);
    else alert(msg);
  }, [error]);

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
