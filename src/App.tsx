import { useState } from 'react';
import QuestionCard from './components/QuestionCard';
import { sampleQuestions } from './data/sampleQuestions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function App() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const totalQuestions = sampleQuestions.length;

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-primary py-4 px-6 text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">Quiz Maker</h1>
        <p className="mt-1 text-sm m-0 font-medium text-primary-foreground/90">Practice Multiple Choice Questions</p>
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

        <QuestionCard key={currentQuestion.id} question={currentQuestion} />
      </main>

      <footer className="bg-white py-3 px-4 text-center text-gray-600 text-xs border-t-2 border-gray-200 shadow-inner">
        <p className="m-0 font-medium">Built with React + TypeScript + Vite + Tailwind CSS</p>
      </footer>
    </div>
  );
}

export default App;
