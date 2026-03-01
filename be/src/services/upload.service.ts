import path from 'path';
import fs from 'fs';
import * as mimeTypes from 'mime-types';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (tài liệu, ảnh, ...)
// Video dưới 5 phút: ~300MB (ước lượng 5 phút video)
const MAX_VIDEO_SIZE = 300 * 1024 * 1024;

/** Đuôi file được phép (dùng thư viện mime-types để nhận diện). */
const ALLOWED_EXTENSIONS = new Set([
  // Ảnh
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.ico', '.heic',
  // Video (dưới 5 phút)
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv',
  // Âm thanh
  '.mp3', '.ogg', '.wav', '.m4a', '.aac', '.flac', '.webm',
  // Tài liệu Office & phổ biến
  '.pdf',
  '.doc', '.docx', '.odt', '.rtf',
  '.xls', '.xlsx', '.ods', '.csv',
  '.ppt', '.pptx', '.odp',
  '.txt', '.text', '.md', '.json', '.xml',
  '.zip', '.rar', '.7z', '.tar', '.gz',
]);

const VIDEO_EXTENSIONS = new Set([
  '.mp4', '.webm', '.mov', '.avi', '.mkv', '.m4v', '.ogv',
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

/** Giới hạn dung lượng cho video (dưới 5 phút). */
export function getMaxVideoSize(): number {
  return MAX_VIDEO_SIZE;
}

function getExtension(filename: string): string {
  const ext = path.extname(filename || '').toLowerCase();
  return ext || '';
}

/** Cho phép theo đuôi file (dùng allowlist, không phụ thuộc mimetype từ client). */
export function isAllowedByExtension(filename: string): boolean {
  const ext = getExtension(filename);
  return ALLOWED_EXTENSIONS.has(ext);
}

/** Có phải video theo đuôi file. */
export function isVideoByExtension(filename: string): boolean {
  const ext = getExtension(filename);
  return VIDEO_EXTENSIONS.has(ext);
}

/** Trả về MIME chuẩn từ đuôi file (dùng thư viện mime-types). */
export function getMimeFromExtension(filename: string): string | false {
  const ext = getExtension(filename);
  if (!ext) return false;
  return mimeTypes.lookup(ext) as string | false;
}

/** Giới hạn size theo đuôi file: video dùng MAX_VIDEO_SIZE, còn lại MAX_FILE_SIZE. */
export function getMaxSizeForFilename(filename: string): number {
  return isVideoByExtension(filename) ? MAX_VIDEO_SIZE : MAX_FILE_SIZE;
}

/** Returns public URL path for stored file (e.g. /uploads/filename) */
export function getPublicPath(filename: string): string {
  return `/uploads/${filename}`;
}
