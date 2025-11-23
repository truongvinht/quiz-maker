# Quiz Maker

A modern, interactive quiz application built with React, TypeScript, and Tailwind CSS. Features randomized questions and answers, comprehensive explanations, and a polished UI with collapsible results.

## Features

- **Randomized Questions**: Questions are shuffled on each quiz attempt for a fresh experience
- **Randomized Answer Options**: Answer choices are randomized to prevent pattern memorization
- **Interactive UI**: Clean, modern interface with visual feedback for correct/incorrect answers
- **Comprehensive Explanations**: Detailed explanations for each question with context about why answers are correct or incorrect
- **Collapsible Quiz Summary**: Review all questions with expandable/collapsible details and explanations
- **Progress Tracking**: Visual indicators showing selection progress and quiz completion
- **Responsive Design**: Fully responsive layout that works on desktop and mobile devices
- **Accessibility**: WCAG-compliant with proper ARIA labels and keyboard navigation

## Tech Stack

- **React 19.2.0** - Modern React with latest features
- **TypeScript 5.9.3** - Type-safe development
- **Vite 7.2.4** - Fast build tool and dev server
- **Tailwind CSS 4.1** - Utility-first CSS framework
- **shadcn/ui** - High-quality UI components (Card, Button, Badge, Progress)
- **Radix UI** - Accessible component primitives

## Project Structure

```
src/
├── components/
│   ├── ui/                 # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── progress.tsx
│   ├── AnswerOption.tsx    # Individual answer choice component
│   ├── QuestionCard.tsx    # Single question display with options
│   ├── ResultPanel.tsx     # Feedback panel after answering
│   └── QuizSummary.tsx     # Final results with collapsible review
├── data/
│   └── questions.json      # Quiz questions database (33 questions)
├── services/
│   └── questionService.ts  # Question loading and randomization logic
├── types/
│   └── quiz.ts            # TypeScript type definitions
├── utils/
│   └── shuffleArray.ts    # Fisher-Yates shuffle algorithm
├── App.tsx                # Main application component
└── main.tsx              # Application entry point
```

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quiz-maker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

## How It Works

### Question Randomization

The application uses the Fisher-Yates shuffle algorithm to randomize:
1. **Question Order**: Questions are shuffled when the quiz loads
2. **Answer Options**: Each question's answer choices are randomized independently
3. **Fresh Experience**: Each quiz attempt presents questions in a different order

### Quiz Flow

1. **Start**: User sees the first randomized question
2. **Answer Selection**: User selects one or more answers (depending on question type)
3. **Submission**: User submits answer and sees immediate feedback
4. **Explanation**: Detailed explanation shows why the answer is correct/incorrect
5. **Next Question**: Progress to the next question
6. **Summary**: Final results screen with score and collapsible question review

### Data Structure

Questions are stored in `src/data/questions.json` with the following structure:

```json
{
  "id": "1",
  "text": "Question text here",
  "options": [
    { "id": "a", "label": "A", "text": "Option A text" },
    { "id": "b", "label": "B", "text": "Option B text" }
  ],
  "correctAnswers": ["a"],
  "explanation": "Detailed explanation",
  "isMultipleChoice": false
}
```

## Customization

### Adding Questions

Add new questions to `src/data/questions.json` following the schema above. The quiz automatically supports:
- Single-choice questions (`isMultipleChoice: false`)
- Multiple-choice questions (`isMultipleChoice: true`)

### Styling

The application uses Tailwind CSS for styling. Key customization points:

- **Colors**: Modify color schemes in `tailwind.config.js`
- **Components**: Update component styles in individual `.tsx` files
- **Theme**: Adjust CSS custom properties for UI elements

### UI Components

Built with shadcn/ui components for consistency:
- **Card**: Question containers and results
- **Button**: Navigation and actions
- **Badge**: Question type indicators
- **Progress**: Selection progress bars

## Performance Features

- **Optimized Rendering**: React components optimized to prevent unnecessary re-renders
- **Type Safety**: Full TypeScript coverage for reliability
- **Fast Refresh**: Vite HMR for instant development feedback
- **Code Splitting**: Automatic code splitting for optimal load times

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Development

### Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production (TypeScript + Vite)
- `npm run lint` - Run ESLint for code quality
- `npm run preview` - Preview production build locally

### Code Quality

- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict mode enabled for type safety
- **Component Structure**: Modular, reusable components
- **State Management**: React hooks for local state

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and include appropriate tests for new features.
