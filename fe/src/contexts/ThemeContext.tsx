import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type SystemTheme = 'light' | 'dark' | 'system';
export type ChatFrameColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'slate';

interface ThemeState {
  systemTheme: SystemTheme;
  chatFrameColor: ChatFrameColor;
  /** Màu nền tùy chỉnh (hex). Null = dùng theme mặc định. */
  customBackground: string | null;
}

const STORAGE_KEY = 'speed_chat_theme';

const defaultState: ThemeState = {
  systemTheme: 'system',
  chatFrameColor: 'violet',
  customBackground: null,
};

/** Chuyển hex (#rrggbb) sang HSL (h, s, l). */
function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return null;
  let r = parseInt(m[1], 16) / 255;
  let g = parseInt(m[2], 16) / 255;
  let b = parseInt(m[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

const CUSTOM_PALETTE_KEYS = [
  '--background', '--card', '--muted', '--primary', '--accent', '--border', '--input', '--ring',
  '--chat-frame', '--chat-frame-muted',
];

/** Áp palette (background, card, input, primary, khung chat...) từ một màu nền. */
function applyCustomPalette(hex: string, isDark: boolean) {
  const hsl = hexToHsl(hex);
  if (!hsl) return;
  const { h } = hsl;
  const root = document.documentElement.style;
  if (isDark) {
    root.setProperty('--background', `${h} 15% 8%`);
    root.setProperty('--card', `${h} 12% 12%`);
    root.setProperty('--muted', `${h} 10% 18%`);
    root.setProperty('--primary', `${h} 70% 60%`);
    root.setProperty('--accent', `${h} 40% 22%`);
    root.setProperty('--border', `${h} 10% 20%`);
    root.setProperty('--input', `${h} 10% 20%`);
    root.setProperty('--ring', `${h} 70% 55%`);
    root.setProperty('--chat-frame', `${h} 70% 55%`);
    root.setProperty('--chat-frame-muted', `${h} 40% 22%`);
  } else {
    root.setProperty('--background', `${h} ${Math.min(40, hsl.s)}% ${Math.max(92, hsl.l)}%`);
    root.setProperty('--card', `${h} 20% 100%`);
    root.setProperty('--muted', `${h} 25% 94%`);
    root.setProperty('--primary', `${h} 83% 58%`);
    root.setProperty('--accent', `${h} 60% 95%`);
    root.setProperty('--border', `${h} 25% 90%`);
    root.setProperty('--input', `${h} 25% 90%`);
    root.setProperty('--ring', `${h} 83% 58%`);
    root.setProperty('--chat-frame', `${h} 83% 58%`);
    root.setProperty('--chat-frame-muted', `${h} 60% 95%`);
  }
}

function clearCustomPalette() {
  const root = document.documentElement.style;
  CUSTOM_PALETTE_KEYS.forEach((k) => root.removeProperty(k));
}

function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    const customBg = parsed?.customBackground ?? null;
    const validHex = typeof customBg === 'string' && /^#([a-f\d]{3}){1,2}$/i.test(customBg) ? customBg : null;
    return {
      systemTheme: ['light', 'dark', 'system'].includes(parsed?.systemTheme as string) ? (parsed.systemTheme as SystemTheme) : defaultState.systemTheme,
      chatFrameColor: ['violet', 'blue', 'emerald', 'rose', 'slate'].includes(parsed?.chatFrameColor as string) ? (parsed.chatFrameColor as ChatFrameColor) : defaultState.chatFrameColor,
      customBackground: validHex,
    };
  } catch {
    return defaultState;
  }
}

function saveTheme(state: ThemeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function getEffectiveTheme(systemTheme: SystemTheme): 'light' | 'dark' {
  if (systemTheme === 'light' || systemTheme === 'dark') return systemTheme;
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface ThemeContextValue extends ThemeState {
  setSystemTheme: (t: SystemTheme) => void;
  setChatFrameColor: (c: ChatFrameColor) => void;
  setCustomBackground: (hex: string | null) => void;
  effectiveTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ThemeState>(loadTheme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(() => getEffectiveTheme(state.systemTheme));

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const update = () => setEffectiveTheme(getEffectiveTheme(state.systemTheme));
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, [state.systemTheme]);

  useEffect(() => {
    const effective = getEffectiveTheme(state.systemTheme);
    setEffectiveTheme(effective);
    document.documentElement.classList.toggle('dark', effective === 'dark');
  }, [state.systemTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-chat-frame', state.chatFrameColor);
  }, [state.chatFrameColor]);

  useEffect(() => {
    if (state.customBackground) {
      applyCustomPalette(state.customBackground, effectiveTheme === 'dark');
    } else {
      clearCustomPalette();
    }
  }, [state.customBackground, effectiveTheme]);

  const setSystemTheme = useCallback((systemTheme: SystemTheme) => {
    setState((prev) => {
      const next = { ...prev, systemTheme };
      saveTheme(next);
      return next;
    });
  }, []);

  const setChatFrameColor = useCallback((chatFrameColor: ChatFrameColor) => {
    setState((prev) => {
      const next = { ...prev, chatFrameColor };
      saveTheme(next);
      return next;
    });
  }, []);

  const setCustomBackground = useCallback((customBackground: string | null) => {
    setState((prev) => {
      const next = { ...prev, customBackground };
      saveTheme(next);
      return next;
    });
  }, []);

  const value: ThemeContextValue = {
    ...state,
    setSystemTheme,
    setChatFrameColor,
    setCustomBackground,
    effectiveTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
