import React, { useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { Button } from './ui/button';
import { Camera, X } from 'lucide-react';

interface CameraCaptureModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

/** Dùng react-webcam: mở camera → chụp → getScreenshot() → chuyển thành File → gọi onCapture(file). Parent upload + gửi. */
export function CameraCaptureModal({ open, onClose, onCapture }: CameraCaptureModalProps) {
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(() => {
    const src = webcamRef.current?.getScreenshot();
    if (!src) return;
    fetch(src)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      })
      .catch(console.error);
  }, [onCapture, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl max-w-lg w-full overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="font-medium">Chụp ảnh</span>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} className="rounded-xl" aria-label="Đóng">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="aspect-video bg-muted">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.9}
            videoConstraints={{ facingMode: 'user' }}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-3 flex justify-center gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-xl">
            Hủy
          </Button>
          <Button type="button" onClick={capture} className="rounded-xl gap-2">
            <Camera className="h-4 w-4" />
            Chụp và gửi
          </Button>
        </div>
      </div>
    </div>
  );
}
