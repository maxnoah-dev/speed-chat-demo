import React, { useState, useRef, useCallback, useEffect } from 'react';
import { ChatRoom } from '../features/chat';
import type { JoinFormValues } from '../features/chat';
import { Button } from './ui/button';
import { Minus, Square, Maximize2, Video, VideoOff } from 'lucide-react';
import { cn } from '../lib/utils';
import { VideoCallView } from './VideoCallView';

export interface ChatWindowState {
  id: string;
  joinValues: JoinFormValues;
  x: number;
  y: number;
  width: number;
  height: number;
  isMinimized: boolean;
  isFloating: boolean;
}

const MIN_W = 320;
const MIN_H = 400;

interface ChatWindowProps {
  state: ChatWindowState;
  onStateChange: (id: string, patch: Partial<ChatWindowState>) => void;
  onLeave: (id: string) => void;
  roomCode: string;
  isOnlyWindow?: boolean;
}

export function ChatWindow({ state, onStateChange, onLeave, roomCode, isOnlyWindow }: ChatWindowProps) {
  const { id, joinValues, x, y, width, height, isMinimized, isFloating } = state;
  const [isDragging, setDragging] = useState(false);
  const [isResizing, setResizing] = useState(false);
  const dragStart = useRef({ dx: 0, dy: 0 });
  const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });
  const [videoActive, setVideoActive] = useState(false);

  const handleDragStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStart.current = { dx: clientX - x, dy: clientY - y };
      setDragging(true);
    },
    [x, y]
  );

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const nx = Math.max(0, clientX - dragStart.current.dx);
      const ny = Math.max(0, clientY - dragStart.current.dy);
      onStateChange(id, { x: nx, y: ny });
    };
    const up = () => setDragging(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isDragging, id, onStateChange]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      resizeStart.current = { w: width, h: height, x: clientX, y: clientY };
      setResizing(true);
    },
    [width, height]
  );

  useEffect(() => {
    if (!isResizing) return;
    const move = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? (e as TouchEvent).touches[0].clientX : (e as MouseEvent).clientX;
      const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
      const dw = clientX - resizeStart.current.x;
      const dh = clientY - resizeStart.current.y;
      const nw = Math.max(MIN_W, resizeStart.current.w + dw);
      const nh = Math.max(MIN_H, resizeStart.current.h + dh);
      onStateChange(id, { width: nw, height: nh });
    };
    const up = () => setResizing(false);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
  }, [isResizing, id, onStateChange]);

  const toggleMinimize = () => onStateChange(id, { isMinimized: !isMinimized });
  const toggleFloat = () => onStateChange(id, { isFloating: !isFloating });

  if (isMinimized) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onStateChange(id, { isMinimized: false })}
        onKeyDown={(e) => e.key === 'Enter' && onStateChange(id, { isMinimized: false })}
        className={cn(
          'fixed left-4 right-4 md:left-auto md:right-4 md:w-72 bottom-4 z-40 rounded-xl border-2 chat-frame-border border-opacity-60 bg-card/95 backdrop-blur-md shadow-xl p-3 flex items-center justify-between gap-2 transition-smooth safe-area-bottom',
          isFloating && 'cursor-move'
        )}
        style={isFloating ? { left: x, top: y, right: 'auto', bottom: 'auto', width: 280 } : undefined}
      >
        <span className="text-sm font-medium truncate flex-1 min-w-0">
          {joinValues.room_name || joinValues.room_code}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleMinimize(); }} title="Mở rộng">
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); onLeave(id); }} title="Thoát">
            Thoát
          </Button>
        </div>
      </div>
    );
  }

  const content = (
    <>
      <header
        className={cn(
          'flex items-center justify-between gap-2 pl-3 pr-2 py-2 border-b border-border chat-frame-header chat-frame-border rounded-t-2xl select-none',
          isFloating && 'cursor-move touch-none'
        )}
        onMouseDown={isFloating ? handleDragStart : undefined}
        onTouchStart={isFloating ? handleDragStart : undefined}
      >
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-foreground truncate text-sm md:text-base">
            {joinValues.room_name || joinValues.room_code}
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            {joinValues.room_code} · {joinValues.sender}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setVideoActive((v) => !v)}
            title={videoActive ? 'Tắt video' : 'Gọi video'}
          >
            {videoActive ? <VideoOff className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          </Button>
          {!isOnlyWindow && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={toggleMinimize} title="Thu nhỏ">
              <Minus className="h-4 w-4" />
            </Button>
          )}
          {!isOnlyWindow && (
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={toggleFloat} title={isFloating ? 'Ghim vào trang' : 'Kéo ra'}>
              <Square className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => onLeave(id)}>
            Thoát
          </Button>
        </div>
      </header>
      <div className="flex-1 flex flex-col min-h-0 relative">
        {videoActive && (
          <VideoCallView roomCode={roomCode} sender={joinValues.sender} onClose={() => setVideoActive(false)} />
        )}
        <ChatRoom joinValues={joinValues} onLeave={() => onLeave(id)} embedded />
      </div>
      {isFloating && (
        <div
          className="absolute right-0 bottom-0 w-4 h-4 cursor-se-resize touch-none"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          aria-hidden
        >
          <span className="absolute right-1 bottom-1 border-b-2 border-r-2 border-muted-foreground/50 rounded-sm w-2 h-2" />
        </div>
      )}
    </>
  );

  if (isFloating) {
    return (
      <div
        className={cn(
          'fixed z-30 flex flex-col rounded-2xl border-2 chat-frame-border bg-card shadow-2xl overflow-hidden transition-smooth',
          (isDragging || isResizing) && 'pointer-events-none'
        )}
        style={{ left: x, top: y, width, height }}
      >
        {content}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col rounded-2xl border-2 chat-frame-border bg-card shadow-xl overflow-hidden h-full min-h-[320px] transition-smooth')}>
      {content}
    </div>
  );
}
