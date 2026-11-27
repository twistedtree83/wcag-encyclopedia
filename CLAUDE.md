# WCAG Encyclopedia

- Vocabulary: `CONTEXT.md`. Use its terms exactly.
- How build, routes, tokens, labs and e2e fit, and the gotchas: `docs/CONVENTIONS.md`.
- Lasting decisions: `docs/adr/`.
- Page list: `ROUTES` in `src/site/routes.ts` (the fixed pages plus one per criterion in `src/criteria/manifest.ts`); after a build, `ls dist dist/criteria` shows the same. Lab list: `src/labs/INDEX.md`, generated from the lab folders.
- Labs: one folder each under `src/labs/`, listed in `src/labs/INDEX.md` (ADR 0004).
- Visual source of truth: `design/new-design/DESIGN-GUIDE.md`.
- Ticket workflow: `scripts2/RALPH_PROMPT.md`.
- Gate: `npm run verify`, green before every commit. `E2E_PORT` gives a worktree its own preview port; `E2E_WORKERS` sets Playwright workers (default 6; use 2 when several checkouts run e2e at once).
