import { defaultStorage, type ProgressStorage } from './sequentialProgress';

export type ThemePreference = 'system' | 'light' | 'dark';

export const THEME_STORAGE_KEY = 'quiz-maker-theme';

export function parseThemePreference(raw: string | null): ThemePreference {
  return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : 'system';
}

export function loadThemePreference(
  storage: ProgressStorage | null = defaultStorage(),
): ThemePreference {
  if (!storage) return 'system';
  try {
    return parseThemePreference(storage.getItem(THEME_STORAGE_KEY));
  } catch {
    return 'system';
  }
}

export function saveThemePreference(
  storage: ProgressStorage | null,
  pref: ThemePreference,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // best effort: preference stays in memory for this session
  }
}

export function resolveTheme(
  pref: ThemePreference,
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (pref === 'system') return systemPrefersDark ? 'dark' : 'light';
  return pref;
}

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
};

export const nextThemePreference = (pref: ThemePreference): ThemePreference => NEXT[pref];
