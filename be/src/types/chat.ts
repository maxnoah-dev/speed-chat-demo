export interface ChatRoom {
  id: number;
  code: string;
  name: string;
  created_at?: string;
}

export interface ChatMessage {
  id?: number;
  room_id?: number;
  sender: string;
  content: string;
  attachment_name?: string | null;
  attachment_url?: string | null;
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
}
