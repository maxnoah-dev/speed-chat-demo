import { Server as SocketIOServer } from 'socket.io';
import * as roomService from '../services/room.service';
import * as messageService from '../services/message.service';
import type { JoinRoomPayload, SendMessagePayload } from '../types/chat';

/** Chuẩn hóa mã phòng: trim + uppercase, luôn coi là string (tránh lỗi khi client gửi number) */
function normalizeRoomCode(code: string | number | undefined): string {
  return String(code ?? '').trim().toUpperCase();
}

export function registerChatHandler(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    console.log(`[chat] socket connected id=${socket.id}`);

    socket.on('join_room', async (payload: JoinRoomPayload) => {
      const room_code = normalizeRoomCode(payload?.room_code);
      const { room_name, sender } = payload ?? {};
      if (!room_code || !(sender ?? '').trim()) return;

      console.log(`[chat] join_room room=${room_code} sender=${sender?.trim()} socketId=${socket.id}`);

      try {
        // Chỉ người tạo phòng mới set tên; getOrCreateRoomId chỉ dùng room_name khi TẠO MỚI
        await roomService.getOrCreateRoomId(room_code, room_name);
        socket.join(room_code);

        const room = await roomService.findRoomByCode(room_code);
        const room_name_from_db = room?.name ?? room_code;
        socket.emit('room_info', { room_code, room_name: room_name_from_db });

        const messages = await messageService.getRoomMessages(room_code);
        console.log(`[chat] room_history room=${room_code} count=${messages.length} -> socket ${socket.id}`);
        socket.emit('room_history', messages);

        socket.to(room_code).emit('user_joined', { sender: sender!.trim() });
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[chat] join_room error:', msg, err);
        socket.emit('room_error', { error: msg || 'Không thể vào phòng' });
      }
    });

    socket.on('send_message', async (payload: SendMessagePayload) => {
      const room_code = normalizeRoomCode(payload?.room_code);
      const { sender, content, attachment_name, attachment_url, attachments } = payload ?? {};
      const hasAttachments = (Array.isArray(attachments) && attachments.length > 0) || !!attachment_url;
      if (!room_code || !(sender ?? '').trim()) return;
      if (!(content ?? '').trim() && !hasAttachments) return;

      console.log(`[chat] send_message room=${room_code} sender=${sender?.trim()} socketId=${socket.id}`);

      try {
        const message = await messageService.sendMessage({
          room_code,
          sender: sender!.trim(),
          content: (content ?? '').trim() || '',
          attachment_name,
          attachment_url,
          attachments: Array.isArray(attachments) ? attachments : undefined,
        });
        const room = io.sockets.adapter.rooms.get(room_code);
        const size = room?.size ?? 0;
        console.log(`[chat] new_message room=${room_code} sockets_in_room=${size} emitting to all`);
        io.to(room_code).emit('new_message', message);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[chat] send_message error:', msg, err);
        socket.emit('send_message_error', { error: msg || 'Không thể gửi tin nhắn' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[chat] socket disconnected id=${socket.id} reason=${reason}`);
    });
  });
}
