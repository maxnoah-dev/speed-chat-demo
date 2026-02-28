import pool from '../config/database';
import { ChatRoom } from '../types/chat';

const TABLE = 'chat_rooms';

/** Mã phòng chuẩn: trim + uppercase để tránh tạo 2 phòng khi gõ khác kiểu chữ */
function normalizeCode(code: string): string {
  return (code ?? '').trim().toUpperCase();
}

export async function findRoomByCode(code: string): Promise<ChatRoom | null> {
  const canonical = normalizeCode(code);
  const [rows]: any = await pool.execute(
    `SELECT id, code, name, created_at FROM ${TABLE} WHERE code = ?`,
    [canonical]
  );
  return rows.length > 0 ? rows[0] : null;
}

export async function createRoom(code: string, name: string): Promise<number> {
  const canonical = normalizeCode(code);
  const [result]: any = await pool.execute(
    `INSERT INTO ${TABLE} (code, name) VALUES (?, ?)`,
    [canonical, (name ?? '').trim() || canonical]
  );
  return result.insertId;
}

/** Chỉ khi TẠO MỚI mới dùng name; người tham gia sau không thể đổi tên phòng (existing return luôn). */
export async function getOrCreateRoomId(code: string, name?: string): Promise<number> {
  const canonical = normalizeCode(code);
  const existing = await findRoomByCode(canonical);
  if (existing) return existing.id;
  return createRoom(canonical, name || canonical);
}
