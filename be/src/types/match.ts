/** Giới tính — bắt buộc chọn khi ghép đôi */
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/** Trạng thái trong hàng chờ */
export type MatchSeekerStatus = 'WAITING' | 'MATCHED';

export interface MatchSeekerDto {
  id: string;
  socket_id: string;
  display_name: string;
  gender: Gender;
  seeking_gender: Gender | null;
  status: MatchSeekerStatus;
  room_code: string | null;
  created_at: string;
}

/** Payload client gửi khi bấm "Tìm người chat" */
export interface MatchSeekPayload {
  display_name: string;
  gender: Gender;
  seeking_gender?: Gender | null;
}

/** Kết quả ghép đôi: hai seeker + phòng chat */
export interface MatchResult {
  room_code: string;
  seeker_a: MatchSeekerDto;
  seeker_b: MatchSeekerDto;
}
