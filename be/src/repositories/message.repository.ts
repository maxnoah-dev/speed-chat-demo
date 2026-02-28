import pool from '../config/database';
import { ChatMessage } from '../types/chat';

const TABLE = 'chat_messages';

export async function getRoomMessages(roomId: number, limit = 100): Promise<ChatMessage[]> {
  const [rows]: any = await pool.execute(
    `SELECT id, room_id, sender, content, attachment_name, attachment_url, created_at 
     FROM ${TABLE} WHERE room_id = ? ORDER BY created_at DESC LIMIT ?`,
    [roomId, limit]
  );
  return rows.reverse();
}

export interface InsertMessageDto {
  room_id: number;
  sender: string;
  content: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
}

export async function insertMessage(dto: InsertMessageDto): Promise<ChatMessage> {
  const [result]: any = await pool.execute(
    `INSERT INTO ${TABLE} (room_id, sender, content, attachment_name, attachment_url) 
     VALUES (?, ?, ?, ?, ?)`,
    [dto.room_id, dto.sender, dto.content, dto.attachment_name ?? null, dto.attachment_url ?? null]
  );
  const [rows]: any = await pool.execute(
    `SELECT id, room_id, sender, content, attachment_name, attachment_url, created_at 
     FROM ${TABLE} WHERE id = ?`,
    [result.insertId]
  );
  return rows[0];
}
