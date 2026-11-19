# Exam mode: flag questions and question grid — design

**Size:** project (full design). Status: **approved by the owner, 2026-11-20**.

## Intent

The owner took a real certification exam and liked two of its features: every question can be
flagged and unflagged for later review, and an overview shows which questions are answered and
which are flagged. They want Exam Mode to work the same way, so practice feels like the real exam.

## Goals

- Flag / unflag any question in Exam Mode.
- A question grid in Exam Mode, like Sequential Mode's, showing answered / unanswered / flagged.
  It can be minimised.
- Submitting the exam always asks for confirmation first.

## Non-goals

- Flags in Training or Sequential Mode.
- Saving an exam in progress (answers, flags, timer) across reloads. Flags live as long as the
  exam attempt, like the answers.
- Showing flags on the results screen.

## Anti-goals (a failure even if it technically works)

- Any hint of right/wrong before submitting, in the grid or on a question card (incl. matching /
  ordering after a cancelled submit).
- Losing the current question's answer (full or partial, any question type) when leaving it by
  any route.
- Submitting the exam without a confirmation (including by keyboard).
- Sequential Mode's grid looking or behaving differently than today.

## Current state (for the builder)

- `src/App.tsx` drives all modes. Exam answers live in `selectedAnswers: Map<questionId, string[] |
  Map<number,string>>`. Standard questions report their live selection through
  `handleExamSelectionChange` into `liveExamSelection` (a ref); it is written into `selectedAnswers`
  when the card's Next button is used (`handleAnswerSubmit`) or the D key moves on. Ordering /
  matching questions write into `selectedAnswers` when their own submit runs.
- Matching / ordering questions (CPSA-F: 21 of 64 are matching; aws-ai-ml 5; aws-basics 1) report
  nothing until their own "Check Answer" runs (disabled until every step is filled), which in Exam
  Mode calls `onNext`. Their saved answer is not restored when returning (`initialAnswers` is only
  passed when locked), and their own `submitted` state shows right/wrong marks and "Try Again".
- Header Previous/Next (`HEADER_NAV_BUTTON_CLASSES`) only move between questions; header Next is
  disabled on the last question. On the last question the card's button reads "📝 Submit Exam" and
  calls `handleNext` → `handleExamSubmit()` immediately (no confirmation today).
- `src/components/QuestionNavigator.tsx` is Sequential Mode's grid: sticky on large screens and
  fitted to the window height, keeps the current square in view, collapsed behind a
  "Questions ▾" button on small screens, shows counts, "View results" and "Reset progress".
- Keyboard: `src/lib/keyboardShortcuts.ts` maps A / D / 1–9; D on the last Exam question must not
  submit (existing rule, keep it).
- Confirmations elsewhere use `window.confirm` (reset progress, leaving a quiz).

## Approaches

1. **Make `QuestionNavigator` reusable** (chosen by owner). Square status, flag marks, summary
   line and action buttons come from the mode using it; Sequential passes today's green/red and
   its two buttons, Exam passes answered/flagged and "Submit exam". Minimise is opt-in (Exam only).
   One grid, consistent behaviour, least code. Risk: it changes a component Sequential relies on,
   so Sequential must be checked to be unchanged.
2. Separate `ExamNavigator` (copy). Sequential untouched, but ~160 lines duplicated incl. the
   height-fitting logic; the two drift apart.
3. Shared frame + two thin wrappers. Cleanest split, most restructuring, same risk as 1.

## Design

### Flag

- Header: a **⚑ Flag / Unflag** toggle button directly left of Previous/Next, Exam Mode only.
  It shows its state (pressed look + text "Flagged" vs "Flag"; `aria-pressed`). On phones, icon
  only, like Previous/Next show only arrows.
- Keyboard: **F** toggles the flag of the current question (Exam Mode only). Same guards as A/D
  (no modifiers, not while typing).
- State: a set of flagged question ids in `App`, cleared on restart / leaving the quiz.

### Grid (Exam Mode)

