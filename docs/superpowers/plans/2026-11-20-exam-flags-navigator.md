# Exam Mode Flags and Question Grid Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** In Exam Mode, let the user flag questions, strike out answer options (visual only), see answered/flagged questions in a minimisable grid, never lose an answer when moving around (incl. matching/ordering), and confirm before submitting.

**Architecture:** Pure helpers in `src/lib/` (unit-tested) hold the rules: saving a live selection, counts, confirm text, flag toggling, the minimised preference. `QuestionNavigator` becomes mode-agnostic (squares, summary and buttons come from props). `App.tsx` owns flags, the minimised state and one "save, then go" path. Matching/ordering components get an exam variant that reports live answers and never checks them.

**Tech Stack:** React 19, TypeScript, Tailwind (existing tokens), Vitest (node environment, no DOM testing library — UI behaviour is checked manually in Task 7).

**Spec:** `docs/superpowers/specs/2026-11-20-exam-flags-navigator-design.md`

## Global Constraints

- Branch `feat/exam-flags-navigator` in a separate worktree; never on `main`.
- Flags and strike-outs only in Exam Mode; flags, strike-outs and answers live for one exam attempt (no persistence). Strike-outs never change selection or scoring.
- No right/wrong hint anywhere in Exam Mode before submit (grid colours must not use `correct`/`incorrect`/`selected` tokens; cards show no marks, explanation or "Try Again").
- Confirm text exactly: `Submit the exam and see your results? {n} unanswered, {m} flagged.` — omit a part whose count is 0 (`… results? 2 flagged.`); both 0 → `Submit the exam and see your results?`
- Grid summary text exactly: `{answered} / {total} answered · {flagged} ⚑`.
- Square `aria-label`: `Question {n}, answered|unanswered` plus `, flagged` when flagged. Sequential keeps `Question {n}, unanswered|correct|wrong`.
- Minimised preference key: `quiz-maker:navigator-minimized` (`"1"` = minimised); any storage error → treat as open.
- F key = toggle flag (Exam Mode only), same guards as A/D. D on the last Exam question still does nothing.
- Sequential Mode grid looks and behaves exactly as today (classes, texts, buttons, labels).
- `npm run lint -- --max-warnings=0` clean before every commit; commit messages via the `git-smart-commit` skill with the `Co-Authored-By` trailer from CLAUDE.md.

## Review Focus

- **Pick an option, then leave by header Previous or A** → the square shows answered and the answer is scored. Covered by `withSavedSelection` tests (Task 1) + manual check (Task 7).
- **Untick every option on a multiple-choice question that was answered** → square unanswered, scored as unanswered. `withSavedSelection` "empty removes" test (Task 1).
- **Submit right after picking on the last question** (no state update yet) → that pick is counted in the confirm text and scored. `requestSubmit` computes from the merged map, not from state (Task 6) + manual check.
- **Cancel the confirm on a last matching/ordering question** → question stays editable, no marks. Manual check (Task 7).
- **Storage blocked or throwing** → grid opens normally, no crash. Throwing-storage tests (Task 1).

---

### Task 1: Exam helpers

**Files:**
- Create: `src/lib/examState.ts`, `src/lib/examState.test.ts`

**Interfaces:**
- Produces:
  - `type ExamSelection = string[] | Map<number, string>`
  - `isSelectionEmpty(sel: ExamSelection | undefined): boolean`
  - `withSavedSelection(answers: Map<string, ExamSelection>, questionId: string, live: ExamSelection | undefined): Map<string, ExamSelection>` — new map; `live` undefined → unchanged copy; empty → entry deleted; else set (arrays/maps copied).
  - `toggleFlag(flags: ReadonlySet<string>, questionId: string): Set<string>`
  - `examCounts(questions: { id: string }[], answers: Map<string, ExamSelection>, flags: ReadonlySet<string>): { total: number; answered: number; unanswered: number; flagged: number }` — answered = non-empty entry; flagged counts only ids in `questions`.
  - `submitConfirmMessage(unanswered: number, flagged: number): string`
  - `toggleStrike(struck: ReadonlyMap<string, ReadonlySet<string>>, questionId: string, optionId: string): Map<string, Set<string>>` — new map; adds/removes the option id; drops the question entry when its set becomes empty; inputs not mutated.
  - `withoutSelectedStrikes(struck: ReadonlyMap<string, ReadonlySet<string>>, questionId: string, selectedIds: readonly string[]): Map<string, Set<string>>` — removes the selected option ids from that question's strikes (drops an emptied entry); returns the same contents when nothing changes.
  - `loadNavigatorMinimized(storage: ProgressStorage | null = defaultStorage()): boolean` / `saveNavigatorMinimized(value: boolean, storage = defaultStorage()): void` (reuse `ProgressStorage`, `defaultStorage` from `sequentialProgress.ts`).

