# RALPH_PROMPT — shared rules for the WCAG Encyclopedia backlog

This is the stable bible. Both the headless Ralph loop and the in-session TUI runner
(`TUI_PROMPT.md`) defer to it. It describes **how one task is shipped**. It does not describe
how tasks are selected — that is the runner's job.

---

## The bibles

Read these before your first task, and re-read the relevant part whenever a task touches it:

1. **`CONTEXT.md`** — the domain model and vocabulary. Use its terms exactly. If you need a
   noun the project does not yet have a word for, that is a signal to stop and ask, not to
   invent one silently.
2. **The PRD, GitHub issue #1** — problem statement, user stories, implementation decisions,
   testing decisions, out-of-scope. It is the authority on *what* and *why*.
3. **The task's own GitHub issue** — the acceptance criteria there are the definition of done.
   Read the full body before writing code.
4. **The design file** — `design/WCAG Encyclopedia.dc.html`, imported from Claude Design. It is
   the **visual source of truth**: token palettes, type scale, card anatomy, and one composed
   instance of each card variant. When the design and your instinct disagree, the design wins.

---

## Hard rules

- **One vertical slice per task.** A task ships whole or does not start. Never leave a task
  half-written across a session boundary.
- **Never commit a red gate.** `npm run verify` must pass before every commit, no exceptions,
  no `--no-verify`, no skipped tests, no `.skip`, no commented-out assertions.
- **Never weaken a test to make it pass.** If a test is wrong, fix the test deliberately and say
  so in the ledger. If the code is wrong, fix the code. Deleting an assertion to get green is
  the one thing that makes this whole harness worthless.
- **One ledger per task, one commit per task.** Do not batch commits across tasks.
- **Do not edit another task's scope.** If you find work that belongs to a different issue, note
  it in your ledger and leave it. Do not opportunistically fix it.
- **Do not close or modify issue #1** (the PRD).
- **The page obeys the criteria it documents.** This is the project's central promise. If a
  change you are about to make would fail a WCAG criterion the site documents, choose
  differently. This outranks visual fidelity to the design.
- **Restate, never reproduce.** WCAG normative text is not to be copied into the corpus. Every
  `plain` restatement and every example must be original prose.

---

## The verify gate

`npm run verify` is the single gate. It runs, in order:

1. `tsc --noEmit` — types
2. `vitest run` — unit tests
3. `vite build` — the production build
4. `playwright test` — the axe-core accessibility scan against the built page

**Bootstrap exception, T-02 only.** The repository starts empty; `package.json` does not exist
yet. T-02's slice *creates* the verify gate. For T-02 alone, "green" means: after your changes,
`npm run verify` exists, runs all four stages, and passes. Every task after T-02 inherits a
working gate and has no exception.

If `npm run verify` fails and you cannot fix it inside the current slice, **stop**. Do not
commit. Do not partially revert into a working-but-wrong state. Report the failure with its
output and park.

---

## Per-task workflow — the ten steps

### 1. Announce
State the task ID, its issue number, and its title. One line. Then begin.

### 2. Cross-check the graph against GitHub
Run `gh issue list --repo <repoUrl> --state open`. Every open issue except #1 must correspond to
a task in the graph. If an open issue has no task:
- If it is unambiguously a new unit of work, ingest it into the graph as a new task with
  `passes:false`, and continue.
- If it is ambiguous, **stop** and surface it for triage.

If a task in the graph is marked `passes:false` but its issue is already closed, trust the
issue: reconcile the graph and move on.

### 3. Read the code before writing any
Read the files this task will touch, and the ledgers of the tasks it depends on
(`scripts2/progress/<ID>.md`). The dependency ledgers tell you what conventions were
established and what the previous task deliberately left for you.

### 4. Read the issue's acceptance criteria in full
They are the checklist you will verify against in step 6. If a criterion is ambiguous, resolve
it from the PRD or `CONTEXT.md`. If neither resolves it, park (step 10).

### 5. Implement one vertical slice, test-first
Follow the `/tdd` loop — red, green, refactor. The slice cuts through every layer the task
touches; it is not a horizontal layer of one concern. Write the test that expresses the
acceptance criterion, watch it fail for the right reason, make it pass, then clean up.

### 6. Run the verify gate
`npm run verify`. Green or stop. Then walk the issue's acceptance criteria one by one and
confirm each is actually satisfied — the gate proves the code works, not that you built the
right thing.

### 7. Commit
On the graph's `branchName`. Message format:

```
<ID>: <short imperative summary>

<what changed and why, in prose>

Closes #<issue>

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

### 8. Close the GitHub issue
`gh issue close <n> --repo <repoUrl> --comment "<one-line summary + commit sha>"`.
The `Closes #n` trailer will often do this on push; closing explicitly is idempotent and keeps
the graph honest even before the push lands.

### 9. Update the graph and write the ledger
- Set the task's `passes` to `true` in the target `prd*.json`.
- Write `scripts2/progress/<ID>.md` using the template below.
- Flip the task's line in `scripts2/progress/INDEX.md` from `[ ]` to `[x]`.

### 10. Push, or park
The gate is green and the work is committed, so pushing is safe: `git push -u origin <branchName>`.

**Park instead of pushing only if** you hit a stop condition. To park: leave the tree clean,
write what you know into the ledger, and surface a line of the form:

```
WAITING: <task-id> — <the exact action a human needs to take>
```

---

## Ledger template — `scripts2/progress/<ID>.md`

```markdown
# <ID> — <title>

**Issue:** #<n>  **Commit:** <sha>  **Status:** shipped | parked

## What shipped
Two or three sentences on the behaviour that now exists.

## Decisions made
Anything a later task needs to know: conventions established, names chosen, a fork resolved
and why. Be specific — this is the only thing later tasks read.

## Deliberately left
Work that is in scope for another task, or that you chose not to do. Say which task owns it.

## Gate
Output summary of `npm run verify` — what ran, what passed.
```

---

## Parking — when to stop rather than push

- The task is `afk:false` or carries a `ship-gate`.
- `npm run verify` fails and the fix is outside this slice.
- An open issue is not in the graph and cannot be unambiguously ingested.
- The bibles are silent on a genuine fork and guessing would be expensive to unwind.
- A change needed to satisfy the task would violate a hard rule above.

In every case: clean tree, ledger written, `WAITING:` line surfaced. Never park mid-write.
