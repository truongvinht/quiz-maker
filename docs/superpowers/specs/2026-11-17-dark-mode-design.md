# Light / dark theme switch — design

**Size:** small change (short design). Status: **approved by the owner, 2026-11-17**.

## Intent

The owner studies late at night and wants the quiz in a dark theme. By default the app follows
the operating system's light/dark setting; a switch lets them override it.

## Goals

- Three theme choices: **System** (default), **Light**, **Dark**. The choice persists across reloads.
- In System mode the theme follows the OS setting, including live changes while the app is open.
- Every screen is readable in dark mode: topic list, quiz configuration, question screen
  (standard, ordering, matching), question navigator, result panel, summary, footer.
- Right/wrong/selected answer states stay clearly distinguishable in both themes.

## Non-goals / anti-goals

- No UI localisation, no other theme colors, no per-topic themes.
- Anti-goal: a white flash on load when the saved or system theme is dark.
- Anti-goal: dark mode that loses the green/red answer feedback (rules out a CSS invert filter).

## Approaches

1. **Named color tokens with light + dark values** (chosen by owner). Define the semantic
   colors once as CSS variables with a dark override, convert hard-coded color classes to tokens.
   Fixes today's broken named colors as a side effect, so light mode changes visibly.
2. Add `dark:` variants next to each hard-coded color class. Keeps today's light look
   (including the broken colors), doubles color classes, every new component must remember them.
3. CSS filter invert. Rejected: distorts answer feedback colors.

## Current state (finding)

Tailwind v4 does not read `tailwind.config.js` (no `@config` in CSS) and `src/index.css` defines no
tokens, so ~120 uses of `bg-primary`, `text-muted-foreground`, `border-correct`, `bg-selected-light`,
etc. generate no CSS today (verified in the built CSS on 2026-11-17). Header has no color and selected
answers have no outline. ~60 hard-coded classes (`bg-white`, `text-gray-*`, `bg-green-50`,
`border-red-500`, `bg-orange-500`, gradients `from-gray-50 to-gray-100`, …) are in `App.tsx` and
`components/{AnswerOption,MatchingQuestion,OrderingQuestion,QuestionCard,QuestionNavigator,
QuizConfiguration,QuizSummary,ResultPanel}.tsx`.

## Design

- **Tokens** in `src/index.css`: CSS variables on `:root` (light) and `.dark` (dark), exposed to
  Tailwind via `@theme inline`; class-based dark variant via
  `@custom-variant dark (&:where(.dark, .dark *));`.
  Light values for `primary #1976d2`, `primary-dark #115293`, `correct #4caf50`, `correct-light #e8f5e9`,
  `incorrect #f44336`, `incorrect-light #ffebee`, `selected #2196f3`, `selected-light #e3f2fd`
  come from `tailwind.config.js`. The shadcn tokens the components use (`background`, `foreground`,
  `card(-foreground)`, `muted(-foreground)`, `primary-foreground`, `secondary(-foreground)`,
  `accent(-foreground)`, `destructive(-foreground)`, `border`, `input`, `ring`) get neutral values
  (shadcn "neutral" base). Dark values follow the approved mockup: navy background `#0f172a`,
  cards `#1e293b`, dimmed header `#0d3b75`, softer green/red/blue for answer states.
- **Hard-coded colors** converted to tokens; one-off accents without a token (e.g. the orange
  badge, yellow hint) get a `dark:` variant instead of a new token.
- **Preference**: `'system' | 'light' | 'dark'`, stored in `localStorage` (key `quiz-maker-theme`,
  reads/writes wrapped in try/catch, invalid/missing → `system`). Resolved theme sets/removes the
  `dark` class on `<html>` and `color-scheme`.
- **No flash**: a small inline script in `index.html` applies the class before React renders.
- **Switch**: a round button fixed **top-left** on every screen (rendered once at app root), cycling
  🖥️ System → ☀️ Light → 🌙 Dark, with `aria-label`/`title` naming the current choice. It stays
  visible while scrolling. Owner moved it from bottom-right to top-left (2026-11-17, option A: pinned
  to the window rather than built into the header); headers and the sticky question navigator make
  room so the button covers nothing at rest.
- **Tests** (vitest, existing): preference parsing/persistence and system resolution as pure functions.

## Left to the builder

- Exact dark shades beyond those named above, as long as text contrast is comfortable and answer
  states stay distinct.
- Making sure the corner button doesn't cover header text or the sticky navigator (padding/offsets).
- Whether `tailwind.config.js` is left as is (it is unused); not in scope to remove.

## Constraints

- Implementation in a separate worktree/branch `feat/dark-mode` per CLAUDE.md; lint clean before every commit.
- The owner has an uncommitted change in `src/components/ResultPanel.tsx`; the worktree starts from
  the last commit, so that file may conflict at merge time.
