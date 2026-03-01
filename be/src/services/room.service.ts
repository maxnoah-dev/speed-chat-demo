import * as roomRepo from '../repositories/room.repository';
import type { ChatRoom } from '../types/chat';

const CODE_LENGTH = 8;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function getOrCreateRoomId(roomCode: string, roomName?: string): Promise<string> {
  return roomRepo.getOrCreateRoomId(roomCode, roomName);
}

export async function findRoomByCode(code: string): Promise<ChatRoom | null> {
  return roomRepo.findRoomByCode(code);
}

/** Xóa toàn bộ dữ liệu phòng (room + messages). Gọi khi phòng không còn ai. */
export async function deleteRoomByCode(code: string): Promise<void> {
  return roomRepo.deleteRoomByCode(code);
}
