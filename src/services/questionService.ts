import type { Question, QuizOption } from '../types/quiz';
import questionsData from '../data/questions.json';
import { shuffleArray } from '../utils/shuffleArray';

/**
 * Load questions from JSON and randomize their order
 */
export function loadQuestions(): Question[] {
  return shuffleArray(questionsData as Question[]);
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
export function loadRandomizedQuiz(): Question[] {
  const questions = loadQuestions();
  return questions.map(randomizeAnswerOptions);
}
