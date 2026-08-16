## Parent

#1

## What to build

Five demo timelines authored against the proven runtime. No player changes.

1. **4.1.2 Name, Role, Value** — a screen reader announcing an unlabelled icon button, then a
   labelled one. Announcements render as visible text bubbles; there is no synthesised audio.
2. **3.3.1 Error Identification** — a form submitting with a generic "invalid input" banner,
   then with inline, named, linked errors.
3. **4.1.3 Status Messages** — a live region announcing an asynchronous cart update.
4. **2.5.8 Target Size (Minimum)** — tap targets at 18px and at 24px with a fingertip overlay, so
   the criterion becomes a physical fact rather than a number.
5. **2.2.2 Pause, Stop, Hide** — an autoplaying carousel beside one with a pause control.

The 2.2.2 demo must not itself autoplay in a way that violates 2.2.2 — the failing carousel is
inside a demo the reader controls, which is the point.

## Acceptance criteria

- [ ] Each demo is authored as a timeline; the player is unmodified
- [ ] Each keyframe carries a caption describing what is happening at that moment
- [ ] Screen reader announcements are rendered as visible text, with no audio
- [ ] The fingertip overlay in the 2.5.8 demo is drawn to scale against the targets
- [ ] The 2.2.2 demo does not itself violate 2.2.2 — the reader controls playback
- [ ] Each demo plays, pauses, scrubs, and loops
- [ ] Each demo renders correctly in both themes and at 320px
- [ ] Each demo respects `prefers-reduced-motion`
- [ ] Each demo is linked from its criterion card and from the demo library
- [ ] The axe scan passes in both themes

## Blocked by

- #9 — Demo timeline runtime, player, and the reflow demo (1.4.10)
