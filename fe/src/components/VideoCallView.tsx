import React, { useEffect, useRef } from 'react';
import { useVideoCall } from '../hooks/useVideoCall';
import { Button } from './ui/button';
import { PhoneOff } from 'lucide-react';
import { cn } from '../lib/utils';

interface VideoCallViewProps {
  roomCode: string;
  sender: string;
  onClose: () => void;
}

export function VideoCallView({ roomCode, sender, onClose }: VideoCallViewProps) {
  const { localStream, remoteStream, status, endCall } = useVideoCall(roomCode, sender, true);
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (localRef.current) localRef.current.srcObject = localStream;
  }, [localStream]);
  useEffect(() => {
    if (remoteRef.current) remoteRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  const handleClose = () => {
    endCall();
    onClose();
  };

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-card/95 backdrop-blur rounded-b-2xl overflow-hidden border-b border-border">
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 p-2 min-h-0">
        <div className="relative rounded-xl overflow-hidden bg-muted min-h-[120px]">
          <span className="absolute left-2 top-2 z-10 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded">
            Bạn
          </span>
          {localStream ? (
            <video ref={localRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              {status === 'connecting' ? 'Đang bật camera...' : 'Chưa có video'}
            </div>
          )}
        </div>
        <div className="relative rounded-xl overflow-hidden bg-muted min-h-[120px]">
          <span className="absolute left-2 top-2 z-10 text-xs font-medium text-white bg-black/50 px-2 py-0.5 rounded">
            Đối phương
          </span>
          {remoteStream ? (
            <video ref={remoteRef} autoPlay playsInline className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
              {status === 'connecting' ? 'Đang chờ...' : 'Chưa kết nối'}
            </div>
          )}
        </div>
      </div>
      <div className="p-2 border-t border-border flex justify-center safe-area-bottom">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleClose}
          className={cn('rounded-xl gap-2')}
        >
          <PhoneOff className="h-4 w-4" />
          Kết thúc gọi
        </Button>
      </div>
    </div>
  );
}
