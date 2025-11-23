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
