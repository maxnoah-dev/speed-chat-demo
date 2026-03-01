import React, { useState } from 'react';
import { generateRoomCode } from '../../services/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export interface JoinFormValues {
  sender: string;
  room_code: string;
  room_name: string;
}

interface JoinFormProps {
  onSubmit: (values: JoinFormValues) => void;
}

export function JoinForm({ onSubmit }: JoinFormProps) {
  const [sender, setSender] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateNew = async () => {
    if (!sender.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const code = roomCode.trim()
        ? roomCode.trim().toUpperCase()
        : await generateRoomCode();
      if (!roomCode.trim()) setRoomCode(code);
      onSubmit({
        sender: sender.trim(),
        room_code: code,
        room_name: `Phòng ${code}`,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tạo mã phòng. Thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!sender.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    if (!roomCode.trim()) {
      setError('Vui lòng nhập mã phòng hoặc bấm "Tạo phòng mới"');
      return;
    }
    onSubmit({
      sender: sender.trim(),
      room_code: roomCode.trim(),
      room_name: '',
    });
  };

  return (
    <Card className="w-full max-w-[400px] mx-auto rounded-2xl border-border shadow-xl shadow-black/5 transition-smooth">
      <CardHeader className="text-center space-y-2 pb-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">Chat nhóm</CardTitle>
        <CardDescription className="text-muted-foreground">Nhập tên và mã phòng — không cần đăng nhập</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-4" onSubmit={handleJoin}>
          <Input
            placeholder="Tên của bạn *"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            maxLength={100}
            className="rounded-xl border-border bg-background transition-smooth"
          />
          <div className="flex gap-2">
            <Input
              placeholder="Mã phòng (để tham gia)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              readOnly={loading}
              className="flex-1 min-w-0 rounded-xl border-border transition-smooth"
            />
            <Button type="button" variant="secondary" onClick={handleCreateNew} disabled={loading} className="rounded-xl transition-smooth shrink-0">
              {loading ? 'Đang tạo...' : 'Tạo phòng'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive px-0.5">{error}</p>}
          <Button type="submit" className="w-full rounded-xl h-11 font-medium transition-smooth">Vào phòng chat</Button>
        </form>
      </CardContent>
    </Card>
  );
}
