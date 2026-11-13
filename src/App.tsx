import { useState, useEffect, useRef, useCallback } from 'react';
import QuestionCard from './components/QuestionCard';
import QuizSummary from './components/QuizSummary';
import TopicSelection from './components/TopicSelection';
import QuizConfiguration from './components/QuizConfiguration';
import QuestionNavigator from './components/QuestionNavigator';
import { loadRandomizedQuiz, loadSequentialQuiz } from './services/questionService';
import { quizTopics } from './data/topics';
import { useTimer } from './hooks/useTimer';
import { buildQuizResult } from './lib/quizResult';
import {
  loadProgress,
  saveAnswer,
  resetProgress,
  toStoredSelection,
  fromStoredSelection,
  progressCounts,
  isAnswered,
  findDuplicateIds,
  type SequentialProgress,
} from './lib/sequentialProgress';
import { useKeyboardShortcut } from './lib/keyboardShortcuts';
import { Button } from '@/components/ui/button';
import type { QuizResult, QuizSummary as QuizSummaryType, Question, QuizTopic, QuizConfig, QuizMode } from './types/quiz';

// Previous/Next in the dark question-screen header: light outline instead of the default white fill.
const HEADER_NAV_BUTTON_CLASSES =
  'bg-transparent border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground px-3 sm:px-4';

