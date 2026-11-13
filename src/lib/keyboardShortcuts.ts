import { useEffect, useRef } from 'react';

export interface ShortcutEventLike {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: { tagName?: string; isContentEditable?: boolean } | null;
}

export type ShortcutAction =
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'option'; index: number }
  | null;

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

/** Maps a key event to a quiz action. `index` for options is 0-based ('1' -> 0). */
export const resolveShortcut = (e: ShortcutEventLike): ShortcutAction => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return null;
  if (e.target) {
    if (e.target.isContentEditable) return null;
    if (e.target.tagName && TYPING_TAGS.has(e.target.tagName.toUpperCase())) return null;
  }
  const key = e.key.toLowerCase();
  if (key === 'a') return { type: 'prev' };
  if (key === 'd') return { type: 'next' };
  if (/^[1-9]$/.test(key)) return { type: 'option', index: Number(key) - 1 };
  return null;
};

export const useKeyboardShortcut = (
  onAction: (a: Exclude<ShortcutAction, null>) => void,
  enabled: boolean,
): void => {
  const callbackRef = useRef(onAction);

  useEffect(() => {
    callbackRef.current = onAction;
  });

  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const action = resolveShortcut({
        key: e.key,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        target: e.target instanceof HTMLElement ? e.target : null,
      });
      if (!action) return;
      e.preventDefault();
      callbackRef.current(action);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);
};
