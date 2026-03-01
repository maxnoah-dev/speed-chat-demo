import React, { useState, useEffect } from 'react';
import { cn } from '../lib/utils';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || '';

interface GifItem {
  id: string;
  url: string;
  preview: string;
  title: string;
}

function mapGifs(data: { id: string; images: { fixed_width_small?: { url: string }; fixed_width?: { url: string } }; title: string }[]): GifItem[] {
  return (data || []).map((g) => ({
    id: g.id,
    url: g.images?.fixed_width?.url || g.images?.fixed_width_small?.url || '',
    preview: g.images?.fixed_width_small?.url || '',
    title: g.title || '',
  }));
}

async function fetchTrendingGifs(limit = 24): Promise<GifItem[]> {
  if (!GIPHY_API_KEY) return [];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=${limit}&rating=g`
  );
  if (!res.ok) return [];
  const json = await res.json();
  return mapGifs(json.data || []);
}

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose?: () => void;
  className?: string;
}

export function GifPicker({ onSelect, onClose, className }: GifPickerProps) {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchTrendingGifs()
      .then(setGifs)
      .finally(() => setLoading(false));
  }, []);

  if (!GIPHY_API_KEY) {
    return (
      <div className={cn('rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground space-y-2', className)}>
        <p>Để tìm GIF, thêm key vào file <code className="bg-muted px-1 rounded">.env.development.local</code> (dev) hoặc biến build (prod):</p>
        <p><code className="bg-muted px-1 rounded text-xs">REACT_APP_GIPHY_API_KEY=your_key</code></p>
        <a href="https://developers.giphy.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Lấy key miễn phí tại Giphy →
        </a>
      </div>
    );
  }

  return (
    <div className={cn('rounded-xl border border-border bg-card shadow-lg overflow-hidden transition-smooth w-[320px]', className)}>
      <div className="max-h-[280px] overflow-y-auto p-2">
        {loading && gifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải...</p>
        ) : gifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Không có GIF</p>
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
