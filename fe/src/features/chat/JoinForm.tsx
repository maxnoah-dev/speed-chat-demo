import React, { useState } from 'react';
import { generateRoomCode } from '../../services/api';
import styles from './JoinForm.module.css';

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
  const [roomName, setRoomName] = useState('');
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
      const code = await generateRoomCode();
      setRoomCode(code);
      setRoomName(`Phòng ${code}`);
      setLoading(false);
    } catch {
      setError('Không thể tạo mã phòng. Thử lại.');
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
      room_name: roomName.trim() || roomCode.trim(),
    });
  };

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1>Chat nhóm</h1>
        <p>Chỉ cần nhập tên và mã phòng — không cần đăng nhập</p>
      </header>

      <form className={styles.form} onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Tên của bạn *"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          className={styles.input}
          maxLength={100}
        />
        <div className={styles.row}>
          <input
            type="text"
            placeholder="Mã phòng (để tham gia)"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            className={styles.input}
            readOnly={loading}
          />
          <button
            type="button"
            className={styles.btnSecondary}
            onClick={handleCreateNew}
            disabled={loading}
          >
            {loading ? 'Đang tạo...' : 'Tạo phòng mới'}
          </button>
        </div>
        <input
          type="text"
          placeholder="Tên phòng (hiển thị, tùy chọn)"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className={styles.input}
        />
        {error && <div className={styles.error}>{error}</div>}
        <button type="submit" className={styles.btnPrimary}>
          Vào phòng chat
        </button>
      </form>
    </div>
  );
}
