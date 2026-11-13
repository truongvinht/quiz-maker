import { describe, it, expect } from 'vitest';
import { loadSequentialQuiz } from './questionService';

describe('loadSequentialQuiz', () => {
  it('returns the whole bank in file order', async () => {
    const questions = await loadSequentialQuiz('aws-basics.json');
    expect(questions.map((q) => q.id)).toEqual(['1', '2', '3', '4']);
  });

  it('keeps all answer options for each question', async () => {
    const questions = await loadSequentialQuiz('aws-basics.json');
    const sortedOptionIds = questions.map((q) =>
      q.options?.map((o) => o.id).sort()
    );
    expect(sortedOptionIds).toEqual([
      ['a', 'b', 'c', 'd'],
      ['a', 'b', 'c', 'd', 'e'],
      ['a', 'b', 'c', 'd'],
      undefined,
    ]);
  });

  it('rejects when the question file does not exist', async () => {
    await expect(loadSequentialQuiz('nope.json')).rejects.toThrow(
      'Question file not found'
    );
  });
});
