import React, { useState } from 'react';
import { JoinForm, ChatRoom } from './features/chat';
import type { JoinFormValues } from './features/chat';

const CHAT_JOIN_STORAGE_KEY = 'speed_chat_join';

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

  const handleJoin = (values: JoinFormValues) => {
    setJoinValues(values);
    setJoined(true);
    saveStoredJoin(values);
  };

  const handleLeave = () => {
    setJoined(false);
    setJoinValues(null);
    clearStoredJoin();
  };

  if (!joined || !joinValues) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 md:py-12 md:px-6">
        <JoinForm onSubmit={handleJoin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4 md:py-12 md:px-6">
      <ChatRoom joinValues={joinValues} onLeave={handleLeave} />
    </div>
  );
}

export default App;
