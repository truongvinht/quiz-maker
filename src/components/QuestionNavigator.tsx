import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Question } from '@/types/quiz';

export type SquareTone = 'unanswered' | 'answered' | 'correct' | 'wrong';

export interface NavigatorSquare {
  tone: SquareTone;
  flagged?: boolean;
  label: string; // aria-label of the square
}

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  getSquare: (question: Question, index: number) => NavigatorSquare;
  summary: string;
  actions: ReactNode; // buttons under the grid
  onJump: (index: number) => void;
  minimized?: boolean; // large screens only; omit = not minimisable
  onToggleMinimized?: () => void;
}

const BOTTOM_MARGIN_PX = 16; // gap kept below the card (the sticky top offset is lg:top-16 in App.tsx)
const MIN_CARD_HEIGHT_PX = 240; // keep header, a few rows and the buttons usable in tiny windows

const STATUS_CLASSES: Record<SquareTone, string> = {
  unanswered: 'bg-card text-foreground border-border hover:bg-muted',
  answered: 'bg-muted-foreground text-background border-muted-foreground',
  correct: 'bg-correct text-white dark:text-background border-correct',
  wrong: 'bg-incorrect text-white dark:text-background border-incorrect',
};

export default function QuestionNavigator({
  questions,
  currentIndex,
  getSquare,
  summary,
  actions,
  onJump,
  minimized = false,
  onToggleMinimized,
}: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Keep the current square visible inside the grid. Only the grid's own scrollTop is
  // set (scrollIntoView could also scroll the window), so the page never jumps.
  useEffect(() => {
    const grid = gridRef.current;
    const square = grid?.querySelector<HTMLElement>('[aria-current="true"]');
    if (!grid || !square || grid.clientHeight === 0) return; // hidden panel: nothing to measure
    const gridRect = grid.getBoundingClientRect();
    const squareRect = square.getBoundingClientRect();
    const top = squareRect.top - gridRect.top + grid.scrollTop;
    const bottom = top + squareRect.height;
    if (top < grid.scrollTop) {
      grid.scrollTop = top;
    } else if (bottom > grid.scrollTop + grid.clientHeight) {
      grid.scrollTop = bottom - grid.clientHeight;
    }
  }, [currentIndex, isOpen, minimized]);

  // Large screens: cap the card at the space between its top edge and the bottom of the
  // window, so it fills the window without being cut off before it sticks. The page scrolls
  // inside <body> (see index.css), so scroll events are caught in the capture phase.
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const largeScreen = window.matchMedia('(min-width: 1024px)');
    let frame = 0;
    const fit = () => {
      frame = 0;
      if (!largeScreen.matches) {
        card.style.maxHeight = '';
        return;
      }
      const room = window.innerHeight - card.getBoundingClientRect().top - BOTTOM_MARGIN_PX;
      card.style.maxHeight = `${Math.max(room, MIN_CARD_HEIGHT_PX)}px`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(fit);
    };
    fit();
    window.addEventListener('scroll', schedule, true);
    window.addEventListener('resize', schedule);
    largeScreen.addEventListener('change', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
      largeScreen.removeEventListener('change', schedule);
    };
  }, [minimized]); // re-fit when the grid is shown again

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        className="w-full lg:hidden"
        aria-expanded={isOpen}
        aria-controls="question-navigator-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        Questions ▾
      </Button>

      {onToggleMinimized && minimized && (
        <Button
          type="button"
          variant="outline"
          className="hidden w-full lg:flex"
          aria-label="Show question grid"
          aria-expanded={false}
          aria-controls="question-navigator-panel"
          onClick={onToggleMinimized}
        >
          Questions ▸
        </Button>
      )}

      <Card
        ref={cardRef}
        id="question-navigator-panel"
        className={`mt-2 lg:mt-0 ${minimized ? 'lg:hidden' : 'lg:flex lg:flex-col'} ${
          isOpen ? 'block' : 'hidden'
        }`}
      >
        <CardHeader className="shrink-0 pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Questions</CardTitle>
            {onToggleMinimized && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="hidden h-6 px-2 lg:inline-flex"
                aria-label="Minimize question grid"
                onClick={onToggleMinimized}
              >
                –
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </CardHeader>
        {/* On large screens the card is capped to the window (see the effect above): header and
            buttons keep their size and the grid takes the rest, scrolling only when needed. */}
        <CardContent className="flex min-h-0 flex-col gap-4 lg:flex-auto">
          <div
            ref={gridRef}
            className="grid max-h-[60vh] min-h-0 grid-cols-5 content-start gap-2 overflow-y-auto p-1 lg:max-h-none lg:flex-auto"
          >
            {questions.map((q, index) => {
              const square = getSquare(q, index);
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-label={square.label}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => onJump(index)}
                  className={`relative flex aspect-square items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    STATUS_CLASSES[square.tone]
                  } ${isCurrent ? 'ring-2 ring-selected ring-offset-1 ring-offset-background' : ''}`}
                >
                  {index + 1}
                  {square.flagged && (
                    <span aria-hidden="true" className="absolute right-0.5 top-0 text-[10px] leading-none">
                      ⚑
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {actions}
        </CardContent>
      </Card>
    </div>
  );
}