function App() {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, QuizResult>>(new Map());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>('training');
  const [selectedAnswers, setSelectedAnswers] = useState<Map<string, string[] | Map<number, string>>>(new Map());

  const [sequentialProgress, setSequentialProgress] = useState<SequentialProgress>({});
  // Bumped on sequential reset so the current QuestionCard remounts with fresh state
  const [resetGeneration, setResetGeneration] = useState(0);
  // The question whose answer completed the bank; its card offers "View Results"
  const [completedOnQuestionId, setCompletedOnQuestionId] = useState<string | null>(null);

  // Exam mode: the current card's live selection, saved when D moves on
  const liveExamSelection = useRef<string[]>([]);
  const handleExamSelectionChange = useCallback((selected: string[]) => {
    liveExamSelection.current = selected;
  }, []);

  const { formattedTime, reset: resetTimer } = useTimer(quizStarted && !quizCompleted);

  const isSequential = quizMode === 'sequential';
  const questionScreenActive =
    !!selectedTopic && !!quizConfig && !isLoading && questions.length > 0 && !quizCompleted;

  // Load questions when quiz configuration is complete
  useEffect(() => {
    if (selectedTopic && quizConfig) {
      // Valid use of setState in effect - initializing quiz state from configuration
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(true);
      setQuizMode(quizConfig.mode); // Set quiz mode from configuration
      if (quizConfig.mode === 'sequential') {
        loadSequentialQuiz(selectedTopic.fileName)
          .then((loadedQuestions) => {
            const duplicates = findDuplicateIds(loadedQuestions);
            if (duplicates.length > 0) {
              console.warn('Duplicate question ids in sequential quiz:', duplicates);
            }
            const progress = loadProgress(selectedTopic.id);
            const firstUnanswered = loadedQuestions.findIndex((q) => !isAnswered(progress, q.id));
            setSequentialProgress(progress);
            setCurrentQuestionIndex(firstUnanswered === -1 ? 0 : firstUnanswered);
            setQuestions(loadedQuestions);
            setQuizStarted(true);
          })
          .finally(() => setIsLoading(false));
      } else {
        loadRandomizedQuiz(
          selectedTopic.fileName,
          quizConfig.startQuestion,
          quizConfig.questionCount
        )
          .then((loadedQuestions) => {
            setQuestions(loadedQuestions);
            setQuizStarted(true); // Start timer when questions are loaded
          })
          .finally(() => setIsLoading(false));
      }
    }
  }, [selectedTopic, quizConfig]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSubmit = (selectedOptions: string[] | Map<number, string>, isCorrect: boolean) => {
    // Sequential mode: answers are final; persist once per question
    if (quizMode === 'sequential') {
      if (!selectedTopic || isAnswered(sequentialProgress, currentQuestion.id)) return;
      const nextProgress = saveAnswer(selectedTopic.id, sequentialProgress, currentQuestion.id, {
        selection: toStoredSelection(selectedOptions),
        isCorrect: buildQuizResult(currentQuestion, selectedOptions).isCorrect,
        answeredAt: new Date().toISOString(),
      });
      setSequentialProgress(nextProgress);
      if (progressCounts(questions, nextProgress).answered === totalQuestions) {
        setCompletedOnQuestionId(currentQuestion.id);
      }
      return;
    }

    // In exam mode, just store the selection without validation
    if (quizMode === 'exam') {
      setSelectedAnswers((prev) => new Map(prev).set(currentQuestion.id, selectedOptions));
      return;
    }

    // Training mode: immediate validation and feedback
    const isOrderingQuestion = currentQuestion.questionType === 'ordering';

    let userAnswerTexts: string[];
    let correctAnswerTexts: string[];
    let userAnswersArray: string[];

    if (isOrderingQuestion) {
      // Handle ordering question
      const answerMap = selectedOptions as Map<number, string>;
      userAnswersArray = Array.from(answerMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, value]) => value);

      userAnswerTexts = userAnswersArray.map((answer, index) => `Step ${index + 1}: ${answer}`);
      correctAnswerTexts = currentQuestion.steps?.map((step) =>
        `Step ${step.stepNumber}: ${step.correctAnswer}`
      ) || [];
    } else {
      // Handle standard multiple choice question
      const optionsArray = selectedOptions as string[];
      userAnswersArray = optionsArray;

      userAnswerTexts = optionsArray.map(
        (id) => currentQuestion.options?.find((opt) => opt.id === id)?.text || ''
      );
      correctAnswerTexts = (currentQuestion.correctAnswers || []).map(
        (id) => currentQuestion.options?.find((opt) => opt.id === id)?.text || ''
      );
    }

    const result: QuizResult = {
      questionId: currentQuestion.id,
      questionText: currentQuestion.text,
      userAnswers: userAnswersArray,
      userAnswerTexts,
      correctAnswers: currentQuestion.correctAnswers || [],
      correctAnswerTexts,
      isCorrect,
      isMultipleChoice: currentQuestion.isMultipleChoice,
      options: currentQuestion.options || [],
      explanation: currentQuestion.explanation,
    };

    setUserAnswers((prev) => new Map(prev).set(currentQuestion.id, result));
  };

  const handleExamSubmit = () => {
    // Validate all answers and populate userAnswers Map
    const validatedAnswers = new Map<string, QuizResult>();

    questions.forEach((question) => {
      validatedAnswers.set(
        question.id,
        buildQuizResult(question, selectedAnswers.get(question.id))
      );
    });

    setUserAnswers(validatedAnswers);
    setQuizCompleted(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed
      if (quizMode === 'exam') {
        handleExamSubmit();
      } else {
        setQuizCompleted(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // A/D navigation in all modes; option keys are handled by QuestionCard.
  // Must stay above every early return (hooks rule).
  useKeyboardShortcut((action) => {
    if (action.type === 'prev') {
      handlePrevious();
    } else if (action.type === 'next') {
      if (currentQuestionIndex < questions.length - 1) {
        // Exam mode: save the selection first, like the card's own Next button does
        if (quizMode === 'exam' && liveExamSelection.current.length > 0) {
          const selection = [...liveExamSelection.current];
          const questionId = currentQuestion.id;
          setSelectedAnswers((prev) => new Map(prev).set(questionId, selection));
        }
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    }
  }, questionScreenActive);

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setSelectedAnswers(new Map());
    setQuizCompleted(false);
    setSequentialProgress({}); // in-memory only; storage is kept
    setCompletedOnQuestionId(null);
    setSelectedTopic(null);
    setQuizConfig(null);
    setQuestions([]);
    setQuizStarted(false);
    setQuizMode('training');
    resetTimer();
  };

  const handleTopicSelect = (topic: QuizTopic) => {
    setSelectedTopic(topic);
  };

  const handleQuizStart = (config: QuizConfig) => {
    setQuizConfig(config);
  };

  const handleConfigBack = () => {
    setSelectedTopic(null);
  };

  const allSequentialAnswered =
    isSequential && progressCounts(questions, sequentialProgress).answered === totalQuestions;

  const handleSequentialNext = () => {
    if (allSequentialAnswered) {
      if (currentQuestion.id === completedOnQuestionId) {
        setQuizCompleted(true);
      } else {
        // Reviewing: step forward, wrapping from the last question to the first
        setCurrentQuestionIndex(currentQuestionIndex < totalQuestions - 1 ? currentQuestionIndex + 1 : 0);
      }
    } else if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last index with unanswered questions left: never a dead button
      const firstUnanswered = questions.findIndex((q) => !isAnswered(sequentialProgress, q.id));
      if (firstUnanswered !== -1) setCurrentQuestionIndex(firstUnanswered);
    }
  };

  const handleSequentialReset = () => {
    if (!selectedTopic) return;
    if (window.confirm(`Reset all saved progress for "${selectedTopic.name}"? This cannot be undone.`)) {
      resetProgress(selectedTopic.id);
      setSequentialProgress({});
      setCompletedOnQuestionId(null);
      setResetGeneration((g) => g + 1);
    }
  };

  const generateSummary = (): QuizSummaryType => {
    const results = questions.map((q) => {
      if (isSequential) {
        const saved = sequentialProgress[q.id];
        if (saved) {
          return {
            ...buildQuizResult(q, fromStoredSelection(saved.selection)),
            isCorrect: saved.isCorrect,
          };
        }
      }
      const answer = userAnswers.get(q.id);
      if (answer) {
        return answer;
      }

      // No answer submitted - create default result with answer texts
      const isOrderingQuestion = q.questionType === 'ordering';
      let correctAnswerTexts: string[];

      if (isOrderingQuestion) {
        correctAnswerTexts = q.steps?.map((step) =>
          `Step ${step.stepNumber}: ${step.correctAnswer}`
        ) || [];
      } else {
        correctAnswerTexts = (q.correctAnswers || []).map(
          (id) => q.options?.find((opt) => opt.id === id)?.text || ''
        );
      }

      return {
        questionId: q.id,
        questionText: q.text,
        userAnswers: [],
        userAnswerTexts: [],
        correctAnswers: q.correctAnswers || [],
        correctAnswerTexts,
        isCorrect: false,
        isMultipleChoice: q.isMultipleChoice,
        options: q.options || [],
        explanation: q.explanation,
      };
    });

    const correctAnswers = results.filter((r) => r.isCorrect).length;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const score = (correctAnswers / totalQuestions) * 100;

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      score,
      results,
    };
  };

  // Show topic selection if no topic is selected
  if (!selectedTopic) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="flex-1 py-6 px-4">
          <TopicSelection topics={quizTopics} onTopicSelect={handleTopicSelect} />
        </main>
        <footer className="bg-white py-3 px-4 text-center text-gray-600 text-xs border-t-2 border-gray-200 shadow-inner">
          <p className="m-0 font-medium">Built with React + TypeScript + Vite + Tailwind CSS</p>
        </footer>
      </div>
    );
  }

  // Show configuration screen after topic selection but before quiz starts
  if (selectedTopic && !quizConfig) {
    return (
      <QuizConfiguration
        topic={selectedTopic}
        onStart={handleQuizStart}
        onBack={handleConfigBack}
      />
    );
  }

  // Show loading state while questions are being loaded
  if (isLoading || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-primary py-2 px-6 text-center shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
            Quiz Maker
          </h1>
          <p className="mt-0 text-sm m-0 font-medium text-primary-foreground/90">
            {selectedTopic.name}
          </p>
        </header>
        <main className="flex-1 py-6 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-lg text-muted-foreground">Loading questions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <header className="bg-primary py-2 px-6 text-center shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
            Quiz Maker
          </h1>
          <p className="mt-0 text-sm m-0 font-medium text-primary-foreground/90">
            {selectedTopic.name}
          </p>
        </header>

        <main className="flex-1 py-6 px-4 max-w-6xl w-full mx-auto">
          <QuizSummary summary={generateSummary()} onRestart={handleRestart} elapsedTime={isSequential ? '—' : formattedTime} />
        </main>

        <footer className="bg-white py-3 px-4 text-center text-gray-600 text-xs border-t-2 border-gray-200 shadow-inner">
          <p className="m-0 font-medium">Built with React + TypeScript + Vite + Tailwind CSS</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Question screen: "Question x of y" on the left, title in the middle, Previous/Next on
          the right. On phones the buttons show only their arrows so all three fit in one row. */}
      <header className="bg-primary py-2 px-3 sm:px-6 shadow-xl grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <p className="m-0 justify-self-start text-sm sm:text-lg font-bold text-primary-foreground">
          Question{' '}
          <span className="whitespace-nowrap">
            {currentQuestionIndex + 1} of {totalQuestions}
          </span>
        </p>
        <div className="text-center min-w-0">
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">Quiz Maker</h1>
          <p className="mt-0 text-sm m-0 font-medium text-primary-foreground/90">{selectedTopic.name}</p>
          {!isSequential && (
            <p className="mt-0.5 text-base m-0 font-mono font-bold text-primary-foreground">⏱️ {formattedTime}</p>
          )}
        </div>
        <div className="flex justify-self-end gap-2 sm:gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={HEADER_NAV_BUTTON_CLASSES}
            aria-label="Go to previous question"
          >
            <span aria-hidden="true">←</span>
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentQuestionIndex === totalQuestions - 1}
            className={HEADER_NAV_BUTTON_CLASSES}
            aria-label="Go to next question"
          >
            <span className="hidden sm:inline">Next</span>
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 py-6 px-4 max-w-6xl w-full mx-auto">
        <div className={isSequential ? 'flex flex-col lg:flex-row gap-6 lg:items-start' : undefined}>
        <div className={isSequential ? 'flex-1 min-w-0' : undefined}>
        <QuestionCard
          key={`${currentQuestion.id}:${resetGeneration}`}
          question={currentQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onNext={isSequential ? handleSequentialNext : handleNext}
          isLastQuestion={isSequential ? allSequentialAnswered && currentQuestion.id === completedOnQuestionId : currentQuestionIndex === totalQuestions - 1}
          mode={quizMode}
          onSelectionChange={handleExamSelectionChange}
          previousSelection={selectedAnswers.get(currentQuestion.id)}
          lockedSelection={
            isSequential && isAnswered(sequentialProgress, currentQuestion.id)
              ? fromStoredSelection(sequentialProgress[currentQuestion.id].selection)
              : undefined
          }
        />
        </div>
        {isSequential && (
          <aside className="lg:sticky lg:top-4 lg:w-64 lg:shrink-0 lg:self-start">
            <QuestionNavigator
              questions={questions}
              currentIndex={currentQuestionIndex}
              progress={sequentialProgress}
              onJump={setCurrentQuestionIndex}
              onReset={handleSequentialReset}
              onViewResults={() => setQuizCompleted(true)}
            />
          </aside>
        )}
        </div>
      </main>
    </div>
  );
}

export default App;