- [x] **Step 1: Write failing tests** in `src/lib/examState.test.ts`:
  - `isSelectionEmpty`: `undefined`, `[]`, `new Map()` → true; `['a']`, `new Map([[1,'x']])` → false.
  - `withSavedSelection`: sets `['b']`; `undefined` leaves `{q1:['a']}` unchanged and returns a different Map instance; `[]` on `{q1:['a']}` removes `q1`; partial `Map([[2,'x']])` is stored; stored value is a copy (mutating the input afterwards doesn't change it).
  - `toggleFlag`: adds then removes; input set not mutated.
  - `toggleStrike`: strike `b` on `q1` → `{q1:{b}}`; strike `c` → `{q1:{b,c}}`; unstrike both → no `q1` key; another question untouched; input map and sets not mutated.
  - `withoutSelectedStrikes`: `{q1:{b,c}}` with selected `['b']` → `{q1:{c}}`; selected `['b','c']` → no `q1` key; selected `['a']` → unchanged; other questions untouched; inputs not mutated.
  - `examCounts`: 3 questions, answers `{q1:['a'], q2:[]}`, flags `{q2, zz}` → `{total:3, answered:1, unanswered:2, flagged:1}`.
  - `submitConfirmMessage(3,2)` → `Submit the exam and see your results? 3 unanswered, 2 flagged.`; `(0,2)` → `… results? 2 flagged.`; `(1,0)` → `… results? 1 unanswered.`; `(0,0)` → `Submit the exam and see your results?`
  - Preference: fake storage round-trips `true`/`false`; key is `quiz-maker:navigator-minimized`; storage whose `getItem`/`setItem` throw → load returns `false`, save doesn't throw; `null` storage → `false`.
- [x] **Step 2: Run** `npx vitest run src/lib/examState.test.ts` → FAIL (module missing).
- [x] **Step 3: Implement** `src/lib/examState.ts` with the signatures above.
- [x] **Step 4: Run** `npx vitest run` → all PASS.
- [x] **Step 5: Commit** (lint first).

### Task 2: F key

**Files:**
- Modify: `src/lib/keyboardShortcuts.ts`, `src/lib/keyboardShortcuts.test.ts`

**Interfaces:**
- Produces: `ShortcutAction` gains `{ type: 'flag' }`; `resolveShortcut` maps `f`/`F` (no modifiers, not while typing) to it.

- [x] **Step 1: Add failing tests**: `f` → `{type:'flag'}`; `F` (key `'F'`, shiftKey false) → flag; `f` with ctrlKey → null; `f` in a text input → null.
- [x] **Step 2: Run** → FAIL. **Step 3: Implement.** **Step 4: Run** `npx vitest run` → PASS (existing callers ignore unknown action types; check `QuestionCard`'s handler only reacts to `option`).
- [x] **Step 5: Commit.**

### Task 3: Exam variant of matching and ordering questions

**Files:**
- Modify: `src/components/MatchingQuestion.tsx`, `src/components/OrderingQuestion.tsx`

**Interfaces:**
- Produces (both components): new optional props `examMode?: boolean` and `onChange?: (answers: Map<number, string>) => void`.
  - `examMode` true: `initialAnswers` pre-fills **editable** answers (never starts submitted); the component never enters its submitted state; no own submit/"Check Answer" button, no per-step/scenario marks, no "Try Again"/reset; progress indicator stays.
  - `onChange` is called with a copy of the answer map after every change (also when a step is cleared), in any mode.
  - `examMode` false/omitted: behaviour unchanged.

- [x] **Step 1: Implement** both components.
- [x] **Step 2: Verify** `npx tsc -b`, `npx vitest run`, lint → clean. (UI checked in Task 7.)
- [x] **Step 3: Commit.**

### Task 4: QuestionCard and AnswerOption in Exam Mode

**Files:**
- Modify: `src/components/QuestionCard.tsx`

**Interfaces:**
- Consumes: Task 1 `ExamSelection`; Task 3 props.
- Produces: `onSelectionChange?: (selection: ExamSelection) => void` now reports for **all** question types in Exam Mode (standard: on every change incl. initial mount, as today; matching/ordering: from their `onChange`, initial value = restored map or empty map). In Exam Mode the card's button only calls `onNext` (App saves; `handleExamNext` no longer calls `onAnswerSubmit`).

**Files (also):**
- Modify: `src/components/AnswerOption.tsx`

**Interfaces (also):**
- `AnswerOption` gains optional `struck?: boolean` and `onToggleStrike?: (optionId: string) => void`. When `onToggleStrike` is given, a small button at the row's right end (`aria-label="Strike out option {label}"` / `"Undo strike-out of option {label}"`, `aria-pressed={struck}`) toggles it; its click and Enter/Space must not select the option (stop propagation). `struck` shows the option text with `line-through` and reduced opacity. While the option is selected the strike button is disabled (a selected option is never shown struck).
- `QuestionCard` gains optional `struckOptionIds?: ReadonlySet<string>` and `onToggleStrike?: (optionId: string) => void`, passed to `AnswerOption` only in Exam Mode for standard questions.

- [x] **Step 0: Strike-out**: implement the `AnswerOption` and `QuestionCard` props above.
- [x] **Step 1: Matching/ordering in Exam Mode**: pass `examMode`, `onChange`, and `initialAnswers = previousSelection` when it is a `Map` (locked selection keeps priority in Sequential). Render the same exam button as standard questions (`📝 Submit Exam` on the last question, else `Next Question →`) calling `onNext`.
- [x] **Step 2: Standard questions**: `handleExamNext` → just `onNext()`.
- [x] **Step 3: Verify** tsc, tests, lint → clean. **Step 4: Commit.**

### Task 5: Mode-agnostic QuestionNavigator

**Files:**
- Modify: `src/components/QuestionNavigator.tsx`

**Interfaces:**
- Produces:
  ```ts
  type SquareTone = 'unanswered' | 'answered' | 'correct' | 'wrong';
  interface NavigatorSquare { tone: SquareTone; flagged?: boolean; label: string } // label = aria-label
  interface QuestionNavigatorProps {
    questions: Question[];
    currentIndex: number;
    getSquare: (question: Question, index: number) => NavigatorSquare;
    summary: string;
    actions: React.ReactNode;          // buttons under the grid
    onJump: (index: number) => void;
    minimized?: boolean;               // large screens only; omit = not minimisable
    onToggleMinimized?: () => void;
  }
  ```
  - `unanswered`/`correct`/`wrong` keep today's classes; `answered` uses a neutral solid style from existing tokens (not correct/incorrect/selected), readable in both themes.
  - `flagged` adds a small ⚑ mark in the square's top-right corner.
  - When `onToggleMinimized` is given: a `–` button (`aria-label="Minimize question grid"`) in the header on large screens; when `minimized`, large screens show only a slim `Questions ▸` button (`aria-label="Show question grid"`, `aria-expanded=false`) that calls `onToggleMinimized`. Small screens keep the existing `Questions ▾` toggle and ignore `minimized`.
  - Keep the sticky/fit-height and keep-current-square-visible effects working (re-run the fit when un-minimising).

- [x] **Step 1: Rework the component** to the props above.
- [x] **Step 2: Update the Sequential call site** in `src/App.tsx`: `getSquare` from `squareStatus` with label `Question {n}, {status}`; `summary` = today's `{answered} / {total} answered · {correct} ✓ · {wrong} ✗`; `actions` = today's `View results` (only when all answered) and `Reset progress` buttons with today's classes. No minimise props.
- [x] **Step 3: Verify** tsc, tests, lint → clean; `git diff` shows Sequential classes/texts unchanged. **Step 4: Commit.**

### Task 6: Exam wiring in App

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: Tasks 1, 2, 4, 5.

- [x] **Step 1: State**: `flaggedIds: Set<string>`; `navigatorMinimized` initialised from `loadNavigatorMinimized()`; live selection ref widened to `ExamSelection | undefined` (fed by the card's `onSelectionChange`). Restart / leaving clears flags and the live ref.
- [x] **Step 2: One "save, then go" path** for Exam Mode: `saveLive(): Map<string, ExamSelection>` (merges via `withSavedSelection`, sets state, returns the merged map) and `goTo(index)`. Use it for header Previous/Next, A/D, grid squares and the card's Next. Training/Sequential keep their current handlers.
- [x] **Step 3: Submit**: `requestSubmit()` = `saveLive()` → `examCounts` on the returned map → `window.confirm(submitConfirmMessage(...))` → OK: `handleExamSubmit(map)` (takes the map as a parameter, no stale state); Cancel: nothing. The card's Next on the last question and the grid's `Submit exam` call it. D on the last question still does nothing.
- [x] **Step 3b: Strike-out**: `struckOptions: Map<string, Set<string>>` state, updated with `toggleStrike`; whenever the current standard question's live selection changes, apply `withoutSelectedStrikes` so a newly selected option loses its strike; pass `struckOptionIds={struckOptions.get(currentQuestion.id)}` and `onToggleStrike` to the card in Exam Mode only; cleared on submit, restart and leaving.
- [x] **Step 4: Flag**: header toggle left of Previous/Next in Exam Mode only (`HEADER_NAV_BUTTON_CLASSES` + pressed look; `aria-pressed`; text `Flag` / `Flagged` on `sm+`, ⚑ only on phones); F key in the shortcut handler (Exam Mode only).
- [x] **Step 5: Grid**: render `QuestionNavigator` in Exam Mode in the same aside as Sequential (layout wrapper applies to both modes); `getSquare` = answered (stored entry or, for the current question, non-empty live selection) / unanswered + flagged, labels per Global Constraints; `summary` per Global Constraints; `actions` = `Submit exam` button; minimise props wired to state + `saveNavigatorMinimized`. Aside width `lg:w-64` when open, narrow when minimised.
- [x] **Step 6: Verify** `npx tsc -b`, `npx vitest run`, lint, `npm run build` → clean. **Step 7: Commit.**

### Task 7: Manual check in the browser

- [ ] **Step 1:** `npm run dev` in the worktree (only public topic `aws-basics` exists there: 3 standard + 1 ordering; copy nothing private into git). In light and dark theme check:
  - Exam: flag/unflag via button and F; squares answered/flagged correct; leaving by header Previous/Next, A/D, grid square keeps picks; untick all → unanswered; ordering question: partial answer kept when leaving, restored editable on return, no marks; last question submit → confirm text with counts; Cancel stays, no marks; OK shows results with the picks scored.
  - Strike-out: strike/undo an option without selecting it; selecting a struck option unstrikes it; strike button disabled on a selected option; strike visible after jumping away and back; gone after submit and in a new exam; scoring unaffected; not offered in Training/Sequential or on the ordering question.
  - Minimise / restore on a wide window; reload the page and start an exam → state remembered; narrow window → `Questions ▾` toggle works.
  - Sequential: grid, colours, counts, View results, Reset progress, aria labels unchanged. Training unchanged.
- [ ] **Step 2:** Report any finding; fix in the owning task's files, re-run Task 6 Step 6, commit.
