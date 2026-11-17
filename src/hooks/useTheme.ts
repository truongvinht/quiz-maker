import { useCallback, useEffect, useState } from 'react';
import { defaultStorage } from '../lib/sequentialProgress';
import {
  loadThemePreference,
  nextThemePreference,
  resolveTheme,
  saveThemePreference,
  type ThemePreference,
} from '../lib/theme';

const DARK_QUERY = '(prefers-color-scheme: dark)';

function getMediaQuery(): MediaQueryList | null {
  try {
    return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(DARK_QUERY)
      : null;
  } catch {
    return null;
  }
}

export function useTheme(): {
  preference: ThemePreference;
  resolved: 'light' | 'dark';
  cycle: () => void;
} {
  const [preference, setPreference] = useState<ThemePreference>(() =>
    loadThemePreference(defaultStorage()),
  );
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(
    () => getMediaQuery()?.matches ?? false,
  );

  useEffect(() => {
    const mql = getMediaQuery();
    if (!mql) return;
    const onChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  const resolved = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', resolved === 'dark');
    root.style.colorScheme = resolved;
  }, [resolved]);

  const cycle = useCallback(() => {
    const next = nextThemePreference(preference);
    saveThemePreference(defaultStorage(), next);
    setPreference(next);
  }, [preference]);

  return { preference, resolved, cycle };
}
