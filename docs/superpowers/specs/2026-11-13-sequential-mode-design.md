# Sequential Mode — Design

**Date:** 2026-11-13
**Status:** approved

## Intent

The owner wants to train on **every** question of a topic's bank, see at a glance which ones they got wrong, and go back to review those. Today's two modes (Training, Exam) shuffle the bank and work on a slice, so there is no stable "question 10" and no memory between sessions.

A later **coach mode** (not part of this work) will use the wrong answers to help the owner improve. This design should store enough to make that possible, but must not build any of it.

## Goals

- A third quiz mode, next to Training and Exam, on the configuration screen.
- All questions of the topic, in the order they appear in the bank file. No question shuffle.
- A navigator panel on the **right** side with one numbered square per question. Clicking a square jumps to that question.
- Square colours: white = not answered, green = answered correctly, red = answered wrong. The current question is marked (blue ring in the mockup).
- Progress is remembered in the browser's `localStorage`, per topic, across sessions.
- A way to reset the saved progress for the topic.
- When every question is answered, show the same results screen the other modes use (`QuizSummary`).
- Keyboard shortcuts in **all three modes**: A / D for previous / next question, number keys to pick an answer option.

## Non-goals

- Coach mode.
- Syncing progress across devices or browsers.
- Changing Training or Exam mode behaviour, apart from adding the keyboard shortcuts below.
- Re-answering a question without a reset (see "Answers are final").

## Anti-goals (would be a failure even if it technically works)

- An answer that can be changed after it was submitted. The owner was explicit: once submitted it stays until reset.
- Losing progress on reload or browser restart.
- Reset wiping progress with a single accidental click.

## Behaviour (decided by the owner)

