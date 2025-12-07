# Quiz Maker

A modern, interactive quiz application built with React, TypeScript, and Tailwind CSS. Features topic-based quizzes, multiple question types, customizable quiz ranges, and comprehensive explanations with a polished UI.

## Features

### Core Features
- **Topic-Based Quizzes**: Select from multiple quiz topics, each with its own question bank
- **Quiz Configuration**: Choose your starting question and number of questions to practice
- **Multiple Question Types**:
  - **Standard Multiple Choice**: Single or multiple correct answers with radio buttons or checkboxes
  - **Ordering Questions**: Arrange steps in the correct sequence using dropdown selections
  - **Matching Questions**: Match scenarios with corresponding answers
- **Randomized Questions**: Questions are shuffled on each quiz attempt for a fresh experience
- **Randomized Answer Options**: Answer choices are randomized to prevent pattern memorization (standard questions only)
- **Quiz Timer**: Track your time with an HH:MM:SS timer displayed in the header
- **Progress Tracking**: Visual indicators showing current question position and quiz progress

### User Experience
- **Interactive UI**: Clean, modern interface with visual feedback for correct/incorrect answers
- **Comprehensive Explanations**: Detailed explanations for each question with context about why answers are correct or incorrect
- **Collapsible Quiz Summary**: Review all questions with expandable/collapsible details and explanations
- **Time Tracking**: View total elapsed time in the final summary
- **Flexible Navigation**: Navigate between questions, skip around, or go back to review
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
│   ├── ui/                      # shadcn/ui components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── progress.tsx
│   ├── AnswerOption.tsx         # Individual answer choice (radio/checkbox)
│   ├── QuestionCard.tsx         # Main question display with routing logic
│   ├── ResultPanel.tsx          # Feedback panel after answering
│   ├── QuizSummary.tsx          # Final results with collapsible review
│   ├── TopicSelection.tsx       # Topic selection screen
│   ├── QuizConfiguration.tsx    # Quiz configuration (start/count)
│   ├── OrderingQuestion.tsx     # Ordering question type component
│   └── MatchingQuestion.tsx     # Matching question type component
├── data/
│   ├── topics.ts                # Quiz topics metadata
│   └── [topic].json             # Individual topic question banks
├── services/
│   └── questionService.ts       # Question loading and randomization
├── hooks/
│   └── useTimer.ts              # Quiz timer hook (HH:MM:SS)
├── types/
│   └── quiz.ts                  # TypeScript type definitions
├── utils/
│   └── shuffleArray.ts          # Fisher-Yates shuffle algorithm
├── App.tsx                      # Main application with routing
└── main.tsx                     # Application entry point
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

### Application Flow

1. **Topic Selection**: Choose a quiz topic from the available topics
2. **Quiz Configuration**:
   - Select starting question number (1 to N)
   - Choose number of questions to practice
   - Preview quiz range (e.g., Q15 → Q45)
3. **Quiz Session**:
   - Timer starts automatically when quiz begins
   - Answer questions with instant visual feedback
   - Navigate freely between questions
   - Submit answers and see explanations
4. **Summary Screen**:
   - View final score and elapsed time
   - Review all questions with collapsible details
   - See correct answers and explanations

### Question Types

#### Standard Multiple Choice
- Single answer (radio buttons) or multiple answers (checkboxes)
- Answer options are randomized
- Visual feedback with green (correct) and red (incorrect) highlighting

#### Ordering Questions
- Arrange steps in correct sequence using dropdown menus
- Each step has a dropdown with available options
- No randomization - preserves original order for context

#### Matching Questions
- Match scenarios with corresponding answers
- Each scenario has a dropdown with all possible answers
- Validate all matches together

### Question Randomization

The application uses the Fisher-Yates shuffle algorithm to randomize:
1. **Question Order**: Questions are shuffled when the quiz loads
2. **Answer Options**: Standard question options are randomized independently
3. **Smart Randomization**: Ordering and matching questions skip randomization to preserve context

### Data Structure

Questions are stored in topic-specific JSON files (e.g., `src/data/aws-basics.json`):

#### Standard Question
```json
{
  "id": "1",
  "text": "Question text here",
  "questionType": "standard",
  "options": [
    { "id": "a", "label": "A", "text": "Option A text" },
    { "id": "b", "label": "B", "text": "Option B text" }
  ],
  "correctAnswers": ["a"],
  "explanation": "Detailed explanation",
  "isMultipleChoice": false
}
```

