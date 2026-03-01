import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB (ảnh, tài liệu, v.v.)
// Video dưới 1 phút: giới hạn ~50MB (ước lượng 1 phút video)
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/zip',
  // Video (dưới 1 phút)
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
  // Âm thanh tin nhắn
  'audio/mpeg', 'audio/mp3', 'audio/ogg', 'audio/wav', 'audio/webm', 'audio/mp4', 'audio/aac',
]);
const VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska',
]);

export function ensureUploadDir(): void {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

export function getUploadDir(): string {
  return UPLOAD_DIR;
}

export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

/** Giới hạn dung lượng cho video (dưới 1 phút). */
export function getMaxVideoSize(): number {
  return MAX_VIDEO_SIZE;
}

export function isAllowedMime(mimetype: string): boolean {
  return ALLOWED_MIMES.has(mimetype);
}

export function isVideoMime(mimetype: string): boolean {
  return VIDEO_MIMES.has(mimetype);
}

/** Trả về giới hạn size theo mimetype: video dùng MAX_VIDEO_SIZE, còn lại dùng MAX_FILE_SIZE. */
export function getMaxSizeForMime(mimetype: string): number {
  return isVideoMime(mimetype) ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
}

/** Returns public URL path for stored file (e.g. /uploads/filename) */
export function getPublicPath(filename: string): string {
  return `/uploads/${filename}`;
}
