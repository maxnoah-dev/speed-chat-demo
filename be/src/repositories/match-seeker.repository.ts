import { v7 as uuidv7 } from 'uuid';
import { prisma } from '../lib/prisma';
import type { MatchSeekerDto, Gender } from '../types/match';
import { Gender as PrismaGender, MatchSeekerStatus } from '@prisma/client';

function toDto(row: { id: string; socket_id: string; display_name: string; gender: PrismaGender; seeking_gender: PrismaGender | null; status: MatchSeekerStatus; room_code: string | null; created_at: Date }): MatchSeekerDto {
  return {
    id: row.id,
    socket_id: row.socket_id,
    display_name: row.display_name,
    gender: row.gender as Gender,
    seeking_gender: row.seeking_gender as Gender | null,
    status: row.status as 'WAITING' | 'MATCHED',
    room_code: row.room_code,
    created_at: row.created_at.toISOString(),
  };
}

export async function create(data: { socket_id: string; display_name: string; gender: Gender; seeking_gender: Gender | null }): Promise<MatchSeekerDto> {
  const id = uuidv7();
  const row = await prisma.matchSeeker.create({
    data: {
      id: String(id),
      socket_id: data.socket_id,
      display_name: data.display_name.trim().slice(0, 100),
      gender: data.gender as PrismaGender,
      seeking_gender: data.seeking_gender as PrismaGender | null,
      status: 'WAITING',
    },
  });
  return toDto(row);
}

export async function updateToMatched(id: string, room_code: string): Promise<void> {
  await prisma.matchSeeker.update({
    where: { id },
    data: { status: 'MATCHED', room_code },
  });
}

export async function removeBySocketId(socketId: string): Promise<boolean> {
  const r = await prisma.matchSeeker.deleteMany({ where: { socket_id: socketId } });
  return r.count > 0;
}

export async function findBySocketId(socketId: string): Promise<MatchSeekerDto | null> {
  const row = await prisma.matchSeeker.findUnique({ where: { socket_id: socketId } });
  return row ? toDto(row) : null;
}
