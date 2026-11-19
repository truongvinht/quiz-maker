import type { QuizOption } from '../types/quiz';

interface AnswerOptionProps {
  option: QuizOption;
  isSelected: boolean;
  isCorrect: boolean | null; // null = not submitted yet
  isMultipleChoice: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
  /** Exam mode: option is struck out (visual aid only). */
  struck?: boolean;
  onToggleStrike?: (optionId: string) => void;
}

export default function AnswerOption({
  option,
  isSelected,
  isCorrect,
  isMultipleChoice,
  disabled,
  onSelect,
  struck = false,
  onToggleStrike,
}: AnswerOptionProps) {
  const getClassName = () => {
    let className = 'flex items-start p-5 my-3 border-2 rounded-xl transition-all duration-300 ease-in-out';

    // Base state with shadow
    className += ' border-border bg-card shadow-sm';

    // Selected state (before submission)
    if (isSelected && !disabled) {
      className += ' border-selected bg-selected-light shadow-md ring-2 ring-selected ring-opacity-20';
    }

    // After submission states
    if (disabled && isCorrect !== null) {
      if (isCorrect) {
        // This is a correct answer - always show green
        className += ' border-correct bg-correct-light shadow-md ring-2 ring-correct/30';
      } else if (isSelected) {
        // This was selected but is incorrect - show red
        className += ' border-incorrect bg-incorrect-light shadow-md ring-2 ring-incorrect/30';
      }
    }

    // Cursor states
    if (!disabled) {
      className += ' cursor-pointer';
    } else {
      className += ' cursor-not-allowed opacity-90';
    }

    return className;
  };

  // A selected option is never shown struck
  const showStruck = struck && !isSelected;

  return (
    <div
      className={getClassName()}
      onClick={() => !disabled && onSelect(option.id)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(option.id);
        }
      }}
      aria-label={`Option ${option.label}: ${option.text}`}
      aria-checked={isSelected}
      aria-disabled={disabled}
    >
      <input
        type={isMultipleChoice ? 'checkbox' : 'radio'}
        checked={isSelected}
        disabled={disabled}
        readOnly
        tabIndex={-1}
        className="mr-4 mt-1 w-5 h-5 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed accent-selected"
        aria-hidden="true"
      />
      <label className="flex items-start cursor-pointer w-full pointer-events-none">
        <span
          className={`text-foreground leading-relaxed flex-1 text-base${showStruck ? ' line-through opacity-50' : ''}`}
        >
          {option.text}
        </span>
      </label>
      {onToggleStrike && (
        <button
          type="button"
          className="ml-3 flex-shrink-0 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={`${struck ? 'Undo strike-out of option' : 'Strike out option'} ${option.label}`}
          aria-pressed={struck}
          disabled={isSelected || disabled}
          onClick={(e) => {
            e.stopPropagation();
            onToggleStrike(option.id);
          }}
          onKeyDown={(e) => e.stopPropagation()}
        >
          <s>ab</s>
        </button>
      )}
    </div>
  );
}
