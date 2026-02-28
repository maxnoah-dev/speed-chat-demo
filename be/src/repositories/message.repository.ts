import { v7 as uuidv7 } from 'uuid';
import { prisma } from '../lib/prisma';
import type { ChatAttachment, ChatMessage } from '../types/chat';

function rowToMessage(r: {
  id: string;
  room_id: string;
  sender: string;
  content: string;
  attachment_name: string | null;
  attachment_url: string | null;
  attachments: unknown;
  created_at: Date;
}): ChatMessage {
  const list: ChatAttachment[] =
    Array.isArray(r.attachments) && r.attachments.length > 0
      ? r.attachments.map((a: unknown) =>
          a && typeof a === 'object' && 'name' in a && 'url' in a
            ? { name: String((a as { name: unknown }).name), url: String((a as { url: unknown }).url) }
            : { name: '', url: '' }
        ).filter((a) => a.url)
      : r.attachment_url
        ? [{ name: r.attachment_name ?? 'Tệp', url: r.attachment_url }]
        : [];
  return {
    id: r.id,
    room_id: r.room_id,
    sender: r.sender,
    content: r.content,
    attachment_name: r.attachment_name,
    attachment_url: r.attachment_url,
    attachments: list.length > 0 ? list : undefined,
    created_at: r.created_at.toISOString(),
  };
}

export async function getRoomMessages(roomId: string, limit = 100): Promise<ChatMessage[]> {
  const rid = roomId == null ? '' : String(roomId);
  const lim = Math.min(1000, Math.max(1, parseInt(String(limit), 10) || 100));
  const rows = await prisma.chatMessage.findMany({
    where: { room_id: rid },
    orderBy: { created_at: 'desc' },
    take: lim,
  });
  return rows.reverse().map(rowToMessage);
}

export interface InsertMessageDto {
  room_id: string;
  sender: string;
  content: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
  attachments?: ChatAttachment[] | null;
}

export async function insertMessage(dto: InsertMessageDto): Promise<ChatMessage> {
  const id = uuidv7();
  const roomId = dto.room_id == null ? '' : String(dto.room_id);
  const sender = dto.sender == null ? '' : String(dto.sender);
  const content = dto.content == null ? '' : String(dto.content);
  const attList = Array.isArray(dto.attachments) && dto.attachments.length > 0 ? dto.attachments : null;
  const first = attList?.[0];
  const attName = first?.name ?? dto.attachment_name ?? null;
  const attUrl = first?.url ?? dto.attachment_url ?? null;

  const created = await prisma.chatMessage.create({
    data: {
      id,
      room_id: roomId,
      sender,
      content,
      attachment_name: attName,
      attachment_url: attUrl,
      attachments: attList ? (attList as unknown as object) : undefined,
    },
  });
  return rowToMessage(created);
}
