import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { QuizTopic } from '../types/quiz';

interface QuizConfigurationProps {
  topic: QuizTopic;
  onStart: (config: QuizConfig) => void;
  onBack: () => void;
}

export interface QuizConfig {
  startQuestion: number;
  questionCount: number;
}

export default function QuizConfiguration({ topic, onStart, onBack }: QuizConfigurationProps) {
  const [startQuestion, setStartQuestion] = useState(1);
  const [questionCount, setQuestionCount] = useState(Math.min(30, topic.questionCount));

  const maxQuestions = topic.questionCount - startQuestion + 1;
  const endQuestion = startQuestion + questionCount - 1;

  const handleStartQuestionChange = (value: string) => {
    const num = parseInt(value) || 1;
    const clamped = Math.max(1, Math.min(num, topic.questionCount));
    setStartQuestion(clamped);

    // Adjust question count if it exceeds available questions
    const available = topic.questionCount - clamped + 1;
    if (questionCount > available) {
      setQuestionCount(available);
    }
  };

  const handleQuestionCountChange = (value: string) => {
    const num = parseInt(value) || 1;
    const available = topic.questionCount - startQuestion + 1;
    const clamped = Math.max(1, Math.min(num, available));
    setQuestionCount(clamped);
  };

  const handleStart = () => {
    onStart({
      startQuestion,
      questionCount,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-primary py-4 px-6 text-center shadow-xl">
        <h1 className="text-2xl md:text-3xl font-extrabold m-0 tracking-tight text-primary-foreground">
          Quiz Configuration
        </h1>
        <p className="mt-1 text-sm m-0 font-medium text-primary-foreground/90">
          {topic.icon} {topic.name}
        </p>
      </header>

      <main className="flex-1 py-6 px-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
              Configure Your Quiz
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Choose how many questions to practice and where to start
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            {/* Total Available Questions */}
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Total Available Questions</p>
              <Badge variant="secondary" className="text-2xl font-bold px-4 py-2">
                {topic.questionCount}
              </Badge>
            </div>

            {/* Start Question Input */}
            <div className="space-y-2">
              <label htmlFor="startQuestion" className="block text-sm font-medium text-foreground">
                Start from Question #
              </label>
              <input
                id="startQuestion"
                type="number"
                min="1"
                max={topic.questionCount}
                value={startQuestion}
                onChange={(e) => handleStartQuestionChange(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Enter a number between 1 and {topic.questionCount}
              </p>
            </div>

            {/* Question Count Input */}
            <div className="space-y-2">
              <label htmlFor="questionCount" className="block text-sm font-medium text-foreground">
                Number of Questions
              </label>
              <input
                id="questionCount"
                type="number"
                min="1"
                max={maxQuestions}
                value={questionCount}
                onChange={(e) => handleQuestionCountChange(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              <p className="text-xs text-muted-foreground">
                Maximum {maxQuestions} questions available from question #{startQuestion}
              </p>
            </div>

            {/* Quiz Range Preview */}
            <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
              <p className="text-sm font-medium text-foreground mb-2">Quiz Range:</p>
              <div className="flex items-center justify-center gap-3">
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  Q{startQuestion}
                </Badge>
                <span className="text-muted-foreground font-bold">→</span>
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  Q{endQuestion}
                </Badge>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-2">
                ({questionCount} question{questionCount !== 1 ? 's' : ''})
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onBack}
                className="flex-1 text-base py-6 hover:bg-muted"
              >
                ← Back
              </Button>
              <Button
                onClick={handleStart}
                className="flex-1 text-base py-6 font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all border-2 border-primary-foreground/20"
              >
                Start Quiz →
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white py-3 px-4 text-center text-gray-600 text-xs border-t-2 border-gray-200 shadow-inner">
        <p className="m-0 font-medium">Built with React + TypeScript + Vite + Tailwind CSS</p>
      </footer>
    </div>
  );
}
