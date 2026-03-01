import React from 'react';
import { cn } from '../lib/utils';

const EMOJI_GRID = [
  '😀', '😊', '🥰', '😎', '🤔', '😢', '😂', '❤️', '🔥', '👍',
  '👋', '🙏', '✨', '💯', '😍', '🥺', '💪', '🎉', '🤣', '😭',
  '😅', '🙈', '💕', '🌸', '⭐', '🌈', '💖', '😘', '🤗', '😇',
  '🥳', '😤', '💔', '😴', '🤭', '😏', '👀', '💀', '🫶', '😋',
];

interface EmojiStickerPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
  className?: string;
}

export function EmojiStickerPicker({ onSelect, onClose, className }: EmojiStickerPickerProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-border bg-card p-3 shadow-lg transition-smooth',
        className
      )}
    >
      <div className="grid grid-cols-5 gap-1">
        {EMOJI_GRID.map((emoji, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(emoji)}
            className="text-xl p-2 rounded-lg hover:bg-muted transition-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label={`Sticker ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
