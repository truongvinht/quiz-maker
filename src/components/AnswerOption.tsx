import type { QuizOption } from '../types/quiz';

interface AnswerOptionProps {
  option: QuizOption;
  isSelected: boolean;
  isCorrect: boolean | null; // null = not submitted yet
  isMultipleChoice: boolean;
  disabled: boolean;
  onSelect: (optionId: string) => void;
}

export default function AnswerOption({
  option,
  isSelected,
  isCorrect,
  isMultipleChoice,
  disabled,
  onSelect,
}: AnswerOptionProps) {
  const getClassName = () => {
    let className = 'flex items-start p-5 my-3 border-2 rounded-xl transition-all duration-300 ease-in-out';

    // Base state with shadow
    className += ' border-gray-200 bg-white shadow-sm';

    // Selected state (before submission)
    if (isSelected && !disabled) {
      className += ' border-selected bg-selected-light shadow-md ring-2 ring-selected ring-opacity-20';
    }

    // After submission states
    if (disabled && isCorrect !== null) {
      if (isCorrect) {
        // This is a correct answer - always show green
        className += ' border-green-500 bg-green-50 shadow-md ring-2 ring-green-500 ring-opacity-30';
      } else if (isSelected) {
        // This was selected but is incorrect - show red
        className += ' border-red-500 bg-red-50 shadow-md ring-2 ring-red-500 ring-opacity-30';
      }
    }

    // Hover and cursor with enhanced interactions
    if (!disabled) {
      className += ' cursor-pointer hover:border-selected hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] focus-within:ring-2 focus-within:ring-selected focus-within:ring-opacity-50';
    } else {
      className += ' cursor-not-allowed opacity-90';
    }

    return className;
  };

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
        <span className="text-gray-900 leading-relaxed flex-1 text-base">{option.text}</span>
      </label>
    </div>
  );
}
