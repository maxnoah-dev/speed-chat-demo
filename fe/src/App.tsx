import React, { useState, useCallback, useRef, useEffect } from 'react';
import { JoinForm, MatchForm } from './features/chat';
import type { JoinFormValues } from './features/chat';
import { ChatWindow, type ChatWindowState } from './components/ChatWindow';
import { useTheme } from './contexts/ThemeContext';
import type { SystemTheme, ChatFrameColor } from './contexts/ThemeContext';
import { cn } from './lib/utils';
import { Sun, Moon, Monitor, Palette, RotateCcw } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';

const CHAT_JOIN_STORAGE_KEY = 'speed_chat_join';

type FormMode = 'room' | 'match';

const CHAT_FRAME_COLORS: { value: ChatFrameColor; label: string }[] = [
  { value: 'violet', label: 'Tím' },
  { value: 'blue', label: 'Xanh' },
  { value: 'emerald', label: 'Lục' },
  { value: 'rose', label: 'Hồng' },
  { value: 'slate', label: 'Xám' },
];

function loadStoredJoin(): JoinFormValues | null {
  try {
    const raw = localStorage.getItem(CHAT_JOIN_STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as JoinFormValues;
    if (v && typeof v.sender === 'string' && typeof v.room_code === 'string' && v.sender.trim() && v.room_code.trim()) {
      return { sender: v.sender.trim(), room_code: v.room_code.trim(), room_name: typeof v.room_name === 'string' ? v.room_name : '' };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveStoredJoin(values: JoinFormValues) {
  try {
    localStorage.setItem(CHAT_JOIN_STORAGE_KEY, JSON.stringify(values));
  } catch {
    // ignore
  }
}

function clearStoredJoin() {
  try {
    localStorage.removeItem(CHAT_JOIN_STORAGE_KEY);
  } catch {
    // ignore
  }
}

function createWindowState(joinValues: JoinFormValues, isFirst = false): ChatWindowState {
  return {
    id: `w-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    joinValues,
    x: 24,
    y: 24,
    width: 420,
    height: 560,
    isMinimized: false,
    isFloating: !isFirst,
  };
}

function App() {
  const { systemTheme, setSystemTheme, chatFrameColor, setChatFrameColor, customBackground, setCustomBackground } = useTheme();
  const [formMode, setFormMode] = useState<FormMode>('room');
  const [windows, setWindows] = useState<ChatWindowState[]>(() => {
    const stored = loadStoredJoin();
    if (!stored) return [];
    return [createWindowState(stored, true)];
  });
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);

  const handleJoin = useCallback((values: JoinFormValues) => {
    saveStoredJoin(values);
    setWindows((prev) => {
      const exists = prev.some((w) => w.joinValues.room_code === values.room_code && w.joinValues.sender === values.sender);
      if (exists) return prev;
      return [...prev, createWindowState(values, prev.length === 0)];
    });
    setShowAddRoom(false);
  }, []);

  const handleMatchFound = useCallback((payload: { room_code: string; partner_name: string; your_display_name: string }) => {
    handleJoin({
      sender: payload.your_display_name,
      room_code: payload.room_code,
      room_name: `Chat với ${payload.partner_name}`,
    });
  }, [handleJoin]);

  const handleLeave = useCallback((id: string) => {
    setWindows((prev) => {
      const next = prev.filter((w) => w.id !== id);
      if (next.length === 0) clearStoredJoin();
      else if (next.every((w) => w.isFloating || w.isMinimized)) {
        next[0] = { ...next[0], isFloating: false, isMinimized: false };
      }
      return next;
    });
  }, []);

  const handleWindowStateChange = useCallback((id: string, patch: Partial<ChatWindowState>) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
  }, []);

  const hasRooms = windows.length > 0;

  if (!hasRooms && !showAddRoom) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground transition-smooth safe-area-top safe-area-bottom">
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 p-3 border-b border-border bg-card/80 backdrop-blur-md">
          <span className="text-sm font-medium">Chat</span>
        <ThemeToggles
          systemTheme={systemTheme}
          setSystemTheme={setSystemTheme}
          chatFrameColor={chatFrameColor}
          setChatFrameColor={setChatFrameColor}
          customBackground={customBackground}
          setCustomBackground={setCustomBackground}
          showThemePanel={showThemePanel}
          setShowThemePanel={setShowThemePanel}
        />
      </div>
      <div className="py-6 px-4 md:py-10 md:px-6 max-w-lg mx-auto">
          <div className="flex justify-center gap-2 mb-6">
            <button
              type="button"
              onClick={() => setFormMode('room')}
              className={cn(
                'px-4 py-2.5 rounded-full text-sm font-medium transition-smooth',
                formMode === 'room' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Chat theo phòng
            </button>
            <button
              type="button"
              onClick={() => setFormMode('match')}
              className={cn(
                'px-4 py-2.5 rounded-full text-sm font-medium transition-smooth',
                formMode === 'match' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              Ghép đôi
            </button>
          </div>
          {formMode === 'room' ? (
            <JoinForm onSubmit={handleJoin} />
          ) : (
            <MatchForm onMatchFound={handleMatchFound} />
          )}
        </div>
      </div>
    );
  }

  if (showAddRoom) {
    return (
      <div className="min-h-[100dvh] bg-background transition-smooth">
        <div className="sticky top-0 z-20 flex items-center justify-between p-3 border-b border-border bg-card/80 backdrop-blur-md">
          <button type="button" onClick={() => setShowAddRoom(false)} className="text-sm text-primary">
            ← Quay lại
          </button>
        </div>
        <div className="py-6 px-4 max-w-md mx-auto">
          <JoinForm onSubmit={handleJoin} />
        </div>
      </div>
    );
  }

  const mainWindow = windows.find((w) => !w.isFloating && !w.isMinimized) ?? windows[0];
  const showMainInline = mainWindow && !mainWindow.isFloating && !mainWindow.isMinimized;
  const overlayWindows = windows.filter((w) => w.isFloating || w.isMinimized);

  return (
    <div className="min-h-[100dvh] bg-muted/30 text-foreground transition-smooth safe-area-top safe-area-bottom">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 p-2 md:p-3 border-b border-border bg-card/80 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium truncate">Chat · {windows.length} phòng</span>
          <button
            type="button"
            onClick={() => setShowAddRoom(true)}
            className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
          >
            + Thêm phòng
          </button>
        </div>
        <ThemeToggles
          systemTheme={systemTheme}
          setSystemTheme={setSystemTheme}
          chatFrameColor={chatFrameColor}
          setChatFrameColor={setChatFrameColor}
          customBackground={customBackground}
          setCustomBackground={setCustomBackground}
          showThemePanel={showThemePanel}
          setShowThemePanel={setShowThemePanel}
        />
      </div>

      <div className="p-2 md:p-4 flex flex-col h-[calc(100dvh-52px)] min-h-0">
        {showMainInline && mainWindow && (
          <div className="flex-1 min-h-0 min-w-0 flex flex-col">
            <ChatWindow
              state={mainWindow}
              onStateChange={handleWindowStateChange}
              onLeave={handleLeave}
              roomCode={mainWindow.joinValues.room_code}
              isOnlyWindow={windows.length === 1}
            />
          </div>
        )}
        {!showMainInline && windows.length > 0 && (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Thu nhỏ hoặc bấm vào thanh phòng để mở rộng
          </div>
        )}
      </div>

      {overlayWindows.map((w) => (
        <ChatWindow
          key={w.id}
          state={w}
          onStateChange={handleWindowStateChange}
          onLeave={handleLeave}
          roomCode={w.joinValues.room_code}
          isOnlyWindow={false}
        />
      ))}
    </div>
  );
}

function ThemeToggles({
  systemTheme,
  setSystemTheme,
  chatFrameColor,
  setChatFrameColor,
  customBackground,
  setCustomBackground,
  showThemePanel,
  setShowThemePanel,
}: {
  systemTheme: SystemTheme;
  setSystemTheme: (t: SystemTheme) => void;
  chatFrameColor: ChatFrameColor;
  setChatFrameColor: (c: ChatFrameColor) => void;
  customBackground: string | null;
  setCustomBackground: (hex: string | null) => void;
  showThemePanel: boolean;
  setShowThemePanel: (v: boolean) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showThemePanel) return;
    const close = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setShowThemePanel(false);
    };
    document.addEventListener('click', close, true);
    return () => document.removeEventListener('click', close, true);
  }, [showThemePanel, setShowThemePanel]);

  return (
    <div className="relative flex items-center gap-1" ref={panelRef}>
      <button
        type="button"
        onClick={() => setShowThemePanel(!showThemePanel)}
        className="p-2 rounded-lg hover:bg-muted transition-smooth touch-manipulation"
        title="Màu sắc"
        aria-label="Màu sắc"
      >
        <Palette className="h-4 w-4 text-muted-foreground" />
      </button>
      {showThemePanel && (
        <div className="absolute right-0 top-full mt-1 p-3 rounded-xl border border-border bg-card shadow-lg text-sm z-50 min-w-[200px] max-w-[260px]">
          <p className="font-medium text-foreground mb-2">Giao diện</p>
          <div className="flex gap-1 mb-3">
            {[
              { v: 'light' as const, Icon: Sun },
              { v: 'dark' as const, Icon: Moon },
              { v: 'system' as const, Icon: Monitor },
            ].map(({ v, Icon }) => (
              <button
                key={v}
                type="button"
                onClick={() => setSystemTheme(v)}
                className={cn(
                  'p-2 rounded-lg transition-smooth',
                  systemTheme === v ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
                )}
                title={v === 'system' ? 'Theo hệ thống' : v === 'light' ? 'Sáng' : 'Tối'}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
          <p className="font-medium text-foreground mb-1.5">Màu khung chat</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {CHAT_FRAME_COLORS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setChatFrameColor(value)}
                className={cn(
                  'px-2.5 py-1 rounded-lg text-xs transition-smooth',
                  chatFrameColor === value ? 'ring-2 ring-offset-2 ring-primary bg-primary/20' : 'bg-muted hover:bg-muted/80'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="font-medium text-foreground mb-1.5">Màu nền</p>
          <div className="mb-2">
            <HexColorPicker
              color={customBackground ?? '#f5f3ff'}
              onChange={setCustomBackground}
              className="!w-full"
              style={{ width: '100%' }}
            />
          </div>
          <button
            type="button"
            onClick={() => setCustomBackground(null)}
            className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 transition-smooth"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Đặt mặc định
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
