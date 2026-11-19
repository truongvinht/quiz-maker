# Question Bank Duplicate Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the duplicate-by-meaning questions from a private question bank.

**Architecture:** Data-only change in the gitignored `src/data/private` folder, done directly (owner approved, no worktree).

**Tech Stack:** JSON data, Python 3 for the edit and checks, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-18-question-bank-dedupe-design.md`

## Global Constraints

- Remove exactly the agreed question ids (list kept with the private data); nothing else changes.
- Backup in a subfolder of `src/data/private/`, so the app does not load it.
- `topics.json` `<topic>` `questionCount` matches the new total.

## Review Focus

- A kept question changed by re-serialisation (key order, unicode escaping) → compare kept questions as parsed objects and keep the file's existing formatting.

---

### Task 1: Remove duplicates

**Files:**
- Create: backup of `src/data/private/<topic>.json` in a private subfolder
- Modify: `src/data/private/<topic>.json`, `src/data/private/topics.json`

- [x] **Step 1: Back up** the current file.
- [x] **Step 2: Remove** the agreed ids, writing with the same indentation and `ensure_ascii=False` as the original.
- [x] **Step 3: Update** `topics.json` `<topic>` `questionCount`.
- [x] **Step 4: Verify** with a script: none of the removed ids present, every remaining question equal to its backup counterpart, ids unique, `questionCount` matches; `npx vitest run` all PASS.
