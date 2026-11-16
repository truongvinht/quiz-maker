# CPSA-F German question set — design

**Size:** small change (short design). Approved by owner 2026-11-16.

## Intent

The owner is taking the iSAQB CPSA-F exam in German. They want the existing
English CPSA-F question bank available as a separate German topic, so they can
practise with the wording the real exam uses. The English topic stays as is.

## Goals

- Faithful German translation of all 64 questions in `src/data/private/cpsaf.json`:
  question text, options, matching statements and explanations.
- Official iSAQB German terminology (Baustein, Schnittstelle, Qualitätsmerkmal,
  Querschnittskonzept, Sicht, …), applied consistently.
- New topic shown alongside the English one.

## Non-goals / anti-goals

- No new questions, no content changes beyond translation.
- No UI localisation; app chrome stays English.
- Anti-goal: loose or inconsistent terminology. A term whose official German form
  can't be confirmed is marked ⚠️ and listed for the owner, not guessed silently.

## Approaches

1. **Translate in-session in batches with one fixed glossary** — chosen. Keeps terms consistent.
2. Parallel subagents per chunk — faster, but each would pick its own terms.
3. Machine-translation tool — doesn't know iSAQB vocabulary.

## Design

- New file `src/data/private/cpsaf-de.json`: same ids, option ids/order, `correctAnswers`,
  `questionType`, `isMultipleChoice` as `cpsaf.json`; only text fields translated.
- Matching options `True`/`False` → `Richtig`/`Falsch`; `correctAnswer` mapped accordingly.
- Instruction hints: "(Choose four.)" → "(Wählen Sie vier.)", "(Assign all answers.)" →
  "(Ordnen Sie alle Antworten zu.)". "HOTSPOT -" prefix kept.
- `topics.json`: add `cpsaf-de`, "CPSA-F (Deutsch)", German description, 🏛️, `questionCount: 64`.
  Also correct the English entry's `questionCount` from 72 to 64 (file has 64 questions).
- Verification script: German file parses and is structurally identical to the English one
  (ids, option ids, answers, types), with only text differing.

## Constraints

- Both data files are gitignored (`src/data/private/*`). Owner decided the work is written
  directly in `src/data/private/`, not in a worktree; only this design doc is committed.
- No app code changes.
