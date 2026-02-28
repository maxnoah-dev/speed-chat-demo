import * as roomRepo from '../repositories/room.repository';

const CODE_LENGTH = 8;
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateRoomCode(): string {
  let code = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export async function getOrCreateRoomId(roomCode: string, roomName?: string): Promise<number> {
  return roomRepo.getOrCreateRoomId(roomCode, roomName);
}
