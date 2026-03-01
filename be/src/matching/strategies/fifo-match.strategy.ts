import type { MatchSeekerDto, MatchResult, Gender } from '../../types/match';
import type { IMatchStrategy } from '../interfaces/match-strategy.interface';

/**
 * Bucket key: "gender:seeking_gender" (seeking_gender "ANY" = null → match với bất kỳ).
 * Hai người A và B match khi: A.seeking_gender === B.gender (hoặc ANY) và B.seeking_gender === A.gender (hoặc ANY).
 */
function bucketKey(gender: Gender, seeking: Gender | null): string {
  return `${gender}:${seeking ?? 'ANY'}`;
}

/** Các bucket chứa người có thể match: họ có gender = mySeeking và (seeking = myGender hoặc ANY). */
function compatibleBucketKeys(myGender: Gender, mySeeking: Gender | null): string[] {
  const genders: Gender[] = ['MALE', 'FEMALE', 'OTHER'];
  if (mySeeking == null) {
    return genders.flatMap((g) => [bucketKey(g, myGender), bucketKey(g, null)]);
  }
  return [bucketKey(mySeeking, myGender), bucketKey(mySeeking, null)];
}

/**
 * FIFO matching strategy: Queue theo bucket. Tìm trong bucket tương thích, lấy đầu tiên (FIFO).
 */
export class FifoMatchStrategy implements IMatchStrategy {
  private readonly queues = new Map<string, MatchSeekerDto[]>();

  async enqueueAndTryMatch(seeker: MatchSeekerDto): Promise<MatchResult | null> {
    const keys = compatibleBucketKeys(seeker.gender, seeker.seeking_gender);
    for (const partnerKey of keys) {
      const partnerQueue = this.queues.get(partnerKey);
      if (partnerQueue && partnerQueue.length > 0) {
        const partner = partnerQueue.shift()!;
        if (partnerQueue.length === 0) this.queues.delete(partnerKey);
        return { room_code: '', seeker_a: partner, seeker_b: seeker };
      }
    }
    const key = bucketKey(seeker.gender, seeker.seeking_gender);
    if (!this.queues.has(key)) this.queues.set(key, []);
    this.queues.get(key)!.push(seeker);
    return null;
  }

  async removeBySocketId(socketId: string): Promise<boolean> {
    for (const [key, arr] of this.queues.entries()) {
      const idx = arr.findIndex((s) => s.socket_id === socketId);
      if (idx >= 0) {
        arr.splice(idx, 1);
        if (arr.length === 0) this.queues.delete(key);
        return true;
      }
    }
    return false;
  }
}
