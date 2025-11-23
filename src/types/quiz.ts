export interface QuizOption {
  id: string;
  label: string; // A, B, C, D, etc.
  text: string;
}

export interface Question {
  id: string;
  text: string;
  options: QuizOption[];
  correctAnswers: string[]; // Array of option IDs
  explanation: string;
  isMultipleChoice: boolean; // true = checkboxes, false = radio buttons
}

export interface UserAnswer {
  questionId: string;
  selectedOptions: string[]; // Array of selected option IDs
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
