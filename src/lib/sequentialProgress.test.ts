import { describe, it, expect } from 'vitest';
import {
  progressKey,
  toStoredSelection,
  fromStoredSelection,
  loadProgress,
  saveAnswer,
  resetProgress,
  squareStatus,
  isAnswered,
  progressCounts,
  findDuplicateIds,
} from './sequentialProgress';
import type { ProgressStorage, SavedAnswer, SequentialProgress } from './sequentialProgress';

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

const correct: SavedAnswer = {
  selection: { kind: 'options', ids: ['a'] },
  isCorrect: true,
  answeredAt: '2026-11-13T10:00:00.000Z',
};
const wrong: SavedAnswer = { ...correct, isCorrect: false };

describe('progressKey', () => {
  it('prefixes the topic id', () => {
    expect(progressKey('aws-basics')).toBe('quiz-maker:sequential:aws-basics');
  });
});

describe('stored selection round trip', () => {
  it('round trips option ids', () => {
    expect(fromStoredSelection(toStoredSelection(['a', 'b']))).toEqual(['a', 'b']);
  });
  it('round trips a Map', () => {
    const m = new Map([[1, 'X']]);
    expect(fromStoredSelection(toStoredSelection(m))).toEqual(m);
  });
});

describe('loadProgress', () => {
  it('returns {} for a missing key', () => {
    expect(loadProgress('t', memoryStorage())).toEqual({});
  });
  it('returns {} for invalid JSON and non-objects', () => {
    const s = memoryStorage();
    s.setItem(progressKey('t'), 'not json');
    expect(loadProgress('t', s)).toEqual({});
    s.setItem(progressKey('t'), '[1,2]');
    expect(loadProgress('t', s)).toEqual({});
  });
  it('drops malformed entries but keeps valid ones', () => {
    const s = memoryStorage();
    s.setItem(
      progressKey('t'),
      JSON.stringify({
        good: correct,
        bad: { selection: correct.selection, answeredAt: correct.answeredAt },
        badSel: { ...correct, selection: { kind: 'entries', entries: [['x', 'y']] } },
      }),
    );
    expect(loadProgress('t', s)).toEqual({ good: correct });
  });
  it('returns {} when storage is null or throws', () => {
    expect(loadProgress('t', null)).toEqual({});
    expect(loadProgress('t', throwingStorage)).toEqual({});
  });
});

describe('saveAnswer', () => {
  it('persists the answer and leaves other topics untouched', () => {
    const s = memoryStorage();
    s.setItem(progressKey('other'), 'keep');
    const next = saveAnswer('t', {}, 'q1', correct, s);
    expect(next).toEqual({ q1: correct });
    expect(loadProgress('t', s)).toEqual({ q1: correct });
    expect(s.getItem(progressKey('other'))).toBe('keep');
  });
  it('returns the same object and does not write when id already present', () => {
    const s = memoryStorage();
    const progress: SequentialProgress = { q1: correct };
    const next = saveAnswer('t', progress, 'q1', wrong, s);
    expect(next).toBe(progress);
    expect(s.data.size).toBe(0);
  });
  it('still returns the merged object when storage throws', () => {
    expect(saveAnswer('t', {}, 'q1', correct, throwingStorage)).toEqual({ q1: correct });
  });
  it('keeps answers another tab saved', () => {
    const s = memoryStorage();
    s.setItem(progressKey('t'), JSON.stringify({ '2': wrong }));
    const next = saveAnswer('t', { '1': correct }, '3', correct, s);
    expect(next).toEqual({ '1': correct, '2': wrong, '3': correct });
    expect(loadProgress('t', s)).toEqual({ '1': correct, '2': wrong, '3': correct });
  });
  it('lets the stored answer win over a new one for the same id', () => {
    const s = memoryStorage();
    s.setItem(progressKey('t'), JSON.stringify({ '3': wrong }));
    const next = saveAnswer('t', {}, '3', correct, s);
    expect(next).toEqual({ '3': wrong });
    expect(loadProgress('t', s)).toEqual({ '3': wrong });
  });
  it('returns in-memory plus the new answer when storage throws', () => {
    expect(saveAnswer('t', { '1': correct }, '2', wrong, throwingStorage)).toEqual({
      '1': correct,
      '2': wrong,
    });
  });
});

describe('resetProgress', () => {
  it('clears saved progress', () => {
    const s = memoryStorage();
    saveAnswer('t', {}, 'q1', correct, s);
    resetProgress('t', s);
    expect(loadProgress('t', s)).toEqual({});
  });
  it('does not throw when storage throws', () => {
    expect(() => resetProgress('t', throwingStorage)).not.toThrow();
  });
});

describe('squareStatus', () => {
  it('maps saved answers to statuses', () => {
    const p: SequentialProgress = { c: correct, w: wrong };
    expect(squareStatus(p, 'none')).toBe('unanswered');
    expect(squareStatus(p, 'c')).toBe('correct');
    expect(squareStatus(p, 'w')).toBe('wrong');
  });
});

describe('isAnswered', () => {
  it('uses own keys only', () => {
    expect(isAnswered({ q1: correct }, 'q1')).toBe(true);
    expect(isAnswered({ q1: correct }, 'q2')).toBe(false);
    expect(isAnswered({}, 'toString')).toBe(false);
  });
});

describe('progressCounts', () => {
  it('ignores progress for ids not in the questions', () => {
    const qs = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const p: SequentialProgress = { '2': correct, '3': wrong, '99': correct };
    expect(progressCounts(qs, p)).toEqual({ total: 3, answered: 2, correct: 1, wrong: 1 });
  });
});

describe('findDuplicateIds', () => {
  it('returns ids that occur more than once', () => {
    expect(findDuplicateIds([{ id: '1' }, { id: '2' }, { id: '1' }])).toEqual(['1']);
  });
});
