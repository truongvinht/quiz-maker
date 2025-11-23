import { useState } from 'react';
import type { Question } from '../types/quiz';
import AnswerOption from './AnswerOption';
import ResultPanel from './ResultPanel';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit?: (selectedOptions: string[], isCorrect: boolean) => void;
  onNext?: () => void;
  isLastQuestion?: boolean;
}

export default function QuestionCard({
  question,
  onAnswerSubmit,
  onNext,
  isLastQuestion = false
}: QuestionCardProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    if (submitted) return;

    if (question.isMultipleChoice) {
      // Multiple choice: toggle selection
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      // Single choice: replace selection
      setSelectedOptions([optionId]);
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length === 0) return;
    setSubmitted(true);

    // Calculate if answer is correct
    const correct =
      selectedOptions.length === question.correctAnswers.length &&
      selectedOptions.every((id) => question.correctAnswers.includes(id));

    // Notify parent component
    if (onAnswerSubmit) {
      onAnswerSubmit(selectedOptions, correct);
    }
  };

  const handleReset = () => {
    setSelectedOptions([]);
    setSubmitted(false);
  };

  const isCorrect =
    submitted &&
    selectedOptions.length === question.correctAnswers.length &&
    selectedOptions.every((id) => question.correctAnswers.includes(id));

  const getCorrectAnswerTexts = () => {
    return question.options
      .filter((opt) => question.correctAnswers.includes(opt.id))
      .map((opt) => opt.text);
  };

  const selectionProgress = (selectedOptions.length / question.options.length) * 100;

  return (
    <Card className="max-w-4xl mx-auto transition-all duration-500 hover:shadow-2xl">
      <CardHeader className="space-y-6">
        {/* Progress bar */}
        {!submitted && selectedOptions.length > 0 && (
          <div className="space-y-2">
            <Progress value={selectionProgress} className="h-1.5" />
            <p className="text-sm text-muted-foreground text-center">
              {selectedOptions.length} of {question.options.length} option{question.options.length > 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Question type badge */}
        <div>
          <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {question.isMultipleChoice ? 'Select all that apply' : 'Select one answer'}
          </Badge>
        </div>

        {/* Question text */}
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
          {question.text}
        </h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            const isCorrectOption = question.correctAnswers.includes(option.id);

            return (
              <AnswerOption
                key={option.id}
                option={option}
                isSelected={isSelected}
                isCorrect={submitted ? isCorrectOption : null}
                isMultipleChoice={question.isMultipleChoice}
                disabled={submitted}
                onSelect={handleOptionSelect}
              />
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          {!submitted ? (
            <Button
              size="default"
              className="flex-1 sm:flex-none h-9 hover:shadow-xl transition-all"
              onClick={handleSubmit}
              disabled={selectedOptions.length === 0}
              aria-label="Submit your answer"
            >
              {selectedOptions.length === 0 ? 'Select an answer' : 'Check Answer →'}
            </Button>
          ) : (
            onNext && (
              <Button
                size="default"
                className="flex-1 sm:flex-none h-9 transition-all hover:scale-105"
                onClick={onNext}
                aria-label={isLastQuestion ? "View Results" : "Next Question"}
              >
                {isLastQuestion ? '📊 View Results' : 'Next Question →'}
              </Button>
            )
          )}
        </div>

        {/* Result panel */}
        {submitted && (
          <ResultPanel
            isCorrect={isCorrect}
            explanation={question.explanation}
            correctAnswers={getCorrectAnswerTexts()}
          />
        )}
      </CardContent>
    </Card>
  );
}
