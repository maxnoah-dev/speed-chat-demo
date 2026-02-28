import React, { useState } from 'react';
import { JoinForm, ChatRoom } from './features/chat';
import type { JoinFormValues } from './features/chat';

function App() {
  const [joined, setJoined] = useState(false);
  const [joinValues, setJoinValues] = useState<JoinFormValues | null>(null);

  const handleJoin = (values: JoinFormValues) => {
    setJoinValues(values);
    setJoined(true);
  };

  const handleLeave = () => {
    setJoined(false);
    setJoinValues(null);
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
