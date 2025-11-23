import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ResultPanelProps {
  isCorrect: boolean;
  explanation: string;
  correctAnswers: string[];
}

export default function ResultPanel({ isCorrect, explanation, correctAnswers }: ResultPanelProps) {
  return (
    <Card
      className={`mt-8 border-l-8 shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700 ${
        isCorrect
          ? 'bg-linear-to-br from-correct-light to-green-50 border-correct'
          : 'bg-linear-to-br from-incorrect-light to-red-50 border-incorrect'
      }`}
      role="alert"
      aria-live="polite"
    >
      <CardHeader>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center justify-center w-14 h-14 rounded-full shadow-md ${
              isCorrect ? 'bg-green-600' : 'bg-red-600'
            } animate-in zoom-in duration-500`}
          >
            <span className="text-3xl font-bold text-white">
              {isCorrect ? '✓' : '✗'}
            </span>
          </div>
          <CardTitle className="text-2xl md:text-3xl">
            {isCorrect ? '🎉 Correct!' : '📚 Incorrect'}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <Card className={`p-4 border-2 ${
          isCorrect ? 'bg-background border-correct' : 'bg-background border-incorrect'
        }`}>
          <p className="m-0 text-lg font-semibold">
            Correct answer{correctAnswers.length > 1 ? 's' : ''}:{' '}
            <span className={`${isCorrect ? 'text-correct' : 'text-incorrect'} font-bold text-xl`}>
              {correctAnswers.join(', ')}
            </span>
          </p>
        </Card>

        <Card className="bg-background/80 backdrop-blur-sm border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Explanation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="m-0 leading-relaxed text-muted-foreground">{explanation}</p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
