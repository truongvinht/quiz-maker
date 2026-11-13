import { describe, it, expect } from 'vitest';
import { resolveShortcut } from './keyboardShortcuts';
import type { ShortcutEventLike } from './keyboardShortcuts';

const ev = (over: Partial<ShortcutEventLike> = {}): ShortcutEventLike => ({
  key: 'a',
  metaKey: false,
  ctrlKey: false,
  altKey: false,
  shiftKey: false,
  target: null,
  ...over,
});

describe('resolveShortcut', () => {
  it('maps a/d to prev/next, also with Caps Lock', () => {
    expect(resolveShortcut(ev({ key: 'a' }))).toEqual({ type: 'prev' });
    expect(resolveShortcut(ev({ key: 'd' }))).toEqual({ type: 'next' });
    expect(resolveShortcut(ev({ key: 'A' }))).toEqual({ type: 'prev' });
  });

  it('maps digits 1-9 to zero-based option indexes', () => {
    expect(resolveShortcut(ev({ key: '1' }))).toEqual({ type: 'option', index: 0 });
    expect(resolveShortcut(ev({ key: '9' }))).toEqual({ type: 'option', index: 8 });
    expect(resolveShortcut(ev({ key: '0' }))).toBeNull();
  });

  it.each(['metaKey', 'ctrlKey', 'altKey', 'shiftKey'] as const)('ignores %s', (mod) => {
    expect(resolveShortcut(ev({ key: 'a', [mod]: true }))).toBeNull();
    expect(resolveShortcut(ev({ key: '1', [mod]: true }))).toBeNull();
  });

  it('ignores typing targets', () => {
    for (const target of [
      { tagName: 'SELECT' },
      { tagName: 'INPUT' },
      { tagName: 'TEXTAREA' },
      { isContentEditable: true },
    ]) {
      expect(resolveShortcut(ev({ key: 'a', target }))).toBeNull();
      expect(resolveShortcut(ev({ key: '1', target }))).toBeNull();
    }
  });

  it('does not treat checkbox/radio inputs as typing targets', () => {
    expect(resolveShortcut(ev({ key: 'a', target: { tagName: 'INPUT', type: 'radio' } }))).toEqual({
      type: 'prev',
    });
    expect(resolveShortcut(ev({ key: '1', target: { tagName: 'INPUT', type: 'checkbox' } }))).toEqual({
      type: 'option',
      index: 0,
    });
  });

  it('still ignores text-like and untyped inputs', () => {
    expect(resolveShortcut(ev({ key: 'a', target: { tagName: 'INPUT', type: 'text' } }))).toBeNull();
    expect(resolveShortcut(ev({ key: 'a', target: { tagName: 'INPUT' } }))).toBeNull();
  });

  it('still resolves on buttons and null targets', () => {
    expect(resolveShortcut(ev({ key: 'd', target: { tagName: 'BUTTON' } }))).toEqual({ type: 'next' });
    expect(resolveShortcut(ev({ key: 'd', target: null }))).toEqual({ type: 'next' });
  });

  it('ignores other keys', () => {
    expect(resolveShortcut(ev({ key: 'x' }))).toBeNull();
    expect(resolveShortcut(ev({ key: 'Enter' }))).toBeNull();
  });
});
