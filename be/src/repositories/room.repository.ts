import { v7 as uuidv7 } from 'uuid';
import { prisma } from '../lib/prisma';
import type { ChatRoom } from '../types/chat';

function normalizeCode(code: string): string {
  return (code ?? '').trim().toUpperCase();
}

export async function findRoomByCode(code: string): Promise<ChatRoom | null> {
  const canonical = normalizeCode(code);
  const row = await prisma.chatRoom.findUnique({
    where: { code: canonical },
  });
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    created_at: row.created_at.toISOString(),
  };
}

export async function createRoom(code: string, name: string): Promise<string> {
  const canonical = normalizeCode(code);
  const id = String(uuidv7());
  const nameVal = (name ?? '').trim() || canonical;
  await prisma.chatRoom.create({
    data: { id, code: canonical, name: nameVal },
  });
  return id;
}

/** Chỉ khi TẠO MỚI mới dùng name; người tham gia sau không thể đổi tên phòng (existing return luôn). */
export async function getOrCreateRoomId(code: string, name?: string): Promise<string> {
  const canonical = normalizeCode(code);
  const existing = await findRoomByCode(canonical);
  if (existing) return String(existing.id);
  return createRoom(canonical, name || canonical);
}
