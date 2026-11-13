import { useEffect, useRef } from 'react';

export interface ShortcutEventLike {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  target: { tagName?: string; isContentEditable?: boolean; type?: string } | null;
}

export type ShortcutAction =
  | { type: 'prev' }
  | { type: 'next' }
  | { type: 'option'; index: number }
  | null;

const TYPING_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);
// Inputs of these types take no typed text, so they must not block shortcuts
const NON_TYPING_INPUT_TYPES = new Set(['checkbox', 'radio', 'button', 'submit', 'reset']);

/** Maps a key event to a quiz action. `index` for options is 0-based ('1' -> 0). */
export const resolveShortcut = (e: ShortcutEventLike): ShortcutAction => {
  if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return null;
  if (e.target) {
    if (e.target.isContentEditable) return null;
    const tag = e.target.tagName?.toUpperCase();
    if (tag && TYPING_TAGS.has(tag)) {
      const isNonTypingInput =
        tag === 'INPUT' && NON_TYPING_INPUT_TYPES.has((e.target.type ?? '').toLowerCase());
      if (!isNonTypingInput) return null;
    }
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
        target:
          e.target instanceof HTMLElement
            ? {
                tagName: e.target.tagName,
                isContentEditable: e.target.isContentEditable,
                type: e.target instanceof HTMLInputElement ? e.target.type : undefined,
              }
            : null,
      });
      if (!action) return;
      e.preventDefault();
      callbackRef.current(action);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);
};
