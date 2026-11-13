import type { Question, QuizResult } from '../types/quiz';

export function buildQuizResult(
  question: Question,
  selection: string[] | Map<number, string> | undefined
): QuizResult {
  const isOrderingQuestion = question.questionType === 'ordering';
  const isMatchingQuestion = question.questionType === 'matching';

  let userAnswersArray: string[] = [];
  let userAnswerTexts: string[] = [];
  let correctAnswerTexts: string[];
  let isCorrect = false;

  if (isOrderingQuestion) {
    correctAnswerTexts = question.steps?.map((step) =>
      `Step ${step.stepNumber}: ${step.correctAnswer}`
    ) || [];
  } else if (isMatchingQuestion) {
    correctAnswerTexts = question.scenarios?.map((scenario) =>
      `Scenario ${scenario.id}: ${scenario.correctAnswer}`
    ) || [];
  } else {
    correctAnswerTexts = (question.correctAnswers || []).map(
      (id) => question.options?.find((opt) => opt.id === id)?.text || ''
    );
  }

  if (selection) {
    if (isOrderingQuestion) {
      const answerMap = selection as Map<number, string>;
      userAnswersArray = Array.from(answerMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, value]) => value);

      userAnswerTexts = userAnswersArray.map((answer, index) => `Step ${index + 1}: ${answer}`);

      isCorrect = question.steps?.every((step, index) =>
        userAnswersArray[index] === step.correctAnswer
      ) || false;
    } else if (isMatchingQuestion) {
      const answerMap = selection as Map<number, string>;
      userAnswersArray = Array.from(answerMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, value]) => value);

      userAnswerTexts = userAnswersArray.map((answer, index) => `Scenario ${index + 1}: ${answer}`);

      isCorrect = question.scenarios?.every((scenario, index) =>
        userAnswersArray[index] === scenario.correctAnswer
      ) || false;
    } else {
      const optionsArray = selection as string[];
      userAnswersArray = optionsArray;

      userAnswerTexts = optionsArray.map(
        (id) => question.options?.find((opt) => opt.id === id)?.text || ''
      );

      isCorrect =
        optionsArray.length === (question.correctAnswers?.length || 0) &&
        optionsArray.every((id) => question.correctAnswers?.includes(id));
    }
  }

  return {
    questionId: question.id,
    questionText: question.text,
    userAnswers: userAnswersArray,
    userAnswerTexts,
    correctAnswers: question.correctAnswers || [],
    correctAnswerTexts,
    isCorrect,
    isMultipleChoice: question.isMultipleChoice,
    options: question.options || [],
    explanation: question.explanation,
  };
}
