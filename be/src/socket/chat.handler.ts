import { Server as SocketIOServer } from 'socket.io';
import * as roomService from '../services/room.service';
import * as messageService from '../services/message.service';
import type { JoinRoomPayload, SendMessagePayload } from '../types/chat';

export function registerChatHandler(io: SocketIOServer): void {
  io.on('connection', (socket) => {
    socket.on('join_room', async (payload: JoinRoomPayload) => {
      const { room_code, room_name, sender } = payload;
      if (!room_code?.trim() || !sender?.trim()) return;

      const roomId = await roomService.getOrCreateRoomId(room_code, room_name);
      socket.join(room_code);

      const messages = await messageService.getRoomMessages(room_code);
      socket.emit('room_history', messages);

      socket.to(room_code).emit('user_joined', { sender });
    });

    socket.on('send_message', async (payload: SendMessagePayload) => {
      const { room_code, sender, content, attachment_name, attachment_url } = payload;
      if (!room_code?.trim() || !sender?.trim()) return;
      if (!content?.trim() && !attachment_url) return;

      const message = await messageService.sendMessage({
        room_code,
        sender,
        content: content || '',
        attachment_name,
        attachment_url,
      });
      io.to(room_code).emit('new_message', message);
    });
  });
}
