# CPSA-F German Question Set Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a German CPSA-F topic whose 64 questions are a faithful translation of `cpsaf.json`, using official iSAQB German terminology.

**Architecture:** Pure data change. A new question file `src/data/private/cpsaf-de.json` mirrors `cpsaf.json` structurally; only text fields are translated. A new entry in `src/data/private/topics.json` exposes it. A structural check script guards against translation drift.

**Tech Stack:** JSON data, Python 3 (stdlib only) for the check script.

**Spec:** `docs/superpowers/specs/2026-11-16-cpsaf-german-translation-design.md`

## Global Constraints

- Work directly in `src/data/private/` (gitignored); no worktree, no branch. Owner decision 2026-11-16.
- No app code changes; English `cpsaf.json` must stay byte-identical.
- Translated fields only: `text`, `options[].text`, `scenarios[].text`, `explanation`, `matchingOptions[]`, `scenarios[].correctAnswer` (mapped via the table below). Everything else copied unchanged.
- Translation by one translator in-session with the glossary below (no parallel translators).
- Instruction hints: `(Choose two.)` → `(Wählen Sie zwei.)`, `(Choose three.)` → `(Wählen Sie drei.)`, `(Choose four.)` → `(Wählen Sie vier.)`, `(Assign all answers.)` → `(Ordnen Sie alle Antworten zu.)`. `HOTSPOT -` prefix kept.
- A term whose official iSAQB German form is uncertain: translate best-effort and record the question id + term in the ⚠️ list (Task 6); never guess silently.

**Matching option mapping (fixed):**

| English | German |
|---|---|
| True / False | Richtig / Falsch |
| Conflict / No conflict | Konflikt / Kein Konflikt |
| Appropriate / Not appropriate | Angemessen / Nicht angemessen |
| Practicable / Not practicable | Praktikabel / Nicht praktikabel |
| Domain-related / Technical | Fachlich / Technisch |
| Typical / Not typical | Typisch / Nicht typisch |
| Tight coupling / Loose coupling | Enge Kopplung / Lose Kopplung |
| Blackbox / Whitebox | Blackbox / Whitebox |

**Core glossary (extend in Task 6 as terms appear):** building block → Baustein; interface → Schnittstelle; quality attribute/characteristic → Qualitätsmerkmal; quality requirement → Qualitätsanforderung; quality scenario → Qualitätsszenario; crosscutting concept → Querschnittskonzept; view → Sicht; context view → Kontextabgrenzung; building block view → Bausteinsicht; runtime view → Laufzeitsicht; deployment view → Verteilungssicht; stakeholder → Stakeholder; constraint → Randbedingung; architecture decision → Architekturentscheidung; coupling/cohesion → Kopplung/Kohäsion; information hiding → Geheimnisprinzip; separation of concerns → Trennung der Verantwortlichkeiten; risk → Risiko; technical debt → technische Schulden.

## Review Focus

- `correctAnswer` of a matching scenario not in that question's translated `matchingOptions` → quiz would mark every answer wrong; check script must fail.
- Option ids/order or `correctAnswers` drifting during translation → wrong answers scored as right; check script compares against English.
- Explanation still references option letters (A, B, …) → letters must stay identical since option order is unchanged; spot-check in Task 6.
- Untranslated English text left behind → check script flags fields identical to English (except allowed: `Blackbox`, `Whitebox`, `HOTSPOT` prefix, proper names).
- Invalid JSON (unescaped German quotes „…") → check script must parse the file.

---

### Task 1: Structural check script

- [x] **Step 0:** Record `shasum src/data/private/cpsaf.json`.

**Files:**
- Create: `src/data/private/check_cpsaf_de.py`

**Interfaces:**
- Produces: `python3 -I src/data/private/check_cpsaf_de.py [--partial]` — exits 0 and prints `OK <n> questions` when valid; exits 1 listing each problem. `--partial` allows the German file to hold a prefix of the English questions (used while batches are in progress).

- [x] **Step 1: Write the script** checking, per question (matched by position and `id`): same keys, `id`, `questionType`, `isMultipleChoice`, `correctAnswers`; same option `id`/`label` sequence; same scenario `id` sequence; matching options mapped exactly per the table; each scenario `correctAnswer` equals the mapping of the English one; no translated text field equal to its English source (allowlist: `Blackbox`, `Whitebox`); without `--partial`, count equals 64.
- [x] **Step 2: Run against a missing/empty file** — Expected: exit 1 with a clear message.

### Task 2–5: Translate questions in four batches

Batches: Task 2 = ids 1–16, Task 3 = 17–32, Task 4 = 33–48, Task 5 = 49–64. Each batch appends to `src/data/private/cpsaf-de.json` (a JSON array, 2-space indent, `ensure_ascii=False`).

**Files:**
- Create/Modify: `src/data/private/cpsaf-de.json`

- [x] **Task 2: Translate ids 1–16**, then run `python3 -I check_cpsaf_de.py --partial` → `OK 16 questions`
- [x] **Task 3: Translate ids 17–32**, then run check `--partial` → `OK 32 questions`
- [x] **Task 4: Translate ids 33–48**, then run check `--partial` → `OK 48 questions`
- [x] **Task 5: Translate ids 49–64**, then run check (no flag) → `OK 64 questions`

### Task 6: Terminology pass and ⚠️ list

- [x] **Step 1:** Grep `cpsaf-de.json` for each glossary English term's German alternatives (e.g. `Komponente` vs `Baustein`, `Interface`, `Qualitätsattribut`, `Querschnittsthema`) and unify to the glossary form.
- [x] **Step 2:** Re-run check (no flag) → `OK 64 questions`.
- [x] **Step 3:** Record uncertain terms as a ⚠️ list (question id, English term, chosen German) in the final report to the owner.

### Task 7: Register topic

**Files:**
- Modify: `src/data/private/topics.json`

- [x] **Step 1:** Set English `cpsaf` `questionCount` to `64`; append `{"id": "cpsaf-de", "name": "CPSA-F (Deutsch)", "description": "iSAQB Certified Professional for Software Architecture – Foundation Level (deutsch): Grundlagen, Qualitätsmerkmale, Dokumentation und Entwurfsprinzipien.", "fileName": "cpsaf-de.json", "questionCount": 64, "icon": "🏛️"}`.
- [x] **Step 2:** Verify: `python3 -I -c "import json;t=json.load(open('src/data/private/topics.json'));print([(x['id'],x['questionCount']) for x in t])"` → includes `('cpsaf', 64)` and `('cpsaf-de', 64)`.
- [x] **Step 3:** `npm run build` succeeds, and `shasum src/data/private/cpsaf.json` equals the checksum taken before Task 2 (English file untouched).

No commits for data (gitignored). Only this plan is committed.
