import React, { useState } from 'react';
import { JoinForm, MatchForm, ChatRoom } from './features/chat';
import type { JoinFormValues } from './features/chat';
import { cn } from './lib/utils';

const CHAT_JOIN_STORAGE_KEY = 'speed_chat_join';

type FormMode = 'room' | 'match';

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

function App() {
  const [joinValues, setJoinValues] = useState<JoinFormValues | null>(() => loadStoredJoin());
  const [joined, setJoined] = useState(() => !!loadStoredJoin());
  const [formMode, setFormMode] = useState<FormMode>('room');

  const handleJoin = (values: JoinFormValues) => {
    setJoinValues(values);
    setJoined(true);
    saveStoredJoin(values);
  };

  const handleMatchFound = (payload: { room_code: string; partner_name: string; your_display_name: string }) => {
    handleJoin({
      sender: payload.your_display_name,
      room_code: payload.room_code,
      room_name: `Chat với ${payload.partner_name}`,
    });
  };

  const handleLeave = () => {
    setJoined(false);
    setJoinValues(null);
    clearStoredJoin();
  };

  if (!joined || !joinValues) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40 py-8 px-4 md:py-12 md:px-6 transition-smooth">
        <div className="flex justify-center gap-2 mb-8">
          <button
            type="button"
            onClick={() => setFormMode('room')}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium transition-smooth shadow-sm',
              formMode === 'room'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            )}
          >
            Chat theo phòng
          </button>
          <button
            type="button"
            onClick={() => setFormMode('match')}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-medium transition-smooth shadow-sm',
              formMode === 'match'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border'
            )}
          >
            Ghép đôi ngẫu nhiên
          </button>
        </div>
        {formMode === 'room' ? (
          <JoinForm onSubmit={handleJoin} />
        ) : (
          <MatchForm onMatchFound={handleMatchFound} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 py-6 px-4 md:py-8 md:px-6 transition-smooth">
      <ChatRoom joinValues={joinValues} onLeave={handleLeave} />
    </div>
  );
}

export default App;
