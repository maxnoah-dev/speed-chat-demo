import { v7 as uuidv7 } from 'uuid';
import { prisma } from '../lib/prisma';
import type { ChatMessage } from '../types/chat';

export async function getRoomMessages(roomId: string, limit = 100): Promise<ChatMessage[]> {
  const rid = roomId == null ? '' : String(roomId);
  const lim = Math.min(1000, Math.max(1, parseInt(String(limit), 10) || 100));
  const rows = await prisma.chatMessage.findMany({
    where: { room_id: rid },
    orderBy: { created_at: 'desc' },
    take: lim,
  });
  return rows
    .reverse()
    .map((r) => ({
      id: r.id,
      room_id: r.room_id,
      sender: r.sender,
      content: r.content,
      attachment_name: r.attachment_name,
      attachment_url: r.attachment_url,
      created_at: r.created_at.toISOString(),
    }));
}

export interface InsertMessageDto {
  room_id: string;
  sender: string;
  content: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
}

export async function insertMessage(dto: InsertMessageDto): Promise<ChatMessage> {
  const id = uuidv7();
  const roomId = dto.room_id == null ? '' : String(dto.room_id);
  const sender = dto.sender == null ? '' : String(dto.sender);
  const content = dto.content == null ? '' : String(dto.content);
  const attName = dto.attachment_name != null ? String(dto.attachment_name) : null;
  const attUrl = dto.attachment_url != null ? String(dto.attachment_url) : null;

  const created = await prisma.chatMessage.create({
    data: {
      id,
      room_id: roomId,
      sender,
      content,
      attachment_name: attName,
      attachment_url: attUrl,
    },
  });
  return {
    id: created.id,
    room_id: created.room_id,
    sender: created.sender,
    content: created.content,
    attachment_name: created.attachment_name,
    attachment_url: created.attachment_url,
    created_at: created.created_at.toISOString(),
  };
}
