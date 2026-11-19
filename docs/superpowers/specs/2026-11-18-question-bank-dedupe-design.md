# Question bank duplicates — design

**Size:** small change (short design). Status: **approved by the owner, 2026-11-18**.

## Intent

The owner noticed questions in a private question bank that repeat. A check of the whole set by meaning
found no exact copies, but several pairs that ask the same thing with the same correct answer in a
different scenario. The owner wants one of each pair removed so studying the set does not repeat
itself.

## Goals / non-goals

- Remove one question of each duplicate pair.
- Non-goals: rewriting questions, renumbering ids, touching related questions that test a
  different point.
- Anti-goal: losing the original set (the private folder is not in git) or changing any kept question.

## Approaches

1. **Remove one of each pair** (chosen by owner). Keep the more concrete or broader question.
2. Rewrite one of each pair to test a different angle: keeps the count, but adds new unverified content.
3. Only list the pairs, no file change.

## Design

- The pair list and the keep/remove choice per pair are kept with the private data, not in git.
- Back up the current file inside a subfolder of `src/data/private/` first, so `questionService`'s
  top-level glob does not load it.
- Remaining questions keep their content and ids (saved progress is keyed by question id).
- `topics.json`: update the `<topic>` `questionCount` to the new total.

## Constraints

- Owner approved editing `src/data/private` directly (gitignored), no worktree.
- Committed docs carry no question ids or content.
