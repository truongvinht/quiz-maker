# Sequential Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a third quiz mode that runs the whole bank in file order with a right-side question navigator, saved green/red progress per topic and a reset, plus A/D and number-key shortcuts in all three modes.

**Architecture:** Pure logic goes in small modules under `src/lib/` with unit tests: result building, progress storage, and shortcut resolution. React components consume them. `App.tsx` stays the owner of quiz state and gains a `'sequential'` branch. A new `QuestionNavigator` component renders the squares. `QuestionCard`, `OrderingQuestion` and `MatchingQuestion` learn to show a locked, saved answer.

**Tech Stack:** React 19, TypeScript ~5.9, Vite 7, Tailwind. Adds Vitest as a dev dependency (node environment, no DOM library).

**Spec:** `docs/superpowers/specs/2026-11-13-sequential-mode-design.md`

## Global Constraints

- Branch: `feat/sequential-mode`, in a separate git worktree (CLAUDE.md). If started in a harness worktree, run `git branch -m feat/sequential-mode`.
- Before **every** commit, run `npm run lint -- --max-warnings=0` and abort if it reports anything. Never use `--no-verify` or `eslint-disable`, and never change lint rules.
- Every commit goes through the `git-smart-commit` skill. The message ends with one blank line and then `Co-Authored-By: <current Claude model name> <noreply@anthropic.com>`. No other trailers.
- Mode id: `'sequential'`. Card title: `Sequential Mode`. Card description: `All questions in order — your progress is saved in this browser`.
- localStorage key: `quiz-maker:sequential:<topicId>`.
- Square colours: white = unanswered, green = correct, red = wrong. Current question gets a blue ring. The navigator sits on the **right** (mockup option B).
- Questions in file order. Answer options are still shuffled (`randomizeAnswerOptions`).
- Answers are final until Reset. Reset asks for confirmation.
- Shortcuts in all three modes: `a` = previous, `d` = next, digits `1`–`9` = option at that on-screen position. Ignored with any of Cmd/Ctrl/Alt/Shift held, or when focus is in `input`/`textarea`/`select`/contenteditable. A/D never submit an Exam.
- Training and Exam behaviour must not change apart from the shortcuts.

## Review Focus

1. **localStorage unavailable or throwing** (Safari private mode, quota full, disabled storage). The app must still run, and progress lives in memory for the session. Test in Task 2.
2. **Bank edited after progress was saved** (question removed, added or reordered). Unknown saved ids are ignored, new questions show white, and colours follow the id, not the position. Test in Task 2.
3. **Second submit of the same question** (fast double-click, a number key after submit, a stale Ordering "Try Again"). The first saved answer wins. Test in Task 2, `saveAnswer` does not overwrite.
4. **A/D pressed while an ordering/matching `<select>` has focus, with Caps Lock on, or with Shift held.** Ignored in the select and with Shift, and it still works with Caps Lock. Test in Task 3.
5. **D on the last Exam question.** Must not submit the exam. Covered in the Task 7 manual check.

---

### Task 1: Vitest setup and shared result builder

**Files:**
- Modify: `package.json` (add `vitest` devDependency, `"test": "vitest run"` script)
- Create: `src/lib/quizResult.ts`
- Test: `src/lib/quizResult.test.ts`
- Modify: `src/App.tsx` (`handleExamSubmit` uses `buildQuizResult`)

**Interfaces:**
- Produces: `buildQuizResult(question: Question, selection: string[] | Map<number, string> | undefined): QuizResult`. It computes `isCorrect` and the answer texts for standard, ordering and matching questions exactly as `handleExamSubmit` does today. `undefined` gives an empty answer with `isCorrect: false`.

