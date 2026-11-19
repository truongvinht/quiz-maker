import { describe, it, expect } from 'vitest';
import {
  isSelectionEmpty,
  withSavedSelection,
  toggleFlag,
  examCounts,
  submitConfirmMessage,
  toggleStrike,
  withoutSelectedStrikes,
  loadNavigatorMinimized,
  saveNavigatorMinimized,
} from './examState';
import type { ExamSelection } from './examState';
import type { ProgressStorage } from './sequentialProgress';

const memoryStorage = (): ProgressStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k) => data.get(k) ?? null,
    setItem: (k, v) => {
      data.set(k, v);
    },
    removeItem: (k) => {
      data.delete(k);
    },
  };
};

const throwingStorage: ProgressStorage = {
  getItem: () => {
    throw new Error('denied');
  },
  setItem: () => {
    throw new Error('denied');
  },
  removeItem: () => {
    throw new Error('denied');
  },
};

describe('isSelectionEmpty', () => {
  it('is true for undefined and empty selections', () => {
    expect(isSelectionEmpty(undefined)).toBe(true);
    expect(isSelectionEmpty([])).toBe(true);
    expect(isSelectionEmpty(new Map())).toBe(true);
  });
  it('is false for non-empty selections', () => {
    expect(isSelectionEmpty(['a'])).toBe(false);
    expect(isSelectionEmpty(new Map([[1, 'x']]))).toBe(false);
  });
});

describe('withSavedSelection', () => {
  it('sets a selection', () => {
    const result = withSavedSelection(new Map(), 'q1', ['b']);
    expect(result.get('q1')).toEqual(['b']);
  });
  it('leaves answers unchanged for undefined but returns a new map', () => {
    const answers = new Map<string, ExamSelection>([['q1', ['a']]]);
    const result = withSavedSelection(answers, 'q1', undefined);
    expect(result).not.toBe(answers);
    expect([...result.entries()]).toEqual([['q1', ['a']]]);
  });
  it('removes the entry for an empty selection', () => {
    const answers = new Map<string, ExamSelection>([['q1', ['a']]]);
    const result = withSavedSelection(answers, 'q1', []);
    expect(result.has('q1')).toBe(false);
    expect(answers.has('q1')).toBe(true);
  });
  it('stores a partial matching map', () => {
    const result = withSavedSelection(new Map(), 'q1', new Map([[2, 'x']]));
    expect(result.get('q1')).toEqual(new Map([[2, 'x']]));
  });
  it('stores a copy of the live selection', () => {
    const live = ['a'];
    const liveMap = new Map([[1, 'x']]);
    const result = withSavedSelection(withSavedSelection(new Map(), 'q1', live), 'q2', liveMap);
    live.push('b');
    liveMap.set(2, 'y');
    expect(result.get('q1')).toEqual(['a']);
    expect(result.get('q2')).toEqual(new Map([[1, 'x']]));
  });
});

describe('toggleFlag', () => {
  it('adds then removes without mutating the input', () => {
    const start = new Set<string>();
    const added = toggleFlag(start, 'q1');
    expect([...added]).toEqual(['q1']);
    expect(start.size).toBe(0);
    const removed = toggleFlag(added, 'q1');
    expect(removed.size).toBe(0);
    expect(added.has('q1')).toBe(true);
  });
});

describe('toggleStrike', () => {
  it('adds and removes strikes, dropping empty entries', () => {
    const start = new Map<string, Set<string>>();
    const one = toggleStrike(start, 'q1', 'b');
    expect(one).toEqual(new Map([['q1', new Set(['b'])]]));
    const two = toggleStrike(one, 'q1', 'c');
    expect(two).toEqual(new Map([['q1', new Set(['b', 'c'])]]));
    const afterB = toggleStrike(two, 'q1', 'b');
    const none = toggleStrike(afterB, 'q1', 'c');
    expect(none.has('q1')).toBe(false);
  });
  it('leaves other questions untouched and does not mutate inputs', () => {
    const q2 = new Set(['z']);
    const q1 = new Set(['b']);
    const start = new Map([
      ['q1', q1],
      ['q2', q2],
    ]);
    const result = toggleStrike(start, 'q1', 'c');
    expect(result.get('q2')).toEqual(new Set(['z']));
    expect([...q1]).toEqual(['b']);
    expect([...q2]).toEqual(['z']);
    expect(start.get('q1')).toBe(q1);
    expect(start.size).toBe(2);
  });
});

