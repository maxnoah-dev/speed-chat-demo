export interface ChatAttachment {
  name: string;
  url: string;
}

export interface ChatMessage {
  id?: number;
  sender: string;
  content: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
  attachments?: ChatAttachment[] | null;
  created_at?: string;
}

export interface JoinRoomPayload {
  room_code: string;
  room_name?: string;
  sender: string;
}

export interface SendMessagePayload {
  room_code: string;
  sender: string;
  content: string;
  attachment_name?: string;
  attachment_url?: string;
  attachments?: ChatAttachment[];
}