- [x] **Step 1:** `npm install -D vitest@^4` and add the `test` script. Run `npm test`. Expected: "No test files found" (exit code non-zero is fine here).
- [x] **Step 2: Write failing tests** in `src/lib/quizResult.test.ts` using inline fixture questions:
  - `standard correct`: options `a,b,c`, `correctAnswers ['b']`, selection `['b']`. Expect `isCorrect true`, `userAnswerTexts` = text of `b`.
  - `standard multi wrong`: `correctAnswers ['a','c']`, selection `['a']`. Expect `isCorrect false`.
  - `ordering correct`: steps 1,2 with correct `X`,`Y`, selection `new Map([[1,'X'],[2,'Y']])`. Expect `isCorrect true`, `userAnswerTexts ['Step 1: X','Step 2: Y']`, `correctAnswerTexts ['Step 1: X','Step 2: Y']`.
  - `matching wrong`: scenarios 1,2 correct `P`,`Q`, selection `Map([[1,'P'],[2,'P']])`. Expect `isCorrect false`, `userAnswerTexts ['Scenario 1: P','Scenario 2: P']`.
  - `no answer`: selection `undefined`. Expect `userAnswers []`, `isCorrect false`, `correctAnswerTexts` filled in.
- [x] **Step 3:** Run `npm test`. Expected: FAIL, module not found.
- [x] **Step 4:** Implement `buildQuizResult` by moving the per-question body of `handleExamSubmit` (`src/App.tsx`) into it. Then make `handleExamSubmit` call it in a loop.
- [x] **Step 5:** Run `npm test` and `npm run build`. Expected: all pass and the build succeeds.
- [x] **Step 6:** Lint and commit (Global Constraints).

### Task 2: Progress storage module

**Files:**
- Create: `src/lib/sequentialProgress.ts`
- Test: `src/lib/sequentialProgress.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type StoredSelection =
    | { kind: 'options'; ids: string[] }
    | { kind: 'entries'; entries: [number, string][] };
  interface SavedAnswer { selection: StoredSelection; isCorrect: boolean; answeredAt: string } // ISO timestamp
  type SequentialProgress = Record<string, SavedAnswer>; // key = question id
  interface ProgressStorage { getItem(k: string): string | null; setItem(k: string, v: string): void; removeItem(k: string): void }
  type SquareStatus = 'unanswered' | 'correct' | 'wrong';

  progressKey(topicId: string): string                       // 'quiz-maker:sequential:' + topicId
  defaultStorage(): ProgressStorage | null                   // window.localStorage, or null if access throws
  toStoredSelection(sel: string[] | Map<number, string>): StoredSelection
  fromStoredSelection(s: StoredSelection): string[] | Map<number, string>
  loadProgress(topicId: string, storage: ProgressStorage | null = defaultStorage()): SequentialProgress
  saveAnswer(topicId: string, progress: SequentialProgress, questionId: string, answer: SavedAnswer,
             storage: ProgressStorage | null = defaultStorage()): SequentialProgress
  resetProgress(topicId: string, storage: ProgressStorage | null = defaultStorage()): void
  squareStatus(progress: SequentialProgress, questionId: string): SquareStatus
  progressCounts(questions: { id: string }[], progress: SequentialProgress):
    { total: number; answered: number; correct: number; wrong: number }
  findDuplicateIds(questions: { id: string }[]): string[]
  ```
- `saveAnswer` is pure with a best-effort write. It returns a **new** object with the answer added, or the **same** object unchanged if `questionId` is already present. Storage errors are caught and ignored.

