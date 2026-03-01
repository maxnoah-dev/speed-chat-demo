import React, { useState, useCallback } from 'react';
import { cn } from '../lib/utils';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || '';

interface GifItem {
  id: string;
  url: string;
  preview: string;
  title: string;
}

async function searchGifs(q: string, limit = 20): Promise<GifItem[]> {
  if (!GIPHY_API_KEY) return [];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q)}&limit=${limit}&rating=g`
  );
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data || []).map((g: { id: string; images: { fixed_width_small: { url: string }; fixed_width: { url: string } }; title: string }) => ({
    id: g.id,
    url: g.images?.fixed_width?.url || g.images?.fixed_width_small?.url || '',
    preview: g.images?.fixed_width_small?.url || '',
    title: g.title || '',
  }));
}

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose?: () => void;
  className?: string;
}

export function GifPicker({ onSelect, onClose, className }: GifPickerProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const list = await searchGifs(query.trim());
      setGifs(list);
    } finally {
      setLoading(false);
    }
  }, [query]);

  if (!GIPHY_API_KEY) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground', className)}>
        <p>Thêm <code className="bg-muted px-1 rounded">REACT_APP_GIPHY_API_KEY</code> vào file <code className="bg-muted px-1 rounded">.env</code> để tìm GIF (miễn phí tại giphy.com).</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-lg overflow-hidden transition-smooth w-[320px]', className)}>
      <div className="p-2 border-b border-border flex gap-2">
        <input
          type="text"
          placeholder="Tìm GIF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="flex-1 min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-smooth"
        >
          {loading ? '...' : 'Tìm'}
        </button>
      </div>
      <div className="max-h-[240px] overflow-y-auto p-2">
        {loading && gifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải...</p>
        ) : gifs.length === 0 && !query.trim() ? (
          <p className="text-sm text-muted-foreground text-center py-6">Gõ từ khóa và bấm Tìm</p>
        ) : gifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Không tìm thấy GIF</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {gifs.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => onSelect(g.url)}
                className="aspect-video rounded-lg overflow-hidden bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <img src={g.preview} alt={g.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
