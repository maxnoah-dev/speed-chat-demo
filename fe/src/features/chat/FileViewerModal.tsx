import React, { useEffect, useState } from 'react';
  import mammoth from 'mammoth';
import { getAttachmentFullUrl } from '../../services/api';

// Định dạng code: phổ biến + ngôn ngữ khác
const CODE_EXT = /\.(js|jsx|ts|tsx|mjs|cjs|json|html|htm|css|scss|sass|less|md|py|pyw|java|kt|kts|go|rs|r|rb|php|swift|cs|cpp|c|cc|cxx|h|hpp|hxx|sql|sh|bash|zsh|yaml|yml|xml|vue|svelte|elm|clj|cljs|cljc|ex|exs|fs|fsx|ml|mli|rkt|scala|vb|rbs|groovy|gradle|nim|dart|zig|v|sol|prisma|graphql|gql|proto|thrift|cmake|make|dockerfile|env|ini|toml|cfg|conf)$/i;
const IMG_EXT = /\.(jpe?g|png|gif|webp|bmp|svg)$/i;
const PDF_EXT = /\.pdf$/i;
const DOCX_EXT = /\.docx$/i;
const DOC_EXT = /\.(doc|xlsx?|pptx?|odt|ods|odp)$/i;
const VIDEO_EXT = /\.(mp4|webm|mov|avi|mkv)(\?|$)/i;
const AUDIO_EXT = /\.(mp3|ogg|wav|webm|m4a|aac)(\?|$)/i;

export type ViewerFileType = 'image' | 'pdf' | 'code' | 'docx' | 'doc' | 'video' | 'audio' | 'other';

function getFileType(fileName: string, url: string): ViewerFileType {
  const name = (fileName || url || '').toLowerCase();
  if (IMG_EXT.test(name)) return 'image';
  if (PDF_EXT.test(name)) return 'pdf';
  if (CODE_EXT.test(name)) return 'code';
  if (DOCX_EXT.test(name)) return 'docx';
  if (DOC_EXT.test(name)) return 'doc';
  if (VIDEO_EXT.test(name)) return 'video';
  if (AUDIO_EXT.test(name)) return 'audio';
  return 'other';
}

interface FileViewerModalProps {
  open: boolean;
  onClose: () => void;
  url: string;
  fileName?: string | null;
}

export function FileViewerModal({ open, onClose, url, fileName }: FileViewerModalProps) {
  const [codeContent, setCodeContent] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [docxError, setDocxError] = useState<string | null>(null);
  const fullUrl = url ? getAttachmentFullUrl(url) : '';

  const fileType = getFileType(fileName ?? '', url);
  const displayName = fileName || 'Tệp đính kèm';

  useEffect(() => {
    if (!open) return;
    setCodeContent(null);
    setCodeError(null);
    setDocxHtml(null);
    setDocxError(null);
    if (fileType === 'code' && fullUrl) {
      fetch(fullUrl)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Không tải được file'))))
        .then(setCodeContent)
        .catch((e) => setCodeError(e?.message || 'Lỗi tải file'));
    }
    if (fileType === 'docx' && fullUrl) {
      fetch(fullUrl)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error('Không tải được file'))))
        .then((buf) => mammoth.convertToHtml({ arrayBuffer: buf }))
        .then((result) => setDocxHtml(result.value))
        .catch((e) => setDocxError(e?.message || 'Lỗi đọc file Word'));
    }
  }, [open, fullUrl, fileType]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Xem file"
    >
      <div
        className="bg-background border border-border rounded-lg shadow-xl flex flex-col max-w-4xl max-h-[90vh] w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-border shrink-0">
          <span className="text-sm font-medium truncate" title={displayName}>
            {displayName}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fullUrl}
              download={displayName}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Tải xuống
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-1 rounded"
              aria-label="Đóng"
            >
              ✕
            </button>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-auto p-4">
          {fileType === 'image' && (
            <div className="flex justify-center">
              <img
                src={fullUrl}
                alt={displayName}
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
          )}
          {fileType === 'pdf' && (
            <iframe
              src={fullUrl}
              title={displayName}
              className="w-full h-[70vh] rounded border border-border"
            />
          )}
          {fileType === 'video' && (
            <video
              src={fullUrl}
              controls
              autoPlay
              muted
              playsInline
              className="w-full max-h-[70vh] rounded border border-border"
            />
          )}
          {fileType === 'audio' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <audio src={fullUrl} controls className="w-full max-w-md" />
            </div>
          )}
          {fileType === 'code' && (
            <div className="rounded border border-border bg-muted/30 overflow-hidden">
              {codeError && (
                <p className="text-sm text-destructive p-3">{codeError}</p>
              )}
              {codeContent != null && !codeError && (
                <pre className="text-xs p-4 overflow-auto max-h-[70vh] font-mono whitespace-pre">
                  <code>{codeContent}</code>
                </pre>
              )}
              {codeContent == null && !codeError && (
                <p className="text-sm text-muted-foreground p-4">Đang tải...</p>
              )}
            </div>
          )}
          {fileType === 'docx' && (
            <div className="rounded border border-border bg-background overflow-hidden">
              {docxError && (
                <p className="text-sm text-destructive p-3">{docxError}</p>
              )}
              {docxHtml != null && !docxError && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none p-4 overflow-auto max-h-[70vh] text-foreground"
                  dangerouslySetInnerHTML={{ __html: docxHtml }}
                />
              )}
              {docxHtml == null && !docxError && (
                <p className="text-sm text-muted-foreground p-4">Đang tải...</p>
              )}
            </div>
          )}
          {(fileType === 'doc' || fileType === 'other') && (
            <div className="text-center py-8 text-muted-foreground text-sm space-y-4">
              <p>
                {fileType === 'doc'
                  ? 'File Word/Excel/PowerPoint cần tải xuống hoặc mở bằng ứng dụng (Word, LibreOffice, …) để xem.'
                  : 'Loại file này không xem trước được trong trình duyệt. Tải xuống hoặc mở trong tab mới.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href={fullUrl}
                  download={displayName}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm hover:opacity-90"
                >
                  Tải xuống
                </a>
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-border bg-background text-sm hover:bg-muted"
                >
                  Mở trong tab mới
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