- [x] **Step 1: Write failing tests** with an in-memory fake `ProgressStorage` (a `Map`), plus a throwing fake whose methods all `throw new Error('denied')`:
  - `progressKey('aws-basics') === 'quiz-maker:sequential:aws-basics'`
  - round trip: `fromStoredSelection(toStoredSelection(['a','b']))` deep-equals `['a','b']`, and `Map([[1,'X']])` round-trips to an equal `Map`.
  - `loadProgress` returns `{}` for a missing key, for `'not json'`, for `'[1,2]'`, and for entries missing `isCorrect`. Valid entries next to invalid ones are kept.
  - `saveAnswer` then `loadProgress` returns the saved answer, and other topics' keys are untouched.
  - `saveAnswer` on an id already present returns the same object (`toBe`) and does not change storage. *(Review Focus 3)*
  - `resetProgress` makes the next `loadProgress` return `{}`.
  - with the throwing storage, `loadProgress` returns `{}`, `saveAnswer` still returns the merged object, and `resetProgress` does not throw. *(Review Focus 1)*
  - `squareStatus` gives `'unanswered'`, `'correct'` and `'wrong'`.
  - `progressCounts` for questions `[1,2,3]` with saved `{2: correct, 3: wrong, 99: correct}` gives `{total:3, answered:2, correct:1, wrong:1}`. Id 99 is ignored. *(Review Focus 2)*
  - `findDuplicateIds([{id:'1'},{id:'2'},{id:'1'}])` gives `['1']`.
- [x] **Step 2:** Run `npm test`. Expected: FAIL, module not found.
- [x] **Step 3:** Implement the module. Validate each stored entry's shape when loading and drop bad ones.
- [x] **Step 4:** Run `npm test`. Expected: PASS.
- [x] **Step 5:** Lint and commit.

### Task 3: Keyboard shortcut resolution and hook

**Files:**
- Create: `src/lib/keyboardShortcuts.ts`
- Test: `src/lib/keyboardShortcuts.test.ts`

**Interfaces:**
- Produces:
  ```ts
  interface ShortcutEventLike {
    key: string; metaKey: boolean; ctrlKey: boolean; altKey: boolean; shiftKey: boolean;
    target: { tagName?: string; isContentEditable?: boolean } | null;
  }
  type ShortcutAction = { type: 'prev' } | { type: 'next' } | { type: 'option'; index: number } | null;
  resolveShortcut(e: ShortcutEventLike): ShortcutAction   // index is 0-based ('1' -> 0)
  useKeyboardShortcut(onAction: (a: Exclude<ShortcutAction, null>) => void, enabled: boolean): void
  ```
- `useKeyboardShortcut` adds a `keydown` listener on `window` while `enabled`. It calls `onAction` for non-null results and calls `preventDefault()` only in that case. It keeps the latest `onAction` in a ref so the listener isn't re-attached on every render.

- [x] **Step 1: Write failing tests** for `resolveShortcut`:
  - `'a'` gives `prev`, `'d'` gives `next`, `'A'` with `shiftKey:false` (Caps Lock) gives `prev`. *(Review Focus 4)*
  - `'1'` gives `{option, index 0}` and `'9'` gives index 8. `'0'` gives `null`.
  - any of `metaKey`/`ctrlKey`/`altKey`/`shiftKey` true gives `null` (e.g. Shift+A, Cmd+D). *(Review Focus 4)*
  - target `{tagName:'SELECT'}`, `'INPUT'`, `'TEXTAREA'` or `{isContentEditable:true}` gives `null` for `'a'` and `'1'`. *(Review Focus 4)*
  - target `{tagName:'BUTTON'}` and `null` still resolve.
  - other keys (`'x'`, `'Enter'`) give `null`.
- [x] **Step 2:** Run `npm test`. Expected: FAIL.
- [x] **Step 3:** Implement `resolveShortcut` and `useKeyboardShortcut`.
- [x] **Step 4:** Run `npm test`. Expected: PASS.
- [x] **Step 5:** Lint and commit.

### Task 4: Unshuffled question loading

**Files:**
- Modify: `src/services/questionService.ts`
- Test: `src/services/questionService.test.ts`

**Interfaces:**
- Produces: `loadSequentialQuiz(fileName: string): Promise<Question[]>`. It returns the whole bank in file order, with `randomizeAnswerOptions` applied to each question. `loadQuestions` and `loadRandomizedQuiz` keep their current shuffling behaviour. Share the glob lookup through a private `loadQuestionBank(fileName)` that returns the bank unshuffled.

