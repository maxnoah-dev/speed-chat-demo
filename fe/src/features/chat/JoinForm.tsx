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
    <Card className="w-full max-w-[400px] mx-auto border-border">
      <CardHeader className="text-center space-y-1.5">
        <CardTitle className="text-xl">Chat nhóm</CardTitle>
        <CardDescription>Chỉ cần nhập tên và mã phòng — không cần đăng nhập</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-4" onSubmit={handleJoin}>
          <Input
            placeholder="Tên của bạn *"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            maxLength={100}
          />
          <div className="flex gap-2">
            <Input
              placeholder="Mã phòng (để tham gia)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              readOnly={loading}
              className="flex-1 min-w-0"
            />
            <Button type="button" variant="secondary" onClick={handleCreateNew} disabled={loading}>
              {loading ? 'Đang tạo...' : 'Tạo phòng mới'}
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Vào phòng chat</Button>
        </form>
      </CardContent>
    </Card>
  );
}
