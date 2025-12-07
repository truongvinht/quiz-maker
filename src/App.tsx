import { useState, useEffect } from 'react';
import QuestionCard from './components/QuestionCard';
import QuizSummary from './components/QuizSummary';
import TopicSelection from './components/TopicSelection';
import QuizConfiguration, { type QuizConfig } from './components/QuizConfiguration';
import { loadRandomizedQuiz } from './services/questionService';
import { quizTopics } from './data/topics';
import { useTimer } from './hooks/useTimer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizResult, QuizSummary as QuizSummaryType, Question, QuizTopic } from './types/quiz';

function App() {
  const [selectedTopic, setSelectedTopic] = useState<QuizTopic | null>(null);
  const [quizConfig, setQuizConfig] = useState<QuizConfig | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, QuizResult>>(new Map());
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const { formattedTime, reset: resetTimer } = useTimer(quizStarted && !quizCompleted);

  // Load questions when quiz configuration is complete
  useEffect(() => {
    if (selectedTopic && quizConfig) {
      setIsLoading(true);
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
  }, [selectedTopic, quizConfig]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleAnswerSubmit = (selectedOptions: string[] | Map<number, string>, isCorrect: boolean) => {
    const isOrderingQuestion = currentQuestion.questionType === 'ordering';

    let userAnswerTexts: string[];
    let correctAnswerTexts: string[];
    let userAnswersArray: string[];

    if (isOrderingQuestion) {
      // Handle ordering question
      const answerMap = selectedOptions as Map<number, string>;
      userAnswersArray = Array.from(answerMap.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([_, value]) => value);

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

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Quiz completed - show summary
      setQuizCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers(new Map());
    setQuizCompleted(false);
    setSelectedTopic(null);
    setQuizConfig(null);
    setQuestions([]);
    setQuizStarted(false);
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

  const generateSummary = (): QuizSummaryType => {
    const results = questions.map((q) => {
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
        <header className="bg-primary py-4 px-6 text-center shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
            Quiz Maker
          </h1>
          <p className="mt-1 text-sm m-0 font-medium text-primary-foreground/90">
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
        <header className="bg-primary py-4 px-6 text-center shadow-xl">
          <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
            Quiz Maker
          </h1>
          <p className="mt-1 text-sm m-0 font-medium text-primary-foreground/90">
            {selectedTopic.name}
          </p>
        </header>

        <main className="flex-1 py-6 px-4 max-w-6xl w-full mx-auto">
          <QuizSummary summary={generateSummary()} onRestart={handleRestart} elapsedTime={formattedTime} />
        </main>

        <footer className="bg-white py-3 px-4 text-center text-gray-600 text-xs border-t-2 border-gray-200 shadow-inner">
          <p className="m-0 font-medium">Built with React + TypeScript + Vite + Tailwind CSS</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-primary py-4 px-6 text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">Quiz Maker</h1>
        <p className="mt-1 text-sm m-0 font-medium text-primary-foreground/90">{selectedTopic.name}</p>
        <p className="mt-2 text-lg m-0 font-mono font-bold text-primary-foreground">⏱️ {formattedTime}</p>
      </header>

      <main className="flex-1 py-6 px-4 max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mb-6 gap-4">
          <Badge variant="secondary" className="text-xl font-bold px-5 py-3 shadow-sm">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Badge>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 sm:flex-none transition-all hover:scale-105"
              aria-label="Go to previous question"
            >
              ← Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className="flex-1 sm:flex-none transition-all hover:scale-105"
              aria-label="Go to next question"
            >
              Next →
            </Button>
          </div>
        </div>

        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onAnswerSubmit={handleAnswerSubmit}
          onNext={handleNext}
          isLastQuestion={currentQuestionIndex === totalQuestions - 1}
        />
      </main>
    </div>
  );
}

export default App;