### Configuration screen
- A third mode card is added beside Training and Exam.
- In this mode the start-question and question-count fields **do not apply**: the mode always uses the whole bank. *(Builder's call how: hide or disable those inputs and the range preview when this mode is selected; the owner did not specify. Hiding them is the suggested default.)*

### Question order and options
- Questions are in **file order**. Question N in the navigator is the N-th entry in the bank's JSON array.
- Answer options (A/B/C/D) are **still shuffled**, as in the other modes. Ordering and matching questions keep their current non-shuffled handling.
- Note: `loadQuestions()` in `src/services/questionService.ts` currently always shuffles. This mode needs an unshuffled load path; Training/Exam must keep shuffling.

### Answering
- Before submitting, the selection can be changed freely.
- Pressing the submit button at the bottom of the question **locks** the answer. Correctness is checked immediately (like Training mode), the square turns green or red, and it is saved.
- Answers are final: an answered question cannot be answered again until the topic's progress is reset.

### Revisiting an answered question
- Shows the question with the user's saved answer, the correct answer, and the explanation, in a read-only state. This requires storing the selected answer, not only correctness.

### Navigator panel (right side)
- One square per question, numbered 1..N, in file order. Grid scrolls when the bank is long.
- Click jumps to that question. Previous/Next buttons remain.
- Shows a small count (answered / correct / wrong) and a **Reset progress** button.
- Approved layout: mockup option **B** (navigator on the right) — see `.superpowers/brainstorm/75445-1794558496/content/layout.html`.

### Reset
- Clears all saved progress for the current topic in this mode; all squares go white.
- *My call:* reset asks for confirmation first ("are you sure?"), because an accidental click would wipe everything. The confirm UI (native `confirm()` vs. an inline dialog) is the builder's call.

### Results screen
- When the last **unanswered** question gets answered (whatever its index), show the existing `QuizSummary` results screen with score/percentage and the per-question list.
- *My call:* the results screen does not replace the question right away. As in Training mode, the last question's feedback and explanation show first, then a "View results" button opens the summary.
- *My call:* when the user opens this mode on a topic that is already fully answered, show the question screen with the full grid (so they can review) plus a way to open the results screen again, rather than jumping straight to results. The exact control ("View results" button in the panel) is the builder's call.
- *My call:* the summary's existing "restart" button keeps its current behaviour (back to topic selection). It does **not** reset saved progress — only the Reset button does.

### Keyboard shortcuts (all three modes)

This applies to Training, Exam and Sequential mode, on the question screen only.

- **A** = previous question, **D** = next question. No modifier keys. The owner first asked for Cmd+Option+A/D. That was dropped because macOS reserves Cmd+Option+D to show or hide the Dock, so the browser never gets the key.
- **1, 2, 3, 4, …** pick the answer option at that **on-screen position** (1 = the first option shown, after shuffling). On multiple-choice (checkbox) questions a press toggles the option. On single-choice (radio) questions it selects that option. Digits above the option count do nothing.
- Shortcuts are ignored while focus is in a text input, textarea, select or contenteditable element, and when Cmd, Ctrl, Alt/Option or Shift is held, so browser and OS shortcuts keep working.
- *Proposed by me, not objected to by the owner:* number keys do nothing once the answer is submitted/locked, and nothing on ordering or matching questions (those use dropdowns).
- *My call:* A/D behave exactly like the on-screen Previous/Next buttons, including being disabled at the first/last question. In Exam mode, `handleNext()` on the last question submits the exam, but the header Next button is disabled there, so **D must not submit the exam**. In Sequential mode, D on the last question does nothing.
- *Left to the builder:* whether to show a small shortcut hint (e.g. "A/D to navigate, 1–4 to choose") on the question screen.

### Small screens
- *My call (not confirmed by owner):* on narrow screens the side panel collapses into a "Questions" toggle above the question that opens the grid.

## Persistence

- Storage: `localStorage`, one entry per topic for this mode. Key name is the builder's call; it must include the topic `id` (e.g. `quiz-maker:sequential:<topicId>`).
- Per answered question store at least: question id, the selected answer (option ids, or the step/scenario answers for ordering/matching), whether it was correct, and when it was answered. Storing the timestamp is cheap and helps the future coach mode.
- Questions are identified by their `id` field, not by position, so that a reordered bank keeps the right colours.
  - Verified on 2026-11-13: `id` is unique within every current bank (`aws-basics` 4, `private/aws-ai-ml` 166, `private/ccdv-f` 72, `private/cpsaf` 64; no duplicates). Banks added later might have duplicates, so the builder should still guard against them (e.g. warn in the console) rather than silently mixing answers.
- *My call:* the saved correctness is kept as-is if a bank's answer key is edited later. Because the selected answer is stored too, correctness can be recalculated in the future if needed.
- Saved entries whose question id no longer exists in the bank are ignored. New questions added to the bank show as white.
- Corrupt or unreadable stored data must not crash the app: treat it as "no progress".
- Saved progress lives only in this browser on this device (owner accepted this).

## Constraints / existing code

- React + TypeScript + Vite + Tailwind; UI primitives in `src/components/ui/`.
- `QuizMode` in `src/types/quiz.ts` is `'training' | 'exam'`; the new mode extends it.
- Mode-specific behaviour today lives mainly in `src/App.tsx` (`handleAnswerSubmit`, `handleExamSubmit`, `generateSummary`) and `src/components/QuestionCard.tsx` (`mode` prop, `submitted` state, `previousSelection`).
- `QuestionCard` is remounted per question (`key={currentQuestion.id}`), so the read-only "already answered" state must come from props/saved data, not internal state.
- The training-mode path in `handleAnswerSubmit` builds answer texts only for standard and ordering questions; matching questions fall through to the standard branch. The new mode must produce correct results-screen data for all three question types (the exam-mode code in `handleExamSubmit` already handles all three and is a reference).
- `OrderingQuestion.tsx` and `MatchingQuestion.tsx` keep their own internal state (`selectedAnswers`, `submitted`) and can't be given a saved answer today. Both need a way to show a saved answer read-only. `OrderingQuestion` has a "Try Again" button that allows resubmitting, which would break "answers are final", so it must be hidden in this mode.
- `QuizSummary` requires an `elapsedTime` prop, so this mode must pass a value even if the timer is hidden.
- No test framework is installed (scripts: `dev`, `build`, `lint`, `preview`). Whether to add one (e.g. Vitest) for the storage/progress logic is the builder's call.
- Lint must pass with `npm run lint -- --max-warnings=0` before any commit (CLAUDE.md).

## Left to the builder

- The mode's display name and description text on the configuration card (suggested: "Sequential Mode — all questions in order, progress is saved").
- Component structure (e.g. a `QuestionNavigator` component, a progress-storage module).
- The timer: whether to show it in this mode, given progress spans sessions.
- Exact styling, within the approved mockup.
