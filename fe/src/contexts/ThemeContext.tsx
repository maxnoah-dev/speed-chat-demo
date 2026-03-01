import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type SystemTheme = 'light' | 'dark' | 'system';
export type ChatFrameColor = 'violet' | 'blue' | 'emerald' | 'rose' | 'slate';

interface ThemeState {
  systemTheme: SystemTheme;
  chatFrameColor: ChatFrameColor;
}

const STORAGE_KEY = 'speed_chat_theme';

const defaultState: ThemeState = {
  systemTheme: 'system',
  chatFrameColor: 'violet',
};

function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<ThemeState>;
    return {
      systemTheme: ['light', 'dark', 'system'].includes(parsed?.systemTheme as string) ? (parsed.systemTheme as SystemTheme) : defaultState.systemTheme,
      chatFrameColor: ['violet', 'blue', 'emerald', 'rose', 'slate'].includes(parsed?.chatFrameColor as string) ? (parsed.chatFrameColor as ChatFrameColor) : defaultState.chatFrameColor,
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

  const value: ThemeContextValue = {
    ...state,
    setSystemTheme,
    setChatFrameColor,
    effectiveTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
