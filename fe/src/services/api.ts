const API_URL =
  (process.env.REACT_APP_API_URL || 'http://localhost:3002').replace(/[\s;]+$/, '').trim() || 'http://localhost:3002';

export async function generateRoomCode(): Promise<string> {
  const res = await fetch(`${API_URL}/api/chat/generate-code`);
  if (!res.ok) throw new Error('Không thể tạo mã phòng');
  const data = await res.json();
  return data.code;
}

export interface UploadResult {
  url: string;
  name: string;
  filename: string;
}

export async function uploadFile(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_URL}/api/upload/single`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Tải lên thất bại');
  }
  return res.json();
}

/** Gửi nhiều file một lần; trả về mảng { url, name, filename } */
export async function uploadFiles(files: File[]): Promise<UploadResult[]> {
  if (!files.length) return [];
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  const res = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Tải lên thất bại');
  }
  const data = await res.json();
  return Array.isArray(data.items) ? data.items : [];
}

export function getAttachmentFullUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  const base = API_URL.replace(/\/$/, '');
  return base + (url.startsWith('/') ? url : '/' + url);
}