- [x] **Step 1: Write failing tests:** `loadSequentialQuiz('aws-basics.json')` returns ids `['1','2','3','4']` in order. Sorted option ids per question are `['a','b','c','d']`, `['a','b','c','d','e']`, `['a','b','c','d']`, and Q4 (ordering) has no `options`. Hard-code these values. Don't import the JSON in the test, because `resolveJsonModule` is not enabled in `tsconfig.app.json`. `loadSequentialQuiz('nope.json')` rejects with `Question file not found`.
- [x] **Step 2:** Run `npm test`. Expected: FAIL.
- [x] **Step 3:** Implement as described.
- [x] **Step 4:** Run `npm test`. Expected: PASS.
- [x] **Step 5:** Lint and commit.

### Task 5: Locked answers and number keys in question components

**Files:**
- Modify: `src/types/quiz.ts` (`QuizMode = 'training' | 'exam' | 'sequential'`)
- Modify: `src/components/QuestionCard.tsx`
- Modify: `src/components/OrderingQuestion.tsx`
- Modify: `src/components/MatchingQuestion.tsx`

**Interfaces:**
- Consumes: `useKeyboardShortcut`, `resolveShortcut` action `option` (Task 3).
- Produces:
  - `QuestionCard` gets a new optional prop `lockedSelection?: string[] | Map<number, string>`. When set, the card starts `submitted` with that selection, is read-only, and shows the result panel with the explanation.
  - In `QuestionCard`, `mode === 'sequential'` behaves like `'training'` (check immediately, result panel, Next button). Replace the `mode === 'training'` checks with `const checksImmediately = mode !== 'exam'`.
  - `OrderingQuestion` and `MatchingQuestion` get `initialAnswers?: Map<number, string>` (when set, start submitted with these answers). `OrderingQuestion` also gets `allowRetry?: boolean` (default `true`). `QuestionCard` passes `allowRetry={mode !== 'sequential'}`.
  - `QuestionCard` registers `useKeyboardShortcut` for `option` actions only. Enabled when the question is standard (not ordering or matching) and not `submitted`. Index `i` calls the existing `handleOptionSelect(question.options[i].id)` if that option exists. This works in all three modes.

There's no component test setup (no DOM library). Verification is a type check plus a manual run.

