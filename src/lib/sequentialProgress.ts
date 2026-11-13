export type StoredSelection =
  | { kind: 'options'; ids: string[] }
  | { kind: 'entries'; entries: [number, string][] };

export interface SavedAnswer {
  selection: StoredSelection;
  isCorrect: boolean;
  answeredAt: string; // ISO timestamp
}

// key = question id
export type SequentialProgress = Record<string, SavedAnswer>;

export interface ProgressStorage {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

export type SquareStatus = 'unanswered' | 'correct' | 'wrong';

export const progressKey = (topicId: string): string => `quiz-maker:sequential:${topicId}`;

export function defaultStorage(): ProgressStorage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function toStoredSelection(sel: string[] | Map<number, string>): StoredSelection {
  return Array.isArray(sel)
    ? { kind: 'options', ids: [...sel] }
    : { kind: 'entries', entries: [...sel.entries()] };
}

export function fromStoredSelection(s: StoredSelection): string[] | Map<number, string> {
  return s.kind === 'options' ? [...s.ids] : new Map(s.entries);
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const has = (o: object, key: string): boolean => Object.prototype.hasOwnProperty.call(o, key);

function isStoredSelection(v: unknown): v is StoredSelection {
  if (!isRecord(v)) return false;
  if (v.kind === 'options') {
    return Array.isArray(v.ids) && v.ids.every((id) => typeof id === 'string');
  }
  if (v.kind === 'entries') {
    return (
      Array.isArray(v.entries) &&
      v.entries.every(
        (e) =>
          Array.isArray(e) && e.length === 2 && typeof e[0] === 'number' && typeof e[1] === 'string',
      )
    );
  }
  return false;
}

function isSavedAnswer(v: unknown): v is SavedAnswer {
  return (
    isRecord(v) &&
    typeof v.isCorrect === 'boolean' &&
    typeof v.answeredAt === 'string' &&
    isStoredSelection(v.selection)
  );
}

export function loadProgress(
  topicId: string,
  storage: ProgressStorage | null = defaultStorage(),
): SequentialProgress {
  if (!storage) return {};
  try {
    const raw = storage.getItem(progressKey(topicId));
    if (raw === null) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return {};
    const result: SequentialProgress = {};
    for (const [id, entry] of Object.entries(parsed)) {
      if (isSavedAnswer(entry)) result[id] = entry;
    }
    return result;
  } catch {
    return {};
  }
}

export function saveAnswer(
  topicId: string,
  progress: SequentialProgress,
  questionId: string,
  answer: SavedAnswer,
  storage: ProgressStorage | null = defaultStorage(),
): SequentialProgress {
  if (has(progress, questionId)) return progress;
  const next = { ...progress, [questionId]: answer };
  try {
    storage?.setItem(progressKey(topicId), JSON.stringify(next));
  } catch {
    // best effort: progress stays in memory for this session
  }
  return next;
}

export function resetProgress(
  topicId: string,
  storage: ProgressStorage | null = defaultStorage(),
): void {
  try {
    storage?.removeItem(progressKey(topicId));
  } catch {
    // best effort
  }
}

export function squareStatus(progress: SequentialProgress, questionId: string): SquareStatus {
  if (!has(progress, questionId)) return 'unanswered';
  return progress[questionId].isCorrect ? 'correct' : 'wrong';
}

export function progressCounts(
  questions: { id: string }[],
  progress: SequentialProgress,
): { total: number; answered: number; correct: number; wrong: number } {
  let correct = 0;
  let wrong = 0;
  for (const q of questions) {
    const status = squareStatus(progress, q.id);
    if (status === 'correct') correct++;
    else if (status === 'wrong') wrong++;
  }
  return { total: questions.length, answered: correct + wrong, correct, wrong };
}

export function findDuplicateIds(questions: { id: string }[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const q of questions) {
    if (seen.has(q.id)) dupes.add(q.id);
    seen.add(q.id);
  }
  return [...dupes];
}
