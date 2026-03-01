import type { MatchSeekerDto, MatchResult } from '../../types/match';

/**
 * Strategy interface (Strategy pattern).
 * Thuật toán ghép đôi có thể thay đổi (FIFO, ưu tiên thời gian, v.v.) mà không đổi MatchingService.
 */
export interface IMatchStrategy {
  /**
   * Thêm người vào hàng chờ.
   * @returns MatchResult nếu ngay lập tức ghép được với ai đó; null nếu phải chờ.
   */
  enqueueAndTryMatch(seeker: MatchSeekerDto): Promise<MatchResult | null>;

  /**
   * Xóa người khỏi hàng chờ (cancel).
   */
  removeBySocketId(socketId: string): Promise<boolean>;
}
