# Retry quiz and weak-areas summary — design

**Size:** small change (short design). Status: **approved by the owner, 2026-11-19**.

## Intent

After a full sequential run of a private question bank, the owner wants to drill only the questions
they got wrong, plus a summary of the subjects they are weak in, so they know what to study. This is
a one-time study aid. A reusable "retry wrong answers" feature built into the app is a separate,
later spec.

## Goals / non-goals

- A new private topic with exactly the wrongly answered questions.
- A weak-areas summary the owner can read locally.
- Non-goals: app code changes, changing `<topic>.json` or the owner's saved progress, rewording
  questions.
- Anti-goals: question content or the owner's results ending up in git or in an external service;
  the retry run mixing with the main run's progress.

## Source data

The owner's saved sequential progress for `<topic>` (localStorage), checked against the owner's
screenshots of the navigator. Progress entries for questions removed by the dedupe are ignored and
left alone. The list of wrong answers stays with the private data, not in git.

## Approaches

1. **One-time study aid** (chosen by owner): a private data file plus a Markdown summary. No code
   change, ready right away.
2. Built-in "retry wrong answers" and weak-areas screen for every topic. Reusable, but a real feature
   (spec, plan, tests, branch). Deferred to its own spec.

## Design

**Retry quiz**
- `src/data/private/<topic>-retry.json`: the wrong questions copied unchanged (all fields and ids), in
  the original order.
- `src/data/private/topics.json`: new entry `<topic>-retry`, name "<Topic> – Retry", icon 🔁,
  `fileName` `<topic>-retry.json`, `questionCount` = number of copied questions. Its own topic id
  gives it its own saved progress.
- Check: the copies equal the originals as parsed objects; `npm test` and lint pass.

**Weak-areas summary**
- A Markdown file in a gitignored subfolder of `src/data/private/` (the app's glob only loads
  top-level `*.json`).
- Mistakes grouped by subject with counts; per subject the underlying idea and a worked example in a
  realistic context; per question the owner's pick and why it fails, the correct answer and why it
  works; a "study these first" list; a check of whether misses follow the session timing or the
  question content.
- The subject grouping is a judgement made by reading the questions (they have no topic labels).
  The file says so. Facts come only from the question bank's explanations; snippets are marked as
  illustrations.

## Constraints

- Owner approved editing `src/data/private` directly (gitignored), no worktree.
- Summary stays on local disk only.
- Committed docs carry no question ids, content or results.
