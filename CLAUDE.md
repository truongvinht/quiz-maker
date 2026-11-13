# CLAUDE.md

## Human-in-the-Loop (mandatory)

Do NOT autonomously resolve ambiguity in this project. STOP and ask before proceeding when:

- You cannot find code evidence for a claim in the existing doc
- The template requires a section you have no source material for
- Any decision that changes the security posture (not just wording)

When you stop, present:
1. What you found
2. The specific options with trade-offs
3. Your recommendation + confidence level
4. The exact question needed to proceed

Never fill a gap with an assumption — "I don't know / couldn't verify" is preferred over a guess. Mark unresolved items ⚠️ rather than resolving them silently.

---

## Superpowers workflow (specs, plans, implementation)

- **Specs and plans:** once the owner approves a spec (`docs/superpowers/specs/`) or a plan (`docs/superpowers/plans/`), commit it on the **current branch**. Do not create a new branch for it.
- **Implementation:** never build on the current branch. Start a subagent (superpowers:subagent-driven-development) that works in a separate git worktree (superpowers:using-git-worktrees) on a new branch named from the plan, e.g. `feat/<topic>`. If the subagent starts in a harness-created worktree (branch `worktree-agent-<id>`), it must **rename** that branch (`git branch -m feat/<topic>`) instead of creating a new one with `git checkout -b`, so no orphaned `worktree-agent-*` branch is left behind.
- **Before merging:** update the plan that was just implemented. Tick (`- [x]`) every step that is finished. Leave unresolved steps unticked, carry on with the merge, and list them for the owner.
- **Merging:** do not merge the worktree branch back until the owner asks. Do not delete the worktree before the merge.
- **After merging:** if **every** step of the plan is ticked, add the done mark zupu's board reads (`lib/projects/doneMark.ts`) in a **separate commit** on the branch that was merged into. The plan file ends with one blank line, then `Status: done` as the last line, then a newline. Nothing may come after it. In the same commit, add the same mark to the plan's spec (named in its `**Spec:**` line) if **every** plan that names that spec is fully ticked. If any step is still unticked, do not add the mark to that plan or its spec.
- **Worktree cleanup:** once the merge is completed (including the done-mark commit, if any), remove the worktree that held the merged branch (`git worktree remove <path>`) without asking. Do not use `--force`: if the worktree has uncommitted changes or is locked (e.g. by a running agent), leave it and tell the owner why. After removing the worktree, delete the merged branch with `git branch -d <branch>` (never `-D`); if git refuses because the branch is not fully merged, keep it and tell the owner.

## Git Commits

**Lint before every commit (mandatory).** Before creating any commit, run the linter and check what it reports:

- In this repo: `npm run lint -- --max-warnings=0` (ESLint, configured in `eslint.config.js`). In other repos, use that repo's lint command.
- If the linter reports **any** finding (error or warning) or exits non-zero, **abort the commit**. Do not commit, do not stage around it, and do not bypass it with `--no-verify`, `eslint-disable` comments, or rule changes.
- Report the findings to the owner and fix them before trying the commit again. Lint the code as it will be committed. A clean run on a different state does not count.

Use the **`git-smart-commit` skill** for every commit, in every repo under this workspace — do not assemble a generic `git commit` message ad hoc. It derives the commit type/ticket from the branch name and the actual diff.

**Trailer override.** This rule takes precedence over the skill's "no trailers" rule. End every commit message Claude creates with a `Co-Authored-By` trailer naming the Claude model that made the commit, separated from the body by one blank line:

```
Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Use the current model's name in place of `Claude Opus 5.5`. Add no other trailers (e.g. no `Signed-off-by`). Everything else in the skill still applies.
