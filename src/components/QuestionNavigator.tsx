import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Question } from '@/types/quiz';
import {
  progressCounts,
  squareStatus,
  type SequentialProgress,
  type SquareStatus,
} from '@/lib/sequentialProgress';

interface QuestionNavigatorProps {
  questions: Question[];
  currentIndex: number;
  progress: SequentialProgress;
  onJump: (index: number) => void;
  onReset: () => void; // caller handles the confirm prompt
  onViewResults: () => void; // button only rendered when every question is answered
}

const TOP_OFFSET_PX = 16; // sticky top-4 offset
const BOTTOM_MARGIN_PX = TOP_OFFSET_PX + 64; // also clears the fixed theme button (bottom-4, ~40px)
const MIN_CARD_HEIGHT_PX = 240; // keep header, a few rows and the buttons usable in tiny windows

const STATUS_CLASSES: Record<SquareStatus, string> = {
  unanswered: 'bg-card text-foreground border-border hover:bg-muted',
  correct: 'bg-correct text-white dark:text-background border-correct',
  wrong: 'bg-incorrect text-white dark:text-background border-incorrect',
};

export default function QuestionNavigator({
  questions,
  currentIndex,
  progress,
  onJump,
  onReset,
  onViewResults,
}: QuestionNavigatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { total, answered, correct, wrong } = progressCounts(questions, progress);
  const showViewResults = total > 0 && answered === total;

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
  }, [currentIndex, isOpen]);

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
  }, []);

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

      <Card
        ref={cardRef}
        id="question-navigator-panel"
        className={`mt-2 lg:mt-0 lg:flex lg:flex-col ${isOpen ? 'block' : 'hidden'}`}
      >
        <CardHeader className="shrink-0 pb-3">
          <CardTitle className="text-base">Questions</CardTitle>
          <p className="text-sm text-muted-foreground">
            {answered} / {total} answered · {correct} ✓ · {wrong} ✗
          </p>
        </CardHeader>
        {/* On large screens the card is capped to the window (see the effect above): header and
            buttons keep their size and the grid takes the rest, scrolling only when needed. */}
        <CardContent className="flex min-h-0 flex-col gap-4 lg:flex-auto">
          <div
            ref={gridRef}
            className="grid max-h-[60vh] min-h-0 grid-cols-5 content-start gap-2 overflow-y-auto p-1 lg:max-h-none lg:flex-auto"
          >
            {questions.map((q, index) => {
              const status = squareStatus(progress, q.id);
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-label={`Question ${index + 1}, ${status}`}
                  aria-current={isCurrent ? 'true' : undefined}
                  onClick={() => onJump(index)}
                  className={`flex aspect-square items-center justify-center rounded-md border text-sm font-medium transition-colors ${
                    STATUS_CLASSES[status]
                  } ${isCurrent ? 'ring-2 ring-selected ring-offset-1 ring-offset-background' : ''}`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {showViewResults && (
            <Button type="button" className="w-full shrink-0" onClick={onViewResults}>
              View results
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 border-incorrect text-incorrect-foreground hover:bg-incorrect-light hover:text-incorrect-foreground"
            onClick={onReset}
          >
            Reset progress
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
