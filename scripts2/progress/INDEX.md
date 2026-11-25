# Progress index — WCAG Encyclopedia

Graph: `scripts2/prd.json` · Repo: https://github.com/twistedtree83/wcag-encyclopedia · Branch: `main`

One line per task. Flip `[ ]` to `[x]` when the task ships, and write its ledger to
`scripts2/progress/<ID>.md`. Ordered by importance; dependencies in parentheses.

- [x] **T-02** #2 — Walking skeleton: build, token palettes, one criterion card, contrast audit, CI (no deps)
- [x] **T-03** #3 — App shell: header, rail, scroll-spy, principle opener, guideline section, deep links (needs T-02)
- [x] **T-07** #7 — Markup-diff card variant, proven on 1.4.11 (needs T-02)
- [x] **T-09** #9 — Demo timeline runtime, player, and the reflow demo (1.4.10) (needs T-02)
- [x] **T-04** #4 — Theme: OS default, explicit override, persistence (needs T-02)
- [x] **T-05** #5 — Filter and search: level filter, text search, result count (needs T-03)
- [x] **T-06** #6 — Responsive shell: container queries, 320px, mobile drawer, viewport preview (needs T-03)
- [x] **T-08** #8 — Computed contrast badges on examples (needs T-02)
- [x] **T-13** #13 — Content: guideline 1.1 Text Alternatives (1 criterion) (needs T-03, T-07)
- [x] **T-14** #14 — Content: guideline 1.2 Time-based Media (5 criteria) (needs T-03, T-07)
- [x] **T-15** #15 — Content: guideline 1.3 Adaptable (5 criteria) (needs T-03, T-07)
- [x] **T-16** #16 — Content: guideline 1.4 Distinguishable (6 criteria) (needs T-03, T-07)
- [x] **T-17** #17 — Content: guideline 2.1 Keyboard Accessible (3 criteria) (needs T-03, T-07)
- [x] **T-18** #18 — Content: guideline 2.2 Enough Time (2 criteria) (needs T-03, T-07)
- [x] **T-19** #19 — Content: guideline 2.3 Seizures and Physical Reactions (1 criterion) (needs T-03, T-07)
- [x] **T-20** #20 — Content: guideline 2.4 Navigable (8 criteria) (needs T-03, T-07)
- [x] **T-21** #21 — Content: guideline 2.5 Input Modalities (6 criteria) (needs T-03, T-07)
- [x] **T-22** #22 — Content: guideline 3.1 Readable (2 criteria) (needs T-03, T-07)
- [x] **T-23** #23 — Content: guideline 3.2 Predictable (5 criteria) (needs T-03, T-07)
- [x] **T-24** #24 — Content: guideline 3.3 Input Assistance (6 criteria) (needs T-03, T-07)
- [x] **T-25** #25 — Content: guideline 4.1 Compatible (2 criteria) (needs T-03, T-07)
- [x] **T-10** #10 — Demo library index section (needs T-09)
- [x] **T-11** #11 — Demos: focus and keyboard (2.4.7 x2, 2.4.11) (needs T-09, T-20)
- [x] **T-12** #12 — Demos: announcements, errors, targets, motion (4.1.2, 3.3.1, 4.1.3, 2.5.8, 2.2.2) (needs T-09, T-18, T-21, T-24, T-25)

**24 tasks · 24 shipped · all `afk:true` · no human gates**

---

# Progress index — Swatch redesign

Graph: `scripts2/prd-redesign.json` · Parent: #27 · Branch: `redesign`

- [x] **R-01** #28 — Redesign walking skeleton: Swatch tokens, page shell and one pre-rendered criterion page (no deps)
- [x] **R-02** #29 — Criterion records gain `since` and `lab?` (needs R-01)
- [x] **R-03** #30 — All 55 criterion pages with the full anatomy (needs R-02)
- [x] **R-04** #31 — Filter engine: principle, level, new in 2.2, and wider search (needs R-02)
- [x] **R-06** #33 — Colour check lab and the Colour check page (needs R-03)
- [x] **R-07** #34 — Fade-the-text lab on 1.4.3 (needs R-03)
- [x] **R-09** #36 — About page with the accessibility statement (needs R-01)
- [x] **R-05** #32 — All criteria page (needs R-03, R-04)
- [x] **R-08** #35 — Home page (needs R-05, R-06, R-07)
- [x] **R-10** #37 — Delete the retired single-page modules (needs R-08)
- [ ] **R-11** #38 — Cutover: owner's visual sign-off, then merge the redesign and deploy (needs R-10)

## Labs

Graph: `scripts2/prd-labs.json` · Parent: #40 · Integration branch: `labs`

- [x] **L-01** #41 — Lab shell, verdict and motion tokens (no deps)
- [x] **L-02** #42 — Announcement log and the 4.1.2 flagship lab (L-01)
- [x] **L-03** #43 — Live examples and simulated input, piloted on 4.1.2 (L-02)
- [x] **L-04** #44 — Focus tracker and 2.4.7: flagship lab and live examples (L-03)
- [x] **L-09** #49 — Sequence, input purpose and label in name: 1.3.2, 1.3.5 and 2.5.3 (L-03)
- [x] **L-08** #48 — Semantics flagships: 1.1.1 and 1.3.1 (L-03)
- [x] **L-06** #46 — Focus order and bypass: 2.4.1, 2.4.3 (flagship) and 2.4.11 (L-04)
