import { useState } from 'react';
import type { MatchingScenario } from '../types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface MatchingQuestionProps {
  scenarios: MatchingScenario[];
  matchingOptions: string[];
  onSubmit: (selectedAnswers: Map<number, string>, isCorrect: boolean) => void;
  disabled?: boolean;
}

export default function MatchingQuestion({
  scenarios,
  matchingOptions,
  onSubmit,
  disabled = false
}: MatchingQuestionProps) {
  const [selectedAnswers, setSelectedAnswers] = useState<Map<number, string>>(new Map());
  const [submitted, setSubmitted] = useState(false);

  const handleScenarioChange = (scenarioId: number, value: string) => {
    if (submitted) return;

    setSelectedAnswers((prev) => {
      const newMap = new Map(prev);
      if (value === '') {
        newMap.delete(scenarioId);
      } else {
        newMap.set(scenarioId, value);
      }
      return newMap;
    });
  };

  const handleSubmit = () => {
    if (selectedAnswers.size !== scenarios.length) return;

    // Check if all answers are correct
    const isCorrect = scenarios.every((scenario) => {
      const selected = selectedAnswers.get(scenario.id);
      return selected === scenario.correctAnswer;
    });

    setSubmitted(true);
    onSubmit(selectedAnswers, isCorrect);
  };

  const isScenarioCorrect = (scenarioId: number): boolean | null => {
    if (!submitted) return null;
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario) return null;
    return selectedAnswers.get(scenarioId) === scenario.correctAnswer;
  };

  const allScenariosSelected = selectedAnswers.size === scenarios.length;
  const progress = (selectedAnswers.size / scenarios.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {!submitted && selectedAnswers.size > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center mt-2">
            {selectedAnswers.size} of {scenarios.length} scenarios completed
          </p>
        </div>
      )}

      {/* Scenarios */}
      <div className="space-y-4">
        {scenarios.map((scenario) => {
          const selected = selectedAnswers.get(scenario.id) || '';
          const correctness = isScenarioCorrect(scenario.id);

          return (
            <Card
              key={scenario.id}
              className={`transition-all duration-300 ${
                correctness === true
                  ? 'border-green-500 bg-green-50'
                  : correctness === false
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-sm text-foreground">{scenario.text}</p>

                  <div className="flex items-center gap-4">
                    <select
                      value={selected}
                      onChange={(e) => handleScenarioChange(scenario.id, e.target.value)}
                      disabled={submitted || disabled}
                      className={`flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                        submitted
                          ? correctness === true
                            ? 'border-green-500 bg-green-50'
                            : 'border-red-500 bg-red-50'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${submitted || disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      aria-label={`Select option for scenario ${scenario.id}`}
                    >
                      <option value="">Select...</option>
                      {matchingOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    {/* Status indicator */}
                    {submitted && (
                      <div className="min-w-[24px]">
                        {correctness === true ? (
                          <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Show correct answer if wrong */}
                  {submitted && correctness === false && (
                    <div className="text-sm text-green-700 font-medium">
                      Correct answer: {scenario.correctAnswer}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 pt-2">
        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={!allScenariosSelected || disabled}
            className="flex-1 sm:flex-none"
          >
            {allScenariosSelected ? 'Check Answer →' : 'Complete all scenarios'}
          </Button>
        )}
      </div>
    </div>
  );
}