- [x] **Step 1:** Implement the props and behaviour above.
- [x] **Step 2:** Run `npm run build` and `npm test`. Expected: success.
- [ ] **Step 3: Manual check** with `npm run dev` in Training and Exam mode (Sequential isn't wired yet). On a single-choice question, `2` selects the second option shown. On a multi-choice question, `1` toggles the first option on and off. After "Check Answer", digits do nothing. On an ordering question, digits do nothing and "Try Again" is still there in Training.
- [x] **Step 4:** Lint and commit.

### Task 6: QuestionNavigator component

**Files:**
- Create: `src/components/QuestionNavigator.tsx`

**Interfaces:**
- Consumes: `squareStatus`, `progressCounts`, `SequentialProgress` (Task 2).
- Produces:
  ```ts
  interface QuestionNavigatorProps {
    questions: Question[];
    currentIndex: number;
    progress: SequentialProgress;
    onJump: (index: number) => void;
    onReset: () => void;        // caller handles the confirm prompt
    onViewResults: () => void;  // button only rendered when every question is answered
  }
  ```
- Layout follows mockup B: a heading, a counts line `"{answered} / {total} answered · {correct} ✓ · {wrong} ✗"`, a 5-column grid of square buttons labelled `1..N` (`aria-label="Question N, <status>"`) that scrolls when tall, a `View results` button, and a `Reset progress` button styled in red outline. White, green (`bg-green-500`) and red (`bg-red-500`) squares, current one with `ring-2 ring-blue-600`.
- Small screens: below Tailwind `lg`, render a `Questions ▾` toggle button that shows or hides the panel. At `lg` and up the panel is always shown.

- [x] **Step 1:** Implement the component.
- [x] **Step 2:** Run `npm run build`. Expected: success. (The component is first seen on screen in Task 7.)
- [x] **Step 3:** Lint and commit.

### Task 7: Configuration card and App wiring

**Files:**
- Modify: `src/components/QuizConfiguration.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: everything from Tasks 1–6.

**QuizConfiguration:**
- Add a third mode card with the title and description from Global Constraints. The mode grid becomes `md:grid-cols-3`.
- When `mode === 'sequential'`, hide the start-question/count inputs and the range preview. `onStart` sends `{ startQuestion: 1, questionCount: topic.questionCount, mode }`. App ignores those numbers for this mode.

**App (sequential branch):**
- On start: `loadSequentialQuiz(topic.fileName)` and `loadProgress(topic.id)` go into new state `sequentialProgress`. `console.warn` any ids from `findDuplicateIds`.
- Opening index: the first unanswered question, or `0` when all are answered. *(Plan decision. The spec is silent.)*
- Layout: `flex` row on `lg` with the question column on the left and `QuestionNavigator` on the right (about `w-64`). Stacked on smaller screens.
- Header timer hidden in this mode. `QuizSummary` gets `elapsedTime="—"`, because time across sessions isn't tracked. *(Builder's call per spec.)*
- `handleAnswerSubmit`: if the current question id is already in `sequentialProgress`, ignore it. Otherwise call `saveAnswer` with `{ selection: toStoredSelection(sel), isCorrect: buildQuizResult(q, sel).isCorrect, answeredAt: new Date().toISOString() }` and store the result.
- `QuestionCard` gets `lockedSelection={saved ? fromStoredSelection(saved.selection) : undefined}`, `isLastQuestion={every question answered}` (so the button reads "📊 View Results"), and an `onNext` that opens results when all are answered, otherwise goes to the next index if there is one.
- `onJump` sets the index. `onViewResults` sets `quizCompleted`. `onReset`: `window.confirm('Reset all saved progress for "<topic name>"? This cannot be undone.')`. On OK, `resetProgress(topic.id)`, set `{}`, and stay on the current index.
- Summary: in this mode `generateSummary` builds each result with `buildQuizResult(q, fromStoredSelection(saved.selection))` and then sets `isCorrect` to `saved.isCorrect` (the saved correctness wins, per spec).
- `handleRestart` stays as is. It must **not** touch storage.

**App (all modes):**
- `useKeyboardShortcut` on the question screen (enabled when not loading and not completed). `prev` calls `handlePrevious`. `next` moves to `currentQuestionIndex + 1` **only if** it isn't the last question, and never calls `handleNext`/`handleExamSubmit`. *(Review Focus 5)*

- [x] **Step 1:** Implement QuizConfiguration changes.
- [x] **Step 2:** Implement the App changes.
- [x] **Step 3:** Run `npm run build` and `npm test`. Expected: success.
- [ ] **Step 4: Manual check** (`npm run dev`, topic AWS Basics):
  - Sequential card shown and range inputs hidden. Questions appear in file order 1–4, with options shuffled between reloads.
  - Answer Q1 right (green) and Q2 wrong (red). Reload the page and re-enter: colours are still there, and it opens on Q3.
  - Click square 2: read-only, your answer and the correct one marked, explanation shown, digits and submit inert.
  - Answer the rest. The last answer shows feedback first, then "📊 View Results" opens the summary with the right score. "Restart" returns to topics, and re-entering keeps the colours and shows "View results".
  - Reset → Cancel keeps everything. Reset → OK makes everything white.
  - A/D move between questions in all three modes. On the last Exam question, D does nothing and the exam is not submitted. Shift+D and Cmd+D do nothing.
  - Narrow the window below `lg`: the `Questions ▾` toggle appears and works.
  - DevTools → block storage (or Safari private window): the mode still works within the session.
- [x] **Step 5:** Lint and commit.
