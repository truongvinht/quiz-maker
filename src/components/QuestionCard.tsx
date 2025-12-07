import { useState } from 'react';
import type { Question } from '../types/quiz';
import AnswerOption from './AnswerOption';
import ResultPanel from './ResultPanel';
import OrderingQuestion from './OrderingQuestion';
import MatchingQuestion from './MatchingQuestion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface QuestionCardProps {
  question: Question;
  onAnswerSubmit?: (selectedOptions: string[] | Map<number, string>, isCorrect: boolean) => void;
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

  const isOrderingQuestion = question.questionType === 'ordering';
  const isMatchingQuestion = question.questionType === 'matching';

  // Handle ordering question submission
  const handleOrderingSubmit = (selectedAnswers: Map<number, string>, isCorrect: boolean) => {
    setSubmitted(true);
    if (onAnswerSubmit) {
      onAnswerSubmit(selectedAnswers, isCorrect);
    }
  };

  // Handle matching question submission
  const handleMatchingSubmit = (selectedAnswers: Map<number, string>, isCorrect: boolean) => {
    setSubmitted(true);
    if (onAnswerSubmit) {
      onAnswerSubmit(selectedAnswers, isCorrect);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (submitted || isOrderingQuestion || isMatchingQuestion) return;

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
    if (selectedOptions.length === 0 || isOrderingQuestion || isMatchingQuestion) return;
    setSubmitted(true);

    // Calculate if answer is correct (for standard questions)
    const correct =
      selectedOptions.length === (question.correctAnswers?.length || 0) &&
      selectedOptions.every((id) => question.correctAnswers?.includes(id));

    // Notify parent component
    if (onAnswerSubmit) {
      onAnswerSubmit(selectedOptions, correct);
    }
  };


  const isCorrect =
    submitted &&
    !isOrderingQuestion &&
    !isMatchingQuestion &&
    selectedOptions.length === (question.correctAnswers?.length || 0) &&
    selectedOptions.every((id) => question.correctAnswers?.includes(id));

  const getCorrectAnswerTexts = () => {
    if (isOrderingQuestion) {
      // For ordering questions, show the correct sequence
      return question.steps?.map((step) => `Step ${step.stepNumber}: ${step.correctAnswer}`) || [];
    }
    if (isMatchingQuestion) {
      // For matching questions, show the correct matches
      return question.scenarios?.map((scenario) => `Scenario ${scenario.id}: ${scenario.correctAnswer}`) || [];
    }
    return question.options
      ?.filter((opt) => question.correctAnswers?.includes(opt.id))
      .map((opt) => opt.text) || [];
  };

  const selectionProgress = !isOrderingQuestion && !isMatchingQuestion
    ? (selectedOptions.length / (question.options?.length || 1)) * 100
    : 0;

  return (
    <Card className="max-w-4xl mx-auto transition-all duration-500 hover:shadow-2xl">
      <CardHeader className="space-y-6">
        {/* Progress bar */}
        {!submitted && !isOrderingQuestion && !isMatchingQuestion && selectedOptions.length > 0 && (
          <div className="space-y-2">
            <Progress value={selectionProgress} className="h-1.5" />
            <p className="text-sm text-muted-foreground text-center">
              {selectedOptions.length} of {question.options?.length || 0} option{(question.options?.length || 0) > 1 ? 's' : ''} selected
            </p>
          </div>
        )}

        {/* Question type badge */}
        {!isOrderingQuestion && !isMatchingQuestion && (
          <div>
            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {question.isMultipleChoice ? 'Select all that apply' : 'Select one answer'}
            </Badge>
          </div>
        )}
        {isMatchingQuestion && (
          <div>
            <Badge className="bg-orange-500 text-white hover:bg-orange-600">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0v-.5A1.5 1.5 0 0114.5 6c.526 0 .988-.27 1.256-.679a6.012 6.012 0 011.912 2.706A6.015 6.015 0 0119 10a6.015 6.015 0 01-1.44 1.973 6.012 6.012 0 01-1.912 2.706A1.5 1.5 0 0114.5 14 1.5 1.5 0 0113 12.5V12a2 2 0 00-4 0v.5a1.5 1.5 0 01-1.5 1.5c-.526 0-.988.27-1.256.679a6.012 6.012 0 01-1.912-2.706A6.015 6.015 0 011 10c0-.66.09-1.299.332-1.973z" clipRule="evenodd" />
              </svg>
              HOTSPOT - Match each scenario
            </Badge>
          </div>
        )}

        {/* Question text */}
        <h2 className="text-lg md:text-xl font-bold text-foreground leading-relaxed">
          {question.text}
        </h2>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Conditional rendering based on question type */}
        {isOrderingQuestion && question.steps ? (
          <>
            {/* Ordering Question */}
            <OrderingQuestion
              steps={question.steps}
              onSubmit={handleOrderingSubmit}
              disabled={submitted}
            />

            {/* Next button for ordering questions */}
            {submitted && onNext && (
              <div className="flex gap-3 pt-2">
                <Button
                  size="default"
                  className="flex-1 sm:flex-none h-9 transition-all hover:scale-105"
                  onClick={onNext}
                  aria-label={isLastQuestion ? "View Results" : "Next Question"}
                >
                  {isLastQuestion ? '📊 View Results' : 'Next Question →'}
                </Button>
              </div>
            )}

            {/* Result panel for ordering questions */}
            {submitted && (
              <ResultPanel
                isCorrect={true} // Correctness is shown per-step in OrderingQuestion
                explanation={question.explanation}
                correctAnswers={getCorrectAnswerTexts()}
              />
            )}
          </>
        ) : isMatchingQuestion && question.scenarios && question.matchingOptions ? (
          <>
            {/* Matching Question */}
            <MatchingQuestion
              scenarios={question.scenarios}
              matchingOptions={question.matchingOptions}
              onSubmit={handleMatchingSubmit}
              disabled={submitted}
            />

            {/* Next button for matching questions */}
            {submitted && onNext && (
              <div className="flex gap-3 pt-2">
                <Button
                  size="default"
                  className="flex-1 sm:flex-none h-9 transition-all hover:scale-105"
                  onClick={onNext}
                  aria-label={isLastQuestion ? "View Results" : "Next Question"}
                >
                  {isLastQuestion ? '📊 View Results' : 'Next Question →'}
                </Button>
              </div>
            )}

            {/* Result panel for matching questions */}
            {submitted && (
              <ResultPanel
                isCorrect={true} // Correctness is shown per-scenario in MatchingQuestion
                explanation={question.explanation}
                correctAnswers={getCorrectAnswerTexts()}
              />
            )}
          </>
        ) : (
          <>
            {/* Standard Multiple Choice Question */}
            <div className="space-y-3">
              {question.options?.map((option) => {
                const isSelected = selectedOptions.includes(option.id);
                const isCorrectOption = question.correctAnswers?.includes(option.id) || false;

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
          </>
        )}
      </CardContent>
    </Card>
  );
}
