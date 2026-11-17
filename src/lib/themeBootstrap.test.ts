import { describe, expect, it } from 'vitest';
import html from '../../index.html?raw';
import { THEME_STORAGE_KEY } from './theme';

describe('index.html theme bootstrap', () => {
  const mainIdx = html.indexOf('/src/main.tsx');
  const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)];
  const inline = scripts.find((m) => m.index !== undefined && m.index < mainIdx);

  it('has an inline script before the app entry', () => {
    expect(mainIdx).toBeGreaterThan(-1);
    expect(inline).toBeDefined();
  });

  it('uses the same storage key, media query and class toggling', () => {
    const code = inline?.[1] ?? '';
    expect(code).toContain(THEME_STORAGE_KEY);
    expect(code).toContain('prefers-color-scheme: dark');
    expect(code).toContain('classList');
  });
});
