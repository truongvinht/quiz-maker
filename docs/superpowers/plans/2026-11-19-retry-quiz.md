# Retry Quiz and Weak-Areas Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a private "<Topic> – Retry" topic with the owner's wrongly answered questions and write a local weak-areas summary.

**Architecture:** Data-only change in the gitignored `src/data/private` folder, done directly (owner approved, no worktree). No app code changes.

**Tech Stack:** JSON data, Python 3 for the copy and checks, Vitest, ESLint.

**Spec:** `docs/superpowers/specs/2026-11-19-retry-quiz-design.md`

## Global Constraints

- Retry ids: every current `<topic>` question whose saved answer has `isCorrect: false`, in source order.
- Topic entry: `id` `<topic>-retry`, `name` `<Topic> – Retry`, `icon` `🔁`, `fileName` `<topic>-retry.json`, `questionCount` = number of retry questions.
- `src/data/private/<topic>.json` and existing `topics.json` entries stay unchanged.
- Summary lives in a gitignored subfolder of `src/data/private/`; local only.

## Review Focus

- A copied question differs from its original (re-serialisation) → compare as parsed objects.
- `topics.json` reformatted or other entries altered → compare the other entries as parsed objects before/after.
- Summary misstates the owner's pick or the correct answer → take both from the data (progress selection ids, `correctAnswers`), not from memory.

---

### Task 1: Retry quiz data

**Files:**
- Create: `src/data/private/<topic>-retry.json`
- Modify: `src/data/private/topics.json`

- [x] **Step 1: Write `<topic>-retry.json`** by filtering `<topic>.json` to the retry ids in source order (indent 2, `ensure_ascii=False`).
- [x] **Step 2: Append the topic entry** to `topics.json`, keeping the existing formatting.
- [x] **Step 3: Verify** with a Python check: ids equal the retry list, each question equals its original as parsed objects; existing topic entries unchanged; the new entry matches the constraints.
- [x] **Step 4: Run** `npm test` and `npm run lint -- --max-warnings=0`. Expected: all pass, no findings.

### Task 2: Weak-areas summary

**Files:**
- Create: the summary Markdown file in a private subfolder

- [x] **Step 1: Extract** for each retry question: question text, owner's pick, correct answer(s), explanation.
- [x] **Step 2: Group** by subject and count per group; note the grouping is a judgement (no topic labels in the data).
- [x] **Step 3: Check the timing pattern** of misses against `answeredAt` (session dates, time of day).
- [x] **Step 4: Write the summary**: overview, per subject the idea and a worked example, per question pick / why wrong / correct / why right, timing note, "study these first" list.
- [x] **Step 5: Verify** every retry id appears exactly once in the summary.
