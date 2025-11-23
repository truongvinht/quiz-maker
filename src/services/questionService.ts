import type { Question } from '../types/quiz';
import { shuffleArray } from '../utils/shuffleArray';

/**
 * Load questions from a specific topic file and randomize their order
 */
export async function loadQuestions(fileName: string): Promise<Question[]> {
  const questionsData = await import(`../data/${fileName}`);
  return shuffleArray(questionsData.default as Question[]);
}

/**
 * Randomize the order of answer options for a question
 * Maintains the correct answer IDs but shuffles option positions
 */
export function randomizeAnswerOptions(question: Question): Question {
  const shuffledOptions = shuffleArray(question.options);

  return {
    ...question,
    options: shuffledOptions,
  };
}

/**
 * Load and prepare questions with randomized question order and answer options
 */
export async function loadRandomizedQuiz(fileName: string): Promise<Question[]> {
  const questions = await loadQuestions(fileName);
  return questions.map(randomizeAnswerOptions);
}
