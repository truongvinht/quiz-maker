import { useState } from 'react';
import type { QuizSummary as QuizSummaryType } from '../types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface QuizSummaryProps {
  summary: QuizSummaryType;
  onRestart: () => void;
}

export default function QuizSummary({ summary, onRestart }: QuizSummaryProps) {
  const { correctAnswers, incorrectAnswers, score, results } = summary;
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getScoreColor = () => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = () => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getPerformanceMessage = () => {
    if (score === 100) return '🎉 Perfect Score! Outstanding!';
    if (score >= 80) return '🌟 Excellent Work!';
    if (score >= 60) return '👍 Good Job!';
    return '📚 Keep Practicing!';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Score Card */}
      <Card className={`border-4 ${getScoreBgColor()} animate-in fade-in duration-700`}>
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-extrabold mb-4">
            Quiz Complete!
          </CardTitle>
          <div className="space-y-4">
            <div>
              <p className="text-6xl md:text-7xl font-extrabold mb-2">
                <span className={getScoreColor()}>{Math.round(score)}%</span>
              </p>
              <p className="text-2xl font-semibold text-muted-foreground">
                {getPerformanceMessage()}
              </p>
            </div>
            <div className="flex justify-center gap-6 text-lg">
              <div className="flex items-center gap-2">
                <span className="text-green-600 font-bold text-2xl">✓</span>
                <span className="font-semibold">{correctAnswers} Correct</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-600 font-bold text-2xl">✗</span>
                <span className="font-semibold">{incorrectAnswers} Incorrect</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-center">
          <Button
            size="lg"
            onClick={onRestart}
            className="hover:scale-105 transition-all"
          >
            🔄 Start New Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Question Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((result, index) => (
            <Card
              key={result.questionId}
              className={`border-l-4 ${
                result.isCorrect
                  ? 'border-l-green-500 bg-green-50/50'
                  : 'border-l-red-500 bg-red-50/50'
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="secondary" className="text-sm">
                        Question {index + 1}
                      </Badge>
                      {result.isMultipleChoice && (
                        <Badge variant="outline" className="text-xs">
                          Multiple Choice
                        </Badge>
                      )}
                    </div>
                    <p className="text-base font-medium text-foreground">
                      {result.questionText}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestion(result.questionId)}
                      className="shrink-0"
                      aria-label={expandedQuestions.has(result.questionId) ? "Hide details" : "Show details"}
                    >
                      {expandedQuestions.has(result.questionId) ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </Button>
                    <div
                      className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        result.isCorrect ? 'bg-green-600' : 'bg-red-600'
                      }`}
                    >
                      <span className="text-2xl font-bold text-white">
                        {result.isCorrect ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              {expandedQuestions.has(result.questionId) && (
                <CardContent className="space-y-4">
                  {result.isCorrect ? (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        Your answer:
                      </p>
                      {result.userAnswerTexts.length > 0 ? (
                        <div className="space-y-1">
                          {result.userAnswerTexts.map((answerText, idx) => (
                            <p
                              key={idx}
                              className="text-sm pl-4 border-l-4 py-1 border-l-green-500 bg-green-50 text-green-900"
                            >
                              {answerText}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No answer provided</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-2">
                        Answer options:
                      </p>
                      <div className="space-y-2">
                        {result.options.map((option) => {
                          const isUserAnswer = result.userAnswers.includes(option.id);
                          const isCorrectAnswer = result.correctAnswers.includes(option.id);

                          let className = 'text-sm pl-4 border-l-4 py-2 rounded';
                          if (isCorrectAnswer) {
                            className += ' border-l-green-500 bg-green-50 text-green-900 font-semibold';
                          } else if (isUserAnswer) {
                            className += ' border-l-red-500 bg-red-50 text-red-900';
                          } else {
                            className += ' border-l-gray-300 bg-gray-50 text-gray-700';
                          }

                          return (
                            <div key={option.id} className={className}>
                              {option.text}
                              {isCorrectAnswer && <span className="ml-2 text-green-700">✓ Correct</span>}
                              {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-red-700">✗ Your answer</span>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Explanation section */}
                  <div className="pt-2 border-t">
                    <p className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Explanation:
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {result.explanation}
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
