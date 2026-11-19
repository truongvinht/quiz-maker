import { defaultStorage } from './sequentialProgress';
import type { ProgressStorage } from './sequentialProgress';

export type ExamSelection = string[] | Map<number, string>;

export const NAVIGATOR_MINIMIZED_KEY = 'quiz-maker:navigator-minimized';

export function isSelectionEmpty(sel: ExamSelection | undefined): boolean {
  if (sel === undefined) return true;
  return Array.isArray(sel) ? sel.length === 0 : sel.size === 0;
}

export function withSavedSelection(
  answers: Map<string, ExamSelection>,
  questionId: string,
  live: ExamSelection | undefined,
): Map<string, ExamSelection> {
  const next = new Map(answers);
  if (live === undefined) return next;
  if (isSelectionEmpty(live)) {
    next.delete(questionId);
  } else {
    next.set(questionId, Array.isArray(live) ? [...live] : new Map(live));
  }
  return next;
}

export function toggleFlag(flags: ReadonlySet<string>, questionId: string): Set<string> {
  const next = new Set(flags);
  if (!next.delete(questionId)) next.add(questionId);
  return next;
}

export function examCounts(
  questions: { id: string }[],
  answers: Map<string, ExamSelection>,
  flags: ReadonlySet<string>,
): { total: number; answered: number; unanswered: number; flagged: number } {
  let answered = 0;
  let flagged = 0;
  for (const q of questions) {
    if (!isSelectionEmpty(answers.get(q.id))) answered++;
    if (flags.has(q.id)) flagged++;
  }
  return {
    total: questions.length,
    answered,
    unanswered: questions.length - answered,
    flagged,
  };
}

export function submitConfirmMessage(unanswered: number, flagged: number): string {
  const parts: string[] = [];
  if (unanswered > 0) parts.push(`${unanswered} unanswered`);
  if (flagged > 0) parts.push(`${flagged} flagged`);
  const base = 'Submit the exam and see your results?';
  return parts.length === 0 ? base : `${base} ${parts.join(', ')}.`;
}

function copyStrikes(struck: ReadonlyMap<string, ReadonlySet<string>>): Map<string, Set<string>> {
  return new Map([...struck].map(([id, set]) => [id, new Set(set)]));
}

export function toggleStrike(
  struck: ReadonlyMap<string, ReadonlySet<string>>,
  questionId: string,
  optionId: string,
): Map<string, Set<string>> {
  const next = copyStrikes(struck);
  const set = next.get(questionId) ?? new Set<string>();
  if (!set.delete(optionId)) set.add(optionId);
  if (set.size === 0) next.delete(questionId);
  else next.set(questionId, set);
  return next;
}

export function withoutSelectedStrikes(
  struck: ReadonlyMap<string, ReadonlySet<string>>,
  questionId: string,
  selectedIds: readonly string[],
): Map<string, Set<string>> {
  const next = copyStrikes(struck);
  const set = next.get(questionId);
  if (!set) return next;
  for (const id of selectedIds) set.delete(id);
  if (set.size === 0) next.delete(questionId);
  return next;
}

export function loadNavigatorMinimized(
  storage: ProgressStorage | null = defaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    return storage.getItem(NAVIGATOR_MINIMIZED_KEY) === '1';
  } catch {
    return false;
  }
}

export function saveNavigatorMinimized(
  value: boolean,
  storage: ProgressStorage | null = defaultStorage(),
): void {
  try {
    storage?.setItem(NAVIGATOR_MINIMIZED_KEY, value ? '1' : '0');
  } catch {
    // best effort
  }
}
