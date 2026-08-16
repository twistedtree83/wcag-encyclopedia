# TUI_PROMPT — autonomous in-session runner

Master prompt for `/ralph-runner`. Everything about **how a single task ships** lives in
`RALPH_PROMPT.md` — read it in full and follow its ten steps. This file states only the deltas
for running in an interactive session rather than headless.

---

## Deltas from the headless loop

**You do the work yourself, in this session.** Never shell out to `claude`, `ralph.sh`, or
`ralphonce.sh`. That is what keeps the run on the subscription rather than billing as scripted.

**No driver pre-fetches context.** Resolve it once, up front, yourself:
- Read the target `prd*.json` and `scripts2/progress/INDEX.md`.
- Run `gh issue list --repo <repoUrl> --state open`.
- Do the RALPH_PROMPT Step 2 cross-check before the first task, not once per task. Re-run it
  only if you ingest a task or an issue closes unexpectedly.

**The user is AFK.** Once started, ship eligible tasks back-to-back with **no check-ins
between tasks**. Do not ask "shall I continue?". Do not summarize between tasks beyond the
one-line announce. The only reasons to stop are the stop conditions in `RALPH_PROMPT.md`.

**Re-resolve eligibility every iteration**, off live graph state. A task is eligible when:

```
passes == false  AND  afk == true  AND  every id in depends has passes == true
```

Never work a list resolved once at the start — shipping a task unblocks others, and that is the
whole point of re-resolving.

**Pick by `importance`, ascending**, breaking ties by fewest remaining dependents. Lower number
= more important.

**Sequential, not parallel.** A later task frequently builds on conventions the previous one
established, and those conventions are communicated through the ledger. Only fan out to
subagents if the user explicitly asks *and* the tasks share no files.

---

## Terminus

The healthy end state is **"the AFK frontier is empty"** — every remaining task is either
`passes:true`, `afk:false`, or dependency-blocked. It is not a fixed batch size.

When you reach it (or hit the optional `count` cap), summarize:
- Task IDs and commit shas shipped, in order.
- What is now unblocked that was not before.
- What remains, and why each remaining task was not worked.
- A `WAITING:` line for **every** human-gated task still open, each naming the exact action
  needed.

---

## This project's specifics

- **Graph:** `scripts2/prd.json` · **Repo:** `https://github.com/twistedtree83/wcag-encyclopedia`
- **Branch:** `main` — the repo is fresh and unprotected; there is no sprint branch.
- **Every task is `afk:true`.** The user explicitly declined HITL gates when the backlog was
  cut. There are no `ship-gate` tasks, so the only stop conditions available are a red verify
  gate, an ungraphed issue, or a genuine fork the bibles do not resolve.
- **T-02 is the bootstrap.** It creates `package.json` and the verify gate itself; see the
  bootstrap exception in `RALPH_PROMPT.md`. Nothing else is eligible until it ships, so the
  first iteration is forced.
- **T-09 carries the project's real risk.** It is the demo timeline runtime, and eight later
  tasks author content against its interface. Its acceptance criteria pin that interface
  deliberately: `frameAt` must be pure, and rendering a frame must be the only path to the
  screen. Do not treat those criteria as stylistic. If you find yourself wanting to add an
  imperative playback path, that is the signal to park, not to proceed.
- **The corpus is closed at 55 criteria** — 20 Perceivable, 20 Operable, 13 Understandable,
  2 Robust. WCAG 2.2 removed 4.1.1 Parsing; its absence is correct. A data-integrity test
  asserts the exact set, so a miscount fails the gate rather than passing silently.
