import React, { useState } from 'react';
import { useMatchSocket } from '../../hooks/useMatchSocket';
import type { Gender } from '../../types/match';
import type { JoinFormValues } from './JoinForm';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { cn } from '../../lib/utils';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

const SEEKING_OPTIONS: { value: '' | Gender; label: string }[] = [
  { value: '', label: 'Bất kỳ' },
  { value: 'MALE', label: 'Nam' },
  { value: 'FEMALE', label: 'Nữ' },
  { value: 'OTHER', label: 'Khác' },
];

interface MatchFormProps {
  onMatchFound: (payload: { room_code: string; partner_name: string; your_display_name: string }) => void;
}

export function MatchForm({ onMatchFound }: MatchFormProps) {
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [seekingGender, setSeekingGender] = useState<Gender | ''>('');
  const [error, setError] = useState('');

  const { seek, cancel, isWaiting } = useMatchSocket({
    onMatchFound: (p) => {
      onMatchFound({
        room_code: p.room_code,
        partner_name: p.partner_name,
        your_display_name: p.your_display_name,
      });
    },
    onMatchError: setError,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!displayName.trim()) {
      setError('Vui lòng nhập tên của bạn');
      return;
    }
    if (!gender) {
      setError('Vui lòng chọn giới tính của bạn');
      return;
    }
    seek({
      display_name: displayName.trim(),
      gender: gender as Gender,
      seeking_gender: seekingGender || undefined,
    });
  };

  return (
    <Card className="w-full max-w-[400px] mx-auto rounded-2xl border-border shadow-xl shadow-black/5 transition-smooth">
      <CardHeader className="text-center space-y-2 pb-2">
        <CardTitle className="text-2xl font-semibold tracking-tight">Ghép đôi ngẫu nhiên</CardTitle>
        <CardDescription className="text-muted-foreground">Chọn giới tính, tìm người chat 1-1</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Input
            placeholder="Tên của bạn *"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            maxLength={100}
            disabled={isWaiting}
            className="rounded-xl border-border transition-smooth"
          />
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Giới tính của bạn *</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender | '')}
              disabled={isWaiting}
              required
              className={cn(
                'flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm transition-smooth',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              <option value="">-- Chọn giới tính --</option>
              {GENDER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Muốn ghép với (tùy chọn)</label>
            <select
              value={seekingGender}
              onChange={(e) => setSeekingGender(e.target.value as Gender | '')}
              disabled={isWaiting}
              className={cn(
                'flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm transition-smooth',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50'
              )}
            >
              {SEEKING_OPTIONS.map((o) => (
                <option key={o.value || 'any'} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-destructive px-0.5">{error}</p>}
          {isWaiting ? (
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={cancel} className="flex-1 rounded-xl transition-smooth">
                Hủy
              </Button>
            </div>
          ) : (
            <Button type="submit" className="w-full rounded-xl h-11 font-medium transition-smooth">
              Tìm người chat
            </Button>
          )}
          {isWaiting && (
            <p className="text-sm text-muted-foreground text-center animate-pulse">Đang tìm kiếm người phù hợp...</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
