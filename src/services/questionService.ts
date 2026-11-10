import type { Question } from '../types/quiz';
import { shuffleArray } from '../utils/shuffleArray';

// Public question banks in src/data/ and private ones in src/data/private/ (gitignored)
const questionFiles = import.meta.glob<Question[]>(
  [
    '../data/*.json',
    '../data/private/*.json',
    '!../data/private/topics.json',
    '!../data/private/topics.example.json',
  ],
  { import: 'default' }
);

/**
 * Load questions from a specific topic file and randomize their order
 */
export async function loadQuestions(fileName: string): Promise<Question[]> {
  const name = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  const loader =
    questionFiles[`../data/${name}`] ?? questionFiles[`../data/private/${name}`];
  if (!loader) {
    throw new Error(`Question file not found: ${name}`);
  }
  return shuffleArray(await loader());
}

/**
 * Randomize the order of answer options for a question
 * Maintains the correct answer IDs but shuffles option positions
 * Skip randomization for ordering questions
 */
export function randomizeAnswerOptions(question: Question): Question {
  // Don't randomize ordering questions
  if (question.questionType === 'ordering' || !question.options) {
    return question;
  }

  const shuffledOptions = shuffleArray(question.options);

  return {
    ...question,
    options: shuffledOptions,
  };
}

/**
 * Load and prepare questions with randomized question order and answer options
 */
export async function loadRandomizedQuiz(
  fileName: string,
  startQuestion?: number,
  questionCount?: number
): Promise<Question[]> {
  const questions = await loadQuestions(fileName);

  // Apply slicing if start and count are provided
  let selectedQuestions = questions;
  if (startQuestion !== undefined && questionCount !== undefined) {
    // startQuestion is 1-indexed, convert to 0-indexed
    const startIndex = startQuestion - 1;
    const endIndex = startIndex + questionCount;
    selectedQuestions = questions.slice(startIndex, endIndex);
  }

  return selectedQuestions.map(randomizeAnswerOptions);
}
