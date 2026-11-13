import { describe, it, expect } from 'vitest';
import { buildQuizResult } from './quizResult';
import type { Question } from '../types/quiz';

const standard = (correctAnswers: string[]): Question => ({
  id: 'q1',
  text: 'Pick',
  options: [
    { id: 'a', label: 'A', text: 'Alpha' },
    { id: 'b', label: 'B', text: 'Beta' },
    { id: 'c', label: 'C', text: 'Gamma' },
  ],
  correctAnswers,
  explanation: 'because',
  isMultipleChoice: correctAnswers.length > 1,
});

const ordering: Question = {
  id: 'q2',
  text: 'Order',
  questionType: 'ordering',
  steps: [
    { stepNumber: 1, options: ['X', 'Y'], correctAnswer: 'X' },
    { stepNumber: 2, options: ['X', 'Y'], correctAnswer: 'Y' },
  ],
  explanation: 'e',
  isMultipleChoice: false,
};

const matching: Question = {
  id: 'q3',
  text: 'Match',
  questionType: 'matching',
  scenarios: [
    { id: 1, text: 's1', correctAnswer: 'P' },
    { id: 2, text: 's2', correctAnswer: 'Q' },
  ],
  matchingOptions: ['P', 'Q'],
  explanation: 'e',
  isMultipleChoice: false,
};

describe('buildQuizResult', () => {
  it('standard correct', () => {
    const r = buildQuizResult(standard(['b']), ['b']);
    expect(r.isCorrect).toBe(true);
    expect(r.userAnswerTexts).toEqual(['Beta']);
  });

  it('standard multi wrong', () => {
    expect(buildQuizResult(standard(['a', 'c']), ['a']).isCorrect).toBe(false);
  });

  it('ordering correct', () => {
    const r = buildQuizResult(ordering, new Map([[1, 'X'], [2, 'Y']]));
    expect(r.isCorrect).toBe(true);
    expect(r.userAnswerTexts).toEqual(['Step 1: X', 'Step 2: Y']);
    expect(r.correctAnswerTexts).toEqual(['Step 1: X', 'Step 2: Y']);
  });

  it('matching wrong', () => {
    const r = buildQuizResult(matching, new Map([[1, 'P'], [2, 'P']]));
    expect(r.isCorrect).toBe(false);
    expect(r.userAnswerTexts).toEqual(['Scenario 1: P', 'Scenario 2: P']);
  });

  it('no answer', () => {
    const r = buildQuizResult(standard(['b']), undefined);
    expect(r.userAnswers).toEqual([]);
    expect(r.isCorrect).toBe(false);
    expect(r.correctAnswerTexts).toEqual(['Beta']);
  });
});
