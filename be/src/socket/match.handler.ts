import type { Server as SocketIOServer } from 'socket.io';
import { getMatchingService } from '../services/matching.service';
import type { MatchSeekPayload } from '../types/match';

const GENDERS = new Set<string>(['MALE', 'FEMALE', 'OTHER']);

function isValidPayload(p: unknown): p is MatchSeekPayload {
  if (!p || typeof p !== 'object') return false;
  const o = p as Record<string, unknown>;
  if (typeof o.display_name !== 'string' || !o.display_name.trim()) return false;
  if (!GENDERS.has(String(o.gender))) return false;
  if (o.seeking_gender != null && !GENDERS.has(String(o.seeking_gender))) return false;
  return true;
}

export function registerMatchHandler(io: SocketIOServer): void {
  const matchingService = getMatchingService();

  io.on('connection', (socket) => {
    socket.on('match_seek', async (payload: unknown) => {
      if (!isValidPayload(payload)) {
        socket.emit('match_error', { error: 'Dữ liệu không hợp lệ (cần display_name và gender).' });
        return;
      }
      try {
        const result = await matchingService.seek(socket.id, payload);
        if (result) {
          const { room_code, seeker_a, seeker_b } = result;
          const payloadA = {
            room_code,
            partner_name: seeker_b.display_name,
            partner_gender: seeker_b.gender,
            your_display_name: seeker_a.display_name,
          };
          const payloadB = {
            room_code,
            partner_name: seeker_a.display_name,
            partner_gender: seeker_a.gender,
            your_display_name: seeker_b.display_name,
          };
          io.to(seeker_a.socket_id).emit('match_found', payloadA);
          io.to(seeker_b.socket_id).emit('match_found', payloadB);
        } else {
          socket.emit('match_waiting', { message: 'Đang tìm kiếm...' });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[match] seek error:', msg, err);
        socket.emit('match_error', { error: msg || 'Không thể tìm kiếm.' });
      }
    });

    socket.on('match_cancel', async () => {
      try {
        const removed = await matchingService.cancel(socket.id);
        socket.emit('match_cancel_ack', { removed });
      } catch (err) {
        socket.emit('match_error', { error: 'Không thể hủy.' });
      }
    });
  });
}