describe('withoutSelectedStrikes', () => {
  const base = () =>
    new Map<string, Set<string>>([
      ['q1', new Set(['b', 'c'])],
      ['q2', new Set(['z'])],
    ]);
  it('removes selected option ids from strikes', () => {
    const result = withoutSelectedStrikes(base(), 'q1', ['b']);
    expect(result.get('q1')).toEqual(new Set(['c']));
    expect(result.get('q2')).toEqual(new Set(['z']));
  });
  it('drops an emptied entry', () => {
    const result = withoutSelectedStrikes(base(), 'q1', ['b', 'c']);
    expect(result.has('q1')).toBe(false);
    expect(result.has('q2')).toBe(true);
  });
  it('returns the same contents when nothing is selected among strikes', () => {
    expect(withoutSelectedStrikes(base(), 'q1', ['a'])).toEqual(base());
  });
  it('does not mutate inputs', () => {
    const input = base();
    withoutSelectedStrikes(input, 'q1', ['b', 'c']);
    expect(input).toEqual(base());
  });
});

describe('examCounts', () => {
  it('counts answered, unanswered and flagged questions in the list', () => {
    const questions = [{ id: 'q1' }, { id: 'q2' }, { id: 'q3' }];
    const answers = new Map<string, ExamSelection>([
      ['q1', ['a']],
      ['q2', []],
    ]);
    const flags = new Set(['q2', 'zz']);
    expect(examCounts(questions, answers, flags)).toEqual({
      total: 3,
      answered: 1,
      unanswered: 2,
      flagged: 1,
    });
  });
});

describe('submitConfirmMessage', () => {
  it('formats unanswered and flagged parts', () => {
    expect(submitConfirmMessage(3, 2)).toBe(
      'Submit the exam and see your results? 3 unanswered, 2 flagged.',
    );
    expect(submitConfirmMessage(0, 2)).toBe('Submit the exam and see your results? 2 flagged.');
    expect(submitConfirmMessage(1, 0)).toBe('Submit the exam and see your results? 1 unanswered.');
    expect(submitConfirmMessage(0, 0)).toBe('Submit the exam and see your results?');
  });
});

describe('navigator minimized preference', () => {
  it('round-trips true and false under the expected key', () => {
    const storage = memoryStorage();
    saveNavigatorMinimized(true, storage);
    expect(storage.data.get('quiz-maker:navigator-minimized')).toBe('1');
    expect(loadNavigatorMinimized(storage)).toBe(true);
    saveNavigatorMinimized(false, storage);
    expect(storage.data.get('quiz-maker:navigator-minimized')).toBe('0');
    expect(loadNavigatorMinimized(storage)).toBe(false);
  });
  it('loads a pre-seeded "1" as true and other values as false', () => {
    const storage = memoryStorage();
    storage.data.set('quiz-maker:navigator-minimized', '1');
    expect(loadNavigatorMinimized(storage)).toBe(true);
    storage.data.set('quiz-maker:navigator-minimized', 'true');
    expect(loadNavigatorMinimized(storage)).toBe(false);
  });
  it('falls back to false when storage throws or is missing', () => {
    expect(loadNavigatorMinimized(throwingStorage)).toBe(false);
    expect(() => saveNavigatorMinimized(true, throwingStorage)).not.toThrow();
    expect(loadNavigatorMinimized(null)).toBe(false);
  });
});
