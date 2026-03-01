import * as roomService from './room.service';
import * as matchRepo from '../repositories/match-seeker.repository';
import type { IMatchStrategy } from '../matching/interfaces/match-strategy.interface';
import { FifoMatchStrategy } from '../matching/strategies/fifo-match.strategy';
import type { MatchSeekPayload, MatchResult, MatchSeekerDto } from '../types/match';

/** Dependency injection: strategy có thể thay đổi (SOLID - Open/Closed). */
export class MatchingService {
  constructor(
    private readonly strategy: IMatchStrategy = new FifoMatchStrategy(),
  ) {}

  /**
   * Thêm người vào hàng chờ, thử ghép đôi.
   * @returns MatchResult nếu ghép được ngay; null nếu đang chờ.
   */
  async seek(socketId: string, payload: MatchSeekPayload): Promise<MatchResult | null> {
    const dto = await matchRepo.create({
      socket_id: socketId,
      display_name: (payload.display_name ?? '').trim().slice(0, 100),
      gender: payload.gender,
      seeking_gender: payload.seeking_gender ?? null,
    });

    const result = await this.strategy.enqueueAndTryMatch(dto);

    if (result) {
      const roomCode = roomService.generateRoomCode();
      await roomService.getOrCreateRoomId(roomCode, `Match ${roomCode}`);
      await matchRepo.updateToMatched(result.seeker_a.id, roomCode);
      await matchRepo.updateToMatched(result.seeker_b.id, roomCode);
      return {
        room_code: roomCode,
        seeker_a: result.seeker_a,
        seeker_b: result.seeker_b,
      };
    }

    return null;
  }

  /** Hủy tìm kiếm. */
  async cancel(socketId: string): Promise<boolean> {
    const removed = await this.strategy.removeBySocketId(socketId);
    if (removed) await matchRepo.removeBySocketId(socketId);
    return removed;
  }
}

let defaultInstance: MatchingService | null = null;

/** Singleton (có thể thay bằng DI container). */
export function getMatchingService(): MatchingService {
  if (!defaultInstance) defaultInstance = new MatchingService();
  return defaultInstance;
}
