import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';

const GIPHY_API_KEY = process.env.REACT_APP_GIPHY_API_KEY || '';
const DEBOUNCE_MS = 350;

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

async function searchGifs(q: string, limit = 20): Promise<GifItem[]> {
  if (!GIPHY_API_KEY || !q.trim()) return [];
  const res = await fetch(
    `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(q.trim())}&limit=${limit}&rating=g`
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
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setLoading(true);
      fetchTrendingGifs()
        .then(setGifs)
        .finally(() => setLoading(false));
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      setLoading(true);
      searchGifs(q)
        .then(setGifs)
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

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
      <div className="p-2 border-b border-border">
        <input
          type="text"
          placeholder="Tìm GIF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="max-h-[240px] overflow-y-auto p-2">
        {loading && gifs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Đang tải...</p>
        ) : gifs.length === 0 && !query.trim() ? (
          <p className="text-sm text-muted-foreground text-center py-6">Gõ từ khóa để tìm GIF</p>
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
