export interface QuizOption {
  id: string;
  label: string; // A, B, C, D, etc.
  text: string;
}

export interface OrderingStep {
  stepNumber: number;
  options: string[];
  correctAnswer: string;
}

export interface MatchingScenario {
  id: number;
  text: string;
  correctAnswer: string;
}

export interface Question {
  id: string;
  text: string;
  questionType?: 'standard' | 'ordering' | 'matching'; // Optional, defaults to 'standard'
  options?: QuizOption[]; // For standard questions
  correctAnswers?: string[]; // For standard questions - array of option IDs
  steps?: OrderingStep[]; // For ordering questions
  scenarios?: MatchingScenario[]; // For matching questions
  matchingOptions?: string[]; // For matching questions - shared dropdown options
  explanation: string;
  isMultipleChoice: boolean; // true = checkboxes, false = radio buttons
}

export interface UserAnswer {
  questionId: string;
  selectedOptions: string[] | Map<number, string>; // Array for standard, Map for ordering
  isCorrect: boolean;
  submitted: boolean;
}

export interface QuizResult {
  questionId: string;
  questionText: string;
  userAnswers: string[]; // Selected option IDs
  userAnswerTexts: string[]; // Selected option texts for display
  correctAnswers: string[]; // Correct option IDs
  correctAnswerTexts: string[]; // Correct option texts for display
  isCorrect: boolean;
  isMultipleChoice: boolean;
  options: QuizOption[]; // All options in order for summary display
  explanation: string; // Explanation for the answer
}

export interface QuizSummary {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // Percentage
  results: QuizResult[];
}

export interface QuizTopic {
  id: string;
  name: string;
  description: string;
  fileName: string;
  questionCount: number;
  icon?: string;
}
