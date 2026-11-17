import { describe, expect, it } from 'vitest';
import type { ProgressStorage } from './sequentialProgress';
import {
  THEME_STORAGE_KEY,
  loadThemePreference,
  nextThemePreference,
  parseThemePreference,
  resolveTheme,
  saveThemePreference,
} from './theme';

function fakeStorage(initial: Record<string, string> = {}): ProgressStorage & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (k) => (k in data ? data[k] : null),
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

const throwingStorage: ProgressStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

describe('parseThemePreference', () => {
  it('accepts the three valid values', () => {
    expect(parseThemePreference('light')).toBe('light');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference('system')).toBe('system');
  });

  it('falls back to system for null, empty or unknown values', () => {
    expect(parseThemePreference(null)).toBe('system');
    expect(parseThemePreference('')).toBe('system');
    expect(parseThemePreference('blue')).toBe('system');
  });
});

describe('loadThemePreference', () => {
  it('returns the stored value', () => {
    expect(loadThemePreference(fakeStorage({ [THEME_STORAGE_KEY]: 'dark' }))).toBe('dark');
  });

  it('returns system for null storage', () => {
    expect(loadThemePreference(null)).toBe('system');
  });

  it('returns system when getItem throws', () => {
    expect(loadThemePreference(throwingStorage)).toBe('system');
  });
});

describe('saveThemePreference', () => {
  it('writes under the theme key', () => {
    const storage = fakeStorage();
    saveThemePreference(storage, 'dark');
    expect(THEME_STORAGE_KEY).toBe('quiz-maker-theme');
    expect(storage.data['quiz-maker-theme']).toBe('dark');
  });

  it('does not throw when setItem throws', () => {
    expect(() => saveThemePreference(throwingStorage, 'dark')).not.toThrow();
  });

  it('does not throw for null storage', () => {
    expect(() => saveThemePreference(null, 'dark')).not.toThrow();
  });
});

describe('resolveTheme', () => {
  it('follows the system when preference is system', () => {
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('system', false)).toBe('light');
  });

  it('ignores the system for explicit preferences', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });
});

describe('nextThemePreference', () => {
  it('cycles system -> light -> dark -> system', () => {
    expect(nextThemePreference('system')).toBe('light');
    expect(nextThemePreference('light')).toBe('dark');
    expect(nextThemePreference('dark')).toBe('system');
  });
});
