export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface MatchSeekPayload {
  display_name: string;
  gender: Gender;
  seeking_gender?: Gender | null;
}

export interface MatchFoundPayload {
  room_code: string;
  partner_name: string;
  partner_gender: Gender;
  your_display_name: string;
}
