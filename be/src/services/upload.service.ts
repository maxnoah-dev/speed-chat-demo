import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain', 'application/zip'
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

export function isAllowedMime(mimetype: string): boolean {
  return ALLOWED_MIMES.has(mimetype);
}

/** Returns public URL path for stored file (e.g. /uploads/filename) */
export function getPublicPath(filename: string): string {
  return `/uploads/${filename}`;
}
