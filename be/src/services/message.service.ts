import * as messageRepo from '../repositories/message.repository';
import * as roomService from './room.service';
import type { ChatMessage, SendMessagePayload } from '../types/chat';

export async function getRoomMessages(roomCode: string, limit = 100): Promise<ChatMessage[]> {
  const roomId = await roomService.getOrCreateRoomId(roomCode);
  return messageRepo.getRoomMessages(roomId, limit);
}

export async function sendMessage(payload: SendMessagePayload): Promise<ChatMessage> {
  const roomId = await roomService.getOrCreateRoomId(payload.room_code);
  return messageRepo.insertMessage({
    room_id: roomId,
    sender: payload.sender,
    content: payload.content || '',
    attachment_name: payload.attachment_name ?? null,
    attachment_url: payload.attachment_url ?? null,
    attachments: payload.attachments?.length ? payload.attachments : null,
  });
}