- Same place and behaviour as in Sequential Mode: right-hand column on large screens, sticky,
  fitted to the window; on small screens behind the "Questions ▾" button, closed by default.
- Squares: white = unanswered; a solid neutral colour (not the green/red tokens) = answered; a ⚑
  corner mark = flagged (combines with either state). Current question keeps the blue ring.
  `aria-label` names the state, e.g. "Question 4, answered, flagged".
- "Answered" = the question has a non-empty selection in `selectedAnswers`. For the **current**
  question the live selection counts too (standard, matching and ordering), so its square turns
  answered as soon as something is picked and back to unanswered when it is cleared.
- Summary line: "18 / 30 answered · 2 ⚑".
- Click a square → jump to that question. Before jumping, the current question's live selection is
  saved exactly as the D key does today.
- Buttons: **Submit exam** (goes through the confirmation below). No reset button in Exam Mode.
- **Minimise** (Exam Mode, large screens): a "–" control in the grid header collapses it to a slim
  "Questions ▸" bar; the question area then uses the full width. Clicking the bar opens it again.
  The choice is remembered in this browser (`localStorage`, wrapped in try/catch; falls back to
  open). Small screens keep the existing open/close button.

### Submit with confirmation

- The card's "📝 Submit Exam" on the last question (all question types) and the grid's
  **Submit exam** ask first
  (`window.confirm`, matching the app's other confirmations), saving the current live selection
  before counting:
  "Submit the exam and see your results? 3 unanswered, 2 flagged." Parts with a zero count are
  left out; with nothing open: "Submit the exam and see your results?"
- OK → today's `handleExamSubmit()`. Cancel → stay on the current question, nothing changes.
- D on the last question still does nothing.

### Saving the current answer when leaving a question *(builder's call, approved with this doc)*

- Every way of leaving a question in Exam Mode saves its live answer first: card Next, header
  Previous / Next, A / D keys, grid squares, Submit exam (grid and card). Use one shared
  "save, then go" path; today only card Next and D save, so header buttons and A lose the pick.
- An empty selection is "unanswered": saving it **removes** the entry from `selectedAnswers`, so
  a question the user cleared is scored as unanswered (today the old answer stays and is scored).

### Matching and ordering questions in Exam Mode (owner: "fix them properly")

They must behave like standard questions in an exam:

- **Live answer:** as soon as the user changes a step / scenario, the partial answer is reported
  to `App` (like `onSelectionChange` for standard questions) and saved when leaving the question,
  even if not every step is filled. A question counts as answered once at least one step /
  scenario has a value.
- **Restore:** coming back shows the saved answer, editable (not locked, not checked).
- **Never checked before submit:** in Exam Mode these components show no right/wrong marks, no
  explanation and no "Try Again" at any time. Their own "Check Answer" button becomes the same
  "Next Question →" / "📝 Submit Exam" button standard questions show in Exam Mode, and the
  last-question submit goes through the confirmation. Cancel leaves the question as it was,
  editable.
- Training and Sequential Mode behaviour of these components stays exactly as today.

### Sequential Mode

- Uses the reworked component with its current statuses, counts line, "View results" and
  "Reset progress". No flag, no minimise. Must look and behave exactly as before.

## Constraints

- React 19 + TypeScript + Tailwind, existing tokens (`bg-card`, `border-border`, `ring-selected`,
  …) in both light and dark themes; add a token for "answered" only if no existing neutral fits.
- Lint must be clean (`npm run lint -- --max-warnings=0`); Vitest for logic.
- Work on a branch in a worktree (`feat/exam-flags-navigator`), not on `main`.

## Left to the builder

- Exact prop shape of the reworked `QuestionNavigator` (e.g. a per-square status function plus
  summary text and button slots).
- Where the pure helpers live (e.g. answered/flag counts and the confirm message in `src/lib/`),
  and their unit tests.
- Exact neutral colour for answered squares and the look of the ⚑ corner mark, within the tokens.
