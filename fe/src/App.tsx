import React, { useState, useCallback, useRef, useEffect } from 'react';
import { JoinForm, MatchForm } from './features/chat';
import type { JoinFormValues } from './features/chat';
import { ChatWindow, type ChatWindowState } from './components/ChatWindow';
import { useTheme } from './contexts/ThemeContext';
import type { SystemTheme, ChatFrameColor } from './contexts/ThemeContext';
import { cn } from './lib/utils';
import { Sun, Moon, Monitor, Palette, RotateCcw, MessageCircle, Plus, ChevronRight } from 'lucide-react';
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

function normalizeJoinValues(v: { sender?: unknown; room_code?: unknown; room_name?: unknown }): JoinFormValues | null {
  if (!v || typeof v.sender !== 'string' || typeof v.room_code !== 'string' || !v.sender.trim() || !v.room_code.trim()) {
    return null;
  }
  return {
    sender: v.sender.trim(),
    room_code: v.room_code.trim(),
    room_name: typeof v.room_name === 'string' ? v.room_name : '',
  };
}

/** Load danh sách phòng đã join (hỗ trợ cả format cũ: 1 object). */
function loadStoredRooms(): JoinFormValues[] {
  try {
    const raw = localStorage.getItem(CHAT_JOIN_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const list = parsed.map((p: unknown) => normalizeJoinValues(p as Record<string, unknown>)).filter(Boolean) as JoinFormValues[];
      return list;
    }
    const single = normalizeJoinValues(parsed as Record<string, unknown>);
    return single ? [single] : [];
  } catch {
    return [];
  }
}

function saveStoredRooms(rooms: JoinFormValues[]) {
  try {
    if (rooms.length === 0) {
      localStorage.removeItem(CHAT_JOIN_STORAGE_KEY);
    } else {
      localStorage.setItem(CHAT_JOIN_STORAGE_KEY, JSON.stringify(rooms));
    }
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
    const rooms = loadStoredRooms();
    return rooms.map((j, i) => createWindowState(j, i === 0));
  });
  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showAddRoom, setShowAddRoom] = useState(false);
  /** Id phòng đang chọn để hiển thị (Messenger-style). */
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (windows.length === 0) {
      setSelectedRoomId(null);
      return;
    }
    setSelectedRoomId((prev) => {
      if (prev && windows.some((w) => w.id === prev)) return prev;
      return windows[0].id;
    });
  }, [windows]);

  const selectedWindowMeta = selectedRoomId ? windows.find((w) => w.id === selectedRoomId) : null;
  const effectiveSelectedId =
    selectedWindowMeta && !selectedWindowMeta.isFloating && !selectedWindowMeta.isMinimized
      ? selectedRoomId
      : windows.find((w) => !w.isFloating && !w.isMinimized)?.id ?? windows[0]?.id ?? null;

  const handleJoin = useCallback((values: JoinFormValues) => {
    setWindows((prev) => {
      const exists = prev.some((w) => w.joinValues.room_code === values.room_code && w.joinValues.sender === values.sender);
      if (exists) return prev;
      const next = [...prev, createWindowState(values, prev.length === 0)];
      saveStoredRooms(next.map((w) => w.joinValues));
      return next;
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
      if (next.length > 0) {
        if (next.every((w) => w.isFloating || w.isMinimized)) {
          next[0] = { ...next[0], isFloating: false, isMinimized: false };
        }
        saveStoredRooms(next.map((w) => w.joinValues));
      } else {
        saveStoredRooms([]);
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

  const selectedWindow = effectiveSelectedId ? windows.find((w) => w.id === effectiveSelectedId) : null;
  const overlayWindows = windows.filter((w) => w.isFloating || w.isMinimized);

  return (
    <div className="min-h-[100dvh] bg-muted/30 text-foreground transition-smooth safe-area-top safe-area-bottom flex flex-col">
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 p-2 md:p-3 border-b border-border bg-card/80 backdrop-blur-md shrink-0">
        <span className="text-sm font-medium">Speed Chat</span>
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

      <div className="flex-1 flex min-h-0">
        {/* Sidebar danh sách phòng (Messenger-style) */}
        <aside className="w-14 sm:w-56 border-r border-border bg-card/60 flex flex-col shrink-0">
          <div className="p-2 border-b border-border">
            <button
              type="button"
              onClick={() => setShowAddRoom(true)}
              className="w-full flex items-center justify-center sm:justify-start gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:opacity-90"
            >
              <Plus className="h-5 w-5 shrink-0" />
              <span className="hidden sm:inline">Thêm phòng</span>
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto p-1">
            {windows.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => setSelectedRoomId(w.id)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2.5 rounded-xl text-left text-sm transition-smooth',
                  w.id === effectiveSelectedId
                    ? 'bg-primary/15 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <MessageCircle className="h-5 w-5 shrink-0" />
                <span className="min-w-0 truncate hidden sm:block">
                  {w.joinValues.room_name || w.joinValues.room_code}
                </span>
                <ChevronRight className={cn('h-4 w-4 shrink-0 hidden sm:block', w.id === effectiveSelectedId && 'text-primary')} />
              </button>
            ))}
          </nav>
        </aside>

        {/* Khung chat: giới hạn width giống Messenger */}
        <main className="flex-1 min-w-0 flex justify-center md:justify-start overflow-hidden">
          {selectedWindow ? (
            <div className="w-full max-w-[480px] md:max-w-[520px] h-full flex flex-col p-2 md:p-3">
              <ChatWindow
                state={{ ...selectedWindow, isFloating: false, isMinimized: false }}
                onStateChange={handleWindowStateChange}
                onLeave={handleLeave}
                roomCode={selectedWindow.joinValues.room_code}
                isOnlyWindow={windows.length === 1}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm px-4">
              Chọn một phòng bên trái hoặc thêm phòng mới
            </div>
          )}
        </main>
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