#### Ordering Question
```json
{
  "id": "2",
  "text": "Arrange these steps in order",
  "questionType": "ordering",
  "steps": [
    {
      "stepNumber": 1,
      "options": ["Option 1", "Option 2", "Option 3"],
      "correctAnswer": "Option 1"
    }
  ],
  "explanation": "Detailed explanation",
  "isMultipleChoice": false
}
```

#### Matching Question
```json
{
  "id": "3",
  "text": "Match each scenario with the correct answer",
  "questionType": "matching",
  "scenarios": [
    {
      "id": 1,
      "text": "Scenario description",
      "correctAnswer": "Answer A"
    }
  ],
  "matchingOptions": ["Answer A", "Answer B", "Answer C"],
  "explanation": "Detailed explanation",
  "isMultipleChoice": false
}
```

## Customization

### Adding New Topics

1. **Create a topic JSON file** in `src/data/` (e.g., `my-topic.json`)
2. **Add questions** following one of the question type schemas above
3. **Register the topic** in `src/data/topics.ts`:

```typescript
export const quizTopics: QuizTopic[] = [
  {
    id: "my-topic",
    name: "My Topic Name",
    description: "Topic description here",
    fileName: "my-topic.json",
    questionCount: 25, // Total number of questions
    icon: "📚", // Optional emoji icon
  },
  // ... other topics
];
```

### Adding Questions to Existing Topics

Add questions to any topic JSON file following the appropriate schema:
- **Standard questions**: Single or multiple choice with `questionType: "standard"`
- **Ordering questions**: Step sequencing with `questionType: "ordering"`
- **Matching questions**: Scenario matching with `questionType: "matching"`

The quiz automatically detects question types and renders the appropriate UI.

### Styling

The application uses Tailwind CSS for styling. Key customization points:

- **Colors**: Modify color schemes in `tailwind.config.js`
- **Components**: Update component styles in individual `.tsx` files
- **Theme**: Adjust CSS custom properties for UI elements

### UI Components

Built with shadcn/ui components for consistency:
- **Card**: Question containers, topic selection, quiz configuration
- **Button**: Navigation, actions, and topic selection
- **Badge**: Question counters, quiz range indicators
- **Progress**: Selection progress bars

## Performance Features

- **Optimized Rendering**: React components optimized to prevent unnecessary re-renders
- **Type Safety**: Full TypeScript coverage for reliability and IntelliSense
- **Fast Refresh**: Vite HMR for instant development feedback
- **Code Splitting**: Automatic code splitting for optimal load times
- **Dynamic Imports**: Question data loaded on-demand per topic
- **State Management**: Efficient state updates with React hooks (useState, useEffect, custom hooks)

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
- **Component Structure**: Modular, reusable components with clear separation of concerns
- **State Management**: React hooks (useState, useEffect) and custom hooks (useTimer)
- **Type Definitions**: Comprehensive TypeScript interfaces for all data structures
- **Smart Routing**: QuestionCard component intelligently routes to appropriate question type components

## Architecture Highlights

### Multi-Screen Flow
The application implements a clean multi-screen flow:
1. **TopicSelection** → Choose your quiz topic
2. **QuizConfiguration** → Configure question range and count
3. **Quiz Session** → Answer questions with timer and navigation
4. **QuizSummary** → Review results with collapsible details

### Question Type Extensibility
The `QuestionCard` component acts as a smart router that delegates to specialized components based on `questionType`:
- **StandardQuestion** (default) → Rendered inline in QuestionCard
- **OrderingQuestion** → Dropdown-based step sequencing
- **MatchingQuestion** → Scenario-to-answer matching

This architecture makes it easy to add new question types without modifying core quiz logic.

### Custom Hooks
- **useTimer**: Manages quiz timer with start/pause/reset functionality and HH:MM:SS formatting
- Extensible hook pattern for additional features (e.g., useProgress, useQuizState)

### Configuration-Driven Design
Quiz configuration is flexible and user-controlled:
- Select any starting question (1 to N)
- Choose any number of questions within available range
- Dynamic validation prevents invalid configurations
- Real-time preview of quiz range (e.g., Q15 → Q45)

## License

MIT

## Contributing

Contributions are welcome! Please follow the existing code style and include appropriate tests for new features.
